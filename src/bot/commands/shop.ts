import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { shopService } from '../services/shop';

export const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('Mở hệ thống cửa hàng đa vũ');

export async function execute(interaction: ChatInputCommandInteraction) {
  const result = await shopService.showShop(interaction);
  await interaction.reply(result);
}
