# T-005: Prism foundation: fonts, tokens, base, components, header, hero
Size: M   Depends on: none (T-001..T-004 done)   Stories: US-13 (theme), visual reskin
Parallel: no. T-006, T-007, T-008 all build on this ticket.

## Context
Goal: the owner rejected the first visual layer. `.company/ux-prism.md` (normative, read it fully before starting) replaces the visual layer of `.company/ux.md`; IA, copy and behaviour stay. This ticket lays the foundation (fonts, all tokens, base, shared components, header, hero incl. the prism visual and the CSS hero load sequence) so the later tickets only restyle sections and add motion JS.

What exists today: zero-dependency Node build (`scripts/build.mjs`) concatenating `src/styles/*.css` (by filename) into `dist/assets/site.css` and `src/scripts/*.js` into `dist/assets/site.js`. Renderers in `src/render/*.mjs`, copy in `src/content.json`, tests in `test/*.test.mjs` (`node --test`). Archivo font in `public/assets/fonts/`. Architecture: `.company/architecture.md` (§3 build, §4 CSP, §8 fonts, §13 reskin decisions).

Branch note (lead): the reskin lands ticket by ticket on a branch, so it is fine that sections/cards/contact/footer/404 look unstyled or off after this ticket (their CSS still references old tokens until T-006).

Optional visual reference (read only, never copy text, comments or names from it into the repo): `.company/private/prism/tokens.css`, `.company/private/prism/prism.css`. Where they differ from `ux-prism.md`, `ux-prism.md` wins.

## Task
1. **Fonts** (ux-prism §3.1).
   - Rewrite `scripts/build-font.sh` with the existing venv flow (temp dir outside the repo, `pip install fonttools brotli`), downloading both TTFs from the URLs in §3.1, running `varLib.instancer` (Outfit `wght=500:800`, Plus Jakarta Sans `wght=400:800`) and `pyftsubset` with exactly the unicode list and layout features in §3.1, printing the fallback metrics with the python one-liner in §3.1 for both `*-limited.ttf`, and downloading both `OFL.txt` files (`https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/OFL.txt`, `.../ofl/plusjakartasans/OFL.txt`). Copies results to `public/assets/fonts/outfit-var.woff2`, `jakarta-var.woff2`, `OFL-Outfit.txt`, `OFL-PlusJakartaSans.txt`. Run it.
   - Fallback only if pip/fonttools cannot run: in a temp dir outside the repo, `npm pack @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans`, extract, copy `package/files/outfit-latin-wght-normal.woff2` → `outfit-var.woff2` and `package/files/plus-jakarta-sans-latin-wght-normal.woff2` → `jakarta-var.woff2`; still download the two TTFs with curl and read `head.unitsPerEm` (offset 18) and `hhea` ascender/descender/lineGap (offsets 4/6/8, int16 BE) with a throwaway Node snippet (sfnt table directory at offset 12, 16-byte records). Report the route used and the file sizes.
   - Delete `public/assets/fonts/archivo-var.woff2` and `public/assets/fonts/OFL.txt`.
   - Rewrite `src/styles/00-fonts.css` exactly as in §3.1, filling in the printed ascent/descent percentages (`line-gap-override: 0%`, `size-adjust: 100%`).
2. **Tokens**: replace `src/styles/01-tokens.css` entirely with the §3.2 colour blocks + opaque fallbacks, then the §3.3 type/spacing/radius/layout/motion block and its two media queries. No alias tokens for the old names.
3. **Base** `src/styles/10-base.css` (§4.1, §4.3 forced colours, §5.1):
   - Keep: box-sizing reset, margin/list resets, **`[hidden] { display: none !important; }` (must stay, verbatim; review carry-over)**, `.container`, `.vh`, `:focus:not(:focus-visible), [tabindex="-1"]:focus { outline: none; }`, `main > section:not(.hero) { padding-block: var(--section-pad); }`, the smooth-scroll no-preference rule and the global `prefers-reduced-motion: reduce` neutraliser rule (both unchanged), `p { text-wrap: pretty; }`, button/a/svg rules.
   - Apply §4.1. **Correction to §4.1:** the shorthand `background: var(--canvas) var(--field) fixed` is invalid with a multi-layer `--field` (colour must be in the last layer). Write it as `html { background-color: var(--canvas); background-image: var(--field); background-attachment: fixed; scroll-padding-top: calc(var(--header-h) + 16px); }`.
   - Ambient field `body::before/::after` exactly as §4.1. `body` must not get position/z-index/transform/filter/isolation, and remove the old `body` background/transition.
   - `:focus-visible` per §4.1 (3px, offset 2px, no border-radius).
   - Replace the forced-colours block with the list at the end of §4.3 (selectors for elements styled in T-006 may be included now).
