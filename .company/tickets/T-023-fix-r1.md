# T-023-fix-r1
Review `.company/reviews/T-022-T-023-r1.md`: anchor links land 92px too low because `src/scripts/80-bold.js:~340` passes `offset: -(headerH+16)` to Lenis while `scroll-padding-top` already applies. Remove the `offset` (exact review fix); add/adjust a vm test asserting no `offset` is passed to `lenis.scrollTo` for anchors.
Commands: `npm run build`; `node --test` for the bold/core test file.
No commit/push; no `.company/` edits.
