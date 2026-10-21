# UX spec: "Signal" wow round (motion + Journey timeline), on top of T-007

Owner: UI/UX Designer · Date: 2026-10-21 · Status: normative for tickets W-1 … W-5.
Inputs: owner feedback after going live ("still needs more animations and attractive, eye-catching things"), the owner's request for a timeline ("و يكون في timeline"), `ux-prism.md` (visual + motion system), `ux.md` (IA/behaviour), T-007 (+ addendum) and T-009, and the current `src/` code. The impeccable skill's `animate` and `bolder` guidance was applied (see §0).

Where this document conflicts with `ux-prism.md`, this document wins. Everything not mentioned here stays as it is. **Nothing here duplicates T-007**: T-007 owns scroll reveal, count-up, filter FLIP, card tilt, magnetic buttons, logo pointer parallax, cursor glow, the logo click re-assemble, the theme reveal and the motion toggle. This round builds on top of those hooks and never edits `60-motion.js`, `61-pointer.js`, `10-theme.js` or `30-filter.js`.

---

## 0. Motion thesis (why these effects and not others)

Mode: **Experience** (a portfolio), so motion may carry the voice. Following `bolder` ("amplify what the system already owns, don't invent new primitives"), every effect uses the same idea: **the signal moving through the system**. The ShiftCodes mark is the source, and the violet signal travels outward from it.

| Role | What | Chunk |
|---|---|---|
| **Focal moment** | The hero becomes a living system graph: a violet particle constellation behind the S-mark. Links form as the cursor moves near it, and clicking the mark sends a shockwave through the graph. | W-1 |
| **Supporting: type** | Text "compiles" into place. The role line, the hero eyebrow and section indices decode from code glyphs (`</>{}`), and the gradient name slowly flows. | W-2 |
| **Supporting: work** | Project cards light up under the cursor: a soft spotlight follows the pointer, and a violet signal runs around the rim. | W-3 |
| **Narrative (owner request)** | The Journey timeline: a centre line draws as you scroll, a spark rides its tip, and each node lights up when the line reaches it while its card slides in toward the line. | W-4 |
| **Rhythm** | A CSS-only stack marquee in two counter-moving rows, the S-mark "shifts" open on hover, and the hero mark recedes as you scroll past it. | W-5 |

**Considered and dropped** (decided; logged in Assumptions):
- Film grain: a full-viewport noise layer costs a permanent composited layer and visibly lowers text crispness on glass plates. The brand is glass, not analog.
- Animated section dividers: these would add a seventh decorative device. The Journey line and the process line already carry the "line" motif.
- Letter-by-letter name shimmer: splitting the h1 into letter spans fights T-005's word mask and makes some screen readers spell the name. It is replaced by the gradient flow in W-2.
- Scroll parallax on section headings: `ux-prism.md` §1 bans text parallax for readability. Scroll-linked motion is used only on the hero mark (W-5).
- A separate "experience timeline draw": Experience has one entry. The Journey timeline (W-4) owns line drawing, and the process line already draws (T-006).

---

## 1. Global rules for every chunk (hard constraints)

1. **Gate = `html.motion`.** `60-motion.js` adds `motion` only when `prefers-reduced-motion` is not `reduce` and `IntersectionObserver` exists. All new JS modules start with `if (!document.documentElement.classList.contains('motion')) return;`. They run after `60-motion.js` because the bundle is concatenated in filename order (`70-`, `71-`, `72-`, `73-`). New CSS motion sits inside `@media (prefers-reduced-motion: no-preference)` and is selected under `.motion` or `.js` as stated per chunk. The global reduce rule in `10-base.css` stays as a backstop.
2. **Pause = `html.motion-paused`.** Every ambient loop (canvas, name flow, rim spin, "now" pulse, marquee) stops in place when the existing hero motion toggle is set. JS loops watch the class with a `MutationObserver` on `<html>` (`attributeFilter: ['class', 'data-theme']`). One-shot effects (decode, node pop) and scroll-linked effects (line draw, hero exit) are not "loops" and are not paused. This matches the existing rule in `ux-prism.md` §2.
3. **Cursor effects only on `(hover: hover) and (pointer: fine)`**, checked once at module init. Touch devices get no pointer tracking at all. Tap-to-shockwave on the mark (W-1) is allowed because it is a discrete tap, not tracking.
4. **Content visible at rest.** Every new element is complete and readable without JS and under reduced motion. JS only ever adds state classes that make things *more* animated. It never hides content, except through T-007's existing `is-pending` reveal, which has a watchdog.
5. **CSP (`style-src 'self'`, `script-src 'self' + one hash`).**
   - No inline `style` attributes in markup, no `setAttribute('style', …)`, no `cssText`, no `innerHTML`/`outerHTML`/`insertAdjacentHTML`, no `eval`/`new Function`. The existing test regex in `test/scripts.test.mjs` already enforces this for every `src/scripts/*.js`.
   - **Verified:** setting individual properties through CSSOM (`el.style.setProperty('--x', v)`, `el.style.minWidth = …`) is **not** blocked by `style-src`. CSP's inline-style check applies to `<style>` elements and to `style` attributes created by the parser or by `setAttribute`, not to CSSOM property writes. (`cssText` is also CSSOM, but the project bans it anyway.)
   - Canvas 2D drawing, `getComputedStyle`, `element.animate()` and `@property` rules in the external stylesheet are not governed by CSP.
   - No third-party code, no CDN and no network calls (`connect-src 'none'` stays).
6. **Compositor first.** Loops animate `transform`/`translate`/`scale`/`rotate`/`opacity`. There are three deliberate, bounded paint exceptions:
   - the canvas (W-1), which is one isolated layer;
   - the registered custom properties `--flow` (one word) and `--rim-angle` (one hovered card at a time);
   - the timeline spark's custom property.
   No `filter`, `backdrop-filter` or `box-shadow` animation. No `will-change`.
7. **Performance.**
   - Lighthouse mobile performance ≥ 90 and CLS ≤ 0.05 (no new layout shift; every overlay is absolutely positioned).
   - 60fps on a mid laptop. The canvas is capped at 30fps on coarse pointers.
   - Each feature has one pending rAF. Passive scroll listeners. Rects are measured on enter/scroll/resize, never per move.
   - Loops stop when offscreen (`IntersectionObserver`) and when the tab is hidden (`visibilitychange`).
