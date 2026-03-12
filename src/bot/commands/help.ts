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
              { name: '🥚 `/pet start`', value: 'Gọi Gene-Sys để tìm kiếm và ấp một quả trứng sinh vật mới.', inline: false },
              { name: '🐾 `/pet list`', value: 'Xem danh sách toàn bộ sinh vật bạn đang sở hữu và chỉ số của chúng.', inline: false },
              { name: '🛒 `/shop`', value: 'Xem cửa hàng hệ thống hiện đang bán các vật phẩm gì.', inline: false },
              { name: '💳 `/buy <item_id> [quantity]`', value: 'Mua vật phẩm từ thẻ mua hàng trong `/shop` bằng số xu (Coin) của bạn.', inline: false },
              { name: '🎒 `/inventory`', value: 'Kiểm tra tài sản: Balo đồ vật đang có và số dư Coin.', inline: false },
              { name: '🪄 `/use <item_id> [quantity]`', value: 'Sử dụng một vật phẩm cụ thể từ trong `/inventory` (Ví dụ: Dùng `exp_potion` để tăng kinh nghiệm cho thú cưng).', inline: false },
              { name: '⚔️ `/farm`', value: 'Đưa sinh vật đi thảo phạt quái vật để nhận EXP và Farm tiền/vật phẩm.', inline: false },
              { name: '🎆 `/pet evolve`', value: 'Sử dụng `evo_stone` (Đá Tiến Hóa) để thăng bậc cho sinh vật khi đạt đủ level.', inline: false },
              { name: '🥊 `/pk <@user>`', value: 'Khởi động chế độ chiến đấu Auto-Turn-Based với một sinh vật của người chơi khác.', inline: false }
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
