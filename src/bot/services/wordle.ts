import { geminiService } from './gemini';
import { EmbedBuilder } from 'discord.js';

interface IWordleWord {
  word: string;
  hint: string;
  charCount: number;
}

interface IPlayerGuess {
  guessCount: number;
  solved: boolean;
  guesses: string[];
}

interface IWordleState {
  words: IWordleWord[];
  currentWordIndex: number;
  currentWord: string;
  currentHint: string;
  charCount: number;
  maxGuesses: number;
  scores: Map<string, { wins: number; totalGuesses: number }>;
  playerStates: Map<string, IPlayerGuess>;
  isActive: boolean;
  channelId: string;
  creatorId: string;
  topic: string;
  difficulty: string;
  tone: string;
  timer?: NodeJS.Timeout;
  roundTimeout: number;
  roundMessage?: any;
  collector?: any;
}

class WordleService {
  private activeGames: Map<string, IWordleState> = new Map();

  public isGameActive(guildId: string): boolean {
    return this.activeGames.has(guildId);
  }

  public async startGame(
    guildId: string,
    channel: any,
    creatorId: string,
    numRounds: number,
    topic: string,
    difficulty: string,
    maxGuesses: number,
    tone: string
  ) {
    const roundTimeoutSecs = 120;
    if (this.activeGames.has(guildId)) {
      return { success: false, message: '❌ Đang có Wordle diễn ra! Dùng `/wordle cancel` để hủy.' };
    }

    await channel.send(`🔤 **Wordle** đang khởi động! Chủ đề: **${topic}** (${difficulty}) — Giọng văn: **${tone}**...`);

    try {
      const words = await this.generateWords(numRounds, topic, difficulty, tone);

      if (!words || words.length === 0) {
        return { success: false, message: '❌ Không tạo được từ. Thử lại nhé!' };
      }

      const firstWord = words[0];

      this.activeGames.set(guildId, {
        words,
        currentWordIndex: 0,
        currentWord: firstWord.word.toLowerCase(),
        currentHint: firstWord.hint,
        charCount: firstWord.charCount,
        maxGuesses,
        scores: new Map(),
        playerStates: new Map(),
        isActive: true,
        channelId: channel.id,
        creatorId,
        topic,
        difficulty,
        tone,
        roundTimeout: roundTimeoutSecs * 1000
      });

      await this.startRound(guildId, channel);

      return {
        success: true,
        message: `🎉 **Wordle** chủ đề **${topic}** (${difficulty}) với ${words.length} từ đã bắt đầu!\n📝 Gõ **tiếng Việt có dấu** vào chat để đoán. Tối đa **${maxGuesses} lượt/từ**, **${roundTimeoutSecs}s/từ**.`
      };
    } catch (error) {
      console.error('Wordle Start Error:', error);
      return { success: false, message: '❌ Lỗi hệ thống khi tạo Wordle.' };
    }
  }

  public async cancelGame(guildId: string, userId: string) {
    const state = this.activeGames.get(guildId);
    if (!state) return { success: false, message: 'Không có Wordle nào đang chạy.' };

    if (state.creatorId !== userId) {
      return { success: false, message: 'Bạn không phải người tạo game này.' };
    }

    this.cleanup(state);
    this.activeGames.delete(guildId);
    return { success: true, message: '✅ Đã hủy Wordle.' };
  }

  private countChars(word: string): number {
    return word.replace(/\s/g, '').length;
  }

  private splitToUnits(word: string): string[] {
    return [...word];
  }