8. **JS byte budget (raw source; the build doesn't minify).** Total added ≤ **8,192 bytes**:

   | File | Cap (bytes) |
   |---|---|
   | `70-field.js` | 4,096 |
   | `71-decode.js` | 1,800 |
   | `72-spot.js` | 900 |
   | `73-timeline.js` | 1,250 |
   | `50-scrollspy.js` edit | +40 |

   The `dist/assets/site.js` cap in `test/scripts.test.mjs` goes from 16,000 to **24,192**. W-1 raises it, since it lands first (§8).
9. Every module is an IIFE starting with `(function () {\n  "use strict";`. It returns early when its hooks are absent, so it must not throw on `/404.html`. It must pass the existing vm smoke test (stub DOM: `querySelector → null`, `querySelectorAll → []`). Guard every optional global: `ResizeObserver`, `MutationObserver`, `requestIdleCallback`, `HTMLCanvasElement.prototype.getContext`.
10. **Keyboard and a11y.** No new focusable elements, except real links inside timeline cards. Every decorative node is `aria-hidden="true"`. Focus order stays DOM order.

---

## 2. User flows

| Flow | Steps |
|---|---|
| **F1 Land on the hero (mouse)** | Page loads → T-005/T-009 entrance plays (eyebrow, name, logo assembly) → the eyebrow and roles decode from glyphs into text while they rise (W-2) → about 700ms after `load` the constellation fades in behind the hero (W-1) → moving the mouse over the hero pulls nearby particles and draws cyan links to the cursor → hovering the mark makes the two hooks slide apart and the `</>` open (W-5) → clicking the mark replays the assembly (T-007) and a shockwave ring pushes the particles outward (W-1). |
| **F2 Land on the hero (touch)** | Same entrance and decode → a lighter constellation (fewer particles, 30fps) drifts with no cursor links → tapping the mark sends the shockwave. There is no hover shift. |
| **F3 Scroll the page** | The hero mark recedes (scales down and fades) as it leaves the viewport (W-5, scroll-driven browsers only) → the constellation stops once the hero is offscreen → each section index pill decodes when it scrolls in (W-2) → Journey: cards slide toward the centre line, the line draws with a glowing spark at its tip, and each node pops violet with a ripple when the line reaches it. The last node keeps a soft "now" pulse (W-4) → Stack: two marquee rows of technologies move in opposite directions (W-5) → Work: the cursor spotlight and rim signal follow the pointer across cards (W-3). |
| **F4 Pause motion** | Click "Pause animation" in the hero → the constellation freezes on its last frame, the name flow, marquee, rim spin and "now" pulse freeze, and nothing disappears → click "Play animation" → everything resumes. The state persists through `localStorage.motion` (T-007, unchanged). |
| **F5 Reduced motion / no JS** | Static hero (no canvas visible, mark static), plain text roles and indices, a static fully drawn timeline with all nodes lit, no marquee, and cards with a static rim on hover/focus only. Every piece of content is present and readable. |
| **F6 Keyboard user** | Tab through the page as today. Focusing a timeline link finishes the line draw immediately (W-4). Focusing a project card shows the static rim ring (W-3). There is no decode on focus and no pointer effects. |

---

## 3. W-1: "Signal field", the hero particle constellation (focal moment)

**Files:**
- edit `src/render/hero.mjs` (one element)
- new `src/styles/41-field.css`
- new `src/scripts/70-field.js`
- new `test/wow-field.test.mjs`
- edit `test/scripts.test.mjs` (only the site.js cap: `16000` → `24192`)

### 3.1 Markup
In `renderHero`, insert the canvas as the **first child** of `section.hero`, before `<div class="container">`:

```html
<section id="top" class="hero" …><canvas class="sc-field" aria-hidden="true"></canvas><div class="container">…
```

No `width`/`height` attributes: CSS sizes it and JS sets the bitmap size. Not rendered on 404 (there is no hero).

### 3.2 CSS (`41-field.css`, complete)
```css
.hero { position: relative; isolation: isolate; }
.sc-field { position: absolute; inset: 0; z-index: -1; display: block; width: 100%; height: 100%; pointer-events: none; opacity: 0;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 70%, transparent 100%); mask-image: linear-gradient(180deg, #000 0%, #000 70%, transparent 100%); }
@media (prefers-reduced-motion: no-preference) {
  .sc-field { transition: opacity 1200ms var(--ease-out); }
  .motion .sc-field.is-live { opacity: 1; }
}
@media (forced-colors: active) { .sc-field { display: none; } }
@media print { .sc-field { display: none; } }
```
`isolation: isolate` on `.hero` keeps the canvas above the html field and the body blobs (they are outside the hero) but below all hero content. `.hero` keeps its existing `overflow-x: clip`. Do not add `transform`/`filter` to `body` (`ux-prism.md` §4.1).

### 3.3 JS `70-field.js` (≤ 4,096 bytes): responsibilities and exact constants
1. **Gate:**
   - `root.classList.contains('motion')`
   - `hero = document.querySelector('.hero')`
   - `cv = hero && hero.querySelector('.sc-field')`
   - `ctx = cv && cv.getContext && cv.getContext('2d')`
   - Return if any of these is missing.
2. **Profile:** `fine = matchMedia('(hover: hover) and (pointer: fine)').matches`.

   | Setting | `fine` | coarse |
   |---|---|---|
   | DPR | `Math.min(devicePixelRatio \|\| 1, 1.5)` | `1` |
   | Frame interval | every rAF | skip frames until ≥ 32ms have passed (30fps) |
   | Count `N` (`area` = hero CSS px²) | `clamp(round(area / 15000), 28, 70)` | `clamp(round(area / 22000), 14, 28)` |
   | Link distance `L` | `128px` | `104px` |
3. **Start late, off the critical path:** `go = () => setTimeout(start, 700)`. If `document.readyState === 'complete'`, call `go()`; else `addEventListener('load', go, { once: true })`. `start()`:
   - `size()`, seed particles
   - read colours
   - `cv.classList.add('is-live')` (fades in over 1200ms)
   - `update()` (starts the loop if allowed)
4. **Size:** `w = hero.clientWidth`, `h = hero.clientHeight`; `cv.width = round(w * dpr)`, `cv.height = round(h * dpr)`; `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`. Re-run on `ResizeObserver(hero)` (rAF-debounced, falling back to a `resize` listener when `ResizeObserver` is missing). On resize, rescale the existing particle positions by `w'/w`, `h'/h`, and add or remove particles to match the new `N`.
5. **Particle:**
   - `{x, y, vx, vy, kx, ky, r, c}`
   - speed is random 6–18 px/s in a random direction
   - `r` = 1.1–2.2px
   - `c = 1` (cyan) for every 6th particle, else `0` (brand)
   - edges wrap with a 20px margin
   - `kx/ky` hold the shockwave velocity (px/s) and decay by `Math.pow(.9, dt * 60)` per frame
6. **Frame** (`dt` in seconds, clamped to ≤ .05):
   - Move: `x += (vx + kx) * dt`, same for `y`.
   - Cursor pull (fine only, while the pointer is inside the hero): for a particle at distance `d < R = 170px` from the cursor, `x += (mx - x) * .012 * (1 - d / R) * dt * 60` (same for y).
   - Clear with `ctx.clearRect(0, 0, w, h)`.
   - **Links:** for every pair with `d² < L²`, put the segment into one of 4 alpha buckets by `a = (1 - d / L) * .34` (bucket alphas .08 / .16 / .24 / .32). Stroke each bucket as one path, with `strokeStyle = brand`, `lineWidth = 1`, `globalAlpha = bucket × themeK`.
   - **Cursor links** (fine): segments from the cursor to particles with `d < R`, `globalAlpha = (1 - d / R) * .55 * themeK`, colour `cyan`.
   - **Dots:** one path per colour (`arc` each), `globalAlpha = .9 * themeK`.
   - `themeK = 1` in dark and `.75` when `root.dataset.theme === 'light'`.
7. **Colours:** `cs = getComputedStyle(root)`; `brand = cs.getPropertyValue('--brand').trim()`, `cyan = cs.getPropertyValue('--cyan').trim()`. Re-read on the `MutationObserver` callback, so a theme switch recolours the next frame.
8. **Shockwave:** a `click` on `.hero .sc-hero` (pointer only; the mark is `aria-hidden`, and T-007 already restarts the assembly on the same click; this listener is separate). The origin is the centre of `.sc-hero` in hero coordinates.
   - Each particle: `kx += ux * 320 * max(0, 1 - d / 600)`, same for `ky`, where `(ux, uy)` is the unit vector from the origin.
   - Draw a ring for 900ms: radius `easeOutCubic(t) * max(w, h) * .55`, `lineWidth = 2`, `globalAlpha = .55 * (1 - t) * themeK`, colour brand.
   - A new click restarts the ring.
   - If the loop is paused, the click does nothing.
9. **Pointer (fine only):**
   - Cache `rect = hero.getBoundingClientRect()` on `pointerenter`, on passive `scroll` and on resize.
   - `pointermove` on the hero: `mx = clientX - rect.left`, `my = clientY - rect.top`, `has = true`.
   - `pointerleave`: `has = false`.
10. **Run/stop:** `running = heroVisible && !document.hidden && !root.classList.contains('motion-paused')`.
    - `heroVisible` comes from `IntersectionObserver(hero, { threshold: 0 })`.
    - `update()` starts or cancels the single rAF on changes from IO, `visibilitychange` and the MutationObserver.
    - When paused, the canvas keeps its last frame (frozen, still visible).
11. **Adaptive quality** (fine and coarse):
    - Average the frame `dt` over the first 90 rendered frames. If it is > 24ms, set `N = round(N * .6)` and drop the extra particles.
    - Measure again over the next 90 frames. If it is still > 24ms, stop permanently and remove `is-live` (the canvas fades out). The hero is complete without it.

### 3.4 States
| State | Behaviour |
|---|---|
| No JS / reduced motion / no `IntersectionObserver` | Canvas present, `opacity: 0` and blank. The hero looks exactly as today. |
| Loading (before load + 700ms) | Invisible, no work. |
| Live | Fades in over 1.2s, then drifts. |
| Paused (motion toggle) | Frozen frame, no rAF. |
| Offscreen / tab hidden | No rAF. |
| Theme switch | Recolours on the next frame (the T-007 view-transition snapshot is fine). |
| Slow device | Drops 40% of particles, then fades out if still slow. |
| Forced colours / print | `display: none`. |

### 3.5 Tests (`test/wow-field.test.mjs`)
- Built `index.html`: `section.hero`'s first child is `<canvas class="sc-field" aria-hidden="true">`.
- `70-field.js` ≤ 4,096 bytes. It contains `devicePixelRatio`, `visibilitychange`, `motion-paused`, `IntersectionObserver`, `(hover: hover) and (pointer: fine)` and `getComputedStyle`.
- The CSS bundle contains `.sc-field` inside a `forced-colors` block.
- `test/scripts.test.mjs` site.js cap is `24192`.
- The existing vm smoke test still passes.

---

## 4. W-2: "Compile" type: decode effect and name flow

**Files:**
- new `src/scripts/71-decode.js` (≤ 1,800)
- new `src/styles/42-type.css`
- new `test/wow-type.test.mjs`

No markup changes: the DOM is built at runtime with `createElement` and `textContent`.

### 4.1 Decode targets
| Target | Trigger | Duration | Start |
|---|---|---|---|
| `.hero .eyebrow` | page load | 640ms | 60ms after navigation start (matches its rise) |
| `.roles li` (i = 0…) | page load | 720ms | `380 + 60 * i` ms after navigation start |
| `.section-head__index` | its own IO `{ threshold: 1, rootMargin: '0px 0px -10% 0px' }`, first intersect, then `unobserve` | 560ms | immediately |
| `#primary-nav a` (only `fine` and `matchMedia('(min-width: 768px)')` at event time) | `pointerenter` | 320ms | immediately; ignored while that link is already decoding |

Skip rules:
- Hero targets: if `performance.now() > 1500` at init, don't decode them (avoids a "text → noise → text" flash on slow loads; same idea as the T-007 count-up rule).
- Section indices visible at init (`rect.top < innerHeight`): don't decode.
- Any element whose `.dc-src` reports `getClientRects().length > 1` (wrapped on two lines, e.g. a role below 400px) is skipped.

### 4.2 DOM transform (once per element, on first decode)
Wrap the element's text nodes (`textContent.trim()`, keeping the element's own `::before` pseudo intact) into:

