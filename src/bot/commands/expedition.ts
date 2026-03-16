import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { expeditionService } from '../services/expedition';

export const data = new SlashCommandBuilder()
    .setName('expedition')
    .setDescription('🗺️ Cử sinh vật đi Viễn Chinh khám phá 50 ải để nhận quà đặc biệt')
    .addSubcommand(subcommand =>
        subcommand
            .setName('status')
            .setDescription('📊 Xem chiến dịch hiện tại, tiến độ 5 chương và ải tiếp theo')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('fight')
            .setDescription('⚔️ Bắt đầu chiến đấu ở ải hiện tại (Dùng CP để tính tỉ lệ thắng)')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('📖 Xem thông tin chi tiết về một ải cụ thể')
            .addIntegerOption(option =>
                option.setName('stage')
                    .setDescription('Số ải muốn xem (1 - 50)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(50)
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
        if (subcommand === 'status') {
            const result = await expeditionService.showStatus(userId);
            if (result.content) {
                await interaction.editReply(result.content);
            } else {
                await interaction.editReply({ embeds: result.embeds });
            }
        } 
        else if (subcommand === 'fight') {
            const result = await expeditionService.fight(userId);
            if (result.content) {
                await interaction.editReply(result.content);
            } else {
                await interaction.editReply({ embeds: result.embeds });
            }
        } 
        else if (subcommand === 'info') {
            const stageId = interaction.options.getInteger('stage', true);
            const result = await expeditionService.showStageInfo(stageId);
            if (result.content) {
                await interaction.editReply(result.content);
            } else {
                await interaction.editReply({ embeds: result.embeds });
            }
        }
    } catch (error) {
        console.error("Expedition Error:", error);
        await interaction.editReply('❌ Đã xảy ra lỗi trong quá trình xử lý Viễn Chinh.');
    }
}
