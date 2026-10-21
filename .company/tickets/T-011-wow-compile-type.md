# T-011: W-2 "Compile" type: glyph decode + gradient name flow
Size: S   Depends on: T-010 (caps raised), T-015 (landed)   Stories: US-14 (motion), owner "wow" request 2026-10-21
Parallel: may run at the same time as T-013 or T-012 (disjoint files). Max 2 Codex runs at once.

## Goal
Text "compiles" into place:
- The hero eyebrow and the roles decode from code glyphs (`<>/{}[]=+*#01`) while they rise.
- Section index pills decode when they scroll in.
- Desktop nav links decode on mouse hover.
- The gradient word of the name slowly flows.

The real text is in the DOM and the accessibility tree the whole time. The overlay is decorative.

## Files (only these)
- new `src/scripts/71-decode.js` (≤ 1,800 bytes raw)
- new `src/styles/42-type.css`
- new `test/wow-type.test.mjs`

No markup/renderer changes. The DOM is built at runtime with `createElement` and `textContent` only.

## Spec (normative): `.company/ux-wow.md`
- §1 Global rules 1–10.
- §4.1 Targets, triggers, durations and start times:
  - eyebrow: 640ms at 60ms
  - roles: 720ms at `380 + 60*i` ms after navigation start, scheduled with `setTimeout(…, max(0, start - performance.now()))`
  - `.section-head__index`: 560ms, own IO `{ threshold: 1, rootMargin: '0px 0px -10% 0px' }`, first intersect then `unobserve`
  - `#primary-nav a`: 320ms on `pointerenter`, only when `fine` and `matchMedia('(min-width: 768px)').matches` at event time
- §4.1 Skip rules:
  - skip the hero targets if `performance.now() > 1500` at init
  - skip indices already visible at init (`rect.top < innerHeight`)
  - skip elements whose `.dc-src` has `getClientRects().length > 1`
- §4.2 DOM transform: exact structure `.dc-src > (.dc-txt + .dc[aria-hidden="true"] > (.dc-done + .dc-noise))`.
  - Wrap the element's text only. The element's own `::before` stays intact: `.eyebrow`/`.section-head__index` use `::before` for the dot, see `src/styles/20-components.css`.
  - On finish, remove `.dc` and `is-decoding` and keep the wrappers. A later nav hover re-creates `.dc`.
- **T-015 baseline:** on desktop, `.section-head__index` may carry a T-015 chapter connector (`::after` hairline), and `.section-head` carries a `::before` spine node with `.is-lit`. Decode wraps only the pill's text node(s), never the pseudos. It must not add, remove or depend on `.is-lit`, and it must not alter `.section-head`. The decode IO is separate from T-015's reveal/IO in `60-motion.js`.
- §4.3 Algorithm: verbatim. 40ms render cadence, spaces preserved, one rAF per running element, ignored while already `is-decoding`.
- §4.4 CSS: copy it verbatim into `42-type.css`.
  - The name flow animates the OUTER `.w--accent` span. Do not touch the inner span, because T-005's `word-up` lives there.
  - Pause on `.motion-paused` and on `.hero:has(.sc-hero.is-idle)`.
- §4.5 States: all rows must hold.

## Acceptance
- [ ] `71-decode.js` is ≤ 1,800 bytes, has the IIFE header, and returns early unless `html.motion`. It contains `aria-hidden`, `textContent` and `performance.now`, and none of the APIs forbidden by the regex in `test/scripts.test.mjs`.
- [ ] After a decode, `el.textContent` equals the original text. The original text node is never removed or replaced: it is moved into `.dc-txt`, and `.dc-txt` is only made transparent (opacity), not hidden.
- [ ] `42-type.css` contains `@property --flow` and `@keyframes name-flow`. The keyframes and every `animation:` sit inside `@media (prefers-reduced-motion: no-preference)`.
- [ ] The `--grad-flow` stops are exactly the approved `--grad-name` hex stops from `src/styles/01-tokens.css`. Dark: `#C9B8FF #8A5BFF #8FA0FF`. Light: `#6E2BFB #5A1FE0 #3346C4`. No new colours.
- [ ] The vm smoke test in `test/scripts.test.mjs` still passes (bundle cap as raised by T-010).
- [ ] No-JS / reduced motion: plain text and the static gradient name. Nothing hidden.

## Tests
New `test/wow-type.test.mjs`:
- byte cap and required substrings of `71-decode.js`; it does not match the forbidden-API regex
- CSS gate check on `42-type.css`: brace-matching, like the keyframe-gate test in `test/sections.test.mjs`
- the hex set inside each `--grad-flow` equals the hex set of the matching `--grad-name` in `01-tokens.css`, per theme
- a vm run of `71-decode.js` alone with a stub DOM (`.motion` set, `querySelector → null`, `querySelectorAll → []`, no `IntersectionObserver` variant): no throw

## Commands (affected only; do NOT run `npm test`)
```
node --test test/wow-type.test.mjs test/scripts.test.mjs test/build.test.mjs
npm run build
npm run check:confidential
```

## Out of scope
T-015 files (`20-components.css`, `15-motion.css`, `60-motion.js`, `62-spine.js`, `layout.mjs`) and the spine. Letter-by-letter splitting of the h1 (dropped, ux-wow §0). Any change to `40-hero.css`, `20-components.css`, the renderers, or T-007 files (`60-motion.js`, `61-pointer.js`, `10-theme.js`, `30-filter.js`). Decode on focus.

## Constraints
- No commit, no push. No edits under `.company/`.
- CSP self-only: no inline `style` attributes, no `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`cssText`/`setAttribute('style')`/`eval`/`new Function`. No network.
- No third-party libraries.
- Transform/opacity only, plus the registered `--flow` property on one word (the allowed paint exception). No `filter`/`box-shadow` animation, no `will-change`.
- Reduced motion → no decode and no flow. The pause toggle freezes the name flow; decode is one-shot and still runs. Nav-hover decode only on `(hover: hover) and (pointer: fine)` and ≥ 768px.
- Content stays visible at rest and without JS. The overlay is `aria-hidden`, and the accessible names of nav links do not change.
