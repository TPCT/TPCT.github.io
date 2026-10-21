# T-025-fix-r2 — rail blockers from review r1
Review: `.company/reviews/T-025-T-027-r1.md` (T-025 CHANGES_REQUESTED). Apply fixes for both blockers, following the review's diagnosis precisely:
1. Rail breaks page width: at 1024–1100px the page lays out 1200px wide and clips; at 1440/1920 the rail is cut at x=1200 leaving empty space. The pinned rail must use the full viewport width (or the container + bleed to the viewport edge) without widening the document: `document.documentElement.scrollWidth === innerWidth` at 1024, 1100, 1280, 1440, 1920 with the rail active and while pinned. First card reached by Tab must be fully visible.
2. Rail randomly doesn't engage: `30-filter.js`'s brief initial `min-height` on `#project-list` is still present when the rail's fit check measures. Measure the rail eligibility from the cards' intrinsic height (e.g. tallest card in rail mode) or re-run the check after the filter's min-height is cleared (listen for the filter's ready signal / next frame after it clears) — it must engage deterministically on 20/20 reloads at 1440×900.
3. Keep everything else from fix-r1 (compact cards, contact spacing, filters re-measure).
Add vm/regression tests for both. Commands: `npm run build`; `node --test` for story tests; if Chromium launches, verify 1. and 2. with 10 reloads.
No commit/push; no `.company/` edits.
