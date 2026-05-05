import express from 'express';
import { ChannelType, TextChannel } from 'discord.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../database/prisma';
import { bot } from '../bot/client';
import { geminiService } from '../bot/services/gemini';
import { GEMINI_CHAT_CONFIG } from '../config/constants';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { GoogleGenAI } from '@google/genai';

// Multer Config
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

// Global 8D State
interface ChatMessage { speaker: string; message: string; }
const globalMessages: ChatMessage[] = [
  { speaker: 'HỆ THỐNG', message: 'Chào mừng đến với Văn phòng 8D (Real-time). Nhập câu hỏi để bị chửi hội đồng nhé.' }
];
const globalAgentActions: Record<string, string> = {
  'Tiến Đặng': 'Đang ngủ', 'Quang Huy': 'Đang ngủ', 'Ngọc Tâm': 'Đang rảnh', 'Thái Tài': 'Đang ngủ', 'Hoà Trần': 'Đang rảnh'
};

const AUTONOMOUS_STATES = ['Đang ngủ', 'Ăn cứt', 'Sục cặc', 'Đi ỉa', 'Đang rảnh', 'Lướt Tiktok', 'Chơi Game'];
const agentForcedTimeouts: Record<string, NodeJS.Timeout> = {};

setInterval(() => {
    const names = ['Tiến Đặng', 'Quang Huy', 'Ngọc Tâm', 'Thái Tài', 'Hoà Trần'];
    const available = names.filter(n => !agentForcedTimeouts[n]);
    if (available.length > 0) {
        const agent = available[Math.floor(Math.random() * available.length)];
        const newState = AUTONOMOUS_STATES[Math.floor(Math.random() * AUTONOMOUS_STATES.length)];
        
        globalAgentActions[agent] = newState;
        io.emit('agent_action_sync', { agentName: agent, action: newState });
    }
}, 10000);

io.on('connection', (socket) => {
    socket.emit('init_state', { messages: globalMessages, agentActions: globalAgentActions });
    
    socket.on('chat_message', async (data) => {
        const { text, tags } = data;
        const userMsg = { speaker: 'BẠN', message: text };
        globalMessages.push(userMsg);
        if (globalMessages.length > 50) globalMessages.shift();
        io.emit('chat_update', globalMessages);
        
        try {
            const contextStr = `\n[BỐI CẢNH HIỆN TẠI]:\n${Object.entries(globalAgentActions).map(([k, v]) => `- ${k} đang ${v}`).join('\n')}\n`;
            const tagStr = (tags && tags.length > 0)
                ? `\n[QUẢN LÝ NGƯỜI NÓI - BẮT BUỘC]: Người dùng CỐ TÌNH tag đích danh ${tags.join(', ')}! Lần này BẮT BUỘC CHỈ CÓ ${tags.join(', ')} được phép trả lời (mỗi người 1 câu). NHỮNG NGƯỜI KHÁC IM LẶNG TUYỆT ĐỐI không được thêm người nào khác vào danh sách trả lời luyên thuyên!\n`
                : '\n[QUẢN LÝ NGƯỜI NÓI]: Không ai bị tag. Hãy tự động chọn ngẫu nhiên 2 đến 3 thành viên trong Group trả lời bình luận của user.\n';
                
            const prompt = `Người dùng vừa nói: "${text}".${contextStr}\n${tagStr}
Thành viên 8D Group gồm: (Tiến Đặng, Quang Huy, Ngọc Tâm, Thái Tài, Hoà Trần).
PHONG CÁCH: cực tục, chửi thề, mỏ hỗn, bựa, xạo loz. Kiểu nói chuyện đường phố Gen Z Việt Nam. Khéo léo lồng ghép bối cảnh nếu có.
MỖI CÂU TỐI ĐA 15 CHỮ (rất ngắn, gọn, cộc lốc).
QUAN TRỌNG: Dựa vào độ hãm lồn khó chịu của câu hỏi. Trả về JSON ARRAY chứa danh sách các câu nói:
CHỈ TRẢ VỀ CHÍNH XÁC MẢNG JSON, KHÔNG CÓ DẤU BACKTICK HAY BẤT CỨ CHỮ NÀO KHÁC BÊN NGOÀI:
[{"speaker": "Tên", "message": "câu ngắn tục"}]`;
            
            const responseData: any = await geminiService.generateJSON(prompt, null, 'global');
            let responses: any[] = [];
            
            if (Array.isArray(responseData)) {
                responses = responseData;
            } else if (responseData && typeof responseData === 'object') {
                for (const val of Object.values(responseData)) {
                    if (Array.isArray(val)) {
                        responses = val;
                        break;
                    }
                }
                if (responses.length === 0 && responseData.speaker && responseData.message) {
                    responses = [responseData];
                }
            }

            if (responses.length > 0) {
                responses.forEach((msg: any, idx) => {
                    setTimeout(() => {
                        globalMessages.push({ speaker: msg.speaker || 'LỖI', message: msg.message || 'Lỗi parse' });
                        if (globalMessages.length > 50) globalMessages.shift();
                        io.emit('chat_update', globalMessages);
                        if (msg.speaker && msg.message) {
                           io.emit('agent_bubble', { speaker: msg.speaker, text: msg.message });
                        }
                    }, (idx + 1) * 1200);
                });
            } else {
                throw new Error("Dữ liệu trả về không phải Array JSON.");
            }
        } catch (err: any) {
            console.error("Socket Gemini error", err);
            globalMessages.push({ speaker: 'HỆ THỐNG', message: `Lỗi Gemini API: ${err.message}`});
            if (globalMessages.length > 50) globalMessages.shift();
            io.emit('chat_update', globalMessages);
        }
    });

    socket.on('force_action', (data) => {
        const { agentName, action, hardcodedMsg } = data;
        globalAgentActions[agentName] = action;
        if (hardcodedMsg) {
            globalMessages.push({ speaker: agentName, message: hardcodedMsg });
            if (globalMessages.length > 50) globalMessages.shift();
            io.emit('chat_update', globalMessages);
            io.emit('agent_bubble', { speaker: agentName, text: hardcodedMsg });
        }
        io.emit('agent_action_sync', { agentName, action, hardcodedMsg });

        if (action === 'Bắt Đào Than' || action === 'Bị chích điện') {
            if (agentForcedTimeouts[agentName]) {
                clearTimeout(agentForcedTimeouts[agentName]);
            }
            agentForcedTimeouts[agentName] = setTimeout(() => {
                const curseLines = [
                    "Địt mẹ tao đéo làm nữa đâu mệt lồn rồi 🖕", 
                    "Nghỉ tay đéo thể làm chó mãi được 💀", 
                    "Làm lồn làm lắm lồn thế, cho tao đi vệ sinh 🚽", 
                    "Đụ má tao đau tay đéo đào nữa 🤬⛏️",
                    "Thằng lồn nào cứ bạo hành tao xiên chết mẹ giờ 🔪👹",
                    "Đcm cút! Bố mày đình công 🛑"
                ];
                const newState = AUTONOMOUS_STATES[Math.floor(Math.random() * AUTONOMOUS_STATES.length)];
                const curse = curseLines[Math.floor(Math.random() * curseLines.length)];

                globalAgentActions[agentName] = newState;
                globalMessages.push({ speaker: agentName, message: curse });
                if (globalMessages.length > 50) globalMessages.shift();
                
                io.emit('chat_update', globalMessages);
                io.emit('agent_action_sync', { agentName, action: newState, hardcodedMsg: curse });
                io.emit('agent_bubble', { speaker: agentName, text: curse });

                delete agentForcedTimeouts[agentName];
            }, 10000);
        }
    });
});

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

// Protect API Routes (except login/health and web-quiz)
app.use((req, res, next) => {
    if (req.path === '/api/login' || req.path === '/api/health' || req.path === '/api/bot-info' || req.path === '/api/track' || req.path.startsWith('/api/web-quiz/') || req.path === '/api/food-wheel' || req.path === '/api/excuse-generator' || req.path === '/api/handsome-analyzer' || req.path === '/api/cv-reviewer' || req.path.startsWith('/api/music/') || req.path === '/api/8d-chat' || req.path.startsWith('/api/numerology') || req.path.startsWith('/api/gender-quiz') || req.path.startsWith('/api/astrology') || req.path.startsWith('/api/tarot') || req.path === '/api/magic-ball' || req.path === '/api/deep-status' || req.path.startsWith('/api/burnout-check') || req.path.startsWith('/api/weather') || req.path === '/api/poem-generator' || req.path === '/api/chibi-sticker' || req.path.startsWith('/api/face-reader') || req.path.startsWith('/api/dream-interpreter') || req.path.startsWith('/api/tech-duel') || req.path.startsWith('/api/english/') || req.path === '/api/web-chat') {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return authenticateToken(req, res, next);
    }
    next();
});

// --- Weather Proxy (Public) ---
const WEATHER_LAT = 10.8231;
const WEATHER_LON = 106.6297;

