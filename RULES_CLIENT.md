# 🎨 ChatDVT — Client Architecture & Coding Rules

> **BẮT BUỘC ĐỌC FILE NÀY + `RULES_BACKEND.md` TRƯỚC KHI VIẾT BẤT KỲ CODE NÀO.**
> Cũng đọc thêm: `client/feat_rule.md`, `client/rule_ui.md`, `client/rule_ai.md`

---

## 1. Tổng Quan Client

**Vite + React 18 + TypeScript + TailwindCSS 3**

| Layer | Công nghệ |
|:------|:----------|
| Build tool | Vite 4 |
| UI Framework | React 18 (lazy + Suspense) |
| Routing | react-router-dom v6 |
| Styling | TailwindCSS 3 + `dark:` class strategy |
| State | useState + localStorage + React Context |
| HTTP | Axios (interceptors, proxy `/api`) |
| Real-time | socket.io-client |
| Animation | framer-motion + CSS keyframes |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Charts | recharts |
| Markdown | react-markdown + remark-gfm |

---

## 2. Folder Structure

```
client/src/
├── App.tsx                              # Routing + Providers + ErrorBoundary
├── main.tsx                             # Entry: BrowserRouter + ThemeProvider + App
├── index.css                            # Global CSS + a11y focus-visible
├── App.css                              # (Trống — đã dọn boilerplate)
│
├── shared/                              # SHARED across mọi feature
│   ├── components/
│   │   ├── PageShell.tsx                #   Layout wrapper (backTo, title, icon, auto page title)
│   │   ├── GeminiKeyInput.tsx           #   BYOK Gemini API key input
│   │   ├── Layout.tsx                   #   Admin sidebar layout
│   │   ├── EditableCV.tsx               #   CV editor component
│   │   ├── GlobalMusicPlayer.tsx        #   Music FAB (floating) + progress bar + seek
│   │   ├── ChatWidget.tsx               #   AI chat floating widget (Escape close, confirm clear)
│   │   ├── ErrorBoundary.tsx            #   Global error catch → friendly UI + retry
│   │   ├── OfflineBanner.tsx            #   Network status banner (offline/online)
│   │   └── NavigationProgress.tsx       #   Route transition progress bar (NProgress-style)
│   ├── hooks/
│   │   └── usePageMeta.ts               #   Auto set document.title + meta description
│   ├── contexts/
│   │   ├── ThemeContext.tsx              #   Light/Dark toggle (default: dark)
│   │   └── MusicPlayerContext.tsx        #   Global music state + currentTime/duration/seekTo
│   ├── api/
│   │   └── index.ts                     #   Axios instance + tất cả API functions
│   └── assets/                          #   Static files
│
└── features/
    ├── public/                          # 🌐 PUBLIC — 30 features
    │   ├── portal/pages/PublicPortal    #   Trang chủ (prefetch on hover, Web Share API)
    │   ├── english/                     #   English Hub (complex, có data/utils)
    │   ├── food-wheel/pages/            #   Vòng quay món ăn
    │   ├── excuse-generator/pages/      #   Máy tạo lý do nghỉ phép
    │   ├── handsome-analyzer/pages/     #   Phân tích nhan sắc
    │   ├── cv-reviewer/pages/           #   Review CV
    │   ├── music-station/pages/         #   Music player
    │   ├── pixel-agents/pages/          #   8D Office (Socket.IO)
    │   ├── numerology/pages/            #   Thần số học
    │   ├── gender-quiz/pages/           #   Quiz giới tính
    │   ├── astrology/pages/             #   Tử vi
    │   ├── tarot/pages/                 #   Tarot (có data riêng)
    │   ├── magic-ball/pages/            #   Cầu pha lê
    │   ├── deep-status/pages/           #   Status generator
    │   ├── burnout-check/pages/         #   Burnout checker
    │   ├── poem-generator/pages/        #   Thơ generator
    │   ├── chibi-sticker/pages/         #   Chibi sticker maker
    │   ├── face-reader/pages/           #   Nhân tướng học
    │   ├── dream-interpreter/pages/     #   Giải mộng
    │   ├── tech-duel/pages/             #   So sánh công nghệ
    │   ├── qr-generator/pages/          #   QR code generator
    │   ├── cost-study/pages/            #   Nghiên cứu y tế
    │   ├── chicken-game/pages/          #   Game gà
    │   ├── birthday/pages/              #   Birthday greeting
    │   ├── pet-landing/pages/           #   Pet landing page
    │   ├── tutien/pages/                #   Tu tiên game
    │   ├── profile/pages/               #   User profile
    │   ├── web-quiz/pages/              #   Web quiz (SSE)
    │   ├── weather/                     #   Weather widget
    │   └── auth/pages/Login             #   Login page
    │
    └── admin/                           # 🔒 ADMIN — 10 features (cần JWT)
        ├── dashboard/pages/
        ├── prompts/pages/
        ├── identity/pages/
        ├── control-center/pages/
        ├── user-management/pages/
        ├── pets-admin/pages/
        ├── logs/pages/
        ├── settings/pages/
        ├── tree-editor/pages/
        └── couple/pages/
```

