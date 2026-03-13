import { prisma } from '../../database/prisma';
import { geminiService } from './gemini';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class PetService {
  
  // Temporary memory store for 3-egg selections
  private eggChoicesCache: Map<string, string[]> = new Map();

  // --- Core Game Logic ---
  public getRequiredExp(level: number, rarity: string): number {
      // Exponential base scale: Level ^ 1.5 * 50
      const baseExp = Math.floor(Math.pow(level, 1.5) * 50);
      
      // Rarity multiplier adds difficulty
      let multiplier = 1.0;
      switch (rarity) {
          case 'Legend': multiplier = 1.5; break;
          case 'Unique': multiplier = 1.3; break;
          case 'Rare': multiplier = 1.1; break;
          case 'Normal': multiplier = 0.9; break; // Slightly easier to level up normal
      }
      return Math.floor(baseExp * multiplier);
  }

  // Base stats per level based on rarity
  private STAT_BONUS_MAP: Record<string, { hp: number, atk: number, def: number, spd: number }> = {
      'Legend': { hp: 10, atk: 4, def: 3, spd: 2 },
      'Unique': { hp: 8, atk: 3, def: 2, spd: 1 },
      'Rare': { hp: 6, atk: 2, def: 2, spd: 1 },
      'Magic': { hp: 5, atk: 2, def: 1, spd: 1 },
      'Normal': { hp: 4, atk: 1, def: 1, spd: 0 },
  };

  private applyStatBonus(stats: any, levelsGained: number, rarity: string) {
      const bonus = this.STAT_BONUS_MAP[rarity] || this.STAT_BONUS_MAP['Normal'];
      stats.hp = (stats.hp || 0) + (bonus.hp * levelsGained);
      stats.atk = (stats.atk || 0) + (bonus.atk * levelsGained);
      stats.def = (stats.def || 0) + (bonus.def * levelsGained);
      stats.spd = (stats.spd || 0) + (bonus.spd * levelsGained);
      return stats;
  }

  public async addExpAndLevelUp(petId: number, expToAdd: number): Promise<{ pet: any, messages: string[], levelsGained: number }> {
      const pet = await prisma.pet.findUnique({ where: { id: petId } });
      if (!pet) throw new Error("Pet not found");

      let currentExp = pet.exp + expToAdd;
      let currentLevel = pet.level;
      let reqExp = this.getRequiredExp(currentLevel, pet.rarity);
      let levelsGained = 0;
      let stats = {};
      try { stats = JSON.parse(pet.stats as string); } catch(e) {}

      while (currentExp >= reqExp) {
          currentExp -= reqExp;
          currentLevel++;
          levelsGained++;
          reqExp = this.getRequiredExp(currentLevel, pet.rarity);
      }

      const messages: string[] = [];
      if (levelsGained > 0) {
          stats = this.applyStatBonus(stats, levelsGained, pet.rarity);
          messages.push(`🎉 **${pet.name}** thăng cấp lên Lv.${currentLevel}! (Chỉ số tăng mạnh theo hệ ${pet.rarity})`);
      }

      const updatedPet = await prisma.pet.update({
          where: { id: petId },
          data: {
              level: currentLevel,
              exp: currentExp,
              stats: JSON.stringify(stats)
          }
      });

      return { pet: updatedPet, messages, levelsGained };
  }

  // --- Stamina System ---
  public async getStamina(pet: any): Promise<{ stamina: number, maxStamina: number, saved: boolean, newStatus: any }> {
      let status: any = { stamina: 100, lastStaminaUpdate: Date.now() };
      try { 
          if (pet.status) {
              const parsed = JSON.parse(pet.status);
              status = { ...status, ...parsed };
          }
      } catch(e) {}

      const maxStamina = 100;
      if (status.stamina >= maxStamina) {
          status.stamina = maxStamina;
          status.lastStaminaUpdate = Date.now();
          return { stamina: maxStamina, maxStamina, saved: false, newStatus: status };
      }

      const now = Date.now();
      const lastUpdate = status.lastStaminaUpdate || now;
      const timeDiff = now - lastUpdate;
      const minsPassed = Math.floor(timeDiff / 60000);
      const staminaGained = Math.floor(minsPassed / 5); // +1 per 5 mins

      let saved = false;
      if (staminaGained > 0) {
          status.stamina = Math.min(maxStamina, status.stamina + staminaGained);
          status.lastStaminaUpdate = lastUpdate + (staminaGained * 5 * 60000); // preserve remainder
          saved = true;
          
          // Auto-save if just checking so UI shows correctly without manual action sometimes
          await prisma.pet.update({
              where: { id: pet.id },
              data: { status: JSON.stringify(status) }
          });
      }

      return { stamina: status.stamina, maxStamina, saved, newStatus: status };
  }

  public async consumeStamina(petId: number, amount: number): Promise<boolean> {
      const pet = await prisma.pet.findUnique({ where: { id: petId } });
      if (!pet) return false;

      const { stamina, newStatus } = await this.getStamina(pet);
      if (stamina < amount) return false;

      newStatus.stamina -= amount;
      if (newStatus.stamina < 100 && !newStatus.lastStaminaUpdate) {
          newStatus.lastStaminaUpdate = Date.now();
      }

      await prisma.pet.update({
          where: { id: petId },
          data: { status: JSON.stringify(newStatus) }
      });
      return true;
  }

  public async restoreStamina(petId: number, amount: number) {
      const pet = await prisma.pet.findUnique({ where: { id: petId } });
      if (!pet) return;
      const { maxStamina, newStatus } = await this.getStamina(pet);
      newStatus.stamina = Math.min(maxStamina, newStatus.stamina + amount);
      if (newStatus.stamina === maxStamina) {
          newStatus.lastStaminaUpdate = Date.now();
      }
      await prisma.pet.update({
          where: { id: petId },
          data: { status: JSON.stringify(newStatus) }
      });
  }

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
          const { newPet, embed, files } = await this.hatchEggToDB(userId, chosenEgg);

          // Mark Daily Cooldown
          await prisma.userEggCooldown.update({
              where: { userId },
              data: { dailyCount: 1, lastEggOpenTime: new Date() }
          });

          await interaction.followUp({ embeds: [embed], files });

      } catch (error) {
          console.error("Hatching Error:", error);
          await interaction.followUp({ content: "❌ Có lỗi xảy ra trong quá trình gen. Vui lòng thử lại sau.", ephemeral: true });
      }
  }

  public async hatchEggToDB(userId: string, eggName: string, forcedRarity?: string) {
      const petData = await this.generatePetData(eggName, forcedRarity);
      
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

      const embed = new EmbedBuilder()
          .setTitle(`🎉 Chúc mừng! **${eggName}** đã nở ra **${newPet.species}**!`)
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

      return { newPet, embed, files };
  }

  // --- Generate Pet Logic ---
  private async generatePetData(eggType: string, forcedRarity?: string): Promise<any> {
    let rarity = 'Normal';
    
    if (forcedRarity) {
        rarity = forcedRarity;
    } else {
        const roll = Math.floor(Math.random() * 100);
        if (roll < 1) rarity = 'Legend'; // 1%
        else if (roll < 5) rarity = 'Unique'; // 4%
        else if (roll < 20) rarity = 'Rare'; // 15%
        else if (roll < 50) rarity = 'Magic'; // 30%
        else rarity = 'Normal'; // 50%
    }

    const prompt = `[Bối Cảnh & Vai Trò]
Bạn là **"Gene-Sys"**, chuyên gia sinh học giả tưởng.
Nhiệm vụ: Ấp trứng "${eggType}" thành sinh vật.

[Quy Trình Sáng Tạo]
1. Phân tích trứng để chọn chủng tộc, nguyên tố.
2. Độ hiếm BẮT BUỘC LÀ: **${rarity}**. Dựa vào độ hiếm này để phân bổ sức mạnh tương ứng.
3. Phân bổ chỉ số hợp lý (Legend thì stat cao hơn Normal).
4. Tạo skill (2-4 kỹ năng) và trait (1-4 nội tại).

[ĐỊNH DẠNG JSON - CHỈ TRẢ VỀ JSON]
{
"rarity": "${rarity}",
"element": "Fire/Water/Earth/Wind/Electric/Dark/Light...",
"species": "Tên loài",
"description_vi": "Mô tả tiếng Việt (2-3 câu)",
"imageprompt_pet": "Strictly english visual subject description for a chibi monster, comma separated (e.g., small cute red dragon, chibi, big eyes)",
"base_stats": { "hp": 100, "mp": 50, "atk": 10, "def": 10, "int": 10, "spd": 10 },
"skills": [ { "name": "", "description": "", "cost": 0, "type": "Physical", "power": 0 } ],
"traits": [ { "name": "", "description": "" } ]
}`;

    return await geminiService.generateJSON(prompt);
  }

  // --- Calculate Combat Power ---
  public calcCombatPower(pet: any, statsInfo?: any, skillsInfo?: any[]): number {
      let stats = statsInfo;
      let skills = skillsInfo;
      if (!stats) try { stats = JSON.parse(pet.stats as string); } catch(e) { stats = { hp: 100, atk: 10, def: 10, spd: 10 }; }
      if (!skills) try { skills = JSON.parse(pet.skills as string); } catch(e) { skills = []; }
      
      let baseCp = (stats.hp * 0.2) + (stats.atk * 1.5) + (stats.def * 1.2) + (stats.spd * 1) + ((stats.int || 0) * 1.2);
      let skillPower = 0;
      (skills || []).forEach((s: any) => skillPower += (s.power || 0));
      
      return Math.floor(baseCp + skillPower + (pet.level * 10));
  }

  // --- List Pets ---
  public async showPetList(interaction: any) {
      // 1. Lấy thông tin Pet
      const userId = interaction.user.id;
      const pet = await prisma.pet.findFirst({
          where: { ownerId: userId },
          orderBy: { createdAt: 'desc' }
      });

      if (!pet) {
          return { content: "🕸️ Bạn chưa có sinh vật nào. Hãy dùng `/pet start` để ấp trứng!" };
      }

      // 2. Phân tích dữ liệu Stats & Skills
      let stats: any = { hp: 100, atk: 10, def: 10, spd: 10, int: 10, mp: 80 };
      let skills: any[] = [];
      try { stats = JSON.parse(pet.stats as string) || stats; } catch(e) {}
      try { skills = JSON.parse(pet.skills as string) || []; } catch(e) {}

      const maxExp = this.getRequiredExp(pet.level, pet.rarity);
      const combatPower = this.calcCombatPower(pet, stats, skills);
      
      const embed = new EmbedBuilder()
          .setTitle(`🌟 THÔNG TIN SINH VẬT`)
          .setDescription(`**${pet.name}**\n*${pet.species}* — Bậc **${pet.evolutionStage}/10**\n\n${pet.description}`)
          .setColor(this.getRarityColor(pet.rarity))
          .addFields(
              { name: "Cấp độ & Kinh nghiệm", value: `Lv.**${pet.level}** (${pet.exp.toLocaleString()}/${maxExp.toLocaleString()} EXP)\n⚔️ **Lực Chiến: ${combatPower.toLocaleString()}**`, inline: false },
              { name: "Thuộc tính", value: `Độ hiếm: **${pet.rarity}** | Hệ: **${pet.element}**`, inline: false },
              { name: "Chỉ số cơ bản", value: `❤️ HP: ${stats.hp || 100}\n⚔️ ATK: ${stats.atk || 10}\n🛡️ DEF: ${stats.def || 10}\n⚡ SPD: ${stats.spd || 10}`, inline: true },
              { name: "Phép thuật / MP", value: `💙 MP: ${stats.mp || 80}\n🧠 INT: ${stats.int || 10}`, inline: true }
          );

      if (skills.length > 0) {
          const skillText = skills.map(s => `🔹 **${s.name}**: ${s.description} (Power: ${s.power || 0}, MP: ${s.cost || 10})`).join('\n');
          embed.addFields({ name: `Kỹ Năng (${skills.length}/4)`, value: skillText, inline: false });
      } else {
          embed.addFields({ name: "Kỹ Năng", value: "Sinh vật chưa học được kỹ năng nào.", inline: false });
      }

      if (pet.lore) {
          embed.addFields({ name: "Truyền thuyết", value: `*${pet.lore}*`, inline: false });
      }
      embed.setFooter({ text: "Dùng /pet evolve để tiến hóa, /pk để chiến đấu." });

      const files = [];
      if (pet.imageData && pet.imageData.startsWith('data:image')) {
          const base64Data = pet.imageData.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          files.push({ attachment: buffer, name: 'pet.png' });
          embed.setImage('attachment://pet.png');
      } else if (pet.imageData && pet.imageData.startsWith('http')) {
          embed.setImage(pet.imageData);
      }

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

      if (pet.evolutionStage >= 10) {
          return { content: `❌ **${pet.name}** đã đạt cảnh giới tối đa (Bậc 10) và không thể tiến hóa thêm.` };
      }

      // Check level requirement (Evolve requires intervals of 30)
      const reqLevel = pet.evolutionStage * 30;
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
1. Nâng cấp "species" thành hình dạng trưởng thành/ngầu hơn.
2. Viết lại "description_vi" và "lore" mô tả sự vĩ đại này. Bắt buộc dài hơn 2 câu.
3. imageprompt_pet: Tạo visual representation mô tả cực chi tiết bằng TIẾNG ANH.
4. "skills": TRẢ VỀ CHÍNH XÁC MẢNG JSON CỦA BẠN. TẠO THÊM 1 skill tấn công mới mạnh hơn và gộp vào mảng "skills" cũ. Hệ thống sẽ tự động gọt bỏ skill cũ nhất nếu vượt quá 4.
5. "traits": Nâng cấp mô tả của trait hiện tại cho ngầu hơn (nếu đổi tên phải giữ ý nghĩa).
6. "stats": Tăng tất cả chỉ số lên khoảng 1.5 - 2 lần. BẮT BUỘC trả về number.

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
              if (evoStone.quantity === 1) {
                  await tx.inventoryItem.delete({ where: { id: evoStone.id } });
              } else {
                  await tx.inventoryItem.update({ where: { id: evoStone.id }, data: { quantity: { decrement: 1 } } });
              }

              // Filter max 4 skills
              let newSkillsArray = evolvedData.skills;
              if (newSkillsArray && newSkillsArray.length > 4) {
                 newSkillsArray = newSkillsArray.slice(-4); // Keep the latest 4 skills
              }

              await (tx as any).pet.update({
                  where: { id: pet.id },
                  data: {
                      species: evolvedData.species,
                      name: evolvedData.species, 
                      description: evolvedData.description_vi,
                      lore: evolvedData.lore,
                      stats: JSON.stringify(evolvedData.stats),
                      skills: JSON.stringify(newSkillsArray),
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
