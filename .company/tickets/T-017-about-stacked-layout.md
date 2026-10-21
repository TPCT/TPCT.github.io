# T-017 — Section heads on top, content full-width under them (About fix)

## Why (owner feedback, 2026-10-21)
"Why is the About text beside the heading and not under it?" At ≥ 1024px `#about` uses a 12-col grid with the h2 sticky in cols 1–4 and the text on the right, leaving a big empty left column. Owner rule from now on: **heading (index pill + h2) on top, content full-width UNDER it**, site-wide. A two-column layout is only allowed when the left column carries real content — never just a heading.

## Spec
1. `src/styles/50-sections.css`: delete the `#about > .container` grid, `#about .section-head { display: contents }`, `#about .section-head__index` and `#about h2` sticky rules (and any other section that puts the h2 in a side column — audit all of `src/styles/`; `#contact` keep as is if its head is already stacked). Every section uses the normal stacked `.section-head` (already flex-column) followed by its content.
2. About content, full width under the head, so it's not a lonely narrow column:
   - `.about__body` becomes a frosted plate (existing plate tokens/radius/shadow) spanning the container.
   - Inside, ≥ 1024px: a 2-column grid `minmax(0, 1.35fr) minmax(0, 1fr)`, gap 48px: **left** = the paragraphs (lead paragraph larger, `--fs-lead`; others body size; max 65ch); **right** = a "key facts" panel built from existing content (no new claims): the 4 `stats` items as compact rows (value in `--font-display` with `--grad-accent` text, label muted) + `hero.location` and the first two `hero.roles` as chips. Render it in `src/render/sections.mjs` as `<aside class="about__facts" aria-label="Key facts">…</aside>` (aria-label text from content: add `about.factsLabel: "Key facts"` to `src/content.json` + validate as string). Below 1024px it stacks: paragraphs, then facts (facts as a 2×2 grid).
   - Since the hero stats strip already shows the stats, the about facts panel must visually differ (rows with thin dividers, smaller numbers) — that's fine; it gives the About block its own anchor.
3. Keep `data-reveal` on `.about__body` (and give `.about__facts` its own `data-reveal`) so T-007/T-015 reveals and the spine chapter node still work. Index pill + h2 order unchanged.
4. No horizontal overflow 360–1440; respect the T-015 rhythm tokens.

## Files
`src/styles/50-sections.css`, `src/render/sections.mjs` (about only), `src/content.json` (add `about.factsLabel` only — don't re-format), `src/lib/validate.mjs` (one string), new `test/about.test.mjs`.
Another ticket (T-010) runs in parallel and edits `src/render/hero.mjs`, `test/scripts.test.mjs`, `test/sections.test.mjs` and new field files — do NOT touch those.

## Tests (`test/about.test.mjs`)
- built HTML: `#about` contains `.section-head` before `.about__body`; `.about__facts` present with `aria-label="Key facts"` and one row per `stats` item.
- built CSS: no `#about h2` sticky rule (`/#about h2\s*\{[^}]*sticky/` must not match); no `#about .section-head { display: contents`.
- validation: missing `about.factsLabel` → error mentioning it.

## Commands
`npm run build`; `node --test test/about.test.mjs test/content.test.mjs`; `npm run check:confidential`.

## Constraints
No commit/push; no `.company/` edits; CSP self-only; content visible at rest/no-JS; reduced motion respected.
