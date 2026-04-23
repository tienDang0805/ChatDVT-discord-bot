# 📖 ChatDVT — Master AI Coding Rules

> **File này là ENTRY POINT. AI phải đọc file này ĐẦU TIÊN trước khi làm bất kỳ task nào.**

---

## Quick Reference — Đọc file nào?

| Task | Files cần đọc |
|:-----|:--------------|
| Bất kỳ task nào | `RULES_MASTER.md` (file này) |
| Backend / API / Bot | `RULES_BACKEND.md` |
| Client / UI / Frontend | `RULES_CLIENT.md` |
| Thêm feature mới (client) | `RULES_CLIENT.md` + `client/feat_rule.md` + `client/rule_ui.md` |
| Liên quan Gemini AI | `RULES_BACKEND.md` §3 + `client/rule_ai.md` |
| English Hub | `client/rule_english_hub.md` |

---

## Project Identity

- **Tên**: ChatDVT — Discord Bot + Web Portal
- **Kiến trúc**: Hybrid Monolith (1 Node.js process = Bot + API + Static Server)
- **Database**: SQLite via Prisma ORM
- **AI Engine**: Google Gemini (model: `gemini-3-flash-preview`) + Imagen 4.0
- **Frontend**: Vite + React 18 + TailwindCSS 3
- **Ngôn ngữ**: TypeScript strict mode

---

## 10 Quy Tắc Vàng

1. **AI logic = `src/bot/services/gemini.ts`** — Mọi thứ liên quan Gemini phải đi qua file này
2. **Model names = `src/config/constants.ts`** — KHÔNG hardcode model name ở bất kỳ đâu khác
3. **Feature isolation** — Mỗi feature = 1 folder, KHÔNG cross-import giữa features
4. **Public vs Admin** — Client features chia rõ `features/public/` vs `features/admin/`
5. **PageShell bắt buộc** — Mọi public page phải wrap trong `<PageShell>`
6. **Dark mode bắt buộc** — Mọi UI phải support cả Light + Dark
7. **Lazy loading** — Mọi page trong App.tsx phải dùng `React.lazy()`
8. **Auth whitelist** — Thêm public API → phải thêm vào middleware whitelist (`server.ts`)
9. **Static serve cuối cùng** — Express static + catch-all `*` PHẢI ở cuối `server.ts`
10. **TypeScript pass** — Code phải pass `tsc --noEmit` trước khi ship

---

## Tech Stack Summary

### Backend
```
Runtime:    Node.js ≥ 16.9
Language:   TypeScript (ES2020, CommonJS)
Framework:  Express 4 + discord.js 14
Database:   Prisma 5 + SQLite
AI:         @google/generative-ai + @google/genai
Real-time:  Socket.IO 4
Auth:       JWT (jsonwebtoken)
File:       multer (memory storage, 25MB limit)
Scheduler:  node-cron
Dev:        nodemon + ts-node
```

### Frontend
```
Build:      Vite 4
Framework:  React 18 (lazy + Suspense)
Language:   TypeScript
Styling:    TailwindCSS 3 (dark mode: class)
Routing:    react-router-dom 6
HTTP:       Axios (proxy /api → :3000)
Icons:      lucide-react
Animation:  framer-motion + CSS keyframes
Toast:      react-hot-toast
Charts:     recharts
Markdown:   react-markdown + remark-gfm
```

---

## Key File Locations

| Cần gì | File |
|:-------|:-----|
| Entry point | `src/index.ts` |
| API routes | `src/api/server.ts` (monolith ~2700 lines) |
| Bot client | `src/bot/client.ts` |
| AI service | `src/bot/services/gemini.ts` (~1100 lines) |
| Model config | `src/config/constants.ts` |
| DB schema | `prisma/schema.prisma` |
| DB client | `src/database/prisma.ts` |
| Client entry | `client/src/main.tsx` |
| Client routing | `client/src/App.tsx` |
| API client | `client/src/shared/api/index.ts` |
| Theme | `client/src/shared/contexts/ThemeContext.tsx` |
| Page wrapper | `client/src/shared/components/PageShell.tsx` |
| Env config | `.env` |

---

## Checklist Thêm Feature End-to-End

```
BACKEND:
□ Thêm API route trong src/api/server.ts
□ Nếu cần AI → thêm method trong gemini.ts hoặc gọi generateJSON()
□ Nếu public → thêm path vào auth bypass whitelist
□ Nếu cần DB → thêm model trong prisma/schema.prisma + migrate

CLIENT:
□ Tạo folder features/public/[name]/pages/
□ Tạo [Name].tsx với PageShell wrapper
□ Export named + default
□ App.tsx: lazy import + Route
□ PublicPortal: thêm card (nếu public)
□ shared/api/index.ts: thêm API function (nếu cần)
□ Support Light + Dark mode
□ Test mobile 375px
□ TypeScript: tsc --noEmit pass
```