4. **Components** `src/styles/20-components.css`: rewrite per the §4.3 table (eyebrow/section index, label, section head, `.btn`, `.btn--primary` incl. `::before` hotspot and `::after` hover skin, `.btn--secondary` incl. the light-theme shadow variant via `[data-theme="light"]`, hero CTA size, `.icon-btn` with stacked SVGs, `.text-link`, `.tag`, `.badge`, `.chip` all states, prism glyph `.brand > span`). Add:
   - `.btn--primary.is-magnet { transition-duration: 160ms, var(--dur-1), var(--dur-2), var(--dur-1); }` (hook for T-007).
   - Theme toggle morph (§5.9): `.theme-toggle svg { transition: opacity var(--dur-2) var(--ease-out), rotate 520ms var(--ease-spring), scale 520ms var(--ease-spring); }` and `[data-theme="dark"] .theme-toggle .icon-moon, [data-theme="light"] .theme-toggle .icon-sun { opacity: 0; rotate: -120deg; scale: .4; }`. Delete the old `display:none` icon rule.
   - Motion toggle morph: `.motion-toggle svg` same transition; `.motion-toggle .icon-play, .motion-paused .motion-toggle .icon-pause { opacity: 0; rotate: -90deg; scale: .4; }` and `.motion-paused .motion-toggle .icon-play { opacity: 1; rotate: 0deg; scale: 1; }`.
   - Under 360px keep `.tag { white-space: normal; }`.
