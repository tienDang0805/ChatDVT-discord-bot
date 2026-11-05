import { Part } from '@google/generative-ai';
import { cleanContent } from 'discord.js';
import axios from 'axios';
import { GEMINI_LOGIC_CONFIG, DEFAULT_SYSTEM_PROMPT } from '../../config/constants';
import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { LoggerService } from './logger';
import { geminiCore, retryWithBackoff, WebChatHistoryMessage } from '../../shared/services/gemini-core';

// Helper to escape markdown
function escapeMarkdown(text: string): string {
    if (text.startsWith('```') && text.endsWith('```')) return text;
    return text.replace(/(^|\s)(\*|_|~|`|>|\||#)(?=\s|$)/g, '$1\\$2');
}

const PROMPT_CACHE_TTL_MS = 2 * 60 * 1000;
const DISCORD_HISTORY_TAKE = 12;
const MAX_HISTORY_TURN_CHARS = 800;

function buildSanitizedHistory(
    logs: Array<{ username?: string | null; content?: string | null; response?: string | null }>,
    maxChars = MAX_HISTORY_TURN_CHARS,
): WebChatHistoryMessage[] {
    const raw: WebChatHistoryMessage[] = [];
    for (const log of [...logs].reverse()) {
        if (log.content && log.content.trim() !== '') {
            const userPrefix = log.username ? `[${log.username}]: ` : '';
            const text = `${userPrefix}${log.content.trim()}`;
            raw.push({
                role: 'user',
                content: text.length > maxChars ? `${text.slice(0, maxChars)}...` : text,
            });
        }
        if (log.response && log.response.trim() !== '') {
            const resp = log.response.trim();
            raw.push({
                role: 'model',
                content: resp.length > maxChars ? `${resp.slice(0, maxChars)}...` : resp,
            });
        }
    }

    const valid: WebChatHistoryMessage[] = [];
    for (const item of raw) {
        if (valid.length === 0) {
            if (item.role === 'user') valid.push(item);
        } else if (item.role !== valid[valid.length - 1].role) {
            valid.push(item);
        } else {
            valid[valid.length - 1].content = `${valid[valid.length - 1].content}\n${item.content}`.slice(0, maxChars);
        }
    }
    if (valid.length > 0 && valid[valid.length - 1].role === 'user') {
        valid.pop();
    }
    return valid;
}

class GeminiBotService {
  private promptConfigCache = new Map<string, { value: string; timestamp: number }>();

  constructor() {}

  public invalidatePromptCache(guildId?: string) {
      if (!guildId) {
          this.promptConfigCache.clear();
          return;
      }
      for (const key of this.promptConfigCache.keys()) {
          if (key.startsWith(`${guildId}:`)) {
              this.promptConfigCache.delete(key);
          }
      }
  }

  // --- Dynamic System Prompt ---
  public async getSystemPrompt(guildId: string, userId: string, feature: string = 'global'): Promise<string> {
    const baseCacheKey = `${guildId || 'global'}:${feature}`;
    const cachedBase = this.promptConfigCache.get(baseCacheKey);
    const [{ nickname, signature }, baseCompiledPrompt] = await Promise.all([
        userIdentityService.getIdentityForPrompt(userId),
        cachedBase && Date.now() - cachedBase.timestamp < PROMPT_CACHE_TTL_MS
            ? Promise.resolve(cachedBase.value)
            : this.compileBaseGuildPrompt(guildId, feature).then((compiled) => {
                  this.promptConfigCache.set(baseCacheKey, { value: compiled, timestamp: Date.now() });
                  return compiled;
              }),
    ]);

    let userContext = `\n\n# THÔNG TIN NGƯỜI DÙNG\nUser ID: ${userId}`;
    if (nickname) userContext += `\nBiệt danh: ${nickname} (Hãy gọi họ bằng tên này)`;
    if (signature) userContext += `\nBio: ${signature}`;

    const coreRules = `\n# CÁC QUY TẮC BẤT BIẾN:\n${process.env.CORE_RULES || ''}`;
    return `${baseCompiledPrompt}\n${userContext}\n${coreRules}`;
  }

  private async compileBaseGuildPrompt(guildId: string, feature: string): Promise<string> {
    let finalPromptData: any = null;
    let personaData: any = null;

    const [guildConfig, globalBotConfig, personaBotConfig] = await Promise.all([
        guildId ? prisma.guildConfig.findUnique({ where: { guildId } }) : Promise.resolve(null),
        prisma.botConfig.findUnique({ where: { key: 'global' } }),
        prisma.botConfig.findUnique({ where: { key: 'persona' } }),
    ]);

    // 1. Check Guild Config
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
        try {
            const modules = JSON.parse(guildConfig.activeModules) as any;
            if (modules && modules.persona) personaData = modules.persona;
        } catch (e) {
            console.error("Error parsing guild persona info:", e);
        }
    }

    // 2. Fallback to Global Bot Config
    if (!finalPromptData) {
        let globalConfig = globalBotConfig;
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
    let personaContext = "";

    if (!personaData) {
        const personaConfig = personaBotConfig;
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

    return `${compiledPromptText}${personaContext}`;
  }

  // --- Chat Logic ---
  public async generateResponse(guildId: string, userId: string, username: string, messageContent: string, message?: any): Promise<string> {
      try {
          void LoggerService.debug(`[UserID: ${userId}] Message: "${messageContent}"`).catch(() => {});

          const [systemInstruction, logs] = await Promise.all([
              this.getSystemPrompt(guildId, userId),
              prisma.chatLog.findMany({
                  where: { guildId },
                  orderBy: { createdAt: 'desc' },
                  take: DISCORD_HISTORY_TAKE,
              }),
          ]);

          const sanitizedHistory = buildSanitizedHistory(logs);
          let responseText = '';

          try {
              const fallbackResult = await geminiCore.generateWebChatWithFallback({
                  message: `[${username}]: ${messageContent}`,
                  history: sanitizedHistory,
                  systemInstruction,
                  guildId,
                  maxOutputTokens: 2048,
                  temperature: 1.0,
              });
              responseText = fallbackResult.text;
          } catch (fallbackErr) {
              console.warn('[DiscordChat] Multi-model fallback failed, trying legacy chatSession:', fallbackErr);
              const parts: Part[] = [{ text: messageContent }];
              const model = await geminiCore.getModel(guildId, 'chat');
              const chatSession = model.startChat({
                  history: sanitizedHistory.map(h => ({ role: h.role, parts: [{ text: h.content }] })) as any,
                  systemInstruction: {
                      role: 'system',
                      parts: [{ text: systemInstruction }],
                  },
              });
              const result = await retryWithBackoff(() => chatSession.sendMessage(parts));
              responseText = result.response.text();
          }

          void LoggerService.info(`Generative Response Success`, { length: responseText.length, preview: responseText.substring(0, 50) }).catch(() => {});
          
          let cleanResponse = responseText;
          if (message && message.channel) {
              cleanResponse = cleanContent(responseText, message.channel);
          }

          void prisma.chatLog.create({
              data: {
                guildId, userId, username, content: messageContent, response: cleanResponse, type: 'chat'
              }
          }).catch((e) => console.error('[ChatLog] Failed to persist chat log:', e));

          return cleanResponse;
      } catch (error: any) {
          void LoggerService.error("Gemini Chat Error", error).catch(() => {});
          if (error.message?.includes('503')) return "Server AI đang quá tải, vui lòng thử lại sau 1 chút.";
          return "Xin lỗi, tôi đang gặp sự cố kết nối với não bộ.";
      }
  }

  private decodeTextBuffer(buffer: Buffer): string {
      if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
          return buffer.subarray(2).toString('utf16le');
      }
      if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
          const copy = Buffer.from(buffer.subarray(2));
          copy.swap16();
          return copy.toString('utf16le');
      }
      return buffer.toString('utf-8').replace(/^\uFEFF/, '');
  }

  public async TextFileToTextAI(
      guildId: string,
      userId: string,
      username: string,
      files: Array<{ name: string; url: string }>,
      caption: string = "",
      message?: any
  ): Promise<string> {
      try {
          const MAX_FILE_CHARS = 100000;
          const loadedFiles: Array<{ name: string; content: string }> = [];

          for (const file of files) {
              const response = await axios.get(file.url, { responseType: 'arraybuffer', timeout: 15000 });
              const rawText = this.decodeTextBuffer(Buffer.from(response.data)).trim();
              const truncatedText = rawText.length > MAX_FILE_CHARS
                  ? `${rawText.slice(0, MAX_FILE_CHARS)}\n[...Nội dung đã được cắt bớt do vượt quá giới hạn độ dài...]`
                  : rawText;
              loadedFiles.push({
                  name: file.name || 'file.txt',
                  content: truncatedText || '[File trống]'
              });
          }

          const [systemInstruction, logs] = await Promise.all([
              this.getSystemPrompt(guildId, userId),
              prisma.chatLog.findMany({
                  where: { guildId },
                  orderBy: { createdAt: 'desc' },
                  take: DISCORD_HISTORY_TAKE,
              }),
          ]);

          const sanitizedHistory = buildSanitizedHistory(logs);

          const userInstruction = caption.trim() || "Hãy đọc và phân tích nội dung file văn bản đính kèm dưới đây.";
          const formattedFiles = loadedFiles
              .map(f => `--- BẮT ĐẦU FILE: ${f.name} ---\n${f.content}\n--- KẾT THÚC FILE: ${f.name} ---`)
              .join('\n\n');
          const fullPrompt = `${userInstruction}\n\n${formattedFiles}`;

          const fallbackResult = await geminiCore.generateWebChatWithFallback({
              message: fullPrompt,
              history: sanitizedHistory,
              systemInstruction,
              guildId,
              maxOutputTokens: 2048,
              temperature: 0.9,
          });
          const responseText = fallbackResult.text;

          let cleanResponse = responseText;
          if (message && message.channel) {
              cleanResponse = cleanContent(responseText, message.channel);
          }

          const fileNames = loadedFiles.map(f => f.name).join(', ');
          const preview = loadedFiles[0]?.content.slice(0, 1000) || '';
          const logContent = `[FILE: ${fileNames}] ${userInstruction}\n${preview}`.trim();

          void prisma.chatLog.create({
              data: {
                  guildId,
                  userId,
                  username,
                  content: logContent,
                  response: cleanResponse,
                  type: 'chat'
              }
          }).catch((e) => console.error('[ChatLog] Failed to persist file chat log:', e));

          return cleanResponse;
      } catch (error: any) {
          void LoggerService.error("Text File Analysis Error", error).catch(() => {});
          if (error.message?.includes('503')) return "Server AI đang quá tải, vui lòng thử lại sau 1 chút.";
          return `Xin lỗi, tôi gặp lỗi khi đọc file văn bản: ${error.message}`;
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
  public async chatWithSearch(
      userId: string,
      username: string,
      query: string,
      guildId: string = 'global'
  ): Promise<{
      success: boolean;
      response: string;
      sources?: Array<{ title: string; uri: string }>;
      error?: string;
  }> {
      try {
           const systemInstruction = await this.getSystemPrompt(guildId, userId);

           // Keep search context scoped to the current user. Guild-wide history can
           // leak another member's prompt or a previous malformed tool response.
           const logs = await prisma.chatLog.findMany({
               where: { guildId, userId },
               orderBy: { createdAt: 'desc' },
               take: 8
           });

           const recentContext = logs
               .reverse()
               .flatMap(log => {
                   const entries: string[] = [];
                   if (log.content) entries.push(`Người dùng: ${log.content}`);
                   if (log.response && !/^\s*\/tool\b/i.test(log.response)) {
                       entries.push(`Trợ lý: ${log.response}`);
                   }
                   return entries;
               })
               .join('\n');

           const prompt = `${systemInstruction}

Bạn đang thực hiện một yêu cầu tìm kiếm Google cho người dùng Discord tên ${username}.
${recentContext ? `Ngữ cảnh gần đây của riêng người dùng này:\n${recentContext}\n` : ''}
Yêu cầu hiện tại: ${query}

Hãy dùng Google Search để kiểm tra thông tin và trả lời câu hỏi hiện tại. Chỉ trả về câu trả lời cuối cùng dành cho người dùng. Tuyệt đối không in cú pháp gọi công cụ, function call, JSON nội bộ hoặc chuỗi bắt đầu bằng /tool.`;

           // Use the current @google/genai grounding API. The legacy SDK could
           // serialize a Google Search tool call as visible text (for example /tool ...).
           const result = await geminiCore.generateWithSearch(prompt, guildId);
           const responseText = result.text.trim();

           if (!responseText || /^\/tool\b/i.test(responseText)) {
               throw new Error('Gemini returned an internal tool call instead of a final response');
           }

           const sources = result.sources
               .map((source: any) => ({
                   title: String(source?.web?.title || source?.web?.uri || '').trim(),
                   uri: String(source?.web?.uri || '').trim(),
               }))
               .filter((source: { title: string; uri: string }) => source.uri)
               .filter((source: { title: string; uri: string }, index: number, all: Array<{ title: string; uri: string }>) =>
                   all.findIndex(item => item.uri === source.uri) === index
               )
               .slice(0, 5);
           
           await prisma.chatLog.create({
               data: {
                 guildId, userId, username, content: `[SEARCH] ${query}`, response: responseText, type: 'search'
               }
           });

           return { success: true, response: responseText, sources };
      } catch (error: any) {
          console.error("Search Error:", error);
          return { success: false, response: "", error: error.message };
      }
  }

  // --- Summarize Messages ---
  public async summarizeMessages(guildId: string, userId: string, messagesText: string): Promise<string> {
      try {
          const systemInstruction = await this.getSystemPrompt(guildId, userId);
          
          const prompt = `Dưới đây là một cuộc hội thoại gần đây trong nhóm:\n\n${messagesText}\n\nHãy đọc kỹ và tóm tắt lại nội dung chính của cuộc trò chuyện trên một cách ngắn gọn, súc tích và dễ hiểu nhất. Vui lòng giữ đúng nhân cách và giọng điệu của bạn (dựa theo các luật lệ và phần mô tả nhân cách ở trên) khi trả lời.`;

          const result = await geminiCore.generateWebChatWithFallback({
              message: prompt,
              history: [],
              systemInstruction,
              guildId,
              maxOutputTokens: 1500,
              temperature: 0.8,
          });

          return result.text;
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
          
          const result = await geminiCore.generateWebChatWithFallback({
              message: userPrompt,
              history: [],
              systemInstruction,
              guildId,
              maxOutputTokens: 256,
              temperature: 1.0,
          });
          
          return result.text;
      } catch (error: any) {
          return "Biến đi.";
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
    invalidatePromptCache: geminiBotService.invalidatePromptCache.bind(geminiBotService),
    getSystemPrompt: geminiBotService.getSystemPrompt.bind(geminiBotService),
    generateResponse: geminiBotService.generateResponse.bind(geminiBotService),
    generateAutoReply: geminiBotService.generateAutoReply.bind(geminiBotService),
    TextFileToTextAI: geminiBotService.TextFileToTextAI.bind(geminiBotService),
    ImageToTextAI: geminiBotService.ImageToTextAI.bind(geminiBotService),
    VideoToTextAI: geminiBotService.VideoToTextAI.bind(geminiBotService),
    AudioToTextAI: geminiBotService.AudioToTextAI.bind(geminiBotService),
    chatWithSearch: geminiBotService.chatWithSearch.bind(geminiBotService),
    summarizeMessages: geminiBotService.summarizeMessages.bind(geminiBotService),
    generatePKResponse: geminiBotService.generatePKResponse.bind(geminiBotService),
    // Core methods
    invalidateApiKeyCache: geminiCore.invalidateApiKeyCache.bind(geminiCore),
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
