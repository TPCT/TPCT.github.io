# T-016-fix-r1 — update stale tests for the intended content change + regenerate OG
T-016 intentionally changed content (20 projects, national-waste-analytics year 2025, experience markup `career__*` instead of `exp__*`, new hero roles). Three tests still pin the old content — update them to the new intended state (don't weaken unrelated assertions):
1. `test/brand.test.mjs`: replace the `.exp__loc … align-self: start` assertion with an equivalent check on the new career markup (e.g. `.career__head` / meta rules exist) — the old rule was deleted on purpose.
2. `test/projects.test.mjs`: 20 projects; national-waste-analytics shows year 2025; derive counts from `src/content.json` where possible instead of literals.
3. `test/images.test.mjs` expects the OG SVG to contain the current `hero.roles` (now "CEO @ ShiftCodes" …): regenerate `src/images/og-image.svg` + `public/assets/og-image.png` via `npm run images` (local Playwright per the T-003/T-008 tickets: `PLAYWRIGHT_CORE` / `CHROME_PATH`) so the OG card shows the new roles; keep relative font URLs, no local paths; size limits as in T-008.
Commands: `npm run images`; `npm run build`; `node --test` (must be 0 fail); `npm run check:confidential`.
No commit/push; no `.company/` edits.
