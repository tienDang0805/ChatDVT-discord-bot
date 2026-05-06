import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

import { prisma } from '../database/prisma';
import { geminiService } from '../bot/services/gemini';
import { authenticateToken } from './middleware/auth';
import http from 'http';
import { Server as SocketServer } from 'socket.io';


const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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


// --- Auth Middleware ---

// Protect API Routes (except public routes)
app.use((req, res, next) => {
    if (req.path === '/api/login' || req.path === '/api/health' || req.path === '/api/bot-info' || req.path === '/api/track' || req.path.startsWith('/api/web-quiz/') || req.path === '/api/food-wheel' || req.path === '/api/excuse-generator' || req.path === '/api/handsome-analyzer' || req.path === '/api/cv-reviewer' || req.path.startsWith('/api/music/') || req.path === '/api/8d-chat' || req.path.startsWith('/api/numerology') || req.path.startsWith('/api/gender-quiz') || req.path.startsWith('/api/astrology') || req.path.startsWith('/api/tarot') || req.path === '/api/magic-ball' || req.path === '/api/deep-status' || req.path.startsWith('/api/burnout-check') || req.path.startsWith('/api/weather') || req.path === '/api/poem-generator' || req.path === '/api/chibi-sticker' || req.path.startsWith('/api/face-reader') || req.path.startsWith('/api/dream-interpreter') || req.path.startsWith('/api/tech-duel') || req.path.startsWith('/api/english/') || req.path === '/api/web-chat') {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return authenticateToken(req, res, next);
    }
    next();
});

// --- Extracted Route Modules ---
import weatherRoutes from './routes/weather';
import adminRoutes from './routes/admin';
import botDataRoutes from './routes/bot-data';
import webQuizRoutes from './routes/web-quiz';
import musicRoutes from './routes/music';
app.use('/api', weatherRoutes);
app.use('/api', adminRoutes);
app.use('/api', botDataRoutes);
app.use('/api', webQuizRoutes);
app.use('/api', musicRoutes);




import publicAiRoutes from './routes/public-ai';
app.use('/api', publicAiRoutes);

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
app.post('/api/track', async (req, res) => {
  res.status(204).end();

  const webhookUrl = process.env.DiscrodTrackingWebhook;
  if (!webhookUrl) return;

  try {
    const { page, url, referrer, os, browser, screenSize, viewport, pixelRatio, language, timezone, timestamp, connection, touchSupport } = req.body || {};
    if (!page) return;

    const clientIp = (req.ip || 'unknown').replace(/^::ffff:/, '');

    const isMobile = touchSupport || /Mobile|Android|iPhone|iPad/i.test(req.body?.userAgent || '');
    const deviceEmoji = isMobile ? '📱' : '🖥️';
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    let geoStr = '';
    try {
      if (clientIp !== '127.0.0.1' && clientIp !== '::1' && clientIp !== 'unknown') {
        const geoRes = await axios.get(`http://ip-api.com/json/${clientIp}?fields=status,country,regionName,city,isp,org`, { timeout: 3000 });
        if (geoRes.data?.status === 'success') {
          const g = geoRes.data;
          geoStr = `${g.city || ''}, ${g.regionName || ''}, ${g.country || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '');
          if (g.isp) geoStr += ` (${g.isp})`;
        }
      }
    } catch {}

    const pageColors: Record<string, number> = {
      PublicPortal: 0x3b82f6,
      BirthdayGreeting: 0xec4899,
    };

    const embed: any = {
      title: `${deviceEmoji} ${page}`,
      color: pageColors[page] || 0xfbbf24,
      fields: [
        { name: '🔗 URL', value: url || 'N/A', inline: false },
        { name: '📍 IP', value: `\`${clientIp}\``, inline: true },
        { name: '🌍 Location', value: geoStr || '_Unknown_', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: `${deviceEmoji} Device`, value: `\`${deviceType}\``, inline: true },
        { name: '💻 OS', value: `\`${os || 'N/A'}\``, inline: true },
        { name: '🌐 Browser', value: `\`${browser || 'N/A'}\``, inline: true },
        { name: '📐 Screen', value: `\`${screenSize || 'N/A'}\``, inline: true },
        { name: '📏 Viewport', value: `\`${viewport || 'N/A'}\``, inline: true },
        { name: '🔍 DPR', value: `\`${pixelRatio || 1}x\``, inline: true },
        { name: '🗣️ Lang', value: `\`${language || 'N/A'}\``, inline: true },
        { name: '🕐 Timezone', value: `\`${timezone || 'N/A'}\``, inline: true },
        { name: '📶 Network', value: `\`${connection || 'N/A'}\``, inline: true },
        { name: '↩️ Referrer', value: referrer && referrer !== 'direct' ? referrer.substring(0, 200) : '_Direct_', inline: false },
      ],
      timestamp: timestamp || new Date().toISOString(),
      footer: { text: 'ChatDVT Tracking System' },
    };

    await axios.post(webhookUrl, { embeds: [embed] }).catch(() => {});
  } catch {}
});

// Serve Static Frontend (MUST BE LAST)
const CLIENT_BUILD_PATH = path.join(__dirname, '../../client/dist');
app.use(express.static(CLIENT_BUILD_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

export const startApiServer = () => { 
  server.listen(PORT, () => {
    console.log(`✅ Web Server running at http://localhost:${PORT}`);
  });
};
