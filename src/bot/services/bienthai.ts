import { geminiService } from './gemini';
import { EmbedBuilder } from 'discord.js';

interface ISubmission {
  userId: string;
  username: string;
  answer: string;
}

interface IJudgeResult {
  answerIndex: number;
  score: number;
  comment: string;
}

interface IBienThaiState {
  prompts: string[];
  currentRoundIndex: number;
  currentPrompt: string;
  submissions: ISubmission[];
  scores: Map<string, { points: number; username: string }>;
  phase: 'submit' | 'judging';
  isActive: boolean;
  channelId: string;
  creatorId: string;
  numRounds: number;
  tone: string;
  submitTime: number;
  timer?: NodeJS.Timeout;
  collector?: any;
}

class BienThaiService {
  private activeGames: Map<string, IBienThaiState> = new Map();

  public isGameActive(guildId: string): boolean {
    return this.activeGames.has(guildId);
  }

  public async startGame(guildId: string, channel: any, creatorId: string, numRounds: number, tone: string) {
    if (this.activeGames.has(guildId)) {
      return { success: false, message: '❌ Đang có game rồi! `/bienthai cancel` để hủy.' };
    }

    await channel.send(`🃏 **Ai Là Kẻ Biến Thái** đang chuẩn bị... Giọng văn: **${tone}**`);

    try {
      const prompts = await this.generatePrompts(numRounds, tone);

      if (!prompts || prompts.length === 0) {
        return { success: false, message: '❌ Không tạo được câu hỏi. Thử lại' };
      }

      this.activeGames.set(guildId, {
        prompts,
        currentRoundIndex: 0,
        currentPrompt: prompts[0],
        submissions: [],
        scores: new Map(),
        phase: 'submit',
        isActive: true,
        channelId: channel.id,
        creatorId,
        numRounds: prompts.length,
        tone,
        submitTime: 120000
      });

      await this.startSubmitPhase(guildId, channel);

      return {
        success: true,
        message: `🎉 **Ai Là Kẻ Biến Thái** bắt đầu! ${prompts.length} vòng — Giọng: **${tone}**\n📝 Gõ câu trả lời bựa nhất vào chat! Mỗi vòng **120 giây**.\n🤖 AI sẽ chấm điểm và chọn kẻ biến thái nhất!`
      };
    } catch (error) {
      console.error('BienThai Start Error:', error);
      return { success: false, message: '❌ Lỗi hệ thống.' };
    }
  }

  public async cancelGame(guildId: string, userId: string) {
    const state = this.activeGames.get(guildId);
    if (!state) return { success: false, message: 'Không có game nào.' };
    if (state.creatorId !== userId) return { success: false, message: 'Chỉ người tạo mới hủy được.' };

    this.cleanup(state);
    this.activeGames.delete(guildId);
    return { success: true, message: '✅ Đã hủy game.' };
  }

  private async generatePrompts(num: number, tone: string): Promise<string[]> {
    const prompt = `Tạo ${num} câu hỏi/tình huống CỰC KỲ BỰA, DÂM DỤC, BIẾN THÁI cho game "Ai Là Kẻ Biến Thái".
Giọng văn: ${tone}.

QUY TẮC:
- Mỗi câu PHẢI có chỗ trống _____ để người chơi điền
- Phải THẬT SỰ DÂM DỤC, BIẾN THÁI, 18+ — dùng từ ngữ trực tiếp: cặc, lồn, đụ, bú, chịch, dâm thủy, thủ dâm, v.v.
- Câu phải tạo cơ hội cho người chơi sáng tạo câu trả lời bựa nhất có thể
- Viết theo giọng văn "${tone}" — nếu toxic thì cay cú, nếu hài thì hài bựa
- Đa dạng: tình huống sex, mối quan hệ bựa, bí mật 18+, fantasy dâm, v.v.

Ví dụ câu hỏi hay:
- "Crush phát hiện lịch sử tìm kiếm của tôi toàn _____ nên đã block thẳng tay"
- "Đêm tân hôn, cô dâu sốc nặng khi chú rể lôi ra _____"
- "Lý do thật sự bạn khóa cửa phòng mỗi tối là để _____"
- "Bác sĩ choáng váng khi X-quang cho thấy bên trong hậu môn bệnh nhân có _____"
- "Tin nhắn lúc 3h sáng gửi nhầm group công ty: '_____'"

Trả về JSON Array:
["Câu 1 có _____", "Câu 2 có _____"]`;

    return await geminiService.generateJSON<string[]>(prompt);
  }

