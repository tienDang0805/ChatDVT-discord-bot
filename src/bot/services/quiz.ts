import { geminiService } from './gemini';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

interface IQuizQuestion {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

interface IQuizState {
  questions: IQuizQuestion[];
  currentQuestionIndex: number;
  scores: Map<string, { score: number, totalTime: number }>;
  isActive: boolean;
  timer?: NodeJS.Timeout;
  countdownInterval?: NodeJS.Timeout;
  channelId: string;
  timeLimit: number; // in ms
  creatorId: string;
  topic: string;
  difficulty: string;
  tone: string;
  questionMessage?: any;
  messageId?: string;
  questionStartTime?: number;
  answeredUsers: Set<string>;
  correctlyAnsweredUsers: Set<string>;
}

class QuizService {
  private activeQuizzes: Map<string, IQuizState> = new Map();

  public isQuizActive(guildId: string): boolean {
      return this.activeQuizzes.has(guildId);
  }

  public async startQuiz(guildId: string, channel: any, creatorId: string, numQuestions: number, topic: string, timeLimitSecs: number, difficulty: string, tone: string) {
      if (this.activeQuizzes.has(guildId)) {
          return { success: false, message: "Đang có quiz diễn ra!" };
      }

      await channel.send(`🧠 **Racoon Quiz** đang khởi động! Chủ đề: **${topic}**...`);

      try {
          // Use legacy prompt structure in generateQuestions
          const questions = await this.generateQuestions(numQuestions, topic, difficulty, tone);
          
          if (!questions || questions.length === 0) {
              return { success: false, message: "Không tạo được câu hỏi. Thử lại nhé!" };
          }

          const actualTimeLimitMs = timeLimitSecs * 1000;

          this.activeQuizzes.set(guildId, {
              questions,
              currentQuestionIndex: 0,
              scores: new Map(),
              isActive: true,
              channelId: channel.id,
              timeLimit: actualTimeLimitMs,
              creatorId,
              topic,
              difficulty,
              tone,
              answeredUsers: new Set(),
              correctlyAnsweredUsers: new Set()
          });

          await this.sendNextQuestion(guildId);
          
          return { 
            success: true, 
            message: `🎉 **Racoon Quiz** về chủ đề **${topic}** (Độ khó: **${difficulty}**, Giọng văn: **${tone}**) với ${numQuestions} câu hỏi đã bắt đầu! Mỗi câu có **${timeLimitSecs} giây** để trả lời!` 
          };

      } catch (error) {
          console.error("Quiz Start Error:", error);
          return { success: false, message: "Lỗi hệ thống khi tạo quiz." };
      }
  }

  public async cancelQuiz(guildId: string, userId: string) {
      const state = this.activeQuizzes.get(guildId);
      if (!state) return { success: false, message: "Không có quiz nào đang chạy." };

      if (state.creatorId !== userId) {
          return { success: false, message: "Bạn không phải người tạo quiz này." };
      }
      
      this.clearTimers(state);
      // Cleanup UI
      if (state.questionMessage) {
         try {
             // Disable buttons
             const rows = state.questionMessage.components.map((row: any) => {
                 return new ActionRowBuilder<ButtonBuilder>().addComponents(
                     row.components.map((btn: any) => ButtonBuilder.from(btn).setDisabled(true))
                 );
             });
             await state.questionMessage.edit({ components: rows });
         } catch(e) {}
      }

      this.activeQuizzes.delete(guildId);
      return { success: true, message: "Đã hủy quiz." };
  }

  public async submitAnswer(guildId: string, userId: string, answerIndex: number, username: string) {
      const state = this.activeQuizzes.get(guildId);
      if (!state || !state.isActive) return { success: false, message: "Không có quiz." };

      if (state.answeredUsers.has(userId)) {
          return { success: false, message: "Bạn đã trả lời câu này rồi!" };
      }

      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
      const timeTaken = Date.now() - (state.questionStartTime || Date.now());

      state.answeredUsers.add(userId);
      const channel = (await import('../client')).bot.channels.cache.get(state.channelId) as any;
      if (channel) await channel.send(`➡️ **${username}** đã trả lời.`);

      if (isCorrect) {
          if (!state.scores.has(userId)) {
              state.scores.set(userId, { score: 0, totalTime: 0 });
          }
          const userScore = state.scores.get(userId)!;
          userScore.score += 1;
          userScore.totalTime += timeTaken;
          state.correctlyAnsweredUsers.add(userId);
          return { success: true, message: "Chính xác!" };
      }
      
      return { success: false, message: "Sai rồi!" };
  }
  
  // --- Private Helpers ---

  private async generateQuestions(num: number, topic: string, difficulty: string, tone: string): Promise<IQuizQuestion[]> {
      const prompt = `Bạn là chuyên gia Quiz. Tạo ${num} câu hỏi trắc nghiệm về "${topic}".
      Độ khó: ${difficulty}. Giọng văn: ${tone}.
      Mỗi câu có 4 đáp án, 1 đúng.
      
      Trả về JSON Array CHÍNH XÁC như sau (không markdown):
      [
        {
          "question": "Câu hỏi?",
          "answers": ["A", "B", "C", "D"],
          "correctAnswerIndex": 0
        }
      ]`;
      
      return await geminiService.generateJSON<IQuizQuestion[]>(prompt);
  }

