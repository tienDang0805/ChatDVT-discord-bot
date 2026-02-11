import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';
import { GEMINI_CHAT_CONFIG, GEMINI_LOGIC_CONFIG, IMAGEN_MODEL, DEFAULT_SYSTEM_PROMPT } from '../../config/constants';
import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { cleanContent } from 'discord.js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

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
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private imageModel: GenerativeModel;
  private autoReplyModel: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    this.model = this.genAI.getGenerativeModel({
      model: GEMINI_CHAT_CONFIG.modelName,
      generationConfig: GEMINI_CHAT_CONFIG.generationConfig,
      safetySettings,
    });

    this.imageModel = this.genAI.getGenerativeModel({
      model: IMAGEN_MODEL, 
      generationConfig: GEMINI_CHAT_CONFIG.generationConfig,
      safetySettings,
    });
    
    this.autoReplyModel = this.genAI.getGenerativeModel({
       model: GEMINI_CHAT_CONFIG.modelName,
       generationConfig: GEMINI_CHAT_CONFIG.generationConfig,
       safetySettings,
    });
  }

  // --- Dynamic System Prompt ---
  private async getSystemPrompt(guildId: string, userId: string, feature: string = 'global'): Promise<string> {
    let finalPrompt = "";

    // 1. Check Guild Config
    const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
    if (guildConfig) {
        const prompts = JSON.parse(guildConfig.systemPrompts) as any;
        if (prompts && prompts[feature] && prompts[feature].trim() !== "") {
            finalPrompt = prompts[feature];
        }
    }

    // 2. Fallback to Global Bot Config
    if (!finalPrompt) {
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
        const prompts = JSON.parse(globalConfig.systemPrompts) as any;
        finalPrompt = prompts[feature] || prompts.global;
    }

    // 3. User Identity Context
    const { nickname, signature } = await userIdentityService.getIdentityForPrompt(userId);
    let userContext = `\n\n# THÔNG TIN NGƯỜI DÙNG\nUser ID: ${userId}`;
    if (nickname) userContext += `\nBiệt danh: ${nickname} (Hãy gọi họ bằng tên này)`;
    if (signature) userContext += `\nBio: ${signature}`;

    const coreRules = `\n# CÁC QUY TẮC BẤT BIẾN:\n${process.env.CORE_RULES || ''}`;

    return `${finalPrompt}\n${userContext}\n${coreRules}`;
  }

  // --- Chat Logic ---
  public async generateResponse(guildId: string, userId: string, username: string, messageContent: string, message?: any): Promise<string> {
      try {
          const systemInstruction = await this.getSystemPrompt(guildId, userId);
          
          // --- LOGGING FOR DEBUGGING ---
          console.log("--- GEMINI DEBUG ---");
          console.log(`[UserID: ${userId}] Message: "${messageContent}"`);
          console.log(`[System Prompt Preview]: ${systemInstruction.substring(0, 200)}...`);
          // Uncomment to see full prompt
          // console.log(`[System Prompt Full]:`, systemInstruction);
          console.log("--------------------");

          // Fetch Chat History
          const logs = await prisma.chatLog.findMany({
              where: { guildId },
              orderBy: { createdAt: 'desc' },
              take: 20
          });

          const history = logs.reverse().map(log => ({
              role: log.userId === 'BOT' ? 'model' : 'user',
              parts: [{ text: log.content }]
          }));

          const parts: Part[] = [{ text: messageContent }];

          const chatSession = this.model.startChat({
              history: history as any, // Cast to any to avoid strict type issues with simple structure
              systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
              },
          });

          const result = await retryWithBackoff(() => chatSession.sendMessage(parts));
          const responseText = result.response.text();
          
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
          console.error("Gemini Chat Error:", error);
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
          const history = logs.reverse().map(log => ({
               role: log.userId === 'BOT' ? 'model' : 'user',
               parts: [{ text: log.content }]
          }));
          
           const userDetails = {
              role: 'user',
              parts: [
                  { text: caption || "Mô tả hình ảnh này" },
                  { inlineData: { mimeType, data: base64Image } }
              ]
           };

           const result = await retryWithBackoff(() => this.model.generateContent({
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
          const result = await retryWithBackoff(() => this.model.generateContent({
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
  public async generateImage(prompt: string): Promise<{ success: boolean; imageBuffer?: Buffer; textResponse?: string; error?: string }> {
      try {
          const result = await retryWithBackoff(() => this.imageModel.generateContent({
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
  public async generateAudioWithContext(text: string, voiceName: string = 'Kore'): Promise<{ success: boolean; filePath?: string; text: string; error?: string }> {
     try {
         const apiKey = process.env.GEMINI_API_KEY;
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
  public async chatWithSearch(userId: string, query: string): Promise<{ success: boolean; response: string; error?: string }> {
      try {
           const searchModel = this.genAI.getGenerativeModel({
              model: GEMINI_CHAT_CONFIG.modelName,
              tools: [{ googleSearch: {} } as any],
              generationConfig: GEMINI_CHAT_CONFIG.generationConfig,
           });
           
           const chat = searchModel.startChat();
           const result = await retryWithBackoff(() => chat.sendMessage(query));
           return { success: true, response: result.response.text() };
      } catch (error: any) {
          console.error("Search Error:", error);
          return { success: false, response: "", error: error.message };
      }
  }

  // --- Auto Reply ---
  public async generateAutoReply(messageContent: string, senderName: string): Promise<string> {
      try {
          const userPrompt = `Kẻ tên "${senderName}" vừa nhắn: "${messageContent}". Hãy chửi nó và đuổi nó đi ngay.`;
          const systemInstruction = process.env.AUTO_REPLY_PROMPT || "Mày là trợ lý thô lỗ. Luôn đuổi người khác đi.";
          
          const result = await retryWithBackoff(() => this.autoReplyModel.generateContent({
              systemInstruction,
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          }));
          
          return result.response.text();
      } catch (error: any) {
          return "Biến đi.";
      }
  }

  // --- PK Game Logic ---
  public async generatePKResponse(prompt: string): Promise<any> {
      try {
           const pkModel = this.genAI.getGenerativeModel({
                model: GEMINI_LOGIC_CONFIG.modelName,
                generationConfig: { ...GEMINI_LOGIC_CONFIG.generationConfig, responseMimeType: "application/json" },
           });
           
           const result = await retryWithBackoff(() => pkModel.generateContent(prompt));
           const text = result.response.text();
           return JSON.parse(text);
      } catch (error: any) {
           console.error("PK Logic Error:", error);
           throw error;
      }
  }
  
  // --- Generic JSON Generation ---
  public async generateJSON<T>(prompt: string, schema?: any): Promise<T> {
      try {
          const config: any = {
              responseMimeType: "application/json",
          };
          if (schema) {
              config.responseSchema = schema;
          }

          const model = this.genAI.getGenerativeModel({
              model: GEMINI_LOGIC_CONFIG.modelName,
              generationConfig: config
          });

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
           const result = await retryWithBackoff(() => this.model.generateContent({
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
