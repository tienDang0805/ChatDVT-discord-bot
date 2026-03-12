import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { farmService } from '../services/farm';

export const data = new SlashCommandBuilder()
  .setName('farm')
  .setDescription('Đưa phân thân đi cày cuốc quái vật tĩnh để nhận kinh nghiệm và tiền xu');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const res = await farmService.farm(interaction.user.id);
  
  if (!res.success) {
      await interaction.editReply(res.message || "Có lỗi xảy ra.");
  } else {
      await interaction.editReply({ embeds: res.embeds });
  }
}
