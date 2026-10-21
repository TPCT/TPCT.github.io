# T-025 — B-4 Story: pillar fan, pinned Process story, horizontal Work rail (desktop)

Size: M   Depends on: T-022, T-023 merged (needs `TPCT_BOLD` and `.pillars`); scheduled in round 3, after T-024/T-026 are merged   Parallel: run alone (pin-heavy; shares the page scroll geometry with everything else)   Stories: owner feedback "still no real wow"

## Goal
Turn three desktop chapters into scroll-authored stories: the About pillars fan up into their row, Process pins while its line fills and steps light 01→05 with a giant outline counter, and Work becomes a pinned horizontal gallery with a progress bar. Desktop fine-pointer and tall-enough windows only; everything else keeps today's grid and line draw. Same tokens, same look.

## Files (only these)
- new `src/scripts/82-story.js` (≤ 3,800 bytes)
- new `src/styles/47-story.css`
- new `test/bold-story.test.mjs`

## Spec → `.company/ux-bold.md` §6 (normative; §6.1–§6.5) and §3.6 coexistence
`82-story.js` starts with `(function () {\n  "use strict";`, waits like the other bold modules (`document.readyState==='complete'?go():addEventListener('DOMContentLoaded',go,{once:true})`), returns if `!window.TPCT_BOLD`, then registers **one** `B.ready(B => { … })` that adds three `B.mm.add(…)` contexts in DOM order: pillars, rail, process. Every `mm` callback returns a cleanup that removes every class, wrapper, node and inline custom property it added (GSAP reverts its own tweens/triggers).

