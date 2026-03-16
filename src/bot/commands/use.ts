import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { SHOP_ITEMS } from '../services/shop';
import { petService } from '../services/pet';
import { userIdentityService } from '../services/identity';

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
  )
  .addBooleanOption(option =>
      option.setName('use_all')
          .setDescription('Sử dụng TẤT CẢ số lượng đang có của vật phẩm này!')
          .setRequired(false)
  );


export async function execute(interaction: ChatInputCommandInteraction) {
  const itemId   = interaction.options.getString('item_id', true).trim().toLowerCase();
  let quantity = interaction.options.getInteger('quantity') || 1;
  const useAll = interaction.options.getBoolean('use_all') || false;
  const userId   = interaction.user.id;

  await interaction.deferReply();

  const inventoryItem = await prisma.inventoryItem.findFirst({ where: { userId, itemId } });
  
  if (useAll && inventoryItem && inventoryItem.quantity > 0) {
      quantity = inventoryItem.quantity;
  }

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

  // --- Trứng (Hatch Egg) ---
  if (shopItem.type === 'egg') {
      if (pet) {
          await interaction.editReply('❌ Bạn đã có sinh vật rồi! Không thể ấp thêm trứng.');
          return;
      }
      if (quantity > 1) {
          await interaction.editReply('❌ Mỗi lần chỉ có thể ấp 1 quả trứng!');
          return;
      }

      await interaction.editReply(`🧬 Đang ấp **${shopItem.name}**... Vui lòng đợi Gene-Sys phân tích gen...\n*(Lưu ý: Bọt khí sinh ảnh có thể kéo dài 15-20 giây)*`);

      let forcedRarity: string | undefined = undefined;
      if (itemId === 'egg_normal') forcedRarity = 'Normal';
      else if (itemId === 'egg_magic') forcedRarity = 'Magic';
      else if (itemId === 'egg_rare') forcedRarity = 'Rare';
      // 'egg_random' is undefined so it rolls naturally.

      try {
          const { newPet, embed, files } = await petService.hatchEggToDB(userId, shopItem.name, forcedRarity);
          
          await prisma.$transaction(async (tx) => {
              if (inventoryItem.quantity === 1) {
                  await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
              } else {
                  await tx.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantity: { decrement: 1 } } });
              }
          });

          await interaction.followUp({ embeds: [embed], files });
      } catch (error) {
          console.error("Hatching Error via Item:", error);
          await interaction.followUp({ content: "❌ Có lỗi xảy ra trong quá trình ấp trứng. Vật phẩm của bạn chưa bị mất.", ephemeral: true });
      }
      return;
  }

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

      if (coinsGain > 0) userIdentityService.invalidateCache(userId);

      const embed = new EmbedBuilder()
          .setTitle('📦 Mở Rương Hiếm!')
          .setDescription(rewards.join('\n'))
          .setColor(0xFFD700)
          .setFooter({ text: 'Dùng /pet list để xem EXP cập nhật sau khi mở!' });
      await interaction.editReply({ embeds: [embed] });
      return;
  }

  // --- Bình Thể Lực ---
  if (itemId === 'stamina_potion') {
      if (!pet) {
          await interaction.editReply('❌ Bạn chưa có sinh vật để dùng vật phẩm này!');
          return;
      }
      
      const { stamina, maxStamina } = await petService.getStamina(pet);
      if (stamina >= maxStamina) {
          await interaction.editReply('❌ Thể lực của sinh vật đã đầy, không cần dùng thêm!');
          return;
      }

      await petService.restoreStamina(pet.id, 30 * quantity);
      
      await prisma.$transaction(async (tx) => {
          if (inventoryItem.quantity === quantity) {
              await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
          } else {
              await tx.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantity: { decrement: quantity } } });
          }
      });
      
      const newStam = Math.min(maxStamina, stamina + 30 * quantity);
      await interaction.editReply(`🍖 Bạn đã cho **${pet.name}** dùng **${quantity}x Bình Thể Lực**. Thể lực hiện tại: **${newStam}/${maxStamina}**!`);
      return;
  }

  // --- Vật phẩm Cường Hóa (Elemental Crystals) ---
  if (shopItem.type === 'elemental') {
      if (!pet) {
          await interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');
          return;
      }
      
      let stats: any = {};
      try { stats = JSON.parse(pet.stats as string); } catch(e) {}
      
      if (itemId === 'fire_crystal') stats.atk = (stats.atk || 10) + (5 * quantity);
      if (itemId === 'water_crystal') stats.hp = (stats.hp || 100) + (20 * quantity);
      if (itemId === 'earth_crystal') stats.def = (stats.def || 10) + (5 * quantity);
      if (itemId === 'wind_crystal') stats.spd = (stats.spd || 10) + (3 * quantity);
      
      await prisma.$transaction(async (tx) => {
          if (inventoryItem.quantity === quantity) {
              await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
          } else {
              await tx.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantity: { decrement: quantity } } });
          }
          await (tx as any).pet.update({ where: { id: pet.id }, data: { stats: JSON.stringify(stats) } });
      });
      
      const embed = new EmbedBuilder()
          .setColor(0x00AE86)
          .setTitle(`${shopItem.emoji} Hấp Thụ Tinh Hoa Thành Công!`)
          .setDescription(`**${pet.name}** đã cắn ${quantity}x **${shopItem.name}**!\n\n${shopItem.description}`)
          .addFields({ name: '💪 Chỉ Số Hiện Tại', value: `❤️ HP: ${stats.hp} | ⚔️ ATK: ${stats.atk} | 🛡️ DEF: ${stats.def} | ⚡ SPD: ${stats.spd}`, inline: false });
          
      await interaction.editReply({ embeds: [embed] });
      return;
  }

  // --- Vật phẩm EXP (exp_stone_sm, exp_stone_md, exp_stone_lg) ---
  if (shopItem.expGain && shopItem.expGain > 0) {
      if (!pet) {
          await interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');
          return;
      }

      const totalExpGain = shopItem.expGain * quantity;

      if (inventoryItem.quantity === quantity) {
          await prisma.inventoryItem.delete({ where: { id: inventoryItem.id } });
      } else {
          await prisma.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantity: { decrement: quantity } } });
      }

      const { pet: updatedPet, messages, levelsGained } = await petService.addExpAndLevelUp(pet.id, totalExpGain);
      const finalReqExp = petService.getRequiredExp(updatedPet.level, updatedPet.rarity);
      const finalStats = JSON.parse(updatedPet.stats || '{}');

      const embed = new EmbedBuilder()
          .setColor(levelsGained > 0 ? 0xFF6B00 : 0x00AE86)
          .setTitle(levelsGained > 0 ? `🎉 THĂNG CẤP x${levelsGained}!` : `${shopItem.emoji} Sử Dụng Thành Công!`)
          .setDescription(`**${updatedPet.name}** nhận được **+${totalExpGain.toLocaleString()} EXP** từ ${quantity}x ${shopItem.emoji} ${shopItem.name}`)
          .addFields(
              { name: '📊 Cấp Độ', value: `Lv.${updatedPet.level}`, inline: true },
              { name: '✨ EXP Hiện Tại', value: `${updatedPet.exp.toLocaleString()} / ${finalReqExp.toLocaleString()}`, inline: true },
              { name: '⬆️ EXP Cần Thêm', value: `${(finalReqExp - updatedPet.exp).toLocaleString()}`, inline: true }
          );

      if (levelsGained > 0) {
          embed.addFields({
              name: '💪 Chỉ Số Mới',
              value: `❤️ HP: ${finalStats.hp} | 💙 MP: ${finalStats.mp} | ⚔️ ATK: ${finalStats.atk} | 🛡️ DEF: ${finalStats.def} | ⚡ SPD: ${finalStats.spd} | 🧠 INT: ${finalStats.int}`,
              inline: false
          });
      }

      if (updatedPet.imageData && updatedPet.imageData.startsWith('data:image')) {
          const base64Data = updatedPet.imageData.replace(/^data:image\/(png|jpeg);base64,/, '');
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
