# T-015 — Vertical rhythm + section continuity ("one story, not separate blocks")

## Why (owner feedback, 2026-10-21, top priority)
"The space between sections is far too big and every section feels isolated — no connection." Measured: `--section-pad: clamp(72px, 4rem + 5vw, 136px)` is applied as `padding-block` on every `main > section`, so two adjacent sections stack two pads (up to ~272px of empty space), plus `.section-head { margin-block-end: var(--space-7) }`. At 1440 the gap between the About plate and the Experience head is ~300px of nothing.

## Decisions (UX + tech lead)
### 1. Rhythm — halve it and never double it
- `src/styles/01-tokens.css`: `--section-pad: clamp(48px, 2rem + 3vw, 88px);` and add `--section-gap: var(--section-pad)`.
- `src/styles/10-base.css`: replace `main > section:not(.hero) { padding-block: var(--section-pad); }` with `main > section:not(.hero) { padding-block: 0; } main > section:not(.hero) + section, .hero + section { margin-block-start: var(--section-gap); } main > section:last-child { padding-block-end: var(--section-pad); }` so the distance between two sections is ONE pad. Make sure the hero → first section distance is ≈ `var(--section-pad)` too (hero currently has its own bottom spacing: reduce it so the stats strip sits ≤ 64px above the next section head at 1440).
- `.section-head` gap to its content: `margin-block-end: var(--space-6)` (32px) on desktop, `var(--space-5)` on < 768px. `#about .section-head__index` same.
- Footer: `margin-block-start: var(--section-pad)`.
- Acceptance: at 1440, from the bottom edge of one section's last visible element to the top of the next section's index pill ≤ 104px; at 375 ≤ 64px. Nothing else in the layout shifts width.

### 2. Continuity — one canvas, one spine, chapters
- **One background:** audit `src/styles/*.css` for any per-section background, border-top/bottom or full-width band on `main > section` (or wrappers) that creates a hard edge between sections; remove them so the drifting field (body::before/::after blobs) reads as one continuous canvas. Plates/cards inside sections stay.
- **The signal spine (desktop ≥ 1024px only):** one decorative element rendered once in the layout renderer right after `<main …>` opens: `<div class="spine" aria-hidden="true"><span class="spine__track"></span><span class="spine__fill"></span></div>`. It is `position: absolute` inside `main` (main gets `position: relative`), at `inset-inline-start: max(16px, calc((100vw - var(--container)) / 2 - 40px))` (just left of the container; clamp so it never overlaps content and never causes overflow), top = the hero's bottom (start it at the stats strip) to the contact section. `__track`: 2px wide, `linear-gradient(to bottom, transparent, var(--brand-line) 6%, var(--brand-line) 94%, transparent)`. `__fill`: same width, `linear-gradient(var(--logo-a), var(--cyan))`, `transform-origin: top; transform: scaleY(var(--spine-progress, 1))`. With JS + no-preference, `60-motion.js` (or a new tiny `62-spine.js`, ≤ 700 B) sets `--spine-progress` from scroll position (rAF-throttled, 0→1 across main) — so the violet line "draws" down the page as you read; no-JS / reduced motion → fully drawn (`1`). Hidden below 1024px (mobile keeps a single column; no spine).
- **Chapter nodes:** each `.section-head__index` pill gets a connector on desktop: `::after` = a short horizontal hairline from the spine to the pill (positioned via `inset-inline-start` relative to the container edge; tokens only) and a 10px node dot on the spine at the same height (`.section-head { position: relative }` + `::before` dot placed at the spine's x). When the section enters view (existing reveal hook / IntersectionObserver in `60-motion.js`), the node gets `.is-lit` → fills with `--logo-b` and a soft `--glow-a` halo (scale/opacity only). Index pills already read `01 / ABOUT …` — keep the running index; make sure numbering is continuous across all sections (it will be renumbered again when the Journey section lands in T-013).
- **Soft transitions:** no hard edges; reveals overlap: change the reveal IntersectionObserver `rootMargin` so the next section's head starts revealing when it's ~15% into the viewport bottom (e.g. `rootMargin: '0px 0px -15% 0px'` → use `'0px 0px 10% 0px'` so it triggers slightly BEFORE entering), and shorten the reveal distance (`translateY` 24px → 16px) so sections flow into each other instead of popping.
- **Lead-in cues:** the stats strip (end of hero) gets a small "scroll cue": a 1px × 40px violet line under the strip that connects visually into the spine start (desktop) — decorative, `aria-hidden`. The CTA "View selected work" already links to #work; keep.

## Files
`src/styles/01-tokens.css`, `src/styles/10-base.css`, `src/styles/20-components.css`, `src/styles/40-hero.css` (stats spacing + scroll cue), `src/styles/15-motion.css` (reveal distance, node lit state), `src/styles/90-footer.css`, `src/render/layout.mjs` (spine markup), `src/scripts/60-motion.js` (rootMargin, node lit) and optionally new `src/scripts/62-spine.js`, tests.

## Tests
- `test/build.test.mjs` (or new `test/rhythm.test.mjs`): `--section-pad: clamp(48px, 2rem + 3vw, 88px)` present; no `main > section:not(.hero) { padding-block: var(--section-pad)` rule; `class="spine" aria-hidden="true"` present exactly once on the home page and absent on 404; spine hidden below 1024px (CSS contains a `(min-width: 1024px)` rule showing it / base `display: none`); site.js cap still respected (current 17,500 — if the spine script pushes past, raise to 18,200 and note it).
- Existing tests stay green.

## Commands
`npm run build`; `node --test`; `npm run check:confidential`. Visual check at 1440 + 375 both themes (local Chromium per T-003): measure the section gaps against the acceptance numbers and report them.

## Constraints
No commit/push; no `.company/` edits. CSP self-only (CSS vars via `el.style.setProperty` from JS are fine; no `style=""` in HTML). Transform/opacity only. Reduced motion + motion-toggle pause → static, fully drawn spine. Content visible at rest without JS. No horizontal overflow at 360–1440.