---

## 3. Routing System

### Provider Hierarchy

```
React.StrictMode
  └── BrowserRouter
       └── ThemeProvider
            └── App
                 └── MusicPlayerProvider
                      ├── OfflineBanner           (z-[10000], fixed top)
                      ├── NavigationProgress       (z-[10001], route transition bar)
                      ├── Toaster
                      ├── GlobalMusicPlayer        (progress bar + seek + time)
                      ├── ChatWidget               (Escape close, confirm clear)
                      └── ErrorBoundary
                           └── Suspense (SkeletonFallback)
                                └── Routes
```

### Route Types

**Public routes** — không cần auth, top-level:
```tsx
<Route path="/feature-name" element={<FeaturePage />} />
```

**Admin routes** — cần JWT, nested trong Layout:
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

### Lazy Loading Pattern (BẮT BUỘC)

```tsx
const MyFeature = lazy(() =>
  import('./features/public/my-feat/pages/MyFeature')
    .then(m => ({ default: m.MyFeature }))
);
```

### Back Button Hierarchy

```
PublicPortal (/)
├── Single-page features (/feat)           → backTo="/"
└── Multi-page hubs (/english)             → backTo="/"
    └── Sub-pages (/english/chat)          → backTo="/english"
```

---

## 4. API Client Layer

### Axios Instance (`shared/api/index.ts`)

```typescript
const api = axios.create({ baseURL: '/api' });

// Auto-attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401/403 (admin routes only)
api.interceptors.response.use(response => response, error => {
  if ([401, 403].includes(error.response?.status)) {
    if (window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});
```

### Exported Functions

| Function | Method | Endpoint |
|:---------|:-------|:---------|
| `getDashboardStats()` | GET | `/dashboard/stats` |
| `getLogs(guildId, page, search)` | GET | `/logs/:guildId` |
| `getPrompts(guildId)` | GET | `/prompts` |
| `updatePrompts(data, guildId)` | POST | `/prompts` |
| `getFeatures()` | GET | `/features` |
| `updateFeatures(data)` | POST | `/features` |
| `getPets()` | GET | `/pets` |
| `deletePet(id)` | DELETE | `/pets/:id` |
| `getUsers()` | GET | `/users/list` |
| `deleteUser(id)` | DELETE | `/users/:id` |
| `getGuilds()` | GET | `/guilds` |
| `sendControlMessage()` | POST | `/control-panel/send-message` (FormData) |
| `getSystemLogs()` | GET | `/system-logs` |
| ... | | |

### Thêm API Function Mới

```typescript
// shared/api/index.ts
export const myNewEndpoint = async (param: string) =>
    (await api.get(`/my-endpoint/${param}`)).data;
```

---

## 5. Design System (Tailwind)

### Color Tokens (Light/Dark)

| Element | Light | Dark |
|:--------|:------|:-----|
| Page BG | `bg-slate-50` | `dark:bg-[#0d1117]` |
| Card BG | `bg-white` | `dark:bg-[#131923]` |
| Input BG | `bg-slate-100` | `dark:bg-[#1f2937]` |
| Primary text | `text-slate-800` | `dark:text-slate-200` |
| Secondary text | `text-slate-500` | `dark:text-slate-400` |
| Border | `border-slate-200` | `dark:border-slate-800` |
| **Accent** | `orange-500` | `orange-500` |

### Component Patterns

**Card:**
```html
<div class="bg-white dark:bg-[#131923] border border-slate-200
            dark:border-slate-800 rounded-xl p-6 shadow-sm">
```

**Primary Button:**
```html
<button class="w-full bg-orange-500 hover:bg-orange-600 text-white
               font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]">
```

**Input:**
```html
<input class="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200
              dark:border-slate-700 rounded-xl px-4 py-3 outline-none
              focus:border-orange-500 transition-colors" />
```

### Custom Tailwind Animations

```javascript
// tailwind.config.js
animation: {
  'blob': 'blob 10s infinite',
  'float': 'float 6s ease-in-out infinite',
  'glow': 'glow 3s ease-in-out infinite alternate',
}
```

