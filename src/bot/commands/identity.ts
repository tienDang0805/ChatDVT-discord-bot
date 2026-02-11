import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { userIdentityService } from '../services/identity';

export const data = new SlashCommandBuilder()
  .setName('identity')
  .setDescription('Quản lý danh tính của bạn')
  .addSubcommand(sub => 
      sub.setName('menu')
         .setDescription('Mở menu danh tính')
  )
  .addSubcommand(sub =>
      sub.setName('view')
         .setDescription('Xem danh tính người khác')
         .addUserOption(opt => opt.setName('user').setDescription('Người dùng').setRequired(true))
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'menu') {
      const menu = await userIdentityService.showIdentityMenu(interaction);
      await interaction.reply(menu);
  } else if (subcommand === 'view') {
      const targetUser = interaction.options.getUser('user');
      if (targetUser) {
          const view = await userIdentityService.viewOtherUserIdentity(interaction, targetUser.id);
          await interaction.reply(view);
      }
  }
}