1. **Pillar fan** (`B.Q.desk`, §6.1): add `html.story`; the `g.fromTo('.pillar', …)` exactly as specified (transform only, never opacity). Cleanup removes `story`. Skip if `.pillars` is missing.
2. **Process pinned story** (`B.Q.desk`, §6.2): setup (`list = #process .process`; remove `is-pending`/`is-revealing`, add `process--story`; append the ticker built with `createElement`/`textContent`, `aria-hidden="true"`, spans `01`…`05` from the `li` count); the proxy tween with the exact `scrollTrigger` object (`pin: true`, `start` function, `end` `'+=' + Math.round(innerHeight * 1.2)`, `scrub: 0.6`, `anticipatePin: 1`, `invalidateOnRefresh: true`, `onUpdate` → `apply(proxy.p)`); `apply(p)` exactly as specified (`--pp` via `style.setProperty`, `idx`, toggle `is-on`/`is-current`, `g.to(tickerIn, { yPercent: -20 * idx, … })`). The ticker step uses `-100 / count * idx` if the list ever has ≠ 5 items. Cleanup: remove the ticker, `process--story`, `is-on`, `is-current`, `--pp`.
3. **Work rail** (`B.Q.rail`, §6.3): setup (wrap `#project-list` in `div.work-rail`, append the bar, add `#work.rail-on`); fit check (`list.offsetHeight > innerHeight - B.headerH() - 96` → undo setup, return); `dist()` with computed inline paddings; the `g.to(list, { x: () => -dist(), … scrollTrigger: { trigger: rail, pin: true, … onUpdate: s => bar.style.setProperty('--rp', s.progress.toFixed(4)) } })` exactly as specified (1:1 mapping). Filters: delegated click on `#work .filters .chip, #work .projects-empty button` → `setTimeout(B.refresh, 650)`. Keyboard: `list` `focusin` → scroll the card into view per §6.3 (use the tween's `scrollTrigger` start/end; `B.lenis() ? B.lenis().scrollTo(y, { immediate: true }) : scrollTo(0, y)`, then `B.ST.update()`). Cleanup: move `#project-list` back to its original position, remove the wrapper/bar, `rail-on`, listeners, and clear the list's inline `transform` with `g.set(list, { clearProps: 'transform' })`.
4. **`47-story.css`**: the §6.1 neutraliser `.story .pillars[data-reveal].is-pending { opacity: 1; translate: none; scale: none; }`; the §6.2 rules inside `@media (min-width: 1024px) and (prefers-reduced-motion: no-preference)`; `.process__ticker { display: none; }` outside it (and before it in source order); the §6.3 rules (`.rail-on …` inside the same media query; `.work-rail { position: relative; }`, `.work-rail__bar { display: none; }`, `main > .pin-spacer { margin-block-start: var(--section-gap); }`, `main > .pin-spacer + section { margin-block-start: var(--section-gap); }` outside it). Add `@media print, (forced-colors: active) { .process__ticker, .work-rail__bar { display: none !important; } }`.
- Style writes CSSOM only (GSAP and `style.setProperty`); no `innerHTML`/`cssText`/`setAttribute('style'`.

## Acceptance
- [ ] 1440×900 fine pointer: pillars fan from below into the row while scrolling About (always opaque); Process pins under the header, line fills, steps light one by one, current pill = primary skin + glow at scale 1.14, inactive text in `--muted` (never opacity), counter rolls 01→05, last 20% holds; Work rail pins, cards slide left 1:1 with scroll, bar fills, then releases.
- [ ] `#contact` and `#process` do not jump when the pins are created (compare `getBoundingClientRect().top + scrollY` of `#contact` before `html.bold` and after the ready flush; the difference is exactly the added pin spacing, and the section gap above/below the spacer equals `--section-gap`).
- [ ] Filters: choosing a category shrinks the rail after ~650ms; an empty result shows the existing empty state and reset rebuilds it.
- [ ] Keyboard: Tab through the cards; every focused card is fully inside the viewport (WCAG 2.4.7).
- [ ] Resize 1440 → 900 → 1440: grid returns (no `.work-rail`, no ticker, no `rail-on`/`process--story`), then rebuilds. Height 700 at 1440 wide: no rail (`Q.rail`), process still pins (`Q.desk` ≥ 640).
- [ ] Mobile 390×844 touch, tablet 768×1024 touch, reduced motion, paused: no pins and no rail (paused keeps pins — they are scroll-linked; check that pause does not break them). No JS: static grid/process, built `#work` HTML unchanged.
- [ ] No horizontal page overflow at 360/768/1024/1280/1440 (`scrollWidth <= innerWidth`).
- [ ] 0 CSP violations / console errors.

## Tests
`test/bold-story.test.mjs` (ux-bold §6.5): `82-story.js` ≤ 3,800 bytes, passes the forbidden-API regex, contains `pin: true`, `focusin`, `.chip`, `invalidateOnRefresh`, `clearProps`, and no `innerHTML`; built CSS has `.rail-on .projects` with `flex-wrap: nowrap` inside a `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` block, `.process__ticker { display: none; }` outside any media block, both `main > .pin-spacer` rules, the `.story .pillars` neutraliser; built `#work` section has no `work-rail` and `#process` no `process__ticker`.

## Browser check (dev only, outside the repo; required)
Throwaway script in `/tmp/tpct-t025/check.mjs`; build; `PORT=4325 node scripts/serve.mjs &`; run with `PLAYWRIGHT_CORE=/home/tpct/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core CHROME_PATH=/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`; kill the server after. Same CSP/console collection as T-023. Drive scrolling with `page.mouse.wheel` (Lenis on) and with `window.scrollTo` + 300ms waits; screenshot Process at 0/50/100% and Work at 0/50/100%; run every acceptance case above; report the `#contact` offset numbers and overflow widths.

## Commands (run only these)
```
npm run build
node --test test/bold-story.test.mjs test/scripts.test.mjs test/build.test.mjs test/sections.test.mjs test/projects.test.mjs
npm run check:confidential
```

## Constraints
- Do not commit or push. Do not edit anything under `.company/`. Never modify `public/assets/vendor/*`.
- CSP self-only; CSSOM writes only; no new dependencies.
- Keep the current visual style exactly: existing tokens only (§7), no new hue/radius/shadow.
- Pins/rail only at `B.Q.desk` / `B.Q.rail` (fine pointer, ≥ 1024 wide, ≥ 640/720 tall, motion allowed). Touch devices of any width never pin. Reduced motion and no-JS: today's layout.
- Do not edit `30-filter.js`, `60-motion.js`, `80-bold.js`, `sections.mjs` or any existing CSS partial. If a change outside the listed files looks necessary, stop and report.

## Out of scope
RTL rail direction (ux-bold §8, assumption 14), changing the 1:1 rail length, perf fallbacks (lead).
