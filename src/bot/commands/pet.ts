import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { petService } from '../services/pet';

export const data = new SlashCommandBuilder()
  .setName('pet')
  .setDescription('Hệ thống thú cưng AI')
  .addSubcommand(sub => 
      sub.setName('hatch')
         .setDescription('Ấp trứng nhận pet mới')
  )
  .addSubcommand(sub =>
      sub.setName('list')
         .setDescription('Xem danh sách pet của bạn')
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'hatch') {
      await interaction.deferReply();
      await petService.beginHatchingProcess(interaction);
  } else if (subcommand === 'list') {
      await interaction.deferReply();
      const res = await petService.showPetList(interaction);
      if (res.content) await interaction.editReply(res.content);
      else if (res.embeds) await interaction.editReply({ embeds: res.embeds });
  }
}
