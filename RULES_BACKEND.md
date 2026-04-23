# 🏗️ ChatDVT — Backend Architecture & Coding Rules

> **BẮT BUỘC ĐỌC FILE NÀY + `RULES_CLIENT.md` TRƯỚC KHI VIẾT BẤT KỲ CODE NÀO.**

---

## 1. Tổng Quan Kiến Trúc

**Hybrid Monolith** — 1 process Node.js chạy đồng thời:
- **Discord Bot** (discord.js v14) — slash commands, message handler, RPG game system
- **Express API Server** (port 3000) — REST API + Socket.IO cho web client
- **Prisma ORM** — SQLite database (`prisma/bot.db`)

```
src/
├── index.ts                 # Entry point — khởi tạo bot + API server
├── api/
│   ├── server.ts            # Express app + Socket.IO + TẤT CẢ routes (monolith)
│   └── routes/              # (trống — chưa tách route)
├── bot/
│   ├── client.ts            # BotClient class — extend Discord.js Client
│   ├── commands/             # 27 slash commands (auto-loaded từ folder)
│   ├── events/               # 3 event handlers
│   │   ├── ready.ts          #   Bot ready + cron jobs + command registration
│   │   ├── messageCreate.ts  #   Message handler (AI chat, vision, auto-reply)
│   │   └── interactionCreate.ts # Slash command + button + modal dispatcher
│   ├── services/             # Business logic layer
│   │   ├── gemini.ts         #   ⭐ CORE — Mọi AI logic tập trung tại đây
│   │   ├── pet.ts            #   Pet/RPG system
│   │   ├── quiz.ts           #   Quiz game engine
│   │   ├── shop.ts           #   Shop/economy system
│   │   ├── pk.ts             #   PvP battle system
│   │   ├── tower.ts          #   Tower climbing game
│   │   ├── expedition.ts     #   Expedition game
│   │   ├── couple.ts         #   Couple/relationship system
│   │   ├── identity.ts       #   User identity management
│   │   ├── webQuiz.ts        #   Web quiz (SSE-based)
│   │   ├── logger.ts         #   System logger → DB
│   │   └── ...
│   └── scripts/
│       └── migrate_pets.ts   # One-off migration script
├── config/
│   └── constants.ts          # ENV loader + Gemini model configs
├── database/
│   └── prisma.ts             # Prisma client singleton
└── utils/
    ├── helpers.ts            # isReplyingToBot()
    └── messageHelper.ts      # sendLongMessage() — chunk 1900 chars
```

---

## 2. Startup Flow

```
index.ts
  ├── Polyfill fetch (node-fetch cho Node < 18)
  ├── startApiServer()        → Express listen port 3000
  └── bot.start(token)
       ├── loadCommands()     → scan bot/commands/*.ts, register vào Collection
       ├── Register events    → interactionCreate, messageCreate, ready
       └── client.login()
            └── ready event
                 ├── setActivity()
                 ├── Cron: checkFridayAnnouncement (mỗi 60s)
                 ├── Cron: NASA APOD (8h sáng daily)
                 └── REST.put(applicationCommands) → sync slash commands
```

---

## 3. Quy Tắc AI / Gemini (QUAN TRỌNG NHẤT)

### Single Source of Truth

| File | Vai trò |
|:-----|:--------|
| `src/config/constants.ts` | Model names, generation configs |
| `src/bot/services/gemini.ts` | **MỌI** logic AI tập trung tại đây |

### Model Configs

```typescript
GEMINI_CHAT_CONFIG = {
  modelName: "gemini-3-flash-preview",
  generationConfig: { temperature: 2.0, topP: 0.95, topK: 40, maxOutputTokens: 8192 }
}

GEMINI_LOGIC_CONFIG = {
  modelName: "gemini-3-flash-preview",
  generationConfig: { temperature: 0.9, topK: 1, topP: 1 }
}

IMAGEN_MODEL = "imagen-4.0-generate-001"
```

### GeminiService API

| Method | Mục đích | Model Type |
|:-------|:---------|:-----------|
| `generateResponse()` | Chat thường (có history) | chat |
| `ImageToTextAI()` | Phân tích ảnh | chat |
| `VideoToTextAI()` | Phân tích video | chat |
| `AudioToTextAI()` | Phân tích audio | chat |
| `generateImage()` | Tạo ảnh (Imagen) | image |
| `generateAudioWithContext()` | TTS | REST API |
| `chatWithSearch()` | Chat + Google Search | search |
| `summarizeMessages()` | Tóm tắt tin nhắn | chat |
| `generateAutoReply()` | Auto-reply khi tag admin | chat |
| `generatePKResponse()` | PK game logic (JSON) | logic |
| `generateJSON<T>()` | Generic JSON generation | logic |
| `analyzeHandsome()` | Phân tích nhan sắc (JSON) | logic |
| `analyzeCV()` | Review/Rewrite CV | logic |
| `analyzeNumerology()` | Thần số học | logic |
| `getSystemPrompt()` | Build system prompt động | — |

