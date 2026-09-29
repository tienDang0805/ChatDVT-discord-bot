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
const FB_MAX_OUTGOING_MESSAGES = 3;
const FB_BUTTON_TEXT_MAX_LENGTH = 640;
const FB_BUTTON_TITLE_MAX_LENGTH = 20;
const TRUSTED_LINK_HOSTS = new Set(['devtiendang.blog', 'www.devtiendang.blog']);

type FacebookWebhookRequest = Request & { rawBody?: Buffer };
type FacebookButton = { title: string; url: string };
type FacebookOutgoingMessage = { text: string; button?: FacebookButton };

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

async function sendButtonMessage(recipientId: string, message: FacebookOutgoingMessage): Promise<void> {
    if (!message.button) {
        await sendSingleMessage(recipientId, message.text);
        return;
    }

    try {
        await axios.post(FB_GRAPH_URL, {
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'button',
                        text: message.text.slice(0, FB_BUTTON_TEXT_MAX_LENGTH),
                        buttons: [{
                            type: 'web_url',
                            url: message.button.url,
                            title: message.button.title.slice(0, FB_BUTTON_TITLE_MAX_LENGTH),
                        }],
                    },
                },
            },
            messaging_type: 'RESPONSE',
        }, {
            params: { access_token: FB_PAGE_ACCESS_TOKEN },
            timeout: 10000,
        });
    } catch (err: any) {
        console.error('[FB Button Send] Error:', err.response?.data || err.message);
        await sendSingleMessage(recipientId, `${message.text}\n${message.button.url}`);
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

async function sendHumanLikeMessages(recipientId: string, messages: FacebookOutgoingMessage[]): Promise<void> {
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (!message.text.trim()) continue;

        await sendTypingAction(recipientId);

        const typingDelay = Math.min(message.text.length * 40, 3000);
        const jitter = randomDelay(300, 800);
        await sleep(typingDelay + jitter);

        if (message.button) {
            await sendButtonMessage(recipientId, message);
        } else {
            await sendSingleMessage(recipientId, message.text);
        }

        if (i < messages.length - 1) {
            await sleep(randomDelay(500, 1500));
        }
    }
}

function normalizeTrustedWebsiteUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    try {
        const url = new URL(value.trim());
        if (url.protocol !== 'https:' || !TRUSTED_LINK_HOSTS.has(url.hostname.toLowerCase())) {
            return null;
        }
        return url.toString();
    } catch (_) {
        return null;
    }
}

function normalizeAiMessage(item: unknown): FacebookOutgoingMessage | null {
    if (typeof item === 'string') {
        const text = item.trim();
        return text ? { text } : null;
    }
    if (!item || typeof item !== 'object') return null;

    const record = item as Record<string, unknown>;
    const textValue = typeof record.text === 'string' ? record.text : record.message;
    if (typeof textValue !== 'string' || !textValue.trim()) return null;

    const message: FacebookOutgoingMessage = { text: textValue.trim() };
    if (record.button && typeof record.button === 'object') {
        const rawButton = record.button as Record<string, unknown>;
        const url = normalizeTrustedWebsiteUrl(rawButton.url);
        const title = typeof rawButton.title === 'string' ? rawButton.title.trim() : '';
        if (url) {
            message.button = {
                title: (title || 'Mở trang').slice(0, FB_BUTTON_TITLE_MAX_LENGTH),
                url,
            };
        }
    }

    return message;
}

function splitTrustedLinks(message: FacebookOutgoingMessage): FacebookOutgoingMessage[] {
    if (message.button) return [message];

    const urlPattern = /https?:\/\/[^\s<>"']+/gi;
    const matches = Array.from(message.text.matchAll(urlPattern));
    if (matches.length === 0) return [message];

    const output: FacebookOutgoingMessage[] = [];
    let cursor = 0;
    let foundTrustedLink = false;

    for (const match of matches) {
        const rawUrl = match[0];
        const cleanUrl = rawUrl.replace(/[),.;!?]+$/g, '');
        const trustedUrl = normalizeTrustedWebsiteUrl(cleanUrl);
        if (!trustedUrl || match.index === undefined) continue;

        foundTrustedLink = true;
        const before = message.text.slice(cursor, match.index).trim();
        if (before) output.push({ text: before });
        output.push({ text: trustedUrl });
        cursor = match.index + rawUrl.length;
    }

    if (!foundTrustedLink) return [message];

    const after = message.text.slice(cursor).trim();
    if (after) output.push({ text: after });
    return output;
}

function limitOutgoingMessages(messages: FacebookOutgoingMessage[]): FacebookOutgoingMessage[] {
    if (messages.length <= FB_MAX_OUTGOING_MESSAGES) return messages;

    const lastCallToAction = [...messages].reverse().find(message =>
        Boolean(message.button) || Boolean(normalizeTrustedWebsiteUrl(message.text))
    );
    if (!lastCallToAction) return messages.slice(0, FB_MAX_OUTGOING_MESSAGES);

    const leadingMessages = messages
        .filter(message => message !== lastCallToAction)
        .slice(0, FB_MAX_OUTGOING_MESSAGES - 1);
    return [...leadingMessages, lastCallToAction];
}

function parseAiResponse(raw: string): FacebookOutgoingMessage[] {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
            const messages = parsed
                .map(normalizeAiMessage)
                .filter((message): message is FacebookOutgoingMessage => message !== null)
                .flatMap(splitTrustedLinks);
            if (messages.length > 0) return limitOutgoingMessages(messages);
        }
    } catch (_) {}

    const fallbackMessages = cleaned
        .split('\n')
        .map(normalizeAiMessage)
        .filter((message): message is FacebookOutgoingMessage => message !== null)
        .flatMap(splitTrustedLinks);
    return limitOutgoingMessages(fallbackMessages);
}

function formatMessagesForHistory(messages: FacebookOutgoingMessage[]): string {
    return messages.map(message => {
        if (!message.button) return message.text;
        return `${message.text} [${message.button.title}: ${message.button.url}]`;
    }).join(' | ');
}

async function handleTextMessage(senderId: string, text: string): Promise<void> {
    await sendTypingAction(senderId);

    try {
        const systemPrompt = await getFbSystemPrompt();
        const chatHistory = await getChatHistory(senderId);

        const fullPrompt = `${systemPrompt}${chatHistory}\n\n[TIN NHẮN MỚI TỪ NGƯỜI DÙNG]\n${text}`;

        const rawResponse = await geminiCore.generateText(fullPrompt, 'global');
        const messages = parseAiResponse(rawResponse);
        if (messages.length === 0) throw new Error('AI returned no sendable Facebook messages');

        await prisma.fbChatLog.create({
            data: { senderId, message: text, response: formatMessagesForHistory(messages), type: 'text' }
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
        if (messages.length === 0) throw new Error('AI returned no sendable Facebook messages');

        await prisma.fbChatLog.create({
            data: { senderId, message: `[IMAGE] ${caption || 'No caption'}`, response: formatMessagesForHistory(messages), type: 'image' }
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
