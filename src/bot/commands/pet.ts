import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { petService } from '../services/pet';

export const data = new SlashCommandBuilder()
  .setName('pet')
  .setDescription('Hệ thống thú cưng AI')
  .addSubcommand(sub => 
      sub.setName('start')
         .setDescription('Kết nối với Gene-Sys để ấp trứng sinh vật mới')
  )
  .addSubcommand(sub =>
      sub.setName('list')
         .setDescription('Xem thông tin sinh vật của bạn')
  )
  .addSubcommand(sub =>
       sub.setName('release')
          .setDescription('Phóng sinh thú cưng hiện tại (Không thể hoàn tác)')
  )
  .addSubcommand(sub =>
       sub.setName('evolve')
          .setDescription('Tiến hóa sinh vật bằng Đá Tiến Hóa')
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'start') {
      await interaction.deferReply();
      await petService.beginHatchingProcess(interaction);
  } else if (subcommand === 'list') {
      await interaction.deferReply();
      const res = await petService.showPetList(interaction);
      if (res.content) await interaction.editReply(res.content);
      else if (res.embeds) await interaction.editReply({ embeds: res.embeds });
  } else if (subcommand === 'release') {
      await interaction.deferReply();
      await petService.showReleasePetMenu(interaction);
  } else if (subcommand === 'evolve') {
      await interaction.deferReply();
      const res = await petService.evolvePet(interaction);
      if (res.content || res.embeds) {
          await interaction.editReply(res);
      } else {
          await interaction.editReply("❌ Đã có lỗi xảy ra.");
      }
  }
}
