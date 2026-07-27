import { Router, Request, Response } from 'express';
import { bot } from '../../bot/client';
import { TextChannel } from 'discord.js';

const router = Router();

const PING_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '';
const ADMIN_ID = process.env.ADMIN_ID || '';

interface PingButton {
  id: string;
  messages: string[];
}

const BUTTONS: PingButton[] = [
  {
    id: 'hungry',
    messages: [
      '🍕 **[SOS ĐÓI]** Đói mờ mắt rồi, tự xử đi, đừng hỏi "ăn gì".',
      '🧋 **[SOS ĐÓI]** Cấp cứu trà sữa. Hoặc cơm. Hoặc gì cũng được. Nhanh.',
      '🍕 **[SOS ĐÓI]** Bụng đang biểu tình rồi đấy. Ship gì đó ngon ngon đi.',
      '🍗 **[SOS ĐÓI]** Đói đến mức nhìn cái bàn phím cũng muốn gặm. Cứu.',
      '🍕 **[SOS ĐÓI]** Không cần hỏi ăn gì. Mày quyết. Nhanh thôi.',
    ]
  },
  {
    id: 'angry',
    messages: [
      '🤬 **[CẢNH BÁO]** Đang quạu. Tém lại. Gửi meme mèo chửi sếp thì được.',
      '🤬 **[CẢNH BÁO]** Mode quạu ON. Không chọc nhây. Repeat: KHÔNG. CHỌC. NHÂY.',
      '💢 **[CẢNH BÁO]** Ai chọc lúc này thì chết chắc. Cứ im đi là tốt nhất.',
      '🤬 **[CẢNH BÁO]** Đang bực. Meme con mèo = ok. Hỏi "sao vậy?" = die.',
      '😤 **[CẢNH BÁO]** Cái công ty này... thôi khỏi nói. Gửi meme đi.',
    ]
  },
  {
    id: 'shutdown',
    messages: [
      '🪫 **[SẬP NGUỒN]** Vẫn sống, nhưng mệt đéo muốn nói chuyện. Để yên.',
      '🪫 **[SẬP NGUỒN]** Đừng gọi. Đừng nhắn. Đừng suy diễn. Tao chỉ cần nghỉ.',
      '🔋 **[SẬP NGUỒN]** Pin xã hội = 0%. Đang sạc. ETA: không biết.',
      '🪫 **[SẬP NGUỒN]** Chế độ máy bay bật. Không phải ghét ai. Chỉ là mệt.',
      '😶 **[SẬP NGUỒN]** Im lặng ≠ giận. Im lặng = cần không gian. Noted chưa?',
    ]
  },
  {
    id: 'summon',
    messages: [
      '🧞‍♂️ **[TRIỆU HỒI]** *Ting ting~* Có ai ở đó không? Trả lời ngay.',
      '🧞‍♂️ **[TRIỆU HỒI]** Nút quyền lực đã được bấm. Phản hồi đi, Khầy.',
      '👑 **[TRIỆU HỒI]** Bà hoàng đang rảnh. Xuất hiện ngay và luôn.',
      '🧞‍♂️ **[TRIỆU HỒI]** Không có việc gì đâu. Chỉ muốn xem mày có phản hồi nhanh không thôi.',
      '✨ **[TRIỆU HỒI]** Test nhanh: mày có online không? Trả lời trong 3 phút.',
    ]
  }
];

const VALID_IDS = BUTTONS.map(b => b.id);

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 10000;

router.post('/ping-sos', async (req: Request, res: Response) => {
  try {
    const { buttonId } = req.body;

    if (!buttonId || !VALID_IDS.includes(buttonId)) {
      return res.status(400).json({ error: 'Nút không hợp lệ' });
    }

    const now = Date.now();
    const lastPress = cooldowns.get(buttonId) || 0;
    if (now - lastPress < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastPress)) / 1000);
      return res.status(429).json({ error: `Từ từ thôi, chờ ${remaining}s nữa` });
    }
    cooldowns.set(buttonId, now);

    const button = BUTTONS.find(b => b.id === buttonId)!;
    const msg = button.messages[Math.floor(Math.random() * button.messages.length)];

    if (!PING_CHANNEL_ID) {
      return res.status(500).json({ error: 'Chưa config channel' });
    }

    const channel = await bot.channels.fetch(PING_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      return res.status(500).json({ error: 'Không tìm thấy channel' });
    }

    const mention = ADMIN_ID ? ` <@${ADMIN_ID}>` : '';
    await (channel as TextChannel).send(`${msg}${mention}`);

    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[PingSOS] Error:', err.message);
    return res.status(500).json({ error: 'Lỗi rồi, thử lại đi' });
  }
});

export default router;
