import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { shopService } from '../services/shop';

export const data = new SlashCommandBuilder()
  .setName('sell')
  .setDescription('Bán vật phẩm trong túi đồ lấy Coin')
  .addStringOption(option => 
      option.setName('item_id')
          .setDescription('ID của vật phẩm muốn bán')
          .setRequired(true))
  .addIntegerOption(option => 
      option.setName('quantity')
          .setDescription('Số lượng muốn bán')
          .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const itemId = interaction.options.getString('item_id', true);
  const quantity = interaction.options.getInteger('quantity') || 1;

  await interaction.deferReply();
  const res = await shopService.sellItem(interaction.user.id, itemId, quantity);
  await interaction.editReply(res.message);
}
