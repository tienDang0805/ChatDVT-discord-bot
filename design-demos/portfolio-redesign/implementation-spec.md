# Complete design → React implementation

Approved direction: 3 — Human × Sidekick. Existing three-direction selection stands.

2026-10-01 user authorization: “Thiết kể hết luôn đi 6 mục này rồi thiết kế xong code 1 phát luôn”. Complete all six public navigation areas and homepage, then implement together without another direction-selection gate.

## Seven surfaces
- Home: Tiến portrait and role; personal work; mobile practice; writing; contact.
- Mobile: practical tool directory with requirements and links; professional context links to Me.
- Projects & Lab: selected work, real feature catalog, category/search/archive interactions retained.
- Discord: ChatDVT protagonist; genuine screenshots + accessible image viewing; creator credit secondary; existing commands/invite links retained.
- AI Chat: soft workspace; functional API, history, error handling and keyboard/IME behavior retained.
- Blog: editorial index from existing published API/default article; readable article page.
- Me: Tiến protagonist; South Telecom contribution summaries and skills before personal work; contact.

## Design grammar
Warm off-white / charcoal, terracotta for human identity, muted blue for ChatDVT. Be Vietnam Pro. Rounded 24–40px surfaces, pill controls, genuine portraits, restrained shadows, no decorative square grids. Desktop ~1200px content; fluid tablet; 375px mobile. Dark mode uses warm dark surfaces, not inverted images.

## Implementation boundaries
Replace public presentation only. Shared CSS split into layout, identity, collections, Discord, chat and ecosystem compatibility. Do not alter feature catalog visibility, tool/game/admin behavior or server routes. Do not publish CV, client names, confidential UI or invented metrics. Existing article text is not silently translated.

Review artifact: direction-3-complete.html with all seven views. Prototype chat does not call APIs. Production is React components, not the HTML prototype embedded into the app.

