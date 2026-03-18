import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CoupleService } from '../services/couple';

export const data = new SlashCommandBuilder()
    .setName('couple')
    .setDescription('Hệ thống tình yêu đỉnh cao')
    .addSubcommand(subcmd => 
      subcmd
        .setName('propose')
        .setDescription('Tỏ tình với người ấy')
        .addUserOption(opt => opt.setName('target').setDescription('Người bạn muốn cầu hôn').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('accept')
        .setDescription('Đồng ý lời tỏ tình')
        .addUserOption(opt => opt.setName('target').setDescription('Người đã ngỏ lời với bạn').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('decline')
        .setDescription('Từ chối lời tỏ tình')
        .addUserOption(opt => opt.setName('target').setDescription('Người bạn muốn phũ').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('interact')
        .setDescription('Tương tác với người yêu để tăng điểm tình cảm')
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('status')
        .setDescription('Xem tình trạng mối quan hệ của bạn')
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('breakup')
        .setDescription('Chia tay / Ly hôn')
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('marry')
        .setDescription('Tổ chức đám cưới rình rang')
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('make_poop')
        .setDescription('2 vợ chồng cùng nhau rặn 💩')
    )
    .addSubcommand(subcmd => 
      subcmd
        .setName('gift')
        .setDescription('Tặng vật phẩm trong túi đồ cho người ấy')
        .addStringOption(opt => opt.setName('item_id').setDescription('ID vật phẩm (ví dụ: gacha1, ring...)').setRequired(true))
        .addIntegerOption(opt => opt.setName('quantity').setDescription('Số lượng').setRequired(true))
    );

export async function execute(interaction: any) {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply();
    const subcmd = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('target');
    const userId = interaction.user.id;

    try {
      if (subcmd === 'propose') {
        const res = await CoupleService.propose(userId, targetUser.id);
        await interaction.editReply(res.message);
      } 
      else if (subcmd === 'accept') {
        const res = await CoupleService.acceptProposal(userId, targetUser.id);
        await interaction.editReply(res.message);
      }
      else if (subcmd === 'decline') {
        const res = await CoupleService.declineProposal(userId, targetUser.id);
        await interaction.editReply(res.message);
      }
      else if (subcmd === 'interact') {
        const res = await CoupleService.interact(userId);
        
        const embed = new EmbedBuilder()
          .setColor(res.success ? '#ff4d6d' : '#4a4e69')
          .setTitle('💕 Hệ thống Tình Yêu 💕')
          .setDescription(res.message);
        
        await interaction.editReply({ embeds: [embed] });
      }
      else if (subcmd === 'status') {
        const res = await CoupleService.getStatus(userId);
        
        const embed = new EmbedBuilder()
          .setColor(res.success ? '#ff4e8c' : '#8d99ae')
          .setTitle('Thông tin Cặp Đôi')
          .setDescription(res.message);
        
        if (res.success && res.data) {
          const partnerId = res.data.user1Id === userId ? res.data.user2Id : res.data.user1Id;
          const statusText = res.data.status === 'married' ? 'Đã kết hôn 💍' : 'Đang hẹn hò 💑';
          embed.addFields([
            { name: 'Tình trạng', value: statusText, inline: true },
            { name: 'Nửa kia', value: `<@${partnerId}>`, inline: true },
            { name: 'Điểm tình cảm', value: `❤️ ${res.data.affection}`, inline: true },
          ]);
          embed.setImage('https://media1.tenor.com/m/aKFaZBrZHYcAAAAd/peach-and-goma-peach-goma.gif');
        }

        await interaction.editReply({ embeds: [embed] });
      }
      else if (subcmd === 'breakup') {
        const res = await CoupleService.breakup(userId);
        await interaction.editReply(res.message);
      }
      else if (subcmd === 'marry') {
        const res = await CoupleService.marry(userId);
        
        const embed = new EmbedBuilder()
          .setColor(res.success ? '#ff0055' : '#4a4e69')
          .setTitle('💒 Tổ Chức Lễ Cưới 💒')
          .setDescription(res.message);
          
        await interaction.editReply({ embeds: [embed] });
      }
      else if (subcmd === 'make_poop') {
        const res = await CoupleService.makePoop(userId);
        await interaction.editReply(res.message);
      }
      else if (subcmd === 'gift') {
        const itemId = interaction.options.getString('item_id', true);
        const qty = interaction.options.getInteger('quantity', true);
        
        const res = await CoupleService.gift(userId, itemId, qty);
        await interaction.editReply(res.message);
      }
    } catch (error: any) {
      console.error('Couple Command Error:', error);
      await interaction.editReply('Có lỗi xảy ra, thử lại sau nhé.');
    }
}
