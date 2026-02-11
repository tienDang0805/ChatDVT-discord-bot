import { geminiService } from './gemini';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

interface ICTWRound {
  correctAnswer: string;
  imagePrompt: string;
  options: string[];
  correctAnswerIndex: number;
}

interface ICTWState {
  rounds: ICTWRound[];
  currentRoundIndex: number;
  scores: Map<string, number>;
  isActive: boolean;
  timer?: NodeJS.Timeout;
  channelId: string;
  timeLimit: number;
}

class CatchTheWordService {
  private activeGames: Map<string, ICTWState> = new Map();

  public isGameActive(guildId: string): boolean {
    return this.activeGames.has(guildId);
  }

  public async startGame(guildId: string, channel: any, creatorId: string, numRounds: number, timeLimit: number, difficulty: string, topic: string) {
    if (this.activeGames.has(guildId)) return { success: false, message: "Game đang chạy!" };

    await channel.send(`🎨 **Đuổi Hình Bắt Chữ** đang chuẩn bị... Chủ đề: "${topic}"`);

    try {
      const rounds = await this.generateRounds(numRounds, difficulty, topic);
      if (!rounds.length) return { success: false, message: "Lỗi tạo câu hỏi." };

      this.activeGames.set(guildId, {
        rounds,
        currentRoundIndex: 0,
        scores: new Map(),
        isActive: true,
        channelId: channel.id,
        timeLimit
      });

      await this.playRound(guildId, channel);
      return { success: true, message: "Game Start!" };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Lỗi hệ thống." };
    }
  }

  // Same logic as QuizService for submit/loop, but with Image Generation
  private async generateRounds(num: number, difficulty: string, topic: string): Promise<ICTWRound[]> {
      const prompt = `Tạo ${num} câu đố Đuổi Hình Bắt Chữ về "${topic}". 
      Quy tắc: Mô tả hình ảnh (Tiếng Anh) để AI vẽ, người chơi nhìn hình đoán từ (Tiếng Việt).
      JSON Output only:
      [
        {
          "correctAnswer": "Đáp án TV",
          "imagePrompt": "English prompt for image generation",
          "options": ["A", "B", "C", "D"] (Tiếng Việt, 1 đúng, 3 nhiễu),
          "correctAnswerIndex": 0
        }
      ]`;
      return await geminiService.generateJSON<ICTWRound[]>(prompt);
  }

  private async playRound(guildId: string, channel: any) {
      const state = this.activeGames.get(guildId);
      if (!state) return;

      const round = state.rounds[state.currentRoundIndex];
      
      // Generate Image
      const imageRes = await geminiService.generateImage(round.imagePrompt);
      if (!imageRes.success || !imageRes.imageBuffer) {
          await channel.send("❌ Lỗi tạo ảnh, bỏ qua vòng này.");
          this.endRound(guildId, null, null);
          return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Vòng ${state.currentRoundIndex + 1}`)
        .setColor(0xFFA500)
        .setImage('attachment://puzzle.png');

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      const row1 = new ActionRowBuilder<ButtonBuilder>();
      round.options.forEach((opt, idx) => {
          row1.addComponents(new ButtonBuilder().setCustomId(`ctw_answer_${idx}`).setLabel(opt).setStyle(ButtonStyle.Secondary));
      });
      rows.push(row1);

      await channel.send({ 
          embeds: [embed], 
          files: [{ attachment: imageRes.imageBuffer, name: 'puzzle.png' }],
          components: rows 
      });

      state.timer = setTimeout(() => this.handleTimeout(guildId), state.timeLimit * 1000);
  }

  // ... (handleTimeout, endRound, submitAnswer similar to QuizService) ...
  // Ensuring exports for completeness.
  
  public async submitAnswer(guildId: string, userId: string, answerIndex: number, username: string) {
       const state = this.activeGames.get(guildId);
       if (!state) return { success: false, message: "No game." };

       const round = state.rounds[state.currentRoundIndex];
       if (answerIndex === round.correctAnswerIndex) {
           const current = state.scores.get(userId) || 0;
           state.scores.set(userId, current + 1);
           await this.endRound(guildId, userId, username);
           return { success: true, message: "Correct!" };
       }
       return { success: false, message: "Wrong!" };
  }

  private async endRound(guildId: string, winnerId: string | null, winnerName: string | null) {
      const state = this.activeGames.get(guildId);
      if (!state) return;
      clearTimeout(state.timer);
      
      const channel = (await import('../client')).bot.channels.cache.get(state.channelId) as any;
      if (channel) {
         if (winnerId) await channel.send(`🎉 **${winnerName}** ăn điểm! Đáp án: ${state.rounds[state.currentRoundIndex].correctAnswer}`);
         else await channel.send(`⏰ Hết giờ! Đáp án là: ${state.rounds[state.currentRoundIndex].correctAnswer}`);
      }

      state.currentRoundIndex++;
      if (state.currentRoundIndex < state.rounds.length) {
          setTimeout(() => this.playRound(guildId, channel), 2000);
      } else {
          this.endGame(guildId, channel);
      }
  }

  private handleTimeout(guildId: string) {
      this.endRound(guildId, null, null);
  }

  private async endGame(guildId: string, channel: any) {
      const state = this.activeGames.get(guildId);
      if (!state) return;
      this.activeGames.delete(guildId);
      
      let msg = "🏆 **Kết Quả CTW** 🏆\n";
      [...state.scores.entries()].sort((a,b) => b[1]-a[1]).forEach(([uid, sc], i) => {
          msg += `#${i+1} <@${uid}>: ${sc}\n`;
      });
      await channel.send(msg || "No winners.");
  }
}

export const ctwService = new CatchTheWordService();
