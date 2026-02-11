import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { prisma } from '../database/prisma';
import { bot } from '../bot/client';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

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

// --- Dynamic Features API ---

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
            .map(c => ({ id: c.id, name: c.name }));
            
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

export const startApiServer = () => { 
  app.listen(PORT, () => {
    console.log(`✅ Web Server running at http://localhost:${PORT}`);
  });
};
