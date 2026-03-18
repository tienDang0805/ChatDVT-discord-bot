import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { NasaService } from '../services/nasa';

export const data = new SlashCommandBuilder()
  .setName('nasa')
  .setDescription('Khám phá tri thức vũ trụ từ cơ quan hàng không vũ trụ NASA')
  .addSubcommand(subcmd => 
    subcmd
      .setName('apod')
      .setDescription('Bức ảnh thiên văn học của ngày (APOD)')
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcmd = interaction.options.getSubcommand();

  try {
    if (subcmd === 'apod') {
      await interaction.deferReply();
      const apodData = await NasaService.getDailyPicture();

      if (!apodData) {
        return interaction.editReply('Không thể lấy dữ liệu từ NASA lúc này. Hãy thử lại sau nha!');
      }

      const embed = new EmbedBuilder()
        .setColor('#0b3d91') // Màu xanh biển sâu NASA
        .setTitle(`🌌 Bức ảnh vũ trụ của ngày: ${apodData.title}`)
        .setDescription(apodData.explanation + `\n\n*📅 Ngày: ${apodData.date}*`)
        .setFooter({ text: 'Nguồn: NASA APOD API & Dịch thuật: Gemini AI' });

      if (apodData.media_type === 'image') {
          embed.setImage(apodData.hdurl || apodData.url);
          await interaction.editReply({ embeds: [embed] });
      } else if (apodData.media_type === 'video') {
          // Discord embeds don't support iframe videos well, so just provide a link
          await interaction.editReply({ 
              content: `🎬 Video thiên văn của ngày:\n${apodData.url}`,
              embeds: [embed] 
          });
      }
    }
  } catch (error: any) {
    console.error('NASA Command Error:', error);
    await interaction.editReply('Trạm vũ trụ đang mất kết nối tạm thời. Vui lòng thử lại sau.');
  }
}
