# ChatDVT - Coding Rules

> **READ THIS FILE COMPLETELY BEFORE WRITING ANY CODE.**

---

## 1. Project Identity

- **Name**: ChatDVT - Discord Bot + Web Portal
- **Architecture**: Hybrid Monolith (1 Node.js process = Bot + API + Static Server)
- **Database**: SQLite via Prisma ORM (`prisma/bot.db`)
- **AI Engine**: Google Gemini (`gemini-3-flash-preview`) + Imagen 4.0
- **Backend**: Express 4 + discord.js 14 + Socket.IO 4 + TypeScript (CommonJS, ES2020)
- **Frontend**: Vite 4 + React 18 + TailwindCSS 3 + TypeScript (ESM)
- **Auth**: JWT (24h expiry), admin credentials from ENV

---

## 2. Golden Rules

1. All AI SDK logic lives in `src/shared/services/gemini-core.ts` - never instantiate SDK outside this file
2. Model names only in `src/config/constants.ts` - never hardcode elsewhere
3. Feature isolation - each feature = 1 folder, no cross-feature imports
4. Public vs Admin - client features split into `features/public/` and `features/admin/`
5. PageShell required - every public page must wrap in `<PageShell>`
6. Dark mode required - every UI must support Light + Dark
7. Lazy loading - every page in App.tsx must use `React.lazy()`
8. Auth whitelist - new public API routes must be added to bypass middleware in `server.ts`
9. Static serve last - Express static + catch-all `*` must be last in `server.ts`
10. TypeScript pass - code must pass `tsc --noEmit` before shipping

---

## 3. Key File Locations

| Purpose | File |
|:--------|:-----|
| Entry point | `src/index.ts` |
| API server init | `src/api/server.ts` (app init + route registration) |
| API routes | `src/api/routes/*.ts` (modular route files) |
| Auth middleware | `src/api/middleware/auth.ts` |
| Bot client | `src/bot/client.ts` |
| AI core (shared) | `src/shared/services/gemini-core.ts` |
| AI bot (Discord) | `src/bot/services/gemini-bot.ts` |
| AI re-export | `src/bot/services/gemini.ts` (backward compat) |
| Model config | `src/config/constants.ts` |
| DB schema | `prisma/schema.prisma` |
| DB client | `src/database/prisma.ts` |
| Client entry | `client/src/main.tsx` |
| Client routing | `client/src/App.tsx` |
| API client | `client/src/shared/api/index.ts` |
| Theme | `client/src/shared/contexts/ThemeContext.tsx` |
| Page wrapper | `client/src/shared/components/PageShell.tsx` |
| Music state | `client/src/shared/contexts/MusicPlayerContext.tsx` |
| Page meta hook | `client/src/shared/hooks/usePageMeta.ts` |

---

## 4. Backend Architecture

### 4.1 Folder Structure

```
src/
  index.ts                    # Entry - init bot + API server
  shared/
    services/
      gemini-core.ts          # CORE - SDK wrappers, API key, retry (shared)
  api/
    server.ts                 # Express init + route registration only
    middleware/
      auth.ts                 # JWT auth middleware
    routes/
      weather.ts              # Weather proxy (extracted)
      [future: admin.ts, bot-data.ts, public-tools.ts, etc.]
  bot/
    client.ts                 # BotClient extends Discord.js Client
    commands/                 # Slash commands (auto-loaded)
    events/
      ready.ts                # Bot ready + cron + command registration
      messageCreate.ts        # Message handler (AI, vision, auto-reply)
      interactionCreate.ts    # Slash command + button + modal dispatcher
    services/
      gemini.ts               # Re-export (backward compat)
      gemini-bot.ts           # Bot-specific AI (chat history, persona)
      pet.ts                  # Pet/RPG system
      quiz.ts                 # Quiz engine
      shop.ts                 # Economy system
      pk.ts                   # PvP battle
      tower.ts                # Tower game
      expedition.ts           # Expedition game
      couple.ts               # Couple system
      identity.ts             # User identity
      webQuiz.ts              # Web quiz (SSE)
      logger.ts               # System logger to DB
  config/
    constants.ts              # ENV + Gemini model configs
  database/
    prisma.ts                 # Prisma client singleton
  utils/
    helpers.ts                # isReplyingToBot()
    messageHelper.ts          # sendLongMessage() - chunk 1900 chars
```

### 4.2 Startup Flow

