import { prisma } from '../../database/prisma';
import { userIdentityService } from './identity';
import { EmbedBuilder } from 'discord.js';

export const SHOP_ITEMS = [
    { id: 'evo_stone', name: 'Đá Tiến Hóa', type: 'evolution', price: 500, description: 'Dùng để tiến hóa sinh vật lên bậc tiếp theo.' },
    { id: 'exp_potion', name: 'Bình EXP Nhỏ', type: 'consumable', price: 100, description: 'Tăng 50 EXP trực tiếp cho sinh vật.' }
];

class ShopService {
    public async showShop(interaction: any) {
        const embed = new EmbedBuilder()
            .setTitle('🛒 Cửa Hàng Hệ Thống')
            .setDescription('Sử dụng lệnh `/buy <item_id> [số lượng]` để mua vật phẩm.')
            .setColor(0xFFD700);

        SHOP_ITEMS.forEach(item => {
            embed.addFields({ name: `${item.name} (${item.price} Coin)`, value: `ID: \`${item.id}\`\n${item.description}` });
        });

        return { embeds: [embed] };
    }

    public async buyItem(userId: string, itemId: string, quantity: number = 1) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: '❌ Không tìm thấy vật phẩm này trong cửa hàng.' };
        }

        if (quantity <= 0) {
            return { success: false, message: '❌ Số lượng không hợp lệ.' };
        }

        const totalPrice = item.price * quantity;
        
        // Check user money
        const identity = await userIdentityService.getOrCreateIdentity(userId);
        if (identity.money < totalPrice) {
            return { success: false, message: `❌ Bạn không đủ tiền! Cần ${totalPrice} Coin nhưng bạn chỉ có ${identity.money} Coin.` };
        }

        // Deduct money & add item via transaction
        await prisma.$transaction(async (tx) => {
            await tx.userIdentity.update({
                where: { userId },
                data: { money: { decrement: totalPrice } }
            });

            const existingItem = await tx.inventoryItem.findFirst({
                where: { userId, itemId }
            });

            if (existingItem) {
                await tx.inventoryItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: { increment: quantity } }
                });
            } else {
                await tx.inventoryItem.create({
                    data: {
                        userId,
                        itemId: item.id,
                        itemType: item.type,
                        name: item.name,
                        quantity
                    }
                });
            }
        });

        return { success: true, message: `✅ Bạn đã mua thành công **${quantity}x ${item.name}** với giá ${totalPrice} Coin!` };
    }
    
    public async getInventory(userId: string) {
        const items = await prisma.inventoryItem.findMany({ where: { userId } });
        const identity = await prisma.userIdentity.findUnique({ where: { userId } });
        
        const embed = new EmbedBuilder()
            .setTitle('🎒 Túi Đồ')
            .setDescription(`💰 Số dư: **${identity?.money || 0} Coin**`)
            .setColor(0x00FF00);

        if (items.length === 0) {
            embed.addFields({ name: 'Trống', value: 'Bạn chưa có vật phẩm nào.' });
        } else {
            items.forEach(item => {
                embed.addFields({ name: `${item.name} (${item.quantity}x)`, value: `Loại: ${item.itemType} | ID: \`${item.itemId}\``, inline: true });
            });
        }
        
        return { embeds: [embed] };
    }
}

export const shopService = new ShopService();
