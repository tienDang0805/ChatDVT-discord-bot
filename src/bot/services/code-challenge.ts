import { geminiCore } from '../../shared/services/gemini-core';
import { prisma } from '../../database/prisma';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

interface ICodeQuestion {
    type: string;
    codeSnippet: string;
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    explanation: string;
}

interface ICodeGameState {
    questions: ICodeQuestion[];
    currentQuestionIndex: number;
    scores: Map<string, { score: number; correct: number; totalTime: number; username: string }>;
    guildId: string;
    channelId: string;
    creatorId: string;
    topic: string;
    difficulty: string;
    isActive: boolean;
    timer?: NodeJS.Timeout;
    questionStartTime?: number;
    questionMessage?: any;
    answeredUsers: Set<string>;
    timePerQuestion: number;
}

const QUESTION_TYPES = ['find_bug', 'fill_blank', 'guess_output', 'find_bug', 'fill_blank', 'guess_output'];

const TYPE_LABELS: Record<string, string> = {
    'find_bug': '🐛 Tìm Bug',
    'fill_blank': '📝 Điền Chỗ Trống',
    'guess_output': '🔮 Đoán Output'
};

const TYPE_EMOJI: Record<string, string> = {
    'find_bug': '🐛',
    'fill_blank': '📝',
    'guess_output': '🔮'
};

const DIFFICULTY_EMOJI: Record<string, string> = {
    'Easy': '🟢',
    'Medium': '🟡',
    'Hard': '🔴'
};

const TOPICS = [
    'JavaScript', 'Python', 'Xử lý chuỗi', 'Xử lý mảng',
    'Toán & Logic', 'If/Else & Loop', 'Object & JSON', 'Function',
    'Biến & Kiểu dữ liệu', 'So sánh & Điều kiện', 'Lỗi hay gặp', 'Tổng hợp'
];

class CodeChallengeService {
    private activeGames: Map<string, ICodeGameState> = new Map();

    public isActive(guildId: string): boolean {
        return this.activeGames.has(guildId);
    }

    public getActive(guildId: string): ICodeGameState | undefined {
        return this.activeGames.get(guildId);
    }

    public hasAnswered(guildId: string, userId: string): boolean {
        const game = this.activeGames.get(guildId);
        if (!game) return false;
        return game.answeredUsers.has(userId);
    }

    public async startGame(
        guildId: string,
        creatorId: string,
        channelId: string,
        numQuestions?: number,
        topic?: string,
        difficulty?: string,
        timeSecs?: number
    ): Promise<{ success: boolean; message: string }> {
        if (this.activeGames.has(guildId)) {
            return { success: false, message: '❌ Server đang có code game diễn ra! Dùng `/code cancel` để hủy.' };
        }

        const selectedTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const selectedDifficulty = difficulty || 'Medium';
        const questionCount = numQuestions || 5;
        const timePerQuestion = (timeSecs || 30) * 1000;

        try {
            const questions = await this.generateQuestions(questionCount, selectedTopic, selectedDifficulty);

            if (!questions || questions.length === 0) {
                return { success: false, message: '❌ Không tạo được câu hỏi. Thử lại nhé!' };
            }

            const state: ICodeGameState = {
                questions,
                currentQuestionIndex: 0,
                scores: new Map(),
                guildId,
                channelId,
                creatorId,
                topic: selectedTopic,
                difficulty: selectedDifficulty,
                isActive: true,
                answeredUsers: new Set(),
                timePerQuestion
            };

            this.activeGames.set(guildId, state);
            await this.sendNextQuestion(guildId);

            return {
                success: true,
                message: `🎮 **Code Challenge** đã bắt đầu!\n📋 **${questionCount}** câu | 🗂️ **${selectedTopic}** | ${DIFFICULTY_EMOJI[selectedDifficulty] || '🟡'} **${selectedDifficulty}** | ⏱️ **${timeSecs || 30}s**/câu\n\n👥 Ai cũng có thể tham gia — bấm đáp án để trả lời!`
            };
        } catch (error) {
            console.error('Code Game Start Error:', error);
            return { success: false, message: '❌ Lỗi khi tạo game. Thử lại sau!' };
        }
    }

