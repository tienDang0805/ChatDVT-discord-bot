import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { towerService } from '../services/tower';

export const data = new SlashCommandBuilder()
  .setName('tower')
  .setDescription('Leo Tháp Thử Thách — 10 tầng, thưởng tăng dần! (Cooldown 12 giờ)');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  await towerService.climb(interaction);
}
