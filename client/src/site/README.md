# Public portfolio frontend

Seven main surfaces: Home, Mobile, Projects & Lab, Discord Bot, AI Chat, Blog, About Me. Blog article presentation is included. Direction 3: Human × Sidekick.

## Where to edit

- `pages/`: page composition and page-specific UI. Routes stay in the existing app router.
- `components/SiteLayout.tsx`: header, six navigation links, language/theme controls, accessible mobile menu, footer and common headings.
- `components/IdentityPortrait.tsx`: human portrait with a small ChatDVT sidekick. Shared by Home and Me.
- `components/ProductProof.tsx`: actual product screenshot with native modal viewing, Escape and focus restoration.
- `content/profileData.ts`: company contributions, skill groups and contact details. Change profile copy here rather than in the JSX.
- `content/discordProofs.ts`: screenshot filenames and bilingual captions.
- `content/siteData.tsx`: adapts the existing shared feature catalog; it remains the source of truth for visibility, status and project links.
- `styles/index.css`: imports layout/tokens, identity, collections, article, Discord and chat styles. `ecosystem.css` preserves the existing out-of-scope ecosystem page.
- `public/images/chatdvt/`: supplied Discord screenshots. Portrait and mascot stay in their existing image locations.

## Boundaries

Presentation tokens are scoped to `.site-root`; global `src/index.css` retains Tailwind/font initialization and the admin rich-text canvas. No tool/game/admin logic, server API, feature visibility or backend was changed. The chat page still uses the existing request, history, Gemini key, Markdown and IME behavior; an empty conversation now starts at the top of the welcome screen. Original blog content remains in its authored language.

The temporary CV is not served publicly. Company work is summarized by generic project type and personal contributions; no client names, private screenshots or internal architecture are published.

## Local preview

From `client/`: `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4175 --strictPort`.

UI preview: http://127.0.0.1:4175/. Existing API configuration/backend is still needed for live AI replies. The standalone design reference remains at http://127.0.0.1:4174/direction-3-complete.html while its preview server is running.

## Verification

Review artifacts, scripts and reports are in `design-demos/portfolio-redesign/`:

- `verify-complete.mjs production`: eight pages (seven surfaces + article) at 1440, 768, 390 and 375px; font loading, one visible h1, broken images and document overflow.
- `verify-interactions.mjs`: locale routing, real theme toggles, menu keyboard/focus, filters/search/archive, native gallery Escape/focus, company content and chat UI/history/error states. API responses are mocked; no Gemini request is sent.
- `typecheck-site.mjs`: strict TypeScript diagnostics for site entry points and their dependencies, reported separately.

The checked-in ESLint flat config refers to missing `typescript-eslint` and incompatible CLI flags. Verification therefore uses the already installed legacy ESLint plugins via `eslint-design.cjs`, without changing the app dependency/configuration files. The existing BlogArticle hook warning and unrelated full-app TypeScript errors are not repaired in this presentation-only task.

