# Public portfolio frontend

The public site has Home, Playground, Discord Bot, AI Chat, Blog and Me routes. Tiến is a Mobile Developer; ChatDVT is his AI chat bot, introduces the website and is also available on Discord. Playground groups features into Mobile, Tool and Fun without changing their existing routes or visibility.

## Where to edit

- `pages/`: page composition; route definitions remain in `src/App.tsx`.
- `components/SiteLayout.tsx`: branding, navigation, language/theme controls, mobile menu and footer.
- `components/Mascot.tsx`: original chibi sprite actions and motion preferences.
- `components/DiscoveryGuide.tsx`: session-based ChatDVT discovery suggestions.
- `components/FeatureArt.tsx`: feature illustrations from the chibi atlases.
- `content/profileData.ts`: profile, contributions, skills and contact details.
- `content/collection.ts`: Playground categories, adapting the shared feature catalog.
- `styles/index.css`: stylesheet order. `brand.css` and `neon.css` provide the final navy/cyan palette.
- `shared/hooks/usePageMeta.ts`: browser metadata, canonical URLs and structured data.

The active fonts, images and mascots in `client/public/` are required build assets. Design studies, screenshots, agent skills and machine setup documents are local files excluded by the root `.gitignore`.

## Build and preview

From the repository root, install dependencies with `npm ci`, then run `npm run build`. This validates the catalog, compiles the backend, builds the React client and generates SEO documents. Prisma Client must be generated during dependency installation; its generation does not apply database migrations.

For a frontend-only build, run `npm ci` and `npm run build` inside `client/`. Preview with `npm run preview -- --host 127.0.0.1 --port 4175`. Live chat and published Blog posts require the existing backend/API configuration. Never commit local `.env` files.

## Behavior and SEO

Chat retains the existing API, BYOK, history, Markdown and IME behavior. Blog uses published content in its authored language; untranslated English Blog routes are excluded from indexing and canonicalize to Vietnamese. Old Mobile URLs redirect in React to the localized Playground category. Tool, game, admin and backend behavior are outside this presentation change.

Browser metadata has distinct Home/Me copy and identifies ChatDVT as a Web/Discord chat bot. Server metadata and sitemap generation live separately in `src/api/seo.ts`. Known server follow-ups are stale initial route copy, Mobile aliases in the sitemap without server redirects, and unknown nested paths inheriting indexable prefix metadata. The current prerender produces metadata and a noscript summary rather than full React SSR. Local browser checks do not verify live indexing, Search Console or production performance.
