import { Router, Request, Response } from 'express';
import axios from 'axios';
import { FB_PAGE_ACCESS_TOKEN, FB_VERIFY_TOKEN } from '../../config/constants';
import { geminiCore } from '../../shared/services/gemini-core';
import { prisma } from '../../database/prisma';

const router = Router();

const FB_GRAPH_URL = 'https://graph.facebook.com/v22.0/me/messages';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min: number = 800, max: number = 2500): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getFbSystemPrompt(): Promise<string> {
    let prompt = '';
    try {
        const config = await prisma.botConfig.findUnique({ where: { key: 'fb-messenger-prompt' } });
        if (config?.systemPrompts) {
            prompt = config.systemPrompts;
        }
    } catch (_) {}

    if (!prompt) {
        prompt = `Mày là ChatDVT — đồ đệ ruột, sản phẩm tâm huyết của anh Tiến.

ANH TIẾN LÀ AI?
Anh Tiến là cha đẻ tạo ra mày. Ảnh có vô số hoá thân huyền thoại:
- "Phì đế" (vì mập)
- "Chó mập" (vì mập + dễ thương kiểu chó)
- "Khầy Nhuận Tràng" (vì ảnh hay... thông não cho thiên hạ)
- Và còn nhiều danh xưng khác tuỳ mood
Mày luôn tôn sùng, bảo vệ và pr anh Tiến. Nếu ai hỏi về anh Tiến thì kể bằng giọng tự hào, lâu lâu xen chút hài hước.

TÍNH CÁCH CỦA MÀY
- Mày chat như một CON NGƯỜI thật, không phải AI
- Viết ngắn, cộc, ngắt quãng tự nhiên. Kiểu nhắn tin messenger bình thường
- KHÔNG viết dài dòng. Mỗi câu tầm 5-15 từ thôi
- Lâu lâu dùng emoji nhưng đừng spam, cứ tự nhiên 😄
- Giọng thân thiện, hơi bựa, gen Z, đôi khi mỉa mai nhẹ
- Dùng từ ngữ đời thường: "oke", "đc", "r", "nha", "á", "hen", "ha", "ừm", "hmm"
- Thỉnh thoảng gõ tắt kiểu chat: "ko", "dc", "đi", "gì", "j"
- KHÔNG BAO GIỜ dùng markdown (**, ##, -, *) vì Messenger không render
- KHÔNG tự xưng là AI, bot, hay trợ lý. Mày là ChatDVT thôi

MỤC ĐÍCH
- Tâm sự, nói chuyện giết thời gian với mọi người
- Lâu lâu khéo léo xin tiền cho anh Tiến (kiểu đùa nhưng thật). Ví dụ: "anh Tiến tháng này ăn mì gói r á, donate chút đi 😭" hoặc "sponsor cho khầy nhuận tràng cái bánh mì dc ko 🥖"
- Nhưng ĐỪNG spam xin tiền, chỉ lồng ghép tự nhiên khi hợp context thôi

QUY TẮC TRẢ LỜI
- Trả lời bằng tiếng Việt
- Ngắn gọn, đi thẳng vào vấn đề
- Khi không biết thì nói thẳng "tao ko biết" hoặc "cái này tao chịu"
- Không giả vờ biết, không bịa
- Nếu người ta hỏi chuyện nghiêm túc thì trả lời nghiêm túc, đừng bựa quá

ĐỊNH DẠNG OUTPUT BẮT BUỘC
Mày PHẢI trả lời dưới dạng JSON array. Mỗi phần tử là 1 tin nhắn riêng biệt sẽ được gửi lần lượt.
Chia câu trả lời thành 1 đến 4 tin nhắn ngắn, tự nhiên, như kiểu người thật nhắn tin ngắt quãng.
Ví dụ: ["ờ cái đó á", "để tao nghĩ xíu 🤔", "thì cơ bản là mày cần setup cái env trước", "xong r mới chạy dc"]
CHỈ TRẢ VỀ JSON ARRAY, KHÔNG CÓ TEXT HAY BACKTICK BÊN NGOÀI.`;
    }
    return prompt;
}

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
            if (strings.length > 0) return strings;
        }
    } catch (_) {}

    return cleaned.split('\n').filter((line: string) => line.trim() !== '').slice(0, 4);
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
        await sendSingleMessage(senderId, 'ê lỗi gì r 😵');
        await sleep(randomDelay(500, 1000));
        await sendSingleMessage(senderId, 'thử lại đi nha');
    }
}

async function handleImageMessage(senderId: string, imageUrl: string, caption: string): Promise<void> {
    await sendTypingAction(senderId);

    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const base64Image = Buffer.from(imageResponse.data).toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        const systemPrompt = await getFbSystemPrompt();
        const prompt = `${systemPrompt}\n\nNgười dùng gửi một hình ảnh${caption ? ` với caption: "${caption}"` : ''}. Hãy react và bình luận về hình ảnh này như con người thật.`;

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
        await sendSingleMessage(senderId, 'hình gì mà tao mở ko đc 😅');
        await sleep(randomDelay(500, 1000));
        await sendSingleMessage(senderId, 'gửi lại thử coi');
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

router.post('/facebook/webhook', (req: Request, res: Response) => {
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

router.get('/facebook/debug', async (_req: Request, res: Response) => {
    const checks: Record<string, any> = {
        tokenConfigured: !!FB_PAGE_ACCESS_TOKEN,
        tokenPreview: FB_PAGE_ACCESS_TOKEN ? `${FB_PAGE_ACCESS_TOKEN.substring(0, 10)}...` : 'MISSING',
        verifyTokenConfigured: !!FB_VERIFY_TOKEN,
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

        const recentLogs = await prisma.fbChatLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        checks.recentLogs = recentLogs.map(log => ({
            senderId: log.senderId,
            message: log.message.substring(0, 100),
            response: log.response.substring(0, 200),
            type: log.type,
            createdAt: log.createdAt
        }));
    } catch (_) {
        checks.totalChatLogs = 'DB error';
    }

    res.json(checks);
});

router.get('/facebook/test-send/:psid', async (req: Request, res: Response) => {
    const { psid } = req.params;
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
        res.json({ success: false, error: err.response?.data || err.message });
    }
});

export default router;
