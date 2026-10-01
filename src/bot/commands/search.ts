import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { geminiService } from '../services/gemini';
import { LoggerService } from '../services/logger';

const DISCORD_MESSAGE_LIMIT = 1900;

function splitResponse(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > DISCORD_MESSAGE_LIMIT) {
    let splitAt = remaining.lastIndexOf('\n', DISCORD_MESSAGE_LIMIT);
    if (splitAt < DISCORD_MESSAGE_LIMIT * 0.6) {
      splitAt = remaining.lastIndexOf(' ', DISCORD_MESSAGE_LIMIT);
    }
    if (splitAt <= 0) splitAt = DISCORD_MESSAGE_LIMIT;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

function formatSources(sources: Array<{ title: string; uri: string }>): string {
  if (!sources.length) return '';

  const lines = sources.slice(0, 3).map((source, index) => {
    const title = source.title.replace(/[\r\n]/g, ' ').slice(0, 100) || `Nguồn ${index + 1}`;
    return `${index + 1}. ${title} — <${source.uri}>`;
  });

  return `\n\n**Nguồn:**\n${lines.join('\n')}`;
}

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Tìm thông tin mới nhất trên Google bằng Gemini')
  .addStringOption(option =>
    option
      .setName('query')
      .setDescription('Nội dung cần tìm kiếm')
      .setMinLength(2)
      .setMaxLength(1000)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: 'Lệnh `/search` hiện chỉ dùng được trong máy chủ Discord.',
      ephemeral: true,
    });
    return;
  }

  const query = interaction.options.getString('query', true).trim();
  await interaction.deferReply();

  try {
    await LoggerService.info('Gemini Google Search requested', {
      guildId: interaction.guildId,
      userId: interaction.user.id,
      queryLength: query.length,
    });

    const result = await geminiService.chatWithSearch(
      interaction.user.id,
      interaction.user.username,
      query,
      interaction.guildId
    );

    if (!result.success || !result.response.trim()) {
      await interaction.editReply('Không tìm được kết quả lúc này. Thử lại sau nhé.');
      return;
    }

    const response = `${result.response}${formatSources(result.sources || [])}`;
    const chunks = splitResponse(response);
    await interaction.editReply(chunks[0]);

    for (const chunk of chunks.slice(1)) {
      await interaction.followUp({ content: chunk });
    }
  } catch (error: any) {
    console.error('Search Command Error:', error);
    await interaction.editReply('Google Search của Gemini đang gặp sự cố. Thử lại sau nhé!');
  }
}
