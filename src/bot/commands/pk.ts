import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { pkGameService } from '../services/pk';

export const data = new SlashCommandBuilder()
  .setName('pk')
  .setDescription('Game Đối Kháng Giọng Nói')
  .addSubcommand(sub => sub.setName('start').setDescription('Tạo phòng đấu mới'))
  .addSubcommand(sub => sub.setName('join').setDescription('Tham gia phòng đấu'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'start') {
      if (!interaction.guildId) return;
      const res = pkGameService.startNewGame(interaction.guildId);
      await interaction.reply({ content: res.message, ephemeral: !res.success });
  } 
  else if (subcommand === 'join') {
      if (!interaction.guildId) return;
      const res = pkGameService.joinGame(interaction.guildId, interaction.user);
      await interaction.reply({ content: res.message, ephemeral: !res.success });
  }
}
