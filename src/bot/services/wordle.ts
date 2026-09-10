import { geminiService } from './gemini';
import { EmbedBuilder } from 'discord.js';

interface IWordleWord {
  word: string;
  hint: string;
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
  wordLength: number;
  maxGuesses: number;
  scores: Map<string, { wins: number; totalGuesses: number }>;
  playerStates: Map<string, IPlayerGuess>;
  isActive: boolean;
  channelId: string;
  creatorId: string;
  topic: string;
  difficulty: string;
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
    roundTimeoutSecs: number
  ) {
    if (this.activeGames.has(guildId)) {
      return { success: false, message: '❌ Đang có Wordle diễn ra! Dùng `/wordle cancel` để hủy.' };
    }

    await channel.send(`🔤 **Wordle** đang khởi động! Chủ đề: **${topic}** (${difficulty})...`);

    try {
      const wordLength = this.getWordLength(difficulty);
      const words = await this.generateWords(numRounds, topic, difficulty, wordLength);

      if (!words || words.length === 0) {
        return { success: false, message: '❌ Không tạo được từ. Thử lại nhé!' };
      }

      this.activeGames.set(guildId, {
        words,
        currentWordIndex: 0,
        currentWord: words[0].word.toUpperCase(),
        currentHint: words[0].hint,
        wordLength,
        maxGuesses,
        scores: new Map(),
        playerStates: new Map(),
        isActive: true,
        channelId: channel.id,
        creatorId,
        topic,
        difficulty,
        roundTimeout: roundTimeoutSecs * 1000
      });

      await this.startRound(guildId, channel);

      return {
        success: true,
        message: `🎉 **Wordle** chủ đề **${topic}** (${difficulty}) với ${words.length} từ đã bắt đầu!\n📝 Gõ từ **${wordLength} chữ cái** vào chat để đoán. Tối đa **${maxGuesses} lượt/từ**, **${roundTimeoutSecs}s/từ**.`
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

  private getWordLength(difficulty: string): number {
    const d = difficulty.toLowerCase();
    if (d.includes('dễ') || d.includes('easy')) return 4;
    if (d.includes('khó') || d.includes('hard')) return 6;
    if (d.includes('địa ngục') || d.includes('hell') || d.includes('nightmare')) return 7;
    return 5;
  }

  private async generateWords(num: number, topic: string, difficulty: string, wordLength: number): Promise<IWordleWord[]> {
    const prompt = `Bạn là Wordle Game Master. Tạo ${num} từ Tiếng Việt KHÔNG DẤU (viết hoa) về chủ đề "${topic}".
Độ khó: ${difficulty}.

QUAN TRỌNG:
- Mỗi từ PHẢI có ĐÚNG ${wordLength} chữ cái (không tính dấu cách)
- Từ KHÔNG DẤU, viết hoa, không khoảng trắng, chỉ A-Z
- Ví dụ: NHACO (nhà cỏ), BALON (bóng), MEOCON (mèo con)
- Từ phải là từ thực tế, có nghĩa, liên quan đến chủ đề
- Hint phải gợi ý nhưng KHÔNG được chứa đáp án

Trả về JSON Array CHÍNH XÁC:
[
  { "word": "ABCDE", "hint": "Gợi ý ngắn gọn" }
]`;

    const result = await geminiService.generateJSON<IWordleWord[]>(prompt);

    return result
      .map(w => ({
        word: w.word.toUpperCase().replace(/[^A-Z]/g, ''),
        hint: w.hint
      }))
      .filter(w => w.word.length >= 3 && w.word.length <= 8);
  }

  private async startRound(guildId: string, channel: any) {
    const state = this.activeGames.get(guildId);
    if (!state) return;

    if (state.currentWordIndex >= state.words.length) {
      await this.endGame(guildId);
      return;
    }

    const wordData = state.words[state.currentWordIndex];
    state.currentWord = wordData.word.toUpperCase();
    state.currentHint = wordData.hint;
    state.wordLength = state.currentWord.length;
    state.playerStates.clear();

    const embed = this.buildRoundEmbed(state, []);
    const message = await channel.send({ embeds: [embed] });
    state.roundMessage = message;

    const collector = channel.createMessageCollector({
      filter: (msg: any) => {
        if (msg.author.bot) return false;
        const content = msg.content.trim().toUpperCase().replace(/[^A-Z]/g, '');
        return content.length === state.wordLength;
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
    const guess = msg.content.trim().toUpperCase().replace(/[^A-Z]/g, '');

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
    const feedbackLine = `\`${guess}\` → ${feedback.emojis}`;

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

      const allSolved = [...state.playerStates.values()].every(p => p.solved || p.guessCount >= state.maxGuesses);
      if (allSolved) {
        this.cleanup(state);
        await this.nextRound(guildId, channel);
      }
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

  private evaluateGuess(guess: string, answer: string): { emojis: string; isCorrect: boolean } {
    if (guess === answer) {
      return { emojis: '🟩'.repeat(answer.length), isCorrect: true };
    }

    const result: string[] = new Array(answer.length).fill('⬛');
    const answerChars = answer.split('');
    const guessChars = guess.split('');
    const used = new Array(answer.length).fill(false);

    for (let i = 0; i < guessChars.length; i++) {
      if (guessChars[i] === answerChars[i]) {
        result[i] = '🟩';
        used[i] = true;
        guessChars[i] = '_';
      }
    }

    for (let i = 0; i < guessChars.length; i++) {
      if (guessChars[i] === '_') continue;
      for (let j = 0; j < answerChars.length; j++) {
        if (!used[j] && guessChars[i] === answerChars[j]) {
          result[i] = '🟨';
          used[j] = true;
          break;
        }
      }
    }

    return { emojis: result.join(''), isCorrect: false };
  }

  private buildRoundEmbed(state: IWordleState, _guessHistory: string[]): EmbedBuilder {
    const blanks = '⬜'.repeat(state.wordLength);
    const roundNum = state.currentWordIndex + 1;
    const totalRounds = state.words.length;

    return new EmbedBuilder()
      .setTitle(`🔤 Wordle — Từ ${roundNum}/${totalRounds}`)
      .setDescription(
        `📝 Gõ từ **${state.wordLength} chữ cái** (không dấu) vào chat để đoán!\n\n` +
        `${blanks}\n\n` +
        `💡 **Gợi ý**: ${state.currentHint}\n` +
        `🎯 **Lượt đoán tối đa**: ${state.maxGuesses}\n\n` +
        `🟩 = Đúng chữ, đúng vị trí\n` +
        `🟨 = Đúng chữ, sai vị trí\n` +
        `⬛ = Không có chữ này`
      )
      .setColor(0x6AAA64)
      .setFooter({ text: `Chủ đề: ${state.topic} | ${state.difficulty}` });
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
