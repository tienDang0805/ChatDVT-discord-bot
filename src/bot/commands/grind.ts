import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { petService } from '../services/pet';
import { userIdentityService } from '../services/identity';

const STAMINA_COST = 20;
const POTION_RESTORE = 30;
const POTION_USE_EACH_TIME = 3;
const MAX_JOURNEYS = 20;

export const data = new SlashCommandBuilder()
    .setName('grind')
    .setDescription('🔄 Tự động du ngoạn liên tục, dùng Bình Thể Lực khi cần, cho đến khi hết bình');

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const userId = interaction.user.id;

    const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
    if (!pet) {
        await interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start` để ấp trứng.');
        return;
    }

    let totalCoins = 0;
    let totalExp = 0;
    let totalJourneys = 0;
    let potionsUsed = 0;
    let chestsGained = 0;
    let potionsFound = 0;
    const levelsUp: string[] = [];

    await interaction.editReply(`⚙️ **${pet.name}** bắt đầu hành trình marathon! Đang xử lý...`);

    for (let i = 0; i < MAX_JOURNEYS; i++) {
        const freshPet = await prisma.pet.findUnique({ where: { id: pet.id } });
        if (!freshPet) break;

        const { stamina, maxStamina } = await petService.getStamina(freshPet);

        if (stamina < STAMINA_COST) {
            const staminaItem = await prisma.inventoryItem.findFirst({ where: { userId, itemId: 'stamina_potion' } });
            if (!staminaItem || staminaItem.quantity <= 0) {
                break;
            }

            const toUse = Math.min(POTION_USE_EACH_TIME, staminaItem.quantity);

            const totalRestore = toUse * POTION_RESTORE;
            const newStam = Math.min(maxStamina, stamina + totalRestore);

            await petService.restoreStamina(freshPet.id, totalRestore);

            if (staminaItem.quantity === toUse) {
                await prisma.inventoryItem.delete({ where: { id: staminaItem.id } });
            } else {
                await prisma.inventoryItem.update({ where: { id: staminaItem.id }, data: { quantity: { decrement: toUse } } });
            }

            potionsUsed += toUse;

            if (newStam < STAMINA_COST) break;
        }

        const finalPet = await prisma.pet.findUnique({ where: { id: pet.id } });
        if (!finalPet) break;
        const { stamina: staminaBeforeJourney } = await petService.getStamina(finalPet);
        if (staminaBeforeJourney < STAMINA_COST) break;

        const coinsFound = 300 + Math.floor(Math.random() * 500);
        const expFound = 100 + Math.floor(Math.random() * 200);

        let eggDropped: string | null = null;
        let potionDropped = 0;
        let chestDropped = false;
        const roll = Math.random();

        if (roll < 0.05) {
            chestDropped = true;
        } else if (roll < 0.06) {
            eggDropped = 'egg_normal';
        } else if (roll < 0.063) {
            eggDropped = 'egg_magic';
        } else if (roll < 0.064) {
            eggDropped = 'egg_rare';
        } else if (roll < 0.0643) {
            eggDropped = 'egg_random';
        } else if (roll < 0.2) {
            potionDropped = 1;
        }

        await petService.consumeStamina(finalPet.id, STAMINA_COST);

        await prisma.$transaction(async (tx) => {
            await tx.systemLog.create({
                data: {
                    level: 'journeylog',
                    message: userId,
                    metadata: JSON.stringify({ petId: pet.id, source: 'grind' }),
                    timestamp: new Date()
                }
            });

            await tx.userIdentity.update({
                where: { userId },
                data: { money: { increment: coinsFound } }
            });

            if (chestDropped) {
                const exist = await tx.inventoryItem.findFirst({ where: { userId, itemId: 'rare_chest' } });
                if (exist) await tx.inventoryItem.update({ where: { id: exist.id }, data: { quantity: { increment: 1 } } });
                else await tx.inventoryItem.create({ data: { userId, itemId: 'rare_chest', itemType: 'chest', name: 'Rương Hiếm', quantity: 1 } });
            }
            if (eggDropped) {
                const exist = await tx.inventoryItem.findFirst({ where: { userId, itemId: eggDropped } });
                if (exist) await tx.inventoryItem.update({ where: { id: exist.id }, data: { quantity: { increment: 1 } } });
                else await tx.inventoryItem.create({ data: { userId, itemId: eggDropped, itemType: 'egg', name: 'Trứng Nhặt Được', quantity: 1 } });
            }
            if (potionDropped > 0) {
                const exist = await tx.inventoryItem.findFirst({ where: { userId, itemId: 'stamina_potion' } });
                if (exist) await tx.inventoryItem.update({ where: { id: exist.id }, data: { quantity: { increment: 1 } } });
                else await tx.inventoryItem.create({ data: { userId, itemId: 'stamina_potion', itemType: 'consumable', name: 'Bình Thể Lực', quantity: 1 } });
            }
        });

        userIdentityService.invalidateCache(userId);

        const { levelsGained, messages } = await petService.addExpAndLevelUp(pet.id, expFound);
        if (levelsGained > 0) levelsUp.push(...messages);

        totalCoins += coinsFound;
        totalExp += expFound;
        totalJourneys++;
        if (chestDropped) chestsGained++;
        if (potionDropped > 0) potionsFound++;
    }

    const finalPetData = await prisma.pet.findUnique({ where: { id: pet.id } });
    const finalStaminaInfo = finalPetData ? await petService.getStamina(finalPetData) : null;
    const remainingPotion = await prisma.inventoryItem.findFirst({ where: { userId, itemId: 'stamina_potion' } });

    const lines: string[] = [
        `🏕️ Hoàn thành **${totalJourneys}** lần du ngoạn`,
        `🪙 Tổng Coin nhận được: **+${totalCoins.toLocaleString()}**`,
        `✨ Tổng EXP nhận được: **+${totalExp.toLocaleString()}**`,
        `🍖 Bình Thể Lực đã dùng: **${potionsUsed}**`,
    ];

    if (chestsGained > 0) lines.push(`📦 Rương Hiếm nhặt được: **${chestsGained}**`);
    if (potionsFound > 0) lines.push(`🎁 Bình Thể Lực nhặt được: **${potionsFound}**`);
    if (levelsUp.length > 0) lines.push(...levelsUp);

    const embed = new EmbedBuilder()
        .setTitle(`⚡ GRIND KẾT THÚC — ${finalPetData?.name || pet.name}`)
        .setColor(0xFF6B00)
        .setDescription(lines.join('\n'))
        .addFields(
            { name: '🔋 Thể Lực Còn Lại', value: `${finalStaminaInfo?.stamina ?? '?'}/100`, inline: true },
            { name: '🍖 Bình Còn Trong Túi', value: `${remainingPotion?.quantity ?? 0}`, inline: true },
            { name: '📊 Cấp Độ Hiện Tại', value: `Lv.${finalPetData?.level ?? '?'}`, inline: true }
        )
        .setFooter({ text: 'Dùng /journey để chạy đơn lẻ • /buy stamina_potion để mua thêm bình' });

    await interaction.editReply({ embeds: [embed] });
}
