# T-022 — B-1 About rewrite: 2-line lead, 4 pillar cards, "Worked with" company rail

Size: S   Depends on: none   Parallel: may run together with T-023 (disjoint files)   Stories: owner feedback "About is a wall of text"

## Goal
Replace the About section's 3 paragraphs and key-facts aside with a short statement: a 2-line display lead, a one-sentence intro, 4 glass "How I work" pillar cards, and a slowly drifting strip of the companies worked with. Static HTML, fully readable without JS. The visual style stays exactly the current one (plates, rims, shadows, chips, violet tokens, Outfit/Plus Jakarta Sans).

## Files (only these)
- `src/content.json`: the `about` object only (replace it whole). Do not re-format the rest of the file.
- `src/lib/validate.mjs`: replace the about rule (line with `strings(c.about, 'title factsLabel', 'about')`).
- `src/lib/icons.mjs`: add 4 icons + export `hasIcon`.
- `src/render/sections.mjs`: `renderAbout` only.
- `src/styles/50-sections.css`: remove the about rules only.
- `src/styles/10-base.css`: remove `.about__body, ` from the forced-colors selector list on line 35 only.
- new `src/styles/51-about.css`.
- `test/about.test.mjs` (rewrite), `test/content.test.mjs` (one line, see Tests), `test/sections.test.mjs` (CSS cap numbers only).

## Spec → `.company/ux-bold.md` §2 (normative; read §2.1–§2.9 fully)
1. **Content** (§2.2): copy the `about` JSON block verbatim (title, lead ×2, intro, pillarsLabel, 4 pillars with icons `layers`/`users`/`gauge`/`shield-check`, companiesLabel, 12 companies). Delete `paragraphs` and `factsLabel`. `c.stats` stays (hero uses it).
2. **Validation** (§2.3), errors prefixed `about.<key>: …`:
   - `title intro pillarsLabel companiesLabel` required non-empty strings (use the existing `strings()` helper); `intro.length > 200` → `about.intro: must be ≤ 200 characters`.
   - `lead`: array of exactly 2 non-empty strings, each ≤ 60 chars → `about.lead: expected exactly 2 lines` / `about.lead[i]: must be ≤ 60 characters`.
   - `pillars`: array of 3–4 → `about.pillars: expected 3–4 items`. Each `pillars[i]`: `icon` must satisfy `hasIcon()` (`about.pillars[i].icon: unknown icon`), `title` non-empty ≤ 24, `text` non-empty ≤ 120. `text` must not contain any `stats[].value` (plain `includes`) → `about.pillars[i].text: repeats a hero stat`; and must not contain any `skills[].items[]` entry as a whole phrase, case-insensitive. **Decision:** use `new RegExp('(?<![A-Za-z0-9])' + escaped + '(?![A-Za-z0-9])', 'i')` instead of `\b…\b` (items like `C#` or `.NET` break `\b`) → `about.pillars[i].text: repeats a Stack item`.
   - `companies`: 6–16 strings, unique (case-insensitive), each a case-insensitive substring of some `experience[].org` → `about.companies[i]: not found in experience`, `about.companies: duplicate "<name>"`, `about.companies: expected 6–16 items`.
   - `paragraphs` or `factsLabel` present → `about.paragraphs: removed, use lead/intro/pillars` (same message for both keys).
3. **Icons** (§2.4): add the 4 path strings exactly as given (Lucide, ISC, same format as existing entries) and `export const hasIcon = name => Object.hasOwn(paths, name);`.
4. **Markup** (§2.5): exactly the structure shown, inside the existing `section('about', '01', navLabel(c, 'about'), c.about.title, …)` shell. Pillar index = `String(i + 1).padStart(2, '0')`. `.pillars` `aria-label` = `c.about.pillarsLabel`; `.clients` label `id="clients-label"` text = `companiesLabel`; second list has `class="clients__list clients__list--dup" aria-hidden="true"`. The two `.about__line` spans are separated by one real space text node. Every text through `esc()`, every attribute through `attr()`. `data-reveal` on `.about__lead`, `.about__intro`, `.pillars`, `.clients` (not on the section-head change; the shell already adds its own).
5. **CSS removal** (§2.1): in `50-sections.css` delete lines 2–11 (`.about__body` … `.about__facts .tag`), the `.about__body` padding rules at 768 and 1024 (current lines 64 and 68–72, including `.about__stats`/`.about__fact` media rules), `.about__body, ` from the forced-colors list on line 83, and the `.about__fact dd` forced-colors rule (line 85). Keep `.lead` (line 1) and everything else untouched.
6. **New `51-about.css`**: copy ux-bold §2.7 verbatim (all rules, the `no-preference` block with `@keyframes clients-drift`, forced-colors and print blocks).

