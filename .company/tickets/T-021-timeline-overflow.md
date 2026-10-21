# T-021 — timeline horizontal overflow (follow-up from T-014 r2)
At 1024/1280 `scrollWidth` exceeds the viewport (1048/1296) because unrevealed Journey cards keep their 56px slide-in offset. In `src/styles/55-timeline.css` add `#timeline { overflow-x: clip; min-width: 0; }` (same pattern as #skills). Add a CSS assertion in the timeline test file.
Commands: `npm run build`; `node --test` for the timeline test file.
No commit/push; no `.company/` edits.
