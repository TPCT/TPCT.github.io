# T-012: W-3 "Live cards": cursor spotlight + rim signal
Size: S   Depends on: T-010 (caps raised), T-015 (landed)   Stories: US-14 (motion), US-07 (project cards), owner "wow" request 2026-10-21
Parallel: disjoint from T-011, T-013 and T-014. Run it next to whichever of those is running (max 2 Codex runs at once).

## Goal
Project cards light up under the mouse:
- A soft violet spotlight follows the pointer inside the hovered card.
- A thin conic "signal" runs around the inner rim of the hovered or focused card.
- Featured cards show a faint static rim at rest.

Touch devices get no pointer tracking. Keyboard users get the rim on `:focus-within`.

## Files (only these)
- new `src/styles/61-cards-live.css`
- new `src/scripts/72-spot.js` (≤ 900 bytes raw)
- new `test/wow-cards.test.mjs`

**State class rename (lead decision):** use `is-spot` instead of ux-wow's `is-lit` for the hovered card, everywhere (CSS `.card.is-spot::before`, JS, tests). T-015 already uses `.is-lit` for the spine chapter nodes, and T-013 uses it for timeline nodes, so `is-spot` keeps the card state unambiguous.

No markup changes. This uses the free `.card::before` and `.card > article::before` pseudo-elements. Do NOT touch `.card::after` (the T-006 sheen) or `src/styles/60-work.css`.

## Spec (normative): `.company/ux-wow.md`
- §1 Global rules 1–10.
- §5.1 CSS: copy it verbatim into `61-cards-live.css`.
  - Includes the `--spot` tokens per theme and `--card-pad` mirroring the existing 22px/26px padding (do not change the padding itself).
  - `@property --rim-angle`, `rim-spin` only inside `no-preference`, the `.motion-paused` pause, the `@supports not` mask fallback, and `forced-colors` hiding.
  - Keep the layering notes: spotlight z 0 < sheen z 1 < article z 2; rim at z -1 inside the article stacking context.
  - `--spot` alpha must not be raised (the contrast numbers in §5.3 depend on it).
- §5.2 JS `72-spot.js`:
  - Gate: `html.motion` + `fine` (`(hover: hover) and (pointer: fine)`, read once) + `#project-list`.
  - Delegated `pointermove` on the list, `closest('.card')`. On card change, move `is-spot` and cache the rect. Re-measure on passive `scroll`.
  - One rAF writes `--sx`/`--sy` via `card.style.setProperty(…, n.toFixed(1) + 'px')`.
  - `pointerleave` on the list removes `is-spot`.
  - While `html.motion-paused`, do nothing and remove `is-spot`.
  - A separate listener from T-007's tilt; do not edit `61-pointer.js`.
- §5.3 States: all rows must hold, including the filter FLIP being unaffected and no sticky hover on touch.

## Acceptance
- [ ] `72-spot.js` is ≤ 900 bytes, has the IIFE header, and returns early without `html.motion`, without fine pointer, or without `#project-list`. It references `--sx`, `--sy`, `is-spot` (and NOT `is-lit`), `pointer: fine` and `motion-paused`.
- [ ] `61-cards-live.css` contains `@property --rim-angle`, `@keyframes rim-spin` inside `@media (prefers-reduced-motion: no-preference)`, `.motion-paused .card > article::before`, the `@supports not ((mask-composite: exclude) or (-webkit-mask-composite: xor))` fallback, and the `forced-colors` rule hiding both pseudos.
- [ ] Hover rules live inside `@media (hover: hover) and (pointer: fine)`. `:focus-within` shows the rim for keyboard users.
- [ ] The vm smoke test in `test/scripts.test.mjs` still passes. The CSS budget in `test/sections.test.mjs` still passes.
- [ ] No-JS / reduced motion: plain plates. The rim appears static on hover/focus only, with no spotlight and no spin.

## Tests
New `test/wow-cards.test.mjs`:
- byte cap and required substrings of `72-spot.js`; it does not match the forbidden-API regex from `test/scripts.test.mjs`
- CSS assertions above, plus a gate check: every `@keyframes`/`animation:` in `61-cards-live.css` sits inside `no-preference`, using the brace-matching approach from `test/sections.test.mjs`
- built `index.html` still has no `style="`
- a vm run of `72-spot.js` alone with a stub DOM (`.motion` set, `matchMedia` → `matches: true`, `getElementById → null`): no throw

## Commands (affected only; do NOT run `npm test`)
```
node --test test/wow-cards.test.mjs test/scripts.test.mjs test/sections.test.mjs test/projects.test.mjs
npm run build
npm run check:confidential
```

## Out of scope
T-015 files and the spine. Card tilt, magnetic buttons, sheen and filter FLIP (T-007/T-006, unchanged). Any edit to `60-work.css`, `sections.mjs` or the T-007 scripts. Spotlight on touch.

## Constraints
- No commit, no push. No edits under `.company/`.
- CSP self-only: no inline `style` attributes, no `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`cssText`/`setAttribute('style')`/`eval`/`new Function`. CSSOM `style.setProperty` is allowed. No network.
- No third-party libraries.
- Spotlight uses `translate` and `opacity` only. `--rim-angle` on one hovered or focused card is the one allowed paint exception. No `filter`/`box-shadow` animation, no `will-change`.
- Reduced motion → no spotlight, no spin. The pause toggle freezes the spin and turns the spotlight off. Pointer tracking only on `(hover: hover) and (pointer: fine)`.
- Content stays visible at rest and without JS. The pseudos are decorative, with no new focusable elements.
