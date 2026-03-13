import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { journeyService } from '../services/journey';

export const data = new SlashCommandBuilder()
  .setName('journey')
  .setDescription('Cử sinh vật đi du ngoạn để tìm kiếm Coin và vật phẩm hiếm');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  
  const userId = interaction.user.id;
  
  try {
      const result = await journeyService.goOnJourney(userId);
      if (!result.success) {
          await interaction.editReply(result.message!);
      } else {
          await interaction.editReply({ embeds: [result.embed!] });
      }
  } catch (error) {
      console.error("Journey Error:", error);
      await interaction.editReply('❌ Có lỗi tựa game. Không thể cử sinh vật đi du ngoạn lúc này.');
  }
}
