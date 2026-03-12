import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { shopService } from '../services/shop';

export const data = new SlashCommandBuilder()
  .setName('buy')
  .setDescription('Mua vật phẩm từ cửa hàng')
  .addStringOption(option => 
      option.setName('item_id')
          .setDescription('ID của vật phẩm muốn mua')
          .setRequired(true))
  .addIntegerOption(option => 
      option.setName('quantity')
          .setDescription('Số lượng muốn mua')
          .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const itemId = interaction.options.getString('item_id', true);
  const quantity = interaction.options.getInteger('quantity') || 1;

  await interaction.deferReply();
  const res = await shopService.buyItem(interaction.user.id, itemId, quantity);
  await interaction.editReply(res.message);
}
