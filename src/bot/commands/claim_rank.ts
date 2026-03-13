import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { SHOP_ITEMS } from '../services/shop';
import { petService } from '../services/pet';

interface RankReward {
    coins: number;
    rareChest: number;
    staminaPotion: number;
    expStoneLg: number;
    evoPstone: number;
}

const TIER_REWARDS: Record<number, RankReward> = {
    1:  { coins: 20000, rareChest: 5, staminaPotion: 5, expStoneLg: 3, evoPstone: 1 },
    2:  { coins: 15000, rareChest: 4, staminaPotion: 4, expStoneLg: 2, evoPstone: 1 },
    3:  { coins: 12000, rareChest: 3, staminaPotion: 3, expStoneLg: 2, evoPstone: 0 },
    4:  { coins: 8000,  rareChest: 2, staminaPotion: 3, expStoneLg: 1, evoPstone: 0 },
    5:  { coins: 6000,  rareChest: 2, staminaPotion: 2, expStoneLg: 1, evoPstone: 0 },
    6:  { coins: 5000,  rareChest: 1, staminaPotion: 2, expStoneLg: 1, evoPstone: 0 },
    7:  { coins: 4000,  rareChest: 1, staminaPotion: 2, expStoneLg: 0, evoPstone: 0 },
    8:  { coins: 3000,  rareChest: 1, staminaPotion: 1, expStoneLg: 0, evoPstone: 0 },
    9:  { coins: 2000,  rareChest: 1, staminaPotion: 1, expStoneLg: 0, evoPstone: 0 },
    10: { coins: 1000,  rareChest: 0, staminaPotion: 1, expStoneLg: 0, evoPstone: 0 },
};

function getLastFriday1PM(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = (dayOfWeek >= 5) ? (dayOfWeek - 5) : (dayOfWeek + 2);

    const lastFriday = new Date(now);
    lastFriday.setDate(now.getDate() - diff);
    lastFriday.setHours(13, 0, 0, 0);

    if (lastFriday > now) {
        lastFriday.setDate(lastFriday.getDate() - 7);
    }

    return lastFriday;
}

function isFridayRewardWindow(): boolean {
    const now = new Date();
    const lastFri = getLastFriday1PM();
    return now >= lastFri;
}

