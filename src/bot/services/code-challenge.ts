import { geminiCore } from '../../shared/services/gemini-core';
import { prisma } from '../../database/prisma';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

interface ICodeChallenge {
    title: string;
    description: string;
    examples: Array<{ input: string; output: string; explanation: string }>;
    constraints: string[];
    hint: string;
}

interface ICodeReview {
    correct: boolean;
    score: number;
    correctnessDetail: string;
    qualityDetail: string;
    efficiencyDetail: string;
    suggestion: string;
    betterSolution: string;
}

interface ISubmission {
    userId: string;
    username: string;
    code: string;
    review: ICodeReview;
    submittedAt: number;
}

interface ISharedChallenge {
    challenge: ICodeChallenge;
    topic: string;
    difficulty: string;
    guildId: string;
    channelId: string;
    creatorId: string;
    createdAt: number;
    timeLimit: number;
    timer?: NodeJS.Timeout;
    submissions: Map<string, ISubmission>;
    submittedUsers: Set<string>;
    pendingReviews: Set<string>;
}

const TOPICS = [
    'Xử lý chuỗi', 'Xử lý mảng', 'Toán & Logic', 'Đếm & Thống kê',
    'Chuyển đổi dữ liệu', 'Validate & Kiểm tra', 'Format & Hiển thị',
    'Xử lý ngày tháng', 'Tính toán thực tế', 'Mini Game Logic',
    'Object & JSON', 'Filter & Search', 'Pattern & Quy luật'
];

const DIFFICULTY_EMOJI: Record<string, string> = {
    'Easy': '🟢',
    'Medium': '🟡',
    'Hard': '🔴'
};

const DEFAULT_TIME_LIMIT_MS = 10 * 60 * 1000;

class CodeChallengeService {
    private activeChallenges: Map<string, ISharedChallenge> = new Map();

    public isActive(guildId: string): boolean {
        return this.activeChallenges.has(guildId);
    }

    public getActive(guildId: string): ISharedChallenge | undefined {
        return this.activeChallenges.get(guildId);
    }

    public hasSubmitted(guildId: string, userId: string): boolean {
        const challenge = this.activeChallenges.get(guildId);
        if (!challenge) return false;
        return challenge.submittedUsers.has(userId);
    }

