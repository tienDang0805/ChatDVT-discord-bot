import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js';
import { cuongGiaService, CuongGiaEntry, formatTenure } from '../services/cuong-gia';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export const data = new SlashCommandBuilder()
  .setName('cuonggia')
  .setDescription('Bảng xếp hạng cường giả của server')
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('bang')
      .setDescription('Xem top 10 cường giả toàn server'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('hoso')
      .setDescription('Soi hồ sơ và cảnh giới của một thành viên')
      .addUserOption((option) =>
        option
          .setName('thanhvien')
          .setDescription('Thành viên cần soi; để trống sẽ xem chính bạn')
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('cach-tinh')
      .setDescription('Xem công thức tính điểm cường giả'),
  );

function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN');
}

function getSpecialTitles(entry: CuongGiaEntry, allEntries: CuongGiaEntry[]): string[] {
  const titles: string[] = [];
  const maxTenure = Math.max(...allEntries.map((item) => item.tenureDays));
  const maxMessages = Math.max(...allEntries.map((item) => item.activity.messageCount));
  const maxLinks = Math.max(...allEntries.map((item) => item.activity.linkCount));
  const maxMedia = Math.max(...allEntries.map((item) => item.activity.mediaCount));

  if (entry.member.guild.ownerId === entry.member.id) titles.push('👑 Tông Chủ');
  if (entry.tenureDays === maxTenure) titles.push('🏛️ Khai Sơn Lão Tổ');
  if (maxMessages > 0 && entry.activity.messageCount === maxMessages) titles.push('📣 Truyền Âm Đại Sư');
  if (maxLinks > 0 && entry.activity.linkCount === maxLinks) titles.push('🔗 Tàng Kinh Các Chủ');
  if (maxMedia > 0 && entry.activity.mediaCount === maxMedia) titles.push('🎞️ Ảnh Đế');

  return titles;
}

function buildFormulaEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x7C3AED)
    .setTitle('📜 Bí pháp tính điểm Cường Giả')
    .setDescription([
      '**Tổng điểm = Thâm niên + Hoạt động + Role**',
      '',
      '• **Thâm niên:** `2 điểm/ngày`, tối đa 10 năm.',
      '• **Tin nhắn:** `1 điểm/tin`.',
      '• **Link:** thêm `3 điểm/link`.',
      '• **Media:** thêm `5 điểm/ảnh, video, audio hoặc sticker`.',
      '• **Role:** `120 × số role + 12 × vị trí role cao nhất`, nhưng bị chặn ở `1.500 điểm` để admin không auto vô địch.',
      '',
      '**Cảnh giới:** Phàm Nhân → Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Tiên Đế.',
      '',
      '⚠️ Discord cho bot đọc ngày gia nhập và role hiện tại, nhưng không mở số liệu lịch sử trong Mod View. Vì vậy tin/link/media chỉ được tính từ khi tính năng này được deploy.',
    ].join('\n'))
    .setFooter({ text: 'BXH chỉ để giải trí — spam để farm điểm vẫn là phàm nhân trong lòng mọi người.' });
}

async function showLeaderboard(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild!;
  const result = await cuongGiaService.getGuildRanking(guild);
  const top = result.entries.slice(0, 10);

  const embed = new EmbedBuilder()
    .setColor(0xF59E0B)
    .setTitle('⚔️ BẢNG XẾP HẠNG CƯỜNG GIẢ')
    .setDescription(top.length > 0
      ? top.map((entry, index) => [
          `${MEDALS[index]} <@${entry.member.id}> — **${entry.realm}**`,
          `└ ⚡ **${formatNumber(entry.totalPoints)}** | ⏳ ${formatTenure(entry.tenureDays)} | 💬 ${formatNumber(entry.activity.messageCount)}`,
        ].join('\n')).join('\n')
      : 'Chưa tìm thấy thành viên nào để lập bảng.')
    .addFields({
      name: '📊 Đã luận kiếm',
      value: `**${formatNumber(result.memberCount)}** thành viên không phải bot`,
      inline: true,
    })
    .setTimestamp();

  const currentIndex = result.entries.findIndex((entry) => entry.member.id === interaction.user.id);
  const cacheWarning = result.fetchedAllMembers ? '' : ' • Chỉ tính thành viên đang có trong cache';
  embed.setFooter({
    text: `${currentIndex >= 0 ? `Hạng của bạn: #${currentIndex + 1}` : 'Bạn chưa có trong bảng'}${cacheWarning} • /cuonggia hoso`,
  });

  await interaction.editReply({ embeds: [embed] });
}

