import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { prisma } from '../../database/prisma';
import { petService } from '../services/pet';

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('Xem Bảng Xếp Hạng — Level, Coin, hoặc Tháp')
  .addStringOption(option =>
      option.setName('type')
          .setDescription('Loại bảng xếp hạng')
          .addChoices(
              { name: '⭐ Level Pet',    value: 'level' },
              { name: '💰 Giàu Nhất',   value: 'coin'  },
              { name: '🏰 Leo Tháp',    value: 'tower' },
              { name: '⚔️ Lực Chiến',    value: 'power' },
          )
          .setRequired(false)
  );

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

async function buildLevelBoard(): Promise<EmbedBuilder> {
    const pets = await prisma.pet.findMany({ orderBy: [{ level: 'desc' }, { exp: 'desc' }], take: 10 });
    const embed = new EmbedBuilder().setTitle('⭐ Top 10 — Cấp Độ Pet').setColor(0xA855F7);
    if (!pets.length) { embed.setDescription('Chưa có dữ liệu.'); return embed; }

    const lines = await Promise.all(pets.map(async (p, i) => {
        const id = await prisma.userIdentity.findUnique({ where: { userId: p.ownerId } });
        const maxExp = petService.getRequiredExp(p.level, p.rarity);
        return `${MEDALS[i]} **${p.name}** (${id?.nickname || p.ownerId.slice(0, 8)}) — Lv.**${p.level}** | ${p.exp.toLocaleString()}/${maxExp.toLocaleString()} EXP`;
    }));
    embed.setDescription(lines.join('\n'));
    return embed;
}

async function buildCoinBoard(): Promise<EmbedBuilder> {
    const identities = await prisma.userIdentity.findMany({ orderBy: { money: 'desc' }, take: 10 });
    const embed = new EmbedBuilder().setTitle('💰 Top 10 — Giàu Nhất').setColor(0xFFD700);
    if (!identities.length) { embed.setDescription('Chưa có dữ liệu.'); return embed; }
    const lines = identities.map((id, i) => `${MEDALS[i]} **${id.nickname || id.userId.slice(0, 8)}** — 💰 **${id.money.toLocaleString()} Coin**`);
    embed.setDescription(lines.join('\n'));
    return embed;
}

async function buildTowerBoard(): Promise<EmbedBuilder> {
    const records = await prisma.towerProgress.findMany({ orderBy: { maxFloor: 'desc' }, take: 10 });
    const embed = new EmbedBuilder().setTitle('🏰 Top 10 — Leo Tháp').setColor(0xF97316);
    if (!records.length) { embed.setDescription('Chưa có ai leo tháp.'); return embed; }

    const lines = await Promise.all(records.map(async (r, i) => {
        const id = await prisma.userIdentity.findUnique({ where: { userId: r.userId } });
        return `${MEDALS[i]} **${id?.nickname || r.userId.slice(0, 8)}** — 🏰 Tầng **${r.maxFloor}/100**`;
    }));
    embed.setDescription(lines.join('\n'));
    return embed;
}

async function buildPowerBoard(): Promise<EmbedBuilder> {
    const pets = await prisma.pet.findMany();
    const withPower = pets.map(p => ({
        pet: p,
        power: petService.calcCombatPower(p)
    })).sort((a,b) => b.power - a.power).slice(0, 10);

    const embed = new EmbedBuilder().setTitle('⚔️ Top 10 — Lực Chiến Tối Cao').setColor(0xE11D48);
    if (!withPower.length) { embed.setDescription('Chưa có dữ liệu.'); return embed; }

    const lines = await Promise.all(withPower.map(async (item, i) => {
        const id = await prisma.userIdentity.findUnique({ where: { userId: item.pet.ownerId } });
        return `${MEDALS[i]} **${item.pet.name}** (${id?.nickname || item.pet.ownerId.slice(0, 8)}) — ⚔️ **${item.power.toLocaleString()} CP**`;
    }));
    embed.setDescription(lines.join('\n'));
    return embed;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const type = interaction.options.getString('type') || 'level';

  let embed: EmbedBuilder;
  if (type === 'coin')  embed = await buildCoinBoard();
  else if (type === 'tower') embed = await buildTowerBoard();
  else if (type === 'power') embed = await buildPowerBoard();
  else embed = await buildLevelBoard();

  embed.setFooter({ text: 'Dùng /rank type:... để xem BXH khác' });
  await interaction.editReply({ embeds: [embed] });
}
