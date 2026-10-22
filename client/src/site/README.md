# Public portfolio frontend

The public site has Home, Playground, Apps, Discord Bot, AI Chat, Blog and Me routes. Tiến's visible profession is Mobile Developer; existing Mobile Developer search metadata is preserved. ChatDVT is his Discord/Web AI bot and a side project in Me. Home opens an opt-in ChatDVT companion: the existing mascot above a compact chat with Contact, Playground and About shortcuts. It reuses ChatWidget’s API, localized history, BYOK and IME support; no chat request is sent on open. Playground groups features into Mobile, Tool and Fun with all existing tools, games and Archive entries currently hidden from public discovery. Routes remain available for development; restoration metadata lives in `HIDDEN_PLAYGROUND_FEATURES.md`.

## Where to edit

- `pages/`: page composition; route definitions remain in `src/App.tsx`.
- `components/SiteLayout.tsx`: branding, navigation, language/theme controls, mobile menu and footer.
- `components/Mascot.tsx`: original chibi sprite actions and motion preferences.
- `components/FeatureArt.tsx`: feature illustrations from the chibi atlases.
- `content/profileData.ts`: profile, contributions, skills and contact details.
- `content/collection.ts`: Playground categories, adapting the shared feature catalog.
- `src/shared/desktopApps.ts` (repository root): TD-WallpaperEngine product facts, release version, URLs and localized features shared by the UI and metadata. `/apps` lists desktop software; `/apps/td-wallpaperengine` is the product page, with equivalent `/en` routes.
- `styles/index.css`: stylesheet order. The final `layered.css` defines the approved charcoal/cyan tokens, shared header/footer, controls and existing public page surfaces. `home.css` owns the Layered Mobile homepage and perspective diagram. `home-interactions.css` owns the reserved stack controls, layer inspection, agentic loop and compact companion. `home-hierarchy.css` aligns both hero labels, strengthens identity/skills/project hierarchy, adds glyph hover motion and styles the right section rail and work illustrations. Older page styles remain as layout foundations; final colors come from the layered tokens in both themes.
- `components/MobileStack.tsx`: original interactive CSS 3D mobile architecture, with an exploded overview, front-facing layer inspection, explanatory details, spring pointer tilt and small scroll parallax. Controls have a reserved gap below the projected geometry, including scroll drift. Uses the existing Framer Motion dependency; no canvas, WebGL engine or extra dependency.
- `components/AnimatedHeadline.tsx`: accessible heading with pointer-distance glyph lift, scale and color. Springs follow the pointer; there is no timed left-to-right wave. Reduced motion keeps static text.
- `components/ProjectArchitecture.tsx`: source-backed ChatDVT request/reply flow with discord.js and Node.js inside EC2, plus a desktop-app media/rendering flow. Each node opens its own explanation. Independent pause buttons and shared motion/visibility preferences stop the packets. The homepage uses these diagrams in place of screenshots; product detail pages retain their screenshots.
- `components/HomeSectionRail.tsx`: L0–L4 anchors with scroll position tracking; the existing right gutter contains the rail on desktop.
- `components/WorkVisual.tsx`: illustrative multi-box/multi-barcode inference, native/offline data flow and robot map navigation. Animation runs only in view, in the foreground and with motion enabled. The robot map illustrates vendor SDK integration, not a claim of authored navigation/SLAM code.
- `components/AgenticCodingFlow.tsx`: interactive Plan → Build → Review → Verify diagram. The trace and stage inspector run together; selecting a stage pauses the loop. Animation stops offscreen, in a hidden tab or when motion is reduced. Artifacts are explicitly illustrative.
- `shared/components/ChatWidget.tsx`: the homepage companion is an alternate view of the existing conversation core. Mascot art is supplied by Home; navigation suggestions work without an AI request.
- `components/SiteCommandPalette.tsx`: native accessible quick navigation dialog, available through the header and Cmd/Ctrl+K.
- `components/Mascot.tsx`: `useSiteMotion` shares system/user reduced-motion preferences with the hero, reveals and CSS; preferences restore after hydration, with SSR content fully visible.
- `components/Reveal.tsx`: progressive entrance enhancement. The content is never hidden while waiting for JavaScript or an observer.
- `styles/me.css`: profile layout with the genuine portrait, three work cards, skills, side-project prose and contact. Layered tokens supply its current colors. `SiteLayout` can hide its footer contact pitch when Me supplies its own contact section.
- `shared/hooks/usePageMeta.ts`: browser metadata, canonical URLs and structured data.

The active fonts, images and mascots in `client/public/` are required build assets. Design studies, screenshots, agent skills and machine setup documents are local files excluded by the root `.gitignore`.

## Build and preview

From the repository root, install dependencies with `npm ci`, then run `npm run build`. This validates the catalog, compiles the backend, builds the React client and generates SEO documents. Prisma Client must be generated during dependency installation; its generation does not apply database migrations.

