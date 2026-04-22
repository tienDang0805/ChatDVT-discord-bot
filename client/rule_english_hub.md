# 🇺🇸 English Hub — Development Rules

> **BẮT BUỘC ĐỌC FILE NÀY TRƯỚC KHI VIẾT BẤT KỲ CODE NÀO LIÊN QUAN ĐẾN ENGLISH HUB.**

---

## 1. File Structure

```
client/src/features/public/english/
├── pages/
│   ├── EnglishHub.tsx              # Dashboard (game hub, XP bar, badges)
│   ├── EnglishChat.tsx             # AI Tutor chat
│   ├── EnglishFlashcard.tsx        # SRS Flashcards (SM-2)
│   ├── EnglishChallenge.tsx        # Daily AI Challenge
│   ├── EnglishDictionary.tsx       # Dictionary lookup
│   ├── DailyPuzzle.tsx             # Wordle-style game
│   ├── WordSprint.tsx              # 60s typing game
│   └── SpellingBee.tsx             # Audio → Spelling game
├── utils/
│   └── gamification.ts             # XP engine, levels, badges, stats
├── data/
│   └── english-vocab.json          # 200+ words, 10 topics, 30 phrases
```

### Shared components (KHÔNG nằm trong folder english):
```
client/src/components/
├── PageShell.tsx                    # Layout wrapper (có prop backTo)
└── GeminiKeyInput.tsx               # BYOK component
```

### Import paths (từ features/public/english/pages/):
```tsx
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput } from '../../../../shared/components/GeminiKeyInput';
import { addXP, getStats, XP_VALUES } from '../utils/gamification';
import vocabData from '../data/english-vocab.json';
```

### Import paths (từ App.tsx):
```tsx
const EnglishHub = lazy(() => import('./features/public/english/pages/EnglishHub').then(m => ({ default: m.EnglishHub })));
```

---

## 2. Navigation & Routing

### Route Structure

| Route | Page | Back Target |
|:------|:-----|:------------|
| `/english` | EnglishHub (Dashboard) | `/` (PublicPortal) |
| `/english/chat` | AI English Tutor | `/english` |
| `/english/flashcard` | Flashcard SRS | `/english` |
| `/english/challenge` | Daily Challenge | `/english` |
| `/english/dictionary` | Quick Dictionary | `/english` |
| `/english/daily-puzzle` | Daily Word Puzzle (Wordle) | `/english` |
| `/english/word-sprint` | Word Sprint (60s) | `/english` |
| `/english/spelling-bee` | Spelling Bee | `/english` |

### Quy tắc Back Button

- **EnglishHub** (`/english`): KHÔNG truyền `backTo` → default `"/"` → về PublicPortal
- **Mọi sub-page** (`/english/*`): **BẮT BUỘC** `backTo="/english"`
- Cú pháp: `<PageShell title="..." backTo="/english">`
- **TUYỆT ĐỐI KHÔNG** để sub-page back về `/`

### Thêm Route Mới

1. Tạo file trong `features/public/english/pages/[GameName].tsx`
2. Thêm lazy import trong `App.tsx` trỏ đến `./features/public/english/pages/`
3. Thêm `<Route>` trong block `/english/*`
4. **Luôn** dùng prefix `/english/` cho path
5. Thêm card/link trong `EnglishHub.tsx` dashboard

---

## 3. Design System

### Colors & Branding

| Element | Value |
|:--------|:------|
| Primary accent | `orange-500` |
| Primary hover | `orange-600` |
| Tint background | `orange-500/10`, `orange-50` |
| Tint border | `orange-500/20`, `orange-200` |
| Correct / Success | `emerald-500` |
| Wrong / Error | `red-500` |
| Warning | `amber-500` |

### Component Patterns

- **Wrapper**: Luôn dùng `<PageShell>` làm outermost wrapper
- **API Key**: Luôn render `<GeminiKeyInput accent="orange" />` ở pages cần Gemini
- **Cards**: `bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm`
- **Buttons primary**: `bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl`
- **Badges/tags**: `text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500`
- **Typography**: System font, NO custom Google Fonts

### Animations (inline `<style>`)

- Luôn dùng inline `<style>{...}</style>` cho keyframe animations
- Dùng Tailwind utility cho simple transitions: `transition-all`, `active:scale-[0.98]`
- Bắt buộc có `fade-up` class trên container chính (defined trong PageShell)

---

## 4. Gamification Engine

### Import

```tsx
import { addXP, getStats, XP_VALUES, getLevelInfo, BADGES } from '../utils/gamification';
```

### XP Points

