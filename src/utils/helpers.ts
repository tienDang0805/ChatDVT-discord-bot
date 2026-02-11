import { Message } from 'discord.js';
import { bot } from '../bot/client';

export async function isReplyingToBot(message: Message): Promise<boolean> {
  try {
    if (!message.reference || !message.reference.messageId) return false;
    const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
    return referencedMessage.author.id === bot.user?.id;
  } catch {
    return false;
  }
}
