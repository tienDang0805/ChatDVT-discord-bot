# Frontend redesign — WIP handoff

Prepared 2026-10-02 (Asia/Ho_Chi_Minh). **The redesign is NOT finished or newly approved.** This handoff packages the current state; it is not permission to deploy it.

## Repository and exact working state

- Repository: https://github.com/tienDang0805/ChatDVT-discord-bot
- Resume branch: `codex/wip-frontend-redesign-handoff-2026-10-02`.
- Code snapshot commit: to be recorded after the first handoff commit. Resume the branch tip, including the subsequent documentation commit, rather than `main`.
- Original base: `650c04a23600b9bc175f1d1a741d4f33e77699f4` (`main`, `update gehihi tool search`). After fetching origin, main had zero local-only and zero remote-only commits.
- Latest code is in `/Users/qmacstore/Desktop/discord_gpt_bot`. `git worktree list --porcelain` showed only this checkout. No attached managed worktree.
- Before handoff there were 10 modified tracked frontend files and untracked frontend components/content/styles/images plus `design-demos/`. They are preserved in this branch, not reset. Generated build directories and private local state remain untracked/ignored.
- Next computer: the absolute checkout path will differ. Commands below run from the repository root. Do not copy old machine paths into new scripts.

## Active prompt, verbatim from the conversation

> Cảm nhận của tao là ngoài việc đổi màu ra thì 3 trang từ trang chủ ChatAI , about me , playground Chẳng khác gì cái cũ , Mấy cái bố cục đoạn ở dưới thì bố cục quá AI và rời rác
> Tao cần mày dựa vào **Huashu Design để nghiên cứu lại bố cục , giao diện đỡ bị formal quá phải có cá tính**

When asked for reference websites/screenshots, the user answered:

> Không có nên mới cần mày nghiên cứu

Prior scope request, still relevant:

> Thiết kể hết luôn đi 6 mục này rồi thiết kế xong code 1 phát luôn

Identity direction, verbatim:

> Làm tao hướng thứ 3 đi mà
>
> - Trong Me thì nhân vật chính là tao
> - ChatDVT sẽ xuất hiện nhưng là nhân vật phụ
> - chatDVT là Nhân vật chính ở discord bot
> - Mày hiểu không ?

The user also rejected overly square layouts, wanted to choose the main style themselves, and said their audience is recruiters. Priority: introduce Đặng Văn Tiến and showcase actual products. Homepage is included alongside Mobile, Projects & Lab, Discord Bot, AI Chat, Blog, About Me. Do not redesign backend, individual tools/games/admin features in this round.

The most recent request temporarily replaces design execution with preparing this cross-machine handoff. Resume design only after handing off safely.

## Completed work (not aesthetic approval)

1. Read Huashu's instructions and relevant workflow/content/typography/assets/critique/verification references; researched real layout references. Research notes are preserved, including source links.
2. Earlier three-direction prototypes and a refined Human × Sidekick direction were produced. A rounded/warm React implementation of all six navigation destinations plus Home exists under `client/src/site`. **The user then rejected its composition as mostly recoloring the old UI. Keep it as an implementation baseline, not an approved final design.**
3. Split site styling into `client/src/site/styles/`; reusable identity/product-proof components and data separate from page layout. Read `client/src/site/README.md`.
4. Incorporated supplied portraits and real Discord screenshots. `profileData.ts` contains concise mobile experience/three skill groups; company contributions are generic and omit client names, private screens/code, confidential implementation and invented metrics. AI-team models were integrated, not claimed as trained by Tiến.
5. Reopened the visual-choice gate in `design-demos/portfolio-redesign/direction-approved.md` and created three structural explorations under `layout-research-v2`:
   - A: `a.html/a.css/a.js`, “Một mạch làm việc”, content-led connected editorial trace.
   - B: `b.html/b.css/b.js`, “Một mạch tò mò”, connected work → experiment → story, Josh Comeau reference.
   - C: `c.html/c.css/c.js`, “Xưởng của Tiến”, green identity rail/lime-serif workshop, COLLINS thinking.
   Each includes Home, Me, Playground, AI Chat with the same factual content. They are independent HTML prototypes, not replacements for the production React pages yet.