async function showProfile(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild!;
  const targetUser = interaction.options.getUser('thanhvien') ?? interaction.user;
  const member = await guild.members.fetch(targetUser.id);

  if (member.user.bot) {
    await interaction.editReply('🤖 Bot không tu tiên trong bảng này.');
    return;
  }

  const ranking = await cuongGiaService.getGuildRanking(guild);
  const rankIndex = ranking.entries.findIndex((entry) => entry.member.id === member.id);
  const entry = rankIndex >= 0 ? ranking.entries[rankIndex] : await cuongGiaService.getMemberEntry(member);
  const specialTitles = getSpecialTitles(entry, ranking.entries);
  const joinedUnix = Math.floor((member.joinedTimestamp ?? Date.now()) / 1000);
  const trackedSince = entry.activity.firstTrackedAt
    ? entry.activity.firstTrackedAt.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'chưa có tin nhắn được ghi nhận';
  const roleNames = member.roles.cache
    .filter((role) => role.id !== guild.id && !role.managed)
    .sort((a, b) => b.position - a.position)
    .first(5)
    .map((role) => role.name);

  const embed = new EmbedBuilder()
    .setColor(member.displayColor || 0x5865F2)
    .setAuthor({ name: `Hồ sơ cường giả • ${member.displayName}`, iconURL: member.displayAvatarURL() })
    .setThumbnail(member.displayAvatarURL({ size: 256 }))
    .setTitle(`${entry.realm} • Hạng #${rankIndex >= 0 ? rankIndex + 1 : '?'}`)
    .setDescription(specialTitles.length > 0 ? `**Đặc danh:** ${specialTitles.join(' • ')}` : 'Chưa đoạt được đặc danh server.')
    .addFields(
      {
        name: '⏳ Căn cơ',
        value: `Vào server: <t:${joinedUnix}:D>\nGắn bó: **${formatTenure(entry.tenureDays)}**\nĐiểm: **${formatNumber(entry.tenurePoints)}**`,
        inline: true,
      },
      {
        name: '📨 Hoạt động',
        value: `💬 ${formatNumber(entry.activity.messageCount)} tin\n🔗 ${formatNumber(entry.activity.linkCount)} link\n🎞️ ${formatNumber(entry.activity.mediaCount)} media`,
        inline: true,
      },
      {
        name: '🎭 Role',
        value: `**${entry.roleCount}** role • **${formatNumber(entry.rolePoints)}** điểm\n${roleNames.length > 0 ? roleNames.join(', ') : 'Không có role riêng'}`,
        inline: false,
      },
      {
        name: '⚡ Tổng đạo hạnh',
        value: `**${formatNumber(entry.totalPoints)} điểm** = ${formatNumber(entry.tenurePoints)} thâm niên + ${formatNumber(entry.activityPoints)} hoạt động + ${formatNumber(entry.rolePoints)} role`,
        inline: false,
      },
    )
    .setFooter({ text: `Theo dõi hoạt động từ: ${trackedSince}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Lệnh này chỉ dùng trong server.', ephemeral: true });
    return;
  }

  const subcommand = interaction.options.getSubcommand();
  if (subcommand === 'cach-tinh') {
    await interaction.reply({ embeds: [buildFormulaEmbed()], ephemeral: true });
    return;
  }

  await interaction.deferReply();
  if (subcommand === 'hoso') {
    await showProfile(interaction);
    return;
  }

  await showLeaderboard(interaction);
}
