import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { EmbedBuilder } from 'discord.js';

export const SHOP_ITEMS = [
    { id: 'exp_stone_sm', name: 'Đá EXP Nhỏ',   type: 'consumable', price: 200,  description: '💎 Tăng **50 EXP** cho sinh vật.', emoji: '🟢', expGain: 50  },
    { id: 'exp_stone_md', name: 'Đá EXP Vừa',   type: 'consumable', price: 500,  description: '💎 Tăng **150 EXP** cho sinh vật.', emoji: '🔵', expGain: 150 },
    { id: 'exp_stone_lg', name: 'Đá EXP Lớn',   type: 'consumable', price: 1200, description: '💎 Tăng **400 EXP** cho sinh vật.', emoji: '🟣', expGain: 400 },
    { id: 'exp_potion',   name: 'Bình EXP Nhỏ', type: 'consumable', price: 100,  description: '🧪 Tăng **50 EXP** cho sinh vật.', emoji: '🧪', expGain: 50  },
    { id: 'hp_potion',    name: 'Bình Hồi Phục', type: 'battle',    price: 300,  description: '❤️ Hồi **+50 HP** trong PK.', emoji: '❤️', expGain: 0   },
    { id: 'mp_potion',    name: 'Bình MP',       type: 'battle',    price: 250,  description: '💙 Hồi **+50 MP** trong PK.', emoji: '💙', expGain: 0   },
    { id: 'evo_stone',    name: 'Đá Tiến Hóa',  type: 'evolution', price: 2000, description: '🔮 Dùng để tiến hóa sinh vật lên bậc tiếp theo.', emoji: '🔮', expGain: 0 },
    { id: 'rare_chest',   name: 'Rương Hiếm',   type: 'chest',     price: 3000, description: '📦 Mở ngẫu nhiên EXP lớn hoặc vật phẩm quý.', emoji: '📦', expGain: 0 },
];

class ShopService {
    public async showShop(interaction: any) {
        const embed = new EmbedBuilder()
            .setTitle('🛒  C Ử A  H À N G  H Ệ  T H Ố N G')
            .setDescription('Dùng `/buy <item_id> [số lượng]` để mua • `/inventory` để xem túi đồ')
            .setColor(0xFFD700)
            .setFooter({ text: 'Dùng /buy <item_id> để mua' });

        const categories: Record<string, typeof SHOP_ITEMS> = {};
        SHOP_ITEMS.forEach(item => {
            if (!categories[item.type]) categories[item.type] = [];
            categories[item.type].push(item);
        });

        const catNames: Record<string, string> = {
            consumable: '⚗️ Vật Phẩm EXP',
            battle: '⚔️ Vật Phẩm Chiến Đấu',
            evolution: '🧬 Tiến Hóa',
            chest: '📦 Rương Đặc Biệt'
        };

        for (const [type, items] of Object.entries(categories)) {
            const value = items.map(i =>
                `${i.emoji} **${i.name}** — \`${i.id}\`\n└ 💰 ${i.price} Coin | ${i.description}`
            ).join('\n\n');
            embed.addFields({ name: catNames[type] || type, value, inline: false });
        }

        return { embeds: [embed] };
    }

    public async buyItem(userId: string, itemId: string, quantity: number = 1) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return { success: false, message: '❌ Không tìm thấy vật phẩm này trong cửa hàng.' };
        if (quantity <= 0) return { success: false, message: '❌ Số lượng không hợp lệ.' };

        const totalPrice = item.price * quantity;
        const identity = await userIdentityService.getOrCreateIdentity(userId);
        if (identity.money < totalPrice) {
            return { success: false, message: `❌ Không đủ tiền! Cần **${totalPrice} Coin** nhưng bạn chỉ có **${identity.money} Coin**.` };
        }

        await prisma.$transaction(async (tx) => {
            await tx.userIdentity.update({ where: { userId }, data: { money: { decrement: totalPrice } } });
            const existingItem = await tx.inventoryItem.findFirst({ where: { userId, itemId } });
            if (existingItem) {
                await tx.inventoryItem.update({ where: { id: existingItem.id }, data: { quantity: { increment: quantity } } });
            } else {
                await tx.inventoryItem.create({ data: { userId, itemId: item.id, itemType: item.type, name: item.name, quantity } });
            }
        });

        return { success: true, message: `✅ Mua thành công **${quantity}x ${item.emoji} ${item.name}** với giá **${totalPrice} Coin**!` };
    }

    public async getInventory(userId: string) {
        const items = await prisma.inventoryItem.findMany({ where: { userId } });
        const identity = await prisma.userIdentity.findUnique({ where: { userId } });

        const embed = new EmbedBuilder()
            .setTitle('🎒 Túi Đồ Của Bạn')
            .setColor(0x00FF00);

        embed.addFields({ name: '💰 Số Dư', value: `**${identity?.money || 0} Coin**`, inline: true });
        embed.addFields({ name: '📦 Số Loại Vật Phẩm', value: `**${items.length}**`, inline: true });

        if (items.length === 0) {
            embed.setDescription('Túi đồ trống rỗng. Dùng `/shop` để mua đồ!');
        } else {
            items.forEach(item => {
                const shopItem = SHOP_ITEMS.find(s => s.id === item.itemId);
                embed.addFields({ name: `${shopItem?.emoji || '📦'} ${item.name} (${item.quantity}x)`, value: `Loại: \`${item.itemType}\` | ID: \`${item.itemId}\``, inline: true });
            });
        }

        return { embeds: [embed] };
    }
}

export const shopService = new ShopService();
