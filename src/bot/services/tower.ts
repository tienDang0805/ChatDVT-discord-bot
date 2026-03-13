import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChatInputCommandInteraction, Message } from 'discord.js';
import { prisma } from '../../database/prisma';

const TOWER_COOLDOWN_HOURS = 12;
const MAX_FLOORS = 10;

function generateMob(floor: number) {
    const mobNames = [
        ['Slime Bé', 'Chuột Độc'],
        ['Sói Đen', 'Quỷ Lửa'],
        ['Rồng Non', 'Linh Hồn Lạc'],
        ['Thần Thú', 'Ác Ma Cánh'],
        ['Chúa Tể Bóng Tối', 'Rồng Cổ Đại']
    ];
    const tier = Math.floor((floor - 1) / 2);
    const namePool = mobNames[Math.min(tier, mobNames.length - 1)];
    const name = namePool[Math.floor(Math.random() * namePool.length)];
    const scale = 1 + (floor - 1) * 0.25;
    return {
        name,
        floor,
        hp: Math.floor((80 + floor * 20) * scale),
        maxHp: Math.floor((80 + floor * 20) * scale),
        atk: Math.floor((8 + floor * 3) * scale),
        def: Math.floor((5 + floor * 2) * scale),
    };
}

function floorReward(floor: number) {
    return {
        exp:   50 + floor * 30,
        coins: 80 + floor * 50,
        isChest: floor % 5 === 0,
    };
}

function buildBar(cur: number, max: number, size = 8) {
    const f = Math.round(Math.max(0, cur / max) * size);
    return '█'.repeat(f) + '░'.repeat(size - f);
}

export class TowerService {
    async climb(interaction: ChatInputCommandInteraction) {
        const userId = interaction.user.id;

        const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
        if (!pet) return interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');

        let progress = await prisma.towerProgress.findUnique({ where: { userId } });
        if (!progress) {
            progress = await prisma.towerProgress.create({ data: { userId, maxFloor: 0, lastClimb: new Date(0) } });
        }

        const hoursSince = (Date.now() - progress.lastClimb.getTime()) / 3_600_000;
        if (hoursSince < TOWER_COOLDOWN_HOURS) {
            const hoursLeft = (TOWER_COOLDOWN_HOURS - hoursSince).toFixed(1);
            return interaction.editReply(`⏳ Bạn đang hồi sức! Quay lại sau **${hoursLeft} giờ** nữa.`);
        }

        const stats = JSON.parse(pet.stats || '{}');
        let petHp = stats.hp || 100;
        const petMaxHp = petHp;
        const petAtk = stats.atk || 10;
        const petDef = stats.def || 10;

        let totalExp = 0;
        let totalCoins = 0;
        let chestItems = 0;
        let floorsClimbed = 0;
        const startFloor = 1;

        const towerEmbed = () => new EmbedBuilder()
            .setTitle(`🏰 THÁP THỬ THÁCH — Tầng ${floorsClimbed + 1}/${MAX_FLOORS}`)
            .setColor(0xA855F7)
            .setDescription(`**${pet.name}** đang leo tháp!`)
            .addFields(
                { name: `❤️ ${pet.name}`, value: `${buildBar(petHp, petMaxHp)} ${petHp}/${petMaxHp}`, inline: true },
                { name: '📊 Kết Quả', value: `+${totalExp} EXP | +${totalCoins} Coin`, inline: true }
            );

        const continueRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('tower_next').setLabel('⬆️ Lên Tầng Tiếp').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('tower_retreat').setLabel('🏃 Rút Lui').setStyle(ButtonStyle.Danger)
        );

        let msg = await interaction.editReply({ embeds: [towerEmbed()], components: [continueRow] }) as Message;