```
index.ts
  -> startApiServer()         # Express listen port 3000
  -> bot.start(token)
       -> loadCommands()      # Scan bot/commands/, register to Collection
       -> Register events     # interactionCreate, messageCreate, ready
       -> client.login()
            -> ready event
                 -> setActivity()
                 -> Cron: checkFridayAnnouncement (every 60s)
                 -> Cron: NASA APOD (8am daily)
                 -> REST.put(applicationCommands)
```

### 4.3 Middleware Stack (order matters)

1. Socket.IO (cors: `*`)
2. CORS (allow all)
3. body-parser JSON (limit 50mb)
4. body-parser urlencoded (limit 50mb)
5. Auth bypass whitelist (public routes)
6. JWT authenticateToken (admin routes)
7. Express static (`client/dist`) - MUST BE LAST
8. Catch-all -> `index.html` (SPA fallback) - MUST BE LAST

### 4.4 Auth Bypass Whitelist

When adding a new public API, you MUST add the path to the whitelist:

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

### 4.5 Adding a New API Route

1. Write handler in `server.ts`
2. If public -> add path to auth bypass whitelist
3. If needs AI -> call `geminiService.generateJSON()` or corresponding method
4. If needs file upload -> use the existing multer middleware
5. Error handling: `try/catch` + `console.error` + `res.status(500).json()`
6. Static serve MUST remain at the end (after all routes)

### 4.6 Discord Bot Patterns

**Command pattern:**
```typescript
// bot/commands/[name].ts
export const data = new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('...');

export async function execute(interaction: ChatInputCommandInteraction) {
    // Logic here
}
```

**Message flow:**
```
messageCreate
  -> Bot message -> ignore
  -> "hi/hello" -> hardcoded reply
  -> Mention admin -> generateAutoReply()
  -> Prefix (!, /, -) -> ignore
  -> Not mentioned bot -> ignore
  -> Has image -> ImageToTextAI()
  -> Has video -> VideoToTextAI()
  -> Text only -> generateResponse()
       -> Response > 1900 chars -> chunk and send
```

### 4.7 Database (Prisma + SQLite)

**JSON pattern** - SQLite has no JSON type, use `String` + `JSON.parse/stringify`:
```typescript
const config = await prisma.guildConfig.findUnique({ where: { guildId } });
const modules = JSON.parse(config.activeModules);
modules.persona = newData;
await prisma.guildConfig.update({
  where: { guildId },
  data: { activeModules: JSON.stringify(modules) }
});
```