  private async startSubmitPhase(guildId: string, channel: any) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    state.phase = 'submit';
    state.submissions = [];
    state.currentPrompt = state.prompts[state.currentRoundIndex];

    const roundNum = state.currentRoundIndex + 1;

    const embed = new EmbedBuilder()
      .setTitle(`🃏 Vòng ${roundNum}/${state.numRounds}`)
      .setDescription(
        `**${state.currentPrompt}**\n\n` +
        `📝 Gõ câu trả lời **bựa nhất, biến thái nhất** vào chat!\n` +
        `⏱️ Còn **120 giây**\n` +
        `👥 Mỗi người **1 câu** duy nhất (lấy câu đầu tiên)\n` +
        `🤖 Sau đó AI sẽ chấm điểm theo độ bựa!`
      )
      .setColor(0xFF69B4)
      .setFooter({ text: `Giọng: ${state.tone} | Ai Là Kẻ Biến Thái 🃏` });

    await channel.send({ embeds: [embed] });

    const collector = channel.createMessageCollector({
      filter: (msg: any) => {
        if (msg.author.bot) return false;
        const content = msg.content.trim();
        if (content.length < 2 || content.length > 300) return false;
        if (content.startsWith('!') || content.startsWith('/') || content.startsWith('-')) return false;
        return true;
      },
      time: state.submitTime
    });

    state.collector = collector;

    collector.on('collect', async (msg: any) => {
      const userId = msg.author.id;
      const existing = state.submissions.find(s => s.userId === userId);
      if (existing) {
        await msg.react('⛔');
        return;
      }

      state.submissions.push({
        userId,
        username: msg.author.username,
        answer: msg.content.trim()
      });

      await msg.react('✅');
      try { await msg.delete(); } catch (_) {}
    });

    collector.on('end', async () => {
      await this.startJudgingPhase(guildId, channel);
    });

