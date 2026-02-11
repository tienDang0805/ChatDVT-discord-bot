import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { quizService } from '../services/quiz';

export const data = new SlashCommandBuilder()
  .setName('quiz')
  .setDescription('Chơi Quiz cùng Racoon AI')
  .addSubcommand(sub => sub.setName('setup').setDescription('Thiết lập và bắt đầu game (Dùng Modal)'))
  .addSubcommand(sub => 
      sub.setName('cancel')
         .setDescription('Hủy game hiện tại'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'setup') {
      if (!interaction.guildId) return;
      if (quizService.isQuizActive(interaction.guildId)) {
          await interaction.reply({ content: "❌ Đang có quiz rồi! Dùng `/quiz cancel` nếu muốn hủy.", ephemeral: true });
          return;
      }

      // Show Modal
      const modal = new ModalBuilder()
        .setCustomId('quiz_setup_modal')
        .setTitle('Thiết Lập Racoon Quiz');

    const numQuestionsInput = new TextInputBuilder()
        .setCustomId('num_questions_input')
        .setLabel('Số lượng câu hỏi (3-10)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ví dụ: 5')
        .setRequired(true);

    const topicInput = new TextInputBuilder()
        .setCustomId('topic_input')
        .setLabel('Chủ đề câu hỏi')
        .setStyle(TextInputStyle.Short)
      
      const timeLimitInput = new TextInputBuilder()
        .setCustomId('time_limit_input')
        .setLabel('Thời gian cho mỗi câu (giây)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Mặc định: 15')
        .setRequired(false);

      const difficultyInput = new TextInputBuilder()
        .setCustomId('difficulty_input')
        .setLabel('Độ khó (Dễ, Trung bình, Khó, Địa ngục)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ví dụ: Trung bình')
        .setRequired(false);

      const toneInput = new TextInputBuilder()
        .setCustomId('tone_input')
        .setLabel('Giọng văn (Hài hước, Nghiêm túc)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Mặc định: Trung tính')
        .setRequired(false);

      const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(numQuestionsInput);
      const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(topicInput);
      const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(timeLimitInput);
      const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(difficultyInput);
      const row5 = new ActionRowBuilder<TextInputBuilder>().addComponents(toneInput);

      modal.addComponents(row1, row2, row3, row4, row5);

      await interaction.showModal(modal);

  } else if (subcommand === 'cancel') {
      if (!interaction.guildId) return;
      const res = await quizService.cancelQuiz(interaction.guildId, interaction.user.id);
      await interaction.reply({ content: res.message, ephemeral: true });
  }
}