**Adding a new model:**
1. Add model in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_change`
3. Prisma client auto-regenerates

### 4.8 Environment Variables

| Key | Required | Purpose |
|:----|:---------|:--------|
| `DISCORD_TOKEN` | Yes | Bot token |
| `CLIENT_ID` | Yes | Bot application ID |
| `GUILD_ID` | Yes | Primary guild |
| `GEMINI_API_KEY` | Yes | Gemini AI default key |
| `DATABASE_URL` | Yes | Prisma SQLite path |
| `JWT_SECRET` | Yes | JWT signing secret |
| `ADMIN_USERNAME` | Yes | Dashboard login |
| `ADMIN_PASSWORD` | Yes | Dashboard login |
| `PORT` | No | Server port (default 3000) |
| `ADMIN_ID` | No | Discord user ID for auto-reply |
| `SYSTEM_PROMPT` | No | Default bot persona |
| `APIKEY_WEATHER` | No | OpenWeatherMap key |
| `NASA_API_KEY` | No | NASA APOD key |

---

## 5. AI / Gemini Architecture

### 5.1 Three-Layer Design

| Layer | File | Role |
|:------|:-----|:-----|
| **Core (shared)** | `src/shared/services/gemini-core.ts` | SDK wrappers, API key, retry, model factory |
| **Bot (Discord)** | `src/bot/services/gemini-bot.ts` | Chat history, persona, system prompt, Discord-specific |
| **Routes (Web)** | `src/api/routes/*.ts` | Prompts live here, call geminiCore methods |
| **Config** | `src/config/constants.ts` | Model names, generation configs |

### 5.2 Dual SDK - Both Required

| SDK (package) | Import | Purpose |
|:--------------|:-------|:--------|
| `@google/generative-ai` | `GoogleGenerativeAI` | Text generation, chat, JSON output, vision analysis |
| `@google/genai` | `GoogleGenAI` | Image generation (Imagen API), Google Search grounding |

**Both SDKs are ONLY used inside `gemini-core.ts`.** Route files and bot services must call exported methods, never instantiate SDK directly.

### 5.3 gemini-core.ts Methods (Shared)

| Method | Purpose |
|:-------|:--------|
| `generateText()` | Generic text generation |
| `generateTextWithMedia()` | Text + inline image/file |
| `generateJSON<T>()` | Structured JSON output |
| `generateWithSearch()` | Google Search grounding |
| `generateImage()` | Imagen 4.0 image generation |
| `generateImageWithKey()` | Imagen with custom API key |
| `generateImageWithReference()` | Image from reference image |
| `generateAudioWithContext()` | TTS audio generation |
| `getApiKey()` | API key resolution |
| `getModel()` | Model factory |

### 5.4 gemini-bot.ts Methods (Bot Only)

| Method | Purpose |
|:-------|:--------|
| `generateResponse()` | Chat with history + persona |
| `ImageToTextAI()` | Image analysis (Discord) |
| `VideoToTextAI()` | Video analysis (Discord) |
| `AudioToTextAI()` | Audio analysis (Discord) |
| `chatWithSearch()` | Chat + search (Discord) |
| `summarizeMessages()` | Message summarization |
| `generateAutoReply()` | Auto-reply |
| `generatePKResponse()` | PK game logic |
| `getSystemPrompt()` | Dynamic system prompt builder |

### 5.5 API Key Resolution (priority high to low)

1. `customApiKey` (passed directly)
2. `GuildConfig.geminiApiKey` (per-server)
3. `BotConfig.geminiApiKey` (global DB)
4. `process.env.GEMINI_API_KEY` (ENV fallback)

### 5.6 New Web Feature Pattern

Prompts live in route files (Option A). New web features do NOT add methods to gemini-core.

```typescript
// src/api/routes/my-feature.ts
import { Router } from 'express';
import { geminiCore } from '../../shared/services/gemini-core';

const router = Router();

router.post('/my-feature', async (req, res) => {
    const prompt = `...`;  // Prompt lives HERE in the route
    const data = await geminiCore.generateJSON(prompt, null, 'global', req.body.geminiApiKey);
    res.json(data);
});

export default router;
```

### 5.7 Absolute Rules

```
NEVER instantiate GoogleGenerativeAI or GoogleGenAI outside gemini-core.ts
NEVER declare model names outside constants.ts
NEVER add web prompts to gemini-core.ts or gemini-bot.ts
NEVER create custom retry logic - geminiCore uses retryWithBackoff() internally
ALWAYS use geminiCore methods from API routes (generateText, generateJSON, etc.)
ALWAYS pass customApiKey through method parameters (for BYOK support)
ALWAYS create new route files in src/api/routes/ for new features
```

---

## 6. Client Architecture

### 6.1 Folder Structure

```
client/src/
  App.tsx                              # Routing + Providers + ErrorBoundary
  main.tsx                             # Entry: BrowserRouter + ThemeProvider + App
  index.css                            # Global CSS + a11y focus-visible
  shared/
    components/
      PageShell.tsx                    # Layout wrapper (backTo, title, icon, auto page title)
      GeminiKeyInput.tsx               # BYOK Gemini API key input
      Layout.tsx                       # Admin sidebar layout
      EditableCV.tsx                   # CV editor component
      GlobalMusicPlayer.tsx            # Music FAB + progress bar + seek
      ChatWidget.tsx                   # AI chat floating widget (Escape close)
      ErrorBoundary.tsx                # Global error catch -> retry UI
      OfflineBanner.tsx                # Network status banner
      NavigationProgress.tsx           # Route transition progress bar
    hooks/
      usePageMeta.ts                   # Auto set document.title + meta description
    contexts/
      ThemeContext.tsx                  # Light/Dark toggle (default: dark)
      MusicPlayerContext.tsx            # Global music state + controls
    api/
      index.ts                         # Axios instance + all API functions
    assets/                            # Static files
  features/
    public/                            # Public features (no auth)
      portal/pages/PublicPortal        # Home page
      english/                         # English Hub (complex, has data/utils)
      food-wheel/pages/
      excuse-generator/pages/
      ... (30 features total)
    admin/                             # Admin features (requires JWT)
      dashboard/pages/
      prompts/pages/
      ... (10 features total)
```

### 6.2 Provider Hierarchy

```
React.StrictMode
  -> BrowserRouter
       -> ThemeProvider
            -> App
                 -> MusicPlayerProvider
                      -> OfflineBanner (z-[10000], fixed top)
                      -> NavigationProgress (z-[10001])
                      -> Toaster
                      -> GlobalMusicPlayer
                      -> ChatWidget
                      -> ErrorBoundary
                           -> Suspense (SkeletonFallback)
                                -> Routes
```

### 6.3 Routing

**Public routes** - no auth, top-level:
```tsx
<Route path="/feature-name" element={<FeaturePage />} />
```

**Admin routes** - JWT required, nested in Layout:
```tsx
<Route path="/admin/*" element={
  <RequireAuth>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Layout>
  </RequireAuth>
} />
```

**Lazy loading pattern (required):**
```tsx
const MyFeature = lazy(() =>
  import('./features/public/my-feat/pages/MyFeature')
    .then(m => ({ default: m.MyFeature }))
);
```

**Back button hierarchy:**
```
PublicPortal (/)
  -> Single-page features (/feat)         -> backTo="/"
  -> Multi-page hubs (/english)           -> backTo="/"
       -> Sub-pages (/english/chat)       -> backTo="/english"
```

### 6.4 Import Rules (Absolute)

```
ALLOWED:
  Feature -> shared/            (components, api, contexts)
  Feature -> own utils/data     (../utils/*, ../data/*)
  App.tsx -> features            (lazy import)

FORBIDDEN:
  Feature A -> Feature B        (no cross-feature imports)
  shared/ -> features/           (no reverse imports)
  public/ -> admin/              (no cross-group imports)
```

**Import paths from feature pages:**
```tsx
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput } from '../../../../shared/components/GeminiKeyInput';
import api from '../../../../shared/api';
```

### 6.5 API Client Layer

Axios instance at `shared/api/index.ts`:
- Auto-attach JWT token from localStorage
- Auto-redirect on 401/403 (admin routes only)
- All API functions exported from this single file

**Adding a new API function:**
```typescript
// shared/api/index.ts
export const myNewEndpoint = async (param: string) =>
    (await api.get(`/my-endpoint/${param}`)).data;
```

### 6.6 State Management (priority order)

1. `useState` - default for everything
2. `localStorage` - persist data (prefix keys by feature: `eng_*`, `tarot_*`)
3. React Context - global only: theme, auth, music player
4. API/Server - data from backend

**Existing Contexts:**

| Context | Provides |
|:--------|:---------|
| `ThemeProvider` | `{ theme, toggleTheme }` - default dark |
| `MusicPlayerProvider` | Global music state + controls + seekTo() |

**Shared Hooks:**

| Hook | Description |
|:-----|:------------|
| `usePageMeta(title, description?)` | Auto set `document.title` = `"{title} \| ChatDVT"` + meta. Cleanup on unmount. |

Note: PageShell calls `usePageMeta(title)` automatically. Only call `usePageMeta` directly when NOT using PageShell (e.g., PublicPortal, Login).

---

## 7. Design System (TailwindCSS)

### 7.1 Color Tokens (Light / Dark)

| Element | Light | Dark |
|:--------|:------|:-----|
| Page BG | `bg-slate-50` | `dark:bg-[#0d1117]` |
| Card BG | `bg-white` | `dark:bg-[#131923]` |
| Input BG | `bg-slate-100` | `dark:bg-[#1f2937]` |
| Hover card | `hover:bg-slate-50` | `dark:hover:bg-[#1a2332]` |
| Primary text | `text-slate-800` | `dark:text-slate-200` |
| Secondary text | `text-slate-500` | `dark:text-slate-400` |
| Muted text | `text-slate-400` | `dark:text-slate-500` |
| Border | `border-slate-200` | `dark:border-slate-800` |
| Subtle border | `border-slate-100` | `dark:border-slate-700` |
| Accent | `orange-500` | `orange-500` |

**Feature-specific accents** (decorative only, primary actions still use orange-500):
- Tarot/Magic Ball: `violet-500`
- Deep Status: `cyan-500`
- Burnout Check: `rose-500`
- Astrology: `amber-500`
- Numerology: `indigo-500`

### 7.2 Component Patterns

**Card:**
```html
<div class="bg-white dark:bg-[#131923] border border-slate-200
            dark:border-slate-800 rounded-xl p-6 shadow-sm transition-colors">
```

**Primary Button:**
```html
<button class="w-full bg-orange-500 hover:bg-orange-600 text-white
               font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]">
```

**Input:**
```html
<input class="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200
              dark:border-slate-700 text-slate-800 dark:text-slate-200
              rounded-xl px-4 py-3 outline-none focus:border-orange-500
              transition-colors" />
```

**Section Label:**
```html
<label class="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">
```

**Error Message:**
```html
<div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30
            text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center">
```

### 7.3 Typography

- Font: `font-sans` (system-ui) - no custom fonts
- Page title: `text-2xl md:text-4xl font-black`
- Subtitle: `text-xs md:text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider`
- Section heading: `text-lg font-bold text-slate-800 dark:text-slate-100`
- Body text: `text-sm leading-relaxed text-slate-600 dark:text-slate-300`

### 7.4 Layout

- Max width (feature pages): `max-w-4xl`
- Max width (portal): `max-w-6xl`
- Page padding: `px-4 md:px-8 py-8 md:py-14`
- Section gap: `space-y-6`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### 7.5 Animations

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(15px) } to { opacity:1; transform:translateY(0) } }
@keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
```

- Use inline `<style>` tags for keyframe animations in components
- Use Tailwind utilities for simple transitions: `transition-all`, `active:scale-[0.98]`
- Theme toggle: `transition-colors duration-300`
- NavigationProgress handles route change animations automatically

---

## 8. Accessibility

**Focus visible (configured globally in index.css):**
```css
*:focus-visible { outline: 2px solid rgb(249 115 22 / 0.7); outline-offset: 2px; }
*:focus:not(:focus-visible) { outline: none; }
```

**Rules:**
- Never override focus-visible outline on interactive elements
- Icon-only buttons must have `title` or `aria-label`
- Modals/overlays must support `Escape` key to close
- Touch targets >= 44px on mobile
- Destructive actions must have `confirm()` dialog

---

## 9. SEO

- `<html lang="vi">` - do not change
- Page title format: `"{Feature Title} | ChatDVT"` (PageShell/usePageMeta handles this)
- Each page should have exactly one `<h1>`
- OG tags and meta description are configured in `client/index.html`

---

## 10. Adding a New Feature (End-to-End Checklist)

### Backend

```
[ ] Add API route in src/api/server.ts
[ ] If needs AI -> add method in gemini.ts or call generateJSON()
[ ] If public API -> add path to auth bypass whitelist
[ ] If needs DB -> add model in prisma/schema.prisma + migrate
[ ] Error handling: try/catch + console.error + res.status(500).json()
```

### Client - Public Feature

```
[ ] Create folder: client/src/features/public/[kebab-name]/pages/
[ ] Create page: [PascalName].tsx
[ ] Export: export const PascalName + export default
[ ] Wrapper: <PageShell title="..." backTo="/" icon="...">
[ ] App.tsx: add lazy import + <Route path="/name" element={...} />
[ ] Portal: add card in PublicPortal.tsx
[ ] API: add function in shared/api/index.ts (if needed)
[ ] Dark mode: support both Light + Dark
[ ] Mobile: test 375px, touch targets >= 44px
[ ] TypeScript: tsc --noEmit must pass
```

### Client - Admin Feature

```
[ ] Create folder: client/src/features/admin/[kebab-name]/pages/
[ ] Create page: [PascalName].tsx
[ ] App.tsx: add <Route> inside admin/* block
[ ] Layout: add sidebar link (if needed)
[ ] API: add backend route (protected by authenticateToken)
[ ] TypeScript: tsc --noEmit must pass
```

### Complex Feature (with data/utils/components)

```
features/public/[name]/
  pages/           # Page components
  data/            # Static data files
  utils/           # Business logic, helpers
  components/      # Feature-specific components
```

- Sub-pages must set `backTo="/[parent-hub]"` - NEVER back to "/"
- Create feature-specific documentation if the feature is complex

---

## 11. Naming Conventions

| Type | Convention | Example |
|:-----|:-----------|:--------|
| Feature folder | kebab-case | `magic-ball/`, `food-wheel/` |
| Page file | PascalCase | `MagicBallPage.tsx` |
| Utility file | camelCase | `gamification.ts` |
| Data file | kebab-case | `english-vocab.json` |
| Export | Named + Default | `export const X; export default X;` |
| localStorage key | prefix_snake | `eng_progress`, `tarot_history` |
| CSS class | Tailwind utility | No custom CSS if utility exists |

---

## 12. AI Integration on Client Side

### BYOK Pattern (Bring Your Own Key)

```tsx
<GeminiKeyInput accent="orange" />

// Read key
const apiKey = localStorage.getItem('eng_api_key') || '';
```

### Backend AI Pattern (Recommended)

```tsx
const response = await axios.post('/api/my-feature', {
    prompt: userInput,
    geminiApiKey: localStorage.getItem('eng_api_key') || ''
});
```

**Rules:**
- Never hardcode model names on client - always call backend
- Never create custom retry logic on client
- Always call backend API -> backend calls geminiService
- If BYOK, send apiKey in request body
- Handle errors gracefully with retry button

---

## 13. English Hub (Complex Feature Reference)

### Structure

```
client/src/features/public/english/
  pages/
    EnglishHub.tsx              # Dashboard (game hub, XP bar, badges)
    EnglishChat.tsx             # AI Tutor chat
    EnglishFlashcard.tsx        # SRS Flashcards (SM-2)
    EnglishChallenge.tsx        # Daily AI Challenge
    EnglishDictionary.tsx       # Dictionary lookup
    DailyPuzzle.tsx             # Wordle-style game
    WordSprint.tsx              # 60s typing game
    SpellingBee.tsx             # Audio -> Spelling game
  utils/
    gamification.ts             # XP engine, levels, badges, stats
  data/
    english-vocab.json          # 200+ words, 10 topics, 30 phrases
```

### Routing

All sub-pages use `backTo="/english"`. Never let sub-pages back to `/`.

### Gamification

- Always use `addXP()` from `../utils/gamification` to record XP
- Never manipulate `eng_progress` localStorage directly - use `getStats()` / `addXP()`
- Never create custom streak or progress tracking

### Storage Keys

| Key | Data |
|:----|:-----|
| `eng_progress` | PlayerStats (XP, level, streak, badges) |
| `eng_srs_cards` | SRSCard[] (flashcard deck) |
| `eng_chat_history` | ChatMessage[] (max 50) |
| `eng_daily_puzzle` | Puzzle state |
| `eng_api_key` | Gemini API key (BYOK) |

### Adding a New English Mini-Game

1. Create `features/public/english/pages/[GameName].tsx`
2. Export named + default
3. Use `<PageShell backTo="/english">` wrapper
4. Integrate XP via `addXP()` when game ends
5. Update stats: `gamesPlayed`, `correctAnswers`, `totalAnswers`
6. Add route in App.tsx
7. Add card in EnglishHub.tsx

### Game UI Pattern (3 states)

```
Ready screen -> Playing screen -> Finished screen (results + XP + play again)
```

---

## 14. Dev Workflow

```bash
# Backend dev (auto-reload)
npm run dev              # nodemon + ts-node, watch src/

# Client dev (Vite)
cd client && npm run dev # Vite dev server, proxy /api -> :3000

# Production build
npm run build            # tsc backend + vite build client
npm start                # node dist/index.js (serves client/dist)
```

### Code Style

- TypeScript strict mode
- Backend: CommonJS, Client: ESM
- Target: ES2020
- Error handling: try/catch + console.error + graceful fallback
- Async: async/await everywhere
- JSON fields: String + JSON.parse/stringify
- Long messages: chunk at 1900 chars (Discord limit 2000)

---

## 15. Do and Do Not

### Do

- Read this entire file before writing any code
- Create a separate folder for each feature, even if it is only 1 page
- Always support both Light and Dark mode
- Always use PageShell for public pages
- Always lazy load pages in App.tsx
- Centralize AI logic in gemini.ts (backend)
- Centralize API functions in shared/api/index.ts (client)
- Handle errors with try/catch + user-friendly message + retry button
- Design mobile-first, test at 375px
- Pass `tsc --noEmit` before shipping
- Use `confirm()` dialog for destructive actions
- Support `Escape` key to close modals/overlays
- Document new localStorage keys

### Do Not

- Create files directly in `client/src/` (except App.tsx, main.tsx, css files)
- Import across features (Feature A -> Feature B)
- Hardcode dark-only styles without light variant
- Declare Gemini model names outside constants.ts
- Skip public route whitelist when adding new APIs
- Use inline styles for colors (only for dynamic values)
- Use custom fonts (system-ui only)
- Ship code that does not pass TypeScript check
- Set `document.title` manually in feature pages (use PageShell or usePageMeta)
- Override global focus-visible outline
- Create modals without Escape key support
- Create pages without a back button
- Write custom CSS when Tailwind has an equivalent utility
