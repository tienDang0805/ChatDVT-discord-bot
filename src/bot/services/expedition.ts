import { prisma } from '../../database/prisma';
import { petService, PetSnapshot, parsePet } from './pet';
import { userIdentityService } from './identity';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ButtonInteraction, Message } from 'discord.js';
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
    { name: 'Rừng Hoang Sơ',       emoji: '🌿', cpStart: 50,    cpEnd: 200     },
    { name: 'Đồng Bằng Lửa',       emoji: '🔥', cpStart: 200,   cpEnd: 500     },
    { name: 'Hang Động Băng',      emoji: '❄️', cpStart: 500,   cpEnd: 1000    },
    { name: 'Tháp Ác Ma',          emoji: '⚡', cpStart: 1000,  cpEnd: 2000    },
    { name: 'Thần Giới Viễn Cổ',   emoji: '🌌', cpStart: 2000,  cpEnd: 4000    },
    { name: 'Lãnh Địa Phá Hoại',   emoji: '🌋', cpStart: 4000,  cpEnd: 10000   },
    { name: 'Vực Sâu Tuyệt Vọng',  emoji: '🕳️', cpStart: 10000, cpEnd: 25000   },
    { name: 'Cõi Mộng Ảo Thiên',   emoji: '🌠', cpStart: 25000, cpEnd: 60000   },
    { name: 'Hành Tinh Sắt Đá',    emoji: '⚙️', cpStart: 60000, cpEnd: 120000  },
    { name: 'Thánh Điện Tận Cùng', emoji: '👑', cpStart: 120000, cpEnd: 250000 },
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
    // Ch6 – Lãnh Địa Phá Hoại
    ['Dung Nham Trĩ Nhân', 'Hắc Diệu Thạch Quái', 'Tinh Linh Dung Nham', 'Ma Thú Hỏa Diệm', 'Chiến Binh Tro Tàn',
     'Dực Long Phun Lửa', 'Quỷ Lùn Lò Rèn', 'Đại Tướng Nham Thạch', 'Phượng Hoàng Đen', 'Trùm: ❖ Dung Nham Bạo Quân'],
    // Ch7 – Vực Sâu Tuyệt Vọng
    ['Bóng Ma Lang Thang', 'Kẻ Nuốt Hồn', 'Xác Sống Mù', 'Thảm Thực Vật Hút Máu', 'Sứa Vực Sâu Phát Sáng',
     'Cá Voi Ma Quái', 'Quái Vật Xúc Tu Rỗng', 'Lính Canh Ngục Tối', 'Kẻ Giao Báo Tử', 'Trùm: ❖ Thú Nuốt Chửng Ánh Sáng'],
    // Ch8 – Cõi Mộng Ảo Thiên
    ['Tinh Linh Ảo Giác', 'Quái Thú Bụi Sao', 'Hồ Ly Chín Đuôi Mộng', 'Chiến Binh Kính Vỡ', 'Pháp Sư Không Gian',
     'Kỳ Lân Cửu Sắc', 'Thiên Tướng Dải Ngân Hà', 'Phi Long Thủy Tinh', 'Kẻ Xuyên Không', 'Trùm: ❖ Chúa Tể Mộng Ảo'],
    // Ch9 – Hành Tinh Sắt Đá
    ['Bọ Máy Thăm Dò', 'Chó Săn Hợp Kim', 'Droid Phá Hủy', 'Xe Tăng Tư Duy', 'Chiến Cơ Phản Đột',
     'Quái Vật Dây Cáp', 'Robot Biến Hình Cổ', 'Tướng Quân Cyborg', 'Đại Bàng Thép', 'Trùm: ❖ Trí Tuệ Nhân Tạo Tối Cao'],
    // Ch10 – Thánh Điện Tận Cùng
    ['Hộ Vệ Thánh Môn', 'Thiên Sứ Lông Cánh Đen', 'Kỵ Sĩ Thập Tự Vàng', 'Pháp Sư Vô Cực', 'Long Thần Ánh Sáng',
     'Bóng Đêm Song Sinh', 'Thần Khí Sống Lại', 'Tứ Thiên Vương Cổ', 'Hóa Thân Của Tuyệt Vọng', 'Trùm: ❖ Nguyên Tôn Sáng Niệm Cổ Thần'],
];

