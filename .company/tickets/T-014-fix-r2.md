# T-014-fix-r2
Review `.company/reviews/T-014-r1.md`: at >=1024px the marquee stretches the page to ~7,500px. In `src/styles/56-marquee.css` apply the exact fix: `#skills { overflow-x: clip; min-width: 0; }` plus `contain: inline-size` on `.js .marquee`. Add a CSS assertion to `test/wow-css.test.mjs` for `min-width: 0` on `#skills`.
Commands: `npm run build`; `node --test test/wow-css.test.mjs`.
No commit/push; no `.company/` edits.
