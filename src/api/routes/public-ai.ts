import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '../../database/prisma';
import { geminiService } from '../../bot/services/gemini';
import { GEMINI_CHAT_CONFIG } from '../../config/constants';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const router = Router();

// --- Food Wheel API (Phong Thuy) ---
router.post('/food-wheel', async (req, res) => {
    try {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json(data);
    } catch (err) {
        console.error('Food wheel error:', err);
        res.status(500).json({ error: 'AI đang ngủ, thầy phong thuỷ mất điện rồi!' });
    }
});

// --- Excuse Generator API ---
router.post('/excuse-generator', async (req, res) => {
    try {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json(data);
    } catch (err) {
        console.error('Excuse generator error:', err);
        res.status(500).json({ error: 'Cỗ máy bị hỏng gạch, sếp bắt đi làm rồi!' });
    }
});

// --- Handsome Analyzer API ---
router.post('/handsome-analyzer', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'Chưa có ảnh upload!' });

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

        const prompt = `Bạn là DIỆP-LOING-NING 3000, cỗ máy AI phân tích nhan sắc cực kỳ xảo lồng, mỏ hỗn và hay dìm hàng người khác. 
Hãy phân tích bức ảnh này và đưa ra nhận xét về độ đẹp trai/xinh gái của người trong ảnh.
BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON VỚI CẤU TRÚC SAU:
{
  "score": <số nguyên từ -100 đến 10>,
  "overall": "<1 câu tổng kết cực kỳ phũ phàng, dìm hàng tổng thể>",
  "features": [
    {
      "part": "<Bộ phận (vd: Mắt, Mũi, Môi, Tóc, Cằm...)>",
      "comment": "<Nhận xét mỏ hỗn dựa trên phân tích chi tiết bộ phận đó>",
      "rating": <số điểm từ 1 đến 10>
    }
  ],
  "advice": "<1 lời khuyên xảo chó, mất dạy (vd: khuyên nên đi bọc thép khuôn mặt, đeo khẩu trang...)>"
}`;

        const mediaParts = [{ inlineData: { data: base64Data, mimeType } }];
        const textResult = await geminiService.generateTextWithMedia(prompt, mediaParts, 'global', req.body.geminiApiKey);
        let text = textResult.trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        
        res.json({ result: JSON.parse(text) });
    } catch (err: any) {
        console.error('Handsome analyzer error:', err.message);
        res.status(500).json({ error: 'AI đang bận đi khám mắt, không thể phân tích nhan sắc lúc này! Trả lại ảnh cho mày.' });
    }
});

// --- CV Reviewer & Rewriter API ---
router.post('/cv-reviewer', upload.single('cvFile'), async (req, res) => {
    try {
        const file = req.file;
        const mode = req.body.mode;
        
        if (!file) return res.status(400).json({ error: 'Chưa đính kèm file CV!' });
        if (mode !== 'review' && mode !== 'rewrite') return res.status(400).json({ error: 'Chế độ không hợp lệ.' });

        const customPrompt = req.body.customPrompt || '';
        const reviewContext = req.body.reviewContext ? JSON.parse(req.body.reviewContext) : undefined;
        const customApiKey = req.body.geminiApiKey || '';

        // Document parsing
        const documentContent: any[] = [];
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            documentContent.push({ inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype } });
        } else if (file.originalname.endsWith('.txt') || file.originalname.endsWith('.md')) {
            documentContent.push({ text: `Nội dung CV:\n${file.buffer.toString('utf-8')}` });
        } else if (file.originalname.endsWith('.docx') || file.originalname.endsWith('.doc')) {
            const mammoth = require('mammoth');
            const textResult = await mammoth.extractRawText({ buffer: file.buffer });
            documentContent.push({ text: `Nội dung CV:\n${textResult.value}` });
        } else {
            return res.status(400).json({ error: "Định dạng file không được hỗ trợ. Chỉ nhận PDF, Ảnh, Word (.docx), TXT, MD." });
        }

        let prompt = '';
        if (mode === 'review') {
            prompt = `Bạn là một Giám đốc Nhân sự (HR) cấp cao & Chuyên gia ATS System. Nhiệm vụ của bạn là phân tích CV này một cách cực kỳ khắt khe, chi tiết và chuyên nghiệp nhất.
BẮT BUỘC TRẢ VỀ CHUẨN JSON VỚI CẤU TRÚC:
{
  "score": <Số nguyên 1-100>,
  "level": "<Intern/Fresher/Junior/Mid-level/Senior/Lead...>",
  "overall": "<1 Câu tóm tắt đánh giá>",
  "critiques": [{ "issue": "<Lỗ hổng>", "advice": "<Giải pháp>" }],
  "strengths": ["<Điểm sáng>"],
  "development": { "missingSkills": ["<Kỹ năng thiếu>"], "nextSteps": ["<Hành động>"] }
}`;
        } else {
            prompt = `Bạn là một Chuyên gia viết CV (Resume Writer) top đầu tại Thung lũng Silicon.
${reviewContext ? `\n[KẾT QUẢ ĐÁNH GIÁ CV GỐC]:\n${JSON.stringify(reviewContext, null, 2)}\n` : ''}
BẮT BUỘC TRẢ VỀ JSON:
{
  "personalInfo": { "fullName": "", "title": "", "email": "", "phone": "", "portfolio": "", "summary": "" },
  "experience": [{ "company": "", "role": "", "duration": "", "description": "" }],
  "education": [{ "school": "", "degree": "", "duration": "", "gpa": "" }],
  "skills": [""],
  "projects": [{ "name": "", "duration": "", "description": "" }],
  "customSections": [{ "id": "", "title": "", "items": [{ "name": "", "duration": "", "description": "" }] }]
}`;
            if (customPrompt && customPrompt.trim() !== '') {
                prompt += `\n\n[YÊU CẦU ĐẶC BIỆT]:\n"${customPrompt}"`;
            }
        }

        const textResult = await geminiService.generateTextWithMedia(prompt, documentContent, 'global', customApiKey || undefined);
        let text = textResult.trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        const result = JSON.parse(text);
        
        res.json({ result });
    } catch (err: any) {
        console.error('CV Reviewer error:', err.message);
        res.status(500).json({ error: err.message || 'Lỗi phân tích CV. Vui lòng thử lại.' });
    }
});

