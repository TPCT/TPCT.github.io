# T-010: W-1 "Signal field" hero particle constellation + wow-round budgets
Size: M   Depends on: T-007 (done), T-015 (landed)   Stories: US-14 (motion), owner "wow" request 2026-10-21
Parallel: runs ALONE first (it raises the shared byte caps that T-011..T-014 rely on).
Baseline: assume T-015 (rhythm + `.spine` + chapter nodes) has landed. Its files (`01-tokens`, `10-base`, `20-components`, `40-hero`, `15-motion`, `90-footer`, `layout.mjs`, `60-motion.js`, `62-spine.js` if present) are read-only here.

## Goal
The hero becomes a living system graph: a violet particle constellation drawn on one `<canvas>` behind the ShiftCodes S-mark. Links form near the cursor, and clicking/tapping the mark sends a shockwave. It is purely decorative, starts 700ms after `load`, and freezes with the existing motion toggle. Without JS or with reduced motion, the hero looks exactly as it does today.

## Files (only these)
- edit `src/render/hero.mjs`: insert one element
- new `src/styles/41-field.css`
- new `src/scripts/70-field.js` (≤ 4,096 bytes raw)
- new `test/wow-field.test.mjs`
- edit `test/scripts.test.mjs`: only the bundle cap line `Buffer.byteLength(source) <= B`. New value = **B + 8192**, where B is the value in the file when you start. That is 17,500 after T-007, or 18,200 if T-015 raised it for `62-spine.js`, giving **25,692** or **26,392**. This is the rebase rule from ux-wow.md Assumption 9. Write the resulting literal number, not an expression.
- edit `test/sections.test.mjs`: only the CSS byte budget, raised to raw = current + 16384 and gzip = current + 4096 (from 65536/14336 that is **81920 / 18432**). The wow round adds about 15 KB raw / 4 KB gzip of CSS across 6 partials. Write literal numbers.

## Spec (normative): `.company/ux-wow.md`
- §1 Global rules 1–10: gate, pause, pointer, content at rest, CSP, compositor, performance, budget, IIFE shape, a11y.
- §3.1 Markup: `<canvas class="sc-field" aria-hidden="true"></canvas>` is the FIRST child of `section.hero`, before `<div class="container">`. No width/height attributes.
- §3.2 CSS: copy it verbatim into `41-field.css`.
- §3.3 JS: items 1–11, with the exact constants. Must-haves:
  - Gate: `html.motion` + `.hero` + `.sc-field` + `getContext('2d')`. Return early otherwise.
  - `fine = matchMedia('(hover: hover) and (pointer: fine)').matches`, read once. Use the profile table for DPR, 30fps on coarse, N, and L.
  - Start: `load` (or `readyState === 'complete'`) → `setTimeout(start, 700)`.
  - Size: `ResizeObserver(hero)`, rAF-debounced, falling back to `resize`. Rescale positions and re-fit N.
  - Links go into 4 alpha buckets with one stroke per bucket. Cursor links are cyan (fine only). Dots use one path per colour. `themeK` is .75 in light.
  - Colours come from `getComputedStyle(document.documentElement)` `--brand` / `--cyan`. Re-read them in a `MutationObserver` on `<html>` with `attributeFilter: ['class', 'data-theme']`.
  - Shockwave: a separate `click` listener on `.hero .sc-hero`, with the impulse and the 900ms ring per spec. It does nothing while paused.
  - Pointer (fine only): cache the rect on `pointerenter`, passive `scroll`, and resize. `pointermove` and `pointerleave` set the cursor state.
  - Run only when `heroVisible` (IO threshold 0), the tab is not hidden (`visibilitychange`), and `html` lacks `motion-paused`. Keep exactly one pending rAF. While paused, the canvas keeps its last frame.
  - Adaptive quality: if the mean frame time over 90 frames is > 24ms, N ×.6. If it is still > 24ms over the next 90 frames, stop for good and remove `is-live`.
  - Guard every optional global: `ResizeObserver`, `MutationObserver`, `IntersectionObserver`, `HTMLCanvasElement.prototype.getContext`.
