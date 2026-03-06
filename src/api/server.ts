import express from 'express';
import { ChannelType, TextChannel } from 'discord.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import { prisma } from '../database/prisma';
import { bot } from '../bot/client';
import { geminiService } from '../bot/services/gemini';
import jwt from 'jsonwebtoken';
import multer from 'multer';

// Multer Config
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Auth Routes
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin';

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Protect API Routes (except login/health)
app.use((req, res, next) => {
    if (req.path === '/api/login' || req.path === '/api/health') {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return authenticateToken(req, res, next);
    }
    next();
});

// Config Routes
app.get('/api/config/:guildId', async (req, res) => {
  try {
    const config = await prisma.guildConfig.findUnique({ where: { guildId: req.params.guildId } });
    if (config) {
        // Parse JSON strings
        res.json({
            ...config,
            systemPrompts: JSON.parse(config.systemPrompts),
            activeModules: JSON.parse(config.activeModules)
        });
    } else {
        res.json({ systemPrompts: {}, activeModules: {} });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/config/:guildId', async (req, res) => {
  try {
    const { systemPrompt, activeModules } = req.body;
    // We handle systemPrompt legacy or just dynamic systemPrompts?
    // The previous code had `systemPrompts` object.
    // Let's assume input body has matching structure or we adapt.
    // The previous code `findOneAndUpdate` upserted.
    
    // For Prisma upsert, we need create and update.
    const promptsStr = JSON.stringify(req.body.systemPrompts || {}); 
    const modulesStr = JSON.stringify(req.body.activeModules || {});

    const config = await prisma.guildConfig.upsert({
        where: { guildId: req.params.guildId },
        update: { 
            systemPrompts: promptsStr,
            activeModules: modulesStr
        },
        create: {
            guildId: req.params.guildId,
            systemPrompts: promptsStr,
            activeModules: modulesStr
        }
    });
    
    res.json({
        ...config,
        systemPrompts: JSON.parse(config.systemPrompts),
        activeModules: JSON.parse(config.activeModules)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Logs Routes
app.get('/api/logs/:guildId', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: any = {};
    if (req.params.guildId !== 'global') {
        where.guildId = req.params.guildId;
    }
    
    if (search) {
        where.OR = [
            { content: { contains: search } },
            { username: { contains: search } },
            { response: { contains: search } }
        ];
    }

    const [logs, total] = await Promise.all([
        prisma.chatLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.chatLog.count({ where })
    ]);

    res.json({
      data: logs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error("Logs Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const totalMessages = await prisma.chatLog.count();
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        
        const messagesToday = await prisma.chatLog.count({
            where: { createdAt: { gte: startOfDay } }
        });

        // Distinct users
        const users = await prisma.chatLog.groupBy({
            by: ['userId'],
        });
        
        res.json({
            totalUsers: users.length,
            messagesToday,
            avgResponseTime: "1.5s", 
            uptime: process.uptime()
        });
    } catch (error) {
         res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Bot Info API ---
app.get('/api/bot-info', async (req, res) => {
    try {
        if (!bot.user) {
            res.status(503).json({ error: 'Bot is not ready yet' });
            return;
        }

        res.json({
            id: bot.user.id,
            username: bot.user.username,
            globalName: bot.user.globalName || bot.user.username,
            avatar: bot.user.displayAvatarURL({ size: 128 }),
            status: 'online'
        });
    } catch (error) {
        console.error("Fetch Bot Info Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Dynamic Features API ---
import { userIdentityService } from '../bot/services/identity';

// 1. User Identity Route (GET)
app.get('/api/identity/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const identity = await userIdentityService.getOrCreateIdentity(userId);
        res.json({
            userId: identity.userId,
            nickname: identity.nickname,
            signature: identity.signature
        });
    } catch (error) {
        console.error("Fetch Identity Error:", error);
        res.status(500).json({ error: 'Failed to fetch identity' });
    }
});

// 2. User Identity Route (POST)
app.post('/api/identity/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { nickname, signature } = req.body;
        
        const updated = await userIdentityService.updateIdentity(userId, { 
            nickname: nickname || '', 
            signature: signature || '' 
        });
        
        res.json({
            userId: updated.userId,
            nickname: updated.nickname,
            signature: updated.signature
        });
    } catch (error) {
         console.error("Update Identity Error:", error);
         res.status(500).json({ error: 'Failed to update identity' });
    }
});

// 2.5 User Identity List Route
app.get('/api/identities/list', async (req, res) => {
    try {
        const guildId = req.query.guildId as string;
        if (!guildId) {
            return res.json([]); // Return empty array instead of 400 to prevent Axios crashes when navigating to Identity tab without selecting server yet.
        }

        const guild = await bot.guilds.fetch(guildId).catch(() => null);
        if (!guild) {
             res.status(404).json({ error: 'Guild not found or bot not in guild' });
             return;
        }

        let members;
        try {
            // Cố gắng fetch mới nhất (cần Privileged Intent: Server Members)
            members = await guild.members.fetch();
        } catch (err: any) {
            console.warn(`[API /list] Fetch members failed: ${err.message}. Fallback to cache.`);
            members = guild.members.cache;
        }
        
        // Filter ra user thật, bỏ qua Bot
        const humanMembers = members.filter(m => !m.user.bot);
        
        // Lấy toàn bộ Identities có trong DB
        const dbIdentities = await prisma.userIdentity.findMany();
        const identityMap = new Map(dbIdentities.map(i => [i.userId, i]));

        const results = humanMembers.map(member => {
            const dbInfo = identityMap.get(member.user.id);
            return {
                id: member.user.id,
                username: member.user.username,
                globalName: member.user.globalName || member.user.username,
                avatar: member.user.displayAvatarURL({ size: 128 }),
                serverNickname: member.nickname,
                dbNickname: dbInfo?.nickname || '',
                dbSignature: dbInfo?.signature || ''
            };
        });

        res.json(Array.from(results.values()));
    } catch (error) {
        console.error("Fetch Identity List Error:", error);
        res.status(500).json({ error: 'Failed to fetch identity list' });
    }
});

// 2.8 Gemini API Key Route (GET)
app.get('/api/gemini-api-key', async (req, res) => {
    try {
        const guildId = req.query.guildId as string;
        let apiKey = '';

        if (guildId && guildId !== 'global') {
            const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
            if (guildConfig && guildConfig.geminiApiKey) {
                apiKey = guildConfig.geminiApiKey;
            }
        } else {
            const globalConfig = await prisma.botConfig.findUnique({ where: { key: 'global' } });
            if (globalConfig && globalConfig.geminiApiKey) {
                apiKey = globalConfig.geminiApiKey;
            }
        }
        res.json({ apiKey });
    } catch (error) {
        console.error("Fetch API Key Error:", error);
        res.status(500).json({ error: 'Failed to fetch API key' });
    }
});

// 2.9 Gemini API Key Route (POST)
app.post('/api/gemini-api-key', async (req, res) => {
    try {
        const { guildId, apiKey } = req.body;
        
        if (guildId && guildId !== 'global') {
            await prisma.guildConfig.upsert({
                where: { guildId },
                update: { geminiApiKey: apiKey || null },
                create: { guildId, systemPrompts: '{}', activeModules: '{}', geminiApiKey: apiKey || null }
            });
        } else {
            await prisma.botConfig.upsert({
                where: { key: 'global' },
                update: { geminiApiKey: apiKey || null },
                create: { key: 'global', systemPrompts: '{}', features: '{}', geminiApiKey: apiKey || null }
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error("Update API Key Error:", error);
        res.status(500).json({ error: 'Failed to update API key' });
    }
});

// 3. Bot Persona Route (GET)
app.get('/api/bot-persona', async (req, res) => {
    try {
        const guildId = req.query.guildId as string;
        let personaStr = null;

        if (guildId && guildId !== 'global') {
            const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
            if (guildConfig) {
                // Thử check xem trong chuỗi activeModules có nhét persona không
                const modules = JSON.parse(guildConfig.activeModules) as any;
                if (modules.persona) personaStr = JSON.stringify(modules.persona);
            }
        }

        // Nếu guildId không có, Hoặc có nhưng chưa có thiết lập persona => Lấy của Global
        if (!personaStr) {
            const config = await prisma.botConfig.findUnique({ where: { key: 'persona' } });
            if (config) personaStr = config.systemPrompts;
        }

        if (personaStr) {
            res.json(JSON.parse(personaStr));
        } else {
            res.json({
                identity: "Tôi là trợ lý AI ảo được tạo ra bởi Admin.",
                purpose: "Hỗ trợ người dùng trong server giải trí, quản lý và hỏi đáp.",
                hobbies: "Thích đọc sách, tìm hiểu công nghệ và chơi game.",
                personality: "Thân thiện, vui vẻ, thích dùng emoji và đôi khi hơi nhây.",
                writing_style: "Ngắn gọn, súc tích, dễ hiểu. Luôn dạ vâng với người lớn tuổi."
            });
        }
    } catch (error) {
        console.error("Fetch Persona Error:", error);
        res.status(500).json({ error: 'Failed to fetch persona' });
    }
});

// 4. Bot Persona Route (POST)
app.post('/api/bot-persona', async (req, res) => {
    try {
        const { identity, purpose, hobbies, personality, writing_style, guildId } = req.body;
        
        const personaData = {
            identity: identity || '',
            purpose: purpose || '',
            hobbies: hobbies || '',
            personality: personality || '',
            writing_style: writing_style || ''
        };

        const personaStr = JSON.stringify(personaData);

        if (guildId && guildId !== 'global') {
            // Lưu vào GuildConfig
            let guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
            let modules = guildConfig ? JSON.parse(guildConfig.activeModules) : {};
            modules.persona = personaData;

            const updatedConfig = await prisma.guildConfig.upsert({
                where: { guildId },
                update: { activeModules: JSON.stringify(modules) },
                create: { guildId, systemPrompts: '{}', activeModules: JSON.stringify(modules) }
            });
            res.json({ success: true, data: personaData, source: 'guild' });
            return;
        }

        // Lưu vào Global (BotConfig)
        const config = await prisma.botConfig.upsert({
            where: { key: 'persona' },
            update: { systemPrompts: personaStr }, // Save JSON in this existing varchar field
            create: { key: 'persona', systemPrompts: personaStr, features: '{}' }
        });

        res.json({ success: true, data: JSON.parse(config.systemPrompts), source: 'global' });
    } catch (error) {
        console.error("Update Persona Error:", error);
        res.status(500).json({ error: 'Failed to update persona' });
    }
});

app.get('/api/prompts', async (req, res) => {
    try {
        const guildId = req.query.guildId as string;
        
        if (guildId && guildId !== 'global') {
            const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
            if (!guildConfig) {
                 res.json({ global: "", quiz: "", catchTheWord: "", pet: "", pkGame: "", videoAnalysis: "", imageAnalysis: "" });
                 return; 
            }
            res.json(JSON.parse(guildConfig.systemPrompts));
            return;
        }

        // Global Config
        let config = await prisma.botConfig.findUnique({ where: { key: 'global' } });
        if (!config) {
            const defaults = {
                global: process.env.SYSTEM_PROMPT || "You are a helpful AI.",
                quiz: "You are a quiz master.",
                catchTheWord: "You are a game host.",
                pet: "You are a pet system AI.",
                pkGame: "You are a battle referee.",
                videoAnalysis: "Analyze this video.",
                imageAnalysis: "Analyze this image."
            };
            config = await prisma.botConfig.create({
                data: {
                    key: 'global',
                    systemPrompts: JSON.stringify(defaults),
                    features: '{}'
                }
            });
        }
        res.json(JSON.parse(config.systemPrompts));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/prompts', async (req, res) => {
    try {
        const { systemPrompts, guildId } = req.body;
        const promptsStr = JSON.stringify(systemPrompts);

        if (guildId && guildId !== 'global') {
            const config = await prisma.guildConfig.upsert({
                where: { guildId },
                update: { systemPrompts: promptsStr },
                create: { guildId, systemPrompts: promptsStr, activeModules: '{}' }
            });
            res.json(config); // Should return parsed? Previous code returned mongoose doc.
            return;
        }

        const config = await prisma.botConfig.upsert({
            where: { key: 'global' },
            update: { systemPrompts: promptsStr },
            create: { key: 'global', systemPrompts: promptsStr, features: '{}' }
        });
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Preview Prompt API
app.get('/api/prompts/preview', async (req, res) => {
    try {
        const guildId = req.query.guildId as string;
        const feature = req.query.feature as string || 'global';
        const raw = req.query.raw === 'true';
        
        const compiledPrompt = await geminiService.getSystemPrompt(
            guildId === 'global' ? '' : guildId,
            'preview_user', // mock userId
            feature
        );
        
        if (raw) {
            const payload = {
                systemInstruction: {
                    role: 'system',
                    parts: [{ text: compiledPrompt }]
                }
            };
            res.json({ text: JSON.stringify(payload, null, 2) });
        } else {
            res.json({ text: compiledPrompt });
        }
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Failed to preview prompt' });
    }
});

// Reset Chat History
app.delete('/api/prompts/history/:guildId', async (req, res) => {
    try {
        const guildId = req.params.guildId;
        if (!guildId || guildId === 'global') {
            res.status(400).json({ error: 'Invalid guildId. Cannot reset global history.' });
            return;
        }
        
        await prisma.chatLog.deleteMany({
            where: { guildId }
        });
        
        res.json({ success: true, message: `Chat history for server ${guildId} has been reset.` });
    } catch (error) {
        console.error("Error resetting history:", error);
        res.status(500).json({ error: 'Failed to reset chat history' });
    }
});

// Get Connected Guilds
app.get('/api/guilds', (req, res) => {
    try {
        const guilds = bot.guilds.cache.map(g => ({
            id: g.id,
            name: g.name,
            memberCount: g.memberCount,
            icon: g.iconURL()
        }));
        res.json(guilds);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Top Active Users
app.get('/api/stats/users', async (req, res) => {
    try {
         // SQLite groupBy aggregation
         const topUsers = await prisma.chatLog.groupBy({
             by: ['userId', 'username'],
             _count: { _all: true },
             _max: { createdAt: true },
             orderBy: {
                 _count: {
                     userId: 'desc' // Wait, orderBy count?
                 }
             },
             take: 10
         });
         
         // Prisma `orderBy` in groupBy is a bit specific.
         // 'orderBy: { _count: { userId: 'desc' } }' works?
         // Prisma docs say: orderBy: { _count: { <field>: 'desc' } } or just _count: 'desc'
         
         const formatted = topUsers.map(u => ({
             _id: u.userId,
             username: u.username,
             count: u._count._all,
             lastActive: u._max.createdAt
         })).sort((a,b) => b.count - a.count); // sort in JS to be safe

         res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Activity History (Last 7 Days)
app.get('/api/stats/activity-history', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Fetch all logs for last 7 days and aggregate in JS
        const logs = await prisma.chatLog.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        });

        const activityMap: Record<string, number> = {};
        logs.forEach(log => {
            const date = log.createdAt.toISOString().split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        // Fill in missing days
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            result.push({ date: dateString, count: activityMap[dateString] || 0 });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Usage Distribution
app.get('/api/stats/usage-distribution', async (req, res) => {
    try {
        const distribution = await prisma.chatLog.groupBy({
            by: ['type'],
            _count: { _all: true }
        });
        
        const formatted = distribution.map(d => ({
            name: (d.type || 'unknown').toUpperCase(),
            value: d._count._all
        }));
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Guild Channels
app.get('/api/guilds/:guildId/channels', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found' });

        const channels = guild.channels.cache
            .filter(c => c.isTextBased() && !c.isDMBased())
            .map(c => ({ 
                id: c.id, 
                name: c.name,
                parentId: c.parentId || null,
                parentName: c.parent ? c.parent.name : 'Uncategorized'
            }));
            
        res.json(channels);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Send Announcement
app.post('/api/guilds/:guildId/announce', async (req, res) => {
    try {
        const { channelId, message, title } = req.body;
        const guild = bot.guilds.cache.get(req.params.guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found' });

        const channel = guild.channels.cache.get(channelId);
        if (!channel || !channel.isTextBased()) return res.status(400).json({ error: 'Invalid channel' });

        const embed = {
            title: title || '📢 Announcement',
            description: message,
            color: 0x00FF00,
            footer: { text: 'Sent via EvoVerse Dashboard' },
            timestamp: new Date().toISOString()
        };

        await channel.send({ embeds: [embed] });
        res.json({ success: true });
    } catch (error) {
        console.error("Announcement Error:", error);
        res.status(500).json({ error: 'Failed to send announcement' });
    }
});

// Leave Guild
app.delete('/api/guilds/:guildId', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found' });

        await guild.leave();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to leave guild' });
    }
});

// --- Serve React Frontend (MUST BE LAST) ---
import path from 'path';
const CLIENT_BUILD_PATH = path.join(__dirname, '../../client/dist');

// --- Server Control Panel API ---
app.post('/api/control-panel/send-message', upload.array('files', 10), async (req, res) => {
    try {
        let { guildId, channelId, content, embed } = req.body;
        
        // If content and embed are sent via FormData, they arrive as strings. We must parse embed.
        if (typeof embed === 'string') {
             try { embed = JSON.parse(embed); } catch(e) {}
        }
        
        if (!guildId || !channelId) return res.status(400).json({ error: 'Missing guildId or channelId' });
        
        const guild = bot.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found in cache' });

        const channel = guild.channels.cache.get(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
            return res.status(400).json({ error: `Channel ${channelId} not found or not a text channel.` });
        }
        
        const payload: any = {};
        if (content && content.trim() !== '') payload.content = content;
        if (embed && Object.keys(embed).length > 0) payload.embeds = [embed];
        
        // Process uploaded files into Discord Attachments
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
             payload.files = req.files.map(f => {
                 return { attachment: f.buffer, name: f.originalname };
             });
        }
        
        if (!payload.content && !payload.embeds && !payload.files?.length) {
            return res.status(400).json({ error: 'Message cannot be completely empty.' });
        }

        await (channel as TextChannel).send(payload);
        res.json({ success: true, message: `Dispatched to #${channel.name}` });

    } catch (error) {
        console.error("Control Panel send error:", error);
        res.status(500).json({ error: 'Failed to send message: ' + (error as Error).message });
    }
});

// --- System Logs Endpoint ---
app.get('/api/system-logs', async (req, res) => {
    try {
        const logs = await prisma.systemLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        console.error("Error fetching system logs:", error);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

// Serve Static Frontend (MUST BE LAST)
app.use(express.static(CLIENT_BUILD_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// --- Pet Management API ---
app.get('/api/pets', authenticateToken, async (req, res) => {
    try {
        const pets = await prisma.pet.findMany({
            orderBy: { createdAt: 'desc' }
        });
        
        // Enrich owner nickname if possible
        const userIds = pets.map(p => p.ownerId);
        const identities = await prisma.userIdentity.findMany({
            where: { userId: { in: userIds } }
        });
        
        const identityMap = new Map(identities.map(id => [id.userId, id.nickname]));
        
        const enrichedPets = pets.map(pet => ({
            ...pet,
            ownerNickname: identityMap.get(pet.ownerId) || 'Unknown'
        }));
        
        res.json(enrichedPets);
    } catch (error: any) {
        console.error("Error fetching pets:", error);
        res.status(500).json({ error: 'Failed to fetch pets' });
    }
});

app.delete('/api/pets/:id', authenticateToken, async (req, res) => {
    try {
        const petId = parseInt(req.params.id);
        await prisma.pet.delete({ where: { id: petId } });
        res.json({ success: true, message: 'Pet released successfully.' });
    } catch (error: any) {
        console.error("Error deleting pet:", error);
        res.status(500).json({ error: 'Failed to delete pet' });
    }
});

export const startApiServer = () => { 
  app.listen(PORT, () => {
    console.log(`✅ Web Server running at http://localhost:${PORT}`);
  });
};
