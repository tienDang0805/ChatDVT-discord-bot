import { prisma } from '../../database/prisma';
import { geminiService } from './gemini';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class PetService {
  
  // Temporary memory store for 3-egg selections
  private eggChoicesCache: Map<string, string[]> = new Map();

  // --- Egg Hatching (Step 1: Start) ---
  public async beginHatchingProcess(interaction: any) {
     const userId = interaction.user.id;
     
     // 1. Enforce 1-Pet Limit
     const existingPet = await prisma.pet.findFirst({ where: { ownerId: userId } });
     if (existingPet) {
         return interaction.editReply("❌ Bạn đã sở hữu một sinh vật rồi! Vui lòng dùng `/pet list` để xem hoặc `/pet release` để phóng sinh trước khi ấp trứng mới.");
     }

     // 2. Generate 3 Random Eggs
     await interaction.editReply("🌟 Đang liên kết với Gene-Sys... Đang tìm kiếm 3 quả trứng tiềm năng...");
     
     const prompt = `Bạn là Gene-Sys. Hãy tạo ra 3 cái tên Cực Kì Sáng Tạo và Ngầu cho 3 Quả Trứng Sinh Vật Huyền Bí. 
Vui lòng CHỈ trả về mảng chuỗi JSON hợp lệ (không kèm text khác):
["Trứng X", "Trứng Y", "Trứng Z"]`;

     let eggNames = [];
     try {
         const jsonRes = await geminiService.generateJSON(prompt);
         if (Array.isArray(jsonRes) && jsonRes.length >= 3) {
             eggNames = [jsonRes[0], jsonRes[1], jsonRes[2]];
         } else {
             throw new Error("Invalid output");
         }
     } catch(e) {
         eggNames = ["Trứng Rồng Lửa", "Trứng Thủy Quái", "Trứng Tinh Võng"];
     }

     this.eggChoicesCache.set(userId, eggNames);

     // 3. UI Buttons
     const row = new ActionRowBuilder().addComponents(
         new ButtonBuilder().setCustomId(`egg_pick_0_${userId}`).setLabel(`1. ${eggNames[0]}`).setStyle(ButtonStyle.Primary),
         new ButtonBuilder().setCustomId(`egg_pick_1_${userId}`).setLabel(`2. ${eggNames[1]}`).setStyle(ButtonStyle.Success),
         new ButtonBuilder().setCustomId(`egg_pick_2_${userId}`).setLabel(`3. ${eggNames[2]}`).setStyle(ButtonStyle.Danger)
     );

     await interaction.editReply({ 
         content: `🥚 **Gene-Sys đã tìm thấy 3 quả trứng!** Hãy chọn 1 quả trứng bạn muốn ấp:`, 
         components: [row] 
     });
  }

  // --- Egg Hatching (Step 2: Pick) ---
  public async handleEggSelection(interaction: any, choiceIndex: number) {
      await interaction.deferUpdate(); // Acknowledge button
      
      const userId = interaction.user.id;
      const choices = this.eggChoicesCache.get(userId);
      
      if (!choices || !choices[choiceIndex]) {
          return interaction.followUp({ content: "Trứng này đã hỏng hoặc phiên giao dịch hết hạn! Vui lòng gõ lại lệnh `/pet start`.", ephemeral: true });
      }

      const existingPet = await prisma.pet.findFirst({ where: { ownerId: userId } });
      if (existingPet) {
          return interaction.followUp({ content: "❌ Bạn đã sở hữu sinh vật rồi!", ephemeral: true });
      }

      const chosenEgg = choices[choiceIndex];
      this.eggChoicesCache.delete(userId); // Consume choice

      await interaction.editReply({ content: `🧬 Đang ấp **${chosenEgg}**... Vui lòng đợi Gene-Sys phân tích gen...\n*(Lưu ý: Sinh ảnh có thể mất 15-20 giây)*`, components: [] });

      try {
          const petData = await this.generatePetData(chosenEgg);
          
          // STRICT CHIBI IMAGEN PROMPT
          const imagePrompt = `Super cute extreme chibi pet monster, 2d game icon asset, flat background white perfectly centered, isolated graphic, ${petData.imageprompt_pet}`;
          const imageResult = await geminiService.generateImage(imagePrompt);
          
          let imageUrl = "https://via.placeholder.com/256"; // Fallback URL if failed
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
                  imageBasePrompt: imagePrompt,
                  imageData: imageUrl,
                  status: JSON.stringify({ stamina: 100, hunger: 100 }),
                  evolutionStage: 1
              }
          });

          const embed = new EmbedBuilder()
              .setTitle(`🎉 Chúc mừng! **${chosenEgg}** đã nở ra **${newPet.species}**!`)
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

          await interaction.followUp({ embeds: [embed], files });

      } catch (error) {
          console.error("Hatching Error:", error);
          await interaction.followUp({ content: "❌ Có lỗi xảy ra trong quá trình gen. Vui lòng thử lại sau.", ephemeral: true });
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
"imageprompt_pet": "Strictly english visual subject description for a chibi monster, comma separated (e.g., small cute red dragon, chibi, big eyes)",
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

      const files = [];
      const firstPet = pets[0];
      if (firstPet.imageData && firstPet.imageData.startsWith('data:image')) {
          const base64Data = firstPet.imageData.replace(/^data:image\/png;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          files.push({ attachment: buffer, name: 'pet.png' });
          embed.setImage('attachment://pet.png');
      }

      const petListString = pets.map((p: any, i: number) => `**${i+1}. ${p.name}** (${p.rarity}) - Lv.${p.level}`).join('\n');
      embed.setDescription(embed.data.description + "\n\n" + petListString);

      return { embeds: [embed], files };
  }
  
  public async showReleasePetMenu(interaction: any) {
      const userId = interaction.user.id;
      const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
      
      if (!pet) {
          return interaction.editReply("🕸️ Bạn chưa có pet nào để phóng sinh.");
      }

      await prisma.pet.delete({ where: { id: pet.id } });
      return interaction.editReply(`Trái tim bạn đau nhói... Bạn đã phóng sinh **${pet.name}** về với tự nhiên thành công. Bạn dọn dẹp lại chuồng trống để sẵn sàng cho sinh vật mới.`);
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
