# Direction approved · 2026-10-01

## Three directions shown

1. Cinematic Signal — `screenshots/direction-1-desktop.png`, `screenshots/direction-1-mobile.png`.
2. Recruiter Ledger — `screenshots/direction-2-desktop.png`, `screenshots/direction-2-mobile.png`.
3. Human × Sidekick — `screenshots/direction-3-desktop.png`, `screenshots/direction-3-mobile.png`.

## User choice (verbatim)

> Làm tao hướng thứ 3 đi mà
>
> - Trong Me thì nhân vật chính là tao
> - ChatDVT sẽ xuất hiện nhưng là nhân vật phụ
> - chatDVT là Nhân vật chính ở discord bot
> - Mày hiểu không ?

User confirmed the restatement and authorized the next step:

> Ok đã hiểu tiến hành bước tiếp theo đi

Earlier visual feedback:

> Đây chỉ là hình minh hoạ thôi đúng không chứ không phải là mày sẽ code HTML như vậy đúng k chứ vuông quá tao không thích

## Approved iteration, not a new direction

- Preserve Human × Sidekick's human/product relationship, warm paper, portrait orange and product cyan.
- Homepage and Me: Tiến is the primary identity; ChatDVT is a smaller supporting presence and evidence of work.
- Discord Bot: ChatDVT is the product protagonist; Tiến is the credited creator, not a competing hero.
- Replace rigid poster cells, heavy outlines and square buttons with open editorial spacing, rounded evidence panels and pill controls.
- Use existing Be Vietnam Pro font files to keep Vietnamese typography consistent with the actual frontend.
- This round remains a prototype: no production frontend edits, backend changes or new features.
- First detailed views: Homepage, Me and Discord Bot. The homepage retains previews of all six main areas. Other four standalone page designs are not yet complete.

## Form rationale

- Narrative: person → professional practice → authored products → contact; on Discord, product → real UI proof → capabilities → creator.
- Viewing distance: laptop and phone; 16px body, 12px minimum labels, responsive 1440/768/390/375px.
- Temperature: warm, approachable and recruiter-friendly, with more playful identity reserved for ChatDVT.
- Capacity: a short hero, a portrait/product anchor and two primary actions; detailed evidence belongs below.
- Motif: the same paired identities change size and prominence according to page ownership. Round identity rings remain; square framing does not.

## Files and review

- Original directions remain unchanged.
- New iteration: `direction-3-refined.html`, shared styling `direction-3-refined.css`, prototype interactions `direction-3-refined.js`.
- Switch detailed views with `#home`, `#me`, `#discord`; the floating preview selector is prototype-only.
- Delivery requires browser rendering, screenshots, no JS exceptions, no broken assets, no horizontal overflow and working view/menu/theme/gallery controls.

## CV content iteration

After the user provided the temporary CV, a short company-experience draft was proposed: five contribution summaries, three skill groups, descriptive project names and company work before personal projects.

User authorized implementing that proposal:

> Ok tới đâu rồi nhỉ làm đi

This is a content/layout iteration within direction 3, not a new visual direction or authorization to publish confidential company information. No client names, private screenshots, source code or detailed internal architecture are included. The PDF is not copied into publicly served assets.

## Complete design and implementation authorization

Latest user request (verbatim):

> Thiết kể hết luôn đi 6 mục này rồi thiết kế xong code 1 phát luôn

This supersedes the earlier prototype-only boundary for the public presentation layer. Complete Mobile, Projects & Lab, Discord Bot, AI Chat, Blog, About Me plus Homepage in the selected direction, then implement them together in React. Individual tools/games, admin, APIs and backend remain outside scope. No new three-direction selection is needed for this approved direction iteration.

See `implementation-spec.md` and `direction-3-complete.html` for the complete seven-view design.

## Structural redesign reopened — 2026-10-01

The user rejected the resulting visual layout, not the personal/product ownership rule:

> Cảm nhận của tao là ngoài việc đổi màu ra thì 3 trang từ trang chủ ChatAI , about me , playground Chẳng khác gì cái cũ , Mấy cái bố cục đoạn ở dưới thì bố cục quá AI và rời rác
> Tao cần mày dựa vào Huashu Design để nghiên cứu lại bố cục , giao diện đỡ bị formal quá phải có cá tính

When asked for optional reference websites, the user replied:

> Không có nên mới cần mày nghiên cứu

The Home, Me, Playground and AI Chat layout decision is reopened. Tiến/ChatDVT ownership and confidentiality constraints remain. New research/prototypes are isolated in `layout-research-v2/`; the production implementation is preserved while three structurally different rendered directions are compared. Status: **awaiting user visual selection**, not approved for production implementation of a new direction.
