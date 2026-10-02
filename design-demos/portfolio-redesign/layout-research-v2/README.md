# Layout research v2

Four-view structural explorations, not a production app. Existing React/API/features remain unchanged in this round. See `brief.md` for scope and `research.md` for findings.

The multi-file project intentionally uses the genuine shared assets one directory above. Serve from `design-demos/portfolio-redesign`:

```sh
# Run from the repository root on either machine.
python3 -m http.server 4174 --bind 127.0.0.1 --directory design-demos/portfolio-redesign
```

Check whether a server is already using this port before starting it; running servers do not travel through Git. Open http://127.0.0.1:4174/layout-research-v2/index.html . Direction pages are `a.html`, `b.html`, `c.html`, each using `#home`, `#me`, `#playground`, `#chat`. The comparison page uses browser-rendered screenshots, with selectable page, desktop/mobile and first viewport/full-page. Final comparison/interaction QA is pending; see the repository's HANDOFF.md before continuing.

Some links leave these four views for the unchanged app preview on port 4175. That preview must be running separately for those links. Prototype chat is local-only demonstration and never submits to AI.

User selection is required before implementing one of these directions in React. Prior approvals and this reopened gate are recorded in `../direction-approved.md`.