| Action | XP | Constant |
|:-------|:---|:---------|
| Chat message | +5 | `XP_VALUES.CHAT_MESSAGE` |
| Flashcard correct | +3 | `XP_VALUES.FLASHCARD_CORRECT` |
| Flashcard wrong | +1 | `XP_VALUES.FLASHCARD_WRONG` |
| Challenge correct | +15 | `XP_VALUES.CHALLENGE_CORRECT` |
| Challenge wrong | +3 | `XP_VALUES.CHALLENGE_WRONG` |
| Word Sprint correct | +10 | `XP_VALUES.WORD_SPRINT_CORRECT` |
| Spelling Bee easy | +8 | `XP_VALUES.SPELLING_BEE_EASY` |
| Spelling Bee hard | +15 | `XP_VALUES.SPELLING_BEE_HARD` |
| Sentence Builder | +12 | `XP_VALUES.SENTENCE_BUILDER` |
| Daily Puzzle solved | +25 | `XP_VALUES.DAILY_PUZZLE_SOLVED` |

### Cách ghi điểm đúng

```tsx
const result = addXP(XP_VALUES.CHALLENGE_CORRECT);
result.stats.challengesDone = (result.stats.challengesDone || 0) + 1;
localStorage.setItem('eng_progress', JSON.stringify(result.stats));
```

### KHÔNG ĐƯỢC:
- ❌ Tự tạo progress object: `JSON.parse(localStorage.getItem('eng_progress') || '{}')`
- ❌ Tự tính streak manual
- ❌ Tự save stats mà không qua `addXP()`
- ✅ Luôn dùng `addXP()` → auto handle XP, streak, badges, level

---

## 5. Data Layer

### Vocab Data

- File: `features/public/english/data/english-vocab.json`
- Structure: `{ topics: Topic[], commonPhrases: Phrase[] }`
- Mỗi word: `{ word, ipa, vi, example }`
- Import: `import vocabData from '../data/english-vocab.json'`

### Storage Keys

| Key | Data | Owner |
|:----|:-----|:------|
| `eng_progress` | PlayerStats (XP, level, streak, badges...) | `gamification.ts` |
| `eng_srs_cards` | SRSCard[] (flashcard deck) | `EnglishFlashcard.tsx` |
| `eng_chat_history` | ChatMessage[] (max 50) | `EnglishChat.tsx` |
| `eng_daily_puzzle` | Puzzle state (day, guesses, result) | `DailyPuzzle.tsx` |
| `eng_api_key` | Gemini API key (BYOK) | `GeminiKeyInput.tsx` |

### KHÔNG ĐƯỢC:
- ❌ Tạo storage key mới mà không document ở đây
- ❌ Dùng `eng_progress` trực tiếp — luôn qua `getStats()` / `addXP()`

---

## 6. Game Development Rules

### Thêm Mini-Game Mới

1. Tạo file `features/public/english/pages/[GameName].tsx`
2. Export named + default: `export const GameName = () => { ... }; export default GameName;`
3. Dùng `<PageShell backTo="/english">` wrapper
4. Tích hợp XP qua `addXP()` khi game kết thúc
5. Update stats: `gamesPlayed`, `correctAnswers`, `totalAnswers`
6. Thêm route trong `App.tsx` (import từ `./features/public/english/pages/`)
7. Thêm card trong `EnglishHub.tsx` → section Mini Games

### Game UI Pattern (3 states)

```
Ready screen → Playing screen → Finished screen (results + XP + play again)
```

- **Ready**: Icon lớn + description + best score + START button
- **Playing**: Progress bar + score display + input area + timer (nếu có)
- **Finished**: Trophy icon + score + stats grid (3 cols) + XP gained + Play Again button

### Feedback Animations

| Event | Animation |
|:------|:----------|
| Correct answer | Green flash / glow |
| Wrong answer | Red shake |
| Combo | Scale bounce + fire emoji |
| New record | Pulse animation |
| Level up | Toast notification |

---

## 7. Mobile-First Checklist

- [ ] Touch targets ≥ 44px (`py-3`, `h-11`)
- [ ] Buttons: `active:scale-[0.98]` hoặc `active:scale-90`
- [ ] Input: `text-base` (16px min → prevent iOS zoom)
- [ ] Overflow scroll: `overflow-x-auto` cho horizontal lists
- [ ] Max width: `max-w-sm mx-auto` cho game screens
- [ ] Test trên viewport 375px width

---

## 8. API Integration

### Gemini AI

- Endpoint: `/api/english/chat`, `/api/english/challenge`
- Auth: BYOK via `getStoredGeminiKey()`
- Fallback: Handle error gracefully, show retry button

### Dictionary API

- URL: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- Free, no key needed
- Fallback: Gemini generate definition

### TTS (Text-to-Speech)

- Web Speech API: `speechSynthesis`
- Settings: `lang='en-US'`, `rate=0.8`
