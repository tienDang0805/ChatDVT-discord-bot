import { Interaction, InteractionType, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { userIdentityService } from '../services/identity';
import { quizService } from '../services/quiz';
import { ctwService } from '../services/ctw';
import { petService } from '../services/pet';

export async function handleInteraction(interaction: Interaction) {
  try {
      if (interaction.isChatInputCommand()) {
          const command = (interaction.client as any).commands.get(interaction.commandName);
          if (command) {
              await command.execute(interaction);
          }
          return;
      }

      if (interaction.isButton()) {
          const customId = interaction.customId;

          // --- Identity ---
          if (customId === 'edit_identity') {
              const modal = new ModalBuilder()
                  .setCustomId('identity_modal')
                  .setTitle('Chỉnh sửa danh tính');

              const nicknameInput = new TextInputBuilder()
                  .setCustomId('nickname_input')
                  .setLabel("Biệt danh AI gọi bạn")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false);

              const signatureInput = new TextInputBuilder()
                  .setCustomId('signature_input')
                  .setLabel("Bio / Chữ ký / Mô tả bản thân")
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(false);

              const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nicknameInput);
              const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(signatureInput);

              modal.addComponents(firstActionRow, secondActionRow);
              await interaction.showModal(modal);
              return;
          }
          if (customId === 'reset_identity') {
               await userIdentityService.handleReset(interaction);
               return;
          }

          // --- Quiz ---
          if (customId.startsWith('quiz_answer_')) {
               await interaction.deferReply({ ephemeral: true });
               const answerIdx = parseInt(customId.split('_')[2]);
               if (!interaction.guildId) return;
               
               const result = await quizService.submitAnswer(interaction.guildId, interaction.user.id, answerIdx, interaction.user.username);
               await interaction.editReply(result.message);
               return;
          }

          // --- CTW ---
          if (customId.startsWith('ctw_answer_')) {
              await interaction.deferReply({ ephemeral: true });
               const answerIdx = parseInt(customId.split('_')[2]);
               if (!interaction.guildId) return;

               const result = await ctwService.submitAnswer(interaction.guildId, interaction.user.id, answerIdx, interaction.user.username);
               await interaction.editReply(result.message);
               return;
          }
      }

      if (interaction.type === InteractionType.ModalSubmit) {
          if (interaction.customId === 'identity_modal') {
              await interaction.deferReply({ ephemeral: true });
              const nickname = interaction.fields.getTextInputValue('nickname_input');
              const signature = interaction.fields.getTextInputValue('signature_input');

              await userIdentityService.updateIdentity(interaction.user.id, { nickname, signature });
              await interaction.editReply("✅ Đã cập nhật danh tính thành công!");
          }
          if (interaction.customId === 'quiz_setup_modal') {
              await interaction.deferReply();
              
              const numQuestions = parseInt(interaction.fields.getTextInputValue('num_questions_input'));
              const topic = interaction.fields.getTextInputValue('topic_input');
              const timeLimitInput = interaction.fields.getTextInputValue('time_limit_input');
              const timeLimit = timeLimitInput ? parseInt(timeLimitInput) : 15;
              const difficultyInput = interaction.fields.getTextInputValue('difficulty_input');
              const difficulty = difficultyInput ? difficultyInput.trim() : 'Trung bình';
              const toneInput = interaction.fields.getTextInputValue('tone_input');
              const tone = toneInput ? toneInput.trim() : 'Trung tính';

              const guildId = interaction.guildId;
              
              if (!guildId) { 
                  await interaction.editReply("❌ Lỗi: Không thể xác định Server.");
                  return;
              }

              if (isNaN(numQuestions) || numQuestions < 3 || numQuestions > 10) {
                  await interaction.editReply('❌ Số lượng câu hỏi phải là một số từ 3 đến 10.');
                  return;
              }
               
              const res = await quizService.startQuiz(
                  guildId, 
                  interaction.channel, 
                  interaction.user.id, 
                  numQuestions, 
                  topic, 
                  timeLimit, 
                  difficulty, 
                  tone
              );
              
              await interaction.editReply(res.message);
          }
      }

  } catch (error) {
      console.error("Interaction Handler Error:", error);
      if (interaction.isRepliable()) {
          await interaction.reply({ content: "❌ Có lỗi xảy ra!", ephemeral: true }).catch(() => {});
      }
  }
}
