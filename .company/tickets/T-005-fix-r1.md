# T-005-fix-r1 — header blur + skip-link shadow (review r1)

Review: `.company/reviews/T-005-r1.md` (CHANGES_REQUESTED). Only edit `src/styles/30-header.css` (and add assertions to `test/build.test.mjs`). Other tickets (T-006, T-008) are being implemented in parallel in other files — do not touch any other file.

1. B1 header/mobile-menu blur: change the header entrance so it doesn't persist: `.js .site-header { animation: header-in 600ms var(--ease-out) backwards; }` (exact fix from the review; keep the reduced-motion guard as it is).
2. B2 skip link shadow: add `.skip:not(:focus) { box-shadow: none; }`.
3. Non-blocking: add `-webkit-backdrop-filter` alongside `backdrop-filter` for `#primary-nav` (keep the existing ≤3 `backdrop-filter: var(--glass-blur)` budget test passing — the regex ignores `-webkit-`).
Tests: assert the header animation uses `backwards` (not `both`), and that `.skip:not(:focus)` has `box-shadow: none`.
Commands: `npm run build`; `node --test test/build.test.mjs`.
No commit/push; no `.company/` edits.