### Quy tắc bất di bất dịch

```
❌ KHÔNG tự khai báo model name rải rác (dùng constants.ts)
❌ KHÔNG tự chế retry logic (dùng retryWithBackoff())
❌ KHÔNG tự parse JSON (dùng generateJSON<T>())
❌ KHÔNG tạo GoogleGenerativeAI instance mới nếu gemini.ts đã có method
✅ Thêm method mới vào GeminiService class trong gemini.ts
✅ Dùng getModel() để lấy model (tự handle API key, safety settings)
✅ Dùng retryWithBackoff() wrap mọi API call
✅ Log qua LoggerService
```

### API Key Resolution (ưu tiên cao → thấp)

```
1. customApiKey (truyền trực tiếp)
2. GuildConfig.geminiApiKey (per-server)
3. BotConfig.geminiApiKey (global DB)
4. process.env.GEMINI_API_KEY (ENV fallback)
```

### System Prompt Pipeline

```
getSystemPrompt(guildId, userId, feature)
  ├── 1. GuildConfig.systemPrompts[feature]     (per-server override)
  ├── 2. BotConfig.systemPrompts[feature]       (global fallback)
  ├── 3. compileToMarkdown()                    (recursive object → markdown)
  ├── 4. UserIdentity context                   (nickname, signature)
  ├── 5. Bot Persona context                    (identity, personality, style)
  └── 6. Core Rules                             (env CORE_RULES)
```

---

## 4. Database Schema (Prisma + SQLite)

### Models Chính

| Model | Mục đích | Key Fields |
|:------|:---------|:-----------|
| `ChatLog` | Lịch sử chat AI | guildId, userId, content, response, type |
| `UserIdentity` | Profile user | userId (unique), nickname, signature, money |
| `Pet` | RPG pet system | ownerId, stats/skills/traits (JSON), level, exp |
| `GuildConfig` | Config per-server | guildId (unique), systemPrompts, activeModules (JSON) |
| `BotConfig` | Config global | key (unique: 'global', 'persona'), features (JSON) |
| `InventoryItem` | RPG inventory | userId, itemId, itemType, quantity |
| `Couple` | Couple system | user1Id, user2Id, affection, level, status |
| `MusicPlaylist` | Music playlists | secretCode (unique), songs (JSON array) |
| `PkBattle` | PvP battles | player1Id, player2Id, winnerId, log (JSON) |
| `TowerProgress` | Tower game | userId (unique), maxFloor |
| `SystemLog` | System logs | level, message, metadata (JSON) |

### JSON Pattern

SQLite không có JSON type → dùng `String` + `JSON.parse/stringify`:

```typescript
const config = await prisma.guildConfig.findUnique({ where: { guildId } });
const modules = JSON.parse(config.activeModules);
modules.persona = newPersonaData;
await prisma.guildConfig.update({
  where: { guildId },
  data: { activeModules: JSON.stringify(modules) }
});
```

### Prisma Client Singleton

```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 5. API Server Architecture

### Middleware Stack

```
1. Socket.IO (cors: '*')
2. CORS (allow all)
3. body-parser JSON (limit 50mb)
4. body-parser urlencoded (limit 50mb)
5. Auth bypass whitelist (public routes)
6. JWT authenticateToken (admin routes)
7. Express static (client/dist — PHẢI CUỐI CÙNG)
8. Catch-all → index.html (SPA fallback — PHẢI CUỐI CÙNG)
```

### Auth System

```
POST /api/login → JWT token (24h expiry)
Header: Authorization: Bearer <token>
Admin credentials: ENV (ADMIN_USERNAME, ADMIN_PASSWORD)
```

### Route Categories

| Category | Auth | Prefix | Ví dụ |
|:---------|:-----|:-------|:------|
| Public API | ❌ | `/api/` | food-wheel, numerology, weather, music, english |
| Admin API | ✅ JWT | `/api/` | config, users, pets, inventory, control-panel |
| Bot Info | ❌ | `/api/bot-info` | Bot status |
| Socket.IO | ❌ | — | 8D chat real-time |

### Public Route Whitelist (QUAN TRỌNG)

Khi thêm API public mới, **BẮT BUỘC** thêm path vào whitelist middleware:

```typescript
app.use((req, res, next) => {
    if (req.path === '/api/login' || 
        req.path.startsWith('/api/your-new-feature/')) {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return authenticateToken(req, res, next);
    }
    next();
});
```

### Thêm API Route Mới

```
1. Viết handler trong server.ts (hoặc tách file nếu phức tạp)
2. Nếu public → thêm vào whitelist middleware
3. Nếu cần AI → gọi geminiService.generateJSON() hoặc method tương ứng
4. Nếu cần file upload → dùng multer middleware đã config
5. Error handling: try/catch + console.error + res.status(500).json()
6. Serve static PHẢI ở cuối cùng (sau tất cả routes)
```

### Socket.IO (8D Chat)

```
Events:
  Server → Client: init_state, chat_update, agent_action_sync, agent_bubble
  Client → Server: chat_message, force_action