### Custom CSS Variables

```css
--color-background, --color-surface, --color-primary
--color-accent, --color-text, --color-text-muted
```

---

## 6. State Management

| Priority | Pattern | Khi nào |
|:---------|:--------|:--------|
| 1 | `useState` | Default cho mọi thứ |
| 2 | `localStorage` | Persist data (prefix: `eng_*`, `tarot_*`) |
| 3 | React Context | Global: theme, auth, music player |
| 4 | API/Server | Data từ backend |

### Contexts Hiện Có

| Context | File | Provides |
|:--------|:-----|:---------|
| `ThemeProvider` | `ThemeContext.tsx` | `{ theme, toggleTheme }` — default dark |
| `MusicPlayerProvider` | `MusicPlayerContext.tsx` | Global music state + controls + `currentTime`, `duration`, `seekTo()` |

### Shared Hooks

| Hook | File | Mô tả |
|:-----|:-----|:------|
| `usePageMeta(title, description?)` | `shared/hooks/usePageMeta.ts` | Auto set `document.title` = `"{title} \| ChatDVT"` + meta description. Cleanup on unmount. |

> **Lưu ý**: `PageShell` đã gọi `usePageMeta(title)` tự động. Nếu page dùng `PageShell`, KHÔNG cần gọi `usePageMeta` riêng.
> Chỉ cần gọi trực tiếp khi page KHÔNG dùng PageShell (ví dụ: PublicPortal, Login).

### Shared QoL Components

| Component | File | Chức năng |
|:----------|:-----|:----------|
| `ErrorBoundary` | `shared/components/ErrorBoundary.tsx` | Class component, wrap quanh Suspense. Catch JS crash → hiện UI "Thử lại" / "Về trang chủ" |
| `OfflineBanner` | `shared/components/OfflineBanner.tsx` | Detect offline/online → banner đỏ "Mất kết nối" / banner xanh "Đã kết nối lại" (auto-hide 3s) |
| `NavigationProgress` | `shared/components/NavigationProgress.tsx` | NProgress-style bar 3px top page, animate trên mỗi route change. Không cần dependency |

---

## 7. Quy Tắc Thêm Feature Mới

### Public Feature Checklist

```
□ 1. Tạo folder: src/features/public/[kebab-name]/pages/
□ 2. Tạo page:   [PascalName].tsx
□ 3. Export:      export const PascalName + export default
□ 4. Wrapper:     <PageShell title="..." backTo="/" icon="🎯">  (auto set page title)
□ 5. App.tsx:     Thêm lazy import + <Route path="/name" element={...} />
□ 6. Portal:      Thêm card trong PublicPortal.tsx (tự có prefetch + share)
□ 7. Backend:     Thêm API route trong server.ts (nếu cần)
□ 8. Whitelist:   Thêm path vào auth bypass middleware (nếu public API)
□ 9. Dark mode:   Support cả Light + Dark
□ 10. Mobile:     Test 375px, touch targets ≥ 44px
□ 11. TypeScript: npx tsc --noEmit pass
□ 12. Page title: PageShell tự handle. Nếu KHÔNG dùng PageShell → gọi usePageMeta()
```

### Admin Feature Checklist

```
□ 1. Tạo folder: src/features/admin/[kebab-name]/pages/
□ 2. Tạo page:   [PascalName].tsx
□ 3. App.tsx:     Thêm <Route> trong block admin/*
□ 4. Layout:      Thêm sidebar link (nếu cần)
□ 5. API:         Thêm backend route (protected by authenticateToken)
```

### Complex Feature (có data/utils/components)

```
features/public/[name]/
├── pages/           # Page components
├── data/            # Static data files
├── utils/           # Business logic, helpers
└── components/      # Feature-specific components
```

---

## 8. Import Rules (TUYỆT ĐỐI)

```
✅ Feature → shared/          (components, api, contexts)
✅ Feature → own utils/data    (../utils/*, ../data/*)
✅ App.tsx → features           (lazy import)

❌ Feature A → Feature B       (KHÔNG cross-import)
❌ shared/ → features/          (KHÔNG import ngược)
❌ public/ → admin/             (KHÔNG cross-group)
```

### Import Path từ Feature Page

```tsx
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput } from '../../../../shared/components/GeminiKeyInput';
import api from '../../../../shared/api';
```

---

## 9. AI/Gemini Integration (Client-Side)

### BYOK Pattern (Bring Your Own Key)

Khi feature cần Gemini trực tiếp từ client:
```tsx
<GeminiKeyInput accent="orange" />

// Lấy key
const apiKey = localStorage.getItem('eng_api_key') || '';
```

