# T-014: W-5 "Shift and rhythm": S-mark hover shift, hero mark exit, stack marquee (CSS only)
Size: S   Depends on: T-013 (both edit `src/render/sections.mjs`), T-010, T-015 (landed)   Stories: US-14 (motion), US-05 (stack), owner "wow" request 2026-10-21
Parallel: may run at the same time as T-012 (disjoint files). It must NOT run alongside T-013. Max 2 Codex runs at once.

## Goal
Three CSS-only rhythm effects:
1. Hovering the hero S-mark pulls the two hooks apart along the logo's diagonal, opens the `</>` and raises the glow (the "shift"). This composes with T-007's `--px`/`--py` pointer parallax.
2. The hero mark recedes (moves up, scales down, fades) as it scrolls out. This uses scroll-driven animation, only in browsers that support it.
3. A full-bleed, two-row stack marquee above the skill groups. The rows run in opposite directions. It is decorative and `aria-hidden`, and the real skill lists stay below it.

No new JavaScript.

## Files (only these)
- `src/render/sections.mjs`: `renderSkills` only (the marquee markup). Keep the index string exactly as T-013 left it (`04`).
- new `src/styles/43-hero-wow.css`
- new `src/styles/56-marquee.css`
- new `test/wow-css.test.mjs`

## Spec (normative): `.company/ux-wow.md`
- §1 Global rules: gate, pause, pointer, content at rest, CSP, compositor.
- §7.1 S-mark shift: copy it verbatim into `43-hero-wow.css`.
  - `@property --shift` and `transition: --shift 520ms var(--ease-spring)`.
  - Transforms on the `<g class="sc-part sc-part--…">` groups. These already exist in `src/lib/logo.mjs`, and their `path` children carry the T-009 keyframes, so the two compose.
  - Hover sets `--shift: 1` only under `(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)` and `.motion`.
  - The file sorts after `40-hero.css`, so the equal-specificity rules win. Do not edit `40-hero.css`.
- §7.2 Hero exit: verbatim, inside `@supports (animation-timeline: view())` → `no-preference` → `.motion .sc-hero { animation: hero-exit linear both; animation-timeline: view(); animation-range: exit 0% exit 100%; }`. Keyframes use `translate`/`scale`/`opacity` only.
- §7.3 Marquee:
  - Markup goes between the section head and `<div class="skills">`. `renderSkills` passes `marquee + '<div class="skills">…'` as the `section()` body.
  - Items are all `c.skills[*].items`, flattened in order and de-duplicated. Row A takes the even indices and row B the odd ones, each `<li>${esc(item)}</li>`.
  - Each row holds 2 identical `<ul class="marquee__list">` copies. The whole `.marquee` is `aria-hidden="true"`, with no links and nothing focusable.
  - CSS: copy §7.3 verbatim into `56-marquee.css`, with one rhythm override for T-015. In `.js .marquee`, use `margin-block: 0 var(--space-6)`, not `var(--space-7)`, to match T-015's section-head gap.
- §7.4 States: all rows must hold.

### T-015 baseline (assume landed)
- The marquee is full-bleed (`margin-inline: calc(50% - 50vw)`) and crosses the desktop `.spine` x position. That is accepted: the 12% edge mask makes the band transparent there, so the spine stays readable. Do not add a z-index to the marquee or the spine.
- `#skills { overflow-x: clip; }` must not clip the T-015 chapter node or connector on `#skills .section-head`.
  - After the build, check the T-015 CSS: if the node or connector extends outside `#skills`' box horizontally, use `overflow-x: clip` on `.marquee` instead (with `overflow-clip-margin` unchanged), and note it in your report.
  - Either way, there must be no horizontal page overflow at 360–1440px.
- The hero exit animates only `.sc-hero` (the mark). It must not touch the stats strip or T-015's scroll cue.

## Acceptance
- [ ] Built `index.html`:
  - `#skills` contains exactly one `.marquee[aria-hidden="true"]`, before `<div class="skills">`.
  - It has 2 rows (`marquee__row--a`, `marquee__row--b`), each with 2 identical `marquee__list` `<ul>`s.
  - Within one copy, row A + row B contain every unique skill exactly once, in the order above.
  - There is no `<a`, `<button` or `tabindex` inside `.marquee`.
- [ ] The skill groups (`.skill-group`) are unchanged and still list every item accessibly.
- [ ] The CSS bundle contains:
  - `@property --shift` and `@supports (animation-timeline: view())`
  - `@keyframes marquee` inside `@media (prefers-reduced-motion: no-preference)`
  - `.motion-paused .marquee__row` and `.marquee:hover .marquee__row` (pause)
  - `.marquee { display: none; }` at rest, with `.js .marquee` shown only under `no-preference`
  - print/forced-colors hiding
- [ ] Every `@keyframes`/`animation:` in `43-hero-wow.css` and `56-marquee.css` sits inside a `no-preference` block.
- [ ] No-JS / reduced motion: no marquee, no hover shift, no exit animation. Hero and skills look as before.
- [ ] `test/scripts.test.mjs` is untouched and passes (no JS added). The CSS budget in `test/sections.test.mjs` passes.

## Tests
New `test/wow-css.test.mjs`:
- build into a `mkdtemp` dir and check the marquee markup assertions above (parse the `#skills` section)
- the CSS substring assertions above
- a brace-matching gate check for both new partials, the same approach as in `test/sections.test.mjs`
- no `style="` in the built HTML

## Commands (affected only; do NOT run `npm test`)
```
node --test test/wow-css.test.mjs test/sections.test.mjs test/build.test.mjs test/timeline.test.mjs $(ls test/rhythm.test.mjs 2>/dev/null)
npm run build
npm run check:confidential
```

## Out of scope
- JS of any kind.
- Edits to `40-hero.css`, `logo.mjs`, `61-pointer.js` or any T-015 file.
- Other renderers in `sections.mjs`: only touch `renderSkills`.
- Heading/text parallax (banned, ux-wow §0).

## Constraints
- No commit, no push. No edits under `.company/`.
- CSP self-only: no inline `style` attributes in markup. No third-party code or fonts. No network.
- Animate only transform/translate/scale/rotate/opacity. `--shift` is a transitioned registered number that feeds transforms. No `filter`/`box-shadow` animation, no `will-change`.
- Reduced motion → nothing animates. The pause toggle (`html.motion-paused`) freezes the marquee; the hover shift is direct feedback, not a loop. The hover shift only applies under `(hover: hover) and (pointer: fine)`; touch never gets sticky hover.
- Content stays visible at rest and without JS. The marquee is decorative and `aria-hidden`, and the skill groups remain the accessible source.

## Addendum (lead) — T-007 follow-up
Tap-to-replay on touch: move the hero-mark replay handler (click → `is-replay` reset/reflow) from `61-pointer.js` into `60-motion.js` so it works on touch devices too (still decorative, mark stays `aria-hidden`). Keep `30-filter.js` under its byte cap.
