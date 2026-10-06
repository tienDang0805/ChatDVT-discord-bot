# Public portfolio frontend

The public site has Home, Playground, Apps, Discord Bot, AI Chat, Blog and Me routes. Tiến is a Mobile Developer; ChatDVT is his Discord/Web AI bot and a side project in Me. The session guide and shared floating chat are no longer mounted. Playground groups features into Mobile, Tool and Fun without changing their existing routes or visibility.

## Where to edit

- `pages/`: page composition; route definitions remain in `src/App.tsx`.
- `components/SiteLayout.tsx`: branding, navigation, language/theme controls, mobile menu and footer.
- `components/Mascot.tsx`: original chibi sprite actions and motion preferences.
- `components/FeatureArt.tsx`: feature illustrations from the chibi atlases.
- `content/profileData.ts`: profile, contributions, skills and contact details.
- `content/collection.ts`: Playground categories, adapting the shared feature catalog.
- `src/shared/desktopApps.ts` (repository root): TD-WallpaperEngine product facts, release version, URLs and localized features shared by the UI and metadata. `/apps` lists desktop software; `/apps/td-wallpaperengine` is the product page, with equivalent `/en` routes.
- `styles/index.css`: stylesheet order. `brand.css` and `neon.css` provide the final navy/cyan palette.
- `shared/hooks/usePageMeta.ts`: browser metadata, canonical URLs and structured data.

The active fonts, images and mascots in `client/public/` are required build assets. Design studies, screenshots, agent skills and machine setup documents are local files excluded by the root `.gitignore`.

## Build and preview

From the repository root, install dependencies with `npm ci`, then run `npm run build`. This validates the catalog, compiles the backend, builds the React client and generates SEO documents. Prisma Client must be generated during dependency installation; its generation does not apply database migrations.

For a frontend-only build, run `npm ci` and `npm run build` inside `client/`. Preview with `npm run preview -- --host 127.0.0.1 --port 4175`. Live chat and published Blog posts require the existing backend/API configuration. Never commit local `.env` files.

## Behavior and SEO

Chat retains the existing API, BYOK, history, Markdown and IME behavior. Blog uses published content in its authored language; untranslated English Blog routes are excluded from indexing and canonicalize to Vietnamese. Old Mobile URLs redirect in React to the localized Playground category. Tool, game, admin and backend behavior are outside this presentation change.

Home keeps a short Mobile Developer introduction; Me holds work and education details. Person JSON-LD is shared between the server and browser through `src/shared/siteIdentity.ts`. Name aliases are metadata rather than repeated search phrases in visible copy.

Core public pages have full React SSR and hydrate in the browser. Blog lists and published articles are rendered from the database by Express. Mobile aliases redirect to Playground and are excluded from the sitemap. Server metadata and sitemap generation live in `src/api/seo.ts`. Local browser checks do not verify live indexing, Search Console or production performance.

App screenshots in `client/public/images/apps/` come from `tienDang0805/TD_WallpaperEngine/docs/images`. Download links use the latest GitHub release page rather than a version-specific installer filename. The demo link opens the README's `#demo` section to show the GIF, instead of downloading a video. When updating the showcased app version, update `desktopApps.ts` and screenshots together. The site never runs installers or calls GitHub during page rendering.
