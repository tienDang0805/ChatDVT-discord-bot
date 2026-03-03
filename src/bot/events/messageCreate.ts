import { Events, Message, ChannelType } from 'discord.js';
import { bot } from '../client';
import { geminiService } from '../services/gemini';
import { pkGameService } from '../services/pk';
import { prisma } from '../../database/prisma';
import { LoggerService } from '../services/logger';

const IGNORE_PREFIXES = ['!', '/', '-'];

export const messageCreate = async (message: Message) => {
  if (message.author.bot) return;

  // --- LEGACY LOGIC RESTORATION ---
  const lowerContent = message.content.toLowerCase();
  if (lowerContent === 'hi' || lowerContent === 'hello' || lowerContent === 'hé lô') {
      try {
           await message.reply('hi cái lồn má mày');
           return;
      } catch (e) {
          console.error("Error sending legacy reply:", e);
      }
  }
  // --------------------------------

  if (IGNORE_PREFIXES.some(prefix => message.content.startsWith(prefix))) return;
  if (!message.guild) return;

  const isMentioned = message.mentions.has(bot.user!) || 
                      (message.reference && message.type === 19 && message.mentions.has(bot.user!) );

  if (!isMentioned && !message.content.includes(bot.user!.id)) {
      return;
  }

  if (message.guild && message.channel.type === ChannelType.GuildText) {
      const permissions = message.channel.permissionsFor(bot.user!);
      if (!permissions?.has('SendMessages') || !permissions?.has('ViewChannel')) {
        await LoggerService.warn(`[MessageCreate] Missing permissions in channel ${message.channel.id}`, { guild: message.guild.id });
        return;
      }
  }

  let cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();
  if (!cleanContent) return;

  if (message.channel && message.channel.type === ChannelType.GuildText) {
       await message.channel.sendTyping();
  } else if ('sendTyping' in message.channel) {
       await (message.channel as any).sendTyping();
  }

  // --- PK GAME LOGIC ---
  if (pkGameService.isGameActive(message.guild.id)) {
     const isCommand = IGNORE_PREFIXES.some(prefix => message.content.startsWith(prefix));
     if (!isCommand) {
         if (message.content.trim().length > 0) {
             const res = await pkGameService.processTurn(message.guild.id, message.author, message.content);
             if (res.success) {
                 await message.reply(res.message);
                 return;
             } else if (res.message.includes("Chưa đến lượt")) {
                 // Silent
             }
         }
     }
  }
  // ---------------------

  try {
    // 1. Get Guild Config (Optional check, mainly for active modules if we implemented them)
    // const config = await prisma.guildConfig.findUnique({ where: { guildId: message.guild.id } });
    
    // 2. Identify Request Type
    let responseText = '';
    const attachment = message.attachments.first();

    if (attachment) {
      if (attachment.contentType?.startsWith('image/')) {
        responseText = await geminiService.ImageToTextAI(
            message.guild.id, 
            message.author.id, 
            attachment.url, 
            cleanContent
        );
      } else if (attachment.contentType?.startsWith('video/') || attachment.contentType === 'application/octet-stream') {
         responseText = await geminiService.VideoToTextAI(
            message.guild.id, 
            message.author.id, 
            attachment.url, 
            cleanContent
        );
      } else {
          responseText = await geminiService.generateResponse(
            message.guild.id, 
            message.author.id, 
            message.author.username, 
            cleanContent,
            message
          );
      }
    } else {
        responseText = await geminiService.generateResponse(
            message.guild.id, 
            message.author.id, 
            message.author.username, 
            cleanContent,
            message
        );
    }

    // 3. Send Response
    if (responseText) {
       await LoggerService.info(`Sending response`, { channel: message.channel.id, length: responseText.length });
       const API_LIMIT = 1900;
       
       if (responseText.length <= API_LIMIT) {
           await message.reply({ content: responseText, allowedMentions: { repliedUser: false } });
       } else {
           const chunks: string[] = [];
           for (let i = 0; i < responseText.length; i += API_LIMIT) {
               chunks.push(responseText.substring(i, i + API_LIMIT));
           }

           // Gửi tin nhắn đầu tiên bằng reply (giữ Thread Context)
           const firstMessage = await message.reply({ content: chunks[0], allowedMentions: { repliedUser: false } });

           // Gửi các tin nhắn tiếp theo nối tiếp nhau
           for (let i = 1; i < chunks.length; i++) {
               if ('send' in firstMessage.channel) {
                   await (firstMessage.channel as any).send(chunks[i]);
               }
           }
       }
    } else {
        await LoggerService.warn(`[MessageCreate] Empty responseText received from GeminiService.`);
    }

  } catch (error) {
    console.error('Message Event Error:', error);
  }
};