- §3.4 States table: all rows must hold.

## Acceptance
- [ ] Built `index.html`: `<section id="top" class="hero" …><canvas class="sc-field" aria-hidden="true"></canvas><div class="container">`. `404.html` has no `sc-field`.
- [ ] `70-field.js` is ≤ 4,096 bytes and starts with `(function () {\n  "use strict";`. It contains `devicePixelRatio`, `visibilitychange`, `motion-paused`, `IntersectionObserver`, `(hover: hover) and (pointer: fine)` and `getComputedStyle`.
- [ ] The CSS bundle contains `.sc-field` inside a `@media (forced-colors: active)` block and inside a print block. Every `@keyframes`/`animation:`/`transition:` in `41-field.css` sits inside `@media (prefers-reduced-motion: no-preference)`.
- [ ] The `test/scripts.test.mjs` bundle cap is B + 8192 (25,692, or 26,392 if T-015 set 18,200). The `test/sections.test.mjs` CSS caps are current + 16384 / + 4096. No other assertion in those files changes.
- [ ] The existing vm smoke test (stub DOM, both reduce=true/false) still passes. The module does not throw when `.hero` is absent (404).
- [ ] No `style="`, no `innerHTML`/`cssText`/`setAttribute('style')`. The CSP meta is unchanged. No new third-party code.
- [ ] With JS off or reduced motion, the canvas stays at `opacity: 0` and the hero is visually unchanged.

## Tests
New `test/wow-field.test.mjs` (`node:test`, build into a `mkdtemp` dir like `test/sections.test.mjs`, then clean up):
- the canvas markup position and `aria-hidden` (regex on the built `index.html`); its absence in `404.html`
- the `70-field.js` byte cap and required substrings (list above)
- CSS: `.sc-field` inside a `forced-colors` block; a gate check on `41-field.css` (same brace-matching approach as the "section partials gate every keyframe" test in `test/sections.test.mjs`)
- a vm run of `70-field.js` alone, with a stub where `.motion` is set, `querySelector('.hero')` returns null, and no `ResizeObserver`/`MutationObserver`: no throw
- a vm run with a hero stub whose canvas `getContext` returns null: no throw, no `is-live` added

## Commands (affected only; do NOT run `npm test`)
```
node --test test/wow-field.test.mjs test/scripts.test.mjs test/build.test.mjs test/sections.test.mjs $(ls test/rhythm.test.mjs 2>/dev/null)
npm run build
npm run check:confidential
```

## Out of scope
T-015 files and the `.spine` (do not restyle or move them; the canvas lives only inside `.hero`, under the stats strip and scroll cue). Everything in T-011..T-014. Any edit to `60-motion.js`, `61-pointer.js`, `10-theme.js`, `30-filter.js`, `40-hero.css` or `15-motion.css`. A full-page field (it stays confined to the hero). Lighthouse runs (the lead does them at the gate).

## Constraints
- No commit, no push. No edits under `.company/`.
- CSP stays self-only: no inline `style` attributes, no `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`cssText`/`eval`/`new Function`. CSSOM property writes (`el.style.setProperty`) are allowed. No network calls.
- No third-party libraries, CDNs or npm dependencies.
- Animate only transform/opacity, plus canvas drawing (the one allowed paint exception). No `filter`/`backdrop-filter`/`box-shadow` animation, no `will-change`.
- Reduced motion → nothing runs (gate on `html.motion`). The pause toggle (`html.motion-paused`) freezes the loop. Pointer tracking only on `(hover: hover) and (pointer: fine)`; a tap on the mark may trigger the shockwave.
- Content stays visible at rest and without JS. The canvas is decorative and `aria-hidden`, with no new focusable elements.
- Rhythm (T-015): the canvas is `position: absolute; inset: 0` inside `.hero`, so it adds no height or margins and does not change the one-pad section gap.
