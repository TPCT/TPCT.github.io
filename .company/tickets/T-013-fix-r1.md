# T-013-fix-r1
Review `.company/reviews/T-013-r1.md`: on >=1024px the interleave margin makes each year marker overlap the previous card border by ~22px. In `src/styles/55-timeline.css` set `.tl__item + .tl__item { margin-block-start: -8px; }` (exact review fix); verify no year number is cut by a card border at 1024/1280/1440 and nothing else shifts. Update any test pinning -40px.
Commands: `npm run build`; `node --test test/timeline.test.mjs` (or the timeline test file name).
No commit/push; no `.company/` edits.
