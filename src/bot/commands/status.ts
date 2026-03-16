import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { petService } from '../services/pet';
import { userIdentityService } from '../services/identity';

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('📊 Xem nhanh tổng quan toàn bộ tiến trình game chỉ 1 lệnh.');

export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    await interaction.deferReply();

    const identity = await userIdentityService.getOrCreateIdentity(userId, true);
    const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });

    if (!pet) {
        return interaction.editReply('❌ Bạn chưa có sinh vật nào! Dùng `/pet start`.');
    }

    const stats = JSON.parse(pet.stats || '{}');
    const traits = JSON.parse(pet.traits || '[]');
    const reqExp = petService.getRequiredExp(pet.level, pet.rarity);
    const expPercent = Math.floor((pet.exp / reqExp) * 100);

    const expBar = '█'.repeat(Math.floor(expPercent / 10)) + '░'.repeat(10 - Math.floor(expPercent / 10));

    let expeditionStage = '—';
    try {
        const progress = await (prisma as any).expeditionProgress.findUnique({ where: { userId } });
        if (progress) expeditionStage = `Ải ${progress.currentStage || 1}/100`;
    } catch {}

    let towerFloor = '—';
    try {
        const tower = await prisma.towerProgress.findUnique({ where: { userId } });
        if (tower) towerFloor = `Tầng ${tower.maxFloor}/50`;
    } catch {}

    let pkRemaining = '—';
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pkRecord = await (prisma as any).userDailyPk.findFirst({
            where: { userId, lastPkTime: { gte: today } }
        });
        const used = pkRecord?.dailyCount || 0;
        pkRemaining = `${5 - used}/5 lượt`;
    } catch {}

    const traitSummary = Array.isArray(traits) && traits.length > 0
        ? traits.map((t: any) => {
            const icons: Record<string, string> = { crit: '⚡', dodge: '💨', hp_regen: '💚', atk_boost: '🔥', def_boost: '🛡️' };
            return `${icons[t.type] || '✦'} ${t.type} +${t.value}`;
        }).join(' · ')
        : 'Chưa có';

    const embed = new EmbedBuilder()
        .setTitle(`📊 TỔNG QUAN — ${pet.name}`)
        .setColor(0x7C3AED)
        .addFields(
            { name: '🐾 Sinh Vật', value: `**${pet.name}** · ${pet.rarity} · Bậc ${(pet as any).evolutionStage || 1}`, inline: false },
            { name: '📈 Level', value: `Lv.**${pet.level}** \`${expBar}\` ${expPercent}%\n${pet.exp.toLocaleString()}/${reqExp.toLocaleString()} EXP`, inline: true },
            { name: '💰 Tài Sản', value: `**${identity.money.toLocaleString()}** Coin`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: '❤️ HP', value: `${stats.hp || '?'}`, inline: true },
            { name: '⚔️ ATK', value: `${stats.atk || '?'}`, inline: true },
            { name: '🛡️ DEF', value: `${stats.def || '?'}`, inline: true },
            { name: '⚡ SPD', value: `${stats.spd || '?'}`, inline: true },
            { name: '💙 MP', value: `${stats.mp || '?'}`, inline: true },
            { name: '🧠 INT', value: `${stats.int || '?'}`, inline: true },
            { name: '🔮 Traits', value: traitSummary, inline: false },
            { name: '🗺️ Viễn Chinh', value: expeditionStage, inline: true },
            { name: '🏰 Tháp', value: towerFloor, inline: true },
            { name: '🤺 PK Hôm Nay', value: pkRemaining, inline: true },
        )
        .setFooter({ text: 'Dùng /claim_all để nhận quà ngày · /train để đổi xu lấy EXP' });

    await interaction.editReply({ embeds: [embed] });
}
