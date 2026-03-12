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

     // 2. Enforce 1-Egg-Per-Day Limit
     const today = new Date();
     today.setHours(0, 0, 0, 0);

     const cooldown = await prisma.userEggCooldown.findUnique({ where: { userId } });
     
     if (cooldown) {
         if (cooldown.lastEggOpenTime >= today) {
             if (cooldown.dailyCount >= 1) { // 1 egg per day
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const timeUntilReset = Math.floor((tomorrow.getTime() - new Date().getTime()) / 1000 / 60 / 60);
                  
                  return interaction.editReply(`❌ Sức mạnh của Gene-Sys cần thời gian phục hồi! Bạn đã ấp trứng hôm nay rồi. Hãy quay lại sau khoảng **${timeUntilReset} giờ** nữa.`);
             }
         } else {
             // Reset count for new day (We will increment it when they actually pick an egg)
             await prisma.userEggCooldown.update({
                 where: { userId },
                 data: { dailyCount: 0 }
             });
         }
     } else {
         // Create initial record
         await prisma.userEggCooldown.create({
             data: { userId, dailyCount: 0, lastEggOpenTime: new Date(0) } // Set to old date initially
         });
     }

     // 3. Generate 3 Random Eggs
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
          
          // Check Global Feature Toggles
          const botConfig = await prisma.botConfig.findUnique({ where: { key: 'global' } });
          let disablePetImage = false;
          if (botConfig && botConfig.features) {
               try {
                   const features = JSON.parse(botConfig.features);
                   disablePetImage = !!features.disablePetImage;
               } catch (e) {}
          }

          let imageUrl = "https://via.placeholder.com/256"; // Fallback URL if disabled/failed
          const imagePrompt = `Super cute extreme chibi pet monster, 2d game icon asset, flat background white perfectly centered, isolated graphic, ${petData.imageprompt_pet}`;
          let imageResult: { success: boolean; imageBuffer?: Buffer | undefined; textResponse?: string; error?: string } = { success: false, imageBuffer: undefined };

          if (!disablePetImage) {
              // STRICT CHIBI IMAGEN PROMPT
              imageResult = await geminiService.generateImage(imagePrompt);
              if (imageResult.success && imageResult.imageBuffer) {
                  imageUrl = `data:image/png;base64,${imageResult.imageBuffer.toString('base64')}`;
              }
          } else {
              imageUrl = "https://i.imgur.com/3q123b3.png"; // Placeholder for Disabled Image
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

          // Mark Daily Cooldown
          await prisma.userEggCooldown.update({
              where: { userId },
              data: { dailyCount: 1, lastEggOpenTime: new Date() }
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
          } else if (imageUrl.startsWith('data:image')) {
               const base64Data = imageUrl.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
               const buffer = Buffer.from(base64Data, 'base64');
               files.push({ attachment: buffer, name: 'pet.png' });
               embed.setImage('attachment://pet.png');
          } else if (imageUrl.startsWith('http')) {
               embed.setImage(imageUrl);
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
          const base64Data = firstPet.imageData.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          files.push({ attachment: buffer, name: 'pet.png' });
          embed.setImage('attachment://pet.png');
      } else if (firstPet.imageData.startsWith('http')) {
          embed.setImage(firstPet.imageData);
      }

      const petListString = pets.map((p: any, i: number) => {
          const maxExp = p.level * 100;
          return `**${i+1}. ${p.name}** (${p.rarity}) - Lv.${p.level} | EXP: ${p.exp}/${maxExp}`;
      }).join('\n');
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

  public async evolvePet(interaction: any) {
      const userId = interaction.user.id;
      const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });

      if (!pet) {
          return { content: "🕸️ Bạn chưa có pet nào! Dùng `/pet start` để ấp trứng." };
      }

      // Check level requirement
      const reqLevel = pet.evolutionStage * 10;
      if (pet.level < reqLevel) {
          return { content: `❌ **${pet.name}** cần đạt cấp **${reqLevel}** để tiến hóa lên bậc ${pet.evolutionStage + 1}. (Hiện tại: Lv.${pet.level})` };
      }

      // Check item
      const evoStone = await prisma.inventoryItem.findFirst({
          where: { userId, itemId: 'evo_stone' }
      });

      if (!evoStone || evoStone.quantity < 1) {
          return { content: `❌ Bạn không có **Đá Tiến Hóa**! Hãy mua từ \`/shop\`.` };
      }

      await interaction.editReply(`✨ Đang tổng hợp dữ liệu gen của **${pet.name}**... Gene-Sys đang tiến hành đột biến AI! Vui lòng chờ...`);

      try {
          // Prepare data for AI
           const aiInput = {
               name: pet.name,
               species: pet.species,
               description: pet.description,
               lore: pet.lore || '',
               rarity: pet.rarity,
               element: pet.element,
               stats: JSON.parse(pet.stats as string),
               skills: JSON.parse(pet.skills as string),
               traits: JSON.parse(pet.traits as string),
               evolutionStage: pet.evolutionStage
           };

          const prompt = `[Bối Cảnh & Vai Trò]
Bạn là **"Gene-Sys"**. Nhiệm vụ của bạn là TIẾN HÓA sinh vật sau lên một bậc ngầu hơn.
Sinh vật hiện tại:
${JSON.stringify(aiInput, null, 2)}

[Yêu Cầu Thay Đổi]
1. Nâng cấp "species" thành hình dạng trưởng thành/ngầu hơn (ví dụ: Rồng Con -> Rồng Lửa Khổng Lồ).
2. Viết lại "description_vi" và "lore" để mô tả sự tiến hóa này mạnh mẽ ra sao.
3. imageprompt_pet: Tạo prompt tiếng Anh dạng "Super cute extreme chibi monster..." nhưng thêm các đặc điểm trưởng thành, ngầu hơn.
4. "skills": Giữ nguyên mảng skills cũ và TẠO THÊM 1 kỹ năng tấn công mới mạnh hơn.
5. "traits": Nâng cấp mô tả của trait cũ cho ngầu hơn (nếu đổi tên thì phải giữ ý nghĩa).
6. "stats": Tăng tất cả chỉ số (hp, atk, def, spd) lên khoảng 1.5 - 2 lần. Phải chắc chắn trả về là số Number, không phải String.

[ĐỊNH DẠNG JSON - CHỈ TRẢ VỀ JSON HỢP LỆ]
{
"species": "Tên loài mới",
"description_vi": "Mô tả ngắn tiếng Việt (2-3 câu)",
"lore": "Cốt truyện/Truyền thuyết mới",
"imageprompt_pet": "English visual description for a chibi monster...",
"stats": { "hp": 200, "atk": 20, "def": 20, "spd": 20 },
"skills": [ { "name": "Skill cũ", "description": "...", "type": "...", "power": 10 }, { "name": "Skill MỚI", "description": "Mô tả", "type": ".../Phép", "power": 50 } ],
"traits": [ { "name": "Trait cũ/nâng cấp", "description": "Mô tả" } ]
}`;

          const evolvedData: any = await geminiService.generateJSON(prompt);
          
          let imageUrl = pet.imageData; // fallback
          // Check Global Feature Toggles
          const botConfig = await prisma.botConfig.findUnique({ where: { key: 'global' } });
          let disablePetImage = false;
          if (botConfig && botConfig.features) {
               try {
                   const features = JSON.parse(botConfig.features);
                   disablePetImage = !!features.disablePetImage;
               } catch (e) {}
          }

          let imageBuffer = null;
          if (!disablePetImage) {
              const imageResult = await geminiService.generateImage(`Super cute extreme chibi pet monster, 2d game icon asset, flat background white perfectly centered, isolated graphic, ${evolvedData.imageprompt_pet}`);
              if (imageResult.success && imageResult.imageBuffer) {
                  imageUrl = `data:image/png;base64,${imageResult.imageBuffer.toString('base64')}`;
                  imageBuffer = imageResult.imageBuffer;
              }
          }

          // Consume Stone & Update Pet
          await prisma.$transaction(async (tx) => {
              // Deduct item
              if (evoStone.quantity === 1) {
                  await tx.inventoryItem.delete({ where: { id: evoStone.id } });
              } else {
                  await tx.inventoryItem.update({ where: { id: evoStone.id }, data: { quantity: { decrement: 1 } } });
              }

              // Update Pet
              await (tx as any).pet.update({
                  where: { id: pet.id },
                  data: {
                      species: evolvedData.species,
                      name: evolvedData.species, // Rename fully
                      description: evolvedData.description_vi,
                      lore: evolvedData.lore,
                      stats: JSON.stringify(evolvedData.stats),
                      skills: JSON.stringify(evolvedData.skills),
                      traits: JSON.stringify(evolvedData.traits),
                      imageBasePrompt: evolvedData.imageprompt_pet,
                      imageData: imageUrl,
                      evolutionStage: pet.evolutionStage + 1
                  }
              });
          });

          const embed = new EmbedBuilder()
              .setTitle(`🎆 TIẾN HÓA THÀNH CÔNG!`)
              .setDescription(`**${aiInput.species}** đã tiến hóa thành **${evolvedData.species}**!\n\n${evolvedData.description_vi}`)
              .setColor(0xFFD700)
              .addFields(
                  { name: "Cấp độ tiến hóa", value: `Bậc ${pet.evolutionStage + 1}`, inline: true },
                  { name: "Truyền thuyết mới", value: evolvedData.lore || 'Không rõ', inline: false }
              );

          // We check the new skill
          const newSkill = evolvedData.skills[evolvedData.skills.length - 1];
          if (newSkill) {
              embed.addFields({ name: "🎉 Kỹ năng mới", value: `**${newSkill.name}**: ${newSkill.description} (Power: ${newSkill.power})`, inline: false });
          }

          const files = [];
          if (imageBuffer) {
               files.push({ attachment: imageBuffer, name: 'evolved.png' });
               embed.setImage('attachment://evolved.png');
          } else if (imageUrl.startsWith('data:image')) {
               const base64Data = imageUrl.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
               const buffer = Buffer.from(base64Data, 'base64');
               files.push({ attachment: buffer, name: 'evolved.png' });
               embed.setImage('attachment://evolved.png');
          } else if (imageUrl.startsWith('http')) {
               embed.setImage(imageUrl);
          }

          return { content: `<@${userId}> Sinh vật của bạn đã tiến hóa!`, embeds: [embed], files };

      } catch (error) {
          console.error("Evolution Error:", error);
          return { content: `❌ Có lỗi xảy ra trong quá trình tiến hóa: ${(error as Error).message}` };
      }
  }
}

export const petService = new PetService();