6. Browser-rendered desktop/mobile top/full screenshots exist (48 direction screenshots + 4 baseline screenshots). A comparison `layout-research-v2/index.html` was written, **but final comparison-page and interaction QA have not been completed**.

## Current unfinished work and exact next steps

1. **Redo B's Chat composition first.** Inspection at handoff confirms `b.html` still has a persistent history sidebar and centered avatar/greeting. The requested correction was not applied before the design worker was interrupted. Do not describe B Chat as complete. Change only B chat: no centered hero, no persistent left history sidebar; welcome inside the conversation thread, composer as the main interaction anchor, inline suggestions, history in a drawer/overlay, optionally a small contextual right directory for Tiến/work/mobile. Preserve local-demo labels, safe text rendering, send/new-chat/history and 44px mobile controls; no real AI call. Other B views had already been visually reviewed.
2. Recapture B chat desktop/mobile, top/full after changing it. Recapture `a-home-mobile-top.jpg`: its previous capture was scrolled down. Full-page screenshots should also be checked against the latest source.
3. Test comparison index across all four views, Desktop/Mobile and Top/Full; check all 48 screenshot paths. Perform real browser interaction QA: navigation/skip link/menu/Escape, project filters/selectors/details, chat send/new/history, Enter vs Shift+Enter and IME handling. Document findings; do not invent scores or claim unrun tests pass.
4. Write a new v2 verification report. Prior v2 layout metrics were observed in browser-session memory, not persisted as a complete report. Screenshots are evidence, not proof of every interaction.
5. Show the three **actual rendered** directions and comparison page to the user, explain meaningful structural differences/tradeoffs, then stop for their choice. The previous direction-3 approval does not approve these new alternatives. Huashu's choice gate protects the user's right to choose.
6. Only after choice: refine the selected composition, design all six destinations + Home coherently, implement in the existing React site, verify responsive/accessibility/theme/VI–EN behavior and preserve feature/API routes. No deployment/merge without separate authorization.

## Files to read first

- `.agents/skills/huashu-design/SKILL.md`, then its references routed for this task.
- `LOCAL_SETUP.md`, `SKILLS.md`.
- `client/src/site/README.md`, current site pages/styles/content.
- `design-demos/portfolio-redesign/direction-approved.md`, `brand-spec.md`.
- `design-demos/portfolio-redesign/layout-research-v2/{brief,research,README,a-notes,b-notes,c-notes}.md` and the three prototypes.
- Previous `implementation-review.md`, `refinement-review.md`, verification JSONs: these describe the earlier implementation, not approval of v2.

## Install, run and inspect without secrets

Use Node 24 to reproduce this workstation (24.14.1, npm 11.11.0); the deployment workflow currently uses Node 20. Do not silently update dependencies/lockfiles for the handoff. Git, npm and Python 3 are required; Chrome/Chromium is needed for browser QA. SQLite CLI is optional for private data backup.

```sh
npm ci
npm --prefix client ci
npx prisma generate
npm run build
```

`npm run build` validates the catalogue, compiles backend, builds frontend and prerenders SEO. Its existing `build-client` script invokes `npm install`; inspect lockfile changes afterwards (none changed during this handoff). It does not start the bot. If Prisma generation requires a datasource on a clean machine, use the safe local SQLite `DATABASE_URL` template from LOCAL_SETUP; no Discord/API credentials are needed for static design work.

Terminal 1 (from repo root):

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory design-demos/portfolio-redesign
```

Open http://127.0.0.1:4174/layout-research-v2/index.html ; standalone views: `a.html#home`, `b.html#me`, `c.html#chat`. Some prototype links target the unchanged app preview on 4175, so run it separately:

```sh
npm --prefix client run preview -- --host 127.0.0.1 --port 4175 --strictPort
```