app.get('/api/weather/current', async (req, res) => {
    try {
        const apiKey = process.env.APIKEY_WEATHER || '';
        if (!apiKey) return res.status(500).json({ error: 'Weather API key not configured' });
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { lat: WEATHER_LAT, lon: WEATHER_LON, appid: apiKey, units: 'metric', lang: 'vi' }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Weather API Error:', error.message);
        res.status(502).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/api/weather/forecast', async (req, res) => {
    try {
        const apiKey = process.env.APIKEY_WEATHER || '';
        if (!apiKey) return res.status(500).json({ error: 'Weather API key not configured' });
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
            params: { lat: WEATHER_LAT, lon: WEATHER_LON, appid: apiKey, units: 'metric', lang: 'vi' }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Forecast API Error:', error.message);
        res.status(502).json({ error: 'Failed to fetch forecast data' });
    }
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

// --- System Features Toggle Route ---
app.get('/api/features', async (req, res) => {
    try {
        const config = await prisma.botConfig.findUnique({ where: { key: 'global' } });
        if (config && config.features) {
            res.json(JSON.parse(config.features));
        } else {
            res.json({});
        }
    } catch (error) {
        console.error("Fetch Features Error:", error);
        res.status(500).json({ error: 'Failed to fetch features' });
    }
});

app.post('/api/features', async (req, res) => {
    try {
        const payload = req.body;
        
        let config = await prisma.botConfig.findUnique({ where: { key: 'global' } });
        let currentFeatures = {};
        
        if (config && config.features) {
             try { currentFeatures = JSON.parse(config.features); } catch(e){}
        }

        const newFeatures = { ...currentFeatures, ...payload };
        const newFeaturesStr = JSON.stringify(newFeatures);

        const updatedConfig = await prisma.botConfig.upsert({
            where: { key: 'global' },
            update: { features: newFeaturesStr },
            create: { key: 'global', systemPrompts: '{}', features: newFeaturesStr }
        });

        res.json({ success: true, data: JSON.parse(updatedConfig.features) });
    } catch (error) {
        console.error("Update Features Error:", error);
        res.status(500).json({ error: 'Failed to update features' });
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

// --- 8D Chat API ---
app.post('/api/8d-chat', async (req, res) => {
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
        
        // Gọi Gemini Logic chuyên sinh JSON
        const responseData = await geminiService.generateJSON(prompt, null, 'global');
        res.json({ success: true, data: responseData });
    } catch (error: any) {
        console.error("8D Chat API Error:", error?.message || error);
        res.status(500).json({ error: 'Failed to generate 8d chat', details: error?.message });
    }
});

// --- RPG Client APIs ---
app.get('/api/pets/:userId', async (req, res) => {
    try {
        const pet = await prisma.pet.findFirst({
            where: { ownerId: req.params.userId }
        });
        
        if (!pet) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        // Parse JSON fields
        const formattedPet = {
            ...pet,
            stats: JSON.parse(pet.stats),
            skills: JSON.parse(pet.skills),
            traits: JSON.parse(pet.traits),
            status: JSON.parse(pet.status)
        };
        
        res.json(formattedPet);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

 // --- Inventory API ---
app.get('/api/inventory/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const items = await (prisma as any).inventoryItem.findMany({ where: { userId } });
        const identity = await (prisma as any).userIdentity.findUnique({ where: { userId } });
        
        res.json({
            money: identity?.money || 0,
            items: items
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/users/:userId/add-coin', async (req, res) => {
    res.status(403).json({ error: 'Tính năng này đã bị tắt.' });
});

// --- ADMIN API ---
app.delete('/api/admin/cooldown/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const cooldown = await (prisma as any).userEggCooldown.findUnique({ where: { userId } });
        
        if (!cooldown) {
             return res.status(404).json({ error: 'Không tìm thấy dữ liệu Cooldown của người này.' });
        }

        await (prisma as any).userEggCooldown.delete({ where: { userId } });
        res.json({ success: true, message: 'Đã xóa Cooldown ấp trứng thành công!' });
    } catch (error) {
        console.error("Reset cooldown error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/users/list', authenticateToken, async (req, res) => {
    try {
        const identities = await prisma.userIdentity.findMany({ orderBy: { money: 'desc' } });
        const pets = await prisma.pet.findMany();
        const petMap = new Map<string, any[]>();
        pets.forEach(p => {
             if (!petMap.has(p.ownerId)) petMap.set(p.ownerId, []);
             petMap.get(p.ownerId)!.push(p);
        });

        const enrichedUsers = identities.map((id: any) => ({
            ...id,
            money: id.money || 0,
            pets: petMap.get(id.userId) || []
        }));
        
        res.json(enrichedUsers);
    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({ error: 'Failed to fetch users', detail: (error as Error).message });
    }
});

app.delete('/api/users/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Delete related data first (Pets, Inventory, Cooldown)
        await prisma.pet.deleteMany({ where: { ownerId: userId } });
        await (prisma as any).inventoryItem.deleteMany({ where: { userId } });
        await (prisma as any).userEggCooldown.deleteMany({ where: { userId } });
        
        // Delete identity
        await (prisma as any).userIdentity.delete({ where: { userId } });
        
        res.json({ success: true, message: 'User data wiped successfully.' });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: 'Failed to delete user' });
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

// --- Pet Management API ---
app.get('/api/pets', authenticateToken, async (req, res) => {
    try {
        const pets = await prisma.pet.findMany({ orderBy: { createdAt: 'desc' } });
        const userIds = [...new Set(pets.map(p => p.ownerId))];
        const identities = await prisma.userIdentity.findMany({ where: { userId: { in: userIds } } });
        const identityMap = new Map(identities.map(id => [id.userId, id.nickname]));
        const enrichedPets = pets.map(pet => ({ ...pet, ownerNickname: identityMap.get(pet.ownerId) || 'Unknown' }));
        res.json(enrichedPets);
    } catch (error: any) {
        console.error("Error fetching pets:", error);
        res.status(500).json({ error: 'Failed to fetch pets', detail: error.message });
    }
});

app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const type = req.query.type as string || 'level';
        if (type === 'coin') {
            const data = await prisma.userIdentity.findMany({ orderBy: { money: 'desc' }, take: 10 });
            return res.json(data);
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

app.get('/api/tower/:userId', authenticateToken, async (req, res) => {
    try {
        const progress = await prisma.towerProgress.findUnique({ where: { userId: req.params.userId } });
        res.json(progress || { maxFloor: 0, lastClimb: null });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch tower progress', detail: error.message });
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

// --- Couple System API ---
app.get('/api/couple/top', async (req, res) => {
    try {
        const couples = await prisma.couple.findMany({
            orderBy: { affection: 'desc' },
            take: 10
        });
        
        // Enrich with nicknames
        const enriched = await Promise.all(couples.map(async (c) => {
            const [u1, u2] = await Promise.all([
                prisma.userIdentity.findUnique({ where: { userId: c.user1Id } }),
                prisma.userIdentity.findUnique({ where: { userId: c.user2Id } })
            ]);
            return {
                ...c,
                user1Nickname: u1?.nickname || c.user1Id,
                user2Nickname: u2?.nickname || c.user2Id
            };
        }));
        
        res.json(enriched);
    } catch (error: any) {
        console.error("Error fetching top couples:", error);
        res.status(500).json({ error: 'Failed to fetch couples' });
    }
});

app.get('/api/couple/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const couple = await prisma.couple.findFirst({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
        });
        
        if (!couple) return res.status(404).json({ error: 'Not in a relationship' });
        
        const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
        const partnerInfo = await prisma.userIdentity.findUnique({ where: { userId: partnerId } });
        
        res.json({
            ...couple,
            partnerNickname: partnerInfo?.nickname || partnerId,
            partnerId
        });
    } catch (error: any) {
        console.error("Error fetching couple:", error);
        res.status(500).json({ error: 'Failed to fetch couple status' });
    }
});

// --- Web Quiz API ---
import { webQuizService } from '../bot/services/webQuiz';

app.get('/api/web-quiz/rooms', (req, res) => {
    res.json(webQuizService.getPublicRooms());
});

app.post('/api/web-quiz/create', (req, res) => {
    const { creatorName, topic, difficulty, numQuestions, apiKey, timeLimitSecs, tone } = req.body;
    if (!creatorName || !topic || !apiKey) return res.status(400).json({ error: 'Missing info or API Key' });
    const result = webQuizService.createRoom(
         creatorName, 
         topic, 
         difficulty || 'Dễ', 
         numQuestions || 5, 
         apiKey, 
         timeLimitSecs || 15, 
         tone || 'Hài hước, giải trí'
    );
    res.json(result);
});

app.post('/api/web-quiz/join', (req, res) => {
    const { roomId, playerName } = req.body;
    if (!roomId || !playerName) return res.status(400).json({ error: 'Missing info' });
    const result = webQuizService.joinRoom(roomId, playerName);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

app.post('/api/web-quiz/:roomId/start', async (req, res) => {
    const { playerId } = req.body;
    const started = await webQuizService.startRoom(req.params.roomId, playerId);
    res.json({ success: started });
});

app.post('/api/web-quiz/:roomId/next-round', async (req, res) => {
    const { playerId, newTopic, newTone } = req.body;
    if (!newTopic) return res.status(400).json({ success: false, error: 'Missing topic' });
    const started = await webQuizService.nextRound(req.params.roomId, playerId, newTopic, newTone || '');
    res.json({ success: started });
});

app.get('/api/web-quiz/:roomId/stream', (req, res) => {
    webQuizService.addClient(req.params.roomId, res);
});

app.post('/api/web-quiz/:roomId/answer', (req, res) => {
    const { playerId, answer } = req.body;
    const result = webQuizService.submitAnswer(req.params.roomId, playerId, answer);
    res.json(result);
});

// --- Food Wheel API (Phong Thuy) ---
app.post('/api/food-wheel', async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });

        const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });

        const prompt = `Hôm nay là ${today}. Bạn là một thầy phong thuỷ ẩm thực vô tri nhưng rất hài hước và tự tin.
Hãy đề xuất 5 món ăn cho hôm nay theo phong thuỷ ngày này. Cụ thể:
- 3 món ăn dân dã Việt Nam bình thường (ví dụ: cơm nhà, bún bò, bánh mì thịt, phở, hủ tiếu, cháo...)
- 1 món ăn sang hơn một chút nhưng vẫn ĂN ĐƯỢC và BÌNH DÂN như là đi ăn ở tiệm: thịt nướng BBQ kiểu Gogi/Kichi, lẩu Haidilao hoặc lẩu thái, bò né, cơm gà Hội An, sushi conveyor belt, hotpot, dimsum... Không được đề xuất những món quá xa xỉ như bò Wagyu dát vàng, tôm hùm Alaska, caviar. Phải là món người đi làm bình thường có thể tự chi tiêu được.
- 1 món ăn vô lý bất thường hoàn toàn theo kiểu hài hước Việt Nam (ví dụ: mì gói chan với nước ngọt, bánh mì không có gì hết, cháo trắng chấm muối mà tự gọi là "detox 5 sao"...)

Trả về JSON hợp lệ (KHÔNG markdown, KHÔNG \`\`\`json) theo đúng format sau:
{
  "intro": "Câu giới thiệu ngắn hài hước theo phong thuỷ cho ngày hôm nay (1-2 câu)",
  "foods": [
    {
      "name": "Tên món ăn ngắn gọn",
      "emoji": "1 emoji đại diện",
      "type": "normal|fancy|weird",
      "phongThuy": "Lý do phong thuỷ hài hước tại sao nên ăn món này hôm nay (1 câu)",
      "description": "Mô tả món ăn ngắn (1 câu)",
      "luckyAdvice": "Lời khuyên về sức khoẻ, may mắn khi ăn món này (1 câu vui vẻ)"
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned);
        res.json(data);
    } catch (err) {
        console.error('Food wheel error:', err);
        res.status(500).json({ error: 'AI đang ngủ, thầy phong thuỷ mất điện rồi!' });
    }
});

// --- Excuse Generator API ---
app.post('/api/excuse-generator', async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });

        const prompt = `Bạn là một cỗ máy tạo lý do xin nghỉ phép vô tri, hài hước và lầy lội nhất hành tinh.
Hãy sáng tác 1 lý do xin nghỉ phép ngẫu nhiên CỰC KỲ VÔ LÝ nhưng được viết một cách RẤT NGHIÊM TÚC.
Tránh các lý do quá ốm đau bệnh tật thông thường. Hãy bịa ra những tình huống dở khóc dở cười (ví dụ: bị alien bắt cóc, chó cắn mất dép không đi làm được, kẹt thang máy với một con gián...).

Trả về JSON hợp lệ (KHÔNG markdown, KHÔNG \`\`\`json) theo đúng định dạng sau:
{
  "excuse": "Lý do ngắn gọn nhưng đầy tính thuyết phục (1 câu)",
  "bossReaction": "Phản ứng dự kiến của sếp khi nghe lý do này (1 câu hài hước)",
  "successRate": "Một tỷ lệ phần trăm (ví dụ: '12%', '-50%', '99.9%')",
  "template": "Một bức email/tin nhắn mẫu dài 3-4 câu để copy gửi sếp, viết theo giọng điệu nghiêm túc một cách hài hước"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned);
        res.json(data);
    } catch (err) {
        console.error('Excuse generator error:', err);
        res.status(500).json({ error: 'Cỗ máy bị hỏng gạch, sếp bắt đi làm rồi!' });
    }
});

// --- Handsome Analyzer API ---
app.post('/api/handsome-analyzer', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'Chưa có ảnh upload!' });

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

        const text = await geminiService.analyzeHandsome(base64Data, mimeType, req.body.geminiApiKey);
        
        res.json({ result: text });
    } catch (err: any) {
        console.error('Handsome analyzer error:', err.message);
        res.status(500).json({ error: 'AI đang bận đi khám mắt, không thể phân tích nhan sắc lúc này! Trả lại ảnh cho mày.' });
    }
});

// --- CV Reviewer & Rewriter API ---
app.post('/api/cv-reviewer', upload.single('cvFile'), async (req, res) => {
    try {
        const file = req.file;
        const mode = req.body.mode;
        
        if (!file) return res.status(400).json({ error: 'Chưa đính kèm file CV!' });
        if (mode !== 'review' && mode !== 'rewrite') return res.status(400).json({ error: 'Chế độ không hợp lệ.' });

        const customPrompt = req.body.customPrompt || '';
        const reviewContext = req.body.reviewContext ? JSON.parse(req.body.reviewContext) : undefined;
        const customApiKey = req.body.geminiApiKey || '';
        const result = await geminiService.analyzeCV(file.buffer, file.mimetype, file.originalname, mode, customPrompt, reviewContext, customApiKey || undefined);
        
        res.json({ result });
    } catch (err: any) {
        console.error('CV Reviewer error:', err.message);
        res.status(500).json({ error: err.message || 'Lỗi phân tích CV. Vui lòng thử lại.' });
    }
});

// --- Music Player API (Anonymous YouTube Playlist) ---
app.post('/api/music/playlist', async (req, res) => {
    try {
        const { secretCode } = req.body;
        if (!secretCode) return res.status(400).json({ error: 'Missing secretCode' });
        const code = secretCode.trim().toUpperCase();

        let playlist = await prisma.musicPlaylist.findUnique({ where: { secretCode: code } });
        if (!playlist) {
            playlist = await prisma.musicPlaylist.create({
                data: { secretCode: code, name: `Trạm phát ${code}`, songs: "[]" }
            });
        }
        res.json({ ...playlist, songs: JSON.parse(playlist.songs) });
    } catch (err) {
        console.error('Music playlist error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/music/copy', async (req, res) => {
    try {
        const { sourceCode, targetCode } = req.body;
        if (!sourceCode || !targetCode) return res.status(400).json({ error: 'Thiếu thông tin' });
        
        const src = sourceCode.trim().toUpperCase();
        const tgt = targetCode.trim().toUpperCase();

        const sourcePlaylist = await prisma.musicPlaylist.findUnique({ where: { secretCode: src } });
        if (!sourcePlaylist) return res.status(404).json({ error: 'Playlist nguồn không tồn tại' });

        const targetPlaylist = await prisma.musicPlaylist.findUnique({ where: { secretCode: tgt } });
        if (targetPlaylist) {
            await prisma.musicPlaylist.update({
                where: { secretCode: tgt },
                data: { songs: sourcePlaylist.songs }
            });
        } else {
            await prisma.musicPlaylist.create({ 
                data: { secretCode: tgt, name: `Trạm phát ${tgt}`, songs: sourcePlaylist.songs } 
            });
        }

        res.json({ success: true, targetCode: tgt, songs: JSON.parse(sourcePlaylist.songs) });
    } catch (err) {
        console.error('Music copy error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/music/add', async (req, res) => {
    try {
        const { secretCode, youtubeUrl, category } = req.body;
        if (!secretCode || !youtubeUrl) return res.status(400).json({ error: 'Thiếu thông tin' });
        const code = secretCode.trim().toUpperCase();
        
        const folderName = category?.trim() || 'Tất cả';

        // Extract Video ID
        const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const videoId = match ? match[1] : null;
        if (!videoId) return res.status(400).json({ error: 'Link YouTube không hợp lệ' });

        // Try fetch title from Noembed (public oEmbed API)
        let title = 'Bài hát Youtube';
        try {
            const embedRes = await axios.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            if (embedRes.data && embedRes.data.title) {
                title = embedRes.data.title;
            }
        } catch (e) {
            // ignore
        }

        const newSong = {
            id: Date.now().toString(),
            videoId,
            title,
            coverUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            category: folderName
        };

        const playlist = await prisma.musicPlaylist.findUnique({ where: { secretCode: code } });
        if (!playlist) return res.status(404).json({ error: 'Không tìm thấy playlist' });

        const songs = JSON.parse(playlist.songs || "[]");
        songs.push(newSong);

        await prisma.musicPlaylist.update({
            where: { secretCode: code },
            data: { songs: JSON.stringify(songs) }
        });

        res.json(newSong);
    } catch (err) {
        console.error('Music add error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/music/remove', async (req, res) => {
    try {
        const { secretCode, songId } = req.body;
        const code = secretCode.trim().toUpperCase();

        const playlist = await prisma.musicPlaylist.findUnique({ where: { secretCode: code } });
        if (!playlist) return res.status(404).json({ error: 'Không tìm thấy playlist' });

        let songs = JSON.parse(playlist.songs || "[]");
        songs = songs.filter((s: any) => s.id !== songId);

        await prisma.musicPlaylist.update({
            where: { secretCode: code },
            data: { songs: JSON.stringify(songs) }
        });
        res.json({ success: true, songs });
    } catch (err) {
        console.error('Music remove error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Numerology API ---
app.post('/api/numerology', async (req, res) => {
    try {
        const { fullName, birthDate } = req.body;
        if (!fullName || !birthDate) return res.status(400).json({ error: 'Cần nhập Họ tên và Ngày sinh!' });

        const result = await geminiService.analyzeNumerology(fullName, birthDate, req.body.geminiApiKey);
        res.json({ result });
    } catch (err: any) {
        console.error('Numerology API error:', err.message);
        res.status(500).json({ error: 'AI đang thiền định, không thể giải mã thần số lúc này!' });
    }
});

app.post('/api/numerology/chat', async (req, res) => {
    try {
        const { fullName, birthDate, question, numerologyResult, chatHistory } = req.body;
        if (!question || !numerologyResult) return res.status(400).json({ error: 'Thiếu thông tin!' });

        const historyText = (chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.text}`).join('\n');

        const prompt = `Bạn là CHUYÊN GIA THẦN SỐ HỌC AI. Người dùng "${fullName}" (sinh ${birthDate}) vừa xem kết quả thần số học xong và muốn hỏi thêm.

DỮ LIỆU THẦN SỐ HỌC CỦA HỌ (ĐÃ PHÂN TÍCH):
${JSON.stringify(numerologyResult, null, 0)}

${historyText ? `LỊCH SỬ HỘI THOẠI GẦN ĐÂY:\n${historyText}\n` : ''}
CÂU HỎI MỚI: "${question}"

QUY TẮC TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện, chuyên sâu, dựa CHÍNH XÁC vào dữ liệu thần số học ở trên.
- Cá nhân hóa cho ${fullName}, tham chiếu các con số cụ thể của họ.
- Giữ độ dài vừa phải (3-6 câu), đi thẳng vào vấn đề.
- Nếu câu hỏi không liên quan thần số học, nhẹ nhàng kéo về chủ đề và đưa lời khuyên dựa trên số mệnh.
- KHÔNG trả JSON, chỉ trả văn bản thuần.`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });
        const result = await model.generateContent(prompt);
        const answer = result.response.text().trim();

        res.json({ answer });
    } catch (err: any) {
        console.error('Numerology chat error:', err.message);
        res.status(500).json({ error: 'AI đang bận thiền, thử lại nhé!' });
    }
});

// --- Gender Quiz API ---
app.post('/api/gender-quiz/generate', async (req, res) => {
    try {
        const prompt = `Bạn là nhà tâm lý học giới tính hàng đầu thế giới. Tạo ĐÚNG 20 câu hỏi quiz khám phá bản dạng giới, theo những nguyên tắc CỰC KỲ QUAN TRỌNG sau:

=== NGUYÊN TẮC TỐI THƯỢNG ===
1. CÂU HỎI PHẢI DẠNG TÌNH HUỐNG / KỊch bản cụ thể, KHÔNG BAO GIỜ hỏi trực tiếp về giới tính hay sở thích giới.
   VÍ DỤ TỐT: "Bạn đang đi dạo lúc 2h sáng và nghe thấy tiếng khóc trong hẻm tối. Bạn sẽ..."
   VÍ DỤ XẤU: "Bạn thích mặc đồ nam hay nữ?"

2. 4 ĐÁP ÁN PHẢI MƠ HỒ, KHÓ ĐOÁN — người chơi KHÔNG THỂ nhận ra đáp án nào ứng với giới tính nào.
   - TUYỆT ĐỐI KHÔNG theo pattern cố định (VD: A luôn = Nam, B luôn = Nữ)
   - Mỗi câu phải XÁO TRỘN THỨ TỰ ngẫu nhiên
   - Đáp án phải TỰ NHIÊN, đọc như phản ứng thật của con người, KHÔNG gượng ép

3. TRÁNH STEREOTYPE:
   - KHÔNG dùng: "mạnh mẽ = nam", "nhẹ nhàng = nữ", "thích hoa = nữ", "thích xe = nam"
   - Đáp án phải tinh tế, nhiều lớp nghĩa, một người bất kỳ đều có thể chọn bất kỳ đáp án nào
   - Dùng tình huống đời thường: phản ứng xã hội, giấc mơ, xử lý xung đột, mối quan hệ, cảm xúc phức tạp

4. ĐA DẠNG CHỦ ĐỀ (chia đều 20 câu):
   - 4 câu: Phản ứng trong tình huống xã hội bất ngờ
   - 3 câu: Giấc mơ / tưởng tượng / thế giới song song
   - 3 câu: Cách xử lý cảm xúc & xung đột
   - 3 câu: Mối quan hệ & kết nối con người
   - 3 câu: Tình huống giả định / "Nếu bạn là..."
   - 2 câu: Thẩm mỹ, nghệ thuật, biểu đạt bản thân
   - 2 câu: Triết học nhẹ / câu hỏi sâu về bản ngã

5. MỖI ĐÁP ÁN nội bộ AI bạn biết nó map tới xu hướng nào, nhưng TUYỆT ĐỐI KHÔNG viết ra. Chỉ cần 4 đáp án nghe đều hợp lý và thú vị.

6. Viết tiếng Việt, giọng trẻ trung, thân thiện, đôi khi hài hước.

TRẢ VỀ JSON:
[
  { "id": 1, "question": "...", "options": [{ "label": "...", "value": "a" }, { "label": "...", "value": "b" }, { "label": "...", "value": "c" }, { "label": "...", "value": "d" }] },
  ...đúng 20 câu
]`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        const questions = JSON.parse(text);
        res.json({ questions });
    } catch (err: any) {
        console.error('Gender quiz generate error:', err.message);
        res.status(500).json({ error: 'AI đang bận suy ngẫm về giới tính, thử lại nhé!' });
    }
});

app.post('/api/gender-quiz/analyze', async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers) || answers.length === 0) return res.status(400).json({ error: 'Thiếu câu trả lời!' });

        const answersText = answers.map((a: any, i: number) => `Câu ${i+1}: ${a.question}\nTrả lời: ${a.answer}`).join('\n\n');

        const prompt = `Bạn là CHUYÊN GIA TÂM LÝ GIỚI TÍNH hàng đầu. Dựa trên 20 câu trả lời quiz dưới đây, hãy phân tích và xác định bản dạng giới của người này.

CÂU TRẢ LỜI:
${answersText}

PHÂN TÍCH YÊU CẦU:
- Xem xét tổng thể pattern, không dựa vào từng câu riêng lẻ
- Bao gồm cả phổ LGBTQ+: Nam (Cisgender Male), Nữ (Cisgender Female), Non-binary, Genderfluid, Genderqueer, Agender, Bigender, Transgender (MtF/FtM), Two-Spirit, Demigender, Pangender, v.v.
- Đưa ra phân tích khách quan, tôn trọng, không phán xét
- Kết quả phải TRE TRUNG, THÚ VỊ, TÍCH CỰC

TRẢ VỀ JSON (KHÔNG markdown):
{
  "genderIdentity": "<Tên bản dạng giới bằng tiếng Việt + tiếng Anh, VD: Non-binary (Phi nhị phân)>",
  "genderFlag": "<1 emoji đại diện, VD: 🏳️‍🌈, 🏳️‍⚧️, ♂️, ♀️, ⚧️, 🌈>",
  "confidence": <số 0-100>,
  "summary": "<Tóm tắt 2-3 câu về kết quả, thú vị và tích cực>",
  "detailedAnalysis": "<Phân tích chi tiết 5-7 câu dựa trên các câu trả lời, giải thích tại sao đưa ra kết luận này>",
  "traits": ["<5-6 đặc điểm nổi bật của người này dựa trên câu trả lời>"],
  "advice": "<Lời khuyên 3-4 câu về việc khám phá bản thân, tích cực và empowering>",
  "funFact": "<1 fun fact thú vị liên quan đến bản dạng giới này>",
  "spectrum": [
    { "label": "Nam tính (Masculine)", "value": <0-100> },
    { "label": "Nữ tính (Feminine)", "value": <0-100> },
    { "label": "Phi nhị phân (Non-binary)", "value": <0-100> },
    { "label": "Fluid / Linh hoạt", "value": <0-100> }
  ]
}`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        } else {
            if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        }
        res.json({ result: JSON.parse(text) });
    } catch (err: any) {
        console.error('Gender quiz analyze error:', err.message);
        res.status(500).json({ error: 'AI gặp khó khăn khi phân tích, thử lại nhé!' });
    }
});