```html
<span class="dc-src"><span class="dc-txt">ORIGINAL</span><span class="dc" aria-hidden="true"><span class="dc-done"></span><span class="dc-noise"></span></span></span>
```

The original text stays in the DOM and in the accessibility tree the whole time. It is only made transparent with `opacity: 0`, which does not remove it from AT. The overlay is `aria-hidden`. Accessible names of nav links are unchanged. When the decode finishes, remove the `.dc` node and the `is-decoding` class. The `.dc-src`/`.dc-txt` wrappers stay; a later nav-hover decode re-creates `.dc`.

### 4.3 Algorithm
```
G = '<>/{}[]=+*#01'
run(el, dur):
  if el.classList.contains('is-decoding') return
  prepare(el); el.classList.add('is-decoding'); t0 = performance.now(); last = 0
  tick(now): rAF loop; only render when now - last >= 40 (25 updates/s, a "terminal" cadence)
    p = min(1, (now - t0) / dur); n = floor(p * len)
    done.textContent  = orig.slice(0, n)
    noise.textContent = orig.slice(n).replace(/\S/g, () => G[Math.random() * G.length | 0])
    if p === 1 → remove .dc, el.classList.remove('is-decoding'); stop
```
Spaces stay spaces, so word shapes hold. `text-transform: uppercase` on the index pills applies to the overlay through inheritance.

### 4.4 CSS (`42-type.css`)
```css
.dc-src { position: relative; }
.dc { position: absolute; inset-block-start: 0; inset-inline-start: 0; white-space: nowrap; pointer-events: none; }
.dc-noise { color: var(--brand); }
.is-decoding > .dc-src > .dc-txt { opacity: 0; }

/* Name flow: the gradient word slowly flows. Only the approved --grad-name stops are used (ux-prism §3.4 rule 1). */
@property --flow { syntax: '<percentage>'; inherits: true; initial-value: 0%; }
:root, [data-theme="dark"] { --grad-flow: linear-gradient(100deg, #C9B8FF 0%, #8A5BFF 25%, #8FA0FF 50%, #8A5BFF 75%, #C9B8FF 100%); }
[data-theme="light"] { --grad-flow: linear-gradient(100deg, #6E2BFB 0%, #5A1FE0 25%, #3346C4 50%, #5A1FE0 75%, #6E2BFB 100%); }
@media (prefers-reduced-motion: no-preference) {
  @keyframes name-flow { 0%, 15% { --flow: 0%; } 85%, 100% { --flow: 100%; } }
  .motion .hero h1 .w--accent > span { background-image: var(--grad-flow); background-size: 200% 100%; background-position: var(--flow) 50%; }
  .motion .hero h1 .w--accent { animation: name-flow 8s var(--ease-in-out) 2s infinite alternate; }
  .motion-paused .hero h1 .w--accent, .hero:has(.sc-hero.is-idle) h1 .w--accent { animation-play-state: paused; }
}
```

Notes on the name flow:
- The animation sits on the **outer** `.w--accent` mask span. Animating the inner span would override T-005's `word-up` animation shorthand on it.
- The registered `--flow` is inherited by the inner span.
- Browsers without `@property` interpolation show the static gradient.
- `.dc-src` stays inline, so roles keep wrapping exactly as today.

### 4.5 States
| State | Behaviour |
|---|---|
| No JS / reduced motion | Plain text, static gradient name. |
| Slow load (> 1.5s) | Hero decode skipped. Section indices still decode on scroll. |
| Paused | Decode is one-shot and still runs. The name flow freezes. |
| Long content | Long roles wrap normally. Wrapped elements are skipped (§4.1). |
| Forced colours | The existing rule sets the name to CanvasText. `.dc-noise` inherits system colours. |
| Screen reader | Reads the original text only, never the noise. |

