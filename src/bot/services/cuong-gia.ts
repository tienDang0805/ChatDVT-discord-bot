import { Guild, GuildMember, Message } from 'discord.js';
import { prisma } from '../../database/prisma';

const URL_PATTERN = /https?:\/\/[^\s<]+/gi;
const MEDIA_EXTENSION_PATTERN = /\.(?:avif|gif|jpe?g|png|webp|mp4|mov|webm|mp3|wav|ogg|m4a)(?:\?|$)/i;

export interface MemberActivitySnapshot {
  messageCount: number;
  linkCount: number;
  mediaCount: number;
  firstTrackedAt: Date | null;
  lastMessageAt: Date | null;
}

export interface CuongGiaEntry {
  member: GuildMember;
  activity: MemberActivitySnapshot;
  tenureDays: number;
  tenurePoints: number;
  roleCount: number;
  rolePoints: number;
  activityPoints: number;
  totalPoints: number;
  realm: string;
}

export interface GuildRankingResult {
  entries: CuongGiaEntry[];
  memberCount: number;
  fetchedAllMembers: boolean;
}

const REALMS = [
  { min: 100_000, name: '🌌 Tiên Đế' },
  { min: 50_000, name: '⚡ Độ Kiếp' },
  { min: 25_000, name: '👑 Đại Thừa' },
  { min: 12_000, name: '🌀 Hợp Thể' },
  { min: 6_000, name: '🔮 Luyện Hư' },
  { min: 3_000, name: '🔥 Hóa Thần' },
  { min: 1_500, name: '🧿 Nguyên Anh' },
  { min: 750, name: '💎 Kim Đan' },
  { min: 250, name: '🌿 Trúc Cơ' },
  { min: 50, name: '💨 Luyện Khí' },
  { min: 0, name: '🥚 Phàm Nhân' },
];

function countLinks(content: string): number {
  return content.match(URL_PATTERN)?.length ?? 0;
}

function countMedia(message: Message): number {
  const attachmentCount = message.attachments.filter((attachment) => {
    if (attachment.contentType?.startsWith('image/') ||
        attachment.contentType?.startsWith('video/') ||
        attachment.contentType?.startsWith('audio/')) {
      return true;
    }
    return MEDIA_EXTENSION_PATTERN.test(attachment.name ?? attachment.url);
  }).size;

  return attachmentCount + message.stickers.size;
}

function getRealm(points: number): string {
  return REALMS.find((realm) => points >= realm.min)?.name ?? REALMS[REALMS.length - 1].name;
}

function emptyActivity(): MemberActivitySnapshot {
  return {
    messageCount: 0,
    linkCount: 0,
    mediaCount: 0,
    firstTrackedAt: null,
    lastMessageAt: null,
  };
}

export function calculateMemberPower(
  member: GuildMember,
  activity: MemberActivitySnapshot = emptyActivity(),
  now = Date.now(),
): CuongGiaEntry {
  const joinedTimestamp = member.joinedTimestamp ?? now;
  const tenureDays = Math.max(0, Math.floor((now - joinedTimestamp) / 86_400_000));
  const visibleRoles = member.roles.cache.filter((role) => role.id !== member.guild.id && !role.managed);
  const highestRolePosition = visibleRoles.reduce((highest, role) => Math.max(highest, role.position), 0);

  // Thâm niên có trần 10 năm; role có trần để quyền quản trị không quyết định toàn bộ BXH.
  const tenurePoints = Math.min(7_300, tenureDays * 2);
  const roleCount = visibleRoles.size;
  const rolePoints = Math.min(1_500, roleCount * 120 + highestRolePosition * 12);
  const activityPoints = activity.messageCount + activity.linkCount * 3 + activity.mediaCount * 5;
  const totalPoints = tenurePoints + rolePoints + activityPoints;

  return {
    member,
    activity,
    tenureDays,
    tenurePoints,
    roleCount,
    rolePoints,
    activityPoints,
    totalPoints,
    realm: getRealm(totalPoints),
  };
}

export function formatTenure(totalDays: number): string {
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = (totalDays % 365) % 30;
  const parts: string[] = [];

  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ngày`);
  return parts.join(' ');
}

class CuongGiaService {
  async trackMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;

    const linkCount = countLinks(message.content);
    const mediaCount = countMedia(message);
    const now = new Date();

    await prisma.discordMemberActivity.upsert({
      where: {
        guildId_userId: {
          guildId: message.guild.id,
          userId: message.author.id,
        },
      },
      create: {
        guildId: message.guild.id,
        userId: message.author.id,
        messageCount: 1,
        linkCount,
        mediaCount,
        firstTrackedAt: now,
        lastMessageAt: now,
      },
      update: {
        messageCount: { increment: 1 },
        linkCount: { increment: linkCount },
        mediaCount: { increment: mediaCount },
        lastMessageAt: now,
      },
    });
  }

  async getGuildRanking(guild: Guild): Promise<GuildRankingResult> {
    let fetchedAllMembers = true;
    try {
      await guild.members.fetch();
    } catch (error) {
      fetchedAllMembers = false;
      console.warn(`[CuongGia] Cannot fetch every member in guild ${guild.id}; using cache.`, error);
    }

    const activities = await prisma.discordMemberActivity.findMany({
      where: { guildId: guild.id },
    });
    const activityByUser = new Map<string, MemberActivitySnapshot>(
      activities.map((activity) => [activity.userId, activity]),
    );

    const entries = Array.from(guild.members.cache.values())
      .filter((member) => !member.user.bot)
      .map((member) => calculateMemberPower(member, activityByUser.get(member.id) ?? emptyActivity()))
      .sort((a, b) =>
        b.totalPoints - a.totalPoints ||
        b.activity.messageCount - a.activity.messageCount ||
        b.tenureDays - a.tenureDays,
      );

    return {
      entries,
      memberCount: entries.length,
      fetchedAllMembers,
    };
  }

  async getMemberEntry(member: GuildMember): Promise<CuongGiaEntry> {
    const activity = await prisma.discordMemberActivity.findUnique({
      where: {
        guildId_userId: {
          guildId: member.guild.id,
          userId: member.id,
        },
      },
    });

    return calculateMemberPower(member, activity ?? emptyActivity());
  }
}

export const cuongGiaService = new CuongGiaService();
