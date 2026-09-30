import {
  APIEmbedField,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ADMIN_ID } from '../../config/constants';
import { isCommandDisabled } from '../../config/command-flags';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Xem hướng dẫn sử dụng ChatDVT');

export async function execute(interaction: ChatInputCommandInteraction) {
  const fields: APIEmbedField[] = [
    {
      name: '💬 Trò chuyện với AI',
      value: [
        '• Mention `@ChatDVT` kèm câu hỏi để bắt đầu trò chuyện.',
        '• Có thể gửi kèm **một ảnh hoặc video** để bot phân tích.',
        '• Khi reply tin nhắn của bot, hãy giữ bật mention để bot nhận được yêu cầu.',
      ].join('\n'),
      inline: false,
    },
    {
      name: '🧰 Tiện ích',
      value: [
        '`/help` — mở hướng dẫn này.',
        '`/identity menu` — mở menu chỉnh nickname và chữ ký dùng với AI.',
        '`/identity view user:@người_dùng` — xem danh tính của một thành viên.',
        '`/sum [limit]` — tóm tắt 5–100 tin nhắn gần đây; mặc định 50.',
      ].join('\n'),
      inline: false,
    },
  ];

  if (!isCommandDisabled('cuonggia')) {
    fields.push({
      name: '⚔️ Bảng xếp hạng Cường Giả',
      value: [
        '`/cuonggia bang` — xem top 10 toàn server.',
        '`/cuonggia hoso [thanhvien]` — xem thâm niên, hoạt động, role, điểm và cảnh giới.',
        '`/cuonggia cach-tinh` — xem công thức tính điểm minh bạch.',
      ].join('\n'),
      inline: false,
    });
  }

  const gameSections: string[] = [];

  if (!isCommandDisabled('quiz')) {
    gameSections.push(
      '**Quiz AI**',
      '`/quiz setup` — mở form tạo quiz: 3–10 câu, chủ đề, độ khó, giọng văn và thời gian mỗi câu.',
      '`/quiz cancel` — người tạo hủy quiz đang chạy.'
    );
  }

  if (!isCommandDisabled('wordle')) {
    gameSections.push(
      '**Wordle**',
      '`/wordle setup` — mở form tạo Wordle: 3–10 từ, chủ đề, độ khó và số lượt đoán.',
      '`/wordle cancel` — người tạo hủy Wordle đang chạy.'
    );
  }

  if (!isCommandDisabled('code')) {
    gameSections.push(
      '**Code Challenge**',
      '`/code start [questions] [topic] [difficulty] [time]` — bắt đầu 3–10 câu; 10–60 giây mỗi câu.',
      '`/code cancel` — người tạo hủy game đang chạy.',
      '`/code leaderboard` — xem top 10 của server.',
      '`/code stats` — xem thống kê cá nhân.'
    );
  }

  if (gameSections.length > 0) {
    fields.push({
      name: '🎮 Game đang mở',
      value: gameSections.join('\n'),
      inline: false,
    });
  }

  const isServerAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;
  if (isServerAdmin && !isCommandDisabled('setting')) {
    const adminLines = [
      '`/setting view` — xem persona hiện tại của bot trong server.',
      '`/setting edit` — chỉnh persona của bot.',
      '`/setting reset` — đưa persona về cấu hình mặc định.',
    ];

    if (interaction.user.id === ADMIN_ID && !isCommandDisabled('setapikey')) {
      adminLines.push(
        '`/setapikey set` — lưu Gemini API key cho server.',
        '`/setapikey view` — xem key đang lưu ở dạng che bớt.',
        '`/setapikey remove` — xóa key riêng và quay về key mặc định.'
      );
    }

    if (!isCommandDisabled('cuonggia')) {
      adminLines.push('`/cuonggia dongbo` — lấy thống kê tin/link/media lịch sử từ Discord Search API.');
    }

    fields.push({
      name: '🛡️ Quản trị',
      value: adminLines.join('\n'),
      inline: false,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('🤖 ChatDVT — AI Chat Bot')
    .setColor(0x5865F2)
    .setDescription('Hỏi AI bằng mention, dùng tiện ích theo ngữ cảnh và chơi các game ngắn ngay trong Discord.')
    .addFields(fields)
    .setFooter({ text: 'Help chỉ hiển thị những tính năng đang được mở cho bạn.' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