    public async submitAnswer(
        guildId: string,
        userId: string,
        username: string,
        answerIndex: number
    ): Promise<{ success: boolean; message: string }> {
        const state = this.activeGames.get(guildId);
        if (!state || !state.isActive) {
            return { success: false, message: '❌ Không có game nào đang chạy.' };
        }

        if (state.answeredUsers.has(userId)) {
            return { success: false, message: '❌ Bạn đã trả lời câu này rồi!' };
        }

        state.answeredUsers.add(userId);

        const currentQ = state.questions[state.currentQuestionIndex];
        const isCorrect = answerIndex === currentQ.correctAnswerIndex;
        const timeTaken = Date.now() - (state.questionStartTime || Date.now());

        if (!state.scores.has(userId)) {
            state.scores.set(userId, { score: 0, correct: 0, totalTime: 0, username });
        }

        const userScore = state.scores.get(userId)!;
        userScore.totalTime += timeTaken;

        if (isCorrect) {
            const timeBonus = Math.max(0, Math.round((state.timePerQuestion - timeTaken) / 100));
            const basePoints = state.difficulty === 'Easy' ? 10 : state.difficulty === 'Hard' ? 30 : 20;
            userScore.score += basePoints + timeBonus;
            userScore.correct += 1;
            return { success: true, message: `✅ **Chính xác!** (+${basePoints + timeBonus} điểm)` };
        }

        return { success: false, message: `❌ Sai rồi! Đáp án đúng: **${String.fromCharCode(65 + currentQ.correctAnswerIndex)}**` };
    }

