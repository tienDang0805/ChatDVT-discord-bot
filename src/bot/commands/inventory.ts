import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { shopService } from '../services/shop';

export const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('Xem túi đồ và số dư của bạn');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const res = await shopService.getInventory(interaction.user.id);
  await interaction.editReply(res);
}
