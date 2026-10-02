# C — Xưởng của Tiến

## Design anchor, verified primary sources

COLLINS is the reasoning anchor, not the author of this prototype. Brian Collins' own [Rehearsing Tomorrow](https://wearecollins.com/story/rehearsingtomorrow/) describes craft as making possibilities tangible, learning through trying, and treating personal contributions as a source of character. [Resilient Futures](https://wearecollins.com/story/resilientfutures/) argues for beginning with desired outcomes and connecting technologies and ideas rather than decorating a fixed process. Sources verified on 2026-10-01. This is an original interpretation for Tiến's portfolio, not a copy of the studio website.

## Content-derived idea

Tiến's actual thread is one builder moving between professional mobile development and personal experiments. The home sentence “Làm việc. Rồi làm chơi.” frames the two without turning him into a company. A persistent personal rail makes the author the anchor while the other side tells a continuous story: professional app practice → daily tools → an actual ChatDVT quiz → the one genuine article about why he built it. The portrait is 148px, within its source dimensions. ChatDVT appears as a small made object and evidence beside the story.

Home is an asymmetrical personal rail and continuous narrative, rather than a conventional centered hero and independent cards. Me opens with contribution instead of a repeated portrait hero: five actual work problems run down a numbered ledger, with the relevant skills attached to each. Playground is a workbench: a catalogue index and one selected object, real image when there is one, purposeful text for tools without supplied imagery. AI Chat becomes a conversation desk with suggestions, composer and optional history drawer. All views are complete, readable and scroll naturally where appropriate. Mobile turns the person rail into a short identity strip; chat uses the viewport available for actual conversation.

## Five form questions

- Narrative role: Home introduces the maker and connects what he does; Me provides evidence; Playground makes choosing and inspecting easy; Chat supports starting a conversation.
- Viewing distance: desktop laptop at 1440×900, handheld 390×844; body is 16px+ on mobile and labels remain legible.
- Temperature: friendly, curious, practical. Personality is carried by Vietnamese phrases and a consistent workspace rather than illustrations.
- Capacity: the first desktop fold includes author identity, the opening proposition and the start of company evidence; below fold expands the same narrative. Catalogue details and the list coexist on desktop and stack on mobile.
- Motif: a maker and his workbench, derived from mobile contribution, personal utility tools, and ChatDVT's coworker origin.

## Palette and typography

Known Tailwind palette tokens ground this exploration: lime-900 `#365314`, lime-200 `#d9f99d`, stone-900 `#1c1917`, stone-50 `#fafaf9`, orange-100 `#ffedd5`. Dark moss plus lime is used for the author and selected object; pale orange marks personal exploration and chat. The light page avoids a dark developer-template look. Contrast is strong for body copy. No supplied asset is recolored.

The provided local Be Vietnam Pro supports exact Vietnamese text. Georgia is the allowed system-serif companion: conversational oversized display phrases contrasted with grounded engineering prose. Labels use actual 700 rather than fabricated font weights. Palette tradeoff: this is lively and clearly personal, with less of the austere engineering-document feel some recruiters may expect.

## Scope, verification and tradeoffs

Only `c.html`, `c.css`, `c.js`, and this note are authored. No production code, shared comparison files, new backend, API-key prompt or generated image. Selected actual catalogue entries are read from `src/shared/featureCatalog.ts`. Mobile, Discord Bot, Blog and real tool links open the unchanged local production preview `http://127.0.0.1:4175`, labeled via link title. The genuine new shared Deep Link Tester capture appears when the toolkit is selected, with a caption clearly identifying it as the existing tool. Four explored views remain `#home`, `#me`, `#playground`, `#chat`.

Controls implemented: hash view switching, responsive menu, project category filtering/search/selection, chat suggestions, local demo send, history toggle, reset and Escape dismissal. Every response says it is a layout demonstration. The history in this disposable prototype is in-memory only. Existing production language/theme behavior is untouched; exploration omits those controls. Main agent captures browser rendering and checks all four views at both required viewport sizes.

Tradeoffs: the wide author rail deliberately spends desktop width on identity; narrow screens reduce it. The catalogue is a curated factual selection, with further actual developer tools included below; it is not a fake full inventory. The mobile selected object precedes the catalogue for immediate evidence; selecting from the list requires scrolling back to inspect it. No sticky scroll, animation delay or required game is introduced.
