# 📐 ChatDVT Client — Feature Architecture Rules

> **BẮT BUỘC ĐỌC FILE NÀY + `rule_ui.md` TRƯỚC KHI TẠO BẤT KỲ FEATURE MỚI NÀO.**
>
> - `rule_ui.md` = Design System (colors, components, UI patterns)
> - `feat_rule.md` = Architecture (folder structure, routing, state)
> - `rule_[feature].md` = Rule riêng cho complex feature

---

## 1. Triết lý

- **Mỗi feature = 1 folder riêng** — dù chỉ 1 page, sau này scale thêm data/utils/components dễ dàng
- **Public vs Admin** — tách rõ 2 nhóm feature để dễ tìm, dễ quản lý quyền truy cập
- **Self-contained** — xóa 1 folder = xóa sạch feature

---

## 2. Folder Structure

```
client/src/
├── App.tsx                              # Routing + Providers
├── main.tsx                             # Entry point
├── index.css                            # Global styles
├── App.css                              # App-level styles
│
├── shared/                              # SHARED across tất cả features
│   ├── components/                      # Components dùng ≥2 features
│   │   ├── PageShell.tsx                #   Layout wrapper (backTo prop)
│   │   ├── GeminiKeyInput.tsx           #   BYOK Gemini key
│   │   ├── Layout.tsx                   #   Admin sidebar layout
│   │   ├── EditableCV.tsx               #   CV editor
│   │   └── GlobalMusicPlayer.tsx        #   Music FAB
│   ├── contexts/                        # Global state
│   │   ├── ThemeContext.tsx
│   │   └── MusicPlayerContext.tsx
│   ├── api/                             # API client (axios)
│   │   └── index.ts
│   └── assets/                          # Static files
│
└── features/
    ├── public/                          # 🌐 PUBLIC — Ai cũng truy cập được
    │   ├── portal/pages/                #   Trang chủ PublicPortal
    │   ├── english/                     #   English Hub (complex)
    │   │   ├── pages/
    │   │   ├── utils/
    │   │   └── data/
    │   ├── tarot/                       #   Tarot (có data riêng)
    │   │   ├── pages/
    │   │   └── data/
    │   ├── tutien/                      #   Tu Tiên Game (có components riêng)
    │   │   ├── pages/
    │   │   └── components/
    │   ├── magic-ball/pages/            #   Simple features...
    │   ├── food-wheel/pages/
    │   ├── tech-duel/pages/
    │   └── .../pages/                   #   28 features tổng cộng
    │
    └── admin/                           # 🔒 ADMIN — Cần đăng nhập
        ├── dashboard/pages/
        ├── control-center/pages/
        ├── settings/pages/
        ├── user-management/pages/
        ├── logs/pages/
        ├── identity/pages/
        ├── prompts/pages/
        ├── tree-editor/pages/
        ├── pets-admin/pages/
        └── couple/pages/
```

### Quy tắc tuyệt đối:

| Rule | Chi tiết |
|:-----|:---------|
| Public feature | Nằm trong `features/public/[name]/` |
| Admin feature | Nằm trong `features/admin/[name]/` |
| Mỗi feature | Tối thiểu có `pages/` folder |
| Shared only | Components dùng ≥2 features → `shared/components/` |
| Không cross-import | Feature A không import từ Feature B |

---

## 3. Import Paths

### Từ `features/public/[name]/pages/` hoặc `features/admin/[name]/pages/`:
```tsx
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput } from '../../../../shared/components/GeminiKeyInput';
```

### Từ feature có utils/data riêng (ví dụ english):
```tsx
import { addXP } from '../utils/gamification';
import vocabData from '../data/english-vocab.json';
```

### Từ `App.tsx`:
```tsx
const MyFeature = lazy(() => 
  import('./features/public/my-feat/pages/MyFeature')
    .then(m => ({ default: m.MyFeature }))
);
const AdminPage = lazy(() => 
  import('./features/admin/dashboard/pages/Dashboard')
    .then(m => ({ default: m.Dashboard }))
);
```

