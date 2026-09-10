import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { bienThaiService } from '../services/bienthai';

export const data = new SlashCommandBuilder()
  .setName('bienthai')
  .setDescription('Ai Là Kẻ Biến Thái — Game bựa, AI chấm điểm')
  .addSubcommand(sub => sub.setName('start').setDescription('Bắt đầu game'))
  .addSubcommand(sub => sub.setName('cancel').setDescription('Hủy game'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'start') {
    if (!interaction.guildId) return;
    if (bienThaiService.isGameActive(interaction.guildId)) {
      await interaction.reply({ content: '❌ Đang có game rồi! `/bienthai cancel` để hủy.', ephemeral: true });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('bienthai_setup_modal')
      .setTitle('Ai Là Kẻ Biến Thái 🃏');

    const roundsInput = new TextInputBuilder()
      .setCustomId('bienthai_rounds')
      .setLabel('Số vòng chơi (3-8)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Mặc định: 5')
      .setRequired(false);

    const topicInput = new TextInputBuilder()
      .setCustomId('bienthai_topic')
      .setLabel('Chủ đề')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('VD: Tình dục, Crush, Công sở... (Mặc định: Tổng hợp)')
      .setRequired(false);

    const toneInput = new TextInputBuilder()
      .setCustomId('bienthai_tone')
      .setLabel('Giọng văn (Toxic, Hài bựa, Dâm dục, Gen Z...)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Mặc định: Dâm dục bựa')
      .setRequired(false);

    const timeInput = new TextInputBuilder()
      .setCustomId('bienthai_time')
      .setLabel('Thời gian mỗi vòng (giây, 30-300)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Mặc định: 120')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(roundsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(topicInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(toneInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(timeInput)
    );

    await interaction.showModal(modal);

  } else if (subcommand === 'cancel') {
    if (!interaction.guildId) return;
    const res = await bienThaiService.cancelGame(interaction.guildId, interaction.user.id);
    await interaction.reply({ content: res.message, ephemeral: true });
  }
}
