import { SlashCommandBuilder, ChatInputCommandInteraction, User } from 'discord.js';
import { pkGameService } from '../services/pk';

export const data = new SlashCommandBuilder()
  .setName('pk')
  .setDescription('Thách đấu Pet với người chơi khác')
  .addUserOption(option => 
      option.setName('target')
          .setDescription('Người chơi bạn muốn thách đấu')
          .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('target', true);

  if (targetUser.id === interaction.user.id) {
      await interaction.reply({ content: "❌ Bạn không thể tự thách đấu với chính mình!", ephemeral: true });
      return;
  }
  if (targetUser.bot) {
      await interaction.reply({ content: "❌ Bạn không thể thách đấu với Bot!", ephemeral: true });
      return;
  }

  await interaction.deferReply();
  const res = await pkGameService.simulateBattle(interaction.user.id, targetUser.id);
  
  if (!res.success) {
      await interaction.editReply(res.message || "Có lỗi xảy ra.");
  } else {
      await interaction.editReply({ embeds: res.embeds });
  }
}