### Import Rules:
| ✅ Được | ❌ Không được |
|:--------|:-------------|
| Feature → Shared | Feature A → Feature B |
| Feature → Own utils/data | Shared → Feature |
| App.tsx → Features | Public → Admin (ngược lại cũng vậy) |

---

## 4. Routing

### Public routes (không cần auth):
```tsx
<Route path="/feature-name" element={<FeaturePage />} />
```

### Admin routes (cần auth):
```tsx
<Route path="/admin/*" element={
  <RequireAuth>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  </RequireAuth>
} />
```

### Back Button Hierarchy:
```
PublicPortal (/)
├── Single-page features (/feat)           → backTo="/"
└── Multi-page features (/hub)             → backTo="/"
    └── Sub-pages (/hub/sub)               → backTo="/hub"

Admin (/admin)
└── Admin pages (/admin/settings)          → (Layout sidebar, no backTo)
```

---

## 5. Thêm Feature Mới

### Public Feature:
```
□ Tạo folder: src/features/public/[name]/pages/
□ Tạo page:   [Name].tsx (PageShell + export named + default)
□ App.tsx:     Thêm lazy import + <Route>
□ Portal:     Thêm card trong PublicPortal.tsx
□ Design:     Follow rule_ui.md
□ Mobile:     Test 375px, touch targets ≥ 44px
□ TypeScript: npx tsc --noEmit pass
```

### Admin Feature:
```
□ Tạo folder: src/features/admin/[name]/pages/
□ Tạo page:   [Name].tsx (export named + default)
□ App.tsx:     Thêm <Route> trong block admin/*
□ Layout:     Thêm link trong Layout sidebar (nếu cần)
□ TypeScript: npx tsc --noEmit pass
```

### Scale feature (thêm data/utils/components):
```
□ Thêm sub-folder: utils/, data/, components/ theo nhu cầu
□ Sub-pages: backTo="/[hub]" — KHÔNG back về "/"
□ Tạo rule_[feature].md cho complex features
```

---

## 6. Naming Convention

| Loại | Convention | Ví dụ |
|:-----|:-----------|:------|
| Feature folder | kebab-case | `magic-ball/`, `food-wheel/` |
| Page file | PascalCase | `MagicBallPage.tsx` |
| Utility file | camelCase | `gamification.ts` |
| Data file | kebab-case | `english-vocab.json` |
| Export | Named + Default | `export const X; export default X;` |

---

## 7. State & Storage

| Ưu tiên | Khi nào dùng |
|:---------|:-------------|
| `useState` | Default cho mọi thứ |
| `localStorage` | Persist data (prefix key theo feature: `eng_*`, `tarot_*`) |
| React Context | Global state (theme, auth, music) |
| API/Server | Data từ backend |

---

## 8. PageShell — Bắt buộc cho Public Features

```tsx
<PageShell 
  title="Feature Name"
  subtitle="Description"
  icon="🎯"
  backTo="/parent"       // "/" nếu top-level, "/hub" nếu sub-page
  maxWidth="4xl"
>
  {children}
</PageShell>
```

---

## 9. DOs and DON'Ts

### ✅ DO:
- Đọc `rule_ui.md` + `feat_rule.md` trước khi code
- Tạo folder riêng cho mỗi feature, kể cả 1 page
- Public feature → `features/public/`, Admin → `features/admin/`
- `PageShell` + `backTo` đúng hierarchy
- Handle loading + error + retry
- Test mobile 375px
- Pass TypeScript check

### ❌ DON'T:
- Tạo file trực tiếp trong `src/` (ngoài App.tsx, main.tsx, css)
- Đặt feature trong sai nhóm (public vs admin)
- Import cross-feature
- Hardcode `to="/"` cho sub-pages
- Ship code không pass tsc
