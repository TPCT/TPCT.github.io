# T-026 — B-5 Atmosphere: section colour morphs + split-line heading reveals

Size: S   Depends on: T-023 merged (T-022 only for the `.about__line` targets; the selector no-ops without it)   Parallel: may run together with T-024 (disjoint files); never with T-025   Stories: owner feedback "still no real wow"

## Goal
Let the page light shift per chapter (three fixed glow layers cross-fading behind the content) and make section headings rise line by line from a mask as they enter. No new hue except `--tint-c` (= `--logo-c` #5A1FE0 at an alpha). Content and `textContent` never change; reduced motion, print and forced colours see today's page.

## Files (only these)
- new `src/scripts/83-atmos.js` (≤ 2,400 bytes)
- new `src/styles/48-atmos.css`
- new `test/bold-atmos.test.mjs`

## Spec → `.company/ux-bold.md` §5 (normative; §5.1–§5.3)
`83-atmos.js` starts with `(function () {\n  "use strict";`, waits like the other bold modules (`document.readyState==='complete'?go():addEventListener('DOMContentLoaded',go,{once:true})`), returns if `!window.TPCT_BOLD`, and registers its work with `B.ready(B => B.mm.add(B.Q.motion, () => { …; return cleanup; }))`. Available from T-023: `.tint` with 3 `<span>` (home only, hidden by `45-bold.css` until `.bold` here), `html.bold`.

1. **`48-atmos.css`**: §5.1 CSS verbatim (`--tint-c` in both themes; `.bold .tint` block inside `no-preference`; print/forced-colors hide), then §5.2 CSS (`.ln`, `.ln__in`, and the neutraliser `.bold .section-head[data-reveal].is-pending, .bold .about__lead[data-reveal].is-pending { opacity: 1; translate: none; scale: none; }`).
2. **Colour morphs** (§5.1 JS): `const tint = document.querySelector('.tint')`; skip the morphs if missing. One `B.ST.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: s => s.isActive && mood(id) })` per section id in this table (missing sections skipped); `mood(id)` = `B.g.to(tint, { '--m1': a, '--m2': b, '--m3': c, duration: 0.9, ease: 'power2.inOut', overwrite: true })`.
   | ids | m1 | m2 | m3 |
   |---|---|---|---|
   | `top`, `about` | 0 | 0 | 0 |
   | `experience`, `timeline` | 1 | .25 | 0 |
   | `skills`, `work` | .2 | 1 | 0 |
   | `services`, `process` | .6 | .55 | .35 |
   | `contact` | .45 | .8 | 1 |
   Encode the table once (e.g. `{top:[0,0,0],about:[0,0,0],…}`); the test parses it. Before creating the triggers, `B.g.set(tint, { '--m1': 0, '--m2': 0, '--m3': 0 })` so GSAP never tweens from an empty custom property. Cleanup: `tint.style.removeProperty` for the 3 vars.
3. **Split-line headings** (§5.2): targets = every `.section-head h2` whose `getBoundingClientRect().top > innerHeight * 0.9` at ready time (above-the-fold headings untouched). Split exactly as specified: temporary word spans with real space text nodes → group by `offsetTop` → `replaceChildren()` with `<span class="ln"><span class="ln__in">…</span></span>` per line, trailing space kept inside the line so `textContent` is unchanged; `B.g.set(inners, { yPercent: 110 })`. Reveal: `B.ST.create({ trigger: h2, start: 'top 88%', once: true, onEnter: () => B.g.to(inners, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, onComplete: () => { h2.textContent = original; } }) })`. About lead: if `#about .about__lead` exists and is below 0.9 × viewport, `B.g.set('#about .about__line > span', { yPercent: 110 })` and the same trigger on `.about__lead` with `stagger: 0.1`, `onComplete` → `B.g.set(spans, { clearProps: 'transform' })` (no split; the markup has masks). Resize: debounced (200ms) width change → unrevealed headings restore `textContent`, kill their trigger, re-split, recreate. `beforeprint` and the `mm` cleanup → restore every unrevealed heading's text and clear transforms on the about spans. Build nodes with `createElement`/`createTextNode`/`textContent` only.
- Style writes CSSOM only (GSAP / `style.setProperty`); no `innerHTML`/`cssText`/`setAttribute('style'`.

## Acceptance
- [ ] Scrolling from top to Contact shifts the ambient light per the table (read `getComputedStyle(tint).getPropertyValue('--m1/2/3')` with a section centred: e.g. `work` → ≈ .2/1/0, `contact` → ≈ .45/.8/1 after 1s). Content contrast unchanged; text stays on top (`main` z 1 above `.tint` z 0).
- [ ] Every below-the-fold h2 rises in lines once; after reveal its markup is plain text again and its `textContent` always equals the original (also mid-reveal). The index pill keeps its decode; no double fade (neutraliser).
- [ ] About lead lines rise (if T-022 is merged); nothing hidden if JS fails.
- [ ] Resize at 1440 → 768 before reveal re-splits correctly (no clipped words).
- [ ] Reduced motion, print, forced colours: no tint, no split. No JS: unchanged HTML. Mobile 390×844: morphs and reveals on, no overflow at 360.
- [ ] 0 CSP violations / console errors.

## Tests
`test/bold-atmos.test.mjs` (ux-bold §5.3): built CSS has `.bold .tint` only inside a `prefers-reduced-motion: no-preference` block, `--tint-c` for `:root, [data-theme="dark"]` (`.32`) and `[data-theme="light"]` (`.14`), the `.ln` / `.ln__in` rules and the neutraliser selector; `83-atmos.js` ≤ 2,400 bytes, passes the forbidden-API regex from `scripts.test.mjs`, references all 9 ids (`top about experience timeline skills work services process contact`), and its mood table (extracted with a regex) deep-equals the table above; built home HTML has no `class="ln"` (split is runtime only).

## Browser check (dev only, outside the repo; required)
Throwaway script in `/tmp/tpct-t026/check.mjs`; build; `PORT=4326 node scripts/serve.mjs &`; run with `PLAYWRIGHT_CORE=/home/tpct/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core CHROME_PATH=/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`; kill the server after. Same CSP/console collection as T-023. Desktop 1440×900 and mobile 390×844 in dark and light: scroll section by section, record the three vars and each h2 `textContent` vs the built HTML; screenshot Work and Contact (light theme too, to check the wash stays subtle); run the reduced-motion and resize cases. Report the numbers.

## Commands (run only these)
```
npm run build
node --test test/bold-atmos.test.mjs test/scripts.test.mjs test/build.test.mjs test/sections.test.mjs
npm run check:confidential
```

## Constraints
- Do not commit or push. Do not edit anything under `.company/`. Never modify `public/assets/vendor/*`.
- CSP self-only; CSSOM writes only; no new dependencies.
- Keep the current visual style exactly: only `--glow-a`, `--glow-b` and the new `--tint-c`; no new hue/font/radius/shadow.
- Reduced motion / print / forced colours: no effect. Pause: morphs and reveals stay (scroll-linked / one-shot). No JS: unchanged.
- Mobile: same effects, no overflow; never pin.
- Do not edit `60-motion.js`, `71-decode.js`, `80-bold.js`, any renderer or any existing CSS partial.

## Out of scope
Hero (T-024), pins/rail/fan (T-025), perf fallbacks (lead).
