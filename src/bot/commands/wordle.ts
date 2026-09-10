import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { wordleService } from '../services/wordle';

export const data = new SlashCommandBuilder()
  .setName('wordle')
  .setDescription('Chơi Wordle - Đoán từ theo chủ đề')
  .addSubcommand(sub => sub.setName('setup').setDescription('Thiết lập và bắt đầu game Wordle'))
  .addSubcommand(sub => sub.setName('cancel').setDescription('Hủy game Wordle hiện tại'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'setup') {
    if (!interaction.guildId) return;
    if (wordleService.isGameActive(interaction.guildId)) {
      await interaction.reply({ content: '❌ Đang có Wordle rồi! Dùng `/wordle cancel` nếu muốn hủy.', ephemeral: true });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('wordle_setup_modal')
      .setTitle('Thiết Lập Wordle');

    const numRoundsInput = new TextInputBuilder()
      .setCustomId('wordle_num_rounds')
      .setLabel('Số lượng từ (3-10)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ví dụ: 5')
      .setRequired(true);

    const topicInput = new TextInputBuilder()
      .setCustomId('wordle_topic')
      .setLabel('Chủ đề')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ví dụ: Động vật, Thể thao, Lịch sử...')
      .setRequired(true);

    const difficultyInput = new TextInputBuilder()
      .setCustomId('wordle_difficulty')
      .setLabel('Độ khó (Dễ=4 chữ, TB=5, Khó=6, Địa ngục=7)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Mặc định: Trung bình')
      .setRequired(false);

    const maxGuessesInput = new TextInputBuilder()
      .setCustomId('wordle_max_guesses')
      .setLabel('Số lượt đoán tối đa mỗi từ (3-10)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Mặc định: 6')
      .setRequired(false);

    const timeLimitInput = new TextInputBuilder()
      .setCustomId('wordle_time_limit')
      .setLabel('Thời gian mỗi từ (giây)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Mặc định: 60')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(numRoundsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(topicInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(difficultyInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(maxGuessesInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(timeLimitInput)
    );

    await interaction.showModal(modal);

  } else if (subcommand === 'cancel') {
    if (!interaction.guildId) return;
    const res = await wordleService.cancelGame(interaction.guildId, interaction.user.id);
    await interaction.reply({ content: res.message, ephemeral: true });
  }
}
