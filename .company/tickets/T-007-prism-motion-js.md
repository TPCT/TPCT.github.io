# T-007: Prism motion JS: 60-motion.js, 61-pointer.js, filter FLIP, theme reveal, motion toggle
Size: M   Depends on: T-005   Stories: US-14 (motion), US-13 (theme reveal), US-08 (filter transitions)
Parallel: yes with T-006 and T-008 after T-005 lands (disjoint files). Reveals only become visible on the page once T-006's `data-reveal` markup is in; this ticket's code must work whether or not those hooks exist.

## Context
Goal: add the orchestrated motion layer of `.company/ux-prism.md` §5 in plain browser JS. All CSS that this JS drives already exists after T-005 (`15-motion.css`, `20-components.css`, `30-header.css`, `40-hero.css`) or is added by T-006 (`.card.is-tilt`, `.card.is-entering`, `.process.is-pending`). This ticket writes **JS only**.

What exists today: `src/scripts/*.js` are IIFEs with `"use strict"`, concatenated by filename into `dist/assets/site.js` (order: `10-theme`, `20-nav`, `30-filter`, `40-copy`, `50-scrollspy`, then the new `60-motion`, `61-pointer`). The inline head script swaps `no-js` → `js` on `<html>` before paint. No bundler, no minifier, no dependencies. Both `/` and `/404.html` load the same bundle, so every module must no-op when its hooks are missing. Hooks rendered by T-005: `.site-header`, `.hero .prism` (children `.prism__*`), `button.motion-toggle[hidden]` with `data-label-pause` / `data-label-play`, `.stats .stat__value`, `.btn--primary`, `.theme-toggle`.

Spec (normative, read fully first): `ux-prism.md` §2 (flows), §5.1 (gating, performance, budget), §5.4 (reveal JS, exact), §5.5 (count-up, exact), §5.6 (filter transitions, exact), §5.7 (tilt JS), §5.9 (magnet, theme reveal), §5.10 (header plate), §5.11 (parallax, offscreen pause), §5.12 (module boundaries and order), §9 (a11y). Architecture: `.company/architecture.md` §5 and §13.

## Task
1. **New `src/scripts/60-motion.js`** (IIFE, `"use strict"`), sections in this order (§5.12; (b) must run before (c)):
   - (a) Header: `const header = document.querySelector('.site-header')`; if present, a passive `scroll` listener, rAF-throttled (one pending frame), runs `header.classList.toggle('is-scrolled', window.scrollY > 12)`; also run once at init. This part runs even under reduced motion.
   - Then `return` if `matchMedia('(prefers-reduced-motion: reduce)').matches` or `!('IntersectionObserver' in window)`.
   - (b) Motion toggle `.motion-toggle` (if present): read `localStorage.getItem('motion')` in `try {} catch {}`; if `'paused'` add `motion-paused` to `<html>`. `apply(paused)` sets `aria-label` and `title` to `dataset.labelPlay` when paused, `dataset.labelPause` when playing. Set `hidden = false`. On click: toggle `motion-paused` on `<html>`, `apply()`, then `try { localStorage.setItem('motion', paused ? 'paused' : 'running'); } catch {}`. No `aria-pressed`.
   - (c) `document.documentElement.classList.add('motion')`.
   - (d) Scroll reveal: §5.4 "JS behaviour" steps 1–7 exactly (threshold `innerHeight * 0.92`; one IO `{ rootMargin: '0px 0px -8% 0px', threshold: 0.12 }`; per callback batch, intersecting entries in order get delay `Math.min(k, 6) * 70` ms; reveal = `el.style.setProperty('--rd', delay + 'ms')`, add `is-revealing`, remove `is-pending`, `unobserve`, then after `1400 + delay` ms remove `is-revealing` and `el.style.removeProperty('--rd')`; 1500ms watchdog reveals all pending if the IO callback never ran; `focusin` on `document` reveals `e.target.closest('.is-pending')` with delay 0; `beforeprint` reveals all). Skip entirely if there are no `[data-reveal]` elements.
   - (e) Count-up for `.stats .stat__value`: §5.5 exactly. Parse `/^(\D*)(\d+)(.*)$/`; start `end >= 1000 ? end - 10 : 0`; 1400ms easeOutExpo `t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)`, `Math.round`; 120ms stagger per stat index. At init: `r = stats.getBoundingClientRect()`, `visibleNow = r.top < innerHeight && r.bottom > 0`. If `visibleNow && performance.now() > 900` → skip (leave final values). Else if `visibleNow` → start after `Math.max(0, 900 - performance.now())` ms. Else observe `.stats` with its own IO `{ threshold: 0.5 }`, start on first intersect, then `disconnect`. Before animating each value: `el.style.minWidth = el.offsetWidth + 'px'`, then replace children with `<span aria-hidden="true">{animated}</span><span class="vh">{original text}</span>` built with `document.createElement` + `textContent` (never `innerHTML`). Animate by writing only the first span's `textContent` (`prefix + n + suffix`) per rAF; final frame writes the end value.
   - (f) Hero offscreen pause: if `.hero .prism` exists, an IO on `.hero` with `{ threshold: 0 }` toggles `prism.classList.toggle('is-idle', !entry.isIntersecting)`.
