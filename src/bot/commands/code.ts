import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { codeChallengeService } from '../services/code-challenge';

export const data = new SlashCommandBuilder()
    .setName('code')
    .setDescription('Luyện Code — Nhận đề bài lập trình, submit code, AI chấm điểm')
    .addSubcommand(sub =>
        sub.setName('start')
            .setDescription('Nhận đề bài code challenge mới')
            .addStringOption(opt =>
                opt.setName('topic')
                    .setDescription('Chủ đề (Array, String, DP, OOP...)')
                    .setRequired(false)
            )
            .addStringOption(opt =>
                opt.setName('difficulty')
                    .setDescription('Độ khó')
                    .addChoices(
                        { name: '🟢 Easy', value: 'Easy' },
                        { name: '🟡 Medium', value: 'Medium' },
                        { name: '🔴 Hard', value: 'Hard' }
                    )
                    .setRequired(false)
            )
            .addStringOption(opt =>
                opt.setName('language')
                    .setDescription('Ngôn ngữ lập trình')
                    .addChoices(
                        { name: 'JavaScript', value: 'JavaScript' },
                        { name: 'TypeScript', value: 'TypeScript' },
                        { name: 'Python', value: 'Python' },
                        { name: 'Java', value: 'Java' },
                        { name: 'C++', value: 'C++' },
                        { name: 'PHP', value: 'PHP' }
                    )
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('leaderboard')
            .setDescription('Bảng xếp hạng Luyện Code')
    )
    .addSubcommand(sub =>
        sub.setName('stats')
            .setDescription('Xem thống kê luyện code cá nhân')
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (!guildId) {
        await interaction.reply({ content: '❌ Tính năng này chỉ dùng trong server.', ephemeral: true });
        return;
    }

    if (subcommand === 'start') {
        await interaction.deferReply();

        const topic = interaction.options.getString('topic') || undefined;
        const difficulty = interaction.options.getString('difficulty') || undefined;
        const language = interaction.options.getString('language') || undefined;

        const result = await codeChallengeService.startChallenge(
            guildId,
            interaction.user.id,
            interaction.channelId,
            topic,
            difficulty,
            language
        );

        if (!result.success) {
            await interaction.editReply(result.message || '❌ Lỗi không xác định.');
            return;
        }

        await interaction.editReply({
            embeds: result.embed ? [result.embed] : [],
            components: result.components || []
        });

    } else if (subcommand === 'leaderboard') {
        await interaction.deferReply();
        const embed = await codeChallengeService.getLeaderboard(guildId);
        embed.setFooter({ text: 'Dùng /code start để luyện code!' });
        await interaction.editReply({ embeds: [embed] });

    } else if (subcommand === 'stats') {
        await interaction.deferReply({ ephemeral: true });
        const embed = await codeChallengeService.getUserStats(interaction.user.id, guildId);
        await interaction.editReply({ embeds: [embed] });
    }
}