### 4.6 Tests (`test/wow-type.test.mjs`)
- `71-decode.js` ≤ 1,800 bytes.
- Source contains `aria-hidden`, `textContent`, `performance.now`, and none of the forbidden APIs (the existing regex).
- CSS contains `@property --flow` and the `name-flow` keyframes inside the `no-preference` block.
- vm smoke test passes.
- Contrast: the gradient stops are byte-identical to the approved `--grad-name` stops (assert the hex set).

---

## 5. W-3: "Live cards": cursor spotlight and rim signal

**Files:**
- new `src/styles/61-cards-live.css`
- new `src/scripts/72-spot.js` (≤ 900)
- new `test/wow-cards.test.mjs`

No markup changes: the effect uses the free `.card::before` and `.card > article::before` pseudo-elements. `.card::after` is the T-006 sheen and is left alone.

### 5.1 CSS (`61-cards-live.css`, complete)
```css
:root, [data-theme="dark"] { --spot: rgb(138 91 255 / .22); }
[data-theme="light"] { --spot: rgb(110 43 251 / .10); }
.card { --card-pad: 22px; }
@media (min-width: 768px) { .card { --card-pad: 26px; } }   /* mirrors the existing padding; padding itself is unchanged */

/* Spotlight: compositor-only (translate), physical coordinates because pointer coordinates are physical */
.card::before { content: ""; position: absolute; z-index: 0; left: 0; top: 0; width: 420px; height: 420px; margin: -210px 0 0 -210px;
  border-radius: 50%; background: radial-gradient(circle, var(--spot) 0%, transparent 62%); pointer-events: none;
  translate: var(--sx, -999px) var(--sy, -999px); opacity: 0; transition: opacity var(--dur-2) var(--ease-out); }
.card.is-lit::before { opacity: 1; }

/* Rim signal: a 1.5px conic ring drawn on the inner edge of the plate */
@property --rim-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.card > article::before { content: ""; position: absolute; z-index: -1; inset: calc(-1 * var(--card-pad)); padding: 1.5px;
  border-radius: calc(var(--r-plate) - 1px); pointer-events: none; opacity: 0; transition: opacity 300ms var(--ease-out);
  background: conic-gradient(from var(--rim-angle), transparent 0deg, var(--logo-a) 40deg, var(--cyan) 80deg, transparent 140deg, transparent 220deg, var(--logo-b) 260deg, transparent 320deg);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); }
.card[data-featured="true"] > article::before { opacity: .4; }
.card:focus-within > article::before { opacity: 1; }
@media (hover: hover) and (pointer: fine) { .card:hover > article::before { opacity: 1; } }
@media (prefers-reduced-motion: no-preference) {
  @keyframes rim-spin { to { --rim-angle: 360deg; } }
  .card:focus-within > article::before { animation: rim-spin 3.2s linear infinite; }
  @media (hover: hover) and (pointer: fine) { .card:hover > article::before { animation: rim-spin 3.2s linear infinite; } }
  .motion-paused .card > article::before { animation-play-state: paused; }
}
@supports not ((mask-composite: exclude) or (-webkit-mask-composite: xor)) { .card > article::before { display: none; } }
@media (forced-colors: active) { .card::before, .card > article::before { display: none; } }
```

Layering:
- `article` is `position: relative; z-index: 2` (T-006), which creates a stacking context. Its `::before` at `z-index: -1` sits behind the article's text but inside the card.
- `.card { overflow: hidden }` clips the ring at the padding edge, so it reads as a lit inner rim.
- The order is spotlight (z 0) < sheen `::after` (z 1) < content (z 2).

Only the featured cards show a static ring at rest; it is not animated. The spin runs only on the one hovered or focused card.

### 5.2 JS `72-spot.js` (≤ 900 bytes)
- **Gate:** `.motion` and `fine`, and `list = document.getElementById('project-list')`.
- Delegated `pointermove` on `list`; `card = e.target.closest('.card')`.
  - When the card changes: remove `is-lit` from the previous card (keep its `--sx`/`--sy` so it fades out in place), add `is-lit` to the new card and cache `rect = card.getBoundingClientRect()`.
  - Re-measure on passive `scroll`.