5. **Motion CSS** new `src/styles/15-motion.css`: shared keyframes `rise`, `fade-in` (§5.2) and `pop` (§5.9); the ambient loops block of §5.3 verbatim; the reveal rules + print rule of §5.4; the view-transition CSS of §5.9. All keyframes inside `@media (prefers-reduced-motion: no-preference)` (the `::view-transition-old/new(root) { animation: none; mix-blend-mode: normal; }` line and the print rule sit outside it, as in the spec). Do not duplicate these keyframes in other partials.
6. **Header** `src/styles/30-header.css`: rewrite per §6.1 incl. the `is-scrolled` / menu-open / no-JS plate visibility, mobile menu panel + `menu-in` (240ms, transform-origin top right), menu button morph (stacked crossfade keyed on `[aria-expanded]`, hidden icon `opacity:0; rotate:90deg; scale:.4`), 404 grid `.header-inner:not(:has(.menu-btn))`, skip link restyle (keep its position behaviour), and `.js .site-header { animation: header-in ... }` (hero sequence row 1, inside no-preference). **Keep these rules textually because `test/build.test.mjs` asserts them:** `.js .site-header:not([data-nav-ready]) #primary-nav { display: none; }`, `.no-js .site-header { position: static; height: auto; }` (may add declarations after `height: auto;`), `.no-js #primary-nav ul { display: flex; flex-wrap: wrap; }`, and the md `display: block` counterpart.
7. **Hero** `src/styles/40-hero.css`: rewrite per §6.2 (layout, text, prism with all parts, parallax translate rule from §5.11 with the per-layer `--z`, domains plate, stats plate), the §5.2 load-sequence table (every selector prefixed `.js`, inside no-preference, `animation-fill-mode: both`; `word-up`, `header-in`, `prism-in`, `chip-in` keyframes live here), the h1 word mask, `overflow-x: clip` on `.hero` (§8), `.motion-toggle` position. Delete `bus-in`/`domain-in`/`origin-in` and the `.schematic::before` bus lines. Keep `.schematic__domains li:nth-child(1..10) { --i: 0..9 }`. Explicit rules: h1 words `.w:nth-of-type(1..4)` (delays 120/220/320/420ms), roles `li:nth-child(1..4)`, CTAs `> :nth-child(1..3)`.
8. **Markup**
   - `src/render/hero.mjs` exactly per §6.2 "Markup changes": h1 word spans (`name.split(/\s+/)`, last word gets `w--accent`, words joined by one space), `.hero__visual` wrapper replacing `.schematic` in `.hero__grid`, containing the `.prism` tree (`aria-hidden="true"`), the motion toggle button, then the unchanged `.schematic`. Stats stay after the grid. Exactly 3 `<a ` in the hero.
     Motion toggle markup (attribute order exact): `<button type="button" class="icon-btn motion-toggle" hidden aria-label="{pause}" title="{pause}" data-label-pause="{pause}" data-label-play="{play}">{icon('pause')}{icon('play')}</button>`, all values via `attr()`.
   - `src/lib/icons.mjs`: add `pause: '<rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" />'` and `play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />'` (Lucide, ISC).
   - `src/render/head.mjs`: replace the Archivo preload with the two preloads from §3.1 (outfit first). In `THEME_SCRIPT` replace `'#FAFAFC':'#0B0B12'` with `'#E7E6F3':'#1A1726'` (nothing else in the string changes; the CSP hash recomputes automatically).
   - `src/content.json`: `site.themeColorDark` → `"#1A1726"`, `site.themeColorLight` → `"#E7E6F3"`; add `"motionToggle": { "pause": "Pause animation", "play": "Play animation" }` to `hero` right after `domainsLabel`. Keep the existing 2-space formatting and key order; do not reformat the file.
   - `src/lib/validate.mjs`: `strings(hero.motionToggle, 'pause play', 'hero.motionToggle');`.
   - `README.md`: third-party notices: replace Archivo with "Outfit (SIL OFL 1.1, `public/assets/fonts/OFL-Outfit.txt`)" and "Plus Jakarta Sans (SIL OFL 1.1, `public/assets/fonts/OFL-PlusJakartaSans.txt`)"; update the `build-font.sh` row text.

## Interfaces
- Font files: `/assets/fonts/outfit-var.woff2` (family "Outfit", 500 800), `/assets/fonts/jakarta-var.woff2` (family "Plus Jakarta Sans", 400 800).
- Preloads (exact): `<link rel="preload" href="/assets/fonts/outfit-var.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin>`
- Content keys: `hero.motionToggle.pause`, `hero.motionToggle.play` (non-empty strings, validated).
- Class hooks used later by JS (T-007), styled now: `html.motion`, `html.motion-paused`, `.site-header.is-scrolled`, `.prism.is-idle`, `.btn--primary.is-magnet`, `[data-reveal].is-pending/.is-revealing`, CSS vars `--mx --my --gx --gy --px --py --rd --vt-x --vt-y --vt-r`.
- Backdrop-filter budget: exactly the 3 elements in §4.2 (`.header-inner::before`, mobile `#primary-nav`, `.schematic`).

## Constraints
- Do not commit or push. Do not edit anything under `.company/`.
- No npm dependencies, no lockfile, no new runtime requests: CSP stays self-only (no Google Fonts, no CDN).
- No `style="` attributes and no inline event handlers in any HTML. JS-set values only via CSSOM (later tickets).
- Animations: keyframes/transitions animate only transform/translate/rotate/scale/opacity (hover colour/box-shadow/border-color transitions allowed), per §5.1.4.
- Every keyframe/entrance is inside `@media (prefers-reduced-motion: no-preference)`; keep the global reduce rule.
- Content visible at rest and without JS: the hero entrance is gated on `.js` only and uses `animation-fill-mode: both`; nothing is hidden waiting for `site.js`.
- Use logical properties for new CSS (§8). Do not touch `src/render/sections.mjs`, `header.mjs`, `footer.mjs`, `layout.mjs`, `page-404.mjs`, `src/scripts/*`, styles `50-`..`90-`, or `scripts/render-images.mjs` (later tickets).
- Never put private brand names from `.company/private/` in any file.

