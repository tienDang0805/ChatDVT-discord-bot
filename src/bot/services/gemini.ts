import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';
import { GEMINI_CHAT_CONFIG, GEMINI_LOGIC_CONFIG, IMAGEN_MODEL, DEFAULT_SYSTEM_PROMPT } from '../../config/constants';
import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { cleanContent } from 'discord.js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { LoggerService } from './logger';

// Helper to escape markdown (same as before)
function escapeMarkdown(text: string): string {
    if (text.startsWith('```') && text.endsWith('```')) return text;
    return text.replace(/(^|\s)(\*|_|~|`|>|\||#)(?=\s|$)/g, '$1\\$2');
}

// Helper to retry API calls with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('503') || error.response?.status === 503 || error.status === 503)) {
      console.warn(`[GeminiService] API 503 Overloaded. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

class GeminiService {
  constructor() {}

  private async getApiKey(guildId?: string | null): Promise<string> {
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

  private async getModel(guildId?: string | null, type: 'chat' | 'image' | 'logic' | 'search' = 'chat', customConfig?: any): Promise<GenerativeModel> {
      const apiKey = await this.getApiKey(guildId);
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

  // --- Dynamic System Prompt ---
  public async getSystemPrompt(guildId: string, userId: string, feature: string = 'global'): Promise<string> {
    let finalPromptData: any = null;

    // 1. Check Guild Config
    const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
    if (guildConfig) {
        try {
            const prompts = JSON.parse(guildConfig.systemPrompts) as any;
            if (prompts && prompts[feature]) {
                const featureData = prompts[feature];
                if (typeof featureData === 'string' && featureData.trim() !== "") {
                     finalPromptData = featureData;
                } else if (typeof featureData === 'object' && Object.keys(featureData).length > 0) {
                     finalPromptData = featureData;
                }
            }
        } catch (e) {
            console.error("Error parsing guild prompts", e);
        }
    }

    // 2. Fallback to Global Bot Config
    if (!finalPromptData) {
        let globalConfig = await prisma.botConfig.findUnique({ where: { key: 'global' } });
        if (!globalConfig) {
             // Init if missing
             const defaults = {
                global: process.env.SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
                quiz: "You are a quiz master.",
                catchTheWord: "You are a game host.",
                pet: "You are a pet system AI.",
                pkGame: "You are a battle referee.",
                videoAnalysis: "Analyze this video.",
                imageAnalysis: "Analyze this image."
             };
             globalConfig = await prisma.botConfig.create({
                data: {
                    key: 'global',
                    systemPrompts: JSON.stringify(defaults),
                    features: '{}'
                }
            });
        }
        try {
            const prompts = JSON.parse(globalConfig.systemPrompts) as any;
            finalPromptData = prompts[feature] || prompts.global;
        } catch (e) {
            console.error("Error parsing global prompts", e);
            finalPromptData = "";
        }
    }

    // Recursive Markdown Compiler for Node-based hierarchy
    const compileToMarkdown = (data: any, depth: number = 1): string => {
        if (!data) return '';
        if (typeof data === 'string') return data.trim() !== '' ? `${data}\n` : '';
        
        let md = '';
        const headingPrefix = '#'.repeat(Math.min(depth, 6)); // max ###### heading
        
        if (typeof data === 'object') {
             if (data['__rootText'] && typeof data['__rootText'] === 'string' && data['__rootText'].trim() !== '') {
                 md += `${data['__rootText']}\n`;
             }

             for (const [key, value] of Object.entries(data)) {
                  // Skip system flow metadata attributes if any exist
                  if (key.startsWith('__')) continue; 
                  
                  if (typeof value === 'string' && value.trim() !== "") {
                      md += `\n${headingPrefix} ${key.toUpperCase()}\n${value}\n`;
                  } else if (typeof value === 'object' && value !== null) {
                      // It's a nested node, create heading and recurse
                      md += `\n${headingPrefix} ${key.toUpperCase()}\n`;
                      md += compileToMarkdown(value, depth + 1);
                  }
             }
        }
        return md;
    };

    let compiledPromptText = compileToMarkdown(finalPromptData);

    // 3. User Identity Context
    const { nickname, signature } = await userIdentityService.getIdentityForPrompt(userId);
    let userContext = `\n\n# THÔNG TIN NGƯỜI DÙNG\nUser ID: ${userId}`;
    if (nickname) userContext += `\nBiệt danh: ${nickname} (Hãy gọi họ bằng tên này)`;
    if (signature) userContext += `\nBio: ${signature}`;

    // 4. Bot Persona Context (Guild-Level Priority > Global)
    let personaContext = "";
    let personaData = null;

    // A. Thử bốc thử từ GuildConfig (ưu tiên cá nhân hóa Server)
    if (guildId) {
        const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
        if (guildConfig) {
            try {
                const modules = JSON.parse(guildConfig.activeModules) as any;
                if (modules.persona) personaData = modules.persona;
            } catch (e) {
                 console.error("Error parsing guild persona info:", e);
            }
        }
    }

    // B. Nếu Guild chưa set Persona, Fallback mút từ Global (BotConfig)
    if (!personaData) {
        const personaConfig = await prisma.botConfig.findUnique({ where: { key: 'persona' } });
        if (personaConfig) {
            try {
                personaData = JSON.parse(personaConfig.systemPrompts);
            } catch (e) {
                console.error("Error parsing global persona info:", e);
            }
        }
    }

    // C. Chuẩn hoá Persona Prompt
    if (personaData) {
        personaContext = `\n\n# NHÂN CÁCH CỦA BẠN (BOT PERSONA):
- Danh tính (Bạn là ai?): ${personaData.identity || "Trợ lý AI"}
- Mục đích (Bạn làm gì?): ${personaData.purpose || "Hỗ trợ người dùng"}
- Sở thích (Bạn thích gì?): ${personaData.hobbies || "Không có"}
- Tính cách (Hành vi của bạn?): ${personaData.personality || "Thân thiện"}
- Giọng văn (Cách bạn giao tiếp?): ${personaData.writing_style || "Tự nhiên"}`;
    }

    const coreRules = `\n# CÁC QUY TẮC BẤT BIẾN:\n${process.env.CORE_RULES || ''}`;

    return `${compiledPromptText}\n${userContext}${personaContext}\n${coreRules}`;
  }

  // --- Chat Logic ---
  public async generateResponse(guildId: string, userId: string, username: string, messageContent: string, message?: any): Promise<string> {
      try {
          const systemInstruction = await this.getSystemPrompt(guildId, userId);
          
          
          // --- LOGGING FOR DEBUGGING ---
          await LoggerService.debug(`[UserID: ${userId}] Message: "${messageContent}"`);
          // await LoggerService.debug(`[System Prompt Preview]: ${systemInstruction.substring(0, 200)}...`);
          // Uncomment to see full prompt
          // console.log(`[System Prompt Full]:`, systemInstruction);

          // Fetch Chat History
          const logs = await prisma.chatLog.findMany({
              where: { guildId },
              orderBy: { createdAt: 'desc' },
              take: 20
          });

          const history: any[] = [];
          logs.reverse().forEach(log => {
               if (log.content) {
                    const userPrefix = log.username ? `[${log.username}]: ` : "";
                    history.push({ role: 'user', parts: [{ text: `${userPrefix}${log.content}` }] });
               }
               if (log.response) {
                    history.push({ role: 'model', parts: [{ text: log.response }] });
               }
          });

          const parts: Part[] = [{ text: messageContent }];

          const model = await this.getModel(guildId, 'chat');

          const chatSession = model.startChat({
              history: history as any, // Cast to any to avoid strict type issues with simple structure
              systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
              },
          });

          const result = await retryWithBackoff(() => chatSession.sendMessage(parts));
          const responseText = result.response.text();
          await LoggerService.info(`Generative Response Success`, { length: responseText.length, preview: responseText.substring(0, 50) });
          
          let cleanResponse = responseText;
          if (message && message.channel) {
              cleanResponse = cleanContent(responseText, message.channel);
          }

          // Save User Message
          await prisma.chatLog.create({
              data: {
                guildId, userId, username, content: messageContent, response: cleanResponse, type: 'chat'
              }
          });

          return cleanResponse;
      } catch (error: any) {
          await LoggerService.error("Gemini Chat Error", error);
          if (error.message?.includes('503')) return "Server AI đang quá tải, vui lòng thử lại sau 1 chút.";
          return "Xin lỗi, tôi đang gặp sự cố kết nối với não bộ.";
      }
  }
  
  // --- Vision (Image Analysis) ---
  public async ImageToTextAI(guildId: string, userId: string, imageUrl: string, caption: string = ""): Promise<string> {
      try {
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data);
          const base64Image = imageBuffer.toString('base64');
          const mimeType = response.headers['content-type'] || 'image/jpeg';
          
          const systemInstruction = await this.getSystemPrompt(guildId, userId, 'imageAnalysis');

          // Log Fetch
          const logs = await prisma.chatLog.findMany({
              where: { guildId },
              orderBy: { createdAt: 'desc' },
              take: 10
          });
          const history: any[] = [];
          logs.reverse().forEach(log => {
               if (log.content) {
                    const userPrefix = log.username ? `[${log.username}]: ` : "";
                    history.push({ role: 'user', parts: [{ text: `${userPrefix}${log.content}` }] });
               }
               if (log.response) {
                    history.push({ role: 'model', parts: [{ text: log.response }] });
               }
          });
          
           const userDetails = {
              role: 'user',
              parts: [
                  { text: caption || "Mô tả hình ảnh này" },
                  { inlineData: { mimeType, data: base64Image } }
              ]
           };

           const model = await this.getModel(guildId, 'chat');
           const result = await retryWithBackoff(() => model.generateContent({
               systemInstruction,
               contents: [
                   ...history as any, 
                   userDetails
               ]
           }));

           const text = result.response.text();
           await prisma.chatLog.create({
              data: {
                  guildId, userId, username: 'User', content: `[IMAGE] ${caption}`, response: text, type: 'image'
              } 
           });
           
           return text;
      } catch (error: any) {
             console.error("Image Analysis Error:", error);
             throw new Error(`Lỗi phân tích ảnh: ${error.message}`);
      }
  }

  // --- Video Analysis ---
  public async VideoToTextAI(guildId: string, userId: string, videoUrl: string, caption: string = ""): Promise<string> {
     try {
         const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
         const videoBuffer = Buffer.from(response.data);
         const base64Video = videoBuffer.toString('base64');
         let mimeType = response.headers['content-type'] || 'video/mp4';
         
         if (mimeType === 'application/octet-stream') {
             if (videoUrl.endsWith('.mp4')) mimeType = 'video/mp4';
             else if (videoUrl.endsWith('.webm')) mimeType = 'video/webm';
         }

          const systemInstruction = await this.getSystemPrompt(guildId, userId);
          const model = await this.getModel(guildId, 'chat');
          const result = await retryWithBackoff(() => model.generateContent({
             systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
             },
             contents: [{
                 role: 'user',
                 parts: [
                     { inlineData: { mimeType, data: base64Video } },
                     { text: caption || "Phân tích video này" }
                 ]
             }]
          }));
          
          const text = result.response.text();
          await prisma.chatLog.create({
              data: {
                guildId, userId, username: 'User', content: `[VIDEO] ${caption}`, response: text, type: 'video'
              }
          });
          return text;
     } catch (error: any) {
         console.error("Video Analysis Error:", error);
         throw new Error(`Lỗi phân tích video: ${error.message}`);
     }
  }

  // --- Image Generation (Imagen) ---
  public async generateImage(prompt: string, guildId?: string): Promise<{ success: boolean; imageBuffer?: Buffer; textResponse?: string; error?: string }> {
      try {
          const imageModel = await this.getModel(guildId, 'image');
          const result = await retryWithBackoff(() => imageModel.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"] } as any
          }));

          const parts = result.response.candidates?.[0]?.content?.parts;
          let imageBuffer: Buffer | undefined;
          let textResponse = "";

          if (parts) {
              for (const part of parts) {
                  if (part.text) textResponse += part.text + "\n";
                  if (part.inlineData) imageBuffer = Buffer.from(part.inlineData.data, 'base64');
              }
          }

          if (!imageBuffer) return { success: false, textResponse: textResponse || "Không tạo được ảnh.", error: "No image" };

          return { success: true, imageBuffer, textResponse: textResponse.trim() };
      } catch (error: any) {
          console.error("Generate Image Error:", error);
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

  // --- Search Tool ---
  public async chatWithSearch(userId: string, username: string, query: string, guildId: string = 'global'): Promise<{ success: boolean; response: string; error?: string }> {
      try {
           const systemInstruction = await this.getSystemPrompt(guildId, userId);
           
           // Fetch History
           const logs = await prisma.chatLog.findMany({
               where: { guildId },
               orderBy: { createdAt: 'desc' },
               take: 20
           });
           
           const history: any[] = [];
           logs.reverse().forEach(log => {
                if (log.content) {
                    const userPrefix = log.username ? `[${log.username}]: ` : "";
                    history.push({ role: 'user', parts: [{ text: `${userPrefix}${log.content}` }] });
                }
                if (log.response) history.push({ role: 'model', parts: [{ text: log.response }] });
           });

           const searchModel = await this.getModel(guildId, 'search');
           
           const chat = searchModel.startChat({
               history: history as any,
               systemInstruction: {
                 role: 'system',
                 parts: [{ text: systemInstruction }]
               }
           });
           
           const result = await retryWithBackoff(() => chat.sendMessage([{ text: query }]));
           const responseText = result.response.text();
           
           // Save User Search Message
           await prisma.chatLog.create({
               data: {
                 guildId, userId, username, content: `[SEARCH] ${query}`, response: responseText, type: 'search'
               }
           });

           return { success: true, response: responseText };
      } catch (error: any) {
          console.error("Search Error:", error);
          return { success: false, response: "", error: error.message };
      }
  }

  // --- Auto Reply ---
  public async generateAutoReply(messageContent: string, senderName: string, guildId?: string): Promise<string> {
      try {
          const userPrompt = `Kẻ tên "${senderName}" vừa nhắn: "${messageContent}". Hãy chửi nó và đuổi nó đi ngay.`;
          const systemInstruction = process.env.AUTO_REPLY_PROMPT || "Mày là trợ lý thô lỗ. Luôn đuổi người khác đi.";
          
          const autoReplyModel = await this.getModel(guildId, 'chat');
          const result = await retryWithBackoff(() => autoReplyModel.generateContent({
              systemInstruction,
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          }));
          
          return result.response.text();
      } catch (error: any) {
          return "Biến đi.";
      }
  }

  // --- PK Game Logic ---
  public async generatePKResponse(prompt: string, guildId?: string): Promise<any> {
      try {
           const pkModel = await this.getModel(guildId, 'logic', { ...GEMINI_LOGIC_CONFIG.generationConfig, responseMimeType: "application/json" });
           
           const result = await retryWithBackoff(() => pkModel.generateContent(prompt));
           const text = result.response.text();
           return JSON.parse(text);
      } catch (error: any) {
           console.error("PK Logic Error:", error);
           throw error;
      }
  }
  
  // --- Generic JSON Generation ---
  public async generateJSON<T>(prompt: string, schema?: any, guildId?: string): Promise<T> {
      try {
          const config: any = {
              responseMimeType: "application/json",
          };
          if (schema) {
              config.responseSchema = schema;
          }

          const model = await this.getModel(guildId, 'logic', config);

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
  
  // --- Audio Analysis ---
  public async AudioToTextAI(guildId: string, userId: string, audioUrl: string, caption: string = ""): Promise<string> {
     try {
         const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
         const audioBuffer = Buffer.from(response.data);
         const base64Audio = audioBuffer.toString('base64');
         let mimeType = response.headers['content-type'] || 'audio/ogg'; 

         if (audioUrl.endsWith('.mp3')) mimeType = 'audio/mp3';
         if (audioUrl.endsWith('.wav')) mimeType = 'audio/wav';

          const systemInstruction = await this.getSystemPrompt(guildId, userId);
          const model = await this.getModel(guildId, 'chat');
          const result = await retryWithBackoff(() => model.generateContent({
             systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
             },
             contents: [{
                 role: 'user',
                 parts: [
                     { inlineData: { mimeType, data: base64Audio } },
                     { text: caption || "Transcript audio này" }
                 ]
             }]
          }));
          
          return result.response.text();
     } catch (error: any) {
         console.error("Audio Analysis Error:", error);
         throw new Error(`Lỗi phân tích audio: ${error.message}`);
     }
  }
}

export const geminiService = new GeminiService();