2. **New `src/scripts/61-pointer.js`** (IIFE, `"use strict"`): `return` unless `matchMedia('(hover: hover) and (pointer: fine)').matches` and not reduced motion. Each feature has its own single pending rAF id. `const wide = () => matchMedia('(min-width: 1024px)').matches` (checked at event time).
   - Tilt (§5.7 JS): delegated `pointermove` on `#project-list` (if present). `card = e.target.closest('.card')`. If `!wide()` do nothing. When the card changes: reset the previous (remove `is-tracking`, `removeProperty('--rx')`, `removeProperty('--ry')`, then after 600ms remove `is-tilt` unless it is the current card again), add `is-tilt is-tracking` to the new one and cache its rect. Re-measure the cached rect on a passive `scroll` listener. Per rAF: `x = (clientX - left) / width - .5`, `y = (clientY - top) / height - .5`; `--ry = (x * 8).toFixed(2) + 'deg'`, `--rx = (-y * 6).toFixed(2) + 'deg'`. `pointerleave` on `#project-list` resets the current card the same way.
   - Magnet (§5.9): for each `document.querySelectorAll('.btn--primary:not(.skip)')`: `pointerenter` → add `is-magnet`, cache the rect; `pointermove` (rAF) → `dx = clientX - (left + width / 2)`, `dy = clientY - (top + height / 2)`; set `--mx = clamp(dx * .22, -6, 6) + 'px'`, `--my = clamp(dy * .35, -4, 4) + 'px'`, `--gx = dx + 'px'`, `--gy = dy + 'px'` (round to 2 decimals); `pointerleave` → remove `is-magnet` and the 4 properties.
   - Parallax (§5.11): if `.hero` and `.hero .prism` exist: on `pointerenter` of `.hero` and on passive `scroll`, cache the hero rect and the prism centre; `pointermove` on `.hero` (rAF, only if `wide()`): `px = clamp((clientX - prismCX) / (heroRect.width / 2), -1, 1)`, `py = clamp((clientY - prismCY) / (heroRect.height / 2), -1, 1)`; set `--px`/`--py` on `.prism` as unitless strings (`toFixed(3)`). `pointerleave` on `.hero` sets both to `'0'`.
3. **Edit `src/scripts/30-filter.js`** per §5.6 (keep all current behaviour: state, URL canonicalisation, `aria-pressed`, counts, `chip--zero`, live-region rAF announcement, reset button focusing the category "All" chip, `filters.hidden = false`, initial `render(params.has('category') || params.has('kind'))`):
   - Split the card DOM swap out of `render()` into `swap(next, animated)` where `next` is `cards.map(show)` captured at click time. `render()` still updates state-dependent UI (chips, counts, live region, URL) **synchronously**, then either calls `swap(next, false)` or starts the animated path.
   - Animated path only when `document.documentElement.classList.contains('motion')` at click time **and** the initial render has already happened (`let ready = false;` set `true` after the initial `render(...)` call).
   - Leave: cards visible now and hidden in `next` run `el.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: .94 }], { duration: 160, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' })`; keep the Animation objects; `pending = setTimeout(() => swap(next, true), 160)`; if nothing leaves, call `swap(next, true)` immediately.
   - `swap(next, animated)`: if animated, record First rects of currently visible cards (`Map card → DOMRect`); cancel leave animations; apply `hidden` per `next`; toggle `grid.hidden` / `empty.hidden` exactly as today; remove `is-pending` from **all** cards (always, also non-animated); FLIP each card visible before and after with non-zero delta: `el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' })`; entering cards (hidden before, shown now) get `is-entering` and, when animated, `--rd = Math.min(k, 8) * 35 + 'ms'` (k = index among entering cards). Non-animated swap keeps today's `is-entering` toggle without `--rd`.
   - Interrupt: a click while `pending` is set → `clearTimeout(pending)`, run the previous `swap(prevNext, true)` immediately, then start the new transition.
   - Grid `min-height` hold: release after 600ms when animated, 200ms otherwise.
   - `animationend` removes `is-entering` and `--rd` (`style.removeProperty`).
