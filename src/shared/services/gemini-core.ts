import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_CHAT_CONFIG, GEMINI_LOGIC_CONFIG, IMAGEN_MODEL } from '../../config/constants';
import { prisma } from '../../database/prisma';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Helper to retry API calls with exponential backoff
export async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('503') || error.response?.status === 503 || error.status === 503)) {
      console.warn(`[GeminiCore] API 503 Overloaded. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

class GeminiCoreService {
  constructor() {}

  // --- API Key Resolution ---
  public async getApiKey(guildId?: string | null): Promise<string> {
      let apiKey = process.env.GEMINI_API_KEY || '';
      try {
          if (guildId && guildId !== 'global') {
              const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
              if (guildConfig && guildConfig.geminiApiKey) {
                  return guildConfig.geminiApiKey;
              }
          }
          const globalConfig = await prisma.botConfig.findUnique({ where: { key: 'global' } });
          if (globalConfig && globalConfig.geminiApiKey) {
              return globalConfig.geminiApiKey;
          }
      } catch (e) {
          console.error("Error fetching dynamic API Key, falling back to ENV", e);
      }
      return apiKey;
  }

  // --- Model Factory ---
  public async getModel(guildId?: string | null, type: 'chat' | 'image' | 'logic' | 'search' = 'chat', customConfig?: any, customApiKey?: string): Promise<GenerativeModel> {
      const apiKey = customApiKey || await this.getApiKey(guildId);
      const genAI = new GoogleGenerativeAI(apiKey);
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];

      if (type === 'image') {
          return genAI.getGenerativeModel({ model: IMAGEN_MODEL, generationConfig: GEMINI_CHAT_CONFIG.generationConfig, safetySettings });
      } else if (type === 'logic') {
          return genAI.getGenerativeModel({ model: GEMINI_LOGIC_CONFIG.modelName, generationConfig: customConfig || GEMINI_LOGIC_CONFIG.generationConfig, safetySettings });
      } else if (type === 'search') {
          return genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, tools: [{ googleSearch: {} } as any], generationConfig: GEMINI_CHAT_CONFIG.generationConfig, safetySettings });
      }
      
      return genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: GEMINI_CHAT_CONFIG.generationConfig, safetySettings });
  }

  // --- Generic Text Generation ---
  public async generateText(prompt: string, guildId?: string, customApiKey?: string): Promise<string> {
      try {
          const model = await this.getModel(guildId, 'chat', undefined, customApiKey);
          const result = await retryWithBackoff(() => model.generateContent(prompt));
          return result.response.text();
      } catch (error: any) {
          console.error("Generate Text Error:", error);
          throw error;
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

  // --- Image Generation (Imagen) ---
  public async generateImage(prompt: string, guildId?: string): Promise<{ success: boolean; imageBuffer?: Buffer; textResponse?: string; error?: string }> {
      try {
          const apiKey = await this.getApiKey(guildId);
          const ai = new GoogleGenAI({ apiKey });

          const response = await retryWithBackoff(() => ai.models.generateImages({
              model: 'imagen-4.0-generate-001',
              prompt: prompt,
              config: {
                  numberOfImages: 1,
                  aspectRatio: "1:1"
              }
          }));

          if (!response.generatedImages || response.generatedImages.length === 0) {
              return { success: false, textResponse: "Không tạo được ảnh.", error: "No image returned" };
          }

          const imgBytes = response.generatedImages[0].image?.imageBytes;
          if (!imgBytes) {
              return { success: false, textResponse: "Không tạo được ảnh.", error: "No image bytes returned" };
          }
          const imageBuffer = Buffer.from(imgBytes, "base64");

          return { success: true, imageBuffer, textResponse: "" };
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

  // --- Image Generation (Imagen) with custom API key support ---
  public async generateImageWithKey(prompt: string, customApiKey?: string, guildId?: string, aspectRatio: string = '1:1'): Promise<{ success: boolean; imageBuffer?: Buffer; error?: string }> {
      try {
          const apiKey = customApiKey || await this.getApiKey(guildId);
          const ai = new GoogleGenAI({ apiKey });
          const response = await retryWithBackoff(() => ai.models.generateImages({
              model: IMAGEN_MODEL,
              prompt: prompt,
              config: { numberOfImages: 1, aspectRatio }
          }));

          if (!response.generatedImages || response.generatedImages.length === 0) {
              return { success: false, error: 'No image returned' };
          }
          const imgBytes = response.generatedImages[0].image?.imageBytes;
          if (!imgBytes) {
              return { success: false, error: 'No image bytes returned' };
          }
          return { success: true, imageBuffer: Buffer.from(imgBytes, 'base64') };
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