- One rAF: `card.style.setProperty('--sx', (clientX - rect.left).toFixed(1) + 'px')`, same for `--sy`.
- `pointerleave` on `list` removes `is-lit`.
- If `root.classList.contains('motion-paused')`, do nothing and remove `is-lit` (the spotlight is treated as an ambient pointer effect, consistent with T-007's cursor glow).
- This runs alongside T-007's tilt (separate listener). The rect from a tilted card is close enough (±4°).

### 5.3 States
| State | Behaviour |
|---|---|
| Rest | Plain plate. Featured cards show a faint static rim. |
| Hover (mouse) | Spotlight follows the cursor, rim spins, plus T-007 tilt/lift/sheen. |
| Keyboard focus inside a card | Rim at full opacity and spinning (static under reduced motion). No spotlight. |
| Touch | No spotlight. Rim on `:focus-within` only. No sticky hover (hover rules are inside the `hover: hover` query). |
| Reduced motion | Rim appears static on hover/focus (an opacity state change, which is allowed). No spotlight, no spin. |
| Paused | Spin frozen, spotlight off. |
| Filter FLIP (T-007) | Unaffected. WAAPI animates the card `transform`, while the spotlight uses pseudo `translate`. |
| Old browsers without mask-composite | No rim. Spotlight still works. |

**Contrast with the spotlight at full strength:**
- Dark: `--muted` on plate + spot ≈ 5.6:1 and `--fg2` ≥ 7:1.
- Light: `--muted` ≈ 6.2:1.
- Both pass 4.5:1. `--spot` must not be raised.

### 5.4 Tests (`test/wow-cards.test.mjs`)
- `72-spot.js` ≤ 900 bytes. It references `--sx`, `--sy`, `is-lit`, `pointer: fine` and `motion-paused`.
- CSS has `@property --rim-angle`, the `rim-spin` keyframes inside `no-preference`, and the `@supports not` fallback.
- vm smoke test passes.

---

## 6. W-4: "Journey" timeline section (owner request, first-class)

**Files:**
- `src/content.json` (+ `timeline`, `timelineIntro`, `sections.timeline`, nav item)
- `src/lib/validate.mjs`
- `src/render/sections.mjs` (`renderTimeline`, renumbered indices)
- `scripts/build.mjs` (render order)
- `src/scripts/50-scrollspy.js` (mapping)
- `src/styles/30-header.css` (nav fit at 768–1023)
- new `src/styles/55-timeline.css`
- new `src/scripts/73-timeline.js` (≤ 1,250)
- new `test/timeline.test.mjs`

### 6.1 Placement and IA (decided)
The section `id="timeline"` goes **directly after Experience and before Stack**. Experience has a single entry (ShiftCodes), so the Journey reads as its chronological expansion, and it still sits before Services as requested.

New order and indices:

| Index | Section |
|---|---|
| 01 | About |
| 02 | Experience |
| **03** | **Journey** |
| 04 | Stack |
| 05 | Work |
| 06 | Services |
| 07 | Process |
| 08 | Contact |

`sections.mjs` index strings change accordingly.

Nav (`site.nav`): insert `{ "label": "Journey", "href": "#timeline" }` **after About**, giving 6 links. Scroll-spy `mapping` gains `timeline: 'timeline'`.

Nav fit at 768–1023px (6 links + brand + toggle ≈ 660px of the 704px available), added to `30-header.css`:
```css
@media (min-width: 768px) and (max-width: 1023px) { #primary-nav a { padding-inline: 10px; font-size: .875rem; } #primary-nav ul { gap: 2px; } }
```
Targets stay ≥ 44px high.

### 6.2 Content (shape from the Product Owner's `.company/timeline.json`)
```jsonc
"sections": { …, "timeline": "Journey" },
"timelineIntro": {
  "title": "The journey so far",
  "lead": "From the first public commit in 2016 to founding ShiftCodes: the companies, client systems, open-source work and milestones along the way.",
  "kindLabels": { "company": "Company", "client": "Client work", "open-source": "Open source", "milestone": "Milestone" },
  "linkLabel": "Learn more"
},
"timeline": [ { "year": 2016, "title": "…", "kind": "milestone", "text": "…", "link": "https://…" } ]
```
- If the PO's file provides any of these intro keys, the PO's copy wins. The `timeline` array is copied verbatim from `.company/timeline.json`.
- `link` may be a string (an `https://` URL, labelled with `timelineIntro.linkLabel`) **or** an object `{ "href": "https://…", "label": "…" }`. The renderer accepts both.
- Order is authored by the PO (oldest first, so the line ends at "now"). The renderer never re-sorts.

**Validation (`validate.mjs`)**, all errors unless noted:
- `timeline` is a required non-empty array.
- Each item:
  - `title` and `text` are non-empty strings.
  - `kind` is one of `company|client|open-source|milestone`.
  - `year` is either an integer 1990–2100 or a string matching `/^\d{4}(\s?[–-]\s?(\d{4}|now|present))?$/i`.
  - `link`, if present, is an `https://` string or an object with a non-empty `label` and an `https://` `href`.
- `timelineIntro`: `title lead linkLabel` are strings, and `kindLabels` has all 4 keys.
- `sections.timeline` is a string.
- **Warning** (not an error) when the leading 4-digit years are not non-decreasing.
- Confidentiality: the existing `check:confidential` runs over the built HTML. Private client names must not appear (the PO must use the same anonymised wording as the case studies).

### 6.3 Markup (`renderTimeline(c)` in `sections.mjs`, using the existing `section()` and `external()` helpers)
```html
<section id="timeline" tabindex="-1" aria-labelledby="timeline-title">
  <div class="container">
    <header class="section-head" data-reveal><p class="section-head__index" aria-hidden="true">03 / Journey</p><h2 id="timeline-title">The journey so far</h2></header>
    <p class="lead tl__lead" data-reveal>{lead}</p>
    <div class="tl">
      <span class="tl__spark" aria-hidden="true"></span>
      <ol class="timeline">
        <li class="tl__item tl__item--{kind}[ tl__item--same-year]">
          <span class="tl__node" aria-hidden="true"></span>
          <time class="tl__year[ vh]"[ datetime="2016"]>2016</time>
          <article class="tl__card" aria-labelledby="tl-{i}" data-reveal>
            <p class="tl__meta"><span class="tl__kind">{kindLabels[kind]}</span></p>
            <h3 id="tl-{i}">{title}</h3>
            <p class="tl__text">{text}</p>
            [<p class="tl__more">{external(href, label, 'text-link', c.a11y.newTab)}</p>]
          </article>
        </li>
      </ol>
    </div>
  </div>
</section>
```
- Everything goes through `esc`/`attr`.
- `i` is the 0-based index.
- `datetime` is set only when `String(year)` is exactly 4 digits.
- `tl__item--same-year` plus `vh` on the `<time>` apply when `String(year)` equals the previous item's year. The year stays available to screen readers but is not repeated visually.
- Reading order per item: year, then card (kind, title, text, link).
- `build.mjs` main order: `renderHero, renderAbout, renderExperience, renderTimeline, renderSkills, renderWork, renderServices, renderProcess, renderContact`.

### 6.4 Layout and wireframes

```
Mobile < 768 (line on the left)            Desktop ≥ 1024 (centre line, alternating)
                                             2016 ·········●·  ┌──────────────┐
 │ ● 2016                                                  │──│ MILESTONE    │
 │ ┌───────────────────────┐                ┌──────────────┐  │ │ Title        │
 │ │ MILESTONE             │                │ CLIENT WORK  │──●  └──────────────┘
 │ │ Title                 │                │ Title        │  │  2019
 │ │ Text …                │                └──────────────┘  │
 │ │ Learn more ↗          │                       2021 ·······●──┌──────────────┐
 │ └───────────────────────┘                                  │   │ COMPANY …    │
 ● 2019 …                                              (spark ◉ rides the line tip)
```

### 6.5 CSS (`55-timeline.css`, complete)
```css
.tl__lead { color: var(--fg2); margin-block-end: var(--space-7); }
.tl { --tl-x: 14px; --tl-pad: 40px; position: relative; }
.timeline { position: relative; display: grid; gap: 20px; padding-inline-start: var(--tl-pad); }
.timeline::before, .timeline::after { content: ""; position: absolute; inset-block: 6px; inset-inline-start: calc(var(--tl-x) - 1px); width: 2px; border-radius: 2px; }
.timeline::before { background: var(--border-soft); }
.timeline::after { background: linear-gradient(180deg, var(--brand-line), var(--logo-b) 35%, var(--brand) 70%, var(--cyan)); transform-origin: 50% 0; scale: 1 var(--tl-p, 1); }
.tl__item { position: relative; display: grid; gap: 10px; }
.tl__node { position: absolute; inset-inline-start: calc(var(--tl-x) - var(--tl-pad) - 9px); inset-block-start: 4px; width: 18px; height: 18px; border-radius: 50%;
  background: var(--primary-skin); box-shadow: 0 0 0 5px var(--nav-sel), 0 0 18px rgb(110 43 251 / .55); }
.tl__node::before, .tl__node::after { content: ""; position: absolute; border-radius: inherit; pointer-events: none; opacity: 0; }
.tl__node::after { inset: 0; border: 2px solid var(--brand); }
.tl__node::before { inset: -6px; background: var(--glow-a); }
.tl__item--client .tl__node { background: linear-gradient(165deg, var(--brand), var(--logo-a)); }
.tl__item--open-source .tl__node { background: linear-gradient(165deg, var(--cyan), var(--cyan-line)); box-shadow: 0 0 0 5px var(--cyan-soft), 0 0 18px var(--glow-b); }
.tl__item--milestone .tl__node { border-radius: 5px; rotate: 45deg; }
.tl__item--same-year .tl__node { inset-block-start: 24px; }
.tl__year { justify-self: start; font: 700 1.25rem/26px var(--font-display); letter-spacing: -.01em; font-variant-numeric: tabular-nums lining-nums;
  background: var(--grad-accent); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }
.tl__card { background: var(--plate); border: 1px solid var(--rim); border-radius: var(--r-plate); box-shadow: var(--shadow-card); padding: 20px; min-width: 0; }
.tl__kind { display: inline-flex; padding: 4px 10px; border-radius: var(--r-pill); font: 800 .6875rem/16px var(--font-sans); letter-spacing: .06em; text-transform: uppercase; background: var(--nav-sel); color: var(--brand); }
.tl__item--client .tl__kind { background: var(--surface-soft); color: var(--fg2); }
.tl__item--open-source .tl__kind { background: var(--cyan-soft); color: var(--cyan-text); }
.tl__item--milestone .tl__kind { background: var(--brand-tint); color: var(--crown); }
.tl__card h3 { margin-block-start: 12px; font: 600 var(--fs-h3)/1.25 var(--font-display); }
.tl__text { margin-block-start: 8px; color: var(--fg2); max-width: 60ch; }
.tl__more { margin-block-start: 4px; }
.tl__spark { position: absolute; z-index: 1; inset-inline-start: calc(var(--tl-x) - 6px); inset-block-start: 6px; width: 12px; height: 12px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, #fff 0 30%, var(--brand) 60%, transparent 72%); box-shadow: 0 0 16px 4px var(--glow-a);
  translate: 0 calc(var(--tl-y, 0px) - 6px); opacity: 0; transition: opacity 300ms var(--ease-out); }
/* Unlit state exists only while JS is drawing; at rest everything is lit and drawn */
.tl.is-drawing .tl__item:not(.is-lit) .tl__node { background: var(--surface); box-shadow: inset 0 0 0 2px var(--border-strong); }
@media (prefers-reduced-motion: no-preference) {
  @keyframes tl-ripple { from { opacity: .7; scale: 1; } to { opacity: 0; scale: 2.8; } }
  @keyframes tl-now { 0%, 100% { opacity: .2; scale: .9; } 50% { opacity: .7; scale: 1.35; } }
  .tl.is-drawing .tl__spark { opacity: 1; }
  .tl.is-done .tl__spark { opacity: 0; }
  .tl.is-drawing .tl__item.is-lit .tl__node { animation: pop 520ms var(--ease-spring); }      /* `pop` exists in 15-motion.css */
  .tl.is-drawing .tl__item.is-lit .tl__node::after { animation: tl-ripple 800ms var(--ease-out); }
  .motion .timeline > .tl__item:last-child.is-lit .tl__node::before { animation: tl-now 2.4s var(--ease-in-out) 1s infinite; }
  .motion-paused .tl__node::before { animation-play-state: paused; }
  .motion .tl__card[data-reveal].is-pending { translate: 32px 0; scale: 1; }
  [dir="rtl"] .motion .tl__card[data-reveal].is-pending { translate: -32px 0; }
  @media (hover: hover) and (pointer: fine) {
    .tl__card { transition: translate var(--dur-3) var(--ease-spring), box-shadow var(--dur-2) var(--ease-out); }
    .tl__card:hover { translate: 0 -4px; box-shadow: var(--shadow-lift); }
  }
  .tl__card:focus-within { box-shadow: var(--shadow-lift); }
}
@media (min-width: 768px) { .tl { --tl-x: 20px; --tl-pad: 56px; } .tl__card { padding: 26px; } }
@media (min-width: 1024px) {
  .tl { --tl-x: 50%; --tl-pad: 0px; }
  .timeline { gap: 0; }
  .tl__item { grid-template-columns: minmax(0, 1fr) 72px minmax(0, 1fr); align-items: start; gap: 0; pointer-events: none; }
  .tl__item > * { pointer-events: auto; }
  .tl__item + .tl__item { margin-block-start: -40px; }    /* interleave; safe while every card is ≥ 104px tall */
  .tl__item:nth-child(odd) .tl__card  { grid-column: 1; grid-row: 1; }
  .tl__item:nth-child(odd) .tl__year  { grid-column: 3; grid-row: 1; justify-self: start; }
  .tl__item:nth-child(even) .tl__card { grid-column: 3; grid-row: 1; }
  .tl__item:nth-child(even) .tl__year { grid-column: 1; grid-row: 1; justify-self: end; }
  .tl__year { margin-block-start: 18px; font-size: 2rem; line-height: 38px; }
  .tl__node { inset-inline-start: calc(50% - 11px); inset-block-start: 26px; width: 22px; height: 22px; }
  .tl__item--same-year .tl__node { inset-block-start: 26px; }
  .tl__item::before { content: ""; position: absolute; inset-block-start: 36px; width: 26px; height: 2px; background: var(--brand-line); }
  .tl__item:nth-child(odd)::before  { inset-inline-start: calc(50% - 36px); }
  .tl__item:nth-child(even)::before { inset-inline-start: calc(50% + 10px); }
  @media (prefers-reduced-motion: no-preference) {
    .motion .tl__item:nth-child(odd) .tl__card[data-reveal].is-pending  { translate: -56px 0; }
    .motion .tl__item:nth-child(even) .tl__card[data-reveal].is-pending { translate: 56px 0; }
    [dir="rtl"] .motion .tl__item:nth-child(odd) .tl__card[data-reveal].is-pending  { translate: 56px 0; }
    [dir="rtl"] .motion .tl__item:nth-child(even) .tl__card[data-reveal].is-pending { translate: -56px 0; }
  }
}
@media (forced-colors: active) {
  .tl__card, .tl__kind { border: 1px solid CanvasText; }
  .timeline::after, .tl__node { background: CanvasText; box-shadow: none; }
  .tl__year { background: none; color: CanvasText; -webkit-text-fill-color: CanvasText; }
  .tl__spark { display: none; }
}
@media print { .tl__spark { display: none; } .timeline::after { scale: 1 1 !important; } }
```

**Specificity note:** `.motion .tl__card[data-reveal].is-pending` (0,4,0) beats T-006's `.motion [data-reveal].is-pending` (0,3,0). Cards slide toward the line instead of rising. Nodes and years never move.

### 6.6 JS `73-timeline.js` (≤ 1,250 bytes)
1. **Gate:** `.motion`; `tl = document.querySelector('.tl')`; `list = tl && tl.querySelector('.timeline')`. Return if missing.
2. `items = [...list.querySelectorAll('.tl__item')]`; `nodes = items.map(i => i.querySelector('.tl__node'))`.
3. `measure()`: `H = list.offsetHeight`; `ys[i] = items[i].offsetTop + nodes[i].offsetTop + nodes[i].offsetHeight / 2`. The list is `position: relative`, so `li.offsetTop` is list-relative.
4. **Init:**
   - `r = list.getBoundingClientRect()`. If `r.bottom < innerHeight * .6` (already scrolled past, e.g. deep link below), return and leave everything drawn and lit.
   - Else: `tl.classList.add('is-drawing')`, `measure()`, `p = 0`, then `frame()`.
5. **`frame()`** (rAF-throttled through a passive `scroll` listener; also on `resize` after `measure()`):
   - `q = clamp((innerHeight * .6 - list.getBoundingClientRect().top) / H, 0, 1)`; `p = Math.max(p, q)`. The draw is monotonic: it never retracts.
   - `tl.style.setProperty('--tl-p', p.toFixed(4))`; `tl.style.setProperty('--tl-y', (p * H).toFixed(1) + 'px')`.
   - For each item not yet lit with `p * H >= ys[i] - 2`: `classList.add('is-lit')` (pop + ripple, once).
   - When `p === 1`: add `is-done`, remove the scroll/resize listeners.
6. **`finish()`** sets `p = 1` and runs `frame()`. It is called on `focusin` inside `.tl` (keyboard users never see unlit nodes next to focused content) and on `beforeprint`.
7. The draw is scroll-linked, so the motion toggle doesn't pause it. The CSS pauses the "now" pulse.

### 6.7 States
| State | Behaviour |
|---|---|
| No JS / reduced motion | Line fully drawn (`--tl-p` defaults to 1), all nodes lit, no spark, no pulse, cards static and visible. |
| Before the user reaches it | Line collapsed, nodes are unlit outlines, cards pending (T-007 reveal with its 1.5s watchdog). |
| Drawing | Spark rides the tip. Nodes pop with a ripple as the tip passes. Cards slide in toward the line. |
| Done | Spark fades. The last node pulses ("now") until paused or offscreen. |
| Deep link `#timeline` | Drawing starts from the top segment that is visible. Content is never hidden. |
| Empty | Not possible: validation fails the build on an empty `timeline`. |
| One item | Short line, one node. Desktop shows the card on the left. |
| Long content | Titles balance-wrap and text is capped at 60ch. Very tall cards are fine (the overlap maths only needs ≥ 104px). |
| Same year twice | Second year visually hidden but still read. The node aligns with the card top. |
| Link present | `.text-link` with arrow, opens in a new tab with the "(opens in new tab)" vh text. Target ≥ 44px. |
| Error / permission-denied / loading | Not applicable (static content). |
| Forced colours / print | Solid line and nodes. No spark. Print shows the line fully drawn. |

**Contrast (computed):**
- Kind chips:
  - company: `--brand` on `--nav-sel`, 5.8 / 5.8
  - client: `--fg2` on `--surface-soft`, 7.3 / 5.8
  - open source: `--cyan-text` on `--cyan-soft`, 7.4 / 5.4
  - milestone: `--crown` on `--brand-tint`, dark ≈ 8.0, light ≈ 5.7
- Year gradient: approved `--grad-accent` stops, large text.
- Unlit node outline: `--border-strong` vs surface ≥ 3:1.

### 6.8 Tests (`test/timeline.test.mjs`)
- `validateContent` rejects each of these: missing/empty `timeline`, bad kind, bad year, `http://` link, link object without a label.
- It accepts both link shapes, and warns on out-of-order years.
- Built HTML:
  - `#timeline` sits between `#experience` and `#skills`.
  - The nav has `#timeline` after `#about`.
  - The index pills read `01`…`08` in order.
  - One `.tl__item` per item with `tl__item--{kind}`.
  - `<time>` has `datetime` only for 4-digit years.
  - The repeated year carries `vh`.
  - Every `.tl__node` and `.tl__spark` is `aria-hidden="true"`.
  - Links have `target="_blank" rel="noopener noreferrer"` (as `external()`).
- `50-scrollspy.js` contains `timeline:'timeline'` (any quoting).
- `73-timeline.js` ≤ 1,250 bytes. vm smoke test passes.

---

## 7. W-5: "Shift and rhythm" (CSS only, no JS)

**Files:**
- `src/render/sections.mjs` (`renderSkills` only)
- new `src/styles/43-hero-wow.css`
- new `src/styles/56-marquee.css`
- new `test/wow-css.test.mjs`

### 7.1 S-mark "shift" on hover (`43-hero-wow.css`)
Hovering the mark pulls it apart along the logo's own diagonal (the "shift"), opens the `</>`, and raises the glow. It is composed with T-007's `--px`/`--py` parallax, so the two never fight.
```css
@property --shift { syntax: '<number>'; inherits: true; initial-value: 0; }
.sc-hero { transition: --shift 520ms var(--ease-spring); }
.sc-hero .sc-part--hook-top    { transform: translate(calc(var(--px) * 10px + var(--shift) * 14px), calc(var(--py) * 10px - var(--shift) * 14px)); }
.sc-hero .sc-part--hook-bottom { transform: translate(calc(var(--px) * -10px - var(--shift) * 14px), calc(var(--py) * -10px + var(--shift) * 14px)); }
.sc-hero .sc-part--lt    { transform: translateX(calc(var(--shift) * -6px)); }
.sc-hero .sc-part--gt    { transform: translateX(calc(var(--shift) * 6px)); }
.sc-hero .sc-part--slash { transform: rotate(calc(var(--shift) * 12deg)); }
.sc-hero__glow { opacity: calc(.75 + var(--shift) * .25); scale: calc(1 + var(--shift) * .08); }
@media (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) {
  .motion .sc-hero:hover { --shift: 1; }
}
```
- `.sc-hero` receives the hover: its children are `pointer-events: none`, but the box itself is not.
- The `transform` goes on the `<g class="sc-part">` groups. The entrance/drift keyframes run on the child `path`s (T-009), so they compose.
- This file sorts after `40-hero.css`, so the equal-specificity rules here win.

### 7.2 Hero mark recedes on scroll (`43-hero-wow.css`, scroll-driven, progressive)
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    @keyframes hero-exit { to { translate: 0 -10%; scale: .84; opacity: .2; } }
    .motion .sc-hero { animation: hero-exit linear both; animation-timeline: view(); animation-range: exit 0% exit 100%; }
  }
}
```
- Only the mark moves; text never gets parallax.
- Browsers without scroll-driven animations (e.g. Firefox today) show nothing different.
- `.sc-hero` itself has no other animation (T-009 animates its children), so the shorthand is safe.

### 7.3 Stack marquee (`renderSkills` + `56-marquee.css`)
**Markup.** It goes between the section head and `<div class="skills">`, inside `renderSkills`:
```html
<div class="marquee" aria-hidden="true">
  <div class="marquee__row marquee__row--a"><ul class="marquee__list">{A}</ul><ul class="marquee__list">{A}</ul></div>
  <div class="marquee__row marquee__row--b"><ul class="marquee__list">{B}</ul><ul class="marquee__list">{B}</ul></div>
