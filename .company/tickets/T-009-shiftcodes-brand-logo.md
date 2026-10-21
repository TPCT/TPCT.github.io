# T-009 — ShiftCodes brand colours + animated ShiftCodes logo replaces the prism

## Why (owner decision, 2026-10-21)
The owner wants (1) the palette taken from the **ShiftCodes logo**, (2) the hero "prism" visual replaced by the **ShiftCodes logo mark itself, animated and moving**, (3) mouse-driven animation (pointer parts go to T-007). Everything else in `.company/ux-prism.md` stays (layout, plates, glass, fonts, motion system, a11y).

Source artwork: `src/images/brand/shiftcodes-logo-source.jpg` (959×777, light background). The mark is a violet **S built from two angular hook shapes** (top hook opening right/down, bottom hook opening left/up, rotationally symmetric) with a **`</>` code glyph** in the middle; below it the wordmark "shift" (white/outlined) + "codes" (violet). Brand violet sampled from the art: **#6E2BFB** (range #6B41FB → #702CFB, a slight blue-violet → violet gradient).

## Part A — Vector logo (dev-only script + committed SVG)
1. `scripts/trace-logo.py` (dev-only, Python 3 + Pillow only; run with `python3 -I`): threshold the violet pixels of the S mark (exclude the wordmark: only rows above the wordmark, y < ~560), find the outer contours of each connected component (marching squares), simplify with Douglas–Peucker (tolerance ≈ 1.5px), and emit **one SVG** `src/images/brand/shiftcodes-mark.svg` with `viewBox` tight around the mark and **separate elements**: `<path id="sc-hook-top">`, `<path id="sc-hook-bottom">`, and the glyph as three paths `#sc-lt`, `#sc-slash`, `#sc-gt`. Straight edges must stay straight (no wobble); corners crisp. No embedded raster, no absolute paths, no fonts.
2. Fidelity check (in the script, printed): rasterise is not available without deps, so instead compare the polygon area of each component with its pixel count — each within ±3%. Report the numbers.
3. The traced path data is then used by the renderer: add `src/lib/logo.mjs` exporting `logoMark({ idPrefix, className, title })` that returns the inline SVG string (same 5 paths, `fill="url(#<idPrefix>-grad)"` with a `<linearGradient>` from `var(--logo-a)` to `var(--logo-b)` via `stop-color` in CSS classes, not inline style — CSP forbids `style=""`), `aria-hidden="true"` unless a title is given.

## Part B — Palette from the logo (token values only; keep token names)
Edit `src/styles/01-tokens.css`. Replace the berry/pink/cyan values; keep every token name so the rest of the CSS keeps working. Values (contrast pre-computed, all ≥ AA):

