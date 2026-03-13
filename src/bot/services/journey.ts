import { prisma } from '../../database/prisma';
import { petService } from './pet';
import { EmbedBuilder } from 'discord.js';

const JOURNEY_COOLDOWN_HOURS = 4;
const JOURNEY_COOLDOWN_MS = JOURNEY_COOLDOWN_HOURS * 60 * 60 * 1000;

export class JourneyService {
    public async goOnJourney(userId: string) {
        // 1. Fetch Pet and Identity
        const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
        if (!pet) {
            return { success: false, message: '❌ Bạn chưa có sinh vật để cử đi du ngoạn! Dùng `/pet start`.' };
        }

        const identity = await prisma.userIdentity.findUnique({ where: { userId } });
        if (!identity) {
            return { success: false, message: '❌ Không tìm thấy hồ sơ hệ thống của bạn.' };
        }

        // 2. Consume Stamina
        const { stamina } = await petService.getStamina(pet);
        const COST = 20;

        if (stamina < COST) {
            return { success: false, message: `❌ **${pet.name}** đã kiệt sức (Thể lực: ${stamina}/100).\nCần **${COST} Thể lực** để bắt đầu chuyến du ngoạn.\n*Lưu ý: Thể lực hồi phục theo thời gian (+1/5 phút) hoặc có thể nạp bằng Bình Thể Lực.*` };
        }
        
        await petService.consumeStamina(pet.id, COST);

        // 3. Roll Rewards
        // Base Rewards
        const coinsFound = 300 + Math.floor(Math.random() * 500);
        const expFound = 100 + Math.floor(Math.random() * 200);

        // Rare Drop Roll
        let eggDropped = null;
        let potionDropped = 0;
        let chestDropped = false;
        const roll = Math.random();
        
        // 5% chance for Chest
        if (roll < 0.05) {
            chestDropped = true;
        } else if (roll < 0.06) {
            // 1% chance for Normal Egg
            eggDropped = 'egg_normal';
        } else if (roll < 0.063) {
            // 0.3% chance for Magic Egg
            eggDropped = 'egg_magic';
        } else if (roll < 0.064) {
            // 0.1% chance for Rare Egg
            eggDropped = 'egg_rare';
        } else if (roll < 0.0643) {
            // 0.03% chance for Random/Legendary Egg
            eggDropped = 'egg_random';
        } else if (roll < 0.2) {
            // 13.5% chance for a Stamina Potion drop
            potionDropped = 1;
        }

        // 4. Save Rewards
        const logEntries: string[] = [];
        logEntries.push(`🪙 Nhặt được **${coinsFound} Coin**`);
        logEntries.push(`✨ Nhận được **${expFound} EXP**`);

        await prisma.$transaction(async (tx) => {
            // Log the timestamp
            await tx.systemLog.create({
                data: {
                    level: 'journeylog',
                    message: userId,
                    metadata: JSON.stringify({ petId: pet.id }),
                    timestamp: new Date()
                }
            });

            // Update Coins
            await tx.userIdentity.update({
                where: { userId },
                data: { money: { increment: coinsFound } }
            });

            // Handle Item Drops
            if (chestDropped) {
                const existItem = await tx.inventoryItem.findFirst({ where: { userId, itemId: 'rare_chest' } });
                if (existItem) await tx.inventoryItem.update({ where: { id: existItem.id }, data: { quantity: { increment: 1 } } });
                else await tx.inventoryItem.create({ data: { userId, itemId: 'rare_chest', itemType: 'chest', name: 'Rương Hiếm', quantity: 1 } });
            }
            if (eggDropped) {
                const existItem = await tx.inventoryItem.findFirst({ where: { userId, itemId: eggDropped } });
                if (existItem) await tx.inventoryItem.update({ where: { id: existItem.id }, data: { quantity: { increment: 1 } } });
                else await tx.inventoryItem.create({ data: { userId, itemId: eggDropped, itemType: 'egg', name: 'Trứng Nhặt Được', quantity: 1 } });
            }
            if (potionDropped > 0) {
                const existItem = await tx.inventoryItem.findFirst({ where: { userId, itemId: 'stamina_potion' } });
                if (existItem) await tx.inventoryItem.update({ where: { id: existItem.id }, data: { quantity: { increment: 1 } } });
                else await tx.inventoryItem.create({ data: { userId, itemId: 'stamina_potion', itemType: 'consumable', name: 'Bình Thể Lực', quantity: 1 } });
            }
        });

        if (chestDropped) logEntries.push(`📦 Vô tình nhặt được **1x Rương Hiếm**!`);
        if (eggDropped) logEntries.push(`🥚 KỲ TÍCH! Tìm được **1x ${eggDropped}**!`);
        if (potionDropped > 0) logEntries.push(`🍖 Trên đường về nhặt được **1x Bình Thể Lực**!`);

        // Handle Exp Level Up
        const { levelsGained, messages } = await petService.addExpAndLevelUp(pet.id, expFound);
        if (levelsGained > 0) {
            logEntries.push(...messages);
        }

        // 5. Return Formatting
        const updatedPet = await prisma.pet.findUnique({ where: { id: pet.id }});
        const reqExp = petService.getRequiredExp(updatedPet!.level, updatedPet!.rarity);

        const embed = new EmbedBuilder()
            .setTitle(`🏕️ Du Ngoạn Thành Công!`)
            .setDescription(`**${pet.name}** đã trở về sau chuyến phiêu lưu dài ngày ở vùng đất cấm và mang về chiến lợi phẩm!`)
            .setColor(0x00AE86)
            .addFields(
                { name: 'Chiến Lợi Phẩm', value: logEntries.join('\n'), inline: false },
                { name: '✨ Tiến Độ Cấp Độ', value: `Cấp: ${updatedPet!.level} (${updatedPet!.exp}/${reqExp} EXP)\n🔋 Thể lực còn lại: **${stamina - COST}/100**`, inline: false }
            )
            .setFooter({ text: `Du ngoạn tiêu hao 20 Thể Lực.`});

        return { success: true, embed };
    }
}

export const journeyService = new JourneyService();
