import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { SHOP_ITEMS } from '../services/shop';
import { petService } from '../services/pet';

export const data = new SlashCommandBuilder()
  .setName('claim_rank')
  .setDescription('🏆 Nhận Quà Xếp Hạng Tuần (Dành cho TOP 10 các bảng xếp hạng)');

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  await interaction.deferReply();

  let identity = await prisma.userIdentity.findUnique({ where: { userId } });
  if (!identity) {
      identity = await prisma.userIdentity.create({ data: { userId, nickname: interaction.user.username } });
  }

  // Check Weekly Cooldown
  const now = new Date();
  if (identity.lastRankReward) {
      // Allow claim once every 7 days
      const daysSinceClaim = Math.floor((now.getTime() - identity.lastRankReward.getTime()) / (1000 * 3600 * 24));
      if (daysSinceClaim < 7) {
          const daysLeft = 7 - daysSinceClaim;
          await interaction.editReply(`❌ Bạn đã nhận thưởng xếp hạng tuần này! Vui lòng quay lại sau **${daysLeft} ngày** nữa.`);
          return;
      }
  }

  // Determine ranks
  let inTop10 = false;
  const rankNames: string[] = [];

  // BXH Level Pet
  const petsLevel = await prisma.pet.findMany({ orderBy: [{ level: 'desc' }, { exp: 'desc' }], take: 10 });
  if (petsLevel.some(p => p.ownerId === userId)) {
      inTop10 = true;
      rankNames.push('⭐ Top Cấp Độ');
  }

  // BXH Leo Tháp
  const towerRecords = await prisma.towerProgress.findMany({ orderBy: { maxFloor: 'desc' }, take: 10 });
  if (towerRecords.some(r => r.userId === userId)) {
      inTop10 = true;
      rankNames.push('🏰 Top Leo Tháp');
  }

  // BXH Lực Chiến
  const allPets = await prisma.pet.findMany();
  const withPower = allPets.map(p => ({
      pet: p,
      power: petService.calcCombatPower(p)
  })).sort((a,b) => b.power - a.power).slice(0, 10);
  if (withPower.some(item => item.pet.ownerId === userId)) {
      inTop10 = true;
      rankNames.push('⚔️ Top Lực Chiến');
  }

  if (!inTop10) {
      await interaction.editReply(`❌ Rất tiếc! Bạn không nằm trong TOP 10 của bất kỳ bảng xếp hạng nào (\`/rank\`). Hãy cố gắng hơn nhé!`);
      return;
  }

  const coinReward = rankNames.length * 5000; // 5000 coin per rank
  const chestRewardCount = rankNames.length * 2; // 2 rare chests per rank
  const potionRewardCount = rankNames.length; // 1 stamina potion per rank

  await prisma.$transaction(async (tx) => {
      await tx.userIdentity.update({
          where: { userId },
          data: { money: { increment: coinReward }, lastRankReward: new Date() }
      });
      const chestId = 'rare_chest';
      const potionId = 'stamina_potion';
      
      const addItem = async (itemId: string, qty: number) => {
          const itemMeta = SHOP_ITEMS.find(i => i.id === itemId);
          if (!itemMeta) return;
          const existItem = await tx.inventoryItem.findFirst({ where: { userId, itemId } });
          if (existItem) {
              await tx.inventoryItem.update({ where: { id: existItem.id }, data: { quantity: { increment: qty } } });
          } else {
              await tx.inventoryItem.create({ data: { userId, itemId, itemType: itemMeta.type, name: itemMeta.name, quantity: qty } });
          }
      };

      await addItem(chestId, chestRewardCount);
      await addItem(potionId, potionRewardCount);
  });

  const embed = new EmbedBuilder()
      .setTitle('🏆 PHẦN THƯỞNG XẾP HẠNG TUẦN')
      .setColor(0xF59E0B)
      .setDescription(`Chúc mừng **${identity.nickname || interaction.user.username}** đã lọt vào:\n**${rankNames.join(' & ')}**!\n\nBạn đã nhận được:`)
      .addFields(
          { name: '💎 Tiền Thuởng Top', value: `**+${coinReward.toLocaleString()} Coin**`, inline: true },
          { name: '📦 Vật Phẩm Thưởng', value: `**+${chestRewardCount} Rương Hiếm**\n**+${potionRewardCount} Bình Thể Lực**`, inline: true }
      )
      .setFooter({ text: 'Hãy tiếp tục giữ vững phong độ nhé!' });

  await interaction.editReply({ embeds: [embed] });
}
