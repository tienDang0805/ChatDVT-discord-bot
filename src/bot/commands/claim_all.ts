import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { SHOP_ITEMS } from '../services/shop';
import { userIdentityService } from '../services/identity';
import { petService } from '../services/pet';

export const data = new SlashCommandBuilder()
    .setName('claim_all')
    .setDescription('☀️ Nhận TẤT CẢ phần thưởng hàng ngày chỉ với 1 lệnh duy nhất!');

export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    await interaction.deferReply();

    const results: string[] = [];
    let totalCoins = 0;
    let totalExp = 0;

    let identity = await prisma.userIdentity.findUnique({ where: { userId } });
    if (!identity) {
        identity = await prisma.userIdentity.create({ data: { userId, nickname: interaction.user.username, signature: '' } });
    }

    const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });

    // ═══ 1. DAILY CHECK-IN ═══
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!identity.lastDaily || identity.lastDaily < today) {
        const rewardCoins = 1000 + Math.floor(Math.random() * 500);
        totalCoins += rewardCoins;

        const randomRoll = Math.random();
        let bonusItemId: string | null = null;
        if (randomRoll < 0.2) {
            const elements = ['fire_crystal', 'water_crystal', 'earth_crystal', 'wind_crystal'];
            bonusItemId = elements[Math.floor(Math.random() * elements.length)];
        } else if (randomRoll < 0.5) {
            bonusItemId = 'exp_stone_md';
        } else if (randomRoll < 0.7) {
            bonusItemId = 'stamina_potion';
        }

        const itemObj = bonusItemId ? SHOP_ITEMS.find(i => i.id === bonusItemId) : null;

        await prisma.$transaction(async (tx) => {
            await tx.userIdentity.update({
                where: { userId },
                data: { money: { increment: rewardCoins }, lastDaily: new Date() }
            });
            if (itemObj) {
                const existItem = await tx.inventoryItem.findFirst({ where: { userId, itemId: itemObj.id } });
                if (existItem) {
                    await tx.inventoryItem.update({ where: { id: existItem.id }, data: { quantity: { increment: 1 } } });
                } else {
                    await tx.inventoryItem.create({ data: { userId, itemId: itemObj.id, itemType: itemObj.type, name: itemObj.name, quantity: 1 } });
                }
            }
        });

        results.push(`✅ **Điểm Danh:** +${rewardCoins} Coin${itemObj ? ` + 1x ${itemObj.emoji} ${itemObj.name}` : ''}`);
    } else {
        results.push('⏳ **Điểm Danh:** Đã nhận hôm nay rồi.');
    }

    // ═══ 2. EXPEDITION AFK CLAIM ═══
    if (pet) {
        try {
            const progress = await prisma.expeditionProgress.findUnique({ where: { oduserId: userId } as any });
            if (progress && (progress as any).lastClaim) {
                const hoursSince = (Date.now() - new Date((progress as any).lastClaim).getTime()) / 3_600_000;
                if (hoursSince >= 1) {
                    const hours = Math.min(Math.floor(hoursSince), 8);
                    const afkCoins = hours * 150;
                    const afkExp = hours * 50;
                    totalCoins += afkCoins;
                    totalExp += afkExp;

                    await prisma.$transaction(async (tx) => {
                        await tx.userIdentity.update({ where: { userId }, data: { money: { increment: afkCoins } } });
                        await (tx as any).expeditionProgress.update({ where: { userId }, data: { lastClaim: new Date() } });
                    });

                    if (afkExp > 0 && pet) {
                        await petService.addExpAndLevelUp(pet.id, afkExp);
                    }

                    results.push(`✅ **AFK Viễn Chinh (${hours}h):** +${afkCoins} Coin, +${afkExp} EXP`);
                } else {
                    results.push('⏳ **AFK Viễn Chinh:** Chưa đủ 1 giờ.');
                }
            } else {
                results.push('⏳ **AFK Viễn Chinh:** Chưa có tiến trình.');
            }
        } catch {
            results.push('⏳ **AFK Viễn Chinh:** Chưa mở khoá.');
        }
    }

    userIdentityService.invalidateCache(userId);

    const embed = new EmbedBuilder()
        .setTitle('☀️ NHẬN QUÀ HÀNG NGÀY — 1 NÚT TRỌN GÓI')
        .setColor(0xFFD700)
        .setDescription(results.join('\n\n'))
        .setFooter({ text: 'Dùng /status để xem tổng quan thú cưng!' });

    if (totalCoins > 0 || totalExp > 0) {
        const summary = [];
        if (totalCoins > 0) summary.push(`💰 +${totalCoins} Coin`);
        if (totalExp > 0) summary.push(`✨ +${totalExp} EXP`);
        embed.addFields({ name: '📊 Tổng Kết', value: summary.join(' | '), inline: false });
    }

    await interaction.editReply({ embeds: [embed] });
}
