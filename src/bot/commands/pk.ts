import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { pkService } from '../services/pk';

export const data = new SlashCommandBuilder()
  .setName('pk')
  .setDescription('Thách đấu Pet với người chơi khác (Gõ không để Auto-Match 5 lần)!')
  .addUserOption(option =>
      option.setName('target')
          .setDescription('Người chơi bạn muốn thách đấu (Bỏ trống để quẩy ngẫu nhiên)')
          .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('target', false);

  if (targetUser) {
      if (targetUser.id === interaction.user.id) {
          await interaction.reply({ content: '❌ Không thể tự thách đấu với chính mình!', ephemeral: true });
          return;
      }
      if (targetUser.bot) {
          await interaction.reply({ content: '❌ Không thể thách đấu với Bot!', ephemeral: true });
          return;
      }
  }

  await interaction.deferReply();
  
  if (targetUser) {
      await pkService.startBattle(interaction, targetUser.id);
  } else {
      await pkService.autoChain(interaction);
  }
}
