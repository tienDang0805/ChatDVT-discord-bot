import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import { FB_APP_SECRET, FB_PAGE_ACCESS_TOKEN, FB_VERIFY_TOKEN } from '../../config/constants';
import { geminiCore } from '../../shared/services/gemini-core';
import { prisma } from '../../database/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const FB_GRAPH_URL = 'https://graph.facebook.com/v22.0/me/messages';
const FB_PROMPT_KEY = 'fb-messenger-prompt';
const FB_PROMPT_MAX_LENGTH = 50_000;

type FacebookWebhookRequest = Request & { rawBody?: Buffer };

export function isValidFacebookSignature(rawBody: Buffer, signature: string, appSecret: string): boolean {
    if (!rawBody.length || !signature.startsWith('sha256=') || !appSecret) return false;

    const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
    const actualBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    return actualBuffer.length === expectedBuffer.length
        && timingSafeEqual(actualBuffer, expectedBuffer);
}

function verifyFacebookSignature(req: FacebookWebhookRequest, res: Response, next: NextFunction) {
    if (!FB_APP_SECRET) {
        console.error('[FB Webhook] FB_APP_SECRET not configured');
        return res.sendStatus(503);
    }

    const signature = req.get('x-hub-signature-256') || '';
    if (!req.rawBody || !isValidFacebookSignature(req.rawBody, signature, FB_APP_SECRET)) {
        console.warn('[FB Webhook] Rejected request with invalid signature');
        return res.sendStatus(401);
    }

    next();
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min: number = 800, max: number = 2500): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getFbSystemPrompt(): Promise<string> {
    const config = await prisma.botConfig.findUnique({ where: { key: FB_PROMPT_KEY } });
    const prompt = config?.systemPrompts?.trim();

    if (!prompt) {
        throw new Error('FB Messenger prompt is not configured');
    }

    return prompt;
}

router.get('/facebook/prompt', authenticateToken, async (_req: Request, res: Response) => {
    try {
        const config = await prisma.botConfig.findUnique({ where: { key: FB_PROMPT_KEY } });
        res.setHeader('Cache-Control', 'no-store');
        res.json({
            prompt: config?.systemPrompts || '',
            updatedAt: config?.updatedAt || null,
        });
    } catch (err: any) {
        console.error('[FB Prompt GET] Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch Facebook prompt' });
    }
});

router.post('/facebook/prompt', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt must be a string' });
        }

        const normalizedPrompt = prompt.trim();
        if (!normalizedPrompt) {
            return res.status(400).json({ error: 'System prompt cannot be empty' });
        }
        if (normalizedPrompt.length > FB_PROMPT_MAX_LENGTH) {
            return res.status(400).json({ error: `System prompt cannot exceed ${FB_PROMPT_MAX_LENGTH} characters` });
        }

        const config = await prisma.botConfig.upsert({
            where: { key: FB_PROMPT_KEY },
            update: { systemPrompts: normalizedPrompt },
            create: { key: FB_PROMPT_KEY, systemPrompts: normalizedPrompt, features: '{}' },
        });

        res.json({ success: true, prompt: config.systemPrompts, updatedAt: config.updatedAt });
    } catch (err: any) {
        console.error('[FB Prompt POST] Error:', err.message);
        res.status(500).json({ error: 'Failed to save Facebook prompt' });
    }
});

async function getChatHistory(senderId: string, limit: number = 10): Promise<string> {
    const logs = await prisma.fbChatLog.findMany({
        where: { senderId },
        orderBy: { createdAt: 'desc' },
        take: limit
    });

    if (logs.length === 0) return '';

    const history = logs.reverse().map(log =>
        `User: ${log.message}\nChatDVT: ${log.response}`
    ).join('\n\n');

    return `\n\n[LỊCH SỬ HỘI THOẠI GẦN ĐÂY]\n${history}\n`;
}

async function sendSingleMessage(recipientId: string, text: string): Promise<void> {
    try {
        await axios.post(FB_GRAPH_URL, {
            recipient: { id: recipientId },
            message: { text },
            messaging_type: 'RESPONSE'
        }, {
            params: { access_token: FB_PAGE_ACCESS_TOKEN },
            timeout: 10000
        });
    } catch (err: any) {
        console.error('[FB Send] Error:', err.response?.data || err.message);
    }
}

async function sendTypingAction(recipientId: string): Promise<void> {
    try {
        await axios.post(FB_GRAPH_URL, {
            recipient: { id: recipientId },
            sender_action: 'typing_on'
        }, {
            params: { access_token: FB_PAGE_ACCESS_TOKEN },
            timeout: 5000
        });
    } catch (_) {}
}

async function sendHumanLikeMessages(recipientId: string, messages: string[]): Promise<void> {
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i].trim();
        if (!msg) continue;

        await sendTypingAction(recipientId);

        const typingDelay = Math.min(msg.length * 40, 3000);
        const jitter = randomDelay(300, 800);
        await sleep(typingDelay + jitter);

        await sendSingleMessage(recipientId, msg);

        if (i < messages.length - 1) {
            await sleep(randomDelay(500, 1500));
        }
    }
}

function parseAiResponse(raw: string): string[] {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
            const strings = parsed
                .map((item: any) => typeof item === 'string' ? item : item?.message || item?.text || '')
                .filter((s: string) => s.trim() !== '');
            if (strings.length > 0) return strings.slice(0, 3);
        }
    } catch (_) {}

    return cleaned.split('\n').filter((line: string) => line.trim() !== '').slice(0, 3);
}