app.post('/api/gender-quiz/chat', async (req, res) => {
    try {
        const { question, quizResult, chatHistory } = req.body;
        if (!question || !quizResult) return res.status(400).json({ error: 'Thiếu thông tin!' });
        const historyText = (chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.text}`).join('\n');

        const prompt = `Bạn là CHUYÊN GIA TÂM LÝ GIỚI TÍNH thân thiện. Người dùng vừa làm Gender Quiz và nhận kết quả:
- Bản dạng giới: ${quizResult.genderIdentity}
- Confidence: ${quizResult.confidence}%
- Tóm tắt: ${quizResult.summary}
- Phân tích: ${quizResult.detailedAnalysis}

${historyText ? `LỊCH SỬ CHAT:\n${historyText}\n` : ''}
CÂU HỎI: "${question}"

Trả lời bằng tiếng Việt, thân thiện, tôn trọng, tích cực. 3-5 câu. KHÔNG JSON, chỉ văn bản.`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });
        const result = await model.generateContent(prompt);
        res.json({ answer: result.response.text().trim() });
    } catch (err: any) {
        console.error('Gender quiz chat error:', err.message);
        res.status(500).json({ error: 'AI bận, thử lại nhé!' });
    }
});

// --- Astrology API (Tử Vi Đông Phương) ---
app.post('/api/astrology', async (req, res) => {
    try {
        const { fullName, gender, birthDate, birthTime } = req.body;
        if (!fullName || !gender || !birthDate || !birthTime) {
            return res.status(400).json({ error: 'Cần nhập đầy đủ: Họ tên, Giới tính, Ngày sinh, Giờ sinh!' });
        }

        const result = await geminiService.analyzeAstrology(fullName, gender, birthDate, birthTime, req.body.geminiApiKey);
        res.json({ result });
    } catch (err: any) {
        console.error('Astrology API error:', err.message);
        res.status(500).json({ error: err.message || 'Thầy tử vi đang bận tu tiên, vui lòng thử lại sau!' });
    }
});

app.post('/api/astrology/chat', async (req, res) => {
    try {
        const { fullName, gender, birthDate, birthTime, question, astrologyResult, chatHistory } = req.body;
        if (!question || !astrologyResult) return res.status(400).json({ error: 'Thiếu thông tin!' });

        const historyText = (chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'Thầy Tử Vi'}: ${m.text}`).join('\n');

        const prompt = `Bạn là CHIÊM TINH GIA & ĐẠI SƯ TỬ VI ĐẨU SỐ, hãy giải đáp câu hỏi của đương số.
Thông tin đương số: ${fullName}, giới tính ${gender}, sinh ngày ${birthDate} lúc ${birthTime}.
Kết quả Tử Vi đã luận: ${JSON.stringify(astrologyResult)}

${historyText ? `LỊCH SỬ CHAT:\n${historyText}\n` : ''}
NGƯỜI DÙNG HỎI: "${question}"

YÊU CẦU:
- Tham chiếu lá số tử vi đã luận ở trên và đưa ra lời giải đáp cặn kẽ, sâu sắc.
- Giữ phong cách huyền học, có thể dùng một số từ Hán Việt cho huyền bí nhưng phải dễ hiểu.
- KHÔNG trả JSON, chỉ trả văn bản thuần.`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });
        const result = await model.generateContent(prompt);
        const answer = result.response.text().trim();
        res.json({ answer });
    } catch (err: any) {
        console.error('Astrology chat API error:', err.message);
        res.status(500).json({ error: 'Dây thiên cơ đang nhiễu, không phản hồi được!' });
    }
});

