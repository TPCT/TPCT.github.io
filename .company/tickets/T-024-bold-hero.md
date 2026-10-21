# T-024 — B-3 Hero: CSS intro loader, kinetic 3D name, roles rotator, S-mark scroll depth

Size: M   Depends on: T-023 merged   Parallel: may run together with T-026 (disjoint files); never with T-025   Stories: owner feedback "still no real wow"

## Goal
Make the first second unforgettable without risking LCP: a CSS-only 1.0s intro (the S-mark draws itself, the curtain lifts), then "Islam Elsayed" rises letter by letter in 3D (GSAP, with a CSS watchdog if GSAP is late), the roles flip in place (CSS rotator), and the S-mark layers separate in depth as you scroll. Same tokens, same look; reduced motion and no-JS get today's static hero.

## Files (only these)
- `src/styles/40-hero.css` (the `.js` hero entrance block, lines 77–99, only)
- `src/styles/43-hero-wow.css` (append the depth rules; keep the existing rules)
- new `src/styles/44-intro.css`
- new `src/scripts/81-kinetic.js` (≤ 2,400 bytes)
- new `test/bold-hero.test.mjs`

## Spec → `.company/ux-bold.md` §4 (normative; §4.1–§4.6)
Available from T-023: `html.intro` (first view in tab, no hash, not paused, motion allowed, home), `html.kinetic` (home + motion allowed), `html.motion-paused` (pre-paint), `html.bold` (added by the ready queue), `window.TPCT_BOLD` (`B.g`, `B.ST`, `B.now`, `B.ready`, `B.paused()`), the `.intro-screen` markup with `.intro__svg` (5 `pathLength="1"` paths inside `.sc-part--*` groups), and `45-bold.css` `.intro-screen, .tint { display: none; }`.

1. **`44-intro.css`**, in this order:
   - the intro block of §4.1 verbatim (`:root { --intro-offset: 0ms; }`, `.intro { --intro-offset: 700ms; }`, the `no-preference` block with `.intro .intro-screen { display: grid; … }`, path draw/fill, per-part `--d`, the 4 keyframes, and `@media print, (forced-colors: active) { .intro-screen { display: none !important; } }`). Because `44-intro.css` sorts before `45-bold.css`, the selector `.intro .intro-screen` (2 classes) must win over `.intro-screen` (1 class) by specificity; keep it that way.
   - `:root { --kinetic-wait: 0ms; } .kinetic { --kinetic-wait: 1600ms; }`
   - the split CSS of §4.3 (`.hero h1.is-kinetic …` rules, 5 rules).
   - the rotator of §4.4 verbatim (`--roles-start`, `@keyframes role-cycle`, `.js .roles …`, `.motion-paused .roles …`) — all inside `@media (prefers-reduced-motion: no-preference)` except the `:root` custom property.
2. **`40-hero.css` edits** (§4.2):
   - every `animation` delay in lines 81–98 becomes `calc(<old>ms + var(--intro-offset))` (eyebrow, headline, sub, schematic, schematic chips `calc(800ms + var(--i) * 40ms + var(--intro-offset))`, motion-toggle, stats, CTAs ×3);
   - the 4 h1 word rules become `calc(<old>ms + var(--intro-offset) + var(--kinetic-wait))`;
   - delete the 4 `.js .roles li:nth-child(n)` rules and add `.js .roles { animation: rise 800ms var(--ease-rise) calc(380ms + var(--intro-offset)); animation-fill-mode: both; }`;
   - add `.hero h1.is-kinetic .w > span { animation: none; }` inside the same block.
   - Do not touch any other rule in the file (the sub keeps its CSS `rise`, it is the LCP candidate).
3. **`43-hero-wow.css`** (§4.4 "S-mark depth"): append the 6 rules verbatim (`.sc-hero { --sy: 0; }`, shard `translate` with `--sy`, halo `translate`, `.bold .sc-hero { animation: none; scale…; opacity… }`, `.bold .sc-hero__mark`, `.bold .sc-hero__halo`). The existing `@supports (animation-timeline: view())` `hero-exit` stays for the no-GSAP case; `.bold .sc-hero { animation: none }` must come after it in the cascade (it does, same file, appended). Also add `@property --sy { syntax: '<number>'; inherits: true; initial-value: 0; }` at the top next to `--shift`.
4. **`81-kinetic.js`** (§4.3), file starts with `(function () {\n  "use strict";`:
   - Start: `const go=()=>{const B=window.TPCT_BOLD;…}; document.readyState==='complete'?go():document.addEventListener('DOMContentLoaded',go,{once:true});` — this listener is registered after `80-bold.js`'s, so `TPCT_BOLD` exists by then.
   - `B.now(B=>…)`: steps 1–4 of §4.3 exactly: bail-outs (no `B`, no `html.kinetic`, no `.hero h1`, `performance.now() > 1400 + (intro ? 700 : 0)`); synchronous split with `createElement('span')`, `className='ch'`, `setAttribute('aria-hidden','true')`, `textContent` per character (spaces never occur inside a word); `aria-label` on the h1; `--ww` on the accent word span and `--cx` per `.ch` via `style.setProperty` (number strings, no unit); `is-kinetic`; then the `g.timeline({ delay, onComplete: revert }).from(chars, { yPercent: 118, rotationX: -88, opacity: 0.001, transformOrigin: '50% 100% -12px', duration: 1.0, ease: 'expo.out', stagger: { each: 0.034 } })`.
   - `revert()` (idempotent): restore each word span's `textContent`, `removeProperty('--ww')`, remove the h1 `aria-label`, keep `is-kinetic`. Also call it on `beforeprint` and when `html` gains `motion-paused` while the timeline runs (`tl.progress(1)` then revert; use a `MutationObserver` on `<html>` class, disconnect after revert).
   - `B.ready(B=>…)`: the depth scrub of §4.3: `g.to('.sc-hero', { '--sy': 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } })`, registered inside `B.mm.add(B.Q.motion, () => { … })` so reduced-motion changes revert it. Skip if `.sc-hero` is missing.
   - Style writes CSSOM only; no `innerHTML`/`cssText`/`setAttribute('style'`.

