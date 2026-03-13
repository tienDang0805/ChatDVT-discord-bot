import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { SHOP_ITEMS } from '../services/shop';

export const data = new SlashCommandBuilder()
  .setName('daily')
  .setDescription('📜 Điểm danh nhận quà mỗi ngày để phát triển Sinh Vật.');

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  await interaction.deferReply();

  let identity = await prisma.userIdentity.findUnique({ where: { userId } });
  if (!identity) {
      identity = await prisma.userIdentity.create({ data: { userId, nickname: interaction.user.username, signature: '' } });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (identity.lastDaily && identity.lastDaily >= today) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const hoursLeft = Math.floor((tomorrow.getTime() - new Date().getTime()) / 1000 / 3600);
      await interaction.editReply(`❌ Bạn đã nhận quà điểm danh hôm nay rồi! Hãy quay lại sau khoảng **${hoursLeft} giờ** nữa.`);
      return;
  }

  // --- RNG for Rewards ---
  const rewardCoins = 1000 + Math.floor(Math.random() * 500); // 1000 to 1500 coins
  const randomRoll = Math.random();
  
  let bonusItem: string | null = null;
  let bonusItemId: string | null = null;

  if (randomRoll < 0.2) {
      // 20% get elemental crystal
      const elements = ['fire_crystal', 'water_crystal', 'earth_crystal', 'wind_crystal'];
      bonusItemId = elements[Math.floor(Math.random() * elements.length)];
  } else if (randomRoll < 0.5) {
      // 30% get EXP Stone Medium
      bonusItemId = 'exp_stone_md';
  } else if (randomRoll < 0.7) {
      // 20% get Stamina Potion
      bonusItemId = 'stamina_potion';
  }

  let itemObj = null;
  if (bonusItemId) {
      itemObj = SHOP_ITEMS.find(i => i.id === bonusItemId);
  }

  // Update DB
  await prisma.$transaction(async (tx) => {
      await tx.userIdentity.update({
          where: { userId },
          data: {
              money: { increment: rewardCoins },
              lastDaily: new Date()
          }
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

  const embed = new EmbedBuilder()
      .setTitle('📅 ĐIỂM DANH THÀNH CÔNG!')
      .setColor(0x00FF00)
      .setDescription(`Cảm ơn bạn đã chăm sóc sinh vật. Đây là phần thưởng hôm nay của bạn.`)
      .addFields({ name: '💰 Tiền Thuởng', value: `**+${rewardCoins} Coin**`, inline: true });

  if (itemObj) {
      embed.addFields({ name: '🎁 Vật Phẩm May Mắn', value: `1x ${itemObj.emoji} **${itemObj.name}**`, inline: true });
  }

  embed.setFooter({ text: 'Dùng /inventory để kiểm tra túi đồ và /shop để mua thêm đồ.' });

  await interaction.editReply({ embeds: [embed] });
}
