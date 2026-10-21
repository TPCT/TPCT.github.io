# T-025-fix-r3
Review `.company/reviews/T-025-r2.md`: mouse clicks on rail card links don't open the project page because the `focusin` handler scrolls the rail on mousedown focus. Apply the exact fix: at the top of the rail `focusin` handler in `src/scripts/82-story.js` add `if (!e.target.matches(':focus-visible')) return;` so only keyboard focus scrolls. Add a vm test (mouse focus → no scroll; keyboard focus → scroll).
Commands: `npm run build`; `node --test test/bold-story.test.mjs`.
No commit/push; no `.company/` edits.