// --- Numerology API ---
router.post('/numerology', async (req, res) => {
    try {
        const { fullName, birthDate } = req.body;
        if (!fullName || !birthDate) return res.status(400).json({ error: 'Cần nhập Họ tên và Ngày sinh!' });

        const numerologyPrompt = `Bạn là MỘT CHUYÊN GIA THẦN SỐ HỌC (NUMEROLOGY) BẬC THẦY.
THÔNG TIN: Họ tên: "${fullName}", Ngày sinh: ${birthDate}, Năm hiện tại: ${new Date().getFullYear()}
Hãy phân tích CHI TIẾT theo Pythagoras: Life Path, Expression, Soul Urge, Personality, Birthday, Personal Year, Maturity, Pythagoras Chart, Pinnacles, Challenges, Karmic Debt, Hidden Passion.
BẮT BUỘC TRẢ VỀ JSON với đầy đủ các field: lifePath, expression, soulUrge, personality, birthday, maturity, personalYear, pythagorasChart, pinnacles, challenges, karmicDebt, hiddenPassion, compatibility, luckyInfo, famousPeople, lifePhases, monthlyForecast, overallReading, detailedCareer, detailedLove, detailedHealth, detailedFinance, spiritualMessage.`;
        const result = await geminiService.generateJSON(numerologyPrompt, null, 'global', req.body.geminiApiKey);
        res.json({ result });
    } catch (err: any) {
        console.error('Numerology API error:', err.message);
        res.status(500).json({ error: 'AI đang thiền định, không thể giải mã thần số lúc này!' });
    }
});

router.post('/numerology/chat', async (req, res) => {
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

        const answer = (await geminiService.generateText(prompt, 'global', req.body.geminiApiKey)).trim();
        res.json({ answer });
    } catch (err: any) {
        console.error('Numerology chat error:', err.message);
        res.status(500).json({ error: 'AI đang bận thiền, thử lại nhé!' });
    }
});

// --- Gender Quiz API ---
router.post('/gender-quiz/generate', async (req, res) => {
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

        const questions = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json({ questions });
    } catch (err: any) {
        console.error('Gender quiz generate error:', err.message);
        res.status(500).json({ error: 'AI đang bận suy ngẫm về giới tính, thử lại nhé!' });
    }
});

router.post('/gender-quiz/analyze', async (req, res) => {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json({ result: data });
    } catch (err: any) {
        console.error('Gender quiz analyze error:', err.message);
        res.status(500).json({ error: 'AI gặp khó khăn khi phân tích, thử lại nhé!' });
    }
});

router.post('/gender-quiz/chat', async (req, res) => {
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

        const answer = (await geminiService.generateText(prompt, 'global', req.body.geminiApiKey)).trim();
        res.json({ answer });
    } catch (err: any) {
        console.error('Gender quiz chat error:', err.message);
        res.status(500).json({ error: 'AI bận, thử lại nhé!' });
    }
});