### Backend AI Pattern (Recommended)

```tsx
const response = await axios.post('/api/my-feature', {
    prompt: userInput,
    geminiApiKey: localStorage.getItem('eng_api_key') || ''
});
```

### Quy tắc AI Client

```
❌ KHÔNG hardcode model name ở client (luôn gọi backend)
❌ KHÔNG tự chế retry logic
✅ Gọi backend API → backend gọi geminiService
✅ Nếu BYOK, gửi apiKey trong request body
✅ Handle error gracefully → retry button
```

---

## 10. Naming Convention

| Loại | Convention | Ví dụ |
|:-----|:-----------|:------|
| Feature folder | kebab-case | `magic-ball/`, `food-wheel/` |
| Page file | PascalCase | `MagicBallPage.tsx` |
| Utility file | camelCase | `gamification.ts` |
| Data file | kebab-case | `english-vocab.json` |
| Export | Named + Default | `export const X; export default X;` |
| localStorage key | prefix_snake | `eng_progress`, `tarot_history` |
| CSS class | Tailwind utility | Không viết CSS custom nếu có utility |

---

## 11. Production Build & Deploy

```bash
# Full build
npm run build
# ├── tsc (backend → dist/)
# └── cd client && npm install && npm run build (→ client/dist/)

# Production run
npm start
# → Express serves client/dist/ as static
# → Catch-all → index.html (SPA)
```

### Static Serving (server.ts — CUỐI CÙNG)

```typescript
app.use(express.static(CLIENT_BUILD_PATH));
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});
```

---

## 12. DOs and DON'Ts Tổng Hợp

### ✅ DO

- Đọc `RULES_BACKEND.md` + `RULES_CLIENT.md` + `feat_rule.md` + `rule_ui.md` trước khi code
- Mỗi feature = 1 folder riêng biệt
- Luôn support Light + Dark mode
- Luôn dùng `PageShell` cho public pages (tự động set page title)
- Luôn lazy load pages trong App.tsx
- AI logic tập trung trong `gemini.ts` (backend)
- API functions tập trung trong `shared/api/index.ts` (client)
- Error handling: try/catch + user-friendly message + retry
- Mobile-first, test 375px
- TypeScript strict, pass `tsc --noEmit`
- Destructive actions (xoá data) phải có `confirm()` dialog
- Dùng `usePageMeta()` nếu page KHÔNG dùng `PageShell`
- Keyboard: Support `Escape` để đóng modal/overlay
- A11y: Interactive elements tự có `focus-visible` ring (global CSS)

### ❌ DON'T

- Tạo file trực tiếp trong `src/` (ngoài App.tsx, main.tsx, css)
- Import cross-feature (Feature A → Feature B)
- Hardcode dark-only styles (luôn có light variant)
- Tự khai báo Gemini model names rải rác
- Skip public route whitelist khi thêm API mới
- Dùng inline styles cho colors (chỉ cho dynamic values)
- Tạo localStorage key mới mà không document
- Ship code không pass TypeScript check
- Thêm component mới vào `App.tsx` mà quên update `RULES_CLIENT.md`
- Tự set `document.title` trong feature page (dùng PageShell hoặc usePageMeta)

---

## 13. SEO & Meta Tags

### index.html (Đã cấu hình sẵn)

```html
<html lang="vi">
<meta name="description" content="ChatDVT Portal - 30+ tính năng AI, Game, Tiện ích" />
<meta property="og:title" content="ChatDVT Portal — AI Tools & Games" />
<meta property="og:description" content="30+ tính năng AI, Game, Tiện ích miễn phí" />
<meta property="og:image" content="...chibi-bear.jpg" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#f97316" />
```

### Quy tắc SEO

- `<html lang="vi">` — KHÔNG đổi sang `en`
- Page title format: `"{Feature Title} | ChatDVT"` (PageShell/usePageMeta tự handle)
- Mỗi page nên có 1 `<h1>` duy nhất

---

## 14. Accessibility (a11y)

### Focus Visible (Global CSS — Đã cấu hình)

```css
*:focus-visible {
  outline: 2px solid rgb(249 115 22 / 0.7);
  outline-offset: 2px;
}
*:focus:not(:focus-visible) {
  outline: none;  /* Ẩn khi click mouse, chỉ hiện khi Tab */
}
```

### Quy tắc a11y

- KHÔNG override focus-visible outline trên interactive elements
- Buttons, links phải có `title` hoặc `aria-label` nếu chỉ chứa icon
- Modal/overlay phải support `Escape` key để đóng
- Touch targets ≥ 44px trên mobile