</div>
```
`items` = all `c.skills[*].items` flattened in order and de-duplicated. `A` = items at even indices, `B` = items at odd indices, each as `<li>{esc(item)}</li>`. The whole block is `aria-hidden`, because the same items are listed accessibly in the skill groups right below it. No links, nothing focusable.

The `section()` helper renders the head and then `body`, so `renderSkills` passes `marquee + '<div class="skills">…'` as the body.

**CSS (`56-marquee.css`, complete):**
```css
#skills { overflow-x: clip; }
.marquee { display: none; }
@media (prefers-reduced-motion: no-preference) {
  .js .marquee { display: grid; gap: 14px; margin-inline: calc(50% - 50vw); margin-block: 0 var(--space-7); padding-block: 18px; rotate: -1.5deg;
    content-visibility: auto; contain-intrinsic-size: auto 150px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
  .marquee__row { display: flex; width: max-content; animation: marquee 64s linear infinite; }
  .marquee__row--b { animation-duration: 78s; animation-direction: reverse; }
  .marquee__list { display: flex; flex-shrink: 0; }
  .marquee__list li { display: inline-flex; align-items: center; gap: 18px; padding-inline-end: 18px; white-space: nowrap;
    font: 600 clamp(1.375rem, 1rem + 1.8vw, 2.5rem)/1.2 var(--font-display); letter-spacing: -.01em; color: var(--fg2); }
  .marquee__list li::before { content: "/"; color: var(--brand); font-weight: 700; }
  .marquee__row--b li { color: transparent; -webkit-text-stroke: 1px var(--border-strong); }
  @keyframes marquee { to { translate: -50% 0; } }
  .marquee:hover .marquee__row, .motion-paused .marquee__row { animation-play-state: paused; }
}
@media print, (forced-colors: active) { .marquee { display: none !important; } }
```

Why the gates are what they are:
- The marquee is gated on `.js`, not `.motion`. `.js` is set before first paint by the inline script, so the marquee never pops in later (no CLS).
- If `site.js` fails, it still loops, and it can be paused by hover.
- With JS, the hero motion toggle pauses it (WCAG 2.2.2).
- `content-visibility: auto` stops rendering, and so stops animation work, while it is offscreen.
- The −50% translate is seamless because both lists are identical, including the trailing padding.
- RTL: `translate: -50%` still loops correctly. The direction is purely decorative.

### 7.4 States (W-5)
| State | Behaviour |
|---|---|
| No JS | No hover shift, no exit animation, no marquee. The skill groups carry the content. |
| Reduced motion | Same as no JS. |
| Touch | No hover shift. The marquee runs (CSS) and can be paused by the toggle. The hero exit runs in supporting browsers (scroll-linked, user-driven). |
| Paused | Marquee frozen. The shift (hover) still responds, because it is direct feedback, not a loop. |
| Long content | The marquee handles any item length (nowrap, its own row). |

### 7.5 Tests (`test/wow-css.test.mjs`)
- Built HTML: `#skills .marquee[aria-hidden="true"]` exists with 2 rows × 2 identical lists. Row A plus row B contains every unique skill exactly once (per copy). No `<a>` or `button` inside.
- CSS contains `@property --shift`, `@supports (animation-timeline: view())`, the `marquee` keyframes inside `no-preference`, and `.motion-paused .marquee__row`.

---

## 8. Ticket split, order and file ownership

| Chunk | Size | Depends on | Owns (only these files) | JS cap |
|---|---|---|---|---|
| **W-1** Signal field | M | T-007 merged | `hero.mjs`, `41-field.css`, `70-field.js`, `test/wow-field.test.mjs`, site.js cap line in `test/scripts.test.mjs` | 4,096 |
| **W-2** Compile type | S | W-1 (cap) | `71-decode.js`, `42-type.css`, `test/wow-type.test.mjs` | 1,800 |
| **W-3** Live cards | S | W-1 (cap) | `72-spot.js`, `61-cards-live.css`, `test/wow-cards.test.mjs` | 900 |
| **W-4** Journey timeline | M | W-1 (cap), PO's `.company/timeline.json` | `content.json`, `validate.mjs`, `sections.mjs` (`renderTimeline` + indices), `build.mjs`, `50-scrollspy.js`, `30-header.css`, `55-timeline.css`, `73-timeline.js`, `test/timeline.test.mjs` | 1,250 |
| **W-5** Shift and rhythm | S | W-4 (both edit `sections.mjs`) | `sections.mjs` (`renderSkills` only), `43-hero-wow.css`, `56-marquee.css`, `test/wow-css.test.mjs` | 0 |

Order: **W-1 → (W-2 ∥ W-3 ∥ W-4) → W-5.** W-2 and W-3 touch disjoint files. W-4 waits only for the content.

Every chunk runs only its affected tests (`node --test test/<own>.test.mjs test/scripts.test.mjs test/build.test.mjs`) plus `npm run build` and `npm run check:confidential`. The lead runs the full suite plus the Lighthouse/axe eyes-on once at the gate.

**Eyes-on checklist at the gate (both themes, 360 / 768 / 1280px, mouse and touch emulation, OS reduced motion on and off):**
- 60fps in the hero with the constellation (DevTools performance, 4× CPU throttle → the adaptive drop kicks in, no jank).
- Pause toggle freezes all five loops.
- Tab hidden → no rAF (Performance panel).
- Timeline draws, lights, slides, and is static under reduced motion.
- Card spotlight and rim work. No keyboard regressions.
- Lighthouse mobile perf ≥ 90, CLS ≤ 0.05.
- axe has no new violations.

---

## 9. Responsive and RTL summary

| Breakpoint | W-1 | W-2 | W-3 | W-4 | W-5 |
|---|---|---|---|---|---|
| < 768 | Coarse profile when touch | Hero/index decode; no nav-hover decode | Rim on focus only (touch) | Single column, line on the left (x=14px), cards slide from the right | Marquee full-bleed; no hover shift on touch |
| 768–1023 | Same as above, per pointer | + nav-hover decode (mouse) | Spotlight with mouse | Single column, line at 20px, padding 56px; nav links compact | Same |
| ≥ 1024 | Fine profile (mouse) | Same | Same | Centre line, alternating cards, big years on the opposite side, connectors | Same + logo hover shift |

RTL: the site is English-only (`lang="en"`). All new CSS uses logical properties. The timeline slide directions and the desktop column order flip under `[dir="rtl"]`. The spotlight intentionally uses physical `left/top` because pointer coordinates are physical. The marquee direction is decorative.

## 10. Accessibility (WCAG 2.1 AA)
- **2.2.2 Pause, Stop, Hide:** every loop longer than 5s (canvas, name flow, marquee, rim spin, "now" pulse) pauses with the existing hero toggle. The marquee also pauses on hover, and stops rendering offscreen.
- **2.3.3 / reduced motion:** everything is off or static under `prefers-reduced-motion: reduce`. Only state changes that carry meaning remain: rim opacity on focus, and the drawn timeline.
- **1.3.1 / 4.1.2:**
  - Decode overlays and the marquee are `aria-hidden`, and the real text stays in the tree.
  - Timeline items are an `<ol>` of `<li>`, with `<time>`, an `<article>` labelled by its `<h3>`, and real links with new-tab text.
  - No heading levels are skipped: h2 → h3.
- **1.4.3 / 1.4.11:** contrast is computed in §5.3 and §6.7. The gradient stops reuse the approved sets. Decorative layers (spotlight, canvas) never drop text below 4.5:1.
- **2.4.3 focus order** is unchanged; timeline links follow DOM order. **2.4.7:** the existing `:focus-visible` ring is untouched. Cards show the rim on `:focus-within`.
- **2.5.5-style targets:** timeline links (`.text-link`) and nav links are ≥ 44px high.
- Forced colours: all decorative layers are hidden or set to system colours.

---

## Assumptions (decided by the designer; to be logged in STATUS.md by the lead)
1. Five chunks instead of 3–4, because the owner's timeline request is a first-class chunk (W-4). The other four effects were chosen from the brief's menu. Film grain, section dividers, the letter-by-letter shimmer, heading parallax and a separate experience-line draw were dropped (reasons in §0).
2. The Journey section sits after Experience and before Stack. Indices are renumbered 01–08, and the nav label "Journey" is inserted after "About". At 768–1023px the nav links get compact padding so 6 links fit.
3. Default intro copy for the timeline is "The journey so far" with a factual lead (2016 GitHub start and the ShiftCodes founding, both already public in `content.json`). The PO's file overrides it.
4. Timeline `link` accepts a URL string or `{href, label}`, because the PO's exact shape for `link?` is not yet fixed. `year` accepts an integer or a range string.
5. The line draw is monotonic (it never retracts on scroll-up), so it reads as an authored moment rather than a scrubber. It is JS-driven in all browsers rather than CSS scroll-timelines, so the node lighting syncs exactly and Firefox gets it too.
6. The constellation is confined to the hero (not the full page). It starts 700ms after `load`, so it stays out of LCP/TBT. It adapts or disables itself on slow devices.
7. The cursor spotlight respects the motion toggle, consistent with T-007's cursor glow.
8. The marquee is gated on `.js` (set before paint) rather than `.motion`, to avoid layout shift.
9. The `site.js` cap rises to 24,192 bytes (16,000 + 8,192). If T-007 lands over 16,000, the lead re-bases as B + 8,192.
10. The new CSS lives in per-chunk partials (`41-`, `42-`, `43-`, `55-`, `56-`, `61-`), so chunks never edit the same stylesheet. Filename order gives the right cascade.
