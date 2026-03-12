import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { EmbedBuilder } from 'discord.js';
import { SHOP_ITEMS } from './shop';

class FarmService {
    private cooldowns: Map<string, number> = new Map();
    private COOLDOWN_TIME = 60 * 1000; // 1 minute

    public async farm(userId: string) {
        // Cooldown check
        const lastFarm = this.cooldowns.get(userId);
        if (lastFarm && Date.now() - lastFarm < this.COOLDOWN_TIME) {
            const timeLeft = Math.ceil((this.COOLDOWN_TIME - (Date.now() - lastFarm)) / 1000);
            return { success: false, message: `⏳ Sinh vật đang nghỉ ngơi. Quay lại sau **${timeLeft}s** nữa.` };
        }

        const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
        if (!pet) {
            return { success: false, message: '❌ Bạn chưa có sinh vật nào để đi farm! Hãy dùng `/pet start`.' };
        }

        // Random rewards
        const expGained = Math.floor(Math.random() * 21) + 10; // 10-30
        const moneyGained = Math.floor(Math.random() * 41) + 10; // 10-50

        // Random Drop (10% chance)
        let droppedItem = null;
        if (Math.random() < 0.1) {
            droppedItem = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
        }

        // Apply Level Up
        let newExp = pet.exp + expGained;
        let newLevel = pet.level;
        let statsChanged = false;
        
        // Parse current stats
        let stats: any = {};
        try { stats = JSON.parse(pet.stats); } catch(e) {}
        
        let leveledUp = false;
        const expNeeded = newLevel * 100;

        if (newExp >= expNeeded) {
            newLevel++;
            newExp -= expNeeded;
            leveledUp = true;
            
            // Generate stats increase
            stats.hp = (stats.hp || 100) + Math.floor(Math.random() * 11) + 5; // +5 to 15
            stats.atk = (stats.atk || 10) + Math.floor(Math.random() * 4) + 2; // +2 to 5
            stats.def = (stats.def || 10) + Math.floor(Math.random() * 4) + 2;
            stats.spd = (stats.spd || 10) + Math.floor(Math.random() * 3) + 1;
            statsChanged = true;
        }

        // Update DB
        await prisma.$transaction(async (tx) => {
            // Update Pet
            await tx.pet.update({
                where: { id: pet.id },
                data: {
                    level: newLevel,
                    exp: newExp,
                    ...(statsChanged ? { stats: JSON.stringify(stats) } : {})
                }
            });

            // Update Money
            await tx.userIdentity.update({
                where: { userId },
                data: { money: { increment: moneyGained } }
            });

            // Add drop item if any
            if (droppedItem) {
                const existingItem = await tx.inventoryItem.findFirst({ where: { userId, itemId: droppedItem.id } });
                if (existingItem) {
                    await tx.inventoryItem.update({
                        where: { id: existingItem.id },
                        data: { quantity: { increment: 1 } }
                    });
                } else {
                    await tx.inventoryItem.create({
                        data: {
                            userId,
                            itemId: droppedItem.id,
                            itemType: droppedItem.type,
                            name: droppedItem.name,
                            quantity: 1
                        }
                    });
                }
            }
        });

        // Set Cooldown
        this.cooldowns.set(userId, Date.now());

        // Construct response
        const embed = new EmbedBuilder()
            .setTitle(`⚔️ ${pet.name} vừa đi Thảo Phạt về!`)
            .setColor(leveledUp ? 0xFF00FF : 0x00FF00)
            .setDescription(`**${pet.name}** đã đánh bại bầy quái vật và mang về chiến lợi phẩm!`)
            .addFields(
                { name: 'Kinh nghiệm (EXP)', value: `+${expGained} (Hiện: ${newExp}/${newLevel * 100})`, inline: true },
                { name: 'Tiền xu (Coin)', value: `+${moneyGained} Coin`, inline: true }
            );

        if (droppedItem) {
            embed.addFields({ name: '🎁 Vật phẩm rơi rớt', value: `Nhận được **1x ${droppedItem.name}**!`, inline: false });
        }

        if (leveledUp) {
            embed.addFields({ 
                name: '🆙 LEVEL UP!', 
                value: `**${pet.name}** đã đạt cấp **${newLevel}**!\nChỉ số hiện tại: HP: ${stats.hp} | ATK: ${stats.atk} | DEF: ${stats.def} | SPD: ${stats.spd}`, 
                inline: false 
            });
        }

        return { success: true, embeds: [embed] };
    }
}

export const farmService = new FarmService();