// --- Astrology API (Tử Vi Đông Phương) ---
router.post('/astrology', async (req, res) => {
    try {
        const { fullName, gender, birthDate, birthTime } = req.body;
        if (!fullName || !gender || !birthDate || !birthTime) {
            return res.status(400).json({ error: 'Cần nhập đầy đủ: Họ tên, Giới tính, Ngày sinh, Giờ sinh!' });
        }

        const astrologyPrompt = `Bạn là CHIÊM TINH GIA & ĐẠI SƯ TỬ VI ĐẨU SỐ Phương Đông hàng đầu.
THÔNG TIN: Họ tên: ${fullName}, Giới tính: ${gender}, Ngày sinh DL: ${birthDate}, Giờ sinh: ${birthTime}
Lập lá số tử vi và bình giải. BẮT BUỘC TRẢ VỀ JSON:
{
  "summary": { "canchi": "", "amDuong": "", "banMenh": "", "cuc": "" },
  "overview": "<4-5 câu tổng quan>",
  "houses": [{ "name": "", "stars": "", "description": "" }],
  "currentYearForecast": "",
  "advice": "",
  "spiritQuote": ""
}`;
        const result = await geminiService.generateJSON(astrologyPrompt, null, 'global', req.body.geminiApiKey);
        res.json({ result });
    } catch (err: any) {
        console.error('Astrology API error:', err.message);
        res.status(500).json({ error: err.message || 'Thầy tử vi đang bận tu tiên, vui lòng thử lại sau!' });
    }
});

router.post('/astrology/chat', async (req, res) => {
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

        const answer = (await geminiService.generateText(prompt, 'global', req.body.geminiApiKey)).trim();
        res.json({ answer });
    } catch (err: any) {
        console.error('Astrology chat API error:', err.message);
        res.status(500).json({ error: 'Dây thiên cơ đang nhiễu, không phản hồi được!' });
    }
});

// --- Burnout Check API ---
router.post('/burnout-check/questions', async (req, res) => {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json(data);
    } catch (err: any) {
        console.error('Burnout questions error:', err.message);
        res.status(500).json({ error: 'AI đang nghĩ câu hỏi, thử lại nhé!' });
    }
});

router.post('/burnout-check/analyze', async (req, res) => {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json(data);
    } catch (err: any) {
        console.error('Burnout analyze error:', err.message);
        res.status(500).json({ error: 'AI cũng burnout rồi, thử lại nhé!' });
    }
});


// --- Deep Status Generator API ---
router.post('/deep-status', async (req, res) => {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json(data);
    } catch (err: any) {
        console.error('Deep Status error:', err.message);
        res.status(500).json({ error: 'Cảm xúc quá sâu, AI xử lý không kịp!' });
    }
});

// --- Magic 8 Ball API ---
router.post('/magic-ball', async (req, res) => {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json(data);
    } catch (err: any) {
        console.error('Magic Ball error:', err.message);
        res.status(500).json({ error: 'Cầu pha lê đang mờ, thử lại nhé!' });
    }
});

// --- Tarot AI API ---
router.post('/tarot', async (req, res) => {
    try {
        const { topic, question, drawnCards } = req.body;
        if (!topic || !drawnCards || !Array.isArray(drawnCards) || drawnCards.length !== 3) {
            return res.status(400).json({ error: 'Cần chọn chủ đề và rút đúng 3 lá bài!' });
        }

        const cardsDescription = drawnCards.map((c: any) => 
            `- Vị trí "${c.position}": Lá bài "${c.name}" (${c.nameVi}) — ${c.isReversed ? 'NGƯỢC (Reversed)' : 'XUÔI (Upright)'}`
        ).join('\n');
        const tarotPrompt = `Bạn là MỘT PHÁP SƯ TAROT HUYỀN BÍ bậc thầy.
CHỦ ĐỀ: ${topic}
${question ? `CÂU HỎI: "${question}"` : 'Bói tổng quát theo chủ đề.'}
CÁC LÁ BÀI (Quá Khứ — Hiện Tại — Tương Lai):
${cardsDescription}
BẮT BUỘC TRẢ VỀ JSON:
{
  "overallReading": "<4-5 câu tổng quan>",
  "cards": [{ "position": "", "interpretation": "", "energy": "positive|negative|neutral", "keywords": [""] }],
  "advice": "<3-4 câu lời khuyên>",
  "luckyInfo": { "element": "", "color": "", "number": 0, "timing": "" },
  "spiritMessage": "<2-3 câu thông điệp tâm linh>"
}`;
        const result = await geminiService.generateJSON(tarotPrompt, null, 'global', req.body.geminiApiKey);
        res.json({ result });
    } catch (err: any) {
        console.error('Tarot API error:', err.message);
        res.status(500).json({ error: err.message || 'Pháp sư đang nhập định, không thể giải bài lúc này!' });
    }
});

