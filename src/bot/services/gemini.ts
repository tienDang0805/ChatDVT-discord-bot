import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
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

  private async getModel(guildId?: string | null, type: 'chat' | 'image' | 'logic' | 'search' = 'chat', customConfig?: any, customApiKey?: string): Promise<GenerativeModel> {
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

  // --- Summarize Messages ---
  public async summarizeMessages(guildId: string, userId: string, messagesText: string): Promise<string> {
      try {
          const systemInstruction = await this.getSystemPrompt(guildId, userId);
          const model = await this.getModel(guildId, 'chat');
          
          const prompt = `Dưới đây là một cuộc hội thoại gần đây trong nhóm:\n\n${messagesText}\n\nHãy đọc kỹ và tóm tắt lại nội dung chính của cuộc trò chuyện trên một cách ngắn gọn, súc tích và dễ hiểu nhất. Vui lòng giữ đúng nhân cách và giọng điệu của bạn (dựa theo các luật lệ và phần mô tả nhân cách ở trên) khi trả lời.`;

          const result = await retryWithBackoff(() => model.generateContent({
              systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
              },
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
          }));

          return result.response.text();
      } catch (error: any) {
          console.error("Summarize Error:", error);
          if (error.message?.includes('503')) return "Server AI đang quá tải, vui lòng thử lại sau 1 chút.";
          return "Xin lỗi, tôi đang gặp lỗi khi cố gắng tóm tắt đoạn chat này.";
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
  // --- Handsome Analyzer ---
  public async analyzeHandsome(base64Image: string, mimeType: string): Promise<any> {
      try {
          const prompt = `Bạn là DIẾP-LOING-NING 3000, cỗ máy AI phân tích nhan sắc cực kỳ xạo lồng, mỏ hỗn và hay dìm hàng người khác. 
Hãy phân tích bức ảnh này và đưa ra nhận xét về độ đẹp trai/xinh gái của người trong ảnh.
BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON VỚI CẤU TRÚC SAU:
{
  "score": <số nguyên từ -100 đến 10>,
  "overall": "<1 câu tổng kết cực kỳ phũ phàng, dìm hàng tổng thể>",
  "features": [
    {
      "part": "<Bộ phận (vd: Mắt, Mũi, Môi, Tóc, Cằm...)>",
      "comment": "<Nhận xét mỏ hỗn dựa trên phân tích chi tiết bộ phận đó>",
      "rating": <số điểm từ 1 đến 10>
    }
  ],
  "advice": "<1 lời khuyên xạo chó, mất dạy (vd: khuyên nên đi bọc thép khuôn mặt, đeo khẩu trang...)>"
}`;

          // Sử dụng logic type để có thể set responseMimeType JSON
          const config = { ...GEMINI_LOGIC_CONFIG.generationConfig, responseMimeType: "application/json" };
          const model = await this.getModel('global', 'logic', config); 
          
          const imagePart = {
              inlineData: { data: base64Image, mimeType }
          };

          const result = await retryWithBackoff(() => model.generateContent([prompt, imagePart]));
          let text = result.response.text().trim();
          
          if (text.startsWith('```json')) {
              text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
          } else if (text.startsWith('```')) {
              text = text.replace(/^```\n/, '').replace(/\n```$/, '');
          }

          return JSON.parse(text);
      } catch (error: any) {
          console.error("Handsome Analysis Error:", error);
          throw new Error(`Lỗi nhận diện nhan sắc: ${error.message}`);
      }
  }
  // --- CV Processing ---
  public async processCV(fileBuffer: Buffer, mimeType: string, filename: string, mode: 'review' | 'rewrite'): Promise<any> {
      try {
          let documentContent: Part[] = [];
          
          if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
              documentContent.push({
                  inlineData: {
                      data: fileBuffer.toString('base64'),
                      mimeType: mimeType
                  }
              });
          } else if (filename.endsWith('.txt') || filename.endsWith('.md')) {
              documentContent.push({ text: `Nội dung CV:\n${fileBuffer.toString('utf-8')}` });
          } else if (filename.endsWith('.docx')) {
              const mammoth = require('mammoth');
              const textResult = await mammoth.extractRawText({ buffer: fileBuffer });
              documentContent.push({ text: `Nội dung CV:\n${textResult.value}` });
          } else {
              throw new Error("Định dạng file không hỗ trợ. Tải Ảnh, PDF, DOCX, TXT hoặc MD.");
          }

          let prompt = "";
          let config: any = { ...GEMINI_LOGIC_CONFIG.generationConfig };

          if (mode === 'review') {
              prompt = `Bạn là một Giám đốc Nhân sự (HR) vô cùng khó tính, sát thủ diệt CV, nhưng nhận xét cực kỳ chuẩn xác để người ứng tuyển thăng tiến.
Hãy phân tích CV này. BẮT BUỘC TRẢ VỀ JSON:
{
  "score": <Điểm số 1-100 đánh giá tổng thể trình bày và nội dung>,
  "level": "<Junior/Mid/Senior/Fresher/Thực tập sinh Lỏ>",
  "overall": "<Nhận xét tổng quan từ HR (Gắt gỏng nhưng đúng)>",
  "critiques": [
    {
      "issue": "<Điểm yếu, lỗi chính tả, thiết kế phèn>",
      "advice": "<Cách khắc phục ngắn gọn>"
    }
  ],
  "strengths": ["<Điểm mạnh 1>", "<Điểm mạnh 2>"]
}`;
              config.responseMimeType = "application/json";
          } else if (mode === 'rewrite') {
              prompt = `Bạn là một Chuyên gia viết CV (Resume Writer) cấp cao.
Từ các thông tin có trong CV này (có thể rất lộn xộn/yếu), hãy TỔNG HỢP, TRAU CHUỐT từ vựng (Action Verbs), và VIẾT LẠI hoàn toàn thành một bản CV chuyên nghiệp bằng chuẩn Markdown.
Cố gắng sắp xếp theo cấu trúc: SUMMARY, EXPERIENCE (Dùng bullet points có kết quả định lượng), EDUCATION, SKILLS.
Nếu thiếu thông tin, tự thêm các Placeholder (như [Điền kinh nghiệm A ở đây]) thay vì bịa.
TRẢ VỀ ĐÚNG MÃ MARKDOWN CỦA CV MỚI.`;
              config.responseMimeType = "text/plain";
          }

          const model = await this.getModel('global', 'logic', config);
          const result = await retryWithBackoff(() => model.generateContent([prompt, ...documentContent]));
          let text = result.response.text().trim();
          
          if (mode === 'review') {
              if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
              else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '');
              return JSON.parse(text);
          } else {
              if (text.startsWith('```markdown')) text = text.replace(/^```markdown\n/, '').replace(/\n```$/, '');
              else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '');
              return { markdown: text };
          }
      } catch (error: any) {
          console.error("CV Protocol Error:", error);
          throw new Error(`Lỗi phân tích CV: ${error.message}`);
      }
  }

  // --- CV Reviewer & Rewriter ---
  public async analyzeCV(fileBuffer: Buffer, mimeType: string, filename: string, mode: 'review' | 'rewrite', customPrompt?: string, reviewContext?: any): Promise<any> {
      try {
          const documentContent: Part[] = [];
          
          if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
              documentContent.push({
                  inlineData: {
                      data: fileBuffer.toString('base64'),
                      mimeType: mimeType
                  }
              });
          } else if (filename.endsWith('.txt') || filename.endsWith('.md')) {
              documentContent.push({ text: `Nội dung CV:\n${fileBuffer.toString('utf-8')}` });
          } else if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
              const mammoth = require('mammoth');
              const textResult = await mammoth.extractRawText({ buffer: fileBuffer });
              documentContent.push({ text: `Nội dung CV:\n${textResult.value}` });
          } else {
              throw new Error("Định dạng file không được hỗ trợ. Chỉ nhận PDF, Ảnh, Word (.docx), TXT, MD.");
          }

          let prompt = "";
          let config: any = { ...GEMINI_LOGIC_CONFIG.generationConfig };

          if (mode === 'review') {
              prompt = `Bạn là một Giám đốc Nhân sự (HR) cấp cao & Chuyên gia ATS System. Nhiệm vụ của bạn là phân tích CV này một cách cực kỳ khắt khe, chi tiết và chuyên nghiệp nhất.
BẮT BUỘC TRẢ VỀ CHUẨN JSON VỚI CẤU TRÚC:
{
  "score": <Số nguyên 1-100 đánh giá chất lượng độ thân thiện ATS & Impact của CV>,
  "level": "<Dự đoán trình độ thực tế: Intern/Fresher/Junior/Mid-level/Senior/Lead...>",
  "overall": "<1 Câu tóm tắt đánh giá về giá trị cốt lõi của ứng viên (Professional & Concise)>",
  "critiques": [
    {
      "issue": "<Lỗ hổng cụ thể về kỹ năng, cách trình bày, thiết hụt số liệu (Metrics), hoặc sai lầm Action Verbs>",
      "advice": "<Giải pháp sắc bén, mang tính Actionable và đúng chuẩn Silicon Valley>"
    }
  ],
  "strengths": ["<Điểm sáng 1>", "<Điểm sáng 2>"],
  "development": {
    "missingSkills": ["<Kỹ năng/Tech stack cốt lõi còn thiếu 1>", "<Kỹ năng 2>"],
    "nextSteps": ["<Hành động thực tế cần làm để leo level 1>", "<Hành động 2>"]
  }
}`;
              config.responseMimeType = "application/json";
          } else if (mode === 'rewrite') {
              prompt = `Bạn là một Chuyên gia viết CV (Resume Writer) top đầu tại Thung lũng Silicon.
${reviewContext ? `\n[TÀI LIỆU QUAN TRỌNG: KẾT QUẢ ĐÁNH GIÁ (REVIEW) BẠN VỪA TRẢ VỀ CHO CV GỐC]:\n${JSON.stringify(reviewContext, null, 2)}\n\nNhiệm vụ của bạn là bám sát tuyệt đối vào lỗi sai (critiques) và khoảng trống (missingSkills, nextSteps) ở trên để TRÁM LỖ HỔNG, SỬA CHỮA và REFACTOR lại CV này một cách hoàn hảo.\n` : ''}
Mục tiêu tuyệt đối: Refactor bản CV này để VƯỢT QUA MỌI HỆ THỐNG ATS với ĐIỂM SỐ CHẮC CHẮN > 95 nhưng PHẢI DỰA TRÊN KHUNG SỰ THẬT 100%.
QUY TẮC REFACTOR BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG BỊA ĐẶT SỐ LIỆU (Metrics), dự án, hoặc chém gió những thứ không có thật trong CV gốc. Chỉ tái cấu trúc và làm đẹp văn phong từ những gì user đã cung cấp.
2. Ánh xạ "Công thức XYZ từ Google": "Accomplished [X] as measured by [Y], by doing [Z]" cho MỌI kinh nghiệm. Lượng hoá kết quả theo fact của user. Nếu user thiếu số liệu, hãy chèn note <b>[Bổ sung số liệu KPI vào đây]</b> để người dùng tự điền thay vì tự bịa ra số liệu giả.
3. Khai hỏa bằng ĐỘNG TỪ MẠNH (Action Verbs) mang tính tác động cao (e.g., Architected, Spearheaded, Optimized, Orchestrated, Engineered). KHÔNG dùng các từ yếu đuối (Worked on, Helped). Biến các câu văn lủng củng thành bullet point súc tích, chuyên nghiệp.
4. Dịch sang Tiếng Anh chuyên ngành (hoặc giữ Tiếng Việt tuỳ bối cảnh), dùng văn phong Sắc - Gọn - Lạnh lùng. Output dùng HTML inline tags như <b>, <i> ở những technical keyword cốt lõi (BẮT BUỘC).
5. Nếu ứng viên có thông tin nằm ngoài 4 danh mục chính (như Chứng chỉ, Giải thưởng, Tech Stack riêng), hãy gom chúng vào mảng 'customSections' và đặt 'title' tương ứng (VD: 'CERTIFICATIONS').
BẮT BUỘC TRẢ VỀ ĐÚNG CẤU TRÚC JSON SAU (không chứa mã Markdown, chỉ duy nhất JSON):
{
  "personalInfo": { "fullName": "", "title": "", "email": "", "phone": "", "portfolio": "", "summary": "" },
  "experience": [ { "company": "", "role": "", "duration": "", "description": "" } ],
  "education": [ { "school": "", "degree": "", "duration": "", "gpa": "" } ],
  "skills": ["", "", ""],
  "projects": [ { "name": "", "duration": "", "description": "" } ],
  "customSections": [ { "id": "uuid-1", "title": "CERTIFICATIONS", "items": [ { "name": "", "duration": "", "description": "" } ] } ]
}`;
              if (customPrompt && customPrompt.trim() !== '') {
                  prompt += `\n\n[📢 YÊU CẦU ĐẶC BIỆT TỪ ỨNG VIÊN BẰNG MỌI GIÁ PHẢI TUÂN THỦ]:\n"${customPrompt}"\nHãy ưu tiên đáp ứng chính xác yêu cầu này nhưng vẫn giữ nguyên cấu trúc JSON.\n`;
              }
              config.responseMimeType = "application/json";
          }

          const model = await this.getModel('global', 'logic', config);
          const result = await retryWithBackoff(() => model.generateContent([prompt, ...documentContent]));
          let text = result.response.text().trim();
          
          if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
          else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '');
          
          return JSON.parse(text);
      } catch (error: any) {
          console.error("CV Analysis Error:", error);
          throw new Error(`Lỗi xử lý CV: ${error.message}`);
      }
  }

  public async analyzeNumerology(fullName: string, birthDate: string): Promise<any> {
      try {
          const today = new Date();
          const currentYear = today.getFullYear();

          const prompt = `Bạn là MỘT CHUYÊN GIA THẦN SỐ HỌC (NUMEROLOGY) BẬC THẦY với hơn 30 năm kinh nghiệm, kết hợp giữa hệ thống Pythagoras phương Tây và chiêm tinh học phương Đông.

THÔNG TIN ĐẦU VÀO:
- Họ và tên đầy đủ: "${fullName}"
- Ngày sinh dương lịch: ${birthDate} (format YYYY-MM-DD)
- Năm hiện tại: ${currentYear}

QUY TẮC TÍNH TOÁN BẮT BUỘC:
1. SỐ CHỦ ĐẠO (LIFE PATH NUMBER): Cộng tất cả chữ số trong ngày sinh (DD/MM/YYYY) rồi rút gọn về 1 chữ số (trừ Master Number 11, 22, 33). Ví dụ: 15/03/1990 → 1+5+0+3+1+9+9+0 = 28 → 2+8 = 10 → 1+0 = 1
2. SỐ BIỂU ĐẠT (EXPRESSION NUMBER): Gán giá trị cho MỖI CHỮ CÁI trong tên đầy đủ theo bảng Pythagoras (A=1,B=2...I=9,J=1...R=9,S=1...Z=8), cộng tất cả rồi rút gọn.
3. SỐ LINH HỒN (SOUL URGE / HEART'S DESIRE): Chỉ cộng các NGUYÊN ÂM (A, E, I, O, U, Y) trong tên.
4. SỐ NHÂN CÁCH (PERSONALITY NUMBER): Chỉ cộng các PHỤ ÂM trong tên.
5. SỐ NGÀY SINH (BIRTHDAY NUMBER): Rút gọn ngày sinh (chỉ ngày, không tháng/năm).
6. NĂM CÁ NHÂN (PERSONAL YEAR): Cộng ngày sinh + tháng sinh + năm hiện tại (${currentYear}) rồi rút gọn.
7. SỐ TRƯỞNG THÀNH (MATURITY NUMBER): Life Path + Expression, rút gọn.
8. BIỂU ĐỒ NGÀY SINH PYTHAGORAS: Đếm số lần xuất hiện chữ số 1-9 trong ngày sinh đầy đủ (DD/MM/YYYY). VD: 15/03/1990 có: 1 xuất hiện 2 lần, 3 xuất hiện 1 lần, 5 xuất hiện 1 lần, 9 xuất hiện 2 lần, 0 xuất hiện 2 lần (0 bỏ qua).
9. MŨI TÊN TRONG BIỂU ĐỒ: Dựa trên biểu đồ, xác định các mũi tên (hàng/cột/đường chéo đầy đủ = mũi tên mạnh, hàng/cột/đường chéo trống = mũi tên yếu/thiếu).
10. 4 ĐỈNH CAO (PINNACLE): Tính 4 chu kỳ Pinnacle dựa trên ngày/tháng/năm sinh.
11. 4 THÁCH THỨC (CHALLENGE): Tính 4 con số Challenge từ hiệu các thành phần ngày sinh.
12. NỢ NGHIỆP (KARMIC DEBT): Kiểm tra xem Life Path, Expression, Soul Urge, Birthday có rơi vào số 13, 14, 16, 19 trước khi rút gọn không.
13. SỐ ĐAM MÊ ẨN (HIDDEN PASSION): Chữ số xuất hiện nhiều nhất trong tên (theo Pythagoras).

LƯU Ý VỚI TÊN TIẾNG VIỆT: Bỏ qua dấu tiếng Việt khi tính toán (VD: Ă→A, Ơ→O, Ư→U, Đ→D). Chữ Y xem là nguyên âm.

YÊU CẦU PHÂN TÍCH: 
- CHUYÊN SÂU, CHÍNH XÁC theo lý thuyết Thần Số Học chuẩn quốc tế.
- CÁ NHÂN HÓA cho tên "${fullName}" cụ thể, KHÔNG chung chung.
- Có chiều sâu tâm linh nhưng vẫn thực tế.

BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON (KHÔNG markdown, KHÔNG backtick):
{
  "lifePath": {
    "number": <số>,
    "title": "<Tên gọi con số VN, VD: Người Tiên Phong>",
    "keywords": ["<5 từ khóa đặc trưng>"],
    "strengths": ["<4 điểm mạnh>"],
    "weaknesses": ["<3 điểm yếu>"],
    "description": "<Phân tích CHI TIẾT 5-7 câu về ý nghĩa số chủ đạo đối với cuộc đời ${fullName}>"
  },
  "expression": {
    "number": <số>,
    "title": "<Tên gọi>",
    "keywords": ["<4-5 từ khóa>"],
    "strengths": ["<3 điểm mạnh>"],
    "weaknesses": ["<3 điểm yếu>"],
    "description": "<Phân tích chi tiết 4-5 câu>"
  },
  "soulUrge": {
    "number": <số>,
    "title": "<Tên gọi>",
    "keywords": ["<4-5 từ khóa>"],
    "strengths": ["<3 điểm mạnh>"],
    "weaknesses": ["<3 điểm yếu>"],
    "description": "<Phân tích chi tiết 4-5 câu về khát khao sâu thẳm của linh hồn>"
  },
  "personality": {
    "number": <số>,
    "title": "<Tên gọi>",
    "keywords": ["<4-5 từ khóa>"],
    "strengths": ["<3 điểm mạnh>"],
    "weaknesses": ["<3 điểm yếu>"],
    "description": "<Phân tích chi tiết 4-5 câu về hình ảnh bên ngoài>"
  },
  "birthday": {
    "number": <số>,
    "title": "<Tên gọi>",
    "keywords": ["<4-5 từ khóa>"],
    "strengths": ["<3 điểm mạnh>"],
    "weaknesses": ["<3 điểm yếu>"],
    "description": "<Phân tích chi tiết 3-4 câu về năng khiếu bẩm sinh>"
  },
  "maturity": {
    "number": <số>,
    "title": "<Tên gọi>",
    "description": "<Phân tích 3-4 câu về tiềm năng khi trưởng thành (thường biểu hiện rõ sau 40-50 tuổi)>"
  },
  "personalYear": {
    "number": <số>,
    "theme": "<Chủ đề năm ${currentYear}>",
    "advice": "<Lời khuyên chi tiết 4-5 câu cho năm nay>"
  },
  "pythagorasChart": {
    "grid": [<Mảng 9 phần tử, mỗi phần tử = số lần chữ số 1-9 xuất hiện trong ngày sinh. Index 0=số 1, index 1=số 2,..., index 8=số 9>],
    "arrows": {
      "strong": ["<Tên mũi tên mạnh, VD: Mũi Tên Trí Nhớ (3-5-7), Mũi Tên Quyết Tâm (1-5-9)...>"],
      "weak": ["<Tên mũi tên yếu/thiếu, VD: Mũi Tên Trống Rỗng (4-5-6)...>"]
    },
    "interpretation": "<Phân tích 4-5 câu về biểu đồ: con số nào mạnh, con số nào thiếu, ý nghĩa tổng thể>"
  },
  "pinnacles": [
    { "cycle": 1, "number": <số>, "ageRange": "<VD: 0-30>", "theme": "<Chủ đề>", "description": "<2-3 câu>" },
    { "cycle": 2, "number": <số>, "ageRange": "<VD: 31-39>", "theme": "<Chủ đề>", "description": "<2-3 câu>" },
    { "cycle": 3, "number": <số>, "ageRange": "<VD: 40-48>", "theme": "<Chủ đề>", "description": "<2-3 câu>" },
    { "cycle": 4, "number": <số>, "ageRange": "<VD: 49+>", "theme": "<Chủ đề>", "description": "<2-3 câu>" }
  ],
  "challenges": [
    { "cycle": 1, "number": <số>, "description": "<2 câu về thách thức>" },
    { "cycle": 2, "number": <số>, "description": "<2 câu>" },
    { "cycle": 3, "number": <số>, "description": "<2 câu>" },
    { "cycle": 4, "number": <số>, "description": "<2 câu>" }
  ],
  "karmicDebt": {
    "hasDebt": <true/false>,
    "numbers": [<Các số nợ nghiệp nếu có: 13, 14, 16, 19>],
    "description": "<Nếu có nợ nghiệp: phân tích chi tiết 3-4 câu. Nếu không: 1 câu 'Không phát hiện nợ nghiệp trong biểu đồ.'>"
  },
  "hiddenPassion": {
    "number": <số>,
    "description": "<2-3 câu về đam mê ẩn giấu>"
  },
  "compatibility": {
    "bestMatch": [<3 số hợp nhất>],
    "challenging": [<3 số thách thức>],
    "soulmate": "<Mô tả ngắn 2 câu về kiểu người tri kỷ lý tưởng>"
  },
  "luckyInfo": {
    "colors": ["<3 màu may mắn>"],
    "gemstone": "<Đá phong thủy phù hợp>",
    "element": "<Ngũ hành/Nguyên tố>",
    "planet": "<Hành tinh cai quản>",
    "luckyDays": ["<2-3 ngày trong tuần may mắn>"],
    "luckyNumbers": [<3-4 con số may mắn>],
    "direction": "<Hướng tốt nhất>"
  },
  "famousPeople": ["<3-4 người nổi tiếng cùng số Chủ Đạo, VD: Albert Einstein, Steve Jobs...>"],
  "lifePhases": [
    { "phase": "Giai đoạn Hình thành", "ageRange": "0-27", "description": "<2-3 câu>" },
    { "phase": "Giai đoạn Phát triển", "ageRange": "28-54", "description": "<2-3 câu>" },
    { "phase": "Giai đoạn Thu hoạch", "ageRange": "55+", "description": "<2-3 câu>" }
  ],
  "monthlyForecast": [
    { "month": 1, "theme": "<Chủ đề tháng 1/${currentYear}>", "advice": "<1-2 câu lời khuyên>" },
    { "month": 2, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 3, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 4, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 5, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 6, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 7, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 8, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 9, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 10, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 11, "theme": "<Chủ đề>", "advice": "<1-2 câu>" },
    { "month": 12, "theme": "<Chủ đề>", "advice": "<1-2 câu>" }
  ],
  "overallReading": "<Tổng quan bức tranh toàn cảnh cuộc đời của ${fullName} dựa trên TẤT CẢ các con số, 5-7 câu, có chiều sâu tâm linh và giàu cảm xúc>",
  "detailedCareer": "<Phân tích chi tiết 4-6 câu về sự nghiệp, ngành nghề phù hợp nhất, tiềm năng phát triển, kiểu môi trường làm việc lý tưởng>",
  "detailedLove": "<Phân tích chi tiết 4-6 câu về tình yêu, cách yêu đặc trưng, kiểu người partner phù hợp, cảnh báo trong mối quan hệ>",
  "detailedHealth": "<Phân tích 3-4 câu về xu hướng sức khỏe, các cơ quan cần chú ý, cách cân bằng năng lượng, loại hình vận động phù hợp>",
  "detailedFinance": "<Phân tích 3-4 câu về xu hướng tài chính, cách quản lý tiền, tiềm năng thu nhập, lưu ý đầu tư>",
  "spiritualMessage": "<Một thông điệp tâm linh sâu sắc, truyền cảm hứng, cá nhân hóa 3-4 câu dành riêng cho ${fullName}>"
}`;

          const config = { ...GEMINI_LOGIC_CONFIG.generationConfig, responseMimeType: "application/json" };
          const model = await this.getModel('global', 'logic', config);

          const result = await retryWithBackoff(() => model.generateContent(prompt));
          let text = result.response.text().trim();

          if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
          else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '');

          return JSON.parse(text);
      } catch (error: any) {
          console.error("Numerology Analysis Error:", error);
          throw new Error(`Lỗi phân tích Thần Số Học: ${error.message}`);
      }
  }
}

export const geminiService = new GeminiService();
