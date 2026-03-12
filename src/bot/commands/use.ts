import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../../database/prisma';
import { SHOP_ITEMS } from '../services/shop';

export const data = new SlashCommandBuilder()
  .setName('use')
  .setDescription('Sử dụng vật phẩm trong túi đồ')
  .addStringOption(option => 
      option.setName('item_id')
          .setDescription('ID của vật phẩm (ví dụ: exp_potion)')
          .setRequired(true)
  )
  .addIntegerOption(option => 
      option.setName('quantity')
          .setDescription('Số lượng muốn sử dụng')
          .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const itemId = interaction.options.getString('item_id', true);
  const quantity = interaction.options.getInteger('quantity') || 1;
  const userId = interaction.user.id;

  if (quantity <= 0) {
      await interaction.reply({ content: "❌ Số lượng không hợp lệ.", ephemeral: true });
      return;
  }

  await interaction.deferReply();

  // Find item in inventory
  const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { userId, itemId }
  });

  if (!inventoryItem || inventoryItem.quantity < quantity) {
      await interaction.editReply(`❌ Bạn không có đủ **${quantity}x ${itemId}** trong túi đồ! (Hiện có: ${inventoryItem?.quantity || 0})`);
      return;
  }
  
  // Find pet
  const pet = await prisma.pet.findFirst({
      where: { ownerId: userId }
  });

  if (!pet) {
      await interaction.editReply("❌ Bạn chưa có sinh vật nào để dùng vật phẩm! Dùng `/pet start` để bắt đầu.");
      return;
  }

  // Handle Logic
  if (itemId === 'exp_potion') {
      const expGain = 50 * quantity;
      
      await prisma.$transaction(async (tx) => {
          // Deduct from inventory
          if (inventoryItem.quantity === quantity) {
              await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
          } else {
              await tx.inventoryItem.update({
                  where: { id: inventoryItem.id },
                  data: { quantity: { decrement: quantity } }
              });
          }
          
          // Add EXP to pet
          await tx.pet.update({
              where: { id: pet.id },
              data: { exp: { increment: expGain } }
          });
      });
      
      // Need to re-fetch pet to check for level up (Simplified here for now, handled fully in Farm service usually)
      const updatedPet = await prisma.pet.findUnique({ where: { id: pet.id }});
      if (!updatedPet) return;
      
      const expRequired = updatedPet.level * 100;
      let levelUpMessage = "";

      if (updatedPet.exp >= expRequired) {
          // Xử lý Lên Cấp (Simplified copy from Farm logic)
          let currentStats: any = {};
          try { currentStats = JSON.parse(updatedPet.stats); } catch(e){}
          
          currentStats.hp = (currentStats.hp || 100) + 20;
          currentStats.atk = (currentStats.atk || 10) + 5;
          currentStats.def = (currentStats.def || 10) + 5;
          currentStats.spd = (currentStats.spd || 10) + 2;

          await prisma.pet.update({
             where: { id: updatedPet.id },
             data: {
                 level: { increment: 1 },
                 exp: { decrement: expRequired },
                 stats: JSON.stringify(currentStats)
             }
          });
          levelUpMessage = `\n🎉 **THĂNG CẤP!** **${updatedPet.name}** đã lên **Lv.${updatedPet.level + 1}**!`;
      }
      
      await interaction.editReply(`🧪 Đã dùng **${quantity}x Bình EXP Nhỏ**. **${updatedPet.name}** nhận được **+${expGain} EXP**!${levelUpMessage}`);
      return;
  } 
  
  if (itemId === 'evo_stone') {
      await interaction.editReply(`❌ **Đá Tiến Hóa** không thể dùng trực tiếp bằng lệnh này. Hãy dùng \`/pet evolve\`.`);
      return;
  }

  await interaction.editReply("❌ Vật phẩm này không thể sử dụng vào lúc này.");
}
