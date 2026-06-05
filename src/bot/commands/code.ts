import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { codeChallengeService } from '../services/code-challenge';

export const data = new SlashCommandBuilder()
    .setName('code')
    .setDescription('Code Challenge — Tìm bug, điền chỗ trống, đoán output!')
    .addSubcommand(sub =>
        sub.setName('start')
            .setDescription('Bắt đầu game mới cho cả server')
            .addIntegerOption(opt =>
                opt.setName('questions')
                    .setDescription('Số câu hỏi (3-10, mặc định 5)')
                    .setMinValue(3)
                    .setMaxValue(10)
                    .setRequired(false)
            )
            .addStringOption(opt =>
                opt.setName('topic')
                    .setDescription('Chủ đề')
                    .addChoices(
                        { name: '🎲 Ngẫu nhiên', value: 'random' },
                        { name: '🟨 JavaScript', value: 'JavaScript' },
                        { name: '🐍 Python', value: 'Python' },
                        { name: '🔤 Xử lý chuỗi', value: 'Xử lý chuỗi' },
                        { name: '📦 Xử lý mảng', value: 'Xử lý mảng' },
                        { name: '🧮 Toán & Logic', value: 'Toán & Logic' },
                        { name: '🔄 If/Else & Loop', value: 'If/Else & Loop' },
                        { name: '🐛 Lỗi hay gặp', value: 'Lỗi hay gặp' },
                        { name: '🎯 Tổng hợp', value: 'Tổng hợp' }
                    )
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
            .addIntegerOption(opt =>
                opt.setName('time')
                    .setDescription('Giây mỗi câu (10-60, mặc định 30)')
                    .setMinValue(10)
                    .setMaxValue(60)
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('cancel')
            .setDescription('Hủy game hiện tại (chỉ người tạo)')
    )
    .addSubcommand(sub =>
        sub.setName('leaderboard')
            .setDescription('Bảng xếp hạng Code Challenge')
    )
    .addSubcommand(sub =>
        sub.setName('stats')
            .setDescription('Xem thống kê cá nhân')
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (!guildId) {
        await interaction.reply({ content: '❌ Tính năng này chỉ dùng trong server.', ephemeral: true });
        return;
    }

    if (subcommand === 'start') {
        if (codeChallengeService.isActive(guildId)) {
            await interaction.reply({ content: '❌ Đang có game diễn ra! Dùng `/code cancel` để hủy.', ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const numQuestions = interaction.options.getInteger('questions') || undefined;
        const topicRaw = interaction.options.getString('topic');
        const topic = topicRaw === 'random' ? undefined : (topicRaw || undefined);
        const difficulty = interaction.options.getString('difficulty') || undefined;
        const time = interaction.options.getInteger('time') || undefined;

        const result = await codeChallengeService.startGame(
            guildId,
            interaction.user.id,
            interaction.channelId,
            numQuestions,
            topic,
            difficulty,
            time
        );

        await interaction.editReply(result.message);

    } else if (subcommand === 'cancel') {
        if (!codeChallengeService.isActive(guildId)) {
            await interaction.reply({ content: '❌ Không có game nào đang chạy.', ephemeral: true });
            return;
        }
        const result = await codeChallengeService.cancelGame(guildId, interaction.user.id);
        await interaction.reply({ content: result.message, ephemeral: !result.success });

    } else if (subcommand === 'leaderboard') {
        await interaction.deferReply();
        const embed = await codeChallengeService.getLeaderboard(guildId);
        await interaction.editReply({ embeds: [embed] });

    } else if (subcommand === 'stats') {
        await interaction.deferReply({ ephemeral: true });
        const embed = await codeChallengeService.getUserStats(interaction.user.id, guildId);
        await interaction.editReply({ embeds: [embed] });
    }
}