  private async generateWords(num: number, topic: string, difficulty: string, tone: string): Promise<IWordleWord[]> {
    const prompt = `Bạn là Wordle Game Master chuyên về tiếng Việt. Tạo ${num} từ/cụm từ Tiếng Việt CÓ DẤU về chủ đề "${topic}".
Giọng văn viết gợi ý: ${tone}.
Độ khó: ${difficulty}.

QUY TẮC TẠO TỪ:
- Từ/cụm từ phải LÀ TỪ THỰC, PHỔ BIẾ̀N, có nghĩa trong đời thực, không được bịa từ vô nghĩa
- Viết thường, có dấu tiếng Việt đầy đủ, có thể có dấu cách
- Ví dụ từ tốt: "con mèo", "bóng đá", "hoa hồng", "phiên chợ", "thảm họa", "trà sữa"
- Ví dụ từ XẤU (KHÔNG TẠO): "xoay mặt vào", "thục cảm" - vô nghĩa, không ai dùng

ĐỘ KHÓ QUYẾ̀T ĐỊNH:
- Dễ: Từ đơn giản, phổ biến, ai cũng biết (VD: "con chó", "cơm", "nước")
- Trung bình: Từ thông dụng nhưng cần suy nghĩ (VD: "phiên chợ", "thảo nguyên")
- Khó: Từ ít gặp hơn, chuyên ngành hoặc học thuật (VD: "nguyệt thực", "khảo cổ")
- Địa ngục: Từ hiếm, cổ xưa, hoặc rất chuyên sâu (VD: "sơn hào hải vị", "thượng lượng")

QUY TẮC HINT (GỢI Ý):
- Hint phải DÀI 2-3 câu, mô tả chi tiết, sinh động
- Viết theo giọng văn "${tone}"
- TUYỆT ĐỐI KHÔNG được chứa đáp án hoặc bất kỳ từ nào trong đáp án
- Hint phải gợi ý đủ để người chơi suy luận ra được, nhưng không quá lộ liễu

Trả về JSON Array CHÍNH XÁC:
[
  { "word": "hoa hồng", "hint": "Hint dài 2-3 câu theo giọng ${tone}, mô tả sinh động" }
]`;

    const result = await geminiService.generateJSON<IWordleWord[]>(prompt);

    return result
      .map(w => ({
        word: w.word.toLowerCase().trim(),
        hint: w.hint,
        charCount: this.countChars(w.word.toLowerCase().trim())
      }))
      .filter(w => w.charCount >= 2 && w.charCount <= 20);
  }

  private async startRound(guildId: string, channel: any) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    if (state.currentWordIndex >= state.words.length) {
      await this.endGame(guildId);
      return;
    }

    const wordData = state.words[state.currentWordIndex];
    state.currentWord = wordData.word.toLowerCase();
    state.currentHint = wordData.hint;
    state.charCount = wordData.charCount;
    state.playerStates.clear();

    const embed = this.buildRoundEmbed(state);
    const message = await channel.send({ embeds: [embed] });
    state.roundMessage = message;

    const collector = channel.createMessageCollector({
      filter: (msg: any) => {
        if (msg.author.bot) return false;
        const content = msg.content.trim();
        if (content.length === 0) return false;
        if (content.startsWith('!') || content.startsWith('/') || content.startsWith('-')) return false;
        return true;
      },
      time: state.roundTimeout
    });

    state.collector = collector;

    collector.on('collect', async (msg: any) => {
      await this.handleGuess(guildId, msg, channel);
    });

    collector.on('end', async (_: any, reason: string) => {
      if (reason === 'time') {
        await this.handleRoundTimeout(guildId, channel);
      }
    });

