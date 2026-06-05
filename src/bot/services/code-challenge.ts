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

interface IActiveChallenge {
    challenge: ICodeChallenge;
    topic: string;
    difficulty: string;
    language: string;
    guildId: string;
    userId: string;
    channelId: string;
    createdAt: number;
}

const TOPICS = [
    'Array', 'String', 'HashMap/Dictionary', 'Linked List', 'Stack/Queue',
    'Sorting', 'Binary Search', 'Recursion', 'Dynamic Programming', 'Tree/Graph',
    'Math/Logic', 'OOP Design', 'SQL Query', 'Regex', 'Two Pointers'
];

const DIFFICULTY_EMOJI: Record<string, string> = {
    'Easy': '🟢',
    'Medium': '🟡',
    'Hard': '🔴'
};

const CHALLENGE_TIMEOUT_MS = 30 * 60 * 1000;

class CodeChallengeService {
    private activeChallenges: Map<string, IActiveChallenge> = new Map();

    private getKey(guildId: string, userId: string): string {
        return `${guildId}_${userId}`;
    }

    public getActiveChallenge(guildId: string, userId: string): IActiveChallenge | undefined {
        const key = this.getKey(guildId, userId);
        const challenge = this.activeChallenges.get(key);
        if (challenge && Date.now() - challenge.createdAt > CHALLENGE_TIMEOUT_MS) {
            this.activeChallenges.delete(key);
            return undefined;
        }
        return challenge;
    }