## Acceptance criteria
- [ ] `outfit-var.woff2` and `jakarta-var.woff2` exist, start with `wOF2`, each ≤ 80 KB, combined ≤ 120 KB; both OFL files exist; Archivo files are gone and `archivo` appears nowhere in `src/`, `scripts/`, `test/`, `README.md` or `dist/`.
- [ ] `00-fonts.css` has real (printed) ascent/descent override values, no placeholder comments left.
- [ ] `01-tokens.css` matches §3.2 + §3.3 (dark on `:root,[data-theme="dark"]`, light on `[data-theme="light"]`, opaque fallbacks for no-backdrop-filter and `prefers-reduced-transparency`).
- [ ] `dist/assets/site.css` contains `[hidden] { display: none !important; }`, `prefers-reduced-motion: reduce`, `prefers-reduced-transparency`, and at most 3 non-prefixed `backdrop-filter: var(--glass-blur)` declarations.
- [ ] `html` background uses the longhand form (no `background: var(--canvas) var(--field)`).
- [ ] Hero renders the word spans, `.hero__visual` > `.prism[aria-hidden="true"]` + `.motion-toggle[hidden]` + `.schematic`; still exactly 3 `<a ` in the hero; h1 text with tags stripped equals `c.hero.name`.
- [ ] `THEME_SCRIPT` contains `#1A1726` and `#E7E6F3`, not `#0B0B12`/`#FAFAFC`; CSP hash test still passes.
- [ ] `content.json` has the new theme colours and `hero.motionToggle`; `validateContent` errors when `hero.motionToggle.pause` is missing.
- [ ] Without JS (`no-js`) every hero element is fully visible (no `.js`-less rule sets opacity/transform).
- [ ] `npm run build`, the affected tests and `npm run check:confidential` pass.

## Tests
Update / add (keep all other existing assertions):
- `test/seo.test.mjs`: replace the Archivo href/font assertions with: both preload hrefs present; `outfit-var.woff2` and `jakarta-var.woff2` read from `public/assets/fonts/`, `wOF2` magic, each ≤ 80 KB, sum ≤ 120 KB; `html` does not include `archivo`; `OFL-Outfit.txt` and `OFL-PlusJakartaSans.txt` exist (replace `assets/fonts/OFL.txt` in the existence loop).
- `test/build.test.mjs`: h1 text stripped of tags equals `c.hero.name`; `THEME_SCRIPT` includes `#1A1726` and `#E7E6F3`; `class="icon-btn motion-toggle" hidden` present; `class="prism" aria-hidden="true"` present; CSS asserts from the acceptance list (`[hidden]` rule regex `/\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/`, reduce, reduced-transparency, backdrop-filter count ≤ 3 via `/(?<!-webkit-)backdrop-filter:\s*var\(--glass-blur\)/g`).
- `test/content.test.mjs`: new test: `c.hero.motionToggle` deep-equals `{ pause: 'Pause animation', play: 'Play animation' }`, theme colours equal `#1A1726`/`#E7E6F3`; deleting `hero.motionToggle.pause` yields an error matching `/hero\.motionToggle\.pause/`.

Commands (only these):
```
bash scripts/build-font.sh
npm run build
node --test test/build.test.mjs test/seo.test.mjs test/content.test.mjs
npm run check:confidential
```

## Out of scope
- Sections, cards, filters, contact, footer, 404 CSS and `data-reveal` markup (T-006).
- All JS: `60-motion.js`, `61-pointer.js`, filter/theme JS changes (T-007). The motion toggle stays `hidden` in this ticket.
- OG image, favicons, `render-images.mjs` (T-008).