4. **Edit `src/scripts/10-theme.js`** per §5.9 "Theme reveal": in the click handler, `next` as today; if `typeof document.startViewTransition === 'function'` and `!matchMedia('(prefers-reduced-motion: reduce)').matches`: compute the toggle centre and `--vt-x`, `--vt-y`, `--vt-r` on `root.style` exactly as the spec snippet, then `document.startViewTransition(() => update(next))`; else `update(next)`. The `localStorage.setItem('theme', next)` try/catch stays after either path. Nothing else changes.
5. `20-nav.js`, `40-copy.js`, `50-scrollspy.js`: no change.

## Interfaces
- Classes set on `<html>`: `motion` (motion allowed + IO), `motion-paused` (user paused loops). On `.site-header`: `is-scrolled`. On `.prism`: `is-idle`. On `[data-reveal]`: `is-pending`, `is-revealing`. On `.card`: `is-tilt`, `is-tracking`, `is-entering`. On `.btn--primary`: `is-magnet`.
- CSS custom properties (always via `el.style.setProperty` / `removeProperty`): `--rd` (ms), `--rx`/`--ry` (deg), `--mx`/`--my`/`--gx`/`--gy` (px), `--px`/`--py` (unitless −1..1), `--vt-x`/`--vt-y`/`--vt-r` (px, on `<html>`).
- Storage: `localStorage.motion` = `'paused'` | `'running'`; `localStorage.theme` unchanged.
- Budgets (bytes, raw source files; the build does not minify): `60-motion.js` ≤ 3,000; `61-pointer.js` ≤ 1,900; `10-theme.js` ≤ 1,500; `30-filter.js` ≤ 5,000; `dist/assets/site.js` ≤ 16,000. (Decision: §5.1.7's 14,000 total assumed a 7.6 KB base; the real base is ~8.8 KB, see architecture §13.) Write compact but readable code: short local names are fine, no comments longer than one line.

## Constraints
- Do not commit or push. Do not edit anything under `.company/`.
- Files you may change: `src/scripts/10-theme.js`, `src/scripts/30-filter.js`, new `src/scripts/60-motion.js`, new `src/scripts/61-pointer.js`, new `test/scripts.test.mjs`. Nothing else (no CSS, no renderers, no content).
- CSP self-only: no `eval`/`new Function`, no network, no `innerHTML`/`outerHTML`/`insertAdjacentHTML`, never `setAttribute('style', …)` or `style.cssText`; only CSSOM (`el.style.setProperty`, `el.style.minWidth`, `el.style.minHeight`).
- Animations only via CSS classes/custom properties or WAAPI on `opacity`/`transform`/`scale`/`translate` (the theme reveal's `clip-path` lives in CSS on the view-transition snapshot only).
- `prefers-reduced-motion: reduce` → no `.motion` class, no toggle shown, no reveal hiding, no count-up, no FLIP/leave, no tilt/magnet/parallax, no view transition. Header `is-scrolled` still works.
- Content visible at rest and without JS: only elements fully below the fold at init become `is-pending`; the watchdog guarantees reveal; nothing else is hidden by JS. Keep `[hidden]` semantics: toggle visibility only through the `hidden` property (the CSS `[hidden] { display: none !important; }` rule must stay authoritative).
- Each module is an IIFE that returns early when its hooks are absent and must not throw on `/404.html` (no `.hero`, no `#project-list`, no `.stats`, no `.motion-toggle`).
- Passive listeners for `scroll`; one pending rAF per module/feature; never set `will-change`; measure rects on enter/scroll, never per move.
- Never put private brand names from `.company/private/` in any file.

## Acceptance criteria
- [ ] `src/scripts/60-motion.js` and `61-pointer.js` exist, start with `(function () {\n  "use strict";` like the other modules, and pass `node --check`.
- [ ] Byte budgets above hold; `dist/assets/site.js` ≤ 16,000 bytes.
- [ ] No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `cssText`, `setAttribute('style'` / `setAttribute("style"`, `eval(` or `new Function` in `src/scripts/`.
- [ ] Running the built `site.js` in a `node:vm` context with an empty stub DOM (all queries return `null` / `[]`) does not throw, both with reduced motion matching and not matching.
- [ ] With motion allowed and the stub providing `IntersectionObserver`, `<html>` ends up with class `motion`; with reduced motion it does not.
- [ ] `30-filter.js` still updates `aria-pressed`, counts and the live region synchronously; existing `test/projects.test.mjs` passes unchanged.
- [ ] Eyes-on (if a browser is available: `npm run serve`): reveals cascade on scroll, motion toggle pauses loops and persists across reload, theme toggle reveals as a circle in Chromium, filter clicks animate leave/FLIP/enter, cards tilt at ≥1024px with a mouse; with OS reduced motion everything is static. If no browser is available, say so in the report.
- [ ] `npm run build`, the affected tests and `npm run check:confidential` pass.

## Tests
Add `test/scripts.test.mjs` (node:test):
- Build into an `os.tmpdir()` temp dir (cleanup in `t.after`); `Buffer.byteLength(site.js) <= 16000`; per-file byte caps on `src/scripts/60-motion.js` (3000), `61-pointer.js` (1900), `10-theme.js` (1500), `30-filter.js` (5000).
- For every `src/scripts/*.js`: starts with `(function () {\n  "use strict";`; `spawnSync(process.execPath, ['--check', file]).status === 0`; source does not match `/innerHTML|outerHTML|insertAdjacentHTML|cssText|setAttribute\(\s*['"]style|\beval\(|new Function/`.
- vm smoke: `vm.runInNewContext(siteJs, ctx)` where `ctx` is a stub: `document` with `documentElement` (`classList` backed by a `Set` with `add/remove/toggle/contains`, `dataset: { theme: 'dark' }`, `style: { setProperty() {}, removeProperty() {} }`), `querySelector: () => null`, `querySelectorAll: () => []`, `getElementById: () => null`, `addEventListener() {}`; `matchMedia: q => ({ matches: q.includes('reduce') ? reduce : false, addEventListener() {} })`; `IntersectionObserver` class stub with `observe/unobserve/disconnect`; `requestAnimationFrame: () => 0`, `cancelAnimationFrame() {}`, `setTimeout: () => 0`, `clearTimeout() {}`, `performance: { now: () => 0 }`, `localStorage` stub (`getItem: () => null`, `setItem() {}`), `location: { search: '', pathname: '/' }`, `history: { replaceState() {} }`, `navigator: {}`, `innerHeight: 800`, `innerWidth: 1280`, `scrollY: 0`, `addEventListener() {}`; set `ctx.window = ctx`. Run twice (`reduce = true` / `false`): no throw; `<html>` class set contains `motion` only when `reduce === false`.

Commands (only these):
```
npm run build
node --test test/scripts.test.mjs test/projects.test.mjs test/build.test.mjs
npm run check:confidential
```

## Out of scope
- Any CSS (all motion CSS is in T-005 / T-006). If a hook's CSS looks missing, report it; do not add CSS.
- Markup changes (`data-reveal` is T-006; motion toggle markup is T-005).
- OG image, favicons, `render-images.mjs` (T-008).
- `20-nav.js`, `40-copy.js`, `50-scrollspy.js` behaviour.

## Addendum (lead, 2026-10-21) — owner wants mouse-driven animation + the animated ShiftCodes logo (T-009)
T-009 replaced the hero `.prism` with `.sc-hero` (inline ShiftCodes mark: two hook paths + `</>` glyph). Wherever this ticket targets `.prism`, target `.sc-hero` instead. Add to `61-pointer.js` (pointer: fine + no-preference + not paused only; rAF-throttled; transform/opacity only; stops when the hero is offscreen):
1. **Logo parallax/tilt**: on pointermove over the page (not just the hero), set `--px` / `--py` on `.sc-hero` in [-1, 1] (relative to the hero centre, eased with a lerp factor ≈ .12 per frame); T-009's CSS turns those into opposite hook offsets and a 3D tilt. Reset to 0 on pointerleave/blur, easing back.
2. **Cursor glow**: one fixed decorative layer `<div class="cursor-glow" aria-hidden="true">` (add to the layout renderer; `pointer-events: none`; a 480px radial gradient of `--glow-a` → transparent, `mix-blend-mode: screen` in dark / `multiply` in light) that follows the pointer via `transform: translate3d()` with lerp easing; hidden (`opacity: 0`) until the first pointermove; fades out on pointerleave. Not rendered visible on touch devices or reduced motion.
3. **Magnetic primary buttons + card tilt** stay as specified above.
4. **Logo click easter egg**: clicking/tapping the hero mark (or pressing Enter on the header brand is NOT changed) replays the assemble animation (toggle a class to restart the CSS animation). The hero mark is `aria-hidden`, so this is pointer-only and purely decorative.
Tests: `site.js` size cap stays; assert `cursor-glow` element exists with `aria-hidden="true"`; assert `61-pointer.js` references `--px` and `--py` and checks `matchMedia('(pointer: fine)')` and reduced motion.