export const data = new SlashCommandBuilder()
  .setName('claim_rank')
  .setDescription('🏆 Nhận Quà Xếp Hạng Tuần (Mở vào 13h Thứ 6 hàng tuần)');

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  await interaction.deferReply();

  if (!isFridayRewardWindow()) {
      await interaction.editReply('❌ Phần thưởng xếp hạng chỉ mở vào **13h Thứ 6** hàng tuần. Hãy chờ đến lúc đó nhé!');
      return;
  }

  let identity = await prisma.userIdentity.findUnique({ where: { userId } });
  if (!identity) {
      identity = await prisma.userIdentity.create({ data: { userId, nickname: interaction.user.username } });
  }

  const lastFriday = getLastFriday1PM();
  if (identity.lastRankReward && identity.lastRankReward >= lastFriday) {
      await interaction.editReply('❌ Bạn đã nhận thưởng xếp hạng tuần này rồi! Hãy chờ **Thứ 6 tuần sau** nhé.');
      return;
  }

  const userRanks: { board: string; position: number }[] = [];

  const petsLevel = await prisma.pet.findMany({ orderBy: [{ level: 'desc' }, { exp: 'desc' }], take: 10 });
  const levelIdx = petsLevel.findIndex(p => p.ownerId === userId);
  if (levelIdx !== -1) userRanks.push({ board: '⭐ Top Cấp Độ', position: levelIdx + 1 });

  const towerRecords = await (prisma as any).towerProgress.findMany({ orderBy: { maxFloor: 'desc' }, take: 10 });
  const towerIdx = towerRecords.findIndex((r: any) => r.userId === userId);
  if (towerIdx !== -1) userRanks.push({ board: '🏰 Top Leo Tháp', position: towerIdx + 1 });

  const allPets = await prisma.pet.findMany();
  const withPower = allPets.map(p => ({
      pet: p,
      power: petService.calcCombatPower(p)
  })).sort((a, b) => b.power - a.power).slice(0, 10);
  const powerIdx = withPower.findIndex(item => item.pet.ownerId === userId);
  if (powerIdx !== -1) userRanks.push({ board: '⚔️ Top Lực Chiến', position: powerIdx + 1 });

  if (userRanks.length === 0) {
      await interaction.editReply('❌ Rất tiếc! Bạn không nằm trong TOP 10 của bất kỳ bảng xếp hạng nào (`/rank`). Hãy cố gắng hơn nhé!');
      return;
  }

  let totalCoins = 0;
  let totalRareChest = 0;
  let totalStaminaPotion = 0;
  let totalExpStoneLg = 0;
  let totalEvoStone = 0;

  const rankLines: string[] = [];

  for (const rank of userRanks) {
      const reward = TIER_REWARDS[rank.position];
      if (!reward) continue;
      totalCoins += reward.coins;
      totalRareChest += reward.rareChest;
      totalStaminaPotion += reward.staminaPotion;
      totalExpStoneLg += reward.expStoneLg;
      totalEvoStone += reward.evoPstone;

      rankLines.push(`**#${rank.position}** ${rank.board} → +${reward.coins.toLocaleString()} 💰`);
  }

  await prisma.$transaction(async (tx) => {
      await tx.userIdentity.update({
          where: { userId },
          data: { money: { increment: totalCoins }, lastRankReward: new Date() }
      });

      const addItem = async (itemId: string, qty: number) => {
          if (qty <= 0) return;
          const itemMeta = SHOP_ITEMS.find(i => i.id === itemId);
          if (!itemMeta) return;
          const existItem = await tx.inventoryItem.findFirst({ where: { userId, itemId } });
          if (existItem) {
              await tx.inventoryItem.update({ where: { id: existItem.id }, data: { quantity: { increment: qty } } });
          } else {
              await tx.inventoryItem.create({ data: { userId, itemId, itemType: itemMeta.type, name: itemMeta.name, quantity: qty } });
          }
      };

      await addItem('rare_chest', totalRareChest);
      await addItem('stamina_potion', totalStaminaPotion);
      await addItem('exp_stone_lg', totalExpStoneLg);
      await addItem('evo_stone', totalEvoStone);
  });

  const rewardLines: string[] = [];
  if (totalCoins > 0) rewardLines.push(`💰 **+${totalCoins.toLocaleString()} Coin**`);
  if (totalRareChest > 0) rewardLines.push(`📦 **+${totalRareChest} Rương Hiếm**`);
  if (totalStaminaPotion > 0) rewardLines.push(`🍖 **+${totalStaminaPotion} Bình Thể Lực**`);
  if (totalExpStoneLg > 0) rewardLines.push(`🟣 **+${totalExpStoneLg} Đá EXP Lớn**`);
  if (totalEvoStone > 0) rewardLines.push(`🔮 **+${totalEvoStone} Đá Tiến Hóa**`);

  const embed = new EmbedBuilder()
      .setTitle('🏆 PHẦN THƯỞNG XẾP HẠNG TUẦN')
      .setColor(0xF59E0B)
      .setDescription(`Chúc mừng **${identity.nickname || interaction.user.username}**!\n\n📊 **Thành tích của bạn:**\n${rankLines.join('\n')}\n\n🎁 **Tổng phần thưởng nhận được:**\n${rewardLines.join('\n')}`)
      .setFooter({ text: 'Phần thưởng mở mỗi Thứ 6 lúc 13h. Hãy giữ vững phong độ!' });

  await interaction.editReply({ embeds: [embed] });
}