    public async startChallenge(
        guildId: string,
        userId: string,
        channelId: string,
        topic?: string,
        difficulty?: string,
        language?: string
    ): Promise<{ success: boolean; embed?: EmbedBuilder; components?: ActionRowBuilder<ButtonBuilder>[]; message?: string }> {
        const key = this.getKey(guildId, userId);

        if (this.activeChallenges.has(key)) {
            const existing = this.activeChallenges.get(key)!;
            if (Date.now() - existing.createdAt < CHALLENGE_TIMEOUT_MS) {
                return {
                    success: false,
                    message: `❌ Bạn đang có bài challenge chưa hoàn thành: **${existing.challenge.title}**\nDùng nút "📝 Submit Code" để nộp bài, hoặc chờ hết hạn (30 phút).`
                };
            }
            this.activeChallenges.delete(key);
        }

        const selectedTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const selectedDifficulty = difficulty || 'Medium';
        const selectedLanguage = language || 'JavaScript';

        try {
            const challenge = await this.generateChallenge(selectedTopic, selectedDifficulty, selectedLanguage);

            this.activeChallenges.set(key, {
                challenge,
                topic: selectedTopic,
                difficulty: selectedDifficulty,
                language: selectedLanguage,
                guildId,
                userId,
                channelId,
                createdAt: Date.now()
            });

            const diffEmoji = DIFFICULTY_EMOJI[selectedDifficulty] || '🟡';

            const examplesText = challenge.examples
                .map((ex, i) => `**Ví dụ ${i + 1}:**\n\`\`\`\nInput:  ${ex.input}\nOutput: ${ex.output}\n\`\`\`\n${ex.explanation ? `💡 ${ex.explanation}` : ''}`)
                .join('\n\n');

            const constraintsText = challenge.constraints.length > 0
                ? challenge.constraints.map(c => `• ${c}`).join('\n')
                : 'Không có ràng buộc đặc biệt.';

            const embed = new EmbedBuilder()
                .setTitle(`💻 ${challenge.title}`)
                .setDescription(challenge.description)
                .addFields(
                    { name: '📋 Ví dụ', value: examplesText.substring(0, 1024) },
                    { name: '⚠️ Ràng buộc', value: constraintsText.substring(0, 1024) },
                    { name: '💡 Gợi ý', value: `||${challenge.hint}||`, inline: true },
                    { name: '📊 Thông tin', value: `${diffEmoji} **${selectedDifficulty}** | 🗂️ **${selectedTopic}** | 🔤 **${selectedLanguage}**`, inline: true }
                )
                .setColor(selectedDifficulty === 'Easy' ? 0x22C55E : selectedDifficulty === 'Hard' ? 0xEF4444 : 0xEAB308)
                .setFooter({ text: `⏳ Hết hạn sau 30 phút | Dùng nút bên dưới để submit` })
                .setTimestamp();

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`code_submit_btn_${userId}`)
                    .setLabel('📝 Submit Code')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`code_giveup_btn_${userId}`)
                    .setLabel('🏳️ Bỏ cuộc')
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
        code: string
    ): Promise<{ success: boolean; embed?: EmbedBuilder; message?: string }> {
        const key = this.getKey(guildId, userId);
        const active = this.activeChallenges.get(key);

        if (!active) {
            return { success: false, message: '❌ Bạn không có challenge nào đang pending. Dùng `/code start` để nhận đề mới.' };
        }

        if (Date.now() - active.createdAt > CHALLENGE_TIMEOUT_MS) {
            this.activeChallenges.delete(key);
            return { success: false, message: '❌ Challenge đã hết hạn (30 phút). Dùng `/code start` để nhận đề mới.' };
        }

        try {
            const review = await this.reviewCode(active.challenge, code, active.language);

            await prisma.codeSubmission.create({
                data: {
                    userId,
                    guildId,
                    topic: active.topic,
                    difficulty: active.difficulty,
                    language: active.language,
                    challenge: JSON.stringify(active.challenge),
                    code,
                    score: review.score,
                    feedback: JSON.stringify(review)
                }
            });

            await this.updateLeaderboard(userId, guildId, review.score, active.difficulty);

            this.activeChallenges.delete(key);

            const scoreEmoji = review.score >= 80 ? '🌟' : review.score >= 50 ? '👍' : '💪';
            const correctEmoji = review.correct ? '✅' : '❌';
            const diffEmoji = DIFFICULTY_EMOJI[active.difficulty] || '🟡';

            const embed = new EmbedBuilder()
                .setTitle(`${correctEmoji} Kết Quả — ${active.challenge.title}`)
                .setDescription(`${scoreEmoji} **Điểm: ${review.score}/100**`)
                .addFields(
                    { name: '🎯 Correctness', value: review.correctnessDetail.substring(0, 1024) },
                    { name: '✨ Code Quality', value: review.qualityDetail.substring(0, 1024) },
                    { name: '⚡ Efficiency', value: review.efficiencyDetail.substring(0, 1024) },
                    { name: '💡 Gợi ý cải thiện', value: review.suggestion.substring(0, 1024) }
                )
                .setColor(review.score >= 80 ? 0x22C55E : review.score >= 50 ? 0xEAB308 : 0xEF4444)
                .setFooter({ text: `${diffEmoji} ${active.difficulty} | 🗂️ ${active.topic} | 🔤 ${active.language}` })
                .setTimestamp();

            if (review.betterSolution && review.betterSolution.length > 0) {
                const solutionText = review.betterSolution.length > 1024
                    ? review.betterSolution.substring(0, 1021) + '...'
                    : review.betterSolution;
                embed.addFields({ name: '📖 Lời giải tham khảo', value: `\`\`\`${active.language.toLowerCase()}\n${solutionText}\n\`\`\`` });
            }

            return { success: true, embed };

        } catch (error) {
            console.error('Code Review Error:', error);
            return { success: false, message: '❌ Lỗi khi chấm bài. Thử submit lại nhé!' };
        }
    }

    public giveUp(guildId: string, userId: string): { success: boolean; message: string } {
        const key = this.getKey(guildId, userId);
        if (!this.activeChallenges.has(key)) {
            return { success: false, message: '❌ Bạn không có challenge nào đang pending.' };
        }
        this.activeChallenges.delete(key);
        return { success: true, message: '🏳️ Đã bỏ cuộc. Dùng `/code start` để nhận đề mới!' };
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

    private async generateChallenge(topic: string, difficulty: string, language: string): Promise<ICodeChallenge> {
        const prompt = `Bạn là chuyên gia lập trình. Tạo 1 bài code challenge bằng tiếng Việt.

Chủ đề: ${topic}
Độ khó: ${difficulty} (Easy = 5-10 dòng code, Medium = 10-25 dòng, Hard = 25-50 dòng)
Ngôn ngữ: ${language}

Yêu cầu:
- Đề bài rõ ràng, có mô tả chi tiết
- Ít nhất 2 ví dụ input/output cụ thể
- Có ràng buộc (constraints) về kích thước input, time complexity mong muốn
- Có 1 hint nhẹ (không spoil lời giải)
- Đề bài phải giải được trong ${language}

Trả về JSON:
{
  "title": "Tên bài (ngắn gọn)",
  "description": "Mô tả chi tiết bài toán",
  "examples": [
    { "input": "ví dụ input", "output": "ví dụ output", "explanation": "giải thích ngắn" }
  ],
  "constraints": ["ràng buộc 1", "ràng buộc 2"],
  "hint": "gợi ý nhẹ"
}`;

        return await geminiCore.generateJSON<ICodeChallenge>(prompt);
    }

    private async reviewCode(challenge: ICodeChallenge, code: string, language: string): Promise<ICodeReview> {
        const prompt = `Bạn là senior code reviewer. Chấm bài code sau.

ĐỀ BÀI:
${JSON.stringify(challenge, null, 2)}

CODE CỦA USER (Ngôn ngữ: ${language}):
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Chấm theo thang 100 điểm:
- Correctness (60%): Code có giải đúng bài toán không? Có handle edge case không?
- Code Quality (20%): Clean code, naming, readability
- Efficiency (20%): Time/Space complexity có tối ưu không?

Trả về JSON:
{
  "correct": true/false,
  "score": 0-100,
  "correctnessDetail": "Phân tích chi tiết tính đúng sai (tiếng Việt, 2-3 câu)",
  "qualityDetail": "Nhận xét code quality (tiếng Việt, 1-2 câu)",
  "efficiencyDetail": "Nhận xét efficiency + complexity (tiếng Việt, 1-2 câu)",
  "suggestion": "Gợi ý cải thiện cụ thể (tiếng Việt, 2-3 câu)",
  "betterSolution": "Lời giải tham khảo tối ưu (code ngắn, sạch)"
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
