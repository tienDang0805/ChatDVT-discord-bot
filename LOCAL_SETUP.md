# Local setup and files Git intentionally does not carry

Inventory checked 2026-10-02. Old checkout: `/Users/qmacstore/Desktop/discord_gpt_bot`; new checkout: `<new-repo>`. **No secret values or database contents are in these documents.** Git contains enough assets/content for frontend design and static preview; secrets/data are optional unless running the backend.

## Separate transfers

| Source on current machine | Destination on new machine | Needed / safe transfer |
|---|---|---|
| `/Users/qmacstore/Desktop/discord_gpt_bot/.env` | `<new-repo>/.env` | Backend credentials/settings. Transfer only through a company-approved encrypted channel or provision dev credentials from a vault. Never Git, chat, screenshots, public links or terminal output. Restrict permissions to owner (`chmod 600 .env`). |
| `/Users/qmacstore/Desktop/discord_gpt_bot/prisma/bot.db` | `<new-repo>/prisma/bot.db` | SQLite local state (315,392 bytes at inspection); contains user/chat/configuration data and may contain stored API credentials. For identical backend state use a consistent SQLite backup below, never commit it. Use scrubbed fresh dev data if company policy forbids moving user data. |
| `/Users/qmacstore/Downloads/Dang_Van_Tien_Mobile_Software_Engineer_CV.pdf` | An approved **private directory outside** `<new-repo>/client/public` | Optional for rechecking the CV. Concise public facts are already in `profileData.ts` and prototypes. Do not publish the original CV automatically. |

Only the root `.env` was found among `.env` variants in the inspected project (excluding dependency/build folders); no client `.env` exists now. If a new machine requires browser config, copy `client/.env.example` to `client/.env.local` and fill only public values. `VITE_*` variables are bundled into browser code; they are never a place for Gemini keys, Discord tokens or secrets. Root `.env` is not Vite's default client env directory.

The root `.env` variable **names** present: `ADMIN_ID`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `APIKEY_WEATHER`, `AUTO_REPLY_PROMPT`, `BEAUTY_CHANNEL_ID`, `BEAUTY_INTERVAL_MINUTES`, `CLIENT_ID`, `DATABASE_URL`, `DISCORD_CHANNEL_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`, `DiscrodTrackingWebhook`, `FB_APP_SECRET`, `FB_PAGE_ACCESS_TOKEN`, `FB_VERIFY_TOKEN`, `GEMINI_API_KEY`, `GOOGLE_TTS_API_KEY`, `GUILD_ID`, `JWT_SECRET`, `MONGODB_URI`, `NASA_API_KEY`, `PORT`, `SYSTEM_PROMPT`, `VITE_DISCORD_CLIENT_ID`. Source has additional optional `CORE_RULES` and `POE2_*` settings; `.env.example` includes safe names/placeholders. It does not reproduce real values.

Actual configured database is SQLite at the source path above. Prisma resolves `file:./bot.db` relative to `prisma/schema.prisma`. `MONGODB_URI` is a declared setting, not evidence that a local Mongo database is in use; no local Mongo dump was found or made. No production/remote database was contacted/exported.

## Consistent database transfer

Prefer SQLite's backup facility (requires `sqlite3`) instead of copying a live `.db`. Choose an approved private destination you own, outside the repo, and do not overwrite an existing backup:

```sh
# Replace /approved-private-transfer with an approved existing private directory.
sqlite3 prisma/bot.db ".backup '/approved-private-transfer/chatdvt-bot-backup.db'"
chmod 600 /approved-private-transfer/chatdvt-bot-backup.db
```

The backup includes committed WAL state in a consistent snapshot. Alternatively stop the actual bot/API process, verify that it is stopped, and copy DB plus any `-wal`/`-shm` companions together. These companions were not present at inspection; do not assume they cannot appear later. **No backup/export was performed during handoff.**

At destination, stop local bot/API first. If `prisma/bot.db` already exists, preserve a separate private backup before importing—never overwrite ongoing work blindly. Place the approved backup at `prisma/bot.db`, then `npx prisma generate`. Do not run `db push --accept-data-loss`. For a completely fresh disposable development database with no transferred data, `npx prisma db push` can initialize the checked-in schema after reviewing its effect. No production data/credentials should be used just to preview design.

## Other local state / assets

- `client/public/hbd/`: private birthday-photo directory is ignored, currently empty. Future private assets require separate approved transfer; not needed for portfolio redesign.
- `temp/`: 4 local files (~6.97MB), generated audio/scratch data; not needed to run the site and not committed. Do not transfer blindly; inspect for private content if you need it.
- `_LEGACY_BACKUP/`: 36 ignored files (~502KB); old reference backup, not the current runtime. Left intact. Optional private archival transfer only after a secret/data audit.
- `MONOPOLY_ECONOMY_REVIEW.md`, ignored `pixel_agents_tmp` READMEs, editor metadata: unrelated local work remains intact, not included in the handoff commit. `pixel_agents_tmp` has pre-existing tracked source; tracked parts already travel with Git. Do not clean/reset it.
- `src/data/chatHistory.json`: ignored, absent at inspection. If a future machine creates it, it is private state needing separate transfer, not a public artifact.
- Upload routes inspected use Multer **memory** storage; no persistent upload directory was found. Database-backed user/config/history data is in SQLite. No additional private storage export was attempted.
- Portfolio fonts (`assets/*.woff2` + license), person/bot portraits, real Discord evidence, Deep Link UI screenshot, React images and all prototype/research screenshots are in this WIP Git snapshot. Original `/var/folders/.../TemporaryItems/...` screenshot paths are ephemeral and unnecessary: project-owned copies exist. Do not recreate them from inaccessible old paths.
- `node_modules/`, `client/node_modules/`, `dist/`, `client/dist/` are generated/ignored; rebuild, do not transfer them. For the unrelated `pixel_agents_tmp` extension only, install its own dependencies if actually working on that extension; not necessary for site redesign.
- Browser localStorage/IndexedDB (theme, language, local chats, BYOK keys, device grants) and Codex/Chrome sessions are machine-local. Prefer re-entering settings/key through a private vault; **do not dump all browser storage into Git or chat**. Android WebUSB/ADB permissions must be granted anew.
- GitHub credentials, SSH/VM keys, GitHub Actions secrets, plugin authentication and Codex account credentials are not project files. Authenticate separately on the new machine. Do not copy global credential/config directories into the repo. CI secrets remain on GitHub; local `.env` is not a substitute for editing Actions secrets.

## Clean-machine startup

Frontend-only design: install Git, Node/npm (24.14.1/npm11 reproduces current local checks), Python3 and Chrome/Chromium. Follow HANDOFF's `npm ci`, client install, build, Python4174 and preview4175 commands. **No private transfers needed for this mode.** The initial install requires approved npm access; no node_modules bundle was committed. A build network/registry block is not permission to bypass company proxy/policy.

Optional backend: copy `.env.example` to `.env`, fill authorized development credentials privately, secure permissions, configure SQLite and generate Prisma client. Existing root `npm run dev` starts both the API (3000) and Discord bot, registers slash commands and runs scheduled integrations; use a development Discord application/server, not the production token. Only start it when those effects are intended. No dedicated backend-only preview flag was found or invented.

## Corporate restrictions

No company policy block was observed during these checks; GitHub read access succeeded. That does **not** establish permission to transfer company credentials, user chats, private CVs or company data between devices. If policy/MDM/network prohibits any transfer, leave that material on its approved machine and continue the static frontend with existing public assets plus fresh/scrubbed dev settings. Report the blocked item explicitly rather than bypassing controls or uploading it through another service.
