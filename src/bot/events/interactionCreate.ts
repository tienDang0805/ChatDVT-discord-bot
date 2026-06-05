import { Interaction, InteractionType, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { userIdentityService } from '../services/identity';
import { quizService } from '../services/quiz';
import { ctwService } from '../services/ctw';
import { petService } from '../services/pet';
import { expeditionService } from '../services/expedition';
import { codeChallengeService } from '../services/code-challenge';
import { prisma } from '../../database/prisma';

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

          // --- Pet Egg Picking ---
          if (customId.startsWith('egg_pick_')) {
               const parts = customId.split('_');
               const choiceIndex = parseInt(parts[2]);
               const ownerId = parts[3];
               
               if (interaction.user.id !== ownerId) {
                   await interaction.reply({ content: "❌ Trứng này không phải phần thưởng của bạn!", ephemeral: true });
                   return;
               }

               await petService.handleEggSelection(interaction, choiceIndex);
               return;
          }

          // --- Daily Free Pet ---
          if (customId === 'free_pet_keep') {
               await petService.processDailyFreePetPick(interaction, 'keep');
               return;
          }
          if (customId === 'free_pet_drop') {
               await petService.processDailyFreePetPick(interaction, 'drop');
               return;
          }

          // --- Expedition Next ---
          if (customId === 'expedition_next') {
               // Update the message to loading state immediately
               await interaction.deferUpdate();
               await interaction.editReply({ 
                    content: '🏃‍♂️ **Đang tiến đến ải tiếp theo...**', 
                    embeds: [], 
                    components: [] 
               });
               
               const result = await expeditionService.fight(interaction as any);
               
               if (!result) return;
               
               const res = result as any;
               if ('content' in res && res.content) {
                    await interaction.editReply({ content: res.content as string, embeds: [], components: res.components || [] });
               } else if ('embeds' in res) {
                    await interaction.editReply({ embeds: res.embeds, components: res.components || [] });
               }
               return;
          }

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

           // --- Code Challenge ---
           if (customId === 'code_submit_btn') {
               if (!interaction.guildId) return;

               if (!codeChallengeService.isActive(interaction.guildId)) {
                   await interaction.reply({ content: '❌ Challenge đã kết thúc.', ephemeral: true });
                   return;
               }

               if (codeChallengeService.hasSubmitted(interaction.guildId, interaction.user.id)) {
                   await interaction.reply({ content: '❌ Bạn đã submit rồi! Chờ kết quả khi hết giờ nhé.', ephemeral: true });
                   return;
               }

               const active = codeChallengeService.getActive(interaction.guildId);
               if (!active) return;

               const modal = new ModalBuilder()
                   .setCustomId('code_submit_modal')
                   .setTitle(`Submit Code — ${active.challenge.title.substring(0, 30)}`);

               const codeInput = new TextInputBuilder()
                   .setCustomId('code_input')
                   .setLabel('Code của bạn (ngôn ngữ tự do)')
                   .setStyle(TextInputStyle.Paragraph)
                   .setPlaceholder('Paste code vào đây... (JS, Python, Java, C++, PHP...)')
                   .setRequired(true)
                   .setMaxLength(4000);

               const row = new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput);
               modal.addComponents(row);
               await interaction.showModal(modal);
               return;
           }

           if (customId === 'code_cancel_btn') {
               if (!interaction.guildId) return;

               const active = codeChallengeService.getActive(interaction.guildId);
               if (!active) {
                   await interaction.reply({ content: '❌ Challenge đã kết thúc.', ephemeral: true });
                   return;
               }

               if (active.creatorId !== interaction.user.id) {
                   await interaction.reply({ content: '❌ Chỉ người tạo challenge mới được kết thúc sớm.', ephemeral: true });
                   return;
               }

               await interaction.deferReply();
               await codeChallengeService.endChallenge(interaction.guildId);
               await interaction.editReply('🛑 Challenge đã kết thúc sớm!');
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

          if (interaction.customId === 'persona_setting_modal') {
              await interaction.deferReply({ ephemeral: true });
              const guildId = interaction.guildId;
              if (!guildId) {
                  await interaction.editReply("❌ Tính năng này chỉ dành cho máy chủ.");
                  return;
              }

              const personaData = {
                  identity: interaction.fields.getTextInputValue('persona_identity') || '',
                  purpose: interaction.fields.getTextInputValue('persona_purpose') || '',
                  hobbies: interaction.fields.getTextInputValue('persona_hobbies') || '',
                  personality: interaction.fields.getTextInputValue('persona_personality') || '',
                  writing_style: interaction.fields.getTextInputValue('persona_style') || ''
              };

              // Lưu vào DB theo Server Level
              let guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
              let modules = guildConfig ? JSON.parse(guildConfig.activeModules) : {};
              modules.persona = personaData;

              await prisma.guildConfig.upsert({
                  where: { guildId },
                  update: { activeModules: JSON.stringify(modules) },
                  create: { guildId, systemPrompts: '{}', activeModules: JSON.stringify(modules) }
              });

              await interaction.editReply("✅ **Lưu Thành Công!**\nBạn đã cập nhật tuỳ chỉnh Nhân Cách Bot cho riêng máy chủ này.\nBot sẽ áp dụng ngay vào tin nhắn tiếp theo.");
          }
           if (interaction.customId === 'code_submit_modal') {
               await interaction.deferReply();
               const guildId = interaction.guildId;
               if (!guildId) {
                   await interaction.editReply('❌ Lỗi: Không thể xác định Server.');
                   return;
               }

               const code = interaction.fields.getTextInputValue('code_input');
               const result = await codeChallengeService.submitCode(
                   guildId,
                   interaction.user.id,
                   interaction.user.username,
                   code
               );

               await interaction.editReply(result.message || '❌ Lỗi không xác định.');
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