  private async sendNextQuestion(guildId: string) {
      const state = this.activeQuizzes.get(guildId);
      if (!state) return;
      
      // Cleanup previous
      this.clearTimers(state);
      const channel = (await import('../client')).bot.channels.cache.get(state.channelId) as any;
      if (!channel) {
          this.activeQuizzes.delete(guildId);
          return;
      }

      // Delete old message if possible
      if (state.messageId) {
          try {
              const msg = await channel.messages.fetch(state.messageId);
              await msg.delete();
          } catch(e) {}
      }

      state.answeredUsers.clear();
      state.correctlyAnsweredUsers.clear();

      if (state.currentQuestionIndex < state.questions.length) {
          const q = state.questions[state.currentQuestionIndex];
          const timeSecs = state.timeLimit / 1000;
          
          const embed = new EmbedBuilder()
            .setTitle(`❓ Câu ${state.currentQuestionIndex + 1}/${state.questions.length}: ${q.question}`)
            .setDescription(`Chọn câu trả lời đúng:\n\n**⏱️ Thời gian: \`${timeSecs}s\`**`)
            .setColor(0x0099FF)
            .setTimestamp();

          const rows: ActionRowBuilder<ButtonBuilder>[] = [];
          const row1 = new ActionRowBuilder<ButtonBuilder>();
          const row2 = new ActionRowBuilder<ButtonBuilder>();

          q.answers.forEach((ans, idx) => {
              const btn = new ButtonBuilder()
                  .setCustomId(`quiz_answer_${idx}`)
                  .setLabel(ans.length > 80 ? ans.substring(0, 77) + "..." : ans)
                  .setStyle(ButtonStyle.Primary);
              if (idx < 2) row1.addComponents(btn);
              else row2.addComponents(btn);
          });

          rows.push(row1);
          if (row2.components.length > 0) rows.push(row2);

          const message = await channel.send({ embeds: [embed], components: rows });
          state.questionMessage = message;
          state.messageId = message.id;
          state.questionStartTime = Date.now();

          // Countdown Animation (Simplified: update every 5s to avoid rate limits, or just 10s)
          // For now, let's just wait for timeout. 
          // Legacy had a countdown interval updating the embed.
          
          state.timer = setTimeout(() => {
              this.revealAnswerAndNextQuestion(guildId);
          }, state.timeLimit);

      } else {
          this.endQuiz(guildId);
      }
  }

  private async revealAnswerAndNextQuestion(guildId: string) {
      const state = this.activeQuizzes.get(guildId);
      if (!state) return;

      this.clearTimers(state);
      const channel = (await import('../client')).bot.channels.cache.get(state.channelId) as any;
      
      // Disable buttons
       if (state.questionMessage) {
         try {
             // Disable buttons
             const rows = state.questionMessage.components.map((row: any) => {
                 return new ActionRowBuilder<ButtonBuilder>().addComponents(
                     row.components.map((btn: any) => ButtonBuilder.from(btn).setDisabled(true))
                 );
             });
             await state.questionMessage.edit({ components: rows });
         } catch(e) {}
      }

      const q = state.questions[state.currentQuestionIndex];
      const correctAnswer = q.answers[q.correctAnswerIndex];
      
      let revealMsg = `⏰ **HẾT GIỜ!**\nĐáp án đúng: **${String.fromCharCode(65 + q.correctAnswerIndex)}. ${correctAnswer}**\n\n`;
      
      if (state.correctlyAnsweredUsers.size > 0) {
          revealMsg += `✅ Người trả lời đúng:\n`;
           // This is async inside a sync flow, need care. 
           // We just store IDs, fetching Users is async.
           // For simplicity, we assume we can just mention them <@id>
           state.correctlyAnsweredUsers.forEach(uid => revealMsg += `- <@${uid}>\n`);
      } else {
          revealMsg += `❌ Không ai trả lời đúng.\n`;
      }

       if (channel) {
           const embed = new EmbedBuilder()
             .setTitle("Kết quả câu hỏi")
             .setDescription(revealMsg)
             .setColor(0x32CD32);
            await channel.send({ embeds: [embed] });
       }

      state.currentQuestionIndex++;
      setTimeout(() => this.sendNextQuestion(guildId), 5000);
  }

  private async endQuiz(guildId: string) {
      const state = this.activeQuizzes.get(guildId);
      if (!state) return;
      
      const channel = (await import('../client')).bot.channels.cache.get(state.channelId) as any;
      this.activeQuizzes.delete(guildId);

      // Leaderboard
      const sorted = [...state.scores.entries()].sort((a, b) => {
          if (b[1].score !== a[1].score) return b[1].score - a[1].score;
          return a[1].totalTime - b[1].totalTime; // Less time is better
      });

      let ranking = "";
      if (sorted.length > 0) {
          sorted.forEach((entry, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`;
              ranking += `${medal} <@${entry[0]}>: ${entry[1].score} điểm (${(entry[1].totalTime/1000).toFixed(1)}s)\n`;
          });
      } else {
          ranking = "Không có ai ghi điểm.";
      }

      if (channel) {
          const embed = new EmbedBuilder()
            .setTitle('🏆 Racoon Quiz Đã Kết Thúc!')
            .setDescription(`Bảng điểm cuối cùng cho chủ đề **${state.topic}**:\n\n${ranking}`)
            .setColor(0xFFD700);
          await channel.send({ embeds: [embed] });
      }
  }

  private clearTimers(state: IQuizState) {
      if (state.timer) clearTimeout(state.timer);
      if (state.countdownInterval) clearInterval(state.countdownInterval);
  }
}

export const quizService = new QuizService();
