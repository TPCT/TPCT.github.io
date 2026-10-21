# T-015-fix-r1 — spine must visibly draw while scrolling
Review `.company/reviews/T-015-r1.md` (CHANGES_REQUESTED). Apply the blocking fix exactly as given there: in `src/scripts/62-spine.js` measure progress against the `.spine` element itself (not `main`), with the drawing tip at ~60% of the viewport height, plus the test update from the review. Also make the spine's extent/sections robust to the number of sections (no hard-coded 8 — derive from the DOM), so the upcoming Journey section doesn't cut it short. Non-blocking: reduce the Contact → footer gap (~176px) to ≤ the section pad.
Commands: `npm run build`; `node --test test/scripts.test.mjs test/build.test.mjs`; `npm run check:confidential`. Keep site.js under its cap.
No commit/push; no `.company/` edits.
