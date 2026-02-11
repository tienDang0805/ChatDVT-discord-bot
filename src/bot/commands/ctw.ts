import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ctwService } from '../services/ctw';

export const data = new SlashCommandBuilder()
  .setName('ctw')
  .setDescription('Đuổi Hình Bắt Chữ AI')
  .addSubcommand(sub => 
      sub.setName('start')
         .setDescription('Bắt đầu game')
         .addStringOption(opt => opt.setName('topic').setDescription('Chủ đề').setRequired(false))
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  const guildId = interaction.guildId;
  if (!guildId) return interaction.reply("Lệnh này chỉ dùng trong server.");

  if (subcommand === 'start') {
      const topic = interaction.options.getString('topic') || "Tổng hợp";
      await interaction.reply(`Khởi động CTW chủ đề: ${topic}...`);
      
      const res = await ctwService.startGame(guildId, interaction.channel, interaction.user.id, 5, 20, "Trung bình", topic);
      if (!res.success) await interaction.followUp(res.message);
  }
}
