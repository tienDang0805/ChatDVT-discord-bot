import { Events, Message, ChannelType, Attachment } from 'discord.js';
import { bot } from '../client';
import { geminiService } from '../services/gemini';
import { prisma } from '../../database/prisma';
import { LoggerService } from '../services/logger';
import { ADMIN_ID } from '../../config/constants';
import { cuongGiaService } from '../services/cuong-gia';

const IGNORE_PREFIXES = ['!', '/', '-'];
const TEXT_FILE_REGEX = /\.(txt|md|csv|json|log|xml|yaml|yml|ini|conf|cfg|js|ts|jsx|tsx|py|java|c|cpp|h|cs|go|rs|php|rb|html|htm|css|scss|sql|sh|bat|ps1|env|toml)$/i;
const IMAGE_FILE_REGEX = /\.(png|jpe?g|gif|webp)$/i;
const VIDEO_FILE_REGEX = /\.(mp4|webm|mov)$/i;

function getAttachmentFileName(attachment: Attachment): string {
  return (attachment.name || attachment.url.split('?')[0] || '').toLowerCase();
}

function isImageAttachment(attachment: Attachment): boolean {
  const contentType = (attachment.contentType || '').toLowerCase();
  return contentType.startsWith('image/') || IMAGE_FILE_REGEX.test(getAttachmentFileName(attachment));
}

function isVideoAttachment(attachment: Attachment): boolean {
  const contentType = (attachment.contentType || '').toLowerCase();
  return contentType.startsWith('video/') || VIDEO_FILE_REGEX.test(getAttachmentFileName(attachment));
}

function isTextAttachment(attachment: Attachment): boolean {
  const contentType = (attachment.contentType || '').toLowerCase();
  return (
    contentType.startsWith('text/') ||
    contentType.includes('json') ||
    contentType.includes('xml') ||
    contentType.includes('javascript') ||
    contentType.includes('csv') ||
    TEXT_FILE_REGEX.test(getAttachmentFileName(attachment))
  );
}

export const messageCreate = async (message: Message) => {
  if (message.author.bot) return;

  if (message.guild) {
    void cuongGiaService.trackMessage(message).catch((error) => {
      console.error('[CuongGia] Failed to track message activity:', error);
    });
  }

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

  if (ADMIN_ID && message.mentions.users.has(ADMIN_ID)) {
      try {
          if ('sendTyping' in message.channel) await message.channel.sendTyping();
          const replyContent = await geminiService.generateAutoReply(
              message.content,
              message.author.username,
              message.guild?.id
          );
          await message.reply(replyContent);
          return;
      } catch (error) {
          console.error("Lỗi Auto-reply:", error);
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

  let attachments = Array.from(message.attachments.values());
  if (attachments.length === 0 && message.reference?.messageId) {
      const referencedMessage = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (referencedMessage && referencedMessage.attachments.size > 0) {
          attachments = Array.from(referencedMessage.attachments.values());
      }
  }

  if (!cleanContent && attachments.length === 0) return;

  if (message.channel && message.channel.type === ChannelType.GuildText) {
       await message.channel.sendTyping();
  } else if ('sendTyping' in message.channel) {
       await (message.channel as any).sendTyping();
  }

  try {
    let responseText = '';
    const textAttachments = attachments.filter(isTextAttachment);
    const imageAttachment = attachments.find(isImageAttachment);
    const videoAttachment = attachments.find(isVideoAttachment);

    if (textAttachments.length > 0) {
      responseText = await geminiService.TextFileToTextAI(
          message.guild.id,
          message.author.id,
          message.author.username,
          textAttachments.map(att => ({
            name: att.name || 'file.txt',
            url: att.url
          })),
          cleanContent,
          message
      );
    } else if (imageAttachment) {
      responseText = await geminiService.ImageToTextAI(
          message.guild.id, 
          message.author.id, 
          imageAttachment.url, 
          cleanContent
      );
    } else if (videoAttachment) {
      responseText = await geminiService.VideoToTextAI(
          message.guild.id, 
          message.author.id, 
          videoAttachment.url, 
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
