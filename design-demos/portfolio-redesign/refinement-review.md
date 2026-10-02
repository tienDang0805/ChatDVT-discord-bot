# Human × Sidekick · Review handoff

Open `http://127.0.0.1:4174/direction-3-refined.html#home` while the local prototype server is running.

If the server has stopped, run from the repository root:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory design-demos/portfolio-redesign
```

## Views

- `#home`: Tiến leads the hero. All six main areas appear as content previews/navigation.
- `#me`: Tiến's name, portrait, role, experience and contact lead. ChatDVT is a small authored-product note and one project entry.
- `#discord`: ChatDVT's identity and real Discord UI lead. Tiến appears only as creator credit and a supporting author section.

The bottom rounded selector is review-only UI. It is not planned for production. Mobile menu, theme toggle and image viewer are working prototype interactions. Chat, tools and blog reading are not implemented here. Production React files are untouched.

## Structure

- `direction-3-refined.html`: real content and the three prototype views.
- `direction-3-refined.css`: shared tokens, navigation, identity heroes, editorial sections, page-specific treatments and responsive styles.
- `direction-3-experience.css`: company contribution list and three concise skill groups added from the user-approved CV summary.
- `direction-3-refined.js`: view routing, navigation, theme and image dialog only.
- `assets/`: original photos, Discord screenshots, local font files and font license.
- `verify-refined.mjs`: browser QA using the existing local headless Chrome session on port 9223.
- `verification-refined.json`: latest automated results.

## Verified

- 1440×900, 768×1024, 390×844, 375×812 across all three views.
- No JavaScript exceptions, failed content requests, broken images or horizontal overflow.
- Local font loads, one visible page heading, correct primary portrait for each view.
- Menu opens; Escape closes it. Theme changes. Image viewer opens/closes and restores focus.
- Header/review links switch views; section links lead to the corresponding homepage preview. Skip link preserves the current view.
- Desktop and mobile screenshots inspected, including project/evidence sections and desktop dark mode.

This is a design review milestone, not a claim that all six standalone pages or a production redesign are finished.

## CV refinement

Me now leads with Mobile Software Engineer, April 2023 to present, five brief company contribution summaries and three skill groups. Company work precedes personal projects. Homepage only summarizes mobile apps, Android SDKs and native integration. The CV file and its phone number are not copied to the website; client/product identities are replaced with descriptive project names. No metrics or unsupported achievements were added.
