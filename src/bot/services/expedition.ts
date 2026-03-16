import { prisma } from '../../database/prisma';
import { petService } from './pet';
import { userIdentityService } from './identity';
import { EmbedBuilder } from 'discord.js';
import { SHOP_ITEMS } from './shop';

const EXPEDITION_COOLDOWN_MS = 30 * 60 * 1000;
const STAMINA_COST = 20;

export interface StageData {
    id: number;
    chapter: number;
    chapterName: string;
    chapterEmoji: string;
    stageInChapter: number;
    name: string;
    bossName: string;
    lore: string;
    requiredCP: number;
    coinBase: number;
    expBase: number;
    dropPool: string[];
    dropChance: number;
}

const CHAPTER_META = [
    { name: 'Rừng Hoang Sơ',       emoji: '🌿', cpStart: 50,   cpEnd: 200   },
    { name: 'Đồng Bằng Lửa',       emoji: '🔥', cpStart: 200,  cpEnd: 500   },
    { name: 'Hang Động Băng',       emoji: '❄️', cpStart: 500,  cpEnd: 1000  },
    { name: 'Tháp Ác Ma',           emoji: '⚡', cpStart: 1000, cpEnd: 2000  },
    { name: 'Thần Giới Viễn Cổ',   emoji: '🌌', cpStart: 2000, cpEnd: 4000  },
];

const STAGE_MOBS = [
    // Ch1 – Rừng Hoang Sơ
    ['Slime Ký Sinh', 'Cáo Xám Hoang Dại', 'Rắn Độc Gai', 'Thỏ Quỷ Sứ', 'Cây Ăn Thịt',
     'Nhện Rừng Khổng Lồ', 'Sói Đen Rừng Tối', 'Linh Miêu Bóng Đêm', 'Tinh Tinh Nguyên Thủy', 'Trùm: ❖ Quỷ Thụ Vương'],
    // Ch2 – Đồng Bằng Lửa
    ['Thạch Sùng Lửa', 'Bọ Cạp Đỏ', 'Chó Lửa Nguyên Tố', 'Kền Kền Hỏa Thần', 'Rồng Con Lửa',
     'Chiến Binh Kỵ Mã Đỏ', 'Yêu Tinh Đồng Cỏ', 'Ác Thú Lửa Cánh', 'Phượng Hoàng Băng Hỏa', 'Trùm: ❖ Hỏa Nguyên Thần Vương'],
    // Ch3 – Hang Động Băng
    ['Ma Sói Băng', 'Nhện Tinh Thể Lạnh', 'Đại Bàng Tuyết Trắng', 'Golem Đá Băng', 'Thuỷ Quái Sâu Thẳm',
     'Rồng Băng Cổ Đại', 'Bóng Ma Vực Lạnh', 'Kỵ Sĩ Đêm Đông', 'Tộc Bạch Hổ Băng', 'Trùm: ❖ Băng Hồn Chi Vương'],
    // Ch4 – Tháp Ác Ma
    ['Quỷ Nhỏ Tháp Thứ 1', 'Ác Quỷ Cánh Dơi', 'Linh Hồn Bị Trói', 'Binh Đoàn Bóng Tối', 'Tướng Quân Ma Giới',
     'Chiến Pháp Sư Quỷ', 'Ác Long Tháp Tầng 7', 'Tinh Linh Địa Ngục', 'Đại Tướng Diêm Vương', 'Trùm: ❖ Ma Vương Chi Thần'],
    // Ch5 – Thần Giới Viễn Cổ
    ['Thiên Binh Sơ Cấp', 'Mãnh Long Thần Giới', 'Tiên Vệ Thiên Đình', 'Chiến Thần Vô Danh', 'Thần Thú Tứ Thánh',
     'Hộ Pháp Kim Cương', 'Tứ Tượng Thần Vệ', 'Chư Thiên Đại Thánh', 'Thần Vương Cổ Đại', 'Trùm: ❖ Thái Cổ Hỗn Nguyên Chi Thần'],
];