State: globalMessages (max 50), globalAgentActions
Auto-rotate: agent states mỗi 10s (AUTONOMOUS_STATES)
```

---

## 6. Discord Bot Architecture

### Command Pattern

```typescript
// bot/commands/[name].ts
export const data = new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('...');

export async function execute(interaction: ChatInputCommandInteraction) {
    // Logic
}
```

Commands auto-loaded từ `bot/commands/` folder → registered globally via REST API.

### Message Flow

```
messageCreate
  ├── Bot message → ignore
  ├── "hi/hello" → hardcoded reply
  ├── Mention admin → generateAutoReply()
  ├── Prefix (!, /, -) → ignore
  ├── Not mentioned bot → ignore
  ├── Has image attachment → ImageToTextAI()
  ├── Has video attachment → VideoToTextAI()
  └── Text only → generateResponse()
       └── Response > 1900 chars → chunk & send
```

### Interaction Flow

```
interactionCreate
  ├── ChatInputCommand → dispatch to command.execute()
  ├── Button
  │   ├── egg_pick_* → petService.handleEggSelection()
  │   ├── free_pet_* → petService.processDailyFreePetPick()
  │   ├── expedition_next → expeditionService.fight()
  │   ├── edit_identity → show Modal
  │   ├── quiz_answer_* → quizService.submitAnswer()
  │   └── ctw_answer_* → ctwService.submitAnswer()
  └── ModalSubmit
      ├── identity_modal → updateIdentity()
      ├── persona_setting_modal → save to GuildConfig
      └── quiz_setup_modal → quizService.startQuiz()
```

### Cron Jobs

| Schedule | Task |
|:---------|:-----|
| Mỗi 60s | Check Friday 13h → rank reward announcement |
| 8h sáng daily | NASA APOD → post astronomy embed |

---

## 7. Environment Variables

| Key | Bắt buộc | Mục đích |
|:----|:---------|:---------|
| `DISCORD_TOKEN` | ✅ | Bot token |
| `CLIENT_ID` | ✅ | Bot application ID |
| `GUILD_ID` | ✅ | Primary guild |
| `GEMINI_API_KEY` | ✅ | Gemini AI default key |
| `DATABASE_URL` | ✅ | Prisma SQLite path |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `ADMIN_USERNAME` | ✅ | Dashboard login |
| `ADMIN_PASSWORD` | ✅ | Dashboard login |
| `PORT` | ❌ | Server port (default 3000) |
| `ADMIN_ID` | ❌ | Discord user ID for auto-reply |
| `SYSTEM_PROMPT` | ❌ | Default bot persona |
| `APIKEY_WEATHER` | ❌ | OpenWeatherMap key |
| `NASA_API_KEY` | ❌ | NASA APOD key |
| `DISCORD_CHANNEL_ID` | ❌ | Channel for announcements |

---

## 8. Dev Workflow

```bash
# Backend dev (auto-reload)
npm run dev          # nodemon + ts-node, watch src/

# Client dev (Vite)
cd client && npm run dev   # Vite dev server, proxy /api → :3000

# Production build
npm run build        # tsc backend + vite build client
npm start            # node dist/index.js (serves client/dist)
```

### Proxy Setup (Dev)

Client Vite proxy `/api` → `http://localhost:3000` → cùng port với Express.

---

## 9. Code Style & Patterns

```
TypeScript strict mode
Module: CommonJS (backend), ESM (client)
Target: ES2020
Error handling: try/catch + console.error + graceful fallback
Async: async/await everywhere
Type casting: `as any` khi Prisma types không khớp
JSON fields: String + JSON.parse/stringify
Long messages: chunk 1900 chars (Discord limit 2000)
```
