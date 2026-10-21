# T-024-fix-r2
Review `.company/reviews/T-024-T-026-r1.md` (T-024 CHANGES_REQUESTED). Apply both blocking fixes exactly as written in the review:
1. Start the kinetic letter rise from the intro curtain's `intro-out` animation (animationstart/animationend per the review code), not from page start, so first-time visitors SEE the rise; repeat visits (no intro) keep the current start.
2. Add the `role-hold` animation so roles 2 and 3 stay hidden until the rotator starts (no overprinting of roles under the name in the first ~2.4s).
Add regression tests for both (vm/CSS). Keep motion gates and the ≤3000ms fallback.
Commands: `npm run build`; `node --test` for the hero/wow tests.
No commit/push; no `.company/` edits.
