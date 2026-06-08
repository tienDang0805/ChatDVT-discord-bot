import { Router } from 'express';
import axios from 'axios';
import { geminiService } from '../../bot/services/gemini';

const router = Router();

const PLATFORMS: Record<string, string> = {
  tiktok: '🎵 TikTok',
  facebook: '📘 Facebook',
  instagram: '📸 Instagram',
  youtube: '▶️ YouTube',
  twitter: '🐦 X/Twitter',
  other: '📱 Khác',
};

router.post('/detox-summary', async (req, res) => {
  res.status(204).end();

  const webhookUrl = process.env.DiscrodTrackingWebhook;
  if (!webhookUrl) return;

  try {
    const { day, log, mood, note, score, startDate } = req.body;
    if (!day || !log) return;

    const slips: any[] = log.slips || [];
    const slipCount = slips.length;
    const totalMins = slips.reduce((a: number, s: any) => a + (s.minutes || 0), 0);
    const isPerfect = slipCount === 0;

    const slipDetails = slips.map((s: any) => {
      const pName = PLATFORMS[s.platform] || s.platform;
      return `- ${s.time} | ${pName} | ${s.minutes}m | Lý do: ${s.reason}${s.note ? ` | Ghi chú: "${s.note}"` : ''}`;
    }).join('\n');

    let aiSummary = '';

    if (slipCount > 0) {
      const prompt = `Bạn là chuyên gia tâm lý hành vi và digital wellness. Phân tích dữ liệu cách ly MXH ngày ${day}/30 của user.

DỮ LIỆU:
- Ngày: ${day}/30 (bắt đầu ${startDate})
- Tổng slip: ${slipCount} lần, tổng ${totalMins} phút
- Check-in sáng: ${log.morningTs ? 'Có' : 'Không'}
- Tâm trạng cuối ngày: ${mood}
- Tự chấm kỷ luật: ${score}/10
- Ghi chú user: "${note || 'Không có'}"

CHI TIẾT TỪNG LẦN SLIP:
${slipDetails}

YÊU CẦU:
1. Phân tích pattern: Thời điểm nào hay slip? App nào dính nhất? Lý do chủ yếu?
2. Nhận diện trigger: Cảm xúc/hoàn cảnh nào dẫn đến slip?
3. Đánh giá: So với ngày trước có cải thiện không? (ngày ${day} trong hành trình 30 ngày)
4. Lời khuyên cụ thể: 2-3 tips ngắn gọn cho ngày mai
5. Động viên: 1 câu động viên chân thành

Trả lời bằng tiếng Việt, ngắn gọn, đi thẳng vào vấn đề. Tối đa 200 từ. Không dùng bullet points dài dòng.`;

      try {
        const aiResult = await geminiService.generateText(prompt);
        aiSummary = typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult);
      } catch {
        aiSummary = 'Không thể phân tích AI lúc này.';
      }
    }

    const fields: any[] = [
      { name: '📅 Ngày', value: `**${day}/30**`, inline: true },
      { name: `${isPerfect ? '🎉' : '🚨'} Slip`, value: isPerfect ? '**0 — PERFECT!**' : `**${slipCount} lần · ${totalMins} phút**`, inline: true },
      { name: '⭐ Tự chấm', value: `**${score}/10**`, inline: true },
    ];

    if (log.morningTs) {
      fields.push({ name: '☀️ Check-in sáng', value: new Date(log.morningTs).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }), inline: true });
    }

    fields.push({ name: `${mood} Tâm trạng`, value: mood, inline: true });

    if (note) {
      fields.push({ name: '📝 Ghi chú', value: note.substring(0, 200), inline: false });
    }

    if (slipCount > 0) {
      const slipSummary = slips.map((s: any) => {
        const pName = PLATFORMS[s.platform] || s.platform;
        const noteStr = s.note ? `\n  └ _"${s.note.substring(0, 80)}"_` : '';
        return `\`${s.time}\` ${pName} · ${s.minutes}m · ${s.reason}${noteStr}`;
      }).join('\n');
      fields.push({ name: '📋 Chi tiết slip', value: slipSummary.substring(0, 1000), inline: false });
    }

    if (aiSummary) {
      fields.push({ name: '🤖 AI Phân Tích', value: aiSummary.substring(0, 1000), inline: false });
    }

    const color = isPerfect ? 0x22c55e : slipCount <= 2 ? 0xeab308 : 0xef4444;
    const title = isPerfect
      ? `🎉 Ngày ${day}/30 — PERFECT DAY!`
      : `📊 Ngày ${day}/30 — ${slipCount} slip · ${totalMins}m`;

    const embed = {
      title,
      color,
      fields,
      timestamp: new Date().toISOString(),
      footer: { text: `Digital Detox · Day ${day}/30 · Score ${score}/10` },
    };

    await axios.post(webhookUrl, {
      username: '📵 Digital Detox Tracker',
      embeds: [embed],
    }).catch(() => {});
  } catch (err) {
    console.error('[Detox Summary] Error:', err);
  }
});

export default router;
