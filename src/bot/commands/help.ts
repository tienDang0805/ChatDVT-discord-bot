import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Mở sổ tay hướng dẫn')
  .addStringOption(option => 
      option.setName('category')
          .setDescription('Chuyên mục cấu hình sách hướng dẫn (vd: pet)')
          .addChoices({ name: 'Hệ thống Sinh Vật (Pet RPG)', value: 'pet' })
          .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const category = interaction.options.getString('category');

  if (category === 'pet') {
      const embed = new EmbedBuilder()
          .setTitle('📖 Sổ Tay Hướng Dẫn: Sinh Vật Huyền Bí')
          .setDescription('Chào mừng bạn đến với hệ thống Pet RPG (Gene-Sys). Dưới đây là các lệnh bạn có thể sử dụng được chia theo danh mục:')
          .setColor(0x00A0FF)
          .addFields(
              { name: '🐣 TÂN THỦ & CƠ BẢN', value: '`> /pet start:` Ấp trứng sinh vật từ AI (1 lần/ngày).\n`> /pet list:` Xem cấp độ, EXP, lực chiến và chỉ số sinh vật.\n`> /pet daily_free:` 🎁 Rút thẻ Gacha sinh vật ngẫu nhiên miễn phí (1 lần/ngày).\n`> /pet release:` Phóng sinh thú cưng hiện tại.\n`> /daily:` Nhận quà, xu và EXP mỗi ngày.\n`> /inventory:` Xem kho đồ và số dư xu.\n`> /status:` Xem tổng quan tài khoản và sinh vật.', inline: false },
              { name: '⚔️ CHIẾN ĐẤU & PHIÊU LƯU', value: '`> /journey:` Du ngoạn tìm vàng, EXP và săn trứng hiếm (Hồi chiêu 4h).\n`> /farm:` Cày cuốc quái vật tĩnh nhận EXP và tiền xu.\n`> /grind:` 🔄 Tự động du ngoạn liên tục + dùng Bình Thể Lực đến khi hết.\n`> /expedition status:` Xem tiến độ Viễn Chinh 50 ải.\n`> /expedition fight:` Chiến đấu ải hiện tại trong Viễn Chinh.\n`> /tower:` Leo tháp vô tận thử thách lực chiến.\n`> /pk <@user>:` PvP lật bài theo lượt với người chơi khác.', inline: false },
              { name: '🛒 CỬA HÀNG & NÂNG CẤP', value: '`> /shop:` Cửa hàng vật phẩm (Đá EXP, Đá thuộc tính, Bình chiến đấu, Đá tiến hóa).\n`> /buy <id_item> [sl]:` Mua vật phẩm từ cửa hàng.\n`> /sell <id_item> [sl]:` Bán vật phẩm lấy lại xu.\n`> /use <id_item> [sl]:` Dùng vật phẩm (Đá EXP, đá thuộc tính, ấp trứng...).\n`> /train <coin>:` Tự động dùng xu mua & nạp EXP cho sinh vật.\n`> /pet evolve:` Đột phá tiến hóa sinh vật (Cần Đá Tiến Hóa + đạt cấp yêu cầu).', inline: false },
              { name: '🎰 HỆ THỐNG NHÂN PHẨM', value: 'Trứng sinh vật **KHÔNG bán trong shop**. Mọi trứng đều đến từ:\n• `/pet start` — Ấp trứng hàng ngày (tỉ lệ ngẫu nhiên).\n• `/pet daily_free` — Gacha miễn phí 1 lần/ngày.\n• `/journey` — Phiêu lưu có tỉ lệ rớt trứng xịn.\n• `/farm` — Cày cuốc có cơ hội nhận trứng.\n• Sự kiện đặc biệt từ Admin.', inline: false },
              { name: '🏆 VINH DANH & XẾP HẠNG', value: '`> /rank [type]:` Xem bảng xếp hạng toàn server (Power, Level, Tower, Coin).\n`> /claim_rank:` Nhận thưởng dựa trên vị trí top server cuối tuần.', inline: false }
          )
          .setFooter({ text: 'Dự án Gene-Sys: Mở khóa sức mạnh AI — Tất cả là nhân phẩm 🍀' });

      await interaction.reply({ embeds: [embed] });
      return;
  }

  const embed = new EmbedBuilder()
      .setTitle('📖 Sổ Tay Hệ Thống Chung')
      .setDescription('Dưới đây là một số hướng dẫn chung. Dùng lệnh `/help category:pet` để xem chi tiết mảng RPG.')
      .setColor(0xFFFFFF)
      .addFields(
          { name: '💡 Hỏi/Đáp qua Chat', value: 'Chỉ cần **Ping / Reply** tới Bot hoặc chat có chứa tên Bot (nếu được hỗ trợ), AI sẽ tự động trả lời.' },
          { name: '📊 Control Dashboard', value: 'Website cung cấp bảng hệ thống theo dõi và cấu hình toàn hệ thống dành riêng cho Admin.' },
          { name: '🔮 /identity', value: 'Đăng ký Nickname và Chữ Ký ảo cho tài khoản.' },
      );

  await interaction.reply({ embeds: [embed] });
}
