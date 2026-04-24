# 🎨 ChatDVT Portal — UI Design System Rules

> **BẮT BUỘC**: Mọi AI/developer PHẢI đọc file này trước khi tạo hoặc sửa bất kỳ feature page nào.

---

## 1. Color Tokens

Tất cả feature pages phải hỗ trợ **Light/Dark mode** thông qua Tailwind `dark:` prefix.

### Backgrounds
| Token | Light (class) | Dark (class) |
|-------|---------------|--------------|
| Page background | `bg-slate-50` | `dark:bg-[#0d1117]` |
| Card / Section | `bg-white` | `dark:bg-[#131923]` |
| Input / Inner card | `bg-slate-100` | `dark:bg-[#1f2937]` |
| Hover card | `hover:bg-slate-50` | `dark:hover:bg-[#1a2332]` |

### Text
| Token | Light | Dark |
|-------|-------|------|
| Primary text | `text-slate-800` | `dark:text-slate-200` |
| Secondary text | `text-slate-500` | `dark:text-slate-400` |
| Muted text | `text-slate-400` | `dark:text-slate-500` |

### Borders
| Token | Light | Dark |
|-------|-------|------|
| Default border | `border-slate-200` | `dark:border-slate-800` |
| Hover border | `hover:border-orange-500/50` | `dark:hover:border-orange-500/50` |
| Subtle border | `border-slate-100` | `dark:border-slate-700` |

### Accent Colors
- **Global accent**: `orange-500` (`#f97316`) — dùng cho buttons, links, highlights
- **Feature accents** (tuỳ chọn, dùng cho decorative elements):
  - Tarot: `violet-500`
  - Magic Ball: `violet-500`
  - Deep Status: `cyan-500`
  - Burnout Check: `rose-500`
  - Astrology: `amber-500`
  - Numerology: `indigo-500`

> Feature accent chỉ dùng cho icon glow, decorative borders, gradients. 
> Primary buttons, links, labels vẫn dùng `orange-500`.

---

## 2. Layout Rules

### Page Structure
```
<PageShell>           ← Shared wrapper
  <content>           ← Feature-specific
</PageShell>
```

### Spacing & Width
| Element | Value |
|---------|-------|
| Max width (feature pages) | `max-w-4xl` |
| Max width (portal) | `max-w-6xl` |
| Page padding | `px-4 md:px-8 py-8 md:py-14` |
| Section gap | `space-y-6` |

### Back Button
- Luôn có ở header, mặc định `backTo="/"` (PublicPortal)
- **Sub-pages trong một feature PHẢI set `backTo` về Hub/parent page**, KHÔNG để default `"/"`
  - English sub-pages → `backTo="/english"`
  - English Unit Player → `backTo="/english/course"`
- Style: `bg-white dark:bg-[#1f2937] border rounded-xl p-2.5`
- Icon: `CornerUpLeft` from lucide-react

> **⚠️ Lỗi thường gặp**: Quên truyền `backTo` → user bấm back bị bay về PublicPortal thay vì Hub.

---

## 3. Component Patterns

### Cards
```html
<div class="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 
            rounded-xl p-6 shadow-sm transition-colors">
```

### Primary Button
```html
<button class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold 
               py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98]">
```

### Input
```html
<input class="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 
              dark:border-slate-700 text-slate-800 dark:text-slate-200 
              rounded-xl px-4 py-3 outline-none focus:border-orange-500 
              transition-colors" />
```

### Section Label
```html
<label class="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">
```

### Error Message
```html
<div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 
            text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center">
```

---

## 4. Typography

- **Font**: `font-sans` (system-ui)
- **Page title**: `text-2xl md:text-4xl font-black` 
- **Subtitle**: `text-xs md:text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider`
- **Section heading**: `text-lg font-bold text-slate-800 dark:text-slate-100`
- **Body text**: `text-sm leading-relaxed text-slate-600 dark:text-slate-300`

---

## 5. Animations (Cho phép)

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(15px) } to { opacity:1; transform:translateY(0) } }
@keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
```

- `fadeUp`: Mọi content khi xuất hiện
- `shimmer`: Title gradient text
- `transition-colors duration-300`: Theme toggle
- Feature-specific animations (ball shake, card flip...) OK nhưng phải dùng `@keyframes` trong `<style>` tag
- `NavigationProgress`: Tự có progress bar khi route change, KHÔNG cần thêm animation riêng

---

## 6. Responsive

- Mobile-first approach
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Text clamp: `text-[clamp(20px,5vw,32px)]`
- Padding responsive: `px-4 md:px-8`

---

## 7. DO's and DON'Ts

### ✅ DO
- Dùng Tailwind utility classes với `dark:` prefix
- Dùng `PageShell` component cho mọi feature page
- Support Light + Dark mode
- Dùng `orange-500` cho primary actions
- Dùng `transition-colors` cho smooth theme toggle
- Dùng `shadow-sm` cho cards

### ❌ DON'T
- KHÔNG dùng inline styles cho colors/backgrounds (chỉ cho dynamic values)
- KHÔNG hardcode dark-only backgrounds (`bg-[#0a0a0f]` without light variant)
- KHÔNG dùng custom fonts (chỉ system-ui)
- KHÔNG tạo page mới mà không có back button
- KHÔNG skip light mode support
- KHÔNG viết CSS riêng nếu Tailwind đã có utility tương đương
- KHÔNG override global `focus-visible` outline
- KHÔNG tự set `document.title` — dùng `PageShell` hoặc `usePageMeta()`
- KHÔNG tạo modal/overlay mà không support `Escape` key

---

## 8. File Structure

```
client/src/
├── shared/
│   ├── components/
│   │   ├── PageShell.tsx          ← Shared page wrapper (auto page title via usePageMeta)
│   │   ├── GeminiKeyInput.tsx     ← API key input
│   │   ├── Layout.tsx             ← Admin layout
│   │   ├── ChatWidget.tsx         ← AI chat FAB (Escape close, confirm clear)
│   │   ├── GlobalMusicPlayer.tsx  ← Music FAB + progress bar + seek
│   │   ├── ErrorBoundary.tsx      ← Global error catch → retry UI
│   │   ├── OfflineBanner.tsx      ← Offline/online detection banner
│   │   └── NavigationProgress.tsx ← Route transition bar (NProgress-style)
│   ├── hooks/
│   │   └── usePageMeta.ts         ← Auto set document.title + meta
│   └── contexts/
│       ├── ThemeContext.tsx       ← L/D toggle
│       └── MusicPlayerContext.tsx ← Music state + currentTime/duration/seekTo
├── features/
│   └── public/
│       ├── portal/pages/
│       │   └── PublicPortal.tsx   ← Reference design (prefetch, Share API)
│       └── tarot/pages/
│           └── TarotPage.tsx
└── rule_ui.md                     ← THIS FILE
```

---

## 9. A11y (Accessibility)

### Focus Visible (Đã cấu hình global trong `index.css`)

- Tất cả interactive elements tự có orange outline khi Tab navigate
- Outline ẩn khi click mouse (`focus:not(:focus-visible)`)
- KHÔNG override hoặc xóa outline này

### Quy tắc

- Icon-only buttons: luôn có `title` hoặc `aria-label`
- Modal/overlay: support `Escape` key để đóng
- Touch targets: ≥ 44px trên mobile
- Destructive actions: luôn có `confirm()` dialog
