# T-009-fix-r1 — logo fidelity + hero sizing + leftover colour (review r1)

Review: `.company/reviews/T-009-r1.md` (CHANGES_REQUESTED). Apply its blocking items 1–5 exactly as written there:
1. `</>` glyph: build `<`, `/`, `>` geometrically (filled stroke-shaped paths with round ends matching the source's stroke width/angles), keep ids and the ±3% area check.
2. S hooks: replace runs of short segments on rounded corners with single smooth curves (cubic/quadratic); keep long straight edges straight; keep area check.
3. Hero mark sizing: `.sc-hero__mark { width: 64%; inset: 10% 18% auto; }` (or the review's exact values) so it sits inside the halo and the `.schematic` card never overlaps the bottom hook at 1440/1024/768/375.
4. `--control` (and any other token still using old brown/mauve values) → the violet values from the review, both themes.
5. `test/projects.test.mjs:51`: expect the new email markup exactly as in the review.
Also: the `.schematic__origin` marker is still a prism triangle — replace it with a small `logoMark` (14px) or a violet dot, matching the brand.

Commands: `python3 -I scripts/trace-logo.py`; `npm run build`; `node --test` (must be 0 fail); `npm run check:confidential`; visual re-check of the logo vs source and the hero at 1440 + 375 (local Chromium per T-003).
No commit/push; no `.company/` edits.
