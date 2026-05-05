import { Router } from 'express';
import { ChannelType, TextChannel } from 'discord.js';
import { prisma } from '../../database/prisma';
import { bot } from '../../bot/client';
import { geminiService } from '../../bot/services/gemini';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const router = Router();

// --- 8D Chat API ---
router.post('/8d-chat', async (req, res) => {
    try {
        const { message, context, tags, stats } = req.body;
        const contextStr = (context && Object.keys(context).length > 0) 
            ? `\n[BỐI CẢNH HIỆN TẠI TRONG VĂN PHÒNG]:\n${Object.entries(context).map(([k, v]) => `- ${k} đang ${v}`).join('\n')}\n` 
            : '';
        const statsStr = (stats && Object.keys(stats).length > 0)
            ? `\n[TRẠNG THÁI HIỆN TẠI]:\n${Object.entries(stats).map(([k, v]: [string, any]) => `- ${k}: Stress ${v.stress}%, Energy ${v.energy}%`).join('\n')}\n(Kịch bản: Stress càng cao chửi càng gắt, muốn đập phá. Energy thấp thì than mệt mỏi, buồn ngủ).\n`
            : '';
        const tagStr = (tags && tags.length > 0)
            ? `\n[QUẢN LÝ NGƯỜI NÓI - BẮT BUỘC]: Người dùng CỐ TÌNH tag đích danh ${tags.join(', ')}! Lần này BẮT BUỘC CHỈ CÓ ${tags.join(', ')} được phép trả lời (mỗi người 1 câu). NHỮNG NGƯỜI KHÁC IM LẶNG TUYỆT ĐỐI không được thêm người nào khác vào danh sách trả lời luyên thuyên!\n`
            : '\n[QUẢN LÝ NGƯỜI NÓI]: Không ai bị tag. Hãy tự động chọn ngẫu nhiên 2 đến 3 thành viên trong Group trả lời bình luận của user.\n';
        const prompt = `Người dùng vừa nói: "${message}".${contextStr}${statsStr}${tagStr}
Thành viên 8D Group gồm: (Tiến Đặng, Quang Huy, Ngọc Tâm, Thái Tài, Hoà Trần).
PHONG CÁCH: cực tục, chửi thề, mỏ hỗn, bựa, xạo loz. Kiểu nói chuyện đường phố Gen Z Việt Nam. Khéo léo lồng ghép bối cảnh nếu có.
MỖI CÂU TỐI ĐA 15 CHỮ (rất ngắn, gọn, cộc lốc).

QUAN TRỌNG: Dựa vào độ hãm lồn khó chịu của câu hỏi hoặc câu trả lời, hãy thay đổi điểm Stress và Energy của MỖI người nói (nếu có). Trả về JSON ARRAY chứa danh sách các câu nói kèm mức thay đổi chỉ số:
CHỈ TRẢ VỀ CHÍNH XÁC MẢNG JSON, KHÔNG CÓ DẤU BACKTICK HAY BẤT CỨ CHỮ NÀO KHÁC BÊN NGOÀI:
[
  {
    "speaker": "Tên",
    "message": "câu ngắn tục",
    "stressDelta": 10,
    "energyDelta": -5
  }
]`;
        const responseData = await geminiService.generateJSON(prompt, null, 'global');
        res.json({ success: true, data: responseData });
    } catch (error: any) {
        console.error("8D Chat API Error:", error?.message || error);
        res.status(500).json({ error: 'Failed to generate 8d chat', details: error?.message });
    }
});