async function handleTextMessage(senderId: string, text: string): Promise<void> {
    await sendTypingAction(senderId);

    try {
        const systemPrompt = await getFbSystemPrompt();
        const chatHistory = await getChatHistory(senderId);

        const fullPrompt = `${systemPrompt}${chatHistory}\n\n[TIN NHẮN MỚI TỪ NGƯỜI DÙNG]\n${text}`;

        const rawResponse = await geminiCore.generateText(fullPrompt, 'global');
        const messages = parseAiResponse(rawResponse);

        await prisma.fbChatLog.create({
            data: { senderId, message: text, response: messages.join(' | '), type: 'text' }
        });

        await sendHumanLikeMessages(senderId, messages);
    } catch (err: any) {
        console.error('[FB Handler] AI Error:', err.message);
        await sendTypingAction(senderId);
        await sleep(randomDelay(800, 1500));
        await sendSingleMessage(senderId, 'ChatDVT đang hơi lag một chút 😵');
        await sleep(randomDelay(500, 1000));
        await sendSingleMessage(senderId, 'Bạn nhắn lại giúp mình nhé.');
    }
}

async function handleImageMessage(senderId: string, imageUrl: string, caption: string): Promise<void> {
    await sendTypingAction(senderId);

    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const base64Image = Buffer.from(imageResponse.data).toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        const systemPrompt = await getFbSystemPrompt();
        const prompt = `${systemPrompt}\n\n[TIN NHẮN MỚI TỪ NGƯỜI DÙNG]\nNgười dùng gửi một hình ảnh${caption ? ` với caption: "${caption}"` : ''}. Hãy phản hồi theo đúng system prompt.`;

        const rawResponse = await geminiCore.generateTextWithMedia(
            prompt,
            [{ inlineData: { mimeType, data: base64Image } }],
            'global'
        );

        const messages = parseAiResponse(rawResponse);

        await prisma.fbChatLog.create({
            data: { senderId, message: `[IMAGE] ${caption || 'No caption'}`, response: messages.join(' | '), type: 'image' }
        });

        await sendHumanLikeMessages(senderId, messages);
    } catch (err: any) {
        console.error('[FB Handler] Image Error:', err.message);
        await sendTypingAction(senderId);
        await sleep(randomDelay(800, 1500));
        await sendSingleMessage(senderId, 'ChatDVT chưa mở được ảnh này 😅');
        await sleep(randomDelay(500, 1000));
        await sendSingleMessage(senderId, 'Bạn gửi lại giúp mình nhé.');
    }
}

router.get('/facebook/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
        console.log('[FB Webhook] Verified successfully');
        return res.status(200).send(challenge);
    }

    console.warn('[FB Webhook] Verification failed. Token mismatch.');
    return res.sendStatus(403);
});

router.post('/facebook/webhook', verifyFacebookSignature, (req: Request, res: Response) => {
    const body = req.body;

    if (body.object !== 'page') {
        return res.sendStatus(404);
    }

    res.sendStatus(200);

    console.log('[FB Webhook] Incoming payload:', JSON.stringify(body, null, 2));

    if (!FB_PAGE_ACCESS_TOKEN) {
        console.error('[FB Webhook] FB_PAGE_ACCESS_TOKEN not configured');
        return;
    }

    for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
            const senderId = event.sender?.id;
            if (!senderId) continue;

            if (event.message) {
                const attachments = event.message.attachments;

                if (attachments && attachments.length > 0) {
                    const imgAttachment = attachments.find((a: any) => a.type === 'image');
                    if (imgAttachment?.payload?.url) {
                        handleImageMessage(senderId, imgAttachment.payload.url, event.message.text || '');
                        continue;
                    }
                }

                if (event.message.text) {
                    handleTextMessage(senderId, event.message.text);
                }
            }

            if (event.postback?.payload) {
                handleTextMessage(senderId, event.postback.payload);
            }
        }
    }
});

router.get('/facebook/debug', authenticateToken, async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const checks: Record<string, any> = {
        tokenConfigured: !!FB_PAGE_ACCESS_TOKEN,
        verifyTokenConfigured: !!FB_VERIFY_TOKEN,
        appSecretConfigured: !!FB_APP_SECRET,
    };

    if (FB_PAGE_ACCESS_TOKEN) {
        try {
            const meRes = await axios.get(`https://graph.facebook.com/v22.0/me`, {
                params: { access_token: FB_PAGE_ACCESS_TOKEN, fields: 'id,name' },
                timeout: 5000
            });
            checks.pageInfo = meRes.data;
            checks.tokenValid = true;
        } catch (err: any) {
            checks.tokenValid = false;
            checks.tokenError = err.response?.data?.error?.message || err.message;
        }
    }

    try {
        const logCount = await prisma.fbChatLog.count();
        checks.totalChatLogs = logCount;

        const latestLog = await prisma.fbChatLog.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        });
        checks.latestChatAt = latestLog?.createdAt || null;
    } catch (_) {
        checks.totalChatLogs = 'DB error';
    }

    res.json(checks);
});

router.post('/facebook/test-send/:psid', authenticateToken, async (req: Request, res: Response) => {
    const { psid } = req.params;
    if (!/^\d{5,32}$/.test(psid)) {
        return res.status(400).json({ success: false, error: 'Invalid PSID' });
    }

    try {
        const result = await axios.post(FB_GRAPH_URL, {
            recipient: { id: psid },
            message: { text: 'Test từ ChatDVT debug 🔧' },
            messaging_type: 'RESPONSE'
        }, {
            params: { access_token: FB_PAGE_ACCESS_TOKEN },
            timeout: 10000
        });
        res.json({ success: true, data: result.data });
    } catch (err: any) {
        res.status(502).json({ success: false, error: err.response?.data || err.message });
    }
});

export default router;