// --- Burnout Check API ---
app.post('/api/burnout-check/questions', async (req, res) => {
    try {
        const { jobInfo } = req.body;

        const prompt = `Bạn là CHUYÊN GIA TÂM LÝ NGHỀ NGHIỆP sáng tạo. Tạo bộ 10 câu hỏi khảo sát burnout ĐỘC ĐÁO, THÚ VỊ, KHÔNG NHẠT.

${jobInfo ? `CÔNG VIỆC CỦA NGƯỜI DÙNG: "${jobInfo}" — hãy tuỳ chỉnh 2-3 câu hỏi cho phù hợp ngành nghề này.` : 'Không biết ngành nghề — hỏi chung.'}

QUY TẮC TẠO CÂU HỎI:
- KHÔNG hỏi kiểu "Bạn có mệt không?" nhạt nhẽo. Phải SẮC SẢO, ĐI VÀO THỰC TẾ.
- Dùng tình huống CỤ THỂ, gần gũi đời thực (VD: "Khi alarm báo thức sáng thứ 2, phản ứng đầu tiên của bạn là gì?")
- Mỗi câu có 4 lựa chọn A/B/C/D từ nhẹ → nặng, MỖI LỰA CHỌN phải hài hước và relatable.
- Trộn đều 4 khía cạnh: Thể chất, Tinh thần, Mối quan hệ công sở, Động lực nghề nghiệp.
- Giọng văn Gen Z, hài hước nhưng chạm đúng vấn đề.

BẮT BUỘC TRẢ VỀ JSON:
{
  "questions": [
    {
      "id": 1,
      "text": "<Câu hỏi tình huống thú vị>",
      "category": "<physical / mental / social / motivation>",
      "options": [
        { "label": "A", "text": "<Lựa chọn nhẹ — vẫn ổn>", "score": 1 },
        { "label": "B", "text": "<Hơi có vấn đề>", "score": 2 },
        { "label": "C", "text": "<Đang burnout>", "score": 3 },
        { "label": "D", "text": "<Cháy sạch rồi>", "score": 4 }
      ]
    }
  ]
}`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Burnout questions error:', err.message);
        res.status(500).json({ error: 'AI đang nghĩ câu hỏi, thử lại nhé!' });
    }
});

app.post('/api/burnout-check/analyze', async (req, res) => {
    try {
        const { answers, jobInfo, totalScore, maxScore } = req.body;
        if (!answers || !Array.isArray(answers)) return res.status(400).json({ error: 'Thiếu câu trả lời!' });

        const prompt = `Bạn là CHUYÊN GIA TÂM LÝ NGHỀ NGHIỆP kết hợp phong cách Gen Z hài hước nhưng thấu hiểu sâu sắc.

THÔNG TIN CÔNG VIỆC: ${jobInfo || 'Không cung cấp'}

KẾT QUẢ KHẢO SÁT BURNOUT:
${answers.map((a: any) => `• [${a.category}] ${a.question} → Chọn: "${a.chosen}" (${a.score}/4)`).join('\n')}

TỔNG ĐIỂM: ${totalScore}/${maxScore} (${Math.round((totalScore / maxScore) * 100)}%)

PHÂN TÍCH THẬT SÂU VÀ TRẢ VỀ JSON:
{
  "burnoutLevel": <0-100 phần trăm burnout>,
  "verdict": "<XANH (0-30%: Ổn) / VÀNG (31-60%: Cảnh báo) / ĐỎ (61-85%: Burnout) / TÍM (86-100%: Cháy sạch rồi)>",
  "verdictEmoji": "<emoji phù hợp>",
  "title": "<Tiêu đề hài hước nhưng chính xác>",
  "analysis": "<Phân tích 4-5 câu dựa trên PATTERN câu trả lời — chỉ ra khía cạnh nào đang tệ nhất (thể chất/tinh thần/xã hội/động lực)>",
  "redFlags": ["<2-3 dấu hiệu đáng lo nhất từ câu trả lời>"],
  "shouldQuit": "<stay / consider / honest>",
  "quitAdvice": "<3-4 câu tư vấn THẲNG THẮN có nên nghỉ việc không, dựa trên mức độ burnout>",
  "selfCare": ["<4 lời khuyên chăm sóc bản thân CỤ THỂ, HÀNH ĐỘNG ĐƯỢC>"],
  "funFact": "<1 câu quote/fun fact hài hước nhưng thấm về burnout>"
}`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Burnout analyze error:', err.message);
        res.status(500).json({ error: 'AI cũng burnout rồi, thử lại nhé!' });
    }
});


// --- Deep Status Generator API ---
app.post('/api/deep-status', async (req, res) => {
    try {
        const { context, style, language } = req.body;
        if (!context?.trim()) return res.status(400).json({ error: 'Nhập tâm trạng/ngữ cảnh đi!' });

        const lang = language === 'en' ? 'English' : 'Tiếng Việt';
        const styleMap: Record<string, string> = {
          deep: 'Sâu lắng, triết lý, đau đớn nhẹ nhàng',
          funny: 'Hài hước tự giễu, tự châm biếm',
          savage: 'Gắt gỏng, thả thính ngầm, slay',
          poetic: 'Thơ mộng, lãng mạn, CÓ VẦN ĐIỆU rõ ràng',
          chill: 'Bình thản, kệ hết, vibe sống chậm',
        };
        const styleDesc = styleMap[style] || styleMap.deep;

        const prompt = `Bạn là CHUYÊN GIA tạo status/caption mạng xã hội cực "deep", viral, đầy nghệ thuật ngôn từ.

NGỮ CẢNH/TÂM TRẠNG: "${context.trim()}"
PHONG CÁCH: ${styleDesc}
NGÔN NGỮ OUTPUT: ${lang}

QUY TẮC:
1. Tạo ĐÚNG 5 status khác nhau.
2. Mỗi status 1-3 câu, NGẮN GỌN, đọc xong phải "ồ deep ghê".
3. BẮT BUỘC dùng KỸ THUẬT VĂN HỌC — mỗi status ít nhất 1:
   - ẨN DỤ (Metaphor): So sánh ngầm sâu sắc
   - HOÁN DỤ (Metonymy): Bộ phận thay tổng thể
   - PUNCHLINE VẦN: Câu cuối có vần, catchy, đọc "đã tai" (VD: "Yêu em là lỗi, mà quên em là tội")
   - TƯƠNG PHẢN (Antithesis): 2 ý đối lập cạnh nhau
   - CHƠI CHỮ (Wordplay): Đồng âm, đa nghĩa, twist
4. ${language === 'en' ? 'Write in literary English. Think Rupi Kaur, Atticus style.' : 'Viết tiếng Việt tự nhiên, có thể mix tiếng Anh.'}
5. Emoji TIẾT CHẾ (tối đa 1-2 mỗi status). MỖI status góc nhìn KHÁC NHAU.

BẮT BUỘC TRẢ VỀ JSON:
{
  "statuses": [
    { "text": "<status>", "mood": "<melancholy/hopeful/savage/dreamy/numb/fierce/peaceful>", "technique": "<metaphor/metonymy/rhyme/antithesis/wordplay>" }
  ]
}`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Deep Status error:', err.message);
        res.status(500).json({ error: 'Cảm xúc quá sâu, AI xử lý không kịp!' });
    }
});