const STAGE_LORES = [
    // Ch1
    ['Rừng rậm ẩm ướt, nơi sinh sản của những sinh vật nguyên thủy.','Tiếng cáo hú vang dội trong màn đêm, mang theo báo hiệu nguy hiểm.','Bước chân trên lớp lá mục, mùi độc tố lan tỏa trong không khí.','Những cặp mắt đỏ lập loè trong bụi rậm - chúng đang đói!','Cái bẫy thực vật - cái gì đó không an toàn với tất cả đây.','Mạng nhện bủa vây khắp nơi; mỗi sợi là một cái bẫy tinh vi.','Vết móng vuốt trên cây cổ thụ to bằng bàn tay người lớn...','Ánh mắt xanh lét theo dõi từ ngọn cây.','Gào thét vang rừng - hội trưởng đã tìm ra kẻ xâm phạm!','Quỷ Thụ Vương, linh hồn của cả khu rừng đang tức giận!'],
    // Ch2
    ['Nắng như đổ lửa, mặt đất nứt nẻ tỏa nhiệt hừng hực.','Đuôi bọ cạp phát sáng đỏ rực - đó là điềm chẳng lành.','Tiếng sủa lửa vang lên phía sau những tảng đá nóng.','Bóng khổng lồ che khuất mặt trời - cánh dài đầy lửa.','Con nhỏ thôi nhưng vảy đã cứng như thép và thở ra lửa.','Tiếng vó ngựa rực lửa gõ trên đất khô - kỵ binh chiến đến!','Tiếng rú gào điên loạn vọng lại từ xa - bầy quỷ đang tới.','Lông vũ như than hồng, mỗi cái quạt tạo ra cơn lốc lửa.','Hai luồng lửa và băng xoắn quanh nhau - dị thú hiếm thấy!','Tim bạo chúa đập tạo ra sóng nhiệt, cả vùng rung chuyển.'],
    // Ch3
    ['Hơi thở của mình hóa khói trắng trong cái lạnh buốt xương.','Tơ nhện đóng băng như pha lê, một va chạm là vỡ tan.','Tiếng cánh đập làm băng vụn rơi lả tả từ vách núi.','Đá và băng hợp nhất thành hình dạng - Golem thức tỉnh!','Từ bóng tối dưới lớp băng, một đôi mắt đỏ nhìn lên.','Tiếng gầm vang động cả hang động, băng trên trần rơi xuống.','Bóng ma không có bóng, chỉ có cái lạnh đột ngột báo hiệu.','Áo giáp đen phủ băng trắng - kỵ sĩ của mùa đông vĩnh cửu.','Gầm gừ trắng toát, mỗi bước in hình chân trên lớp băng.','Cả hang rung chuyển - Băng Hồn Chi Vương đã thức tỉnh!'],
    // Ch4
    ['Tháp tối tăm, mỗi bậc thang là một thử thách về tâm lý.','Cánh dơi quỷ phủ kín trần, tiếng kêu chói tai điếc cả hồn.','Chuỗi xích bao quanh, nhưng ánh mắt chứa đầy tức গঠন và đau...','Hàng trăm bóng tối hợp nhất thành đội hình chiến đấu.','Chiếc mũ sắt che khuất khuôn mặt, nhưng sát khí tràn ngập.','Cuốn sách phép thuật tối tự lật trang, phun ra lửa địa ngục.','Rồng cổ lớp 7 - mỗi vảy là một bùa trận, mỗi móng là gươm báu.','Tiếng thét kinh hoàng vang lên từ cổng địa ngục mở ra.','Mắt đỏ như máu, bào ảnh trăm tay - Đại Tướng của Diêm Vương.','Ma Vương xuất hiện - cả tháp rung chuyển, bóng tối bao phủ tất cả.'],
    // Ch5
    ['Ánh sáng chói lóa, không khí gần như rung lên vì thần lực.','Rồng thần mang theo vận mệnh của cả thế giới trong hơi thở.','Áo giáp vàng lóng lánh, mỗi bước đi là tiếng sấm sét khai thiên.','Không tên tuổi, không lịch sử - chỉ có sức mạnh thuần túy.','Bốn linh thú của tứ phương hợp nhất bảo vệ Thiên Đình.','Kim cương áo giáp hấp thụ mọi đòn tấn công thường.','Bộ tứ thiên vệ kết thành trận pháp - phong tỏa mọi đường ra.','Đại thánh của chư thiên, mỗi nụ cười là một ngôi sao tắt.','Thần vương sải bước, mỗi bước tạo ra một thiên hà!','Thái Cổ Hỗn Nguyên - nguồn gốc của mọi sức mạnh trong vũ trụ!'],
    // Ch6
    ['Dung nham sôi rùng rục dưới lòng đất, nóng đến ngạt thở.','Đá đen lấp lánh như có sự sống riêng.','Hạt tinh linh nảy múa trên biển lửa chết chóc.','Quái vật gầm thét, nôn ra lửa lưu huỳnh thiêu rụi mọi thứ.','Bộ giáp như tro tàn, ánh mắt là đốm lửa ma trơi thù hận.','Đôi cánh che khuất cả bầu trời núi lửa, rải thảm nhiệt.','Lò rèn cổ xưa rung lên theo từng nhịp búa đập.','Kẻ cai trị biển dung nham với thân hình vạn tấn.','Phượng hoàng niết bàn, thiêu cháy mọi vật quanh đây.','Vua của ngọn núi này... Không gì có thể ngăn ngài nổi giận!'],
    // Ch7
    ['Bóng tối đặc quánh, nuốt chửng ánh sáng của đuốc rọi.','Tiếng thì thầm vang dội từ một góc vô định... Ai đói hồn?','Bọn chúng di chuyển trong mù lòa nhưng chính xác đáng sợ.','Dây leo màu máu bò dưới chân, chờ hút cạn sự sống.','Đốm sáng duy nhất là thứ nguy hiểm nhất dưới Vực.','Nó rên rỉ một bài ca của những linh hồn chết chìm ngàn độ sâu.','Xúc tu từ hư không đâm nát nền đá đen kịt.','Chúng gác cổng sự tuyệt vọng, không nụ cười, vô tri.','Hắn mang lưỡi hái, điểm tên những kẻ tới đây.','Thứ nuốt chửng cả một thế giới ánh sáng đang tỉnh giấc...'],
    // Ch8
    ['Làn sương mờ ảo biến đổi không ngừng, dụ dỗ con ngươi mỏi mệt.','Sao chổi vỡ vụn sinh ra quái dị kỳ lạ, tấn công bằng viễn ảnh.','Hồ ly mê hoặc, cứ mỗi cái đuôi quật là một khoảng thực tại vỡ nát.','Tấm gương phản chiếu ảo ảnh, mỗi cái đập là một mảnh vỡ đâm vào da.','Pháp sư bóp méo không gian, thay đổi hình dạng vũ trụ.','Kỳ lân bước đi trên dải ngân hà, mang bão tố muôn màu.','Tướng quân canh phòng cõi Ảo, thân mặc giáp mây ngũ sắc.','Phi long vô hình lướt qua, để lại tinh vân rực rỡ.','Kẻ không thuộc về thời đại này, xóa bỏ mọi quy luật vật lý.','Chúa tể thực tại... Bất cứ thứ gì ngươi đang thấy chỉ là do ngài vẽ ra.'],
    // Ch9
    ['Thế giới của bánh răng và dầu nhớt, tiếng bíp báo động râm ran.','Mã tấu hợp kim trên mõm con thú máy kêu rè rè ghê rợn.','Người máy không có khái niệm sợ hãi, chỉ có lập trình tiêu diệt.','Pháo đài tư duy, bắn phá mọi logic.','Động cơ gầm thét xé nát lớp tĩnh lặng của hành tinh kim loại.','Dây cáp cắm thẳng vào mạch điện tạo thành quái vật khát điện khổng lồ.','Robot thức tỉnh từ phế tích phế liệu vạn năm.','Cyborg tay súng tay kiếm, sẵn sàng xóa sổ mọi kháng cự...','Máy dò tàng hình từ trên không thả bom.','Trí Tuệ Tối Cao, bộ não khổng lồ cai trị cả một hành tinh.'],
    // Ch10
    ['Nơi linh thiêng nhất chứa đựng hàng vạn câu thần chú chết người.','Lông vũ đen rơi xuống, báo hiệu thiên thần đã sa ngã.','Thập Tự Giá Vàng đè bẹp những ai không xứng đáng!','Pháp sư tạo ra khoảng không vô cực. Cẩn thận bước hụt!','Tia sáng chói lóa xuyên qua tim, xé nát linh hồn tà ác.','Bóng tối song sinh luôn ở sau lưng ngươi, chực chờ cơ hội.','Thanh kiếm thần cổ, tự động tìm mục tiêu không cần người sử dụng.','Bốn thiên vương canh gác phòng cuối cùng... Bọn họ bất bại.','Cảm giác áp lực đè nát tinh thần... Ngươi dám đi tiếp không?','Nguyên Tôn Sáng Niệm Cổ Thần, nguồn gốc của vạn sự vạn vật. Ngươi... Dám khiêu chiến Thiên Đạo?'],
];