    public async startChallenge(
        guildId: string,
        creatorId: string,
        channelId: string,
        topic?: string,
        difficulty?: string,
        timeLimitMins?: number
    ): Promise<{ success: boolean; embed?: EmbedBuilder; components?: ActionRowBuilder<ButtonBuilder>[]; message?: string }> {
        if (this.activeChallenges.has(guildId)) {
            return {
                success: false,
                message: '❌ Server đang có code challenge diễn ra! Dùng `/code cancel` để hủy.'
            };
        }

        const selectedTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const selectedDifficulty = difficulty || 'Medium';
        const timeLimit = timeLimitMins ? timeLimitMins * 60 * 1000 : DEFAULT_TIME_LIMIT_MS;
        const timeMins = Math.round(timeLimit / 60000);

        try {
            const challenge = await this.generateChallenge(selectedTopic, selectedDifficulty);

            const state: ISharedChallenge = {
                challenge,
                topic: selectedTopic,
                difficulty: selectedDifficulty,
                guildId,
                channelId,
                creatorId,
                createdAt: Date.now(),
                timeLimit,
                submissions: new Map(),
                submittedUsers: new Set(),
                pendingReviews: new Set()
            };

            state.timer = setTimeout(() => {
                this.endChallenge(guildId);
            }, timeLimit);

            this.activeChallenges.set(guildId, state);

            const diffEmoji = DIFFICULTY_EMOJI[selectedDifficulty] || '🟡';

            const examplesText = challenge.examples
                .map((ex, i) => `**Ví dụ ${i + 1}:**\n\`\`\`\nInput:  ${ex.input}\nOutput: ${ex.output}\n\`\`\`\n${ex.explanation ? `💡 ${ex.explanation}` : ''}`)
                .join('\n\n');

            const constraintsText = challenge.constraints.length > 0
                ? challenge.constraints.map(c => `• ${c}`).join('\n')
                : 'Không có ràng buộc đặc biệt.';

            const embed = new EmbedBuilder()
                .setTitle(`💻 Code Challenge — ${challenge.title}`)
                .setDescription(`👥 **Multiplayer Mode** — Tất cả mọi người đều có thể tham gia!\n\n${challenge.description}`)
                .addFields(
                    { name: '📋 Ví dụ', value: examplesText.substring(0, 1024) },
                    { name: '⚠️ Ràng buộc', value: constraintsText.substring(0, 1024) },
                    { name: '💡 Gợi ý', value: `||${challenge.hint}||`, inline: true },
                    { name: '📊 Thông tin', value: `${diffEmoji} **${selectedDifficulty}** | 🗂️ **${selectedTopic}** | 🌐 **Tự do ngôn ngữ**`, inline: true }
                )
                .setColor(selectedDifficulty === 'Easy' ? 0x22C55E : selectedDifficulty === 'Hard' ? 0xEF4444 : 0xEAB308)
                .setFooter({ text: `⏳ Thời gian: ${timeMins} phút | Ai cũng có thể submit!` })
                .setTimestamp();

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('code_submit_btn')
                    .setLabel('📝 Submit Code')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('code_cancel_btn')
                    .setLabel('🛑 Kết thúc sớm')
                    .setStyle(ButtonStyle.Danger)
            );

            return { success: true, embed, components: [row] };

        } catch (error) {
            console.error('Code Challenge Start Error:', error);
            return { success: false, message: '❌ Không thể tạo đề bài. Thử lại sau nhé!' };
        }
    }

    public async submitCode(
        guildId: string,
        userId: string,
        username: string,
        code: string
    ): Promise<{ success: boolean; message?: string }> {
        const state = this.activeChallenges.get(guildId);

        if (!state) {
            return { success: false, message: '❌ Không có challenge nào đang diễn ra.' };
        }

        if (state.submittedUsers.has(userId)) {
            return { success: false, message: '❌ Bạn đã submit rồi! Chờ kết quả khi hết giờ nhé.' };
        }

        state.submittedUsers.add(userId);
        state.pendingReviews.add(userId);

        try {
            const review = await this.reviewCode(state.challenge, code);

            state.submissions.set(userId, {
                userId,
                username,
                code,
                review,
                submittedAt: Date.now()
            });
            state.pendingReviews.delete(userId);

            return {
                success: true,
                message: `✅ **${username}** đã submit thành công! AI đang chấm... Kết quả sẽ công bố khi hết giờ.\n📊 Đã submit: **${state.submissions.size}** người`
            };
        } catch (error) {
            console.error('Code Review Error:', error);
            state.submittedUsers.delete(userId);
            state.pendingReviews.delete(userId);
            return { success: false, message: '❌ Lỗi khi chấm bài. Thử submit lại nhé!' };
        }
    }

    public async cancelChallenge(guildId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const state = this.activeChallenges.get(guildId);
        if (!state) {
            return { success: false, message: '❌ Không có challenge nào đang diễn ra.' };
        }

        if (state.creatorId !== userId) {
            return { success: false, message: '❌ Chỉ người tạo challenge mới được kết thúc sớm.' };
        }

        await this.endChallenge(guildId);
        return { success: true, message: '🛑 Challenge đã kết thúc!' };
    }

    public async endChallenge(guildId: string): Promise<void> {
        const state = this.activeChallenges.get(guildId);
        if (!state) return;

        if (state.timer) clearTimeout(state.timer);

        if (state.pendingReviews.size > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        const channel = await this.getChannel(state.channelId);
        if (!channel) {
            this.activeChallenges.delete(guildId);
            return;
        }

        const submissions = [...state.submissions.values()]
            .sort((a, b) => {
                if (b.review.score !== a.review.score) return b.review.score - a.review.score;
                return a.submittedAt - b.submittedAt;
            });

        const diffEmoji = DIFFICULTY_EMOJI[state.difficulty] || '🟡';

        if (submissions.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('🏁 Code Challenge Kết Thúc!')
                .setDescription(`Đề bài: **${state.challenge.title}**\n\n😢 Không có ai submit bài.`)
                .setColor(0x6B7280)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            this.activeChallenges.delete(guildId);
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        let rankingText = '';

        for (let i = 0; i < submissions.length; i++) {
            const sub = submissions[i];
            const medal = i < 3 ? medals[i] : `**#${i + 1}**`;
            const correctIcon = sub.review.correct ? '✅' : '❌';
            const timeTaken = Math.round((sub.submittedAt - state.createdAt) / 1000);
            const timeStr = timeTaken >= 60
                ? `${Math.floor(timeTaken / 60)}m${timeTaken % 60}s`
                : `${timeTaken}s`;

            rankingText += `${medal} ${correctIcon} **${sub.username}** — **${sub.review.score}**/100 (⏱️ ${timeStr})\n`;
        }

        const resultEmbed = new EmbedBuilder()
            .setTitle('🏆 Code Challenge — Bảng Xếp Hạng!')
            .setDescription(`Đề bài: **${state.challenge.title}**\n${diffEmoji} ${state.difficulty} | 🗂️ ${state.topic} | 🌐 Tự do ngôn ngữ\n\n${rankingText}`)
            .setColor(0xFFD700)
            .setFooter({ text: `${submissions.length} người tham gia | Dùng /code start để chơi tiếp!` })
            .setTimestamp();

        await channel.send({ embeds: [resultEmbed] });

        if (submissions.length > 0) {
            const winner = submissions[0];
            const detailEmbed = new EmbedBuilder()
                .setTitle(`📖 Chi tiết — Top 1: ${winner.username}`)
                .addFields(
                    { name: '🎯 Correctness', value: winner.review.correctnessDetail.substring(0, 1024) },
                    { name: '✨ Code Quality', value: winner.review.qualityDetail.substring(0, 1024) },
                    { name: '⚡ Efficiency', value: winner.review.efficiencyDetail.substring(0, 1024) },
                    { name: '💡 Gợi ý cải thiện', value: winner.review.suggestion.substring(0, 1024) }
                )
                .setColor(0x6366F1);

            if (winner.review.betterSolution && winner.review.betterSolution.length > 0) {
                const solutionText = winner.review.betterSolution.length > 1000
                    ? winner.review.betterSolution.substring(0, 997) + '...'
                    : winner.review.betterSolution;
                detailEmbed.addFields({
                    name: '📖 Lời giải tham khảo',
                    value: `\`\`\`\n${solutionText}\n\`\`\``
                });
            }

            await channel.send({ embeds: [detailEmbed] });
        }

        for (const sub of submissions) {
            try {
                await prisma.codeSubmission.create({
                    data: {
                        userId: sub.userId,
                        guildId,
                        topic: state.topic,
                        difficulty: state.difficulty,
                        language: 'any',
                        challenge: JSON.stringify(state.challenge),
                        code: sub.code,
                        score: sub.review.score,
                        feedback: JSON.stringify(sub.review)
                    }
                });
                await this.updateLeaderboard(sub.userId, guildId, sub.review.score, state.difficulty);
            } catch (e) {
                console.error(`Failed to save submission for ${sub.userId}:`, e);
            }
        }

        this.activeChallenges.delete(guildId);
    }

    public async getLeaderboard(guildId: string): Promise<EmbedBuilder> {
        const records = await prisma.codeLeaderboard.findMany({
            where: { guildId },
            orderBy: { totalScore: 'desc' },
            take: 10
        });

        const embed = new EmbedBuilder()
            .setTitle('💻 Top 10 — Luyện Code')
            .setColor(0x6366F1);

        if (!records.length) {
            embed.setDescription('Chưa có ai luyện code. Dùng `/code start` để bắt đầu!');
            return embed;
        }

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        const lines = await Promise.all(records.map(async (r, i) => {
            const identity = await prisma.userIdentity.findUnique({ where: { userId: r.userId } });
            const name = identity?.nickname || r.userId.slice(0, 8);
            return `${medals[i]} **${name}** — 🏆 **${r.totalScore.toLocaleString()}** điểm | 📝 ${r.totalSolved} bài (🟢${r.easySolved} 🟡${r.mediumSolved} 🔴${r.hardSolved}) | Best: **${r.bestScore}**`;
        }));

        embed.setDescription(lines.join('\n'));
        return embed;
    }

    public async getUserStats(userId: string, guildId: string): Promise<EmbedBuilder> {
        const record = await prisma.codeLeaderboard.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        const recentSubmissions = await prisma.codeSubmission.findMany({
            where: { userId, guildId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const embed = new EmbedBuilder()
            .setTitle('📊 Thống Kê Luyện Code')
            .setColor(0x8B5CF6);

        if (!record) {
            embed.setDescription('Bạn chưa giải bài nào. Dùng `/code start` để bắt đầu!');
            return embed;
        }

        const avgScore = record.totalSolved > 0
            ? Math.round(record.totalScore / record.totalSolved)
            : 0;

        embed.addFields(
            { name: '🏆 Tổng điểm', value: `**${record.totalScore.toLocaleString()}**`, inline: true },
            { name: '📝 Tổng bài giải', value: `**${record.totalSolved}**`, inline: true },
            { name: '📈 Điểm TB', value: `**${avgScore}/100**`, inline: true },
            { name: '⭐ Điểm cao nhất', value: `**${record.bestScore}/100**`, inline: true },
            { name: '📊 Phân loại', value: `🟢 Easy: **${record.easySolved}** | 🟡 Medium: **${record.mediumSolved}** | 🔴 Hard: **${record.hardSolved}**` }
        );

        if (recentSubmissions.length > 0) {
            const recentLines = recentSubmissions.map(s => {
                const diffEmoji = DIFFICULTY_EMOJI[s.difficulty] || '🟡';
                const scoreEmoji = s.score >= 80 ? '✅' : s.score >= 50 ? '🟡' : '❌';
                return `${scoreEmoji} **${s.score}**/100 — ${diffEmoji} ${s.topic} (${s.language})`;
            });
            embed.addFields({ name: '🕐 5 bài gần nhất', value: recentLines.join('\n') });
        }

        return embed;
    }

    private async getChannel(channelId: string): Promise<any> {
        try {
            const { bot } = await import('../client');
            return bot.channels.cache.get(channelId) as any;
        } catch {
            return null;
        }
    }

    private async generateChallenge(topic: string, difficulty: string): Promise<ICodeChallenge> {
        const prompt = `Bạn là người ra đề lập trình dạng TƯ DUY NHANH cho nhóm bạn chơi trên Discord.

Chủ đề: ${topic}
Độ khó: ${difficulty}

QUY TẮC QUAN TRỌNG:
- Đề bài phải NGẮN GỌN, dễ hiểu, giải được trong 5-10 phút
- KHÔNG dùng giải thuật phức tạp (không DP, không đệ quy sâu, không cấu trúc dữ liệu cao cấp)
- Chỉ cần vòng lặp cơ bản, if/else, xử lý mảng/chuỗi đơn giản
- Đề bài mang tính THỰC TẾ, vui vẻ, gần gũi đời thường (ví dụ: tính tiền, format tên, kiểm tra mật khẩu, đếm từ, mini game...)
- Easy = viết 1 function đơn giản (3-8 dòng), Medium = logic phức tạp hơn chút (8-15 dòng), Hard = kết hợp nhiều bước (15-25 dòng)
- Đề bài KHÔNG ép ngôn ngữ lập trình cụ thể — người chơi được tự do dùng bất kỳ ngôn ngữ nào
- Mỗi ví dụ phải có input/output RÕ RÀNG, cụ thể
- Ví dụ input/output dùng dạng tổng quát (không dùng cú pháp riêng của ngôn ngữ nào)

Trả về JSON:
{
  "title": "Tên bài ngắn gọn, vui vẻ",
  "description": "Mô tả bài toán (tiếng Việt, 2-4 câu, dễ hiểu)",
  "examples": [
    { "input": "ví dụ input cụ thể", "output": "output mong đợi", "explanation": "giải thích ngắn" }
  ],
  "constraints": ["ràng buộc đơn giản"],
  "hint": "gợi ý nhẹ nhàng"
}`;

        return await geminiCore.generateJSON<ICodeChallenge>(prompt);
    }

    private async reviewCode(challenge: ICodeChallenge, code: string): Promise<ICodeReview> {
        const prompt = `Bạn là senior code reviewer. Chấm bài code sau.
User được tự do dùng BẤT KỲ ngôn ngữ lập trình nào. Hãy tự nhận diện ngôn ngữ và chấm theo LOGIC, không phạt vì chọn ngôn ngữ.

ĐỀ BÀI:
${JSON.stringify(challenge, null, 2)}

CODE CỦA USER:
\`\`\`
${code}
\`\`\`

Chấm theo thang 100 điểm:
- Correctness (70%): Code có giải đúng bài toán không? Logic có chính xác không?
- Code Quality (15%): Clean code, naming, readability
- Efficiency (15%): Cách giải có hợp lý không?

Trả về JSON:
{
  "correct": true/false,
  "score": 0-100,
  "correctnessDetail": "Phân tích chi tiết tính đúng sai (tiếng Việt, 2-3 câu)",
  "qualityDetail": "Nhận xét code quality (tiếng Việt, 1-2 câu)",
  "efficiencyDetail": "Nhận xét cách giải (tiếng Việt, 1-2 câu)",
  "suggestion": "Gợi ý cải thiện cụ thể (tiếng Việt, 2-3 câu)",
  "betterSolution": "Lời giải tham khảo tối ưu (dùng pseudocode hoặc JavaScript)"
}`;

        return await geminiCore.generateJSON<ICodeReview>(prompt);
    }

    private async updateLeaderboard(userId: string, guildId: string, score: number, difficulty: string): Promise<void> {
        const existing = await prisma.codeLeaderboard.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        const difficultyUpdate: Record<string, number> = {};
        if (difficulty === 'Easy') difficultyUpdate.easySolved = (existing?.easySolved || 0) + 1;
        else if (difficulty === 'Medium') difficultyUpdate.mediumSolved = (existing?.mediumSolved || 0) + 1;
        else if (difficulty === 'Hard') difficultyUpdate.hardSolved = (existing?.hardSolved || 0) + 1;

        await prisma.codeLeaderboard.upsert({
            where: { userId_guildId: { userId, guildId } },
            update: {
                totalScore: (existing?.totalScore || 0) + score,
                totalSolved: (existing?.totalSolved || 0) + 1,
                bestScore: Math.max(existing?.bestScore || 0, score),
                ...difficultyUpdate
            },
            create: {
                userId,
                guildId,
                totalScore: score,
                totalSolved: 1,
                bestScore: score,
                easySolved: difficulty === 'Easy' ? 1 : 0,
                mediumSolved: difficulty === 'Medium' ? 1 : 0,
                hardSolved: difficulty === 'Hard' ? 1 : 0
            }
        });
    }
}

export const codeChallengeService = new CodeChallengeService();