    state.timer = setTimeout(() => {
      if (state.collector) state.collector.stop('time');
    }, state.submitTime);
  }

  private async startJudgingPhase(guildId: string, channel: any) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    if (state.submissions.length < 2) {
      const skipEmbed = new EmbedBuilder()
        .setDescription('⚠️ Cần ít nhất **2 câu trả lời**. Bỏ qua vòng này!')
        .setColor(0xFF4444);
      await channel.send({ embeds: [skipEmbed] });

      state.currentRoundIndex++;
      if (state.currentRoundIndex >= state.numRounds) {
        await this.endGame(guildId);
      } else {
        setTimeout(() => this.startSubmitPhase(guildId, channel), 3000);
      }
      return;
    }

    state.phase = 'judging';

    const judgingEmbed = new EmbedBuilder()
      .setDescription('🤖 **AI đang chấm điểm...** Đợi xíu nhé!')
      .setColor(0xFFA500);
    await channel.send({ embeds: [judgingEmbed] });

    try {
      const results = await this.aiJudge(state);
      await this.revealResults(guildId, channel, results);
    } catch (error) {
      console.error('AI Judge Error:', error);
      const errEmbed = new EmbedBuilder()
        .setDescription('❌ AI bị lỗi khi chấm. Bỏ qua vòng này!')
        .setColor(0xFF0000);
      await channel.send({ embeds: [errEmbed] });

      state.currentRoundIndex++;
      if (state.currentRoundIndex >= state.numRounds) {
        await this.endGame(guildId);
      } else {
        setTimeout(() => this.startSubmitPhase(guildId, channel), 3000);
      }
    }
  }

  private async aiJudge(state: IBienThaiState): Promise<IJudgeResult[]> {
    const answersForAI = state.submissions.map((sub, idx) => ({
      index: idx,
      answer: sub.answer
    }));

    const judgePrompt = `Bạn là giám khảo game "Ai Là Kẻ Biến Thái" — chuyên chấm câu trả lời DÂM DỤC, BỰA, HÀI HƯỚC.
Giọng văn bình luận: ${state.tone}.

Câu hỏi gốc: "${state.currentPrompt}"

Các câu trả lời cần chấm:
${answersForAI.map(a => `[${a.index}] "${a.answer}"`).join('\n')}

TIÊU CHÍ CHẤM ĐIỂM (thang 10):
- Độ bựa/biến thái (40%): Càng dâm dục, biến thái, đồi trụy càng điểm cao
- Sáng tạo (30%): Không ai nghĩ ra được, bất ngờ, twist
- Hài hước (20%): Làm người đọc phải bật cười
- Phù hợp ngữ cảnh (10%): Điền vào chỗ trống có nghĩa, đọc lên xuôi

QUY TẮC:
- Chấm công bằng, KHÔNG thiên vị
- Bình luận phải theo giọng "${state.tone}" — cay cú, bựa, hoặc toxic tùy giọng
- Bình luận ngắn gọn 1-2 câu cho mỗi câu trả lời
- Điểm từ 1-10, có thể có số lẻ (VD: 7.5)

Trả về JSON Array CHÍNH XÁC (giữ đúng index):
[
  { "answerIndex": 0, "score": 8.5, "comment": "Bình luận bựa theo giọng ${state.tone}" }
]`;

    return await geminiService.generateJSON<IJudgeResult[]>(judgePrompt);
  }

  private async revealResults(guildId: string, channel: any, results: IJudgeResult[]) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    const sortedResults = [...results].sort((a, b) => b.score - a.score);
    const topResult = sortedResults[0];

    let resultText = '';
    sortedResults.forEach((r, rank) => {
      const sub = state.submissions[r.answerIndex];
      if (!sub) return;

      const filled = state.currentPrompt.replace('_____', `**${sub.answer}**`);
      const medal = rank === 0 ? '👑' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`;

      resultText += `${medal} **${r.score}/10** — ${sub.username}\n`;
      resultText += `${filled}\n`;
      resultText += `💬 *${r.comment}*\n\n`;

      if (!state.scores.has(sub.userId)) {
        state.scores.set(sub.userId, { points: 0, username: sub.username });
      }
      state.scores.get(sub.userId)!.points += r.score;
    });

    const winnerSub = topResult ? state.submissions[topResult.answerIndex] : null;
    const winnerLine = winnerSub ? `\n🏆 Kẻ biến thái nhất vòng này: **${winnerSub.username}** (${topResult.score}/10)!` : '';

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Kết Quả Vòng ${state.currentRoundIndex + 1}/${state.numRounds}`)
      .setDescription(resultText + winnerLine)
      .setColor(0xFFD700);

    await channel.send({ embeds: [embed] });

    state.currentRoundIndex++;
    if (state.currentRoundIndex >= state.numRounds) {
      setTimeout(() => this.endGame(guildId), 4000);
    } else {
      const nextEmbed = new EmbedBuilder()
        .setDescription('⏭️ Vòng tiếp theo trong **5 giây**...')
        .setColor(0x5865F2);
      await channel.send({ embeds: [nextEmbed] });
      setTimeout(() => this.startSubmitPhase(guildId, channel), 5000);
    }
  }

  private async endGame(guildId: string) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    const channel = (await import('../client')).bot.channels.cache.get(state.channelId) as any;
    this.cleanup(state);
    this.activeGames.delete(guildId);

    if (!channel) return;

    const sorted = [...state.scores.entries()].sort((a, b) => b[1].points - a[1].points);

    let ranking = '';
    if (sorted.length > 0) {
      sorted.forEach((entry, idx) => {
        const medal = idx === 0 ? '👑 **KẺ BIẾN THÁI NHẤT**' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
        ranking += `${medal}: <@${entry[0]}> — **${entry[1].points.toFixed(1)} điểm**\n`;
      });
    } else {
      ranking = 'Không ai ghi điểm! 😔';
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 Ai Là Kẻ Biến Thái — KẾT THÚC!')
      .setDescription(`${ranking}\n\nGiọng văn: **${state.tone}**`)
      .setColor(0xFF69B4);

    await channel.send({ embeds: [embed] });
  }

  private cleanup(state: IBienThaiState) {
    if (state.timer) clearTimeout(state.timer);
    if (state.collector) {
      try { state.collector.stop('cleanup'); } catch (_) {}
    }
  }
}

export const bienThaiService = new BienThaiService();