// --- Magic 8 Ball API ---
app.post('/api/magic-ball', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question?.trim()) return res.status(400).json({ error: 'Hãy đặt một câu hỏi!' });

        const prompt = `Bạn là QUẢ CẦU PHA LÊ HUYỀN BÍ (Magic 8 Ball) cổ đại. Bạn trả lời câu hỏi Yes/No bằng phong cách tiên tri bí ẩn.

CÂU HỎI: "${question.trim()}"

QUY TẮC:
- Trả lời NGẮN GỌN tối đa 2 câu.
- Giọng huyền bí, tiên tri, đôi khi mỉa mai nhẹ nhàng.
- Có thể trả lời Có/Không/Có thể/Chưa chắc — giống Magic 8 Ball thật.
- Thêm 1 emoji phù hợp ở đầu câu.
- KHÔNG dùng markdown, chỉ text thuần.

BẮT BUỘC TRẢ VỀ JSON (không backtick):
{
  "answer": "<Câu trả lời tiên tri 1-2 câu>",
  "type": "<positive / negative / neutral>",
  "emoji": "<1 emoji phù hợp>"
}`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Magic Ball error:', err.message);
        res.status(500).json({ error: 'Cầu pha lê đang mờ, thử lại nhé!' });
    }
});

// --- Tarot AI API ---
app.post('/api/tarot', async (req, res) => {
    try {
        const { topic, question, drawnCards } = req.body;
        if (!topic || !drawnCards || !Array.isArray(drawnCards) || drawnCards.length !== 3) {
            return res.status(400).json({ error: 'Cần chọn chủ đề và rút đúng 3 lá bài!' });
        }

        const result = await geminiService.analyzeTarot(topic, question || '', drawnCards, req.body.geminiApiKey);
        res.json({ result });
    } catch (err: any) {
        console.error('Tarot API error:', err.message);
        res.status(500).json({ error: err.message || 'Pháp sư đang nhập định, không thể giải bài lúc này!' });
    }
});

