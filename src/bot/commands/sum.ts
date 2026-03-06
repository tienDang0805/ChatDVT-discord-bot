import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { geminiService } from '../services/gemini';
import { LoggerService } from '../services/logger';

export const data = new SlashCommandBuilder()
  .setName('sum')
  .setDescription('Tóm tắt lại các tin nhắn gần đây trong kênh')
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Số lượng tin nhắn cần tóm tắt (Mặc định: 50, Tối đa: 100)')
      .setMinValue(5)
      .setMaxValue(100)
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
      return interaction.reply({ content: 'Lệnh này chỉ dùng được trong máy chủ.', ephemeral: true });
  }

  const limit = interaction.options.getInteger('limit') || 50;

  try {
      await interaction.deferReply(); // Phản hồi có thể mất hơn 3 giây
      
      const channel = interaction.channel as TextChannel;
      if (!channel || typeof channel.messages?.fetch !== 'function') {
           return interaction.editReply('Không thể đọc tin nhắn trong kênh này.');
      }

      let messages;
      try {
          messages = await channel.messages.fetch({ limit: limit + 1 }); // +1 the command itself
      } catch (fetchError) {
          console.error("Fetch Messages Error:", fetchError);
          return interaction.editReply('Bot không có quyền đọc lịch sử tin nhắn hoặc kênh này bị hạn chế.');
      }
      
      // Lọc bỏ tin nhắn của bot hoặc các tin nhắn hệ thống (tuỳ chọn)
      const validMessages = messages
          .filter(m => !m.content.startsWith('/') && m.content.trim() !== '') // Bỏ qua lệnh slash và tin nhắn rỗng
          .sort((a, b) => a.createdTimestamp - b.createdTimestamp); // Sắp xếp cũ -> mới

      if (validMessages.size === 0) {
          return interaction.editReply('Không tìm thấy đoạn chat nào có nghĩa để tóm tắt.');
      }

      // Format format log: "[TênNgườiDùng]: Nội dung"
      const formattedChat = validMessages.map(m => {
           const nickname = m.member?.nickname || m.author.displayName || m.author.username;
           return `[${nickname}]: ${m.cleanContent}`;
      }).join('\n');

      try {
          // Ghi nặc danh hoặc dùng an toàn
          await LoggerService.info(`Summing ${validMessages.size} messages by ${interaction.user.username}`);
      } catch (logErr) {
          console.error("Logger Error:", logErr);
      }

      const summary = await geminiService.summarizeMessages(interaction.guildId, interaction.user.id, formattedChat);

      let safeSummary = summary;
      if (!safeSummary || safeSummary.trim() === '') {
          safeSummary = 'Tôi không thể tóm tắt đoạn hội thoại này.';
      } else if (safeSummary.length > 2000) {
          safeSummary = safeSummary.substring(0, 1995) + '...';
      }

      await interaction.editReply({ content: safeSummary });

  } catch (error) {
      console.error(error);
      await interaction.editReply({
          content: 'Đã xảy ra lỗi trong quá trình lấy tin nhắn hoặc tóm tắt. Vui lòng thử lại sau.'
      });
  }
}
