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
              { name: '🐣 TÂN THỦ & CƠ BẢN', value: '`> /pet start:` Ấp trứng sinh vật từ AI.\n`> /pet list:` Xem cấp độ, EXP, lực chiến và chỉ số sinh vật.\n`> /daily:` Nhận quà, xu và EXP mỗi ngày.\n`> /inventory:` Xem kho đồ và số dư xu.\n`> /pet release:` Phóng sinh thú cưng hiện tại.', inline: false },
              { name: '⚔️ CHIẾN ĐẤU & PHIÊU LƯU', value: '`> /journey:` Gửi thú cưng đi du ngoạn tìm vàng, EXP và săn trứng hiếm (Hồi chiêu 4h).\n`> /tower:` Tham gia leo tháp vô tận để thử thách lực chiến.\n`> /pk <@user>:` Chiến đấu lật bài theo lượt với người chơi khác.', inline: false },
              { name: '🛒 CỬA HÀNG & NÂNG CẤP', value: '`> /shop:` Cửa hàng vật phẩm, mua bình máu, mana, đá thuộc tính và các loại trứng.\n`> /buy <id_item> [sl]:` Mua vật phẩm từ cửa hàng.\n`> /use <id_item> [sl]:` Dùng vật phẩm (VD: cắn EXP, đá thuộc tính tĩnh, ấp trứng).\n`> /pet evolve:` Đột phá tiến hóa sinh vật (Cần đá tiến hóa và đạt cấp yêu cầu).', inline: false },
              { name: '🏆 VINH DANH & XẾP HẠNG', value: '`> /rank [type]:` Xem bảng xếp hạng toàn server (Power, Level, Tower, Coin).\n`> /claim_rank:` Nhận thưởng dựa trên vị trí top server cuối tuần.', inline: false }
          )
          .setFooter({ text: 'Dự án Gene-Sys: Mở khóa sức mạnh AI' });

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
