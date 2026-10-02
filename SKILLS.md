# Skills and tools for continuation

## Design skill snapshot

`huashu-design` is the design workflow actively used. It was installed as a standalone local skill from https://github.com/alchaincyf/huashu-design, not authored in this project and not dependent on a Codex plugin. MIT license is preserved. There are no project-authored custom design skills to copy.

The complete reusable snapshot is now under `.agents/skills/huashu-design/`: SKILL.md, all scripts/references/assets/demos, package manifests, README, SECURITY, tests/examples and LICENSE (191 files). Only `.last-update-check` machine-local bookkeeping was omitted; no .env, node_modules, account credentials or plugin cache was copied. The installed source directory had no Git metadata, so an upstream commit SHA cannot honestly be stated. Snapshot SKILL.md SHA-256: `4317648da4431bbbb2e77a837804f8c23c494acfa8871134b2edbc40cd1e3cc5`. Git pins the full snapshot in this branch; do not automatically update it on the other machine.

Open the repo in Codex and explicitly ask it to read/use `.agents/skills/huashu-design/SKILL.md` completely, then the task-routed references. This also works if that runtime does not auto-discover project skills; no global install is necessary to follow the instructions. The next stage is real three-direction prototypes + user choice, not automatically implementing a style. Skill guidance applies to prototyping/review; production implementation stays in the existing React/Vite app, not an HTML-only application rewrite.

Relevant references already used: workflow, design-styles (web partition), content-guidelines, typography, brand-asset-protocol, verification and critique-guide. Next Codex must read relevant instructions itself rather than relying solely on this list.

These four-view prototypes use plain HTML/CSS/JS and bundled fonts/images; Python's static server is sufficient. Existing local Node24 CDP scripts need Chrome/Chromium and port9223, no npm Playwright package. For Huashu's own `verify.py` instead, its documented optional dependencies are Playwright + Chromium; use an approved Python virtualenv (`python3 -m venv .venv`, activate, `pip install playwright`, `python -m playwright install chromium`). For Node skill utilities: `npm ci --prefix .agents/skills/huashu-design` installs its pinned Playwright/sharp/pdf-lib/pptxgenjs packages if actually needed. Media exports can additionally require ffmpeg/ffprobe, Python Pillow/python-pptx/requests per script; **not required for this site task**. Review scripts/SECURITY before executing, do not install hooks or invoke optional cloud/TTS/video services without consent. No imagegen was used for the current portraits/evidence.

## Plugin-provided skills/tools (not vendored)

- `pdf:pdf` was used earlier to read the supplied CV. Source plugin ID `pdf` in the `openai-primary-runtime` bundle, original snapshot `pdf/26.904.11930/skills/pdf/SKILL.md`. If re-reading the PDF, use the matching PDF skill from the new runtime; install/enable the PDF plugin if offered. Requires PDF tooling such as Poppler/pdfplumber/pypdf or bundled workspace dependencies. The PDF itself remains a separate optional private transfer. Do not copy the plugin's private runtime/cache into the repo.
- `unified-computer-use` supplies `mcp__cua_repl`, used for browser inspections and actual renders. It is a tool plugin, not the design skill. Enable/install matching Computer Use/browser tooling if available in the target account/runtime and approve required browser access. If not offered or company-blocked, use the repository's CDP QA scripts or Huashu Playwright verification instead. Exact availability/name in the target catalog is not guaranteed.
- `codex-app-tools` supplies app panels/open-file/workspace-dependency helpers; use the app's provided integration when available. Not required to build or serve the repo; no plugin files were copied.
- `openai-docs` is a bundled system skill used only to verify handoff skill/plugin setup guidance, not a visual-design dependency. Use the target runtime's bundled version; do not vendor machine/system skill directories.

For a plugin available in the target catalog: open Plugins, search/open its details, install (+), connect/authenticate if prompted, then start a new chat. CLI supports `/plugins` to browse configured marketplaces. This does not imply all IDs above are publicly installable; if a bundled integration is absent, report that and use the documented local fallback. Official installation guidance checked 2026-10-02: https://learn.chatgpt.com/docs/plugins . Skill authoring/background: https://learn.chatgpt.com/docs/build-skills . Account connections, permissions, UI handles and active browser tabs are not carried by Git.

## Browser QA scripts already in the project

From repo root: `node design-demos/portfolio-redesign/typecheck-site.mjs` targets the site; `verify-complete.mjs production` and `verify-interactions.mjs` check the earlier React implementation with existing expected selectors. These are **not a full v2 prototype test suite** and will need a new script/manual QA for the three layouts. Interaction script mocks API responses; passing it is not real AI integration validation.

For those CDP scripts, launch a separate local test Chrome profile, bound to loopback only:

```sh
# macOS; replace binary path for Windows/Linux. Only start if port9223 is free.
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-address=127.0.0.1 --remote-debugging-port=9223 --user-data-dir=/tmp/chatdvt-handoff-browser --no-first-run --disable-gpu about:blank
```

Start static4174 and Vite-preview4175 per HANDOFF before scripts. CDP grants browser control, so use a dedicated disposable profile, never your logged-in personal browser. Node24 provides the WebSocket implementation used by scripts. Existing scripts generate verification/screenshot artifacts; review resulting diffs before committing.