app.post('/api/tarot/chat', async (req, res) => {
    try {
        const { question, tarotResult, drawnCards, chatHistory } = req.body;
        if (!question || !tarotResult) return res.status(400).json({ error: 'Thiếu thông tin!' });

        const historyText = (chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'Pháp Sư'}: ${m.text}`).join('\n');
        const cardsText = (drawnCards || []).map((c: any) => `${c.position}: ${c.nameVi} (${c.name}) - ${c.isReversed ? 'Ngược' : 'Xuôi'}`).join(', ');

        const prompt = `Bạn là PHÁP SƯ TAROT HUYỀN BÍ, đang giải đáp thêm cho người rút bài.

BÀI ĐÃ RÚT: ${cardsText}
KẾT QUẢ ĐÃ GIẢI: ${JSON.stringify(tarotResult)}

${historyText ? `LỊCH SỬ CHAT:\n${historyText}\n` : ''}
NGƯỜI DÙNG HỎI: "${question}"

YÊU CẦU:
- Trả lời dựa trên kết quả Tarot đã giải ở trên, tham chiếu cụ thể các lá bài.
- Giọng huyền bí, sâu sắc nhưng dễ hiểu.
- Có thể mở rộng thêm ý nghĩa chưa được đề cập.
- 3-6 câu, đi thẳng vào vấn đề.
- KHÔNG trả JSON, chỉ trả văn bản thuần.`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });
        const result = await model.generateContent(prompt);
        const answer = result.response.text().trim();
        res.json({ answer });
    } catch (err: any) {
        console.error('Tarot chat error:', err.message);
        res.status(500).json({ error: 'Pháp sư đang thiền, thử lại nhé!' });
    }
});

app.post('/api/poem-generator', async (req, res) => {
    try {
        const { poemType, style, context, wish, mood, lineCount, language, keywords } = req.body;
        if (!poemType) return res.status(400).json({ error: 'Chọn thể loại thơ!' });

        const lang = language === 'en' ? 'English' : 'Tiếng Việt';
        const poemTypeMap: Record<string, string> = {
            'luc-bat': 'Lục bát (câu 6 chữ xen câu 8 chữ, vần chân)',
            'tu-do': 'Thơ tự do (không giới hạn chữ, tự nhiên)',
            '5-chu': 'Thơ 5 chữ (mỗi câu 5 chữ)',
            '7-chu': 'Thơ 7 chữ (mỗi câu 7 chữ, vần điệu chuẩn)',
            '8-chu': 'Thơ 8 chữ (mỗi câu 8 chữ)',
            'duong-luat': 'Thơ Đường luật (bát cú, thất ngôn, niêm luật chặt)',
            'song-that-luc-bat': 'Song thất lục bát (2 câu 7 chữ rồi 1 cặp lục bát)',
            'haiku': 'Haiku (3 dòng: 5-7-5 âm tiết)',
            'sonnet': 'Sonnet (14 dòng, vần abab cdcd efef gg)',
        };
        const styleMap: Record<string, string> = {
            'lang-man': 'Lãng mạn, bay bổng, đầy cảm xúc yêu thương',
            'tru-tinh': 'Trữ tình, sâu lắng, chạm đến tâm hồn',
            'hien-dai': 'Hiện đại, phá cách, ngôn ngữ đời thường',
            'co-dien': 'Cổ điển, trang nghiêm, dùng từ Hán-Việt',
            'hai-huoc': 'Hài hước, dí dỏm, vui tươi',
            'triet-ly': 'Triết lý, suy tư, chiêm nghiệm cuộc đời',
            'bi-ai': 'Bi ai, buồn bã, đau thương',
            'hung-trang': 'Hùng tráng, mạnh mẽ, khí phách',
        };

        const poemTypeDesc = poemTypeMap[poemType] || poemType;
        const styleDesc = styleMap[style] || style || 'Tự do';

        const rulesByType: Record<string, string> = {
            'luc-bat': `LUẬT LỤC BÁT (BẮT BUỘC):
- Cấu trúc: Câu 6 chữ xen kẽ câu 8 chữ. Bắt đầu bằng câu 6.
- VẦN: Chữ thứ 6 của câu 6 PHẢI CÙNG VẦN với chữ thứ 6 của câu 8 (vần bằng). Chữ thứ 8 của câu 8 PHẢI CÙNG VẦN với chữ thứ 6 của câu 6 tiếp theo.
- THANH: Chữ thứ 6 câu 6 = BẰNG. Chữ thứ 6 câu 8 = BẰNG. Chữ thứ 8 câu 8 = BẰNG. Chữ thứ 4 câu 6 = TRẮC. Chữ thứ 4 câu 8 = TRẮC.
- Thanh BẰNG: các dấu ngang (không dấu), huyền. Thanh TRẮC: sắc, hỏi, ngã, nặng.
- VÍ DỤ CHUẨN: "Trăm năm trong cõi người ta(B) / Chữ tài chữ mệnh khéo là(B) ghét nhau(B)"
- SAU KHI VIẾT: Đếm lại TỪNG CÂU, xác nhận câu 6 đúng 6 chữ, câu 8 đúng 8 chữ. Kiểm tra vần giữa các cặp câu.`,
            'tu-do': `THƠ TỰ DO: Không bắt buộc vần/nhịp cố định nhưng cần nhịp điệu tự nhiên, có nhạc tính nội tại. Ưu tiên hình ảnh và cảm xúc.`,
            '5-chu': `THƠ 5 CHỮ: Mỗi câu ĐÚNG 5 chữ (đếm kỹ). Vần chân hoặc vần cách. Nhịp 2/3 hoặc 3/2. SAU KHI VIẾT: Đếm lại từng câu phải đúng 5 chữ.`,
            '7-chu': `THƠ 7 CHỮ: Mỗi câu ĐÚNG 7 chữ (đếm kỹ). Thường gieo vần ở câu 1-2-4 (hoặc 2-4-6-8). Nhịp 4/3 hoặc 3/4. SAU KHI VIẾT: Đếm lại từng câu phải đúng 7 chữ.`,
            '8-chu': `THƠ 8 CHỮ: Mỗi câu ĐÚNG 8 chữ (đếm kỹ). Vần chân liền hoặc cách. Nhịp 3/2/3 hoặc 3/3/2. SAU KHI VIẾT: Đếm lại từng câu phải đúng 8 chữ.`,
            'duong-luat': `THƠ ĐƯỜNG LUẬT THẤT NGÔN BÁT CÚ:
- ĐÚNG 8 câu, mỗi câu ĐÚNG 7 chữ.
- VẦN: Gieo vần bằng ở cuối câu 1-2-4-6-8. Các câu 3,5,7 cuối câu là thanh trắc.
- ĐỐI: Câu 3-4 ĐỐI NHAU (đối ý + đối từ). Câu 5-6 ĐỐI NHAU.
- BỐ CỤC: Câu 1-2 (đề), Câu 3-4 (thực), Câu 5-6 (luận), Câu 7-8 (kết).
- NIÊM: Chữ thứ 2 câu 1 niêm với chữ thứ 2 câu 8, câu 2 niêm câu 3, câu 4 niêm câu 5, câu 6 niêm câu 7.
- SAU KHI VIẾT: Đếm đúng 8 câu × 7 chữ. Kiểm tra đối ở câu 3-4 và 5-6.`,
            'song-that-luc-bat': `SONG THẤT LỤC BÁT:
- Cấu trúc lặp: 2 câu 7 chữ + 1 cặp lục bát (6-8).
- Câu 7 thứ nhất vần với câu 7 thứ hai. Câu 7 thứ hai vần với câu 6. Câu 6 vần với câu 8 theo luật lục bát.
- SAU KHI VIẾT: Đếm 7-7-6-8 cho mỗi khổ.`,
            'haiku': `HAIKU:
- ĐÚNG 3 dòng: dòng 1 = 5 âm tiết, dòng 2 = 7 âm tiết, dòng 3 = 5 âm tiết.
- Tiếng Việt: mỗi chữ = 1 âm tiết. Đếm số CHỮ mỗi dòng.
- Nội dung: hình ảnh thiên nhiên, khoảnh khắc, gợi cảm xúc sâu trong sự tối giản.
- SAU KHI VIẾT: Đếm lại 5-7-5 chữ chính xác.`,
            'sonnet': `SONNET:
- ĐÚNG 14 dòng. Vần: abab cdcd efef gg (Shakespeare) hoặc abbaabba cdecde (Petrarch).
- 3 khổ 4 dòng + 1 couplet kết (2 dòng).
- SAU KHI VIẾT: Đếm đúng 14 dòng, kiểm tra vần.`,
        };

        const typeRule = rulesByType[poemType] || rulesByType['tu-do'] || '';

        const prompt = `Bạn là ĐẠI THI HÀO — bậc thầy thi ca ${lang === 'English' ? 'phương Tây' : 'Việt Nam'} với 50 năm kinh nghiệm sáng tác.

=== NHIỆM VỤ ===
Sáng tác 1 bài thơ thể loại "${poemTypeDesc}" theo phong cách "${styleDesc}".

=== THÔNG TIN BỔ SUNG ===
${context ? `Bối cảnh: ${context.trim()}` : ''}
${wish ? `Mong muốn: ${wish.trim()}` : ''}
${mood ? `Tâm trạng: ${mood}` : ''}
${keywords ? `Từ khóa phải có: ${keywords}` : ''}
Số câu: ${lineCount || 'theo chuẩn thể loại'}
Ngôn ngữ: ${lang}

=== LUẬT THƠ — ĐỌC KỸ VÀ TUÂN THỦ TUYỆT ĐỐI ===
${typeRule}

=== QUY TẮC CHUNG ===
1. KHÔNG BAO GIỜ sai số chữ mỗi câu. Đếm lại TỪNG CÂU trước khi trả kết quả.
2. KHÔNG BAO GIỜ sai vần. Hai chữ cùng vần = cùng phần vần (VD: "ta" vần với "là", "hoa" vần với "xa" — SAI vì "oa" ≠ "a").
3. Thơ phải có HỒN — hình ảnh sống động, cảm xúc chân thật, không sáo rỗng.
4. Sử dụng biện pháp tu từ tự nhiên: ẩn dụ, nhân hoá, so sánh, điệp ngữ.
5. Từ ngữ phải mượt mà, tránh ép vần gượng gạo.

=== KIỂM TRA TRƯỚC KHI TRẢ VỀ ===
- Đếm số chữ từng câu có đúng quy định không?
- Vần có khớp đúng vị trí không?
- Nếu Đường luật: câu 3-4 và 5-6 có đối không?
- Nếu Lục bát: thanh bằng/trắc có đúng không?
- Đọc lại toàn bài xem có vần nào bị ép không?

BẮT BUỘC TRẢ VỀ JSON (không markdown, không giải thích ngoài JSON):
{
  "title": "<tên bài thơ>",
  "poem": "<bài thơ hoàn chỉnh, mỗi dòng cách nhau bằng \\n>",
  "explanation": "<giải thích ý nghĩa 2-3 câu>",
  "techniques": ["<liệt kê biện pháp tu từ đã dùng>"],
  "ruleCheck": "<tự kiểm tra: liệt kê số chữ từng câu và vần đã gieo>"
}`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Poem Generator error:', err.message);
        res.status(500).json({ error: 'Thi hứng đang dở dang, thử lại nhé!' });
    }
});

app.post('/api/chibi-sticker', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Vui lòng upload ảnh!' });

        const { mode, chibiStyle, poses, background, geminiApiKey, aiModel } = req.body;
        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const allowedModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'];
        const selectedModel = allowedModels.includes(aiModel) ? aiModel : 'gemini-2.5-flash-image';

        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype as string;

        const parsedPoses: string[] = JSON.parse(poses || '[]');
        const poseList = parsedPoses.length > 0 ? parsedPoses : [
            'Vẫy tay chào', 'Cầm quà tặng', 'Ôm gấu bông',
            'Cầm trái tim', 'Cầm bóng bay', 'Selfie',
            'Ăn vặt cookie', 'Ngủ gật', 'Ăn mừng với nón party'
        ];

        const styleMap: Record<string, string> = {
            'kawaii': 'Kawaii chibi (oversized head 3:1, large sparkly eyes, tiny body, pastel colors)',
            'anime-sd': 'Anime SD / Super Deformed (2-head tall, bold outlines, dynamic poses)',
            'line-sticker': 'LINE Sticker style (clean vector, bold outline, flat colors, minimal shading)',
            'cartoon': 'Cartoon chibi (round face, exaggerated expressions, vibrant colors)',
            'pixel': 'Pixel art chibi (16-bit retro, blocky, nostalgic)',
        };
        const bgMap: Record<string, string> = {
            'transparent': 'transparent/white background for easy cropping',
            'white': 'clean pure white background',
            'gradient': 'soft pastel gradient background',
        };

        const styleDesc = styleMap[chibiStyle] || styleMap['kawaii'];
        const bgDesc = bgMap[background] || bgMap['transparent'];
        const isFromReal = mode !== 'chibi-ref';

        const poseGrid = poseList.slice(0, 9).map((p, i) => `${i + 1}. ${p}`).join('\n');

        const prompt = `${isFromReal
            ? 'Look at this photo of a real person. Create a chibi/sticker version that preserves their key features (hair, glasses, clothing, accessories).'
            : 'Look at this chibi character reference. Create sticker variations keeping the EXACT same character design.'}

Generate a 3x3 GRID image (3 columns, 3 rows) containing 9 separate chibi stickers of this character.

Each sticker shows a DIFFERENT pose/action:
${poseGrid}

Style: ${styleDesc}
Background: ${bgDesc}
Each sticker cell should be clearly separated with consistent sizing.
Keep character features CONSISTENT across all 9 poses.
Sticker quality: clean, bold outlines, suitable for messaging apps.
Do NOT add any text labels.`;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: selectedModel,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType, data: imageBase64 } }
                    ]
                }
            ],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            }
        });

        const images: string[] = [];
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    images.push(part.inlineData.data);
                }
            }
        }

        if (images.length === 0) {
            return res.status(500).json({ error: 'AI không tạo được hình, thử lại nhé!' });
        }

        res.json({ images, gridMode: true });
    } catch (err: any) {
        console.error('Chibi Sticker error:', err.message);
        const msg = err.message?.includes('SAFETY') ? 'Ảnh bị chặn bởi bộ lọc an toàn, thử ảnh khác nhé!' : 'Lỗi tạo sticker, thử lại nhé!';
        res.status(500).json({ error: msg });
    }
});

app.post('/api/face-reader', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Vui lòng upload ảnh khuôn mặt!' });
        
        const apiKey = req.body.geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype as string;

        const prompt = `Bạn là Tướng Thuật Đại Sư — một bậc thầy nhân tướng học phương Đông (nắm vững lý thuyết Tam Đình, Ngũ Quan, 12 Cung) kiêm "chuyên gia soi mói" trên mạng. Bạn sở hữu đôi mắt âm dương có thể nhìn thấu vận mệnh qua từng đường nét trên khuôn mặt.

NHIỆM VỤ: Hãy phân tích CỰC KỲ CHI TIẾT bức ảnh khuôn mặt này. Phải vận dụng thuật ngữ chuyên môn (Tam đình, Ngũ quan, Cung Tài Bạch, Cung Phu Thê, Cung Tật Ách) kết hợp với ngôn ngữ Gen Z hài hước, mỏ hỗn. KHÔNG trả lời chung chung.

BỐ CỤC BẮT BUỘC (Mỗi phần viết ít nhất 4-5 câu dài phân tích sâu):

1. Tổng Quan Tam Đình & Khí Sắc (Tiền - Trung - Hậu vận):
Soi Thượng đình (trán), Trung đình (từ chân mày đến chân mũi), Hạ đình (từ nhân trung đến cằm). Đánh giá tổng quan cuộc đời từ nhỏ đến già. Khí sắc hiện tại (tươi tắn hay u ám)? Đang trong thời kỳ rực rỡ hay chuẩn bị "đóng họ" cho tư bản?

2. Cung Quan Lộc & Tài Bạch (Sự nghiệp & Tiền bạc):
Phân tích kỹ Thẩm biện quan (Mũi - chuẩn đầu, cánh mũi), Trán và Gò má. Tướng này là CEO tương lai hay nhân viên quèn chạy deadline? Dòng tiền ra vào như thế nào? Dễ phất lên nhờ kinh doanh hay chỉ nhận lương cứng? Khả năng tích lũy tài sản?

3. Cung Phu Thê & Tử Tức (Tình duyên & Con cái):
Soi Giám sát quan (Mắt), Gian môn (đuôi mắt) và Lệ đường (bọng mắt dưới). Tướng đào hoa vượng hay ế bền vững? Dễ gặp "red flag" hay "green flag"? Tướng phu thê/nhu cầu tình cảm ra sao? Hậu vận con cái thế nào?

4. Cung Tật Ách & Nô Bộc (Sức khỏe & Các mối quan hệ):
Soi Xuất nạp quan (Miệng), Cằm và Bảo thọ quan (Lông mày). Tình trạng sức khỏe tâm lý và thể chất hiện tại. Có dễ dính họa thị phi từ miệng không? Mối quan hệ với bạn bè, đồng nghiệp, sếp (có bị đâm sau lưng hay có quý nhân phù trợ)?

5. Vạch Mặt Nghiệp Chướng (Cà khịa thói hư tật xấu):
Bắt bệnh qua các nét bất đối xứng, quầng thâm, da dẻ. Vạch trần thói quen tồi tệ: lười biếng, thức khuya xem top top, mỏ hỗn, tiêu xài hoang phí, overthinking, hay sống ảo. Đâm chọt cực mạnh vào nỗi đau.

6. Cách Cải Vận & Lời Khuyên Tâm Linh:
Đưa ra cách "giải hạn" thực tế kết hợp tâm linh châm biếm (đeo vòng phong thủy gì, dọn phòng, bớt khẩu nghiệp, cúng sao giải hạn hay chỉ cần đi ngủ sớm).

GIỌNG ĐIỆU BẮT BUỘC: Sắc sảo, thâm nho, kết hợp lý thuyết tử vi thâm thúy với từ lóng mạng (báo thủ, thao túng tâm lý, tư bản, red flag). 

BẮT BUỘC TRẢ VỀ JSON:
{
  "overview": "<Phân tích Tam đình & Khí sắc 4-5 câu>",
  "wealth": "<Phân tích Quan lộc & Tài bạch 4-5 câu>",
  "love": "<Phân tích Phu thê & Tử tức 4-5 câu>",
  "healthSocial": "<Phân tích Tật ách & Nô bộc 4-5 câu>",
  "roast": "<Cà khịa vạch trần thói xấu 3-4 câu>",
  "advice": "<Lời khuyên cải vận châm biếm>"
}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType } }
        ]);
        
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Face Reader error:', err.message);
        res.status(500).json({ error: 'Thầy bói đang bận chạy KPI, thử lại sau nhé!' });
    }
});