For live React editing: `npm --prefix client run dev -- --host 127.0.0.1`. Vite proxies `/api` to backend port 3000, but preview does not proxy. Missing API is expected in frontend-only mode; UI QA can mock it. Prototype Chat replies are clearly labeled local layout demos, not a working AI backend.

**Do not run root `npm run dev`/`npm start` merely to view the design.** They start the real Discord bot, register commands and may run scheduled jobs/send messages. Backend requires authorized sandbox credentials/data; see LOCAL_SETUP. No backend startup or real AI request was performed during handoff.

## Checks and known errors

Fresh handoff checks on 2026-10-02:

- `npm run build`: PASS, exit 0; 61 feature entries / 33 indexable, backend compilation, Vite build, 44 prerendered routes + root/sitemap. Existing warnings: stale Browserslist data, bundles larger than 500KB. Node-20 clean install/CI build was not run locally; local Node was 24.
- `node design-demos/portfolio-redesign/typecheck-site.mjs` from **repo root**: 17 site entry files, zero site errors; one dependency diagnostic TS6133, unused `state` in `client/src/shared/api/index.ts`. Report: `verification-site-types.json`. A first invocation from `client/` failed because the path was wrong; corrected root invocation passed.
- `node --check` on v2 `a.js`, `b.js`, `c.js`: PASS.
- `git diff --check` on the initial tracked modifications: PASS. The full staged snapshot additionally reports trailing whitespace/EOF blank lines in the untouched upstream skill and pre-existing new frontend/prototype files; retained to preserve the snapshot. Handoff-authored docs/templates/audit script pass the targeted staged whitespace check. These warnings are not build failures.
- `npm --prefix client run lint`: FAIL (pre-existing flat-config/legacy `--ext` incompatibility). Trying legacy mode without a config also fails (no legacy config); this was not fixed as part of handoff. Prior targeted lint inspection reported zero site errors / one older BlogArticle hooks warning, **not a full lint pass**. Full strict TS project audit also had existing feature/admin errors; current configured production build nevertheless passes.
- Prior warm React checks: `verification-production-complete.json` (32 responsive render checks) and `verification-production-interactions.json` (38 checks) passed at that time; chat/blog/bot APIs were mocked, not real Gemini/server validation.
- Prior v2 browser observations: 24 view/viewport combinations without horizontal overflow, broken active images or tiny (<12px) visible text; 12 desktop visual reviews. Recheck after B's fix. No complete final v2 interaction/comparison report yet.
- Skill copy checked byte-for-byte: 191 source files, zero missing/different files, excluding only `.last-update-check` machine-local bookkeeping. Final staged secret/size audit is recorded in `handoff-verification.json`.

## CI/CD push gate

Before the first WIP push, fetched origin and authenticated read-only GitHub API checks confirmed:

- One active workflow: `.github/workflows/deploy.yml`, “Deploy to Alibaba VM”. Trigger is exactly `push.branches: ["main"]`; no PR, tag, all-branch or manual trigger.
- Repository webhook list was empty (HTTP 200); GitHub Pages disabled (`has_pages: false`, Pages endpoint 404); GitHub deployments list empty.
- No separate Vercel/Netlify/other deploy configuration found in the scoped source tree. Thus this non-main WIP branch does not match the configured deploy path. No CI/CD edit was needed, and nothing is pushed/merged into main.
- This checks visible repository configuration at handoff time, not undiscoverable external polling systems. Recheck before later pushes if repository settings change. Do not invoke the deploy workflow or use `db push --accept-data-loss` locally just because deploy currently does.

## Alternating machines

At the end of each session: update these docs, inspect secrets and CI triggers, commit on this WIP branch and push. On the other computer first inspect `git status`; if dirty, commit/push its work rather than overwrite it. Then `git fetch origin` and `git pull --ff-only` on the WIP branch. Stop on divergence and reconcile deliberately; no hard reset, forced push or main merge. Browser tabs, running servers and agent conversation state do not travel through Git; these files are the continuation record.
