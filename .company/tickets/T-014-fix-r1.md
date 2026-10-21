# T-014-fix-r1
The T-014 addendum intentionally moved the hero-mark replay handler from `61-pointer.js` to `60-motion.js` (tap-to-replay on touch). Update the assertion in `test/scripts.test.mjs` that still expects the handler in `61-pointer.js` so it asserts the new location (`60-motion.js` contains the replay handler; `61-pointer.js` no longer does). No other changes.
Commands: `npm run build`; `node --test test/scripts.test.mjs`.
No commit/push; no `.company/` edits.
