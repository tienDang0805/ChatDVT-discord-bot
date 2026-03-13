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
          .setDescription('Chào mừng bạn đến với hệ thống Pet RPG (Gene-Sys). Dưới đây là các lệnh bạn có thể sử dụng:')
          .setColor(0x00A0FF)
          .addFields(
              { name: '🥚 `/pet start`', value: 'Ấp trứng sinh vật mới (tối đa 1 lần/ngày, và chỉ 1 thú cưng/người).', inline: false },
              { name: '🐾 `/pet list`', value: 'Xem sinh vật: Cấp độ, EXP hiện tại / EXP cần để lên cấp tiếp.', inline: false },
              { name: '🌱 `/pet evolve`', value: 'Dùng `evo_stone` để tiến hóa. Yêu cầu đủ cấp & Đá Tiến Hóa.', inline: false },
              { name: '🔓 `/pet release`', value: 'Phóng sinh thú cưng hiện tại để có thể ấp trứng mới.', inline: false },
              { name: '⚔️ `/farm`', value: 'Cày cuốc nhận EXP + Coin, 10% cơ hội rơi item. Cooldown 1 phút.', inline: false },
              { name: '🏰 `/tower`', value: '**[MỚI]** Leo Tháp 10 tầng — chọn lên tiếp hoặc rút lui sau mỗi tầng. Cooldown 12 giờ.', inline: false },
              { name: '🥊 `/pk <@user>`', value: '**[MỚI]** Chiến đấu Turn-Based — bấm nút chọn kỹ năng từng lượt như Pokémon!', inline: false },
              { name: '🏆 `/rank [type]`', value: '**[MỚI]** BXH: `level` (Pet mạnh nhất), `coin` (giàu nhất), `tower` (leo cao nhất).', inline: false },
              { name: '🛒 `/shop`', value: '8 vật phẩm: Đá EXP Nhỏ/Vừa/Lớn, Bình HP/MP, Đá Tiến Hóa, Rương Hiếm.', inline: false },
              { name: '💳 `/buy <item_id> [qty]`', value: 'Mua vật phẩm từ shop bằng Coin.', inline: false },
              { name: '🎒 `/inventory`', value: 'Xem túi đồ và số dư Coin.', inline: false },
              { name: '🪄 `/use <item_id> [qty]`', value: '**[MỚI]** Đá EXP tự tính và lên NHIỀU cấp liên tiếp nếu đủ EXP!', inline: false }
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