router.post('/tarot/chat', async (req, res) => {
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

        const answer = (await geminiService.generateText(prompt, 'global', req.body.geminiApiKey)).trim();
        res.json({ answer });
    } catch (err: any) {
        console.error('Tarot chat error:', err.message);
        res.status(500).json({ error: 'Pháp sư đang thiền, thử lại nhé!' });
    }
});

router.post('/poem-generator', async (req, res) => {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
        res.json(data);
    } catch (err: any) {
        console.error('Poem Generator error:', err.message);
        res.status(500).json({ error: 'Thi hứng đang dở dang, thử lại nhé!' });
    }
});

router.post('/chibi-sticker', upload.single('image'), async (req, res) => {
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

router.post('/face-reader', upload.single('image'), async (req, res) => {
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

        const textResult = await geminiService.generateTextWithMedia(prompt, [{ inlineData: { data: imageBase64, mimeType } }], 'global', apiKey);
        let text = textResult.trim();
        if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        res.json(JSON.parse(text));
    } catch (err: any) {
        console.error('Face Reader error:', err.message);
        res.status(500).json({ error: 'Thầy bói đang bận chạy KPI, thử lại sau nhé!' });
    }
});

router.post('/dream-interpreter', async (req, res) => {
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

        const data = await geminiService.generateJSON(prompt, null, 'global', apiKey);
        res.json(data);
    } catch (err: any) {
        console.error('Dream Interpreter error:', err.message);
        res.status(500).json({ error: 'Chu Công đang bận đánh cờ, nãy chưa nghe rõ, thử lại nhé!' });
    }
});

router.post('/face-reader/chat', async (req, res) => {
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

        const text = (await geminiService.generateText(prompt, 'global', apiKey)).trim();
        res.json({ text });
    } catch (err: any) {
        console.error('Face reader chat error:', err.message);
        res.status(500).json({ error: 'Thầy đang bận đếm tiền cúng tổ, hỏi lại sau nhé!' });
    }
});

router.post('/dream-interpreter/chat', async (req, res) => {
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

        const text = (await geminiService.generateText(prompt, 'global', apiKey)).trim();
        res.json({ text });
    } catch (err: any) {
        console.error('Dream interpreter chat error:', err.message);
        res.status(500).json({ error: 'Chu Công đang bận đánh cờ tướng với Tiên đế, thử lại nhé!' });
    }
});

router.post('/tech-duel/consult', async (req, res) => {
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

router.post('/tech-duel/compare', async (req, res) => {
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

router.post('/tech-duel/chat', async (req, res) => {
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
router.post('/english/chat', async (req, res) => {
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

router.post('/english/challenge', async (req, res) => {
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

router.post('/english/review', async (req, res) => {
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
router.post('/web-chat', async (req, res) => {
    try {
        const { message, history, geminiApiKey } = req.body;
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        let systemPromptText = `Bạn là chatDVT, trợ lý AI trên web portal ChatDVT. Trả lời ngắn gọn, thân thiện, dùng tiếng Việt, giọng hơi bựa nhưng có tâm.

# THÔNG TIN KHOÁ HỌC AI TRAINING
Portal đang quảng bá khoá học "Claude AI - Vô Thượng Đạo":
- Chủ đề: Vượt qua 69 kiếp nạn để chinh phục chân kinh - Học dùng Claude AI tự động hoá công việc
- Giá: 6,999,000 VND toàn khoá
- Hình thức: LIVE Online, 3 buổi (Chủ nhật 6:00-7:30 PM giờ VN)
- Lịch: 10/5, 17/5, 24/5
- Lợi ích: Nâng cao tư duy AI, cài đặt dùng AI với file thật, tạo task tự động, giao việc AI từ điện thoại, xác định lộ trình AI, xem recorded video, tham gia cộng đồng
- Không yêu cầu biết code

# VỀ PORTAL
Portal có 28+ tính năng AI: Food Wheel, Tarot, Tech Duel, Chibi Sticker, Face Reader, Dream Interpreter, Poem Generator, English Hub, Mermaid Editor, v.v. Tất cả đều dùng AI (Gemini). Portal do Tiến Đặng (mobile dev) xây dựng.

Khi user hỏi về khoá học, hãy giới thiệu nhiệt tình và khuyến khích đăng ký. Khi hỏi về portal, giới thiệu các tính năng nổi bật.`;
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


export default router;
