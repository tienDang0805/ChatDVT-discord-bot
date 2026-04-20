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
    if (req.path === '/api/login' || req.path === '/api/health' || req.path === '/api/bot-info' || req.path.startsWith('/api/web-quiz/') || req.path === '/api/food-wheel' || req.path === '/api/excuse-generator' || req.path === '/api/handsome-analyzer' || req.path === '/api/cv-reviewer' || req.path.startsWith('/api/music/') || req.path === '/api/8d-chat' || req.path.startsWith('/api/numerology') || req.path.startsWith('/api/gender-quiz') || req.path.startsWith('/api/astrology') || req.path.startsWith('/api/tarot') || req.path === '/api/magic-ball' || req.path === '/api/deep-status' || req.path === '/api/burnout-check' || req.path.startsWith('/api/weather')) {
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
app.post('/api/burnout-check', async (req, res) => {
    try {
        const { answers, jobInfo } = req.body;
        if (!answers || !Array.isArray(answers)) return res.status(400).json({ error: 'Thiếu câu trả lời!' });

        const prompt = `Bạn là CHUYÊN GIA TÂM LÝ NGHỀ NGHIỆP kết hợp phong cách Gen Z hài hước nhưng thấu hiểu.

THÔNG TIN CÔNG VIỆC: ${jobInfo || 'Không cung cấp'}

CÂU TRẢ LỜI KHẢO SÁT BURNOUT (thang 1-5, 1=Không bao giờ, 5=Luôn luôn):
${answers.map((a: any, i: number) => `Q${i+1}: ${a.question} → ${a.value}/5`).join('\n')}

TỔNG ĐIỂM: ${answers.reduce((s: number, a: any) => s + a.value, 0)}/${answers.length * 5}

PHÂN TÍCH VÀ TRẢ VỀ JSON:
{
  "burnoutLevel": <0-100 phần trăm burnout>,
  "verdict": "<XANH (0-30%: Ổn) / VÀNG (31-60%: Cảnh báo) / ĐỎ (61-85%: Burnout) / TÍM (86-100%: Cháy sạch rồi)>",
  "verdictEmoji": "<emoji phù hợp>",
  "title": "<Tiêu đề kết quả ngắn gọn, hài hước VD: 'Bạn vẫn chill mà!' hoặc 'Houston, we have a problem'>",
  "analysis": "<Phân tích 3-4 câu dựa trên pattern câu trả lời - chỉ ra vấn đề chính>",
  "shouldQuit": "<honest / stay / consider - đánh giá thật lòng>",
  "quitAdvice": "<2-3 câu tư vấn có nên nghỉ việc không, thực tế và thẳng thắn>",
  "selfCare": ["<3 lời khuyên chăm sóc bản thân ngắn gọn>"],
  "funFact": "<1 câu fun fact hoặc quote motivational hài hước về burnout>"
}`;

        const genAI = new GoogleGenerativeAI(req.body.geminiApiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_CONFIG.modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Burnout check error:', err.message);
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
