# T-007-fix-r2 — review r1 blockers

Review: `.company/reviews/T-007-r1.md` (CHANGES_REQUESTED). Apply blocking items 1 and 2 exactly as described there, plus the non-blocking naming/redundant-matchMedia suggestions if they are cheap.
1. Logo animation must not depend on `61-pointer.js`: restore `40-hero.css` selectors to `.js .sc-hero …` (assemble + idle loops run on every device incl. touch, gated only by `.js`, no-preference and the paused state). Click replay = add `is-replay` (sets `animation: none` on the animated parts), force reflow, remove it.
2. Restore readable variable names in `src/scripts/30-filter.js` (as before T-007, keeping T-007's behaviour changes).
3. Tech-lead decision: raise the `site.js` bundle cap in its test to 17,500 bytes.
Commands: `npm run build`; `node --test test/scripts.test.mjs test/build.test.mjs test/projects.test.mjs`; `npm run check:confidential`.
No commit/push; no `.company/` edits.