const STAGE_LORES = [
    // Ch1
    ['Rừng rậm ẩm ướt, nơi sinh sản của những sinh vật nguyên thủy.','Tiếng cáo hú vang dội trong màn đêm, mang theo báo hiệu nguy hiểm.','Bước chân trên lớp lá mục, mùi độc tố lan tỏa trong không khí.','Những cặp mắt đỏ lập loè trong bụi rậm - chúng đang đói!','Cái bẫy thực vật - cái gì đó không an toàn với tất cả đây.','Mạng nhện bủa vây khắp nơi; mỗi sợi là một cái bẫy tinh vi.','Vết móng vuốt trên cây cổ thụ to bằng bàn tay người lớn...','Ánh mắt xanh lét theo dõi từ ngọn cây.','Gào thét vang rừng - hội trưởng đã tìm ra kẻ xâm phạm!','Quỷ Thụ Vương, linh hồn của cả khu rừng đang tức giận!'],
    // Ch2
    ['Nắng như đổ lửa, mặt đất nứt nẻ tỏa nhiệt hừng hực.','Đuôi bọ cạp phát sáng đỏ rực - đó là điềm chẳng lành.','Tiếng sủa lửa vang lên phía sau những tảng đá nóng.','Bóng khổng lồ che khuất mặt trời - cánh dài đầy lửa.','Con nhỏ thôi nhưng vảy đã cứng như thép và thở ra lửa.','Tiếng vó ngựa rực lửa gõ trên đất khô - kỵ binh chiến đến!','Tiếng rú gào điên loạn vọng lại từ xa - bầy quỷ đang tới.','Lông vũ như than hồng, mỗi cái quạt tạo ra cơn lốc lửa.','Hai luồng lửa và băng xoắn quanh nhau - dị thú hiếm thấy!','Tim bạo chúa đập tạo ra sóng nhiệt, cả vùng rung chuyển.'],
    // Ch3
    ['Hơi thở của mình hóa khói trắng trong cái lạnh buốt xương.','Tơ nhện đóng băng như pha lê, một va chạm là vỡ tan.','Tiếng cánh đập làm băng vụn rơi lả tả từ vách núi.','Đá và băng hợp nhất thành hình dạng - Golem thức tỉnh!','Từ bóng tối dưới lớp băng, một đôi mắt đỏ nhìn lên.','Tiếng gầm vang động cả hang động, băng trên trần rơi xuống.','Bóng ma không có bóng, chỉ có cái lạnh đột ngột báo hiệu.','Áo giáp đen phủ băng trắng - kỵ sĩ của mùa đông vĩnh cửu.','Gầm gừ trắng toát, mỗi bước in hình chân trên lớp băng.','Cả hang rung chuyển - Băng Hồn Chi Vương đã thức tỉnh!'],
    // Ch4
    ['Tháp tối tăm, mỗi bậc thang là một thử thách về tâm lý.','Cánh dơi quỷ phủ kín trần, tiếng kêu chói tai điếc cả hồn.','Chuỗi xích bao quanh, nhưng ánh mắt chứa đầy tức giận và đau...','Hàng trăm bóng tối hợp nhất thành đội hình chiến đấu.','Chiếc mũ sắt che khuất khuôn mặt, nhưng sát khí tràn ngập.','Cuốn sách phép thuật tối tự lật trang, phun ra lửa địa ngục.','Rồng cổ lớp 7 - mỗi vảy là một bùa trận, mỗi móng là gươm báu.','Tiếng thét kinh hoàng vang lên từ cổng địa ngục mở ra.','Mắt đỏ như máu, bào ảnh trăm tay - Đại Tướng của Diêm Vương.','Ma Vương xuất hiện - cả tháp rung chuyển, bóng tối bao phủ tất cả.'],
    // Ch5
    ['Ánh sáng chói lóa, không khí gần như rung lên vì thần lực.','Rồng thần mang theo vận mệnh của cả thế giới trong hơi thở.','Áo giáp vàng lóng lánh, mỗi bước đi là tiếng sấm sét khai thiên.','Không tên tuổi, không lịch sử - chỉ có sức mạnh thuần túy.','Bốn linh thú của tứ phương hợp nhất bảo vệ Thiên Đình.','Kim cương áo giáp hấp thụ mọi đòn tấn công thường.','Bộ tứ thiên vệ kết thành trận pháp - phong tỏa mọi đường ra.','Đại thánh của chư thiên, mỗi nụ cười là một ngôi sao tắt.','Thần vương sải bước, mỗi bước tạo ra một thiên hà!','Thái Cổ Hỗn Nguyên - nguồn gốc của mọi sức mạnh trong vũ trụ!'],
];

