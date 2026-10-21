# T-030-fix-r1
Review `.company/reviews/T-030-r1.md`: between 1024px and ~1230px the hero GitHub button runs under the hero visual (clipped "Gi", not clickable) because of `.hero__ctas { flex-wrap: nowrap; width: max-content; }` + `flex-shrink: 0` (`src/styles/40-hero.css:52-53`). Apply the review's fix exactly (let the row wrap; buttons never overflow the text column) and add its test. Verify no CTA overlaps `.hero__visual` at 768/1024/1100/1230/1280/1440.
Commands: `npm run build`; `node --test`.
No commit/push; no `.company/` edits.
