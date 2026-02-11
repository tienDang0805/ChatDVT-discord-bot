import { prisma } from '../../database/prisma';
import { geminiService } from './gemini';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class PetService {
  
  // --- Egg Hatching ---
  public async beginHatchingProcess(interaction: any) {
     const userId = interaction.user.id;
     
     // Upsert logic for cooldown using Prisma
     // Check if exists
     let cooldown = await prisma.userEggCooldown.findUnique({ where: { userId } });
     
     if (!cooldown) {
         cooldown = await prisma.userEggCooldown.create({
             data: { userId, dailyCount: 0, lastEggOpenTime: new Date() }
         });
     }

     const now = new Date();
     const lastTime = new Date(cooldown.lastEggOpenTime);
     const isSameDay = now.getDate() === lastTime.getDate() && 
                       now.getMonth() === lastTime.getMonth() && 
                       now.getFullYear() === lastTime.getFullYear();
     
     if (isSameDay && cooldown.dailyCount >= 3) {
         return interaction.editReply("❌ Bạn đã hết lượt ấp trứng hôm nay! (Tối đa 3 lần/ngày)");
     }
     
     let newDailyCount = cooldown.dailyCount;
     if (!isSameDay) {
         newDailyCount = 0; // Reset
     }
     newDailyCount += 1;

     // Update cooldown
     await prisma.userEggCooldown.update({
         where: { userId },
         data: { dailyCount: newDailyCount, lastEggOpenTime: new Date() }
     });

     const eggTypes = ["Trứng Gió Lốc", "Trứng Nham Thạch", "Trứng Ngàn Hoa", "Trứng Bóng Đêm", "Trứng Thủy Tinh", "Trứng Kim Loại"];
     const eggType = eggTypes[Math.floor(Math.random() * eggTypes.length)];
     
     await interaction.editReply(`🥚 Đang ấp **${eggType}**... Vui lòng đợi Gene-Sys phân tích...`);

     try {
         const petData = await this.generatePetData(eggType);
         const imageResult = await geminiService.generateImage(petData.description_en_keywords);
         let imageUrl = "";
         if (imageResult.success && imageResult.imageBuffer) {
             imageUrl = `data:image/png;base64,${imageResult.imageBuffer.toString('base64')}`;
         }

         // Save to DB (Prisma)
         const newPet = await prisma.pet.create({
             data: {
                 ownerId: userId,
                 name: petData.species,
                 species: petData.species,
                 description: petData.description_vi,
                 rarity: petData.rarity,
                 element: petData.element,
                 stats: JSON.stringify(petData.base_stats),
                 skills: JSON.stringify(petData.skills),
                 traits: JSON.stringify(petData.traits),
                 imageBasePrompt: petData.description_en_keywords,
                 imageData: imageUrl,
                 status: JSON.stringify({ stamina: 100, hunger: 100 }),
                 evolutionStage: 1
             }
         });

         const embed = new EmbedBuilder()
             .setTitle(`🎉 Chúc mừng! Trứng đã nở ra **${newPet.species}**!`)
             .setDescription(newPet.description)
             .setColor(this.getRarityColor(newPet.rarity))
             .addFields(
                 { name: "Độ hiếm", value: newPet.rarity, inline: true },
                 { name: "Hệ", value: newPet.element, inline: true },
                 { name: "Stats", value: `HP: ${petData.base_stats.hp} | ATK: ${petData.base_stats.atk} | DEF: ${petData.base_stats.def}`, inline: false }
             );

        const files = [];
        if (imageResult.imageBuffer) {
             files.push({ attachment: imageResult.imageBuffer, name: 'pet.png' });
             embed.setImage('attachment://pet.png');
        }

         await interaction.editReply({ content: ' ', embeds: [embed], files });

     } catch (error) {
         console.error("Hatching Error:", error);
         await interaction.editReply("❌ Có lỗi xảy ra trong quá trình ấp trứng. Vui lòng thử lại sau.");
     }
  }

  // --- Generate Pet Logic ---
  private async generatePetData(eggType: string): Promise<any> {
    const prompt = `[Bối Cảnh & Vai Trò]
Bạn là **"Gene-Sys"**, chuyên gia sinh học giả tưởng.
Nhiệm vụ: Ấp trứng "${eggType}" thành sinh vật.

[Quy Trình Sáng Tạo]
1. Phân tích trứng để chọn chủng tộc, nguyên tố.
2. Chọn độ hiếm (Normal 50%, Magic 30%, Rare 15%, Unique 4%, Legend 1%).
3. Phân bổ chỉ số hợp lý.
4. Tạo skill (2-4 kỹ năng) và trait (1-4 nội tại).

[ĐỊNH DẠNG JSON - CHỈ TRẢ VỀ JSON]
{
"rarity": "Normal/Magic/Rare/Unique/Legend",
"element": "Fire/Water/...",
"species": "Tên loài",
"description_vi": "Mô tả tiếng Việt (2-3 câu)",
"description_en_keywords": "Từ khóa tiếng Anh để vẽ ảnh (chibi, cute, ...)",
"base_stats": { "hp": 100, "mp": 50, "atk": 10, "def": 10, "int": 10, "spd": 10 },
"skills": [ { "name": "", "description": "", "cost": 0, "type": "Physical", "power": 0 } ],
"traits": [ { "name": "", "description": "" } ]
}`;

    return await geminiService.generateJSON(prompt);
  }

  // --- List Pets ---
  public async showPetList(interaction: any) {
      const userId = interaction.user.id;
      const pets = await prisma.pet.findMany({
          where: { ownerId: userId },
          orderBy: { createdAt: 'desc' }
      });

      if (pets.length === 0) {
          return { content: "🕸️ Bạn chưa có pet nào. Hãy dùng `/pet start` để ấp trứng!" };
      }

      const embed = new EmbedBuilder()
          .setTitle(`🐾 Chuồng thú của ${interaction.user.username}`)
          .setDescription(`Bạn đang sở hữu ${pets.length} sinh vật.`)
          .setColor(0x00AE86);

      const petListString = pets.map((p: any, i: number) => `**${i+1}. ${p.name}** (${p.rarity}) - Lv.${p.level}`).join('\n');
      embed.setDescription(embed.data.description + "\n\n" + petListString);

      return { embeds: [embed] };
  }
  
  public async showReleasePetMenu(interaction: any) {
      return { content: "Chức năng thả pet đang bảo trì." };
  }

  private getRarityColor(rarity: string): any {
      switch (rarity) {
          case 'Normal': return 0x808080;
          case 'Magic': return 0x0000FF;
          case 'Rare': return 0xFFFF00;
          case 'Unique': return 0xFF00FF;
          case 'Legend': return 0xFFA500;
          default: return 0xFFFFFF;
      }
  }
}

export const petService = new PetService();
