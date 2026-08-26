import { Part } from '@google/generative-ai';
import { cleanContent } from 'discord.js';
import axios from 'axios';
import { GEMINI_LOGIC_CONFIG, DEFAULT_SYSTEM_PROMPT } from '../../config/constants';
import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { LoggerService } from './logger';
import { geminiCore, retryWithBackoff } from '../../shared/services/gemini-core';

// Helper to escape markdown
function escapeMarkdown(text: string): string {
    if (text.startsWith('```') && text.endsWith('```')) return text;
    return text.replace(/(^|\s)(\*|_|~|`|>|\||#)(?=\s|$)/g, '$1\\$2');
}

class GeminiBotService {
  constructor() {}

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
        const headingPrefix = '#'.repeat(Math.min(depth, 6));
        
        if (typeof data === 'object') {
             if (data['__rootText'] && typeof data['__rootText'] === 'string' && data['__rootText'].trim() !== '') {
                 md += `${data['__rootText']}\n`;
             }

             for (const [key, value] of Object.entries(data)) {
                  if (key.startsWith('__')) continue; 
                  
                  if (typeof value === 'string' && value.trim() !== "") {
                      md += `\n${headingPrefix} ${key.toUpperCase()}\n${value}\n`;
                  } else if (typeof value === 'object' && value !== null) {
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

    if (guildId) {
        const gConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
        if (gConfig) {
            try {
                const modules = JSON.parse(gConfig.activeModules) as any;
                if (modules.persona) personaData = modules.persona;
            } catch (e) {
                 console.error("Error parsing guild persona info:", e);
            }
        }
    }

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
          await LoggerService.debug(`[UserID: ${userId}] Message: "${messageContent}"`);

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
          const model = await geminiCore.getModel(guildId, 'chat');

          const chatSession = model.startChat({
              history: history as any,
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

           const model = await geminiCore.getModel(guildId, 'chat');
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
          const model = await geminiCore.getModel(guildId, 'chat');
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
          const model = await geminiCore.getModel(guildId, 'chat');
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

  // --- Search Tool ---
  public async chatWithSearch(userId: string, username: string, query: string, guildId: string = 'global'): Promise<{ success: boolean; response: string; error?: string }> {
      try {
           const systemInstruction = await this.getSystemPrompt(guildId, userId);
           
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

           const searchModel = await geminiCore.getModel(guildId, 'search');
           
           const chat = searchModel.startChat({
               history: history as any,
               systemInstruction: {
                 role: 'system',
                 parts: [{ text: systemInstruction }]
               }
           });
           
           const result = await retryWithBackoff(() => chat.sendMessage([{ text: query }]));
           const responseText = result.response.text();
           
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
          const model = await geminiCore.getModel(guildId, 'chat');
          
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

  private static readonly AUTO_REPLY_MOODS = [
      { mood: 'mỉa mai châm biếm', prompt: (name: string, msg: string) => `Thằng/con "${name}" vừa nhắn: "${msg}". Hãy mỉa mai nó bằng giọng khinh khỉnh, châm biếm cay độc kiểu "ồ thật bất ngờ, lại là mày à". Ngắn gọn, cay xè.` },
      { mood: 'cà khịa thô tục', prompt: (name: string, msg: string) => `"${name}" vừa tag chủ nhân và nhắn: "${msg}". Chửi nó bằng ngôn ngữ đường phố, tục tĩu cà khịa, kiểu "đm lại mày à, biến mẹ đi". Ngắn, sốc, bựa.` },
      { mood: 'khinh bỉ lạnh lùng', prompt: (name: string, msg: string) => `Có kẻ tên "${name}" dám quấy rối chủ nhân bằng tin nhắn: "${msg}". Hãy khinh bỉ nó bằng giọng lạnh tanh như thể nó là con ruồi vo ve. Một câu ngắn gọn thể hiện sự ghê tởm.` },
      { mood: 'đểu cáng giả ngây', prompt: (name: string, msg: string) => `"${name}" nhắn: "${msg}". Hãy giả vờ ngây thơ hỏi lại nhưng thực chất đang khịa rất sâu, kiểu "ơ mày nói cái gì? tao tưởng mày câm rồi". Đểu và cay.` },
      { mood: 'giang hồ chợ búa', prompt: (name: string, msg: string) => `Thằng "${name}" vừa nhắn: "${msg}". Đáp lại bằng giọng giang hồ chợ búa, dùng tiếng lóng đường phố, chửi thề tự nhiên như thở. Ngắn gọn, bặm trợn.` },
      { mood: 'toxic gamer', prompt: (name: string, msg: string) => `"${name}" vừa nhắn: "${msg}". Reply bằng giọng toxic gamer Việt Nam, kiểu "gg ez", "noob vl", "uninstall đi bro". Ngắn, bựa, cay.` },
      { mood: 'triết gia bựa', prompt: (name: string, msg: string) => `"${name}" nhắn: "${msg}". Hãy reply bằng giọng triết gia nhưng nội dung thực chất là đang chửi xéo, kiểu "Khổng Tử từng nói: thằng nào tag lung tung thằng đó ngu". Hài hước và cay.` },
      { mood: 'sếp toxic', prompt: (name: string, msg: string) => `Nhân viên tên "${name}" nhắn: "${msg}". Reply bằng giọng sếp toxic, kiểu "mày tag tao làm gì, đi làm việc đi, lương tháng này trừ". Ngắn, đểu, cay.` },
      { mood: 'rap diss', prompt: (name: string, msg: string) => `"${name}" vừa nhắn: "${msg}". Reply bằng 1-2 câu diss rap ngắn gọn, có vần, cà khịa thô tục kiểu battle rap Việt. Ngắn thôi.` },
      { mood: 'gen z sarcasm', prompt: (name: string, msg: string) => `"${name}" nhắn: "${msg}". Reply bằng giọng gen Z cực kỳ sarcastic, dùng từ lóng gen Z Việt Nam kiểu "real đấy", "slay quá bạn ei", "vibe check failed". Cà khịa nhẹ nhàng nhưng cay.` },
  ];

  public async generateAutoReply(messageContent: string, senderName: string, guildId?: string): Promise<string> {
      try {
          const randomMood = GeminiBotService.AUTO_REPLY_MOODS[Math.floor(Math.random() * GeminiBotService.AUTO_REPLY_MOODS.length)];
          const userPrompt = randomMood.prompt(senderName, messageContent);

          const baseSystemPrompt = process.env.AUTO_REPLY_PROMPT || "Mày là trợ lý thô lỗ. Luôn đuổi người khác đi.";
          const systemInstruction = `${baseSystemPrompt}\n\nMood hiện tại: ${randomMood.mood}.\nQuy tắc bổ sung:\n- PHẢI trả lời đa dạng, KHÔNG lặp lại pattern cũ.\n- Mỗi lần reply phải khác biệt hoàn toàn về cách diễn đạt.\n- Dùng từ ngữ tục tĩu đường phố tự nhiên (đm, vl, vcl, đéo, lol, wtf...).\n- Có thể xưng tao/mày, ông/thằng, bà/con.\n- Tối đa 1-2 câu ngắn, KHÔNG giải thích dài dòng.\n- KHÔNG lịch sự, KHÔNG xin lỗi, KHÔNG thân thiện.`;

          const autoReplyModel = await geminiCore.getModel(guildId, 'chat');
          const result = await retryWithBackoff(() => autoReplyModel.generateContent({
              systemInstruction,
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          }));

          return result.response.text();
      } catch (error: any) {
          const fallbacks = [
              "Biến mẹ đi.",
              "Đm tag cái gì tag, biến.",
              "Mày lại à? Cút.",
              "Ê đừng tag nữa, phiền vl.",
              "Lại mày? Tao mệt mày lắm rồi.",
          ];
          return fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
  }

  // --- PK Game Logic ---
  public async generatePKResponse(prompt: string, guildId?: string): Promise<any> {
      try {
           const pkModel = await geminiCore.getModel(guildId, 'logic', { ...GEMINI_LOGIC_CONFIG.generationConfig, responseMimeType: "application/json" });
           
           const result = await retryWithBackoff(() => pkModel.generateContent(prompt));
           const text = result.response.text();
           return JSON.parse(text);
      } catch (error: any) {
           console.error("PK Logic Error:", error);
           throw error;
      }
  }
}

export const geminiBotService = new GeminiBotService();

// Backward compatibility: re-export geminiCore methods + bot methods under one name
// This allows gradual migration without breaking existing imports
export const geminiService = {
    ...geminiCore,
    ...geminiBotService,
    // Explicitly bind methods to correct context
    getSystemPrompt: geminiBotService.getSystemPrompt.bind(geminiBotService),
    generateResponse: geminiBotService.generateResponse.bind(geminiBotService),
    generateAutoReply: geminiBotService.generateAutoReply.bind(geminiBotService),
    ImageToTextAI: geminiBotService.ImageToTextAI.bind(geminiBotService),
    VideoToTextAI: geminiBotService.VideoToTextAI.bind(geminiBotService),
    AudioToTextAI: geminiBotService.AudioToTextAI.bind(geminiBotService),
    chatWithSearch: geminiBotService.chatWithSearch.bind(geminiBotService),
    summarizeMessages: geminiBotService.summarizeMessages.bind(geminiBotService),
    generatePKResponse: geminiBotService.generatePKResponse.bind(geminiBotService),
    // Core methods
    getApiKey: geminiCore.getApiKey.bind(geminiCore),
    getModel: geminiCore.getModel.bind(geminiCore),
    generateText: geminiCore.generateText.bind(geminiCore),
    generateTextWithMedia: geminiCore.generateTextWithMedia.bind(geminiCore),
    generateJSON: geminiCore.generateJSON.bind(geminiCore),
    generateWithSearch: geminiCore.generateWithSearch.bind(geminiCore),
    generateImage: geminiCore.generateImage.bind(geminiCore),
    generateImageWithReference: geminiCore.generateImageWithReference.bind(geminiCore),
    generateImageWithKey: geminiCore.generateImageWithKey.bind(geminiCore),
    generateAudioWithContext: geminiCore.generateAudioWithContext.bind(geminiCore),
};
