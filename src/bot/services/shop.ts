import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { EmbedBuilder } from 'discord.js';

export const SHOP_ITEMS = [
    { id: 'exp_stone_sm', name: 'Đá EXP Nhỏ',   type: 'consumable', price: 200,  description: '💎 Tăng **50 EXP** cho sinh vật.', emoji: '🟢', expGain: 50  },
    { id: 'exp_stone_md', name: 'Đá EXP Vừa',   type: 'consumable', price: 500,  description: '💎 Tăng **150 EXP** cho sinh vật.', emoji: '🔵', expGain: 150 },
    { id: 'exp_stone_lg', name: 'Đá EXP Lớn',   type: 'consumable', price: 1200, description: '💎 Tăng **400 EXP** cho sinh vật.', emoji: '🟣', expGain: 400 },
    { id: 'exp_potion',   name: 'Bình EXP Nhỏ', type: 'consumable', price: 100,  description: '🧪 Tăng **50 EXP** cho sinh vật.', emoji: '🧪', expGain: 50  },
    { id: 'fire_crystal', name: 'Khoáng Hỏa', type: 'elemental', price: 1500, description: '🔥 Vĩnh viễn tăng **+5 ATK** cho sinh vật.', emoji: '🔥', expGain: 0 },
    { id: 'water_crystal', name: 'Đá Băng', type: 'elemental', price: 1500, description: '💧 Vĩnh viễn tăng **+20 HP** cho sinh vật.', emoji: '💧', expGain: 0 },
    { id: 'earth_crystal', name: 'Hạt Giống Thổ', type: 'elemental', price: 1500, description: '🌿 Vĩnh viễn tăng **+5 DEF** cho sinh vật.', emoji: '🌿', expGain: 0 },
    { id: 'wind_crystal', name: 'Lông Vũ Phong', type: 'elemental', price: 1500, description: '🌪️ Vĩnh viễn tăng **+3 SPD** cho sinh vật.', emoji: '🌪️', expGain: 0 },
    { id: 'hp_potion',    name: 'Bình Hồi Phục', type: 'battle',    price: 300,  description: '❤️ Hồi **+50 HP** trong PK.', emoji: '❤️', expGain: 0   },
    { id: 'mp_potion',    name: 'Bình MP',       type: 'battle',    price: 250,  description: '💙 Hồi **+50 MP** trong PK.', emoji: '💙', expGain: 0   },
    { id: 'evo_stone',    name: 'Đá Tiến Hóa',  type: 'evolution', price: 2000, description: '🔮 Dùng để tiến hóa sinh vật lên bậc tiếp theo.', emoji: '🔮', expGain: 0 },
    { id: 'rare_chest',   name: 'Rương Hiếm',   type: 'chest',     price: 3000, description: '📦 Mở ngẫu nhiên EXP lớn hoặc vật phẩm quý.', emoji: '📦', expGain: 0 },
    { id: 'egg_random',   name: 'Trứng Kì Bí',  type: 'egg',       price: 1500, description: '🥚 Ấp ngẫu nhiên ra mọi độ hiếm (Tỷ lệ Vàng cực thấp).', emoji: '🥚', expGain: 0 },
    { id: 'egg_normal',   name: 'Trứng Sắt Cán', type: 'egg',       price: 500,  description: '🪨 Trứng bình dân, 100% nở ra sinh vật Normal.', emoji: '🪨', expGain: 0 },
    { id: 'egg_magic',    name: 'Trứng Ma Thuật', type: 'egg',      price: 2000, description: '🔮 Trứng hội tụ mana, 100% nở ra sinh vật Magic.', emoji: '🔮', expGain: 0 },
    { id: 'egg_rare',     name: 'Trứng Huyền Bí', type: 'egg',      price: 5000, description: '🌌 Trứng phát quang, 100% nở ra sinh vật Rare.', emoji: '🌌', expGain: 0 },
    { id: 'stamina_potion', name: 'Bình Thể Lực', type: 'consumable', price: 300, description: '🍖 Cấp phát **+30 Thể Lực** cho thú cưng đi farm.', emoji: '🍖', expGain: 0 },
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
            elemental: '💎 Đá Thuộc Tính',
            battle: '⚔️ Vật Phẩm Chiến Đấu',
            evolution: '🧬 Tiến Hóa',
            chest: '📦 Rương Đặc Biệt',
            egg: '🥚 Cửa Hàng Trứng'
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

        // Daily Limit Check for Stamina Potions
        if (itemId === 'stamina_potion') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const purchaseLog = await prisma.userItemPurchaseLog.findUnique({
                where: { userId_itemId_purchaseDate: { userId, itemId, purchaseDate: today } }
            });

            const boughtToday = purchaseLog?.quantity || 0;
            const limit = 10;
            
            if (boughtToday + quantity > limit) {
                return { success: false, message: `❌ Giới hạn mỗi ngày chỉ được mua tối đa **${limit} Bình Thể Lực**. Hôm nay bạn đã mua **${boughtToday} bình**, không thể mua thêm **${quantity} bình** nữa.` };
            }
        }

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

            // Update Purchase Log if applicable
            if (itemId === 'stamina_potion') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                await tx.userItemPurchaseLog.upsert({
                    where: { userId_itemId_purchaseDate: { userId, itemId, purchaseDate: today } },
                    update: { quantity: { increment: quantity } },
                    create: { userId, itemId, purchaseDate: today, quantity }
                });
            }
        });

        return { success: true, message: `✅ Mua thành công **${quantity}x ${item.emoji} ${item.name}** với giá **${totalPrice} Coin**!` };
    }

    public async sellItem(userId: string, itemId: string, quantity: number = 1) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return { success: false, message: '❌ Vật phẩm không tồn tại trong hệ thống.' };
        if (quantity <= 0) return { success: false, message: '❌ Số lượng không hợp lệ.' };

        if (item.type === 'egg') {
            return { success: false, message: '❌ Không thể bán lại Trứng.' };
        }

        const inventoryItem = await prisma.inventoryItem.findFirst({ where: { userId, itemId } });
        if (!inventoryItem || inventoryItem.quantity < quantity) {
            return { success: false, message: `❌ Bạn không có đủ **${item.name}** để bán. Hiện có: **${inventoryItem?.quantity || 0}**.` };
        }

        const SELL_RATE = 0.4;
        const sellPrice = Math.floor(item.price * SELL_RATE) * quantity;

        await prisma.$transaction(async (tx) => {
            await tx.userIdentity.update({ where: { userId }, data: { money: { increment: sellPrice } } });

            if (inventoryItem.quantity === quantity) {
                await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
            } else {
                await tx.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantity: { decrement: quantity } } });
            }
        });

        return { success: true, message: `✅ Đã bán **${quantity}x ${item.emoji} ${item.name}** và nhận **${sellPrice} Coin** 💰 (40% giá gốc).` };
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