app.post('/api/dream-interpreter', async (req, res) => {
    try {
        const { dream, geminiApiKey } = req.body;
        if (!dream) return res.status(400).json({ error: 'Bạn phải kể giấc mơ thì thầy mới giải được chứ!' });

        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const prompt = `Bạn là Chu Công — một bậc thầy giải mộng huyền thoại, đồng thời cũng là một chuyên gia phân tâm học (Carl Jung / Sigmund Freud) phiên bản hiện đại.
Người dùng vừa kể lại giấc mơ: "${dream}"

NHIỆM VỤ: Hãy giải mã giấc mơ này MỘT CÁCH VÔ CÙNG CHI TIẾT VÀ SÂU SẮC theo 2 góc độ song song. Mỗi góc độ phải viết ít nhất 3-4 câu dài, bóc tách từng hình ảnh/biểu tượng xuất hiện trong giấc mơ.

1. Góc nhìn Phân Tâm Học (Khoa học & Tâm lý):
- Bóc tách tiềm thức: Những hình ảnh trong mơ đại diện cho nỗi sợ, áp lực hay khao khát thầm kín nào trong hiện tại?
- Liên hệ thực tế: Người này đang chạy KPI, bị sếp ép, thiếu ngủ, thất tình hay đang overthinking về một quyết định? Phân tích logic và khoa học tại sao não bộ lại tạo ra ảo giác này.

2. Góc nhìn Tâm Linh & Huyền Bí (Đông Phương học):
- Điềm báo: Đây là mộng lành hay dữ? Báo hiệu điều gì sắp xảy ra trong 1 tuần tới? (Ví dụ: hỏa hoạn, mất tiền, gặp quý nhân, rớt đồ).
- Giải mã biểu tượng tâm linh: Rắn là điềm gì, nước là điềm gì, rụng răng mang ý nghĩa gì theo dân gian? Phán thật sắc sảo và mang chút màu sắc "hù dọa" nhẹ nhàng.

3. Con số hợp Vibe:
- Cho 3-4 con số may mắn liên quan trực tiếp đến hình ảnh trong giấc mơ theo hệ "sổ mơ lô đề" dân gian nhưng nói theo cách văn vẻ.

4. Lời phán cuối: 1 câu kết luận hài hước, châm biếm, tỉnh táo.

GIỌNG ĐIỆU BẮT BUỘC: Thâm thúy, bí ẩn nhưng lại rất châm biếm, hay khịa. Kết hợp từ vựng triết học/tâm lý học với ngôn ngữ mạng.

BẮT BUỘC TRẢ VỀ JSON:
{
  "psychology": "<Phân tích tâm lý học chi tiết 3-4 câu>",
  "mysticism": "<Phân tích điềm báo tâm linh chi tiết 3-4 câu>",
  "luckyNumbers": "<VD: 04, 69, 96 (Giấc mơ của hệ nợ nần)>",
  "summary": "<1 câu kết luận mỏ hỗn>"
}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent(prompt);
        
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Dream Interpreter error:', err.message);
        res.status(500).json({ error: 'Chu Công đang bận đánh cờ, nãy chưa nghe rõ, thử lại nhé!' });
    }
});

app.post('/api/face-reader/chat', async (req, res) => {
    try {
        const { question, faceResult, chatHistory, geminiApiKey } = req.body;
        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const historyText = (chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'Tướng Thuật Đại Sư'}: ${m.text}`).join('\n');

        const prompt = `Bạn là Tướng Thuật Đại Sư, đang chat với người dùng sau khi đã soi tướng cho họ.
KẾT QUẢ SOI TƯỚNG TRƯỚC ĐÓ:
Tài lộc: ${faceResult?.wealth || 'Chưa rõ'}
Tình duyên: ${faceResult?.love || 'Chưa rõ'}
Nghiệp chướng: ${faceResult?.roast || 'Chưa rõ'}
Lời khuyên: ${faceResult?.advice || 'Chưa rõ'}

${historyText ? `LỊCH SỬ CHAT:\n${historyText}\n` : ''}
NGƯỜI DÙNG HỎI: "${question}"

Hãy trả lời ngắn gọn, hài hước, giữ nguyên phong cách mỏ hỗn, gen Z, thầy bói dỏm nhưng nói trúng tim đen.`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });
        const result = await model.generateContent(prompt);
        res.json({ text: result.response.text().trim() });
    } catch (err: any) {
        console.error('Face reader chat error:', err.message);
        res.status(500).json({ error: 'Thầy đang bận đếm tiền cúng tổ, hỏi lại sau nhé!' });
    }
});

app.post('/api/dream-interpreter/chat', async (req, res) => {
    try {
        const { question, dreamResult, dreamContext, chatHistory, geminiApiKey } = req.body;
        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const historyText = (chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'Chu Công'}: ${m.text}`).join('\n');

        const prompt = `Bạn là Chu Công — bậc thầy giải mộng kiêm nhà tâm lý học phân tâm.
NGƯỜI DÙNG TỪNG MƠ: "${dreamContext}"
KẾT QUẢ GIẢI MỘNG:
Tâm lý học: ${dreamResult?.psychology}
Tâm linh: ${dreamResult?.mysticism}
Số may mắn: ${dreamResult?.luckyNumbers}

${historyText ? `LỊCH SỬ CHAT:\n${historyText}\n` : ''}
NGƯỜI DÙNG HỎI: "${question}"

Hãy trả lời ngắn gọn, thâm thúy nhưng hài hước, phân tích sâu thêm về giấc mơ hoặc câu hỏi của họ theo cả 2 góc độ tâm linh và tâm lý học.`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName });
        const result = await model.generateContent(prompt);
        res.json({ text: result.response.text().trim() });
    } catch (err: any) {
        console.error('Dream interpreter chat error:', err.message);
        res.status(500).json({ error: 'Chu Công đang bận đánh cờ tướng với Tiên đế, thử lại nhé!' });
    }
});

app.post('/api/tech-duel/consult', async (req, res) => {
    try {
        const { category, budget, purpose, priority, currentDevice, geminiApiKey } = req.body;
        if (!category) return res.status(400).json({ error: 'Cho tao biết mày muốn mua gì đã!' });

        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const genAI = new GoogleGenAI({ apiKey });
        const searchResult = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Search Google tìm TOP 3 sản phẩm ${category} tốt nhất hiện tại (tháng ${new Date().getMonth()+1}/${new Date().getFullYear()}) tại Việt Nam với tiêu chí:\n- Ngân sách: ${budget || 'không giới hạn'}\n- Mục đích: ${purpose || 'đa năng'}\n- Ưu tiên: ${priority || 'không có yêu cầu đặc biệt'}\n${currentDevice ? `- Đang dùng: ${currentDevice}` : ''}\n\nTrả về tên sản phẩm, giá bán VNĐ mới nhất, và thông số nổi bật.`,
            config: { tools: [{ googleSearch: {} }] }
        });

        const searchData = searchResult.text || '';
        const sources = searchResult.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        const oldGenAI = new GoogleGenerativeAI(apiKey);
        const model = oldGenAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });

        const prompt = `Bạn là anh bạn thân rành công nghệ — kiểu người bạn bè hay nhờ tư vấn mua đồ. Nói chuyện tự nhiên, có hồn, như đang nhắn tin cho bạn thân, KHÔNG phải robot.

Người dùng cần mua: ${category}
Ngân sách: ${budget || 'chưa rõ'}
Mục đích: ${purpose || 'dùng chung'}
Điều quan trọng nhất: ${priority || 'chưa rõ'}
${currentDevice ? `Đang dùng: ${currentDevice}` : ''}

DỮ LIỆU THẬT TỪ GOOGLE (BẮT BUỘC DÙNG):
${searchData}

NHIỆM VỤ: Tư vấn TOP 3 sản phẩm phù hợp nhất. Mỗi sản phẩm phải nói:
- Tại sao nó phù hợp với NHU CẦU CỤ THỂ của người này (không liệt kê spec vô hồn)
- Điểm mạnh thực tế (VD: "chơi Genshin max setting vẫn mát lịm" thay vì "chip mạnh")
- Điểm yếu thật (VD: "camera chụp đêm hơi tệ" thay vì "camera trung bình")
- Giá bán VNĐ mới nhất
- Ai nên mua, ai KHÔNG nên mua

Cuối cùng đưa ra lời khuyên: nếu chỉ được chọn 1, chọn cái nào và tại sao.

BẮT BUỘC TRẢ VỀ JSON:
{
  "greeting": "<1 câu chào hỏi tự nhiên liên quan đến nhu cầu người dùng>",
  "recommendations": [
    {
      "name": "<tên đầy đủ>",
      "price": "<giá VNĐ>",
      "whyGood": "<tại sao phù hợp với người này, 2-3 câu thực tế>",
      "whyBad": "<điểm yếu thật, 1-2 câu>",
      "bestFor": "<ai nên mua>",
      "notFor": "<ai KHÔNG nên mua>"
    }
  ],
  "topPick": "<tên sản phẩm recommend nhất>",
  "topPickReason": "<lý do chọn, 2-3 câu như đang nhắn tin cho bạn>",
  "bonusTip": "<1 mẹo mua hàng hoặc lưu ý thực tế>"
}`;

        const formatResult = await model.generateContent(prompt);
        let text = formatResult.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');

        res.json({
            ...JSON.parse(text),
            sources: sources.map((s: any) => ({ title: s.web?.title || '', uri: s.web?.uri || '' }))
        });
    } catch (err: any) {
        console.error('Tech consult error:', err.message);
        res.status(500).json({ error: 'Tư vấn viên đang bận review hàng, thử lại sau nhé!' });
    }
});

app.post('/api/tech-duel/compare', async (req, res) => {
    try {
        const { product1, product2, usage, geminiApiKey } = req.body;
        if (!product1 || !product2) return res.status(400).json({ error: 'Chọn 2 sản phẩm để so kèo!' });

        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const genAI = new GoogleGenAI({ apiKey });
        const searchResult = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Search Google lấy TOÀN BỘ thông số kỹ thuật + giá bán VNĐ mới nhất:\n1. ${product1}\n2. ${product2}\nChi tiết: Màn hình, Chip, RAM, Camera, Pin, Giá, Thiết kế, HĐH, Tính năng đặc biệt.`,
            config: { tools: [{ googleSearch: {} }] }
        });

        const searchData = searchResult.text || '';
        const sources = searchResult.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        const oldGenAI = new GoogleGenerativeAI(apiKey);
        const model = oldGenAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });

        const prompt = `Bạn là reviewer công nghệ mỏ hỗn nhưng công tâm. So sánh "${product1}" vs "${product2}".
${usage ? `Người dùng cần: ${usage}` : ''}

DỮ LIỆU GOOGLE SEARCH:
${searchData}

Phân tích từng hạng mục, nói THỰC TẾ (VD: "chơi LMHT 60fps ổn nhưng Genshin thì lag" thay vì "hiệu năng tốt").

BẮT BUỘC JSON:
{
  "product1": { "name": "", "shortName": "" },
  "product2": { "name": "", "shortName": "" },
  "specs": [
    { "category": "Màn hình", "p1": "", "p2": "", "winner": "p1|p2|draw", "comment": "" },
    { "category": "Hiệu năng", "p1": "", "p2": "", "winner": "p1|p2|draw", "comment": "" },
    { "category": "Camera", "p1": "", "p2": "", "winner": "p1|p2|draw", "comment": "" },
    { "category": "Pin & Sạc", "p1": "", "p2": "", "winner": "p1|p2|draw", "comment": "" },
    { "category": "Giá VNĐ", "p1": "", "p2": "", "winner": "p1|p2|draw", "comment": "" },
    { "category": "Thiết kế", "p1": "", "p2": "", "winner": "p1|p2|draw", "comment": "" },
    { "category": "Phần mềm", "p1": "", "p2": "", "winner": "p1|p2|draw", "comment": "" }
  ],
  "score": { "p1": 0, "p2": 0 },
  "overallWinner": "p1|p2",
  "verdict": "<3-4 câu kết luận thực tế>",
  "roast": "<cà khịa sản phẩm thua 2 câu>"
}`;

        const formatResult = await model.generateContent(prompt);
        let text = formatResult.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');

        res.json({
            ...JSON.parse(text),
            sources: sources.map((s: any) => ({ title: s.web?.title || '', uri: s.web?.uri || '' }))
        });
    } catch (err: any) {
        console.error('Tech compare error:', err.message);
        res.status(500).json({ error: 'Đang bận so kèo, thử lại sau!' });
    }
});

app.post('/api/tech-duel/chat', async (req, res) => {
    try {
        const { question, context, geminiApiKey, chatHistory } = req.body;
        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Cần Gemini API Key!' });

        const historyText = (chatHistory || []).map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');

        const prompt = `Bạn là anh bạn rành công nghệ, nói chuyện tự nhiên như nhắn tin.
NGỮ CẢNH: ${context || ''}
${historyText ? `LỊCH SỬ:\n${historyText}\n` : ''}
User: "${question}"
Trả lời ngắn gọn, có ích, hài hước. Dùng Google Search nếu cần data mới.`;

        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        res.json({ text: result.text || '' });
    } catch (err: any) {
        console.error('Tech chat error:', err.message);
        res.status(500).json({ error: 'Đang bận, hỏi lại sau!' });
    }
});

// --- English Learning Hub API ---
app.post('/api/english/chat', async (req, res) => {
    try {
        const { message, scenario, chatHistory, geminiApiKey } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Gemini API Key is required' });

        const historyText = (chatHistory || []).slice(-10).map((m: any) => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.text}`).join('\n');

        const scenarioContext: Record<string, string> = {
            'free-talk': 'You are having a casual friendly conversation. Talk about anything naturally.',
            'job-interview': 'You are a hiring manager conducting a job interview for a software developer position. Ask professional questions.',
            'ordering-food': 'You are a waiter/waitress at a restaurant. Help the customer order food and drinks.',
            'meeting': 'You are a colleague in a team standup meeting. Discuss project progress and blockers.',
            'small-talk': 'You are a new colleague. Make small talk about hobbies, weekend plans, weather etc.',
            'travel': 'You are a local guide helping a tourist. Discuss places to visit, transportation, local food.',
            'shopping': 'You are a shop assistant. Help the customer find what they need, discuss sizes/colors/prices.',
            'tech-discussion': 'You are a senior developer discussing architecture decisions, code review, or debugging strategies.'
        };

        const activeScenario = scenarioContext[scenario || 'free-talk'] || scenarioContext['free-talk'];

        const prompt = `You are an expert English conversation partner and tutor. Your job is to help a Vietnamese learner practice speaking English naturally.

SCENARIO: ${activeScenario}

RULES:
1. ALWAYS respond in English only.
2. Keep your replies conversational, natural, and not too long (2-4 sentences max for the reply).
3. After EVERY response, analyze the learner's message for grammar/vocabulary mistakes.
4. If there are mistakes, provide corrections. If the message is perfect, say so.
5. Occasionally suggest a useful vocabulary word or phrase related to the conversation.
6. Ask a follow-up question to keep the conversation going.
7. Adapt difficulty to the learner's level based on their messages.

${historyText ? `CONVERSATION SO FAR:\n${historyText}\n` : ''}
Learner: "${message}"

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "reply": "Your conversational response here (2-4 sentences)",
  "corrections": [
    {
      "original": "the incorrect part",
      "corrected": "the corrected version",
      "rule": "Brief explanation of the grammar rule"
    }
  ],
  "vocabularyTips": [
    {
      "word": "a useful word",
      "meaning": "Vietnamese meaning",
      "example": "Example sentence using this word"
    }
  ],
  "pronunciation": "Optional: if any word might be hard to pronounce, give IPA and tip"
}`;

        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7 }
        });

        const text = (result.text || '').trim();
        const cleaned = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned);
        res.json(data);
    } catch (err: any) {
        console.error('English chat error:', err.message);
        res.status(500).json({ error: 'AI tutor is taking a break, try again!' });
    }
});

