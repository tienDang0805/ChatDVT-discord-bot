import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { petService } from '../services/pet';
import { userIdentityService } from '../services/identity';
import { SHOP_ITEMS } from '../services/shop';

export const data = new SlashCommandBuilder()
    .setName('train')
    .setDescription('Sử dụng xu (Coin) để tự động mua Đá/Bình EXP và nạp trực tiếp cho sinh vật.')
    .addIntegerOption(option => 
        option.setName('coin')
            .setDescription('Số lượng xu muốn tiêu (Tối thiểu 100)')
            .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    const inputCoin = interaction.options.getInteger('coin', true);
    if (inputCoin < 100) {
        return interaction.reply({ content: '❌ Bạn cần dùng ít nhất 100 Coin để huấn luyện.', ephemeral: true });
    }

    await interaction.deferReply();
    const userId = interaction.user.id;

    // Check Pet
    const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
    if (!pet) {
        return interaction.editReply('❌ Bạn chưa có sinh vật nào! Dùng `/pet start`.');
    }

    // Check Coin
    const identity = await userIdentityService.getOrCreateIdentity(userId, true);
    if (identity.money < inputCoin) {
        return interaction.editReply(`❌ Không đủ tiền! Bạn chỉ có **${identity.money} Coin** lúc này.`);
    }

    // Lọc ra các vật phẩm có ExpRate và sort giảm dần (Ưu tiên Potion hoặc Đá có p/p ngon nhất)
    const expItems = SHOP_ITEMS
        .filter(i => (i.expGain || 0) > 0 && i.price > 0 && i.type === 'consumable')
        .sort((a, b) => ((b.expGain || 0) / b.price) - ((a.expGain || 0) / a.price));

    if (expItems.length === 0) {
        return interaction.editReply('❌ Lỗi: Cửa hàng không có vật phẩm EXP!');
    }

    let remainingCoin = inputCoin;
    let totalExpGained = 0;
    const itemsBoughtMap: Record<string, number> = {};

    // Thuật toán mua vét cạn từ vật phẩm ngon nhất đến kém nhất tuỳ số xu hiện tại
    for (const item of expItems) {
        if (remainingCoin >= item.price) {
            const qty = Math.floor(remainingCoin / item.price);
            totalExpGained += qty * (item.expGain || 0);
            remainingCoin %= item.price;
            itemsBoughtMap[item.name] = qty;
        }
    }

    if (totalExpGained === 0) {
        return interaction.editReply(`❌ Sỗ quỹ nhập vào quá thấp, không mua nổi một tép EXP nhỏ nhất (Cần ít nhất ${expItems[expItems.length - 1].price} Coin).`);
    }

    const coinsSpent = inputCoin - remainingCoin;

    // Cập nhật số dư User
    await prisma.userIdentity.update({
        where: { userId },
        data: { money: { decrement: coinsSpent } }
    });

    // Cộng Exp thẳng lên Pet, báo Cập nhật level nếu có
    const expResult = await petService.addExpAndLevelUp(pet.id, totalExpGained);
    
    const logicLog = Object.entries(itemsBoughtMap)
        .map(([name, qty]) => `📦 Tự động nhập: **${qty}x ${name}**`)
        .join('\n');

    const embed = new EmbedBuilder()
        .setTitle('🏋️ HUẤN LUYỆN THÀNH CÔNG')
        .setColor(0x00FF00)
        .setDescription(`**${pet.name}** đã kết thúc khóa huấn luyện đặc biệt!\n\n${logicLog}`)
        .addFields(
            { name: '💰 Vốn Thuê', value: `${inputCoin} Coin`, inline: true },
            { name: '💸 Đã Tiêu', value: `-${coinsSpent} Coin`, inline: true },
            { name: '🪙 Trả Tiền Thừa', value: `+${remainingCoin} Coin`, inline: true },
            { name: '✨ EXP Nhận Lại', value: `+${totalExpGained} EXP`, inline: false }
        );

    // Bơm Lints messages buff
    if (expResult.messages && expResult.messages.length > 0) {
        embed.addFields({ name: '📈 Thông Báo Thăng Cấp', value: expResult.messages.join('\n'), inline: false });
    }

    embed.setFooter({ text: `Vui lòng dùng /rank để check level! Hiện tại: Lv.${expResult.pet.level}` });

    return interaction.editReply({ embeds: [embed] });
}