        for (let floor = startFloor; floor <= MAX_FLOORS; floor++) {
            const mob = generateMob(floor);
            let mobHp = mob.hp;
            let petCurrentHp = petHp;

            while (petCurrentHp > 0 && mobHp > 0) {
                const petDmg = Math.max(1, petAtk - Math.floor(mob.def * 0.4) + Math.floor(Math.random() * 5));
                const mobDmg = Math.max(1, mob.atk - Math.floor(petDef * 0.4) + Math.floor(Math.random() * 3));
                mobHp = Math.max(0, mobHp - petDmg);
                if (mobHp > 0) petCurrentHp = Math.max(0, petCurrentHp - mobDmg);
            }

            petHp = petCurrentHp;

            if (petHp <= 0) {
                const defeatEmbed = new EmbedBuilder()
                    .setTitle(`💀 Thất Bại tại Tầng ${floor}`)
                    .setColor(0xEF4444)
                    .setDescription(`**${pet.name}** đã bị **${mob.name}** đánh bại!`)
                    .addFields({ name: '🏆 Kết Quả', value: `Hoàn thành ${floor - 1} tầng\n+${totalExp} EXP | +${totalCoins} Coin` });
                await msg.edit({ embeds: [defeatEmbed], components: [] });
                break;
            }

            floorsClimbed = floor;
            const reward = floorReward(floor);
            totalExp += reward.exp;
            totalCoins += reward.coins;
            if (reward.isChest) chestItems++;

            if (floor === MAX_FLOORS) {
                const victoryEmbed = new EmbedBuilder()
                    .setTitle('🎉 CHINH PHỤC THÁP THỬ THÁCH!')
                    .setColor(0xFFD700)
                    .setDescription(`**${pet.name}** đã leo đến đỉnh tháp! 🏆`)
                    .addFields(
                        { name: '🎁 Tổng Phần Thưởng', value: `+${totalExp} EXP | +${totalCoins} Coin${chestItems > 0 ? ` | ${chestItems}x 📦 Rương Hiếm` : ''}` }
                    );
                await msg.edit({ embeds: [victoryEmbed], components: [] });
                break;
            }

            const floorEmbed = towerEmbed()
                .setTitle(`🏰 Tầng ${floor} — Chiến Thắng!`)
                .setDescription(`⚔️ Đã đánh bại **${mob.name}**!\n+${reward.exp} EXP | +${reward.coins} Coin`);

            await msg.edit({ embeds: [floorEmbed], components: [continueRow] });

            try {
                const btn = await msg.awaitMessageComponent({
                    componentType: ComponentType.Button,
                    filter: (i) => i.user.id === userId,
                    time: 30_000
                });
                await btn.deferUpdate();
                if (btn.customId === 'tower_retreat') {
                    const retreatEmbed = new EmbedBuilder()
                        .setTitle('🏃 Rút Lui Thành Công')
                        .setColor(0x64748b)
                        .addFields({ name: '🏆 Kết Quả', value: `Hoàn thành ${floorsClimbed} tầng\n+${totalExp} EXP | +${totalCoins} Coin` });
                    await msg.edit({ embeds: [retreatEmbed], components: [] });
                    break;
                }
            } catch {
                const timeoutEmbed = new EmbedBuilder().setTitle('⏰ Hết Thời Gian').setDescription(`Kết quả: ${floorsClimbed} tầng`);
                await msg.edit({ embeds: [timeoutEmbed], components: [] });
                break;
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.towerProgress.update({
                where: { userId },
                data: {
                    maxFloor: Math.max(progress!.maxFloor, floorsClimbed),
                    lastClimb: new Date()
                }
            });
            if (totalExp > 0) await tx.pet.update({ where: { id: pet.id }, data: { exp: { increment: totalExp } } });
            if (totalCoins > 0) await tx.userIdentity.update({ where: { userId }, data: { money: { increment: totalCoins } } });
            if (chestItems > 0) {
                const existing = await tx.inventoryItem.findFirst({ where: { userId, itemId: 'rare_chest' } });
                if (existing) await tx.inventoryItem.update({ where: { id: existing.id }, data: { quantity: { increment: chestItems } } });
                else await tx.inventoryItem.create({ data: { userId, itemId: 'rare_chest', itemType: 'chest', name: 'Rương Hiếm', quantity: chestItems } });
            }
        });
    }
}

export const towerService = new TowerService();