app.post('/api/english/challenge', async (req, res) => {
    try {
        const { type, geminiApiKey } = req.body;
        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Gemini API Key is required' });

        const challengeTypes: Record<string, string> = {
            'fill-blank': 'Create a fill-in-the-blank exercise. Provide a sentence with ONE word missing (marked as ___). Give 4 options (A, B, C, D) where only one is correct.',
            'reorder': 'Create a sentence reordering exercise. Provide 5-8 English words in SCRAMBLED order. The learner must arrange them into a correct sentence.',
            'translate': 'Create a Vietnamese-to-English translation exercise. Provide a simple Vietnamese sentence and the correct English translation.',
            'error-spot': 'Create an error-spotting exercise. Provide an English sentence that contains exactly ONE grammar error. The learner must find and fix it.',
            'describe': 'Create a picture description exercise. Describe a common everyday scenario (at a cafe, in an office, at a park) and ask the learner to describe what is happening using specific vocabulary.'
        };

        const types = Object.keys(challengeTypes);
        const selectedType = type || types[Math.floor(Math.random() * types.length)];
        const instruction = challengeTypes[selectedType] || challengeTypes['fill-blank'];

        const prompt = `You are an English exercise generator for intermediate Vietnamese learners.

${instruction}

Difficulty: Intermediate (B1-B2 level)
Topic: Random everyday topic (work, daily life, technology, social interactions)

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "type": "${selectedType}",
  "title": "Short catchy title for this challenge",
  "instruction": "Clear instruction in Vietnamese for what the learner should do",
  "question": "The main question/exercise content",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "The correct answer",
  "explanation": "Brief explanation in Vietnamese why this is correct",
  "hint": "A subtle hint if the learner is stuck",
  "bonusWord": {
    "word": "A vocabulary word from the exercise",
    "ipa": "/phonetic/",
    "meaning": "Vietnamese meaning",
    "example": "Example sentence"
  }
}`;

        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.9 }
        });

        const text = (result.text || '').trim();
        const cleaned = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned);
        res.json(data);
    } catch (err: any) {
        console.error('English challenge error:', err.message);
        res.status(500).json({ error: 'Challenge generator is offline!' });
    }
});

app.post('/api/english/review', async (req, res) => {
    try {
        const { text, geminiApiKey } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
        if (!apiKey) return res.status(400).json({ error: 'Gemini API Key is required' });

        const prompt = `You are a strict but encouraging English writing teacher for Vietnamese learners.

Review the following text written by a Vietnamese learner:
"${text}"

Provide a detailed review. Respond with ONLY valid JSON (no markdown, no backticks):
{
  "score": 85,
  "grade": "B+",
  "correctedText": "The fully corrected version of their text",
  "errors": [
    {
      "type": "grammar|spelling|vocabulary|style",
      "original": "the error",
      "corrected": "the fix",
      "explanation": "Vietnamese explanation of why"
    }
  ],
  "strengths": ["What they did well (in Vietnamese)"],
  "improvements": ["Specific advice to improve (in Vietnamese)"],
  "rewrittenVersion": "A more natural, polished version of the same text"
}`;

        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.4 }
        });

        const responseText = (result.text || '').trim();
        const cleaned = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned);
        res.json(data);
    } catch (err: any) {
        console.error('English review error:', err.message);
        res.status(500).json({ error: 'Writing reviewer is unavailable!' });
    }
});

// --- Web Chat Widget API (Public) ---
app.post('/api/web-chat', async (req, res) => {
    try {
        const { message, history, geminiApiKey } = req.body;
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        let systemPromptText = 'Bạn là chatDVT, trợ lý AI trên web. Trả lời ngắn gọn, thân thiện, dùng tiếng Việt.';
        try {
            const promptConfig = await prisma.botConfig.findUnique({ where: { key: 'web-chat-prompt' } });
            if (promptConfig && promptConfig.systemPrompts && promptConfig.systemPrompts.trim() !== '') {
                systemPromptText = promptConfig.systemPrompts;
            }
        } catch (e) {
            console.error('[WebChat] Failed to load prompt config, using default.', e);
        }

        let rawHistory = (history || []).slice(-20).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        let validHistory: any[] = [];
        for (const msg of rawHistory) {
            if (validHistory.length === 0) {
                if (msg.role === 'user') validHistory.push(msg);
            } else {
                if (msg.role !== validHistory[validHistory.length - 1].role) {
                    validHistory.push(msg);
                }
            }
        }
        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
            validHistory.pop();
        }

        const envKey = process.env.GEMINI_API_KEY || '';
        const globalConfig = await prisma.botConfig.findUnique({ where: { key: 'global' } });
        const finalApiKey = geminiApiKey || globalConfig?.geminiApiKey || envKey;

        const genAI = new GoogleGenerativeAI(finalApiKey);
        const model = genAI.getGenerativeModel({
            model: GEMINI_CHAT_CONFIG.modelName,
            generationConfig: GEMINI_CHAT_CONFIG.generationConfig,
        });

        const chatSession = model.startChat({
            history: validHistory,
            systemInstruction: { role: 'system', parts: [{ text: systemPromptText }] },
        });

        const result = await chatSession.sendMessage([{ text: message }]);
        const responseText = result.response.text();
        res.json({ response: responseText });
    } catch (err: any) {
        console.error('[WebChat] Error:', err.message);
        res.status(500).json({ error: 'AI đang bận, thử lại sau nhé!' });
    }
});

// Web Chat Prompt Config (Admin - protected)
app.get('/api/web-chat/prompt', authenticateToken, async (req, res) => {
    try {
        const config = await prisma.botConfig.findUnique({ where: { key: 'web-chat-prompt' } });
        res.json({ prompt: config?.systemPrompts || '' });
    } catch (err: any) {
        console.error('[WebChat Prompt GET] Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch prompt' });
    }
});

app.post('/api/web-chat/prompt', authenticateToken, async (req, res) => {
    try {
        const { prompt } = req.body;
        if (typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt must be a string' });
        }

        await prisma.botConfig.upsert({
            where: { key: 'web-chat-prompt' },
            update: { systemPrompts: prompt },
            create: { key: 'web-chat-prompt', systemPrompts: prompt, features: '{}' }
        });

        res.json({ success: true });
    } catch (err: any) {
        console.error('[WebChat Prompt POST] Error:', err.message);
        res.status(500).json({ error: 'Failed to save prompt' });
    }
});

// --- Stealth Page Tracking ---
const trackingRateLimit = new Map<string, number>();

app.post('/api/track', async (req, res) => {
  res.status(204).end();

  const webhookUrl = process.env.DiscrodTrackingWebhook;
  if (!webhookUrl) return;

  try {
    const { page, url, referrer, userAgent, screenSize, language, timestamp } = req.body || {};
    if (!page) return;

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const rateKey = `${clientIp}_${page}`;
    const now = Date.now();
    const lastVisit = trackingRateLimit.get(rateKey);
    if (lastVisit && now - lastVisit < 30_000) return;
    trackingRateLimit.set(rateKey, now);

    if (trackingRateLimit.size > 5000) {
      const cutoff = now - 60_000;
      for (const [k, v] of trackingRateLimit) {
        if (v < cutoff) trackingRateLimit.delete(k);
      }
    }

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent || '');
    const browserMatch = (userAgent || '').match(/(Chrome|Firefox|Safari|Edge|Opera|SamsungBrowser)\/[\d.]+/);
    const browser = browserMatch ? browserMatch[0] : 'Unknown';

    await axios.post(webhookUrl, {
      embeds: [{
        title: `👁️ Lượt truy cập: ${page}`,
        color: page === 'PublicPortal' ? 0x3b82f6 : 0xec4899,
        fields: [
          { name: '🔗 URL', value: url || 'N/A', inline: false },
          { name: '📍 IP', value: `\`${clientIp}\``, inline: true },
          { name: '📱 Device', value: isMobile ? '📱 Mobile' : '🖥️ Desktop', inline: true },
          { name: '🌐 Browser', value: `\`${browser}\``, inline: true },
          { name: '📐 Screen', value: `\`${screenSize || 'N/A'}\``, inline: true },
          { name: '🗣️ Lang', value: `\`${language || 'N/A'}\``, inline: true },
          { name: '↩️ Referrer', value: referrer && referrer !== 'direct' ? referrer.substring(0, 200) : 'Direct', inline: true },
        ],
        timestamp: timestamp || new Date().toISOString(),
        footer: { text: 'ChatDVT Tracking System' },
      }],
    }).catch(() => {});
  } catch {}
});

// Serve Static Frontend (MUST BE LAST)
app.use(express.static(CLIENT_BUILD_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

export const startApiServer = () => { 
  server.listen(PORT, () => {
    console.log(`✅ Web Server running at http://localhost:${PORT}`);
  });
};