## Acceptance
- [ ] Built `#about` contains `.about__lead` with exactly 2 `.about__line`, `.about__intro`, `ul.pillars[aria-label="How I work"]` with 4 `li.pillar` (each with `<svg class="icon-…">`, `.pillar__index` `01`–`04` `aria-hidden="true"`, one `h3`, one `p`), `.clients__list` with 12 `li`, a duplicate list with `aria-hidden="true"`.
- [ ] No `about__facts`, `about__body`, `<dl`, and no hero `stats[].value` inside `#about`. No `.about__body`/`.about__fact`/`.about__stats` selectors left in any CSS partial.
- [ ] `textContent` of `.about__lead` reads as one sentence with a single space between the lines.
- [ ] Validation: every rule in Spec 2 has a failing case with its exact message; current content passes with 0 errors.
- [ ] CSS: `.clients__list--dup { display: none; }` outside any media query; `@keyframes clients-drift` and `.js .clients__list` animation inside `@media (prefers-reduced-motion: no-preference)`; `.motion-paused .clients__list` paused.
- [ ] Without JS (`no-js`): chips wrap statically, duplicate list hidden. Reduced motion: no drift.
- [ ] No horizontal overflow from 360 to 1440px (the rail is clipped by `.clients__rail`).
- [ ] `npm run check:confidential` passes.

## Tests
- `test/about.test.mjs`: rewrite per ux-bold §2.9 (build to an OS tmp dir like today). Cover all acceptance items above, one validation case per rule (mutate a `structuredClone(c)`), and the CSS assertions.
- `test/content.test.mjs` line 50: replace `Object.assign(original.about, career.about);` with `original.about = structuredClone(c.about); // About is owned by ux-bold §2 since T-022`. No other change.
- `test/sections.test.mjs` lines 42–43: raise the CSS caps `81920` → `94208` and `18432` → `21504` (both the number and keep the message). Decision: this ticket owns the CSS cap raise (not T-023), so the two parallel tickets never fail on each other's bytes.

## Commands (run only these)
```
npm run build
node --test test/about.test.mjs test/content.test.mjs test/sections.test.mjs test/build.test.mjs test/scripts.test.mjs
npm run check:confidential
```
Visual check (dev only, outside the repo): build, `PORT=4322 node scripts/serve.mjs &`, then a throwaway Playwright script in `/tmp/tpct-t022/` using `createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE)` and `chromium.launch({ executablePath: process.env.CHROME_PATH })` with `PLAYWRIGHT_CORE=/home/tpct/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core CHROME_PATH=/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`: screenshot `#about` at 1440×900 and 375×812 in dark and light (`localStorage.theme`), assert `document.documentElement.scrollWidth <= innerWidth` at 360/768/1024/1440, and collect console errors (must be 0). Kill the server afterwards. Never write these paths into a repo file.

## Constraints
- Do not commit or push. Do not edit anything under `.company/`.
- CSP self-only: no inline `style=`, no `on*=` handlers, no new inline script. No new dependencies.
- Keep the current visual style exactly: only existing tokens (no new colour, font, radius, shadow).
- Reduced motion / pause / no-JS: content is fully visible and static; the drift only runs under `.js` + `no-preference` and freezes under `.motion-paused` and on hover.
- Mobile: 1 column < 640, 2 columns 640–1023, `auto-fit` ≥ 1024; no overflow at 360.
- No private names: only the 12 companies from ux-bold §2.2 (all already public in `experience[].org`).
- Do not touch `src/scripts/*`, `hero.mjs`, other renderers in `sections.mjs`, or other CSS partials beyond the lines named above.

## Out of scope
The pillar scroll "fan" (T-025), the split-line lead reveal (T-026), any JS.