const CHAPTER_DROPS: string[][] = [
    ['exp_potion','exp_stone_sm','stamina_potion'],
    ['exp_stone_md','stamina_potion','fire_crystal','water_crystal','earth_crystal','wind_crystal'],
    ['exp_stone_lg','hp_potion','mp_potion','fire_crystal','water_crystal','earth_crystal','wind_crystal'],
    ['rare_chest','evo_stone','hp_potion','mp_potion','exp_stone_lg'],
    ['rare_chest','evo_stone','egg_magic','egg_rare','exp_stone_lg'],
];

function buildStages(): StageData[] {
    const stages: StageData[] = [];
    for (let ch = 0; ch < 5; ch++) {
        const meta = CHAPTER_META[ch];
        for (let s = 0; s < 10; s++) {
            const id = ch * 10 + s + 1;
            const t = s / 9;
            const requiredCP = Math.floor(meta.cpStart + t * (meta.cpEnd - meta.cpStart));
            const coinBase = 200 + id * 100 + ch * 500;
            const expBase  = 100 + id * 60  + ch * 200;
            const dropChance = 0.25 + ch * 0.05 + (s === 9 ? 0.2 : 0);
            stages.push({
                id, chapter: ch + 1, chapterName: meta.name, chapterEmoji: meta.emoji,
                stageInChapter: s + 1,
                name: `${meta.emoji} Ải ${id} — ${STAGE_MOBS[ch][s]}`,
                bossName: STAGE_MOBS[ch][s],
                lore: STAGE_LORES[ch][s],
                requiredCP, coinBase, expBase,
                dropPool: CHAPTER_DROPS[ch],
                dropChance,
            });
        }
    }
    return stages;
}

export const EXPEDITION_STAGES = buildStages();

export function getStageById(id: number): StageData | undefined {
    return EXPEDITION_STAGES.find(s => s.id === id);
}

function calcWinRate(petCP: number, requiredCP: number): number {
    const ratio = petCP / requiredCP;
    if (ratio >= 1.5) return 0.97;
    if (ratio >= 1.2) return 0.90;
    if (ratio >= 1.0) return 0.75;
    if (ratio >= 0.8) return 0.50;
    if (ratio >= 0.6) return 0.28;
    return 0.10;
}

