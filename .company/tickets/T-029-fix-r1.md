# T-029-fix-r1
Review `.company/reviews/T-029-r1.md`:
1. At 375–400px the case-study "Private client work" note wraps to 2 lines (52px vs 44px button). Make it one line at mobile widths (shorter padding, `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` with the full text kept for screen readers/title, or a smaller font size) so both actions are 44px tall; stacked full-width rows are fine.
2. Project pages: "Back to all work" must use a LEFT arrow icon (`arrow-left`, add to icons.mjs if missing) placed before the text, styled as the secondary/ghost pill (same as `.card__repo`), while the GitHub button stays primary; the private note stays the quiet pill.
Update/add tests. Commands: `npm run build`; `node --test`.
No commit/push; no `.company/` edits.