    public async cancelGame(guildId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const state = this.activeGames.get(guildId);
        if (!state) {
            return { success: false, message: '❌ Không có game nào đang chạy.' };
        }
        if (state.creatorId !== userId) {
            return { success: false, message: '❌ Chỉ người tạo game mới được hủy.' };
        }

        this.clearTimer(state);
        if (state.questionMessage) {
            try {
                const rows = state.questionMessage.components.map((row: any) =>
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        row.components.map((btn: any) => ButtonBuilder.from(btn).setDisabled(true))
                    )
                );
                await state.questionMessage.edit({ components: rows });
            } catch {}
        }
        this.activeGames.delete(guildId);
        return { success: true, message: '🛑 Game đã bị hủy.' };
    }

    public async getLeaderboard(guildId: string): Promise<EmbedBuilder> {
        const records = await prisma.codeLeaderboard.findMany({
            where: { guildId },
            orderBy: { totalScore: 'desc' },
            take: 10
        });

        const embed = new EmbedBuilder()
            .setTitle('💻 Top 10 — Code Challenge')
            .setColor(0x6366F1);

        if (!records.length) {
            embed.setDescription('Chưa có ai chơi. Dùng `/code start` để bắt đầu!');
            return embed;
        }

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        const lines = await Promise.all(records.map(async (r, i) => {
            const identity = await prisma.userIdentity.findUnique({ where: { userId: r.userId } });
            const name = identity?.nickname || r.userId.slice(0, 8);
            return `${medals[i]} **${name}** — 🏆 **${r.totalScore.toLocaleString()}** điểm | ✅ ${r.totalSolved} đúng (🟢${r.easySolved} 🟡${r.mediumSolved} 🔴${r.hardSolved})`;
        }));

        embed.setDescription(lines.join('\n'));
        return embed;
    }

    public async getUserStats(userId: string, guildId: string): Promise<EmbedBuilder> {
        const record = await prisma.codeLeaderboard.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        const embed = new EmbedBuilder()
            .setTitle('📊 Thống Kê Code Challenge')
            .setColor(0x8B5CF6);

        if (!record) {
            embed.setDescription('Bạn chưa chơi game nào. Dùng `/code start` để bắt đầu!');
            return embed;
        }

        embed.addFields(
            { name: '🏆 Tổng điểm', value: `**${record.totalScore.toLocaleString()}**`, inline: true },
            { name: '✅ Tổng câu đúng', value: `**${record.totalSolved}**`, inline: true },
            { name: '⭐ Điểm cao nhất', value: `**${record.bestScore}**`, inline: true },
            { name: '📊 Phân loại', value: `🟢 Easy: **${record.easySolved}** | 🟡 Medium: **${record.mediumSolved}** | 🔴 Hard: **${record.hardSolved}**` }
        );

        return embed;
    }

    private async sendNextQuestion(guildId: string): Promise<void> {
        const state = this.activeGames.get(guildId);
        if (!state) return;

        this.clearTimer(state);
        state.answeredUsers.clear();

        const channel = await this.getChannel(state.channelId);
        if (!channel) {
            this.activeGames.delete(guildId);
            return;
        }

        if (state.currentQuestionIndex >= state.questions.length) {
            await this.endGame(guildId);
            return;
        }

        const q = state.questions[state.currentQuestionIndex];
        const timeSecs = state.timePerQuestion / 1000;
        const typeLabel = TYPE_LABELS[q.type] || '❓ Câu hỏi';
        const typeEmoji = TYPE_EMOJI[q.type] || '❓';

        const embed = new EmbedBuilder()
            .setTitle(`${typeEmoji} Câu ${state.currentQuestionIndex + 1}/${state.questions.length}: ${typeLabel}`)
            .setDescription(`${q.question}\n\n\`\`\`\n${q.codeSnippet}\n\`\`\``)
            .setColor(0x3B82F6)
            .setFooter({ text: `⏱️ ${timeSecs}s | Chọn đáp án bên dưới` })
            .setTimestamp();

        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        const row1 = new ActionRowBuilder<ButtonBuilder>();
        const row2 = new ActionRowBuilder<ButtonBuilder>();

        q.answers.forEach((ans, idx) => {
            const label = `${String.fromCharCode(65 + idx)}. ${ans}`;
            const btn = new ButtonBuilder()
                .setCustomId(`code_answer_${idx}`)
                .setLabel(label.length > 80 ? label.substring(0, 77) + '...' : label)
                .setStyle(ButtonStyle.Primary);
            if (idx < 2) row1.addComponents(btn);
            else row2.addComponents(btn);
        });

        rows.push(row1);
        if (row2.components.length > 0) rows.push(row2);

        const message = await channel.send({ embeds: [embed], components: rows });
        state.questionMessage = message;
        state.questionStartTime = Date.now();

        state.timer = setTimeout(() => {
            this.revealAndNext(guildId);
        }, state.timePerQuestion);
    }

    private async revealAndNext(guildId: string): Promise<void> {
        const state = this.activeGames.get(guildId);
        if (!state) return;

        this.clearTimer(state);

        if (state.questionMessage) {
            try {
                const rows = state.questionMessage.components.map((row: any) =>
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        row.components.map((btn: any) => ButtonBuilder.from(btn).setDisabled(true))
                    )
                );
                await state.questionMessage.edit({ components: rows });
            } catch {}
        }

        const q = state.questions[state.currentQuestionIndex];
        const correctAnswer = q.answers[q.correctAnswerIndex];

        const channel = await this.getChannel(state.channelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('⏰ Hết giờ!')
                .setDescription(`Đáp án đúng: **${String.fromCharCode(65 + q.correctAnswerIndex)}. ${correctAnswer}**\n\n💡 ${q.explanation}`)
                .setColor(0x22C55E);
            await channel.send({ embeds: [embed] });
        }

        state.currentQuestionIndex++;
        setTimeout(() => this.sendNextQuestion(guildId), 4000);
    }

    private async endGame(guildId: string): Promise<void> {
        const state = this.activeGames.get(guildId);
        if (!state) return;

        this.clearTimer(state);

        const channel = await this.getChannel(state.channelId);
        this.activeGames.delete(guildId);

        if (!channel) return;

        const sorted = [...state.scores.entries()]
            .sort((a, b) => {
                if (b[1].score !== a[1].score) return b[1].score - a[1].score;
                return a[1].totalTime - b[1].totalTime;
            });

        const diffEmoji = DIFFICULTY_EMOJI[state.difficulty] || '🟡';

        if (sorted.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('🏁 Code Challenge Kết Thúc!')
                .setDescription(`${diffEmoji} ${state.difficulty} | 🗂️ ${state.topic}\n\n😢 Không có ai tham gia.`)
                .setColor(0x6B7280)
                .setTimestamp();
            await channel.send({ embeds: [embed] });
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        let ranking = '';

        for (let i = 0; i < sorted.length; i++) {
            const [, data] = sorted[i];
            const medal = i < 3 ? medals[i] : `**#${i + 1}**`;
            const avgTime = (data.totalTime / state.questions.length / 1000).toFixed(1);
            ranking += `${medal} **${data.username}** — 🏆 **${data.score}** điểm | ✅ ${data.correct}/${state.questions.length} đúng (avg ${avgTime}s)\n`;
        }

        const resultEmbed = new EmbedBuilder()
            .setTitle('🏆 Code Challenge — Kết Quả!')
            .setDescription(`${diffEmoji} ${state.difficulty} | 🗂️ ${state.topic} | 📋 ${state.questions.length} câu\n\n${ranking}`)
            .setColor(0xFFD700)
            .setFooter({ text: `Dùng /code start để chơi tiếp!` })
            .setTimestamp();

        await channel.send({ embeds: [resultEmbed] });

        for (const [userId, data] of sorted) {
            try {
                await this.updateLeaderboard(userId, guildId, data.score, data.correct, state.difficulty);
            } catch (e) {
                console.error(`Failed to update leaderboard for ${userId}:`, e);
            }
        }
    }

    private async generateQuestions(num: number, topic: string, difficulty: string): Promise<ICodeQuestion[]> {
        const prompt = `Bạn là người ra đề CODE CHALLENGE dạng giải trí cho nhóm bạn chơi trên Discord.

Tạo ${num} câu hỏi trắc nghiệm về lập trình. Chủ đề: ${topic}. Độ khó: ${difficulty}.

CÁC DẠNG CÂU HỎI (trộn đều các dạng):
1. "find_bug" — Cho đoạn code có bug, hỏi bug nằm ở đâu / cách sửa
2. "fill_blank" — Cho đoạn code có chỗ trống (___), hỏi điền gì vào
3. "guess_output" — Cho đoạn code hoàn chỉnh, hỏi output là gì

QUY TẮC:
- Code snippet NGẮN (3-8 dòng), dễ đọc, KHÔNG phức tạp
- Mỗi câu có 4 đáp án, chỉ 1 đúng
- Đáp án sai phải "hợp lý" (dễ nhầm), không quá vô lý
- Câu hỏi bằng tiếng Việt, code bằng JavaScript hoặc Python
- Giải thích đáp án ngắn gọn (1-2 câu tiếng Việt)
- Easy = kiến thức cơ bản, Medium = phải nghĩ chút, Hard = có trick/edge case
- Đảm bảo correctAnswerIndex chính xác

Trả về JSON Array:
[
  {
    "type": "find_bug" | "fill_blank" | "guess_output",
    "codeSnippet": "đoạn code (dùng \\n cho xuống dòng)",
    "question": "Câu hỏi (tiếng Việt)",
    "answers": ["A", "B", "C", "D"],
    "correctAnswerIndex": 0,
    "explanation": "Giải thích ngắn gọn tại sao đáp án đó đúng"
  }
]`;

        return await geminiCore.generateJSON<ICodeQuestion[]>(prompt);
    }

    private async updateLeaderboard(userId: string, guildId: string, score: number, correct: number, difficulty: string): Promise<void> {
        const existing = await prisma.codeLeaderboard.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        const diffUpdate: Record<string, number> = {};
        if (difficulty === 'Easy') diffUpdate.easySolved = (existing?.easySolved || 0) + correct;
        else if (difficulty === 'Medium') diffUpdate.mediumSolved = (existing?.mediumSolved || 0) + correct;
        else if (difficulty === 'Hard') diffUpdate.hardSolved = (existing?.hardSolved || 0) + correct;

        await prisma.codeLeaderboard.upsert({
            where: { userId_guildId: { userId, guildId } },
            update: {
                totalScore: (existing?.totalScore || 0) + score,
                totalSolved: (existing?.totalSolved || 0) + correct,
                bestScore: Math.max(existing?.bestScore || 0, score),
                ...diffUpdate
            },
            create: {
                userId,
                guildId,
                totalScore: score,
                totalSolved: correct,
                bestScore: score,
                easySolved: difficulty === 'Easy' ? correct : 0,
                mediumSolved: difficulty === 'Medium' ? correct : 0,
                hardSolved: difficulty === 'Hard' ? correct : 0
            }
        });
    }

    private async getChannel(channelId: string): Promise<any> {
        try {
            const { bot } = await import('../client');
            return bot.channels.cache.get(channelId) as any;
        } catch {
            return null;
        }
    }

    private clearTimer(state: ICodeGameState): void {
        if (state.timer) clearTimeout(state.timer);
    }
}

export const codeChallengeService = new CodeChallengeService();