    state.timer = setTimeout(() => {
      if (state.collector) state.collector.stop('time');
    }, state.roundTimeout);
  }

  private async handleGuess(guildId: string, msg: any, channel: any) {
    const state = this.activeGames.get(guildId);
    if (!state || !state.isActive) return;

    const userId = msg.author.id;
    const username = msg.author.username;
    const guess = msg.content.trim().toLowerCase();
    const guessCharCount = this.countChars(guess);

    if (guessCharCount !== state.charCount) {
      await msg.react('❓');
      try {
        const hint = await msg.reply({ content: `⚠️ Cần **${state.charCount}** ký tự (không tính dấu cách), bạn gõ **${guessCharCount}**. Thử lại!`, allowedMentions: { repliedUser: false } });
        setTimeout(() => { try { hint.delete(); } catch(_) {} }, 5000);
      } catch (_) {}
      return;
    }

    if (!state.playerStates.has(userId)) {
      state.playerStates.set(userId, { guessCount: 0, solved: false, guesses: [] });
    }

    const playerState = state.playerStates.get(userId)!;

    if (playerState.solved) {
      await msg.react('✅');
      return;
    }

    if (playerState.guessCount >= state.maxGuesses) {
      await msg.react('🚫');
      return;
    }

    playerState.guessCount++;
    playerState.guesses.push(guess);

    const feedback = this.evaluateGuess(guess, state.currentWord);
    const feedbackLine = this.formatFeedbackLine(guess, feedback.charResults);

    if (feedback.isCorrect) {
      playerState.solved = true;

      if (!state.scores.has(userId)) {
        state.scores.set(userId, { wins: 0, totalGuesses: 0 });
      }
      const score = state.scores.get(userId)!;
      score.wins++;
      score.totalGuesses += playerState.guessCount;

      const celebEmbed = new EmbedBuilder()
        .setDescription(`🎉 **${username}** đoán đúng! Từ: **${state.currentWord}**\n${feedbackLine}\n📊 Số lượt: **${playerState.guessCount}/${state.maxGuesses}**`)
        .setColor(0x00FF00);

      await channel.send({ embeds: [celebEmbed] });

      this.cleanup(state);
      await this.nextRound(guildId, channel);
      return;
    }

    const remainingGuesses = state.maxGuesses - playerState.guessCount;

    const guessEmbed = new EmbedBuilder()
      .setDescription(`👤 **${username}** — Lượt ${playerState.guessCount}/${state.maxGuesses}\n${feedbackLine}\n${remainingGuesses > 0 ? `Còn **${remainingGuesses}** lượt` : '❌ Hết lượt!'}`)
      .setColor(remainingGuesses > 0 ? 0xFFAA00 : 0xFF0000);

    await channel.send({ embeds: [guessEmbed] });

    if (remainingGuesses <= 0) {
      const allDone = [...state.playerStates.values()].every(p => p.solved || p.guessCount >= state.maxGuesses);
      if (allDone) {
        this.cleanup(state);
        await this.nextRound(guildId, channel);
      }
    }
  }

  private evaluateGuess(guess: string, answer: string): { charResults: string[]; isCorrect: boolean } {
    const guessNoSpace = guess.replace(/\s/g, '');
    const answerNoSpace = answer.replace(/\s/g, '');

    if (guessNoSpace === answerNoSpace) {
      return { charResults: Array(answerNoSpace.length).fill('🟩'), isCorrect: true };
    }

    const guessChars = this.splitToUnits(guessNoSpace);
    const answerChars = this.splitToUnits(answerNoSpace);
    const result: string[] = new Array(guessChars.length).fill('⬛');
    const used = new Array(answerChars.length).fill(false);
    const guessUsed = new Array(guessChars.length).fill(false);

    for (let i = 0; i < guessChars.length && i < answerChars.length; i++) {
      if (guessChars[i] === answerChars[i]) {
        result[i] = '🟩';
        used[i] = true;
        guessUsed[i] = true;
      }
    }

    for (let i = 0; i < guessChars.length; i++) {
      if (guessUsed[i]) continue;
      for (let j = 0; j < answerChars.length; j++) {
        if (!used[j] && guessChars[i] === answerChars[j]) {
          result[i] = '🟨';
          used[j] = true;
          break;
        }
      }
    }

    return { charResults: result, isCorrect: false };
  }

  private formatFeedbackLine(guess: string, charResults: string[]): string {
    const guessNoSpace = guess.replace(/\s/g, '');
    const chars = this.splitToUnits(guessNoSpace);

    let line1 = '';
    let line2 = '';
    for (let i = 0; i < chars.length; i++) {
      line1 += `\`${chars[i]}\` `;
      line2 += `${charResults[i] || '⬛'} `;
    }

    return `${line1.trim()}\n${line2.trim()}`;
  }

  private buildRoundEmbed(state: IWordleState): EmbedBuilder {
    const roundNum = state.currentWordIndex + 1;
    const totalRounds = state.words.length;

    const hasSpace = state.currentWord.includes(' ');
    const wordParts = state.currentWord.split(' ');
    let blankDisplay = '';
    if (hasSpace) {
      blankDisplay = wordParts.map(part => {
        return this.splitToUnits(part).map(() => '⬜').join('');
      }).join('  ');
      blankDisplay += `\n📐 Gồm **${wordParts.length} từ**: ${wordParts.map(p => `(${this.splitToUnits(p).length} chữ)`).join(' + ')}`;
    } else {
      blankDisplay = Array(state.charCount).fill('⬜').join('');
    }

    return new EmbedBuilder()
      .setTitle(`🔤 Wordle — Từ ${roundNum}/${totalRounds}`)
      .setDescription(
        `📝 Gõ **tiếng Việt có dấu** vào chat để đoán!\n\n` +
        `${blankDisplay}\n\n` +
        `💡 **Gợi ý**: ${state.currentHint}\n` +
        `🔢 **Số ký tự**: ${state.charCount} (không tính dấu cách)\n` +
        `🎯 **Lượt đoán tối đa**: ${state.maxGuesses}\n\n` +
        `🟩 = Đúng chữ, đúng vị trí\n` +
        `🟨 = Đúng chữ, sai vị trí\n` +
        `⬛ = Không có chữ này`
      )
      .setColor(0x6AAA64)
      .setFooter({ text: `Chủ đề: ${state.topic} | ${state.difficulty} | Giọng: ${state.tone}` });
  }

  private async handleRoundTimeout(guildId: string, channel: any) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    const timeoutEmbed = new EmbedBuilder()
      .setTitle('⏰ Hết Giờ!')
      .setDescription(`Đáp án là: **${state.currentWord}**\n💡 ${state.currentHint}`)
      .setColor(0xFF4444);

    await channel.send({ embeds: [timeoutEmbed] });

    this.cleanup(state);
    await this.nextRound(guildId, channel);
  }

  private async nextRound(guildId: string, channel: any) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    state.currentWordIndex++;

    if (state.currentWordIndex >= state.words.length) {
      await this.endGame(guildId);
      return;
    }

    const nextEmbed = new EmbedBuilder()
      .setDescription(`⏭️ Từ tiếp theo trong **5 giây**...`)
      .setColor(0x5865F2);

    await channel.send({ embeds: [nextEmbed] });

    setTimeout(() => this.startRound(guildId, channel), 5000);
  }

  private async endGame(guildId: string) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    const channel = (await import('../client')).bot.channels.cache.get(state.channelId) as any;
    this.cleanup(state);
    this.activeGames.delete(guildId);

    if (!channel) return;

    const sorted = [...state.scores.entries()].sort((a, b) => {
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      return a[1].totalGuesses - b[1].totalGuesses;
    });

    let ranking = '';
    if (sorted.length > 0) {
      sorted.forEach((entry, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
        const avgGuesses = (entry[1].totalGuesses / entry[1].wins).toFixed(1);
        ranking += `${medal} <@${entry[0]}>: **${entry[1].wins} từ** (TB ${avgGuesses} lượt/từ)\n`;
      });
    } else {
      ranking = 'Không ai đoán đúng từ nào! 😔';
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 Wordle Kết Thúc!')
      .setDescription(`Chủ đề: **${state.topic}** (${state.difficulty})\n\n${ranking}`)
      .setColor(0xFFD700);

    await channel.send({ embeds: [embed] });
  }

  private cleanup(state: IWordleState) {
    if (state.timer) clearTimeout(state.timer);
    if (state.collector) {
      try { state.collector.stop('cleanup'); } catch (_) {}
    }
  }
}

export const wordleService = new WordleService();
