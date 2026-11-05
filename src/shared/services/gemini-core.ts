import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_CHAT_CONFIG,
  GEMINI_LOGIC_CONFIG,
  GEMINI_IMAGE_MODEL,
  GEMINI_REQUEST_TIMEOUT_MS,
  WEB_CHAT_GENERATION_CONFIG,
  WEB_CHAT_MODEL_FALLBACKS,
} from '../../config/constants';
import { prisma } from '../../database/prisma';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export function withTimeout<T>(promise: Promise<T>, timeoutMs = GEMINI_REQUEST_TIMEOUT_MS, label = 'Gemini request'): Promise<T> {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const err: any = new Error(`${label} timed out after ${timeoutMs}ms`);
      err.status = 408;
      reject(err);
    }, timeoutMs);
    if (typeof timer.unref === 'function') timer.unref();

    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// Helper to retry API calls with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 1,
  delay = 800,
  timeoutMs = GEMINI_REQUEST_TIMEOUT_MS,
): Promise<T> {
  try {
    return await withTimeout(fn(), timeoutMs);
  } catch (error: any) {
    const msg = String(error?.message || '').toLowerCase();
    const isTransient =
      error?.message?.includes('503') ||
      error?.response?.status === 503 ||
      error?.status === 503 ||
      error?.status === 408 ||
      msg.includes('timed out') ||
      msg.includes('overloaded');
    if (retries > 0 && isTransient) {
      console.warn(`[GeminiCore] API 503 Overloaded. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2, timeoutMs);
    }
    throw error;
  }
}

export interface WebChatHistoryMessage {
  role: 'user' | 'model';
  content: string;
}

interface WebChatFallbackResult {
  text: string;
  model: string;
}

function getErrorStatus(error: any): number | undefined {
  return error?.status ?? error?.response?.status ?? error?.error?.code;
}

function shouldTryNextWebChatModel(error: any): boolean {
  const status = getErrorStatus(error);
  if (status && [400, 403, 404, 408, 429, 500, 502, 503, 504].includes(status)) return true;

  const message = String(error?.message || '').toLowerCase();
  return [
    'resource_exhausted',
    'quota',
    'rate limit',
    'overloaded',
    'unavailable',
    'not found',
    'deadline',
    'timed out',
    'timeout',
    'abort',
    'network',
    'empty response',
    'developer instruction',
    'systeminstruction',
  ].some(fragment => message.includes(fragment));
}

const API_KEY_CACHE_TTL_MS = 2 * 60 * 1000;

class GeminiCoreService {
  private apiKeyCache = new Map<string, { key: string; timestamp: number }>();

  constructor() {}

  public invalidateApiKeyCache(guildId?: string | null) {
      if (guildId) {
          this.apiKeyCache.delete(guildId);
      } else {
          this.apiKeyCache.clear();
      }
  }

  // --- API Key Resolution ---
  public async getApiKey(guildId?: string | null): Promise<string> {
      const cacheKey = guildId && guildId !== 'global' ? guildId : 'global';
      const cached = this.apiKeyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < API_KEY_CACHE_TTL_MS) {
          return cached.key;
      }

      let apiKey = process.env.GEMINI_API_KEY || '';
      try {
          if (guildId && guildId !== 'global') {
              const [guildConfig, globalConfig] = await Promise.all([
                  prisma.guildConfig.findUnique({ where: { guildId } }),
                  prisma.botConfig.findUnique({ where: { key: 'global' } }),
              ]);
              if (guildConfig && guildConfig.geminiApiKey) {
                  this.apiKeyCache.set(cacheKey, { key: guildConfig.geminiApiKey, timestamp: Date.now() });
                  return guildConfig.geminiApiKey;
              }
              if (globalConfig && globalConfig.geminiApiKey) {
                  this.apiKeyCache.set(cacheKey, { key: globalConfig.geminiApiKey, timestamp: Date.now() });
                  return globalConfig.geminiApiKey;
              }
          } else {
              const globalConfig = await prisma.botConfig.findUnique({ where: { key: 'global' } });
              if (globalConfig && globalConfig.geminiApiKey) {
                  this.apiKeyCache.set(cacheKey, { key: globalConfig.geminiApiKey, timestamp: Date.now() });
                  return globalConfig.geminiApiKey;
              }
          }
      } catch (e) {
          console.error("Error fetching dynamic API Key, falling back to ENV", e);
      }
      this.apiKeyCache.set(cacheKey, { key: apiKey, timestamp: Date.now() });
      return apiKey;
  }

  // --- Model Factory ---
  public async getModel(guildId?: string | null, type: 'chat' | 'image' | 'logic' | 'search' = 'chat', customConfig?: any, customApiKey?: string): Promise<GenerativeModel> {
      const apiKey = customApiKey || await this.getApiKey(guildId);
      const genAI = new GoogleGenerativeAI(apiKey);
      const requestOptions = { timeout: GEMINI_REQUEST_TIMEOUT_MS };
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];

      if (type === 'image') {
          return genAI.getGenerativeModel({ model: GEMINI_IMAGE_MODEL, generationConfig: GEMINI_CHAT_CONFIG.generationConfig, safetySettings }, requestOptions);
      } else if (type === 'logic') {
          return genAI.getGenerativeModel({ model: GEMINI_LOGIC_CONFIG.modelName, generationConfig: customConfig || GEMINI_LOGIC_CONFIG.generationConfig, safetySettings }, requestOptions);
      } else if (type === 'search') {
          return genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, tools: [{ googleSearch: {} } as any], generationConfig: GEMINI_CHAT_CONFIG.generationConfig, safetySettings }, requestOptions);
      }
      
      return genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: GEMINI_CHAT_CONFIG.generationConfig, safetySettings }, requestOptions);
  }

  public async generateWebChatWithFallback(params: {
      message: string;
      history: WebChatHistoryMessage[];
      systemInstruction: string;
      guildId?: string | null;
      customApiKey?: string;
      maxOutputTokens?: number;
      temperature?: number;
  }): Promise<WebChatFallbackResult> {
      const apiKey = params.customApiKey || await this.getApiKey(params.guildId);
      if (!apiKey) throw new Error('Missing Gemini API key');

      const ai = new GoogleGenAI({ apiKey });
      const baseContents = [
          ...params.history.map(item => ({
              role: item.role,
              parts: [{ text: item.content }],
          })),
          { role: 'user' as const, parts: [{ text: params.message }] },
      ];

      let lastError: any;
      for (const model of WEB_CHAT_MODEL_FALLBACKS) {
          try {
              const isGemma = model.toLowerCase().startsWith('gemma');
              const contents = isGemma && params.systemInstruction
                  ? [
                        ...params.history.map(item => ({
                            role: item.role,
                            parts: [{ text: item.content }],
                        })),
                        {
                            role: 'user' as const,
                            parts: [{ text: `${params.systemInstruction}\n\n---\nTin nhắn người dùng:\n${params.message}` }],
                        },
                    ]
                  : baseContents;

              const response = await retryWithBackoff(() => ai.models.generateContent({
                  model,
                  contents,
                  config: {
                      ...(isGemma || !params.systemInstruction ? {} : { systemInstruction: params.systemInstruction }),
                      ...WEB_CHAT_GENERATION_CONFIG,
                      ...(params.maxOutputTokens ? { maxOutputTokens: params.maxOutputTokens } : {}),
                      ...(typeof params.temperature === 'number' ? { temperature: params.temperature } : {}),
                      httpOptions: { timeout: 18_000 },
                  },
              }), 0, 500, 18_000);

              const text = response.text?.trim();
              if (!text) throw new Error('Model returned an empty response');

              console.info(`[WebChat] Response generated by ${model}`);
              return { text, model };
          } catch (error: any) {
              lastError = error;
              const status = getErrorStatus(error);
              console.warn(`[WebChat] ${model} failed${status ? ` (${status})` : ''}: ${error?.message || 'Unknown error'}`);
              if (!shouldTryNextWebChatModel(error)) throw error;
          }
      }

      const error = new Error('All configured web chat models failed');
      (error as any).cause = lastError;
      throw error;
  }

  // --- Generic Text Generation ---
  public async generateText(prompt: string, guildId?: string, customApiKey?: string): Promise<string> {
      try {
          const fallback = await this.generateWebChatWithFallback({
              message: prompt,
              history: [],
              systemInstruction: '',
              guildId,
              customApiKey,
              maxOutputTokens: GEMINI_CHAT_CONFIG.generationConfig.maxOutputTokens,
              temperature: GEMINI_CHAT_CONFIG.generationConfig.temperature,
          });
          return fallback.text;
      } catch {
          try {
              const model = await this.getModel(guildId, 'chat', undefined, customApiKey);
              const result = await retryWithBackoff(() => model.generateContent(prompt));
              return result.response.text();
          } catch (error: any) {
              console.error("Generate Text Error:", error);
              throw error;
          }
      }
  }

  // --- Text Generation with Inline Data (images/files) ---
  public async generateTextWithMedia(prompt: string, mediaParts: Array<{ inlineData: { mimeType: string; data: string } }>, guildId?: string, customApiKey?: string): Promise<string> {
      try {
          const model = await this.getModel(guildId, 'chat', undefined, customApiKey);
          const result = await retryWithBackoff(() => model.generateContent([prompt, ...mediaParts]));
          return result.response.text();
      } catch (error: any) {
          console.error("Generate Text With Media Error:", error);
          throw error;
      }
  }

  // --- Generic JSON Generation ---
  public async generateJSON<T>(prompt: string, schema?: any, guildId?: string, customApiKey?: string): Promise<T> {
      try {
          const config: any = {
              responseMimeType: "application/json",
          };
          if (schema) {
              config.responseSchema = schema;
          }

          const model = await this.getModel(guildId, 'logic', config, customApiKey);

          const result = await retryWithBackoff(() => model.generateContent(prompt));
          const text = result.response.text();
          
          let cleanText = text;
          if (cleanText.startsWith('```json')) {
              cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
          } else if (cleanText.startsWith('```')) {
              cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
          }

          return JSON.parse(cleanText) as T;
      } catch (error: any) {
          console.error("Generate JSON Error:", error);
          throw error;
      }
  }

  // --- Google Search Grounding (uses @google/genai SDK) ---
  public async generateWithSearch(prompt: string, guildId?: string, customApiKey?: string): Promise<{ text: string; sources: any[] }> {
      try {
          const apiKey = customApiKey || await this.getApiKey(guildId);
          const ai = new GoogleGenAI({ apiKey });
          const result = await retryWithBackoff(() => ai.models.generateContent({
              model: GEMINI_CHAT_CONFIG.modelName,
              contents: prompt,
              config: { tools: [{ googleSearch: {} }] }
          }));
          const text = result.text || '';
          const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          return { text, sources };
      } catch (error: any) {
          console.error("Search Grounding Error:", error);
          throw error;
      }
  }

  // --- Image Generation (Gemini Native) ---
  public async generateImage(prompt: string, guildId?: string): Promise<{ success: boolean; imageBuffer?: Buffer; textResponse?: string; error?: string }> {
      try {
          const apiKey = await this.getApiKey(guildId);
          const ai = new GoogleGenAI({ apiKey });

          const response = await retryWithBackoff(() => ai.models.generateContent({
              model: GEMINI_IMAGE_MODEL,
              contents: prompt,
              config: { responseModalities: ['IMAGE'] }
          }));

          const parts = response.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
              if ((part as any).inlineData?.data) {
                  const imageBuffer = Buffer.from((part as any).inlineData.data, 'base64');
                  return { success: true, imageBuffer, textResponse: "" };
              }
          }

          return { success: false, textResponse: "Không tạo được ảnh.", error: "No image in response" };
      } catch (error: any) {
          console.error("Generate Image Error:", error);
          return { success: false, error: error.message };
      }
  }

  // --- Image Generation with Reference Image (uses @google/genai SDK) ---
  public async generateImageWithReference(prompt: string, referenceImage: { mimeType: string; data: string }, model?: string, guildId?: string, customApiKey?: string): Promise<{ success: boolean; imageBuffer?: Buffer; error?: string }> {
      try {
          const apiKey = customApiKey || await this.getApiKey(guildId);
          const ai = new GoogleGenAI({ apiKey });
          const response = await retryWithBackoff(() => ai.models.generateContent({
              model: model || GEMINI_CHAT_CONFIG.modelName,
              contents: [
                  {
                      role: 'user',
                      parts: [
                          { text: prompt },
                          { inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.data } }
                      ]
                  }
              ],
              config: { responseModalities: ['TEXT', 'IMAGE'] }
          }));

          const parts = response.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
              if ((part as any).inlineData) {
                  const imgData = (part as any).inlineData.data;
                  return { success: true, imageBuffer: Buffer.from(imgData, 'base64') };
              }
          }
          return { success: false, error: 'No image in response' };
      } catch (error: any) {
          console.error("Image With Reference Error:", error);
          return { success: false, error: error.message };
      }
  }

  // --- Image Generation (Gemini Native) with custom API key support ---
  public async generateImageWithKey(prompt: string, customApiKey?: string, guildId?: string, aspectRatio: string = '1:1'): Promise<{ success: boolean; imageBuffer?: Buffer; error?: string }> {
      try {
          const apiKey = customApiKey || await this.getApiKey(guildId);
          const ai = new GoogleGenAI({ apiKey });
          const response = await retryWithBackoff(() => ai.models.generateContent({
              model: GEMINI_IMAGE_MODEL,
              contents: prompt,
              config: { responseModalities: ['IMAGE'] }
          }));

          const parts = response.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
              if ((part as any).inlineData?.data) {
                  return { success: true, imageBuffer: Buffer.from((part as any).inlineData.data, 'base64') };
              }
          }
          return { success: false, error: 'No image in response' };
      } catch (error: any) {
          console.error("Generate Image With Key Error:", error);
          return { success: false, error: error.message };
      }
  }

  // --- TTS (Audio Generation) ---
  public async generateAudioWithContext(text: string, voiceName: string = 'Kore', guildId?: string): Promise<{ success: boolean; filePath?: string; text: string; error?: string }> {
     try {
         const apiKey = await this.getApiKey(guildId);
         const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
         
         const payload = {
             contents: [{ parts: [{ text }] }],
             generationConfig: {
                 responseModalities: ['AUDIO'],
                 speechConfig: {
                     voiceConfig: { prebuiltVoiceConfig: { voiceName } }
                 }
             }
         };

         const response = await retryWithBackoff(() => axios.post(url, payload));
         const data = response.data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

         if (!data) throw new Error("No audio data returned");

         const audioBuffer = Buffer.from(data, 'base64');
         const tempDir = path.resolve(__dirname, '../../../temp');
         if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
         
         const fileName = `audio_${Date.now()}.wav`;
         const filePath = path.join(tempDir, fileName);
         fs.writeFileSync(filePath, audioBuffer);

         return { success: true, filePath, text };
     } catch (error: any) {
         console.error("TTS Error:", error?.response?.data || error.message);
         return { success: false, text: "", error: error.message };
     }
  }
}

export const geminiCore = new GeminiCoreService();
