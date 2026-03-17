import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { petService } from '../services/pet';
import { SHOP_ITEMS } from '../services/shop';

const CRYSTAL_EFFECTS: Record<string, { stat: string, label: string, value: number }> = {
    'fire_crystal':  { stat: 'atk', label: '⚔️ ATK', value: 5 },
    'water_crystal': { stat: 'hp',  label: '❤️ HP',  value: 20 },
    'earth_crystal': { stat: 'def', label: '🛡️ DEF', value: 5 },
    'wind_crystal':  { stat: 'spd', label: '⚡ SPD', value: 3 },
};

const EXP_ITEM_IDS = ['exp_stone_sm', 'exp_stone_md', 'exp_stone_lg'];

export const data = new SlashCommandBuilder()
    .setName('power_up')
    .setDescription('💪 Tự động dùng TẤT CẢ Đá Thuộc Tính + Đá EXP trong kho 1 nút!');

export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    await interaction.deferReply();

    const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
    if (!pet) return interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');

    const inventory = await prisma.inventoryItem.findMany({ where: { userId } });
    if (inventory.length === 0) return interaction.editReply('❌ Kho đồ trống trơn!');

    let stats: any = {};
    try { stats = JSON.parse(pet.stats || '{}'); } catch {}

    const crystalLog: string[] = [];
    const expLog: string[] = [];
    let totalExpGain = 0;
    const itemsToDelete: number[] = [];
    const itemsToUpdate: { id: number; qty: number }[] = [];

    // ═══ 1. XỬ LÝ ĐÁ THUỘC TÍNH ═══
    for (const item of inventory) {
        const effect = CRYSTAL_EFFECTS[item.itemId];
        if (!effect || item.quantity <= 0) continue;

        const totalBoost = effect.value * item.quantity;
        stats[effect.stat] = (stats[effect.stat] || 0) + totalBoost;
        
        const shopItem = SHOP_ITEMS.find(s => s.id === item.itemId);
        crystalLog.push(`${shopItem?.emoji || '💎'} **${item.quantity}x ${item.name}** → ${effect.label} +${totalBoost}`);
        itemsToDelete.push(item.id);
    }

    // ═══ 2. XỬ LÝ ĐÁ EXP ═══
    for (const item of inventory) {
        if (!EXP_ITEM_IDS.includes(item.itemId) || item.quantity <= 0) continue;

        const shopItem = SHOP_ITEMS.find(s => s.id === item.itemId);
        if (!shopItem || !shopItem.expGain) continue;

        const gain = shopItem.expGain * item.quantity;
        totalExpGain += gain;

        expLog.push(`${shopItem.emoji} **${item.quantity}x ${item.name}** → +${gain.toLocaleString()} EXP`);
        if (!itemsToDelete.includes(item.id)) {
            itemsToDelete.push(item.id);
        }
    }

    if (crystalLog.length === 0 && totalExpGain === 0) {
        return interaction.editReply('❌ Không có Đá Thuộc Tính hay Đá EXP nào trong kho!');
    }

    // ═══ CẬP NHẬT DB ═══
    await prisma.$transaction(async (tx) => {
        if (crystalLog.length > 0) {
            await tx.pet.update({ where: { id: pet.id }, data: { stats: JSON.stringify(stats) } });
        }
        for (const id of itemsToDelete) {
            await tx.inventoryItem.delete({ where: { id } }).catch(() => {});
        }
    });

    let levelUpInfo = '';
    if (totalExpGain > 0) {
        const { pet: updatedPet, messages, levelsGained } = await petService.addExpAndLevelUp(pet.id, totalExpGain);
        if (levelsGained > 0) {
            levelUpInfo = `\n\n🎉 **THĂNG CẤP x${levelsGained}!** → Lv.${updatedPet.level}`;
            if (messages.length > 0) levelUpInfo += '\n' + messages.join('\n');
        }
        const finalStats = JSON.parse(updatedPet.stats || '{}');
        stats = finalStats;
    }

    // ═══ EMBED KẾT QUẢ ═══
    const sections: string[] = [];
    if (crystalLog.length > 0) sections.push(`**💎 Đá Thuộc Tính:**\n${crystalLog.join('\n')}`);
    if (expLog.length > 0) sections.push(`**✨ Đá EXP:**\n${expLog.join('\n')}`);

    const embed = new EmbedBuilder()
        .setTitle('💪 POWER UP HOÀN TẤT!')
        .setColor(0xFF6B00)
        .setDescription(`**${pet.name}** đã hấp thụ toàn bộ tinh hoa!\n\n${sections.join('\n\n')}${levelUpInfo}`)
        .addFields(
            { name: '❤️ HP', value: `${stats.hp || '?'}`, inline: true },
            { name: '⚔️ ATK', value: `${stats.atk || '?'}`, inline: true },
            { name: '🛡️ DEF', value: `${stats.def || '?'}`, inline: true },
            { name: '⚡ SPD', value: `${stats.spd || '?'}`, inline: true },
            { name: '💙 MP', value: `${stats.mp || '?'}`, inline: true },
            { name: '🧠 INT', value: `${stats.int || '?'}`, inline: true },
        )
        .setFooter({ text: 'Dùng /status để xem tổng quan!' });

    if (totalExpGain > 0) {
        embed.addFields({ name: '✨ Tổng EXP', value: `+${totalExpGain.toLocaleString()}`, inline: false });
    }

    await interaction.editReply({ embeds: [embed] });
}