For a frontend-only build, run `npm ci` and `npm run build` inside `client/`. Preview with `npm run preview -- --host 127.0.0.1 --port 4175`. Live chat and published Blog posts require the existing backend/API configuration. Never commit local `.env` files.

## Behavior and SEO

Chat retains the existing API, BYOK, history, Markdown and IME behavior. Blog uses published content in its authored language; untranslated English Blog routes are excluded from indexing and canonicalize to Vietnamese. Old Mobile URLs redirect in React to the localized Playground category. Tool, game, admin and backend behavior are outside this presentation change.

Home keeps a short professional introduction; Me holds the selected detailed work examples and personal portrait. Person JSON-LD is shared between the server and browser through `src/shared/siteIdentity.ts`. Existing browser/server SEO and Person data are unchanged by the visible profession update. Name aliases are metadata rather than repeated search phrases in visible copy.

Core public pages have full React SSR and hydrate in the browser. Blog lists and published articles are rendered from the database by Express. Mobile aliases redirect to Playground and are excluded from the sitemap. Server metadata and sitemap generation live in `src/api/seo.ts`. Local browser checks do not verify live indexing, Search Console or production performance.

ChatDVT stays a side project of the personal portfolio. Its main product page is `/discord`; `src/shared/chatdvt.ts` supplies the product metadata and the origin article's SEO summary to both server and browser. The original article body and publication dates remain authored content. Its BlogPosting identifies ChatDVT as the subject and Đặng Văn Tiến as author, with visible links between Me, the product and the story. This SEO update does not change Home or its metadata.

App screenshots in `client/public/images/apps/` come from `tienDang0805/TD_WallpaperEngine/docs/images`. Download links use the latest GitHub release page rather than a version-specific installer filename. The demo link opens the README's `#demo` section to show the GIF, instead of downloading a video. When updating the showcased app version, update `desktopApps.ts` and screenshots together. The site never runs installers or calls GitHub during page rendering.

Robot showcase copy uses a generic project name and describes React Native UI, the Android/Java bridge, manufacturer SDK integration, customer deployment and operational support. Vendor and customer names are omitted from Home and Me. Agentic coding lists the owner’s stated tools, Antigravity and Codex, without inventing separate tool roles.

### Scroll backdrop and FPS monitor

`ScrollLayerBackdrop` is mounted once by `SiteLayout` as a fixed, decorative scene behind the public pages. It uses five beveled glass surfaces with technical drawings (`SceneSurface`): React Native UI, Android/native bridge, agent workflow, ChatDVT routing and notes. The viewport camera responds to pointer position; smoothed scroll progress lifts and removes the current surface. Home uses actual section anchors and hides this scene behind the interactive hero stack until scrolling. Other tabs use document progress. Articles, chat and the CI/CD workspace use a quieter treatment.

The RAF loop only runs while scroll/camera values are converging. Ambient float and sparse dust use compositor transforms/opacity; hidden tabs pause them, while reduced motion switches to static stages. The scene is aria-hidden and ignores pointer input. Root isolation keeps the scene behind both content and footer, and its shaded left side preserves text contrast.

`FrameMonitor` opens from the FPS button in the shared header. While open and visible it samples RAF intervals, retaining 120 frames and publishing twice per second. FPS uses mean frame duration, p95 uses the nearest-rank percentile, and estimated RAF cadence uses the tenth percentile. RAF cadence is labelled as an estimate, never a hardware refresh-rate or GPU reading. Closing the panel removes its loop. Run its metric tests from client with `node --import tsx --test ../tests/frame-stats.test.ts`.

Home introduces Tiến as Mobile Developer at Southtelecom. The generic robot contribution is titled Robot App & SDK Integration; vendor/customer names stay omitted.

### Public tabs — shared page system

`PageIntro` shares a semantic heading, pointer-local glyph interaction, readable description, optional product/mascot art and entrance with the public tabs. `page-system.css` defines one content width, typography scale, neutral surfaces, controls, dialogs and route accents. The route’s `data-page` in `SiteLayout` selects its accent; the header and mobile navigation use the same family. Article prose remains a narrower column, while chat keeps its own scrollable thread and composer. Existing tool workspaces retain their functional UI.

FPS is rendered once in the shared header, keyed by pathname so changing routes closes and stops the probe. Chat content now sits inside `MascotMotion`, so smooth message scrolling follows the same motion preference. Main-page skeletons mirror the current layouts.

Audit scope: the six primary tabs, wallpaper detail, authored blog detail, ecosystem, 404 and the currently public CI/CD workspace; home checked for regressions. Responsive observations and interaction outcomes are recorded in `design-demos/ducmai-inspired/public-tabs-audit.md` and `public-tabs-verification.json`. Game internals, admin and login flows are independent applications and were not redesigned.