// --- RPG Client APIs ---
router.get('/pets/:userId', async (req, res) => {
    try {
        const pet = await prisma.pet.findFirst({ where: { ownerId: req.params.userId } });
        if (!pet) return res.status(404).json({ error: 'Pet not found' });
        res.json({ ...pet, stats: JSON.parse(pet.stats), skills: JSON.parse(pet.skills), traits: JSON.parse(pet.traits), status: JSON.parse(pet.status) });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/inventory/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const items = await (prisma as any).inventoryItem.findMany({ where: { userId } });
        const identity = await (prisma as any).userIdentity.findUnique({ where: { userId } });
        res.json({ money: identity?.money || 0, items });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/users/:userId/add-coin', async (req, res) => {
    res.status(403).json({ error: 'Tính năng này đã bị tắt.' });
});

router.delete('/admin/cooldown/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const cooldown = await (prisma as any).userEggCooldown.findUnique({ where: { userId } });
        if (!cooldown) return res.status(404).json({ error: 'Không tìm thấy dữ liệu Cooldown của người này.' });
        await (prisma as any).userEggCooldown.delete({ where: { userId } });
        res.json({ success: true, message: 'Đã xóa Cooldown ấp trứng thành công!' });
    } catch (error) {
        console.error("Reset cooldown error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/users/list', authenticateToken, async (req, res) => {
    try {
        const identities = await prisma.userIdentity.findMany({ orderBy: { money: 'desc' } });
        const pets = await prisma.pet.findMany();
        const petMap = new Map<string, any[]>();
        pets.forEach(p => { if (!petMap.has(p.ownerId)) petMap.set(p.ownerId, []); petMap.get(p.ownerId)!.push(p); });
        const enrichedUsers = identities.map((id: any) => ({ ...id, money: id.money || 0, pets: petMap.get(id.userId) || [] }));
        res.json(enrichedUsers);
    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({ error: 'Failed to fetch users', detail: (error as Error).message });
    }
});

router.delete('/users/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        await prisma.pet.deleteMany({ where: { ownerId: userId } });
        await (prisma as any).inventoryItem.deleteMany({ where: { userId } });
        await (prisma as any).userEggCooldown.deleteMany({ where: { userId } });
        await (prisma as any).userIdentity.delete({ where: { userId } });
        res.json({ success: true, message: 'User data wiped successfully.' });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- Server Control Panel ---
router.post('/control-panel/send-message', upload.array('files', 10), async (req, res) => {
    try {
        let { guildId, channelId, content, embed } = req.body;
        if (typeof embed === 'string') { try { embed = JSON.parse(embed); } catch(e) {} }
        if (!guildId || !channelId) return res.status(400).json({ error: 'Missing guildId or channelId' });
        const guild = bot.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found in cache' });
        const channel = guild.channels.cache.get(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) return res.status(400).json({ error: `Channel ${channelId} not found or not a text channel.` });
        const payload: any = {};
        if (content && content.trim() !== '') payload.content = content;
        if (embed && Object.keys(embed).length > 0) payload.embeds = [embed];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
             payload.files = req.files.map(f => ({ attachment: f.buffer, name: f.originalname }));
        }
        if (!payload.content && !payload.embeds && !payload.files?.length) return res.status(400).json({ error: 'Message cannot be completely empty.' });
        await (channel as TextChannel).send(payload);
        res.json({ success: true, message: `Dispatched to #${channel.name}` });
    } catch (error) {
        console.error("Control Panel send error:", error);
        res.status(500).json({ error: 'Failed to send message: ' + (error as Error).message });
    }
});

// --- System Logs ---
router.get('/system-logs', async (req, res) => {
    try {
        const logs = await prisma.systemLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
        res.json(logs);
    } catch (error) {
        console.error("Error fetching system logs:", error);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

// --- Pet Management ---
router.get('/pets', authenticateToken, async (req, res) => {
    try {
        const pets = await prisma.pet.findMany({ orderBy: { createdAt: 'desc' } });
        const userIds = [...new Set(pets.map(p => p.ownerId))];
        const identities = await prisma.userIdentity.findMany({ where: { userId: { in: userIds } } });
        const identityMap = new Map(identities.map(id => [id.userId, id.nickname]));
        res.json(pets.map(pet => ({ ...pet, ownerNickname: identityMap.get(pet.ownerId) || 'Unknown' })));
    } catch (error: any) {
        console.error("Error fetching pets:", error);
        res.status(500).json({ error: 'Failed to fetch pets', detail: error.message });
    }
});

router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        const type = req.query.type as string || 'level';
        if (type === 'coin') {
            return res.json(await prisma.userIdentity.findMany({ orderBy: { money: 'desc' }, take: 10 }));
        } else if (type === 'tower') {
            const data = await prisma.towerProgress.findMany({ orderBy: { maxFloor: 'desc' }, take: 10 });
            const enriched = await Promise.all(data.map(async (r: any) => {
                const id = await prisma.userIdentity.findUnique({ where: { userId: r.userId } });
                return { ...r, nickname: id?.nickname || r.userId };
            }));
            return res.json(enriched);
        } else {
            const data = await prisma.pet.findMany({ orderBy: [{ level: 'desc' }, { exp: 'desc' }], take: 10 });
            const enriched = await Promise.all(data.map(async (p: any) => {
                const id = await prisma.userIdentity.findUnique({ where: { userId: p.ownerId } });
                return { ...p, ownerNickname: id?.nickname || p.ownerId };
            }));
            return res.json(enriched);
        }
    } catch (error: any) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard', detail: error.message });
    }
});

router.get('/tower/:userId', authenticateToken, async (req, res) => {
    try {
        const progress = await prisma.towerProgress.findUnique({ where: { userId: req.params.userId } });
        res.json(progress || { maxFloor: 0, lastClimb: null });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch tower progress', detail: error.message });
    }
});

router.delete('/pets/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.pet.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true, message: 'Pet released successfully.' });
    } catch (error: any) {
        console.error("Error deleting pet:", error);
        res.status(500).json({ error: 'Failed to delete pet' });
    }
});

// --- Couple System ---
router.get('/couple/top', async (req, res) => {
    try {
        const couples = await prisma.couple.findMany({ orderBy: { affection: 'desc' }, take: 10 });
        const enriched = await Promise.all(couples.map(async (c) => {
            const [u1, u2] = await Promise.all([
                prisma.userIdentity.findUnique({ where: { userId: c.user1Id } }),
                prisma.userIdentity.findUnique({ where: { userId: c.user2Id } })
            ]);
            return { ...c, user1Nickname: u1?.nickname || c.user1Id, user2Nickname: u2?.nickname || c.user2Id };
        }));
        res.json(enriched);
    } catch (error: any) {
        console.error("Error fetching top couples:", error);
        res.status(500).json({ error: 'Failed to fetch couples' });
    }
});

router.get('/couple/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const couple = await prisma.couple.findFirst({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } });
        if (!couple) return res.status(404).json({ error: 'Not in a relationship' });
        const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
        const partnerInfo = await prisma.userIdentity.findUnique({ where: { userId: partnerId } });
        res.json({ ...couple, partnerNickname: partnerInfo?.nickname || partnerId, partnerId });
    } catch (error: any) {
        console.error("Error fetching couple:", error);
        res.status(500).json({ error: 'Failed to fetch couple status' });
    }
});

export default router;
