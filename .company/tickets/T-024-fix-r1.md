# T-024-fix-r1
1. `test/wow-css.test.mjs:48` fails on `src/styles/43-hero-wow.css`: T-024 added a keyframe/animation outside `@media (prefers-reduced-motion: no-preference)`. Move it inside the gate (don't weaken the test).
2. Tech-lead decision on the timing conflict: the hero must be fully visible by 3.0s in the watchdog/fallback path. Compress the fallback/kinetic stagger (e.g. per-letter stagger and second-word delay) so the last letter settles ≤ 2.8s; keep the look. Update the timing test to assert ≤ 3000ms.
Commands: `npm run build`; `node --test test/wow-css.test.mjs` + the T-024 test file.
No commit/push; no `.company/` edits.
