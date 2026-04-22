# 🤖 ChatDVT — AI Prompting & Config Rules

> **BẮT BUỘC ĐỌC FILE NÀY TRƯỚC KHI TƯƠNG TÁC VỚI AI/GEMINI.**

---

## NGUYÊN TẮC TỐI THƯỢNG (SINGLE SOURCE OF TRUTH)

Mọi thao tác, logic, cấu hình liên quan đến Gemini hoặc bất kỳ AI nào trong dự án này **ĐỀU ĐƯỢC VIẾT TẬP TRUNG TẠI FILE:**
👉 `src/bot/services/gemini.ts`

**❌ KHÔNG ĐƯỢC PHÉP:**
1. Khai báo model lạ (như `gemini-1.5-flash`, `gemini-2.5-flash`) rải rác khắp nơi. Mọi config model (`GEMINI_CHAT_CONFIG`, `GEMINI_LOGIC_CONFIG`) đều được kéo từ `src/config/constants.ts` sang `gemini.ts`.
2. Tự chế ra các hàm xử lý AI mới nếu trong `gemini.ts` đã có hàm tương đương.
3. Không tự chế cơ chế retry hay clean JSON. Hãy nhìn cách `gemini.ts` xử lý (như `retryWithBackoff`, `escapeMarkdown`, hoặc các hàm xử lý logic prompt) và tái sử dụng/tuân thủ y hệt định dạng đó.

**✅ CÁCH LÀM ĐÚNG:**
Khi bạn cần tạo một tính năng AI mới (như English Course, Tarot, Tử Vi...), bạn CHỈ CẦN:
- Mở file `src/bot/services/gemini.ts` ra đọc.
- Bắt chước chính xác luồng gọi AI, cách bắt lỗi (try/catch), cách ép JSON, và cách gọi model name từ đó.
- Nếu là logic backend, viết thêm hàm service vào thẳng `gemini.ts` (hoặc module tương đương nếu được yêu cầu) và gọi ra.
- Nếu ở Client cần BYOK (Bring Your Own Key), hãy tham chiếu chính xác cấu hình `modelName` và logic tương tự như cách `gemini.ts` đang làm.