## Acceptance
- [ ] First visit (fresh context, no hash): intro overlay visible at ~200ms, gone by 1.05s (`visibility: hidden` via `intro-out`), skip link (z 100) focusable above it, clicks pass through (`pointer-events: none`).
- [ ] Letters rise from ~0.72s (intro) / ~0.10s (repeat visit in the same tab, or `/#work`); after the timeline the h1 is back to plain words (`.w > span` text only, no `.ch`, no `aria-label`, class `is-kinetic` kept, no CSS `word-up` replay).
- [ ] Watchdog: with `/assets/vendor/*` requests aborted, the name still rises once via CSS (at 1.6s + offset) and is fully visible by 3s; no JS error.
- [ ] Rotator: the 3 roles occupy one grid cell (no CLS), first role visible immediately, flips from ~2.4s (+offset); all 3 `li` remain in the accessibility tree; under `motion-paused` the inline row with `·` separators returns; hover pauses.
- [ ] Scrolling past the hero recedes the S-mark (`--sy` 0→1) under `html.bold`; pointer parallax (`--px/--py`) and hover `--shift` still work on desktop.
- [ ] Reduced motion: no intro, no split, no rotator, static inline roles. No JS: built h1 unchanged (plain words).
- [ ] CLS ≤ 0.05 on first visit at 1440×900 and 390×844 (PerformanceObserver `layout-shift` sum, excluding `hadRecentInput`).
- [ ] 0 CSP violations / console errors (browser check).

## Tests
`test/bold-hero.test.mjs` (ux-bold §4.6): built CSS includes `--intro-offset`, `--kinetic-wait: 1600ms`, `.is-kinetic .w > span { animation: none; }`; `@keyframes role-cycle`, `intro-draw`, `intro-out` appear only inside a `prefers-reduced-motion: no-preference` block (reuse the brace-depth helper pattern from `sections.test.mjs`); every `animation:` delay in the `40-hero.css` `.js .hero` entrance block contains `var(--intro-offset)`; no `.js .roles li:nth-child` rule left; `81-kinetic.js` ≤ 2,400 bytes, contains `aria-label`, `is-kinetic`, `expo.out`, `--sy`, and passes the same forbidden-API regex as `scripts.test.mjs`; the built home h1 equals the pre-change markup (`<span class="w"><span>Islam</span></span> <span class="w w--accent"><span>Elsayed</span></span>` shape, no `ch`).

## Browser check (dev only, outside the repo; required)
Throwaway script in `/tmp/tpct-t024/check.mjs`; build; `PORT=4324 node scripts/serve.mjs &`; run with `PLAYWRIGHT_CORE=/home/tpct/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core CHROME_PATH=/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`; kill the server after. Same CSP/console collection as T-023 (`addInitScript` `securitypolicyviolation` listener + console errors + pageerror). Cases: desktop 1440×900 first visit (screenshots at 300ms, 800ms, 1200ms, 3500ms), same tab reload, `/#work`, mobile 390×844 `isMobile/hasTouch`, `reducedMotion: 'reduce'`, desktop with `page.route('**/assets/vendor/**', r => r.abort())` (watchdog), and one run with `localStorage.motion='paused'` set by `addInitScript` (no intro, inline roles). Assert the acceptance items; report CLS numbers and violation counts.

## Commands (run only these)
```
npm run build
node --test test/bold-hero.test.mjs test/scripts.test.mjs test/build.test.mjs test/brand.test.mjs test/sections.test.mjs
npm run check:confidential
```

## Constraints
- Do not commit or push. Do not edit anything under `.company/`. Never modify `public/assets/vendor/*`.
- CSP self-only: no inline styles/handlers, CSSOM writes only.
- Keep the current visual style exactly (same gradient `--grad-name` across letters, same fonts, sizes, colours).
- Reduced motion / no JS: today's static hero. Pause: rotator stops (inline row), one-shot entrance finishes, depth stays scroll-linked.
- Mobile: intro, kinetic and rotator on; no pointer depth on touch (61-pointer already guards); no overflow at 360.
- LCP: never delay or hide `.hero__sub` beyond its existing CSS `rise` (+ offset); no `opacity: 0` on it.
- Do not edit `80-bold.js`, `hero.mjs`, `60-motion.js`, `61-pointer.js` or any other partial.

## Out of scope
Colour morphs/heading reveals (T-026), story pins (T-025), perf fallbacks (lead, ux-bold §10).
