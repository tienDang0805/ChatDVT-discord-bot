import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { SHOP_ITEMS } from '../services/shop';

export const data = new SlashCommandBuilder()
  .setName('use')
  .setDescription('Sử dụng vật phẩm trong túi đồ')
  .addStringOption(option =>
      option.setName('item_id')
          .setDescription('ID của vật phẩm (exp_stone_sm, exp_stone_md, exp_stone_lg, hp_potion...)')
          .setRequired(true)
  )
  .addIntegerOption(option =>
      option.setName('quantity')
          .setDescription('Số lượng muốn sử dụng (mặc định: 1)')
          .setRequired(false)
          .setMinValue(1)
  );

function applyStatBonus(stats: any, levelsGained: number): any {
    for (let i = 0; i < levelsGained; i++) {
        stats.hp  = (stats.hp  || 100) + Math.floor(Math.random() * 16) + 10;
        stats.atk = (stats.atk || 10)  + Math.floor(Math.random() * 5) + 2;
        stats.def = (stats.def || 10)  + Math.floor(Math.random() * 5) + 2;
        stats.spd = (stats.spd || 10)  + Math.floor(Math.random() * 3) + 1;
    }
    return stats;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const itemId   = interaction.options.getString('item_id', true).trim().toLowerCase();
  const quantity = interaction.options.getInteger('quantity') || 1;
  const userId   = interaction.user.id;

  await interaction.deferReply();

  const inventoryItem = await prisma.inventoryItem.findFirst({ where: { userId, itemId } });
  if (!inventoryItem || inventoryItem.quantity < quantity) {
      await interaction.editReply(`❌ Bạn không có đủ **${quantity}x ${itemId}**! (Hiện có: ${inventoryItem?.quantity || 0})`);
      return;
  }

  const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
  if (!shopItem) {
      await interaction.editReply('❌ Không tìm thấy thông tin vật phẩm này.');
      return;
  }

  const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });

  // --- Vật phẩm battle (HP/MP Potion) ---
  if (shopItem.type === 'battle') {
      await interaction.editReply(`❌ **${shopItem.name}** chỉ có thể dùng trong trận PK! Tham gia thách đấu bằng \`/pk @user\`.`);
      return;
  }

  // --- Đá Tiến Hóa ---
  if (itemId === 'evo_stone') {
      await interaction.editReply(`❌ **Đá Tiến Hóa** không thể dùng lệnh này. Hãy dùng \`/pet evolve\`.`);
      return;
  }

  // --- Rương Hiếm ---
  if (itemId === 'rare_chest') {
      if (!pet) {
          await interaction.editReply('❌ Bạn cần có sinh vật trước khi mở Rương Hiếm!');
          return;
      }
      const rewards: string[] = [];
      let totalExpGain = 0;
      let coinsGain = 0;
      let itemDropped = null;

      for (let i = 0; i < quantity; i++) {
          const roll = Math.random();
          if (roll < 0.5) {
              const bonus = 200 + Math.floor(Math.random() * 301);
              totalExpGain += bonus;
              rewards.push(`📦 Rương #${i+1}: **+${bonus} EXP**`);
          } else if (roll < 0.75) {
              const coins = 500 + Math.floor(Math.random() * 501);
              coinsGain += coins;
              rewards.push(`📦 Rương #${i+1}: **+${coins} Coin**`);
          } else {
              const expItems = SHOP_ITEMS.filter(si => si.expGain > 0);
              itemDropped = expItems[Math.floor(Math.random() * expItems.length)];
              rewards.push(`📦 Rương #${i+1}: **1x ${itemDropped.emoji} ${itemDropped.name}**`);
          }
      }

      await prisma.$transaction(async (tx) => {
          if (inventoryItem.quantity === quantity) {
              await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
          } else {
              await tx.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantity: { decrement: quantity } } });
          }
          if (totalExpGain > 0) await tx.pet.update({ where: { id: pet.id }, data: { exp: { increment: totalExpGain } } });
          if (coinsGain > 0) await tx.userIdentity.update({ where: { userId }, data: { money: { increment: coinsGain } } });
          if (itemDropped) {
              const existItem = await tx.inventoryItem.findFirst({ where: { userId, itemId: itemDropped.id } });
              if (existItem) await tx.inventoryItem.update({ where: { id: existItem.id }, data: { quantity: { increment: 1 } } });
              else await tx.inventoryItem.create({ data: { userId, itemId: itemDropped.id, itemType: itemDropped.type, name: itemDropped.name, quantity: 1 } });
          }
      });

      const embed = new EmbedBuilder()
          .setTitle('📦 Mở Rương Hiếm!')
          .setDescription(rewards.join('\n'))
          .setColor(0xFFD700)
          .setFooter({ text: 'Dùng /pet list để xem EXP cập nhật sau khi mở!' });
      await interaction.editReply({ embeds: [embed] });
      return;
  }

  // --- Vật phẩm EXP (exp_stone_sm, exp_stone_md, exp_stone_lg, exp_potion) ---
  if (shopItem.expGain && shopItem.expGain > 0) {
      if (!pet) {
          await interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');
          return;
      }

      const totalExpGain = shopItem.expGain * quantity;

      // Deduct item
      await (async () => {
          if (inventoryItem.quantity === quantity) {
              await prisma.inventoryItem.delete({ where: { id: inventoryItem.id } });
          } else {
              await prisma.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantity: { decrement: quantity } } });
          }
          await prisma.pet.update({ where: { id: pet.id }, data: { exp: { increment: totalExpGain } } });
      })();

      // Re-fetch and compute multi-level-up
      let updatedPet = await prisma.pet.findUnique({ where: { id: pet.id } });
      if (!updatedPet) return;

      let stats: any = {};
      try { stats = JSON.parse(updatedPet.stats); } catch(e) {}

      let levelsGained = 0;
      let currentExp = updatedPet.exp;
      let currentLevel = updatedPet.level;

      while (currentExp >= currentLevel * 100) {
          currentExp -= currentLevel * 100;
          currentLevel++;
          levelsGained++;
      }

      if (levelsGained > 0) {
          stats = applyStatBonus(stats, levelsGained);
          await prisma.pet.update({
              where: { id: updatedPet.id },
              data: { level: currentLevel, exp: currentExp, stats: JSON.stringify(stats) }
          });
      }

      const finalPet = levelsGained > 0
          ? await prisma.pet.findUnique({ where: { id: pet.id } })
          : updatedPet;

      const embed = new EmbedBuilder()
          .setColor(levelsGained > 0 ? 0xFF6B00 : 0x00AE86)
          .setTitle(levelsGained > 0 ? `🎉 THĂNG CẤP x${levelsGained}!` : `${shopItem.emoji} Sử Dụng Thành Công!`)
          .setDescription(`**${finalPet!.name}** nhận được **+${totalExpGain} EXP** từ ${quantity}x ${shopItem.emoji} ${shopItem.name}`)
          .addFields(
              { name: '📊 Cấp Độ', value: `Lv.${finalPet!.level}`, inline: true },
              { name: '✨ EXP Hiện Tại', value: `${finalPet!.exp} / ${finalPet!.level * 100}`, inline: true },
              { name: '⬆️ EXP Cần Thêm', value: `${finalPet!.level * 100 - finalPet!.exp}`, inline: true }
          );

      if (levelsGained > 0) {
          embed.addFields({
              name: '💪 Chỉ Số Sau Thăng Cấp',
              value: `❤️ HP: ${stats.hp} | ⚔️ ATK: ${stats.atk} | 🛡️ DEF: ${stats.def} | ⚡ SPD: ${stats.spd}`,
              inline: false
          });
      }

      if (finalPet!.imageData && finalPet!.imageData.startsWith('data:image')) {
          const base64Data = finalPet!.imageData.replace(/^data:image\/(png|jpeg);base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          await interaction.editReply({ embeds: [embed], files: [{ attachment: buffer, name: 'pet.png' }] });
          embed.setThumbnail('attachment://pet.png');
      } else {
          await interaction.editReply({ embeds: [embed] });
      }
      return;
  }

  await interaction.editReply('❌ Vật phẩm này không thể sử dụng bằng lệnh `/use`.');
}