**Dark (default, `:root, [data-theme="dark"]`)**
- `--canvas: #110D1F`; `--field-a: #2A1A55; --field-b: #1B2150; --field-c: #160F2A; --field-d: #0D0A18`; `--blob-a: #3B1E86; --blob-b: #1E2A6E`
- `--surface: #1E1832; --surface-raised: #261F3D; --surface-soft: #2E2649; --plate-opaque: #1E1832`
- `--plate: linear-gradient(145deg, rgb(36 29 61 / .90), rgb(26 21 46 / .86))`; `--shell: linear-gradient(135deg, rgb(34 27 58 / .88), rgb(24 19 42 / .84))`; `--plate-brand: linear-gradient(140deg, #2B1D57, #1F1840)`; `--plate-cyan: linear-gradient(140deg, #1D2353, #181C40)`
- `--rim: rgb(220 208 255 / .22)`; in shadows replace `rgb(242 153 196 / .14)` with `rgb(110 43 251 / .28)`
- `--fg: #F3F0FF; --fg2: #CEC6E8; --muted: #ABA1CC` (13.9–17 / 9.6–11.7 / 6.5–7.9 :1)
- `--border: #3A3160; --border-soft: #2D2650; --border-strong: #9D93C2`
- `--brand: #B9A2FF; --brand-hover: #C9B8FF; --brand-pressed: #A98BFF` (≥ 7.2:1 on all dark surfaces)
- `--brand-tint: #2A1F55; --nav-sel: #33266A; --brand-line: #5B45A8`
- `--primary-skin: linear-gradient(165deg, #7B3FFF, #5A1FE0)`; `--primary-skin-hover: linear-gradient(165deg, #8A55FF, #6328F0)`; `--on-primary: #FFFFFF` (5.25–7.76:1); `--primary-glow: 0 10px 28px -8px rgb(110 43 251 / .6)`; `--btn-glow: rgb(255 255 255 / .22)`; `--count-on-primary: rgb(255 255 255 / .18)`
- `--cyan: #8FA0FF; --cyan-text: #8FA0FF; --cyan-soft: #1D2353; --cyan-line: #3B4794` (secondary = the logo's blue-violet end; ≥ 6.4:1)
- `--crown: #C9B8FF`
- Logo art: `--logo-a: #8A5BFF; --logo-b: #6E2BFB; --logo-c: #5A1FE0`; keep `--prism-1..4` but set to `#B9A2FF, #8A5BFF, #6E2BFB, #8FA0FF`; `--glow-a: rgb(110 43 251 / .45); --glow-b: rgb(143 160 255 / .28)`
- `--grad-name` / `--grad-accent`: `linear-gradient(100deg, #C9B8FF 0%, #8A5BFF 50%, #8FA0FF 100%)`
- `--focus: #9EA8FF`; `--selection-bg: #6E2BFB; --selection-fg: #FFFFFF`

**Light (`[data-theme="light"]`)**
- `--canvas: #EEEBFA`; `--field-a: #E4DAFF; --field-b: #DCE2FF; --field-c: #F3F0FD; --field-d: #E7E3F7`; `--blob-a: #D9C9FF; --blob-b: #CCD6FF`
- `--surface: #FCFBFF; --surface-raised: #F5F2FE; --surface-soft: #EAE5FA; --plate-opaque: #FCFBFF`; `--plate-brand: linear-gradient(140deg, #F4EEFF, #E4DAFF)`; `--plate-cyan: linear-gradient(140deg, #F1F3FF, #DFE5FF)`
- in shadows replace `rgb(168 18 90 / .08)` with `rgb(110 43 251 / .12)` and the mauve shadow tints `157 139 183` / `86 65 125` / `77 56 112` with `140 125 200` / `70 45 160` / `60 40 130`
- `--fg: #1C1530; --fg2: #4A4266; --muted: #5A5275`
- `--border: #D8D1F0; --border-soft: #E5E0F7; --border-strong: #7D73A3`
- `--brand: #5B21E6; --brand-hover: #4F1BC8; --brand-pressed: #4317AD`; `--brand-tint: #F1EBFF; --nav-sel: #E6DBFF; --brand-line: #C7B5FF`
- `--primary-skin: linear-gradient(165deg, #7B3FFF, #5A1FE0)`; hover `linear-gradient(165deg, #6E2BFB, #4F1BC8)`; `--on-primary: #FFFFFF`; `--primary-glow: 0 10px 26px -8px rgb(110 43 251 / .45)`; `--btn-glow: rgb(255 255 255 / .12)`
- `--cyan: #3346C4; --cyan-text: #3346C4; --cyan-soft: #E6EAFF; --cyan-line: #AFBAF5`; `--crown: #6E2BFB`
- `--logo-a: #7B3FFF; --logo-b: #6E2BFB; --logo-c: #5A1FE0`; `--prism-1..4: #8A5BFF, #6E2BFB, #5A1FE0, #3346C4`; `--glow-a: rgb(110 43 251 / .28); --glow-b: rgb(51 70 196 / .18)`
- `--grad-name` / `--grad-accent`: `linear-gradient(100deg, #6E2BFB 0%, #5A1FE0 55%, #3346C4 100%)`
- `--focus: #3346C4`; `--selection-bg: #6E2BFB; --selection-fg: #FFFFFF`

Theme colours in `src/content.json` (`themeColorDark` / `themeColorLight`) and `THEME_SCRIPT`: `#110D1F` / `#EEEBFA` (update the tests that pin the old values; this is an intended change). Grep the CSS for any remaining literal pink/berry/cyan colours (`F299C4`, `A8125A`, `EC8DBB`, `7FD3E3`, `157E95`, `242 153 196`, `168 18 90`, `127 211 227`) and route them through tokens.

## Part C — Hero: animated ShiftCodes logo replaces the prism
In `src/render/hero.mjs` replace the `.prism` block with:
```
<div class="sc-hero" aria-hidden="true">
  <span class="sc-hero__halo"></span>        <!-- slowly rotating conic glass ring -->
  <span class="sc-hero__glow"></span>
  <div class="sc-hero__mark">${logoMark({ idPrefix: 'hero', className: 'sc-mark' })}</div>
  <span class="sc-hero__shard sc-hero__shard--1"></span><span class="sc-hero__shard sc-hero__shard--2"></span><span class="sc-hero__shard sc-hero__shard--3"></span>
  <span class="sc-hero__shadow"></span>
</div>
```
Keep the motion toggle and `.schematic` exactly as they are. Rename the prism CSS in `src/styles/40-hero.css` to `.sc-hero*` (keep shard/glow/shadow/halo looks from the prism spec, recoloured via tokens). The mark is ~min(420px, 80%) wide on desktop, ~240px on mobile; glass halo behind it (frosted circle + conic ring of `--logo-a/--cyan/--logo-c` at low alpha).

Animation (CSS only here; all inside `@media (prefers-reduced-motion: no-preference)` and gated on `.js` so the logo is fully visible at rest/no-JS; transforms + opacity only; use `transform-box: fill-box; transform-origin: center` on SVG parts):
1. **Assemble on load** (after the h1 words, start ≈ 350ms): `#…hook-top` from `translate(48px,-40px) rotate(-8deg)`, opacity 0 → rest, 900ms `var(--ease-spring)`; `#…hook-bottom` mirrored from `translate(-48px,40px) rotate(-8deg)`, +120ms; then `<` from `translateX(14px)` and `>` from `translateX(-14px)` (opacity 0→1, 420ms, +600ms), `/` drops from `translateY(-12px)` (+700ms); finally one "shift" pulse: the two hooks slide 6px apart and back (500ms, +1100ms).
2. **Idle loop** (starts after assembly, pausable by the motion toggle via the existing paused-state class): hooks drift in opposite directions `translate(±5px, ∓4px)` 7s ease-in-out infinite alternate (the "shift"); the `/` glyph fades 1→.55→1 every 2.4s like a cursor; a light sheen sweeps across the mark every 6s (an overlay gradient band in a `mask`/`clipPath` of the mark paths, moved with `transform: translateX`); halo ring rotates 360° in 28s linear; shards float as in the prism spec.
3. Expose CSS custom properties `--px` / `--py` (default 0) on `.sc-hero` that offset the hooks in opposite directions (`translate(calc(var(--px) * 10px), calc(var(--py) * 10px))` for top, negative for bottom) and tilt `.sc-hero__mark` (`rotateX(calc(var(--py) * -8deg)) rotateY(calc(var(--px) * 8deg))`, `perspective: 900px` on parent). T-007's pointer JS will set these; with JS off they stay 0.

## Part D — Brand mark everywhere
- Header `.brand`: replace the empty `<span aria-hidden="true">` with `logoMark({ idPrefix: 'hdr', className: 'brand__mark' })` at 26px height; on `.brand:hover` / `:focus-visible` (no-preference only) the two hooks shift 2px apart and back (300ms). Brand text stays `site.shortTitle`.
- Footer and 404: wherever the prism motif is reused (ux-prism.md "reused as header mark, footer, 404, empty state"), use `logoMark` instead (404: a large mark with the hooks gently drifting).
- Experience blocker from review `.company/reviews/T-006-T-008-r1.md`: add `align-self: start;` to `.exp__loc` in `src/styles/50-sections.css`.
- Non-blocking from the same review: at 375px the contact email must not break mid-word — use `overflow-wrap: anywhere` only after the `@`: wrap the domain part in a `<span class="email__domain">` so the break happens before `@` (render as `local<wbr>@domain`).

## Out of scope
Pointer/mouse JS (T-007), favicons + OG image (T-008b, will reuse `shiftcodes-mark.svg`).

## Acceptance
- `src/images/brand/shiftcodes-mark.svg` exists, 5 paths with the ids above, area check within ±3%, no `style=` attributes, no absolute paths.
- No literal old brand colours remain in `src/styles/` (grep list above → 0 hits).
- Hero has `.sc-hero` with the inline mark (5 paths) and no `.prism`; header brand has the mark; 404 uses the mark.
- `[hidden]{display:none!important}` still present; backdrop-filter budget ≤ 3; no `style="` in output HTML; CSP unchanged.
- With JS disabled / reduced motion: the full logo is visible and static.
- `.exp__loc` has `align-self: start`.

## Tests (update/add)
- `test/build.test.mjs`: hero contains `class="sc-hero"` and 5 `<path` with ids `hero-sc-hook-top`, `hero-sc-hook-bottom`, `hero-sc-lt`, `hero-sc-slash`, `hero-sc-gt` (or whatever id scheme you choose — assert it); no `class="prism"`; header contains `brand__mark`; theme colours `#110D1F` / `#EEEBFA`.
- New `test/brand.test.mjs`: SVG file checks above; CSS contains none of the old colour literals; CSS contains `--logo-b: #6E2BFB`.
- Adjust existing assertions that pin the prism markup/old colours (intended change); don't weaken unrelated ones.

## Commands
`python3 -I scripts/trace-logo.py`; `npm run build`; `node --test test/build.test.mjs test/brand.test.mjs test/sections.test.mjs test/seo.test.mjs test/content.test.mjs`; `npm run check:confidential`. Do a quick visual check of the hero at 1440 and 375 in both themes with the local Chromium (see T-003 ticket for `PLAYWRIGHT_CORE` / `CHROME_PATH`) and compare the mark against the source JPG.

## Constraints
No commit/push. No `.company/` edits. CSP self-only (no inline `style=`). Transform/opacity animations only; everything respects `prefers-reduced-motion`; content visible at rest without JS.
