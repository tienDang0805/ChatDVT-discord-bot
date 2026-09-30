import { Guild, GuildMember, Message, SnowflakeUtil } from 'discord.js';
import { prisma } from '../../database/prisma';

const URL_PATTERN = /https?:\/\/[^\s<]+/gi;
const SEARCH_RETRY_LIMIT = 8;

interface DiscordMessageSearchResponse {
  code?: number;
  retry_after?: number;
  total_results?: number;
  doing_deep_historical_index?: boolean;
}

export interface HistoricalSyncProgress {
  processed: number;
  total: number;
  synced: number;
  failed: number;
  currentMember: string;
}

export interface HistoricalSyncResult {
  total: number;
  synced: number;
  failed: number;
  durationMs: number;
}

export interface MemberActivitySnapshot {
  messageCount: number;
  linkCount: number;
  mediaCount: number;
  firstTrackedAt: Date | null;
  lastMessageAt: Date | null;
  historicalSyncedAt: Date | null;
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
  syncedMemberCount: number;
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
  return content.match(URL_PATTERN) ? 1 : 0;
}

function countMedia(message: Message): number {
  return message.attachments.size > 0 ? 1 : 0;
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
    historicalSyncedAt: null,
  };
}

function toActivitySnapshot(activity: {
  messageCount: number;
  linkCount: number;
  mediaCount: number;
  historicalMessageCount: number;
  historicalLinkCount: number;
  historicalMediaCount: number;
  historicalSyncedAt: Date | null;
  firstTrackedAt: Date;
  lastMessageAt: Date | null;
}): MemberActivitySnapshot {
  return {
    messageCount: activity.historicalMessageCount + activity.messageCount,
    linkCount: activity.historicalLinkCount + activity.linkCount,
    mediaCount: activity.historicalMediaCount + activity.mediaCount,
    historicalSyncedAt: activity.historicalSyncedAt,
    firstTrackedAt: activity.firstTrackedAt,
    lastMessageAt: activity.lastMessageAt,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFatalSearchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const apiError = error as Error & {
    status?: number;
    code?: number;
    rawError?: { code?: number };
  };
  const discordCode = apiError.code ?? apiError.rawError?.code;
  return apiError.status === 401 ||
    apiError.status === 403 ||
    discordCode === 50_001 ||
    discordCode === 50_013 ||
    error.message.includes('still indexing');
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
  private readonly syncingGuilds = new Set<string>();

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

  isHistoricalSyncRunning(guildId: string): boolean {
    return this.syncingGuilds.has(guildId);
  }

  private async searchHistoricalCount(
    guild: Guild,
    userId: string,
    maxMessageId: string,
    has?: 'link' | 'file',
  ): Promise<number> {
    const route = `/guilds/${guild.id}/messages/search` as `/${string}`;

    for (let attempt = 0; attempt < SEARCH_RETRY_LIMIT; attempt += 1) {
      const query = new URLSearchParams();
      query.set('limit', '1');
      query.set('author_id', userId);
      query.set('max_id', maxMessageId);
      query.set('include_nsfw', 'true');
      if (has) query.set('has', has);

      const response = await guild.client.rest.get(route, { query }) as DiscordMessageSearchResponse;
      if (typeof response.total_results === 'number') {
        return Math.max(0, response.total_results);
      }

      if (response.code !== 110000 && !response.doing_deep_historical_index) {
        throw new Error('Discord search did not return total_results');
      }

      const retrySeconds = Math.min(15, Math.max(1, Number(response.retry_after) || 2));
      await delay(retrySeconds * 1000);
    }

    throw new Error('Discord is still indexing this server; try the sync again later');
  }

  async syncHistoricalActivity(
    guild: Guild,
    onProgress?: (progress: HistoricalSyncProgress) => Promise<void> | void,
  ): Promise<HistoricalSyncResult> {
    if (this.syncingGuilds.has(guild.id)) {
      throw new Error('SYNC_ALREADY_RUNNING');
    }

    this.syncingGuilds.add(guild.id);
    const startedAt = new Date();

    try {
      await guild.members.fetch();
      const members = Array.from(guild.members.cache.values()).filter((member) => !member.user.bot);
      const activitiesAtStart = await prisma.discordMemberActivity.findMany({
        where: { guildId: guild.id },
      });
      const startByUser = new Map(activitiesAtStart.map((activity) => [activity.userId, activity]));
      const maxMessageId = SnowflakeUtil.generate({ timestamp: startedAt.getTime() }).toString();
      let synced = 0;
      let failed = 0;
      const emitProgress = async (progress: HistoricalSyncProgress) => {
        try {
          await onProgress?.(progress);
        } catch (error) {
          console.warn(`[CuongGia] Could not update sync progress for guild ${guild.id}:`, error);
        }
      };

      await emitProgress({ processed: 0, total: members.length, synced, failed, currentMember: '' });

      for (let index = 0; index < members.length; index += 1) {
        const member = members[index];
        try {
          const [historicalMessageCount, historicalLinkCount, historicalMediaCount] = await Promise.all([
            this.searchHistoricalCount(guild, member.id, maxMessageId),
            this.searchHistoricalCount(guild, member.id, maxMessageId, 'link'),
            this.searchHistoricalCount(guild, member.id, maxMessageId, 'file'),
          ]);
          const startActivity = startByUser.get(member.id);

          await prisma.$transaction(async (tx) => {
            const current = await tx.discordMemberActivity.findUnique({
              where: { guildId_userId: { guildId: guild.id, userId: member.id } },
            });
            const messageDelta = Math.max(0, (current?.messageCount ?? 0) - (startActivity?.messageCount ?? 0));
            const linkDelta = Math.max(0, (current?.linkCount ?? 0) - (startActivity?.linkCount ?? 0));
            const mediaDelta = Math.max(0, (current?.mediaCount ?? 0) - (startActivity?.mediaCount ?? 0));

            await tx.discordMemberActivity.upsert({
              where: { guildId_userId: { guildId: guild.id, userId: member.id } },
              create: {
                guildId: guild.id,
                userId: member.id,
                messageCount: messageDelta,
                linkCount: linkDelta,
                mediaCount: mediaDelta,
                historicalMessageCount,
                historicalLinkCount,
                historicalMediaCount,
                historicalSyncedAt: startedAt,
              },
              update: {
                messageCount: messageDelta,
                linkCount: linkDelta,
                mediaCount: mediaDelta,
                historicalMessageCount,
                historicalLinkCount,
                historicalMediaCount,
                historicalSyncedAt: startedAt,
              },
            });
          });

          synced += 1;
        } catch (error) {
          if (isFatalSearchError(error)) throw error;
          failed += 1;
          console.error(`[CuongGia] Historical sync failed for ${member.id} in ${guild.id}:`, error);
        }

        await emitProgress({
          processed: index + 1,
          total: members.length,
          synced,
          failed,
          currentMember: member.displayName,
        });
      }

      return {
        total: members.length,
        synced,
        failed,
        durationMs: Date.now() - startedAt.getTime(),
      };
    } finally {
      this.syncingGuilds.delete(guild.id);
    }
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
      activities.map((activity) => [activity.userId, toActivitySnapshot(activity)]),
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
      syncedMemberCount: entries.filter((entry) => entry.activity.historicalSyncedAt !== null).length,
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

    return calculateMemberPower(member, activity ? toActivitySnapshot(activity) : emptyActivity());
  }
}

export const cuongGiaService = new CuongGiaService();
