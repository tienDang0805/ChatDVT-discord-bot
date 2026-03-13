import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { pkService } from '../services/pk';

export const data = new SlashCommandBuilder()
  .setName('pk')
  .setDescription('Thách đấu Pet theo lượt — chọn kỹ năng như Pokémon!')
  .addUserOption(option =>
      option.setName('target')
          .setDescription('Người chơi bạn muốn thách đấu')
          .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('target', true);

  if (targetUser.id === interaction.user.id) {
      await interaction.reply({ content: '❌ Không thể tự thách đấu với chính mình!', ephemeral: true });
      return;
  }
  if (targetUser.bot) {
      await interaction.reply({ content: '❌ Không thể thách đấu với Bot!', ephemeral: true });
      return;
  }

  await interaction.deferReply();
  await pkService.startBattle(interaction, targetUser.id);
}