const CHAPTER_DROPS: string[][] = [
    ['exp_potion','exp_stone_sm','stamina_potion'], // Ch1
    ['exp_stone_md','stamina_potion','fire_crystal','water_crystal','earth_crystal','wind_crystal'], // Ch2
    ['exp_stone_lg','hp_potion','mp_potion','fire_crystal','water_crystal','earth_crystal','wind_crystal'], // Ch3
    ['rare_chest','evo_stone','hp_potion','mp_potion','exp_stone_lg'], // Ch4
    ['rare_chest','evo_stone','egg_magic','egg_rare','exp_stone_lg'], // Ch5
    ['rare_chest','evo_stone','exp_stone_lg','egg_rare','fire_crystal','earth_crystal'], // Ch6
    ['rare_chest','evo_stone','exp_stone_lg','egg_epic','water_crystal','wind_crystal'], // Ch7
    ['rare_chest','evo_stone','exp_stone_lg','egg_epic','egg_legendary'], // Ch8
    ['rare_chest','evo_stone','exp_stone_lg','egg_legendary','fire_crystal','wind_crystal'], // Ch9
    ['rare_chest','evo_stone','exp_stone_lg','egg_mythic','egg_legendary'], // Ch10
];

function buildStages(): StageData[] {
    const stages: StageData[] = [];
    for (let ch = 0; ch < 10; ch++) {
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
        let prog: any = await prisma.expeditionProgress.findUnique({ where: { userId } });
        if (!prog) {
            prog = await prisma.expeditionProgress.create({
                data: { userId, maxStage: 0, clearedStages: '[]', lastAttempt: new Date(0), lastClaim: new Date() } as any
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
        const nextStage = getStageById(Math.min(nextStageId, 100));
        const petCP = petService.calcCombatPower(pet);

        const chapterProgress: string[] = [];
        for (let ch = 1; ch <= 10; ch++) {
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
                { name: '🏆 Ải Cao Nhất', value: `**Ải ${prog.maxStage}** / 100`, inline: true },
                { name: '🎯 Ải Tiếp Theo', value: nextStage ? `**${nextStage.name}**\nCP Cần: ${nextStage.requiredCP.toLocaleString()} | Tỉ Lệ Thắng: **${winRate}%**` : '🎉 Đã chinh phục tất cả!', inline: false },
                { name: '⏱️ Trạng Thái', value: onCooldown ? `⏳ Hồi chiêu: còn **${Math.ceil(cooldownMs / 60000)} phút**` : '✅ Sẵn sàng chiến đấu!', inline: false }
            )
            .setFooter({ text: 'Dùng /expedition fight để xuất chinh • /expedition info <số_ải> để xem chi tiết ải' });

        return { embeds: [embed] };
    }

    public async fight(interaction: ChatInputCommandInteraction | ButtonInteraction) {
        const userId = interaction.user.id;
        const petInfo = await prisma.pet.findFirst({ where: { ownerId: userId } });
        if (!petInfo) return { content: '❌ Bạn chưa có sinh vật!' };

        const prog = await this.getProgress(userId);
        const cooldownMs = prog.lastAttempt.getTime() - Date.now() + EXPEDITION_COOLDOWN_MS;
        if (cooldownMs > 0) {
            return { content: `⏳ Sinh vật đang phục hồi sau trận đánh! Còn **${Math.ceil(cooldownMs / 60000)} phút** nữa.` };
        }

        const nextStageId = prog.maxStage + 1;
        if (nextStageId > 100) {
            return { content: '🎉 **Bạn đã chinh phục toàn bộ 100 ải Viễn Chinh!** Thật phi thường!' };
        }

        const stage = getStageById(nextStageId)!;
        const petCP = petService.calcCombatPower(petInfo);
        const ratio = petCP / stage.requiredCP;

        // Auto Pass Check (Out CP x2)
        if (ratio >= 2.0) {
            // Mới: Bỏ qua cooldown 30p khi thắng để qua ải ngay lập tức
            return await this.handleVictory(userId, petInfo, stage, prog, petCP, '⚡ Áp đảo hoàn toàn! (Auto Pass)');
        }

        // --- PVE MANUAL COMBAT LOGIC ---
        const pet = parsePet(petInfo);
        
        // Define Boss Snapshot
        const bossStats = {
            hp: Math.floor(stage.requiredCP * 0.25),
            mp: 100,
            atk: Math.floor(stage.requiredCP * 0.15),
            def: Math.floor(stage.requiredCP * 0.1),
            spd: Math.floor(stage.requiredCP * 0.1)
        };
        const boss: PetSnapshot = {
            ownerId: 'boss',
            name: `❖ ${stage.bossName}`,
            hp: bossStats.hp,
            maxHp: bossStats.hp,
            mp: bossStats.mp,
            maxMp: bossStats.mp,
            atk: bossStats.atk,
            def: bossStats.def,
            spd: bossStats.spd,
            skills: [{ name: 'Sóng Tử Thần', power: 15, cost: 20 }, { name: 'Thống Khổ Trảm', power: 12, cost: 10 }],
            traits: [],
            imageData: '',
            level: Math.floor(stage.requiredCP / 20)
        };

        const log: string[] = [];
        let round = 1;
        let currentTurn: 'pet' | 'boss' = pet.spd >= boss.spd ? 'pet' : 'boss';

        log.push(`**Trận chiến bắt đầu!** Ải ${stage.id} — ${stage.name}`);
        log.push(`🔰 Lượt đầu: **${currentTurn === 'pet' ? pet.name : boss.name}**`);

        // Helper functions for Combat
        const calcDamage = (attacker: PetSnapshot, defender: PetSnapshot, skill: any) => {
            let missChance = 0.05;
            if (defender.spd > attacker.spd) missChance += Math.min(0.30, (defender.spd - attacker.spd) * 0.005);
            if (Math.random() < missChance) return { damage: 0, isCrit: false, isMiss: true };

            const power = skill?.power || 10;
            const rawDamage = (attacker.atk * power) / 20;
            const defReduction = defender.def / (defender.def + 150);
            let damage = Math.max(1, Math.floor(rawDamage * (1 - defReduction)));
            
            const variance = Math.floor(damage * 0.15);
            damage += Math.floor(Math.random() * (variance * 2 + 1)) - variance;
            damage = Math.max(1, damage);

            const critChance = 0.08 + (attacker.spd * 0.0008);
            const isCrit = Math.random() < critChance;
            if (isCrit) damage = Math.floor(damage * 1.4);

            return { damage, isCrit, isMiss: false };
        };

        const buildStatusBar = (current: number, max: number, size = 10) => {
            const filled = Math.round((current / max) * size);
            const empty = size - Math.max(0, filled);
            return '█'.repeat(Math.max(0, filled)) + '░'.repeat(empty);
        };

        const buildBattleEmbed = (turn: 'pet' | 'boss', logArray: string[], r: number) => {
            const activeName = turn === 'pet' ? pet.name : boss.name;
            return new EmbedBuilder()
                .setTitle(`⚔️ Viễn Chinh — Vòng ${r}`)
                .setColor(turn === 'pet' ? 0x3B82F6 : 0xEF4444)
                .setDescription(`*${stage.lore}*`)
                .addFields(
                    { name: `🔵 ${pet.name} (Lv.${pet.level})`, value: `❤️ ${buildStatusBar(pet.hp, pet.maxHp)} ${pet.hp}/${pet.maxHp}\n💙 ${buildStatusBar(pet.mp, pet.maxMp)} ${pet.mp}/${pet.maxMp}\n⚔️ ATK: ${pet.atk} | 🛡️ DEF: ${pet.def}`, inline: true },
                    { name: `🔴 ${boss.name} (Lv.${boss.level})`, value: `❤️ ${buildStatusBar(boss.hp, boss.maxHp)} ${boss.hp}/${boss.maxHp}\n💙 ${buildStatusBar(boss.mp, boss.maxMp)} ${boss.mp}/${boss.maxMp}\n⚔️ ATK: ${boss.atk} | 🛡️ DEF: ${boss.def}`, inline: true },
                    { name: `📋 Log Trận Nhánh (Vòng ${r})`, value: logArray.slice(-6).join('\n') || '—', inline: false }
                )
                .setFooter({ text: `Auto-Combat Resolution (Tối đa 50 lượt)` });
        };

        while (pet.hp > 0 && boss.hp > 0 && round <= 50) {
            let damage = 0;
            let skillName = 'Tấn Công Thường';
            let mpCost = 0;
            let isCrit = false;
            let isMiss = false;

            if (currentTurn === 'pet') {
                let chosenSkill = null;
                const availableSkills = pet.skills.filter((s:any) => pet.mp >= (s.cost || 10));
                if (availableSkills.length > 0 && Math.random() < 0.8) {
                    chosenSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                }

                if (chosenSkill) {
                    mpCost = chosenSkill.cost || 10;
                    skillName = chosenSkill.name;
                    const res = calcDamage(pet, boss, chosenSkill);
                    damage = res.damage; isCrit = res.isCrit; isMiss = res.isMiss;
                } else {
                    const res = calcDamage(pet, boss, { power: 10 });
                    damage = res.damage; isCrit = res.isCrit; isMiss = res.isMiss;
                    if (pet.mp < 10 && availableSkills.length === 0) skillName = 'Hụt Hơi (Không đủ MP)';
                }

                pet.mp = Math.max(0, pet.mp - mpCost);
                boss.hp = Math.max(0, boss.hp - damage);

                if (isMiss) log.push(`💨 **${boss.name}** đã né được chiêu **${skillName}** của ${pet.name}!`);
                else log.push(`${isCrit ? '💥 CRIT! ' : ''}**${pet.name}** dùng **${skillName}** → -${damage} HP cho ${boss.name}`);
            } else {
                let chosenSkill = null;
                const availableBossSkills = boss.skills.filter((s:any) => boss.mp >= (s.cost || 10));
                if (availableBossSkills.length > 0 && Math.random() < 0.6) {
                    chosenSkill = availableBossSkills[Math.floor(Math.random() * availableBossSkills.length)];
                }

                if (chosenSkill) {
                    mpCost = chosenSkill.cost || 10;
                    skillName = chosenSkill.name;
                    const res = calcDamage(boss, pet, chosenSkill);
                    damage = res.damage; isCrit = res.isCrit; isMiss = res.isMiss;
                } else {
                    const res = calcDamage(boss, pet, { power: 10 });
                    damage = res.damage; isCrit = res.isCrit; isMiss = res.isMiss;
                }

                boss.mp = Math.max(0, boss.mp - mpCost);
                pet.hp = Math.max(0, pet.hp - damage);

                if (isMiss) log.push(`💨 **${pet.name}** đã né được đòn **${skillName}** của ${boss.name}!`);
                else log.push(`${isCrit ? '💥 CRIT! ' : ''}**${boss.name}** dùng **${skillName}** → -${damage} HP cho bạn`);
            }

            if (pet.hp <= 0 || boss.hp <= 0) break;

            currentTurn = currentTurn === 'pet' ? 'boss' : 'pet';
            round++;
            pet.mp = Math.min(pet.maxMp, pet.mp + 10);
            boss.mp = Math.min(boss.maxMp, boss.mp + 10);
        }

        if (pet.hp <= 0 || round > 50) {
            await prisma.expeditionProgress.update({
                where: { userId },
                data: { lastAttempt: new Date(Date.now() - EXPEDITION_COOLDOWN_MS + (5 * 60 * 1000)) } 
            });

            const defeatEmbed = buildBattleEmbed(currentTurn, log, round)
                .setTitle(`💀 Thất Bại — ${stage.name}`)
                .setDescription(`**${pet.name}** đã gục ngã trước sự áp đảo của **${stage.bossName}**!`)
                .setFooter({ text: 'Thất bại... Phạt Cooldown 5 phút!' });

            await interaction.editReply({ embeds: [defeatEmbed], components: [] });
            return { content: null };
        } else {
            const rewardPayload = await this.handleVictory(userId, petInfo, stage, prog, petCP, '⚔️ Chiến Thắng Máu Lửa!');
            const victoryEmbed = buildBattleEmbed(currentTurn, log, round)
                .setTitle(`🎉 HUYỀN THOẠI! — Boss Gục Ngã`)
                .setDescription(`**${boss.name}** đã bị tiêu diệt! Chuẩn bị nhận thưởng...`);
            
            // Merge embeds: show combat log AND reward embed
            await interaction.editReply({ embeds: [victoryEmbed, rewardPayload.embeds[0]], components: rewardPayload.components });
            return { content: null };
        }
    }

    private async handleVictory(userId: string, pet: any, stage: StageData, prog: any, petCP: number, titleExtra: string) {
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
            .setDescription(`**${titleExtra}**\n\n*${stage.lore}*`)
            .addFields(
                { name: '🎁 Phần Thưởng', value: rewardLines.join('\n'), inline: false },
                { name: '⚔️ CP', value: `${petCP.toLocaleString()}`, inline: true },
                { name: '🏆 Tiến Độ', value: `Ải ${stage.id}/100`, inline: true }
            );

        const components = [];
        if (nextUp) {
            embed.addFields({ name: '▶️ Ải Tiếp Theo', value: `${nextUp.name} (CP cần: ${nextUp.requiredCP.toLocaleString()})`, inline: false });
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('expedition_next')
                    .setLabel('⚔️ Tiến Lên Ải Tiếp Theo')
                    .setStyle(ButtonStyle.Primary)
            );
            components.push(row);
        } else {
            embed.addFields({ name: '🎉 HOÀN THÀNH', value: 'Bạn đã chinh phục toàn bộ Viễn Chinh!', inline: false });
        }

        embed.setFooter({ text: 'Bạn có thể tiến thẳng vào ải tiếp theo ngay lập tức!' });
        return { embeds: [embed], components };
    }

    public async showStageInfo(stageId: number) {
        const targetStage = getStageById(stageId);
        if (!targetStage) return { content: `❌ Không tìm thấy ải số ${stageId}. Nhập từ 1 đến 50.` };

        const embed = new EmbedBuilder()
            .setTitle(`${targetStage.chapterEmoji} Ải ${targetStage.id} — ${targetStage.bossName}`)
            .setColor(0x8B5CF6)
            .setDescription(`*${targetStage.lore}*`)
            .addFields(
                { name: '📖 Chương', value: `Chương ${targetStage.chapter}: ${targetStage.chapterName}`, inline: true },
                { name: '🛡️ CP Yêu Cầu', value: `**${targetStage.requiredCP.toLocaleString()}**`, inline: true },
                { name: '💰 Thưởng Cơ Bản', value: `~${targetStage.coinBase} Coin | ~${targetStage.expBase} EXP\n(×3 lần đầu chinh phục)`, inline: false },
                { name: '🎁 Bảng Drop Items', value: targetStage.dropPool.map(id => {
                    const si = SHOP_ITEMS.find(i => i.id === id);
                    return si ? `${si.emoji} ${si.name}` : id;
                }).join(' • '), inline: false },
                { name: '📊 Tỉ Lệ Drop', value: `${Math.round(targetStage.dropChance * 100)}%${targetStage.stageInChapter === 10 ? ' (Boss drop cao hơn)' : ''}`, inline: true }
            )
            .setFooter({ text: 'Dùng /expedition fight để chiến đấu ải của bạn' });

        return { embeds: [embed] };
    }

    public async claimAfk(userId: string) {
        const prog = await this.getProgress(userId);
        if (prog.maxStage === 0) {
            return { content: '❌ Bạn chưa vượt qua ải Viễn Chinh nào, không có Chiến Lợi Phẩm AFK để nhận! Hãy dùng `/expedition fight`.' };
        }

        const now = Date.now();
        const diffMs = now - prog.lastClaim.getTime();
        const hoursPassed = Math.min(24, diffMs / 3_600_000); // Max 24h

        if (hoursPassed < 1) {
            const minsLeft = Math.ceil(60 - (diffMs / 60000));
            return { content: `⏳ Tích lũy chưa đủ 1 giờ. Quay lại sau **${minsLeft} phút** nữa để nhận Chiến Lợi Phẩm!` };
        }

        const stage = getStageById(prog.maxStage)!;
        
        // Base rate: 10% of stage base reward per hour
        const coinPerHour = Math.floor(stage.coinBase * 0.1);
        const expPerHour = Math.floor(stage.expBase * 0.1);
        
        const totalCoins = Math.floor(coinPerHour * hoursPassed);
        const totalExp = Math.floor(expPerHour * hoursPassed);

        await prisma.$transaction(async (tx) => {
            await tx.expeditionProgress.update({
                where: { userId },
                data: { lastClaim: new Date() } as any
            });
            await tx.userIdentity.update({
                where: { userId },
                data: { money: { increment: totalCoins } }
            });
        });

        userIdentityService.invalidateCache(userId);

        const pet = await prisma.pet.findFirst({ where: { ownerId: userId } });
        const rewardLines = [
            `⌛ Thời gian tích lũy: **${hoursPassed.toFixed(1)} giờ** (Max: 24h)`,
            `🪙 Nhận được: **+${totalCoins.toLocaleString()} Coin**`,
            `✨ Nhận được: **+${totalExp.toLocaleString()} EXP**`
        ];

        let levelMsg = '';
        if (pet && totalExp > 0) {
            const { levelsGained, messages } = await petService.addExpAndLevelUp(pet.id, totalExp);
            if (levelsGained > 0) levelMsg = '\n\n' + messages.join('\n');
        }

        const embed = new EmbedBuilder()
            .setTitle('🏕️ NHẬN CHIẾN LỢI PHẨM AFK VIỄN CHINH')
            .setColor(0x10B981)
            .setDescription(`Nhờ những nô lệ khai thác ở Ải ${prog.maxStage}, bạn nhận được phần thưởng tự động!\n\n${rewardLines.join('\n')}${levelMsg}`)
            .setFooter({ text: 'AFK Reward tích lũy tối đa 24 giờ. Hãy quay lại thường xuyên!' });

        return { embeds: [embed] };
    }
}

export const expeditionService = new ExpeditionService();
