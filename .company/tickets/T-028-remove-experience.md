# T-028 — Remove the Experience section (owner request)

Owner (2026-10-21): "delete the 02 / Experience section". Remove it from the page; keep the data.

## Spec
1. `src/render/sections.mjs`: stop rendering `#experience` (remove it from the home page output and from the section order). Renumber the remaining section indices continuously: About 01, Journey 02, Stack 03, Work 04, Services 05, Process 06, Contact 07.
2. Keep `c.experience` in `src/content.json` and its validation: it still feeds the About "worked with" company strip validation and the JSON-LD (worksFor etc.). Remove only what exists solely for rendering the section: the `sections.experience` / `sections.experienceMoreLabel` strings may stay in content but must no longer be required by validation if nothing uses them — decide: remove them from content + validation if unused; keep if anything else references them.
3. CSS: remove the career/experience section styles (`.career*`) that no longer have markup (keep the CSS budget tests passing). `src/styles/10-base.css` and anything else referencing `#experience`: remove the selector.
4. JS: `src/scripts/50-scrollspy.js`, `src/scripts/83-atmos.js` (mood per section) and any other script that maps `#experience`: remove that entry so nothing errors; the spine (62-spine.js) derives from the DOM — verify it still works.
5. Nav already has no Experience link — keep it that way. Project pages and 404 unaffected.
6. Tests: update tests that assert the Experience section (`test/content.test.mjs`, `test/seo.test.mjs`, `test/projects.test.mjs`, `test/timeline.test.mjs`, `test/bold-atmos.test.mjs`, `test/about.test.mjs`, `test/sections.test.mjs`) to the new state: assert `id="experience"` is ABSENT from `dist/index.html`, indices are 01–07 in order, and experience data still validates. Don't weaken unrelated assertions.

## Commands
`npm run build`; `node --test` (must be 0 fail); `npm run check:confidential`.

## Constraints
No commit/push; no `.company/` edits; no visual changes to other sections; CSP self-only.