function rollDrop(pool: string[], chance: number): string | null {
    if (Math.random() > chance) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

class ExpeditionService {

    public async getProgress(userId: string) {
        let prog = await prisma.expeditionProgress.findUnique({ where: { userId } });
        if (!prog) {
            prog = await prisma.expeditionProgress.create({
                data: { userId, maxStage: 0, clearedStages: '[]', lastAttempt: new Date(0) }
            });
        }
        return prog;
    }

    public async showStatus(userId: string) {
        const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
        if (!pet) return { content: '❌ Bạn chưa có sinh vật! Dùng `/pet start`.' };

        const prog = await this.getProgress(userId);
        const cleared: number[] = JSON.parse(prog.clearedStages);
        const nextStageId = prog.maxStage + 1;
        const nextStage = getStageById(Math.min(nextStageId, 50));
        const petCP = petService.calcCombatPower(pet);

        const chapterProgress: string[] = [];
        for (let ch = 1; ch <= 5; ch++) {
            const meta = CHAPTER_META[ch - 1];
            const chStages = EXPEDITION_STAGES.filter(s => s.chapter === ch);
            const cleared_ch = chStages.filter(s => cleared.includes(s.id)).length;
            const bar = '█'.repeat(cleared_ch) + '░'.repeat(10 - cleared_ch);
            chapterProgress.push(`${meta.emoji} **${meta.name}**: ${bar} ${cleared_ch}/10`);
        }

        const winRate = nextStage ? Math.round(calcWinRate(petCP, nextStage.requiredCP) * 100) : 100;
        const cooldownMs = prog.lastAttempt.getTime() - Date.now() + EXPEDITION_COOLDOWN_MS;
        const onCooldown = cooldownMs > 0;

        const embed = new EmbedBuilder()
            .setTitle('🗺️ VIỄN CHINH — Tiến Độ Chiến Dịch')
            .setColor(0x8B5CF6)
            .setDescription(chapterProgress.join('\n'))
            .addFields(
                { name: '⚔️ Lực Chiến (CP)', value: `**${petCP.toLocaleString()}**`, inline: true },
                { name: '🏆 Ải Cao Nhất', value: `**Ải ${prog.maxStage}** / 50`, inline: true },
                { name: '🎯 Ải Tiếp Theo', value: nextStage ? `**${nextStage.name}**\nCP Cần: ${nextStage.requiredCP.toLocaleString()} | Tỉ Lệ Thắng: **${winRate}%**` : '🎉 Đã chinh phục tất cả!', inline: false },
                { name: '⏱️ Trạng Thái', value: onCooldown ? `⏳ Hồi chiêu: còn **${Math.ceil(cooldownMs / 60000)} phút**` : '✅ Sẵn sàng chiến đấu!', inline: false }
            )
            .setFooter({ text: 'Dùng /expedition fight để xuất chinh • /expedition info <số_ải> để xem chi tiết ải' });

        return { embeds: [embed] };
    }

    public async fight(userId: string) {
        const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
        if (!pet) return { content: '❌ Bạn chưa có sinh vật!' };

        const prog = await this.getProgress(userId);
        const cooldownMs = prog.lastAttempt.getTime() - Date.now() + EXPEDITION_COOLDOWN_MS;
        if (cooldownMs > 0) {
            return { content: `⏳ Sinh vật đang phục hồi sau trận đánh! Còn **${Math.ceil(cooldownMs / 60000)} phút** nữa.` };
        }

        const nextStageId = prog.maxStage + 1;
        if (nextStageId > 50) {
            return { content: '🎉 **Bạn đã chinh phục toàn bộ 50 ải Viễn Chinh!** Thật phi thường!' };
        }

        const stage = getStageById(nextStageId)!;
        const petCP = petService.calcCombatPower(pet);
        const winRate = calcWinRate(petCP, stage.requiredCP);
        const won = Math.random() < winRate;

        await prisma.expeditionProgress.update({
            where: { userId },
            data: { lastAttempt: new Date() }
        });

        if (!won) {
            const embed = new EmbedBuilder()
                .setTitle(`💀 Thất Bại — ${stage.name}`)
                .setColor(0xEF4444)
                .setDescription(`**${pet.name}** đã bị **${stage.bossName}** đánh bại!\n\n*${stage.lore}*`)
                .addFields(
                    { name: '⚔️ CP của bạn', value: `${petCP.toLocaleString()}`, inline: true },
                    { name: '🛡️ CP Yêu Cầu', value: `${stage.requiredCP.toLocaleString()}`, inline: true },
                    { name: '📊 Tỉ Lệ Thắng', value: `${Math.round(winRate * 100)}%`, inline: true }
                )
                .setFooter({ text: 'Hãy nâng cấp sinh vật và thử lại sau 30 phút!' });
            return { embeds: [embed] };
        }

        const isFirstClear = !JSON.parse(prog.clearedStages).includes(stage.id);
        const coinMult = isFirstClear ? 3 : 1;
        const expMult  = isFirstClear ? 3 : 1;
        const coinReward = Math.floor((stage.coinBase + Math.random() * stage.coinBase * 0.3) * coinMult);
        const expReward  = Math.floor((stage.expBase  + Math.random() * stage.expBase  * 0.3) * expMult);
        const droppedItemId = rollDrop(stage.dropPool, stage.dropChance * (isFirstClear ? 2 : 1));

        const newCleared = isFirstClear
            ? [...JSON.parse(prog.clearedStages), stage.id]
            : JSON.parse(prog.clearedStages);

        await prisma.$transaction(async (tx) => {
            await tx.expeditionProgress.update({
                where: { userId },
                data: {
                    maxStage: Math.max(prog.maxStage, stage.id),
                    clearedStages: JSON.stringify(newCleared),
                }
            });
            await tx.userIdentity.update({ where: { userId }, data: { money: { increment: coinReward } } });

            if (droppedItemId) {
                const shopItem = SHOP_ITEMS.find(i => i.id === droppedItemId);
                if (shopItem) {
                    const exist = await tx.inventoryItem.findFirst({ where: { userId, itemId: droppedItemId } });
                    if (exist) await tx.inventoryItem.update({ where: { id: exist.id }, data: { quantity: { increment: 1 } } });
                    else await tx.inventoryItem.create({ data: { userId, itemId: shopItem.id, itemType: shopItem.type, name: shopItem.name, quantity: 1 } });
                }
            }
        });

        userIdentityService.invalidateCache(userId);
        const { levelsGained, messages } = await petService.addExpAndLevelUp(pet.id, expReward);
        const nextUp = getStageById(stage.id + 1);

        const rewardLines = [
            `🪙 **+${coinReward.toLocaleString()} Coin**${isFirstClear ? ' 🆕×3 (First Clear!)' : ''}`,
            `✨ **+${expReward.toLocaleString()} EXP**${isFirstClear ? ' 🆕×3' : ''}`,
        ];
        if (droppedItemId) {
            const si = SHOP_ITEMS.find(i => i.id === droppedItemId);
            rewardLines.push(`🎁 **1x ${si?.emoji || '📦'} ${si?.name || droppedItemId}** (drop!)`);
        }
        if (levelsGained > 0) rewardLines.push(...messages);

        const embed = new EmbedBuilder()
            .setTitle(`⚔️ CHIẾN THẮNG${isFirstClear ? ' 🌟 KHAI PHÁ MỚI' : ''}! — ${stage.name}`)
            .setColor(isFirstClear ? 0xFFD700 : 0x00AE86)
            .setDescription(`**${pet.name}** đã đánh bại **${stage.bossName}**!\n\n*${stage.lore}*`)
            .addFields(
                { name: '🎁 Phần Thưởng', value: rewardLines.join('\n'), inline: false },
                { name: '⚔️ CP', value: `${petCP.toLocaleString()}`, inline: true },
                { name: '📊 Tỉ Lệ Thắng', value: `${Math.round(winRate * 100)}%`, inline: true },
                { name: '🏆 Tiến Độ', value: `Ải ${stage.id}/50`, inline: true }
            );

        if (nextUp) {
            embed.addFields({ name: '▶️ Ải Tiếp Theo', value: `${nextUp.name} (CP cần: ${nextUp.requiredCP.toLocaleString()})`, inline: false });
        } else {
            embed.addFields({ name: '🎉 HOÀN THÀNH', value: 'Bạn đã chinh phục toàn bộ Viễn Chinh!', inline: false });
        }

        embed.setFooter({ text: 'Cooldown 30 phút trước lần xuất chinh tiếp theo' });
        return { embeds: [embed] };
    }

    public async showStageInfo(stageId: number) {
        const stage = getStageById(stageId);
        if (!stage) return { content: `❌ Không tìm thấy ải số ${stageId}. Nhập từ 1 đến 50.` };

        const embed = new EmbedBuilder()
            .setTitle(`${stage.chapterEmoji} Ải ${stage.id} — ${stage.bossName}`)
            .setColor(0x8B5CF6)
            .setDescription(`*${stage.lore}*`)
            .addFields(
                { name: '📖 Chương', value: `Chương ${stage.chapter}: ${stage.chapterName}`, inline: true },
                { name: '🛡️ CP Yêu Cầu', value: `**${stage.requiredCP.toLocaleString()}**`, inline: true },
                { name: '💰 Thưởng Cơ Bản', value: `~${stage.coinBase} Coin | ~${stage.expBase} EXP\n(×3 lần đầu chinh phục)`, inline: false },
                { name: '🎁 Bảng Drop Items', value: stage.dropPool.map(id => {
                    const si = SHOP_ITEMS.find(i => i.id === id);
                    return si ? `${si.emoji} ${si.name}` : id;
                }).join(' • '), inline: false },
                { name: '📊 Tỉ Lệ Drop', value: `${Math.round(stage.dropChance * 100)}%${stage.stageInChapter === 10 ? ' (Boss drop cao hơn)' : ''}`, inline: true }
            )
            .setFooter({ text: 'Dùng /expedition fight để chiến đấu ải của bạn' });

        return { embeds: [embed] };
    }
}

export const expeditionService = new ExpeditionService();
