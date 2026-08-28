import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { ADMIN_ID } from '../../config/constants';
import { prisma } from '../../database/prisma';

export const data = new SlashCommandBuilder()
  .setName('setapikey')
  .setDescription('🔑 [Admin] Cài đặt Gemini API Key cho server này')
  .addSubcommand(sub =>
      sub.setName('set')
         .setDescription('Mở popup nhập API Key mới')
  )
  .addSubcommand(sub =>
      sub.setName('view')
         .setDescription('Xem API Key hiện tại (ẩn một phần)')
  )
  .addSubcommand(sub =>
      sub.setName('remove')
         .setDescription('Xoá API Key của server này (dùng key global)')
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.user.id !== ADMIN_ID) {
      await interaction.reply({ content: "❌ Chỉ Admin mới có quyền sử dụng lệnh này.", ephemeral: true });
      return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'set') {
      const modal = new ModalBuilder()
          .setCustomId('setapikey_modal')
          .setTitle('🔑 Cài đặt Gemini API Key');

      const keyInput = new TextInputBuilder()
          .setCustomId('apikey_input')
          .setLabel("Nhập Gemini API Key")
          .setPlaceholder("AIzaSy...")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMinLength(10)
          .setMaxLength(100);

      const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(keyInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);

  } else if (subcommand === 'view') {
      await interaction.deferReply({ ephemeral: true });
      const guildId = interaction.guildId;
      if (!guildId) {
          await interaction.editReply("❌ Lệnh này chỉ dùng trong server.");
          return;
      }

      const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
      const key = guildConfig?.geminiApiKey;

      if (!key) {
          await interaction.editReply("ℹ️ Server này chưa có API Key riêng. Đang dùng key Global/ENV mặc định.");
          return;
      }

      const masked = key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);

      const embed = new EmbedBuilder()
          .setTitle("🔑 Gemini API Key (Server)")
          .setDescription(`\`${masked}\``)
          .setColor(0x00FF88)
          .setFooter({ text: `Server: ${interaction.guild?.name || guildId}` });

      await interaction.editReply({ embeds: [embed] });

  } else if (subcommand === 'remove') {
      await interaction.deferReply({ ephemeral: true });
      const guildId = interaction.guildId;
      if (!guildId) {
          await interaction.editReply("❌ Lệnh này chỉ dùng trong server.");
          return;
      }

      const existing = await prisma.guildConfig.findUnique({ where: { guildId } });
      if (!existing || !existing.geminiApiKey) {
          await interaction.editReply("ℹ️ Server này không có API Key riêng để xoá.");
          return;
      }

      await prisma.guildConfig.update({
          where: { guildId },
          data: { geminiApiKey: null }
      });

      await interaction.editReply("✅ Đã xoá API Key của server. Bot sẽ dùng key Global/ENV mặc định.");
  }
}
