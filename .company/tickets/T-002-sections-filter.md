# T-002: Content sections, project cards, filters, copy email, scroll-spy
Size: M   Depends on: T-001   Stories: US-03, US-05, US-06, US-07, US-08, US-09, US-10, US-11, US-12, US-02 (scroll-spy)
Parallel: may run in parallel with T-003 (disjoint files) — but run sequentially if machine RAM is tight.

## Context
T-001 created the build (`scripts/build.mjs`), helpers (`src/lib/*.mjs`), header/hero/footer, tokens and stub section renderers in `src/render/sections.mjs`. This ticket replaces the stubs with the real sections and adds their CSS and JS. Specs: `.company/ux.md` §3 (components), §4.4–§4.10 (sections), §5 (states), §7 (a11y); `.company/prd.md` US-03…US-12; `.company/architecture.md` §5–§6. Copy only from `src/content.json`. Do not open `.company/private/`; do not edit `.company/`.

## Goal
The home page renders every section from content.json, server-side and complete without JS; with JS the work grid filters by category × type with counts, live region, empty state and URL state; copy-email and scroll-spy work.

## Task
1. **`src/render/sections.mjs`** — replace the 7 stubs. Each section: `<section id="{id}" tabindex="-1" aria-labelledby="{id}-title"><div class="container">` + section head (ux §3: `<header class="section-head"><p class="section-head__index" aria-hidden="true">{NN} / {short}</p><h2 id="{id}-title">…</h2></header>`, labels/h2 from architecture.md §6 table) + body:
   - `renderAbout` — ux §4.4 (paragraph 1 class `lead`, rest body).
   - `renderExperience` — ux §4.5 (`<ol class="experience">`, h3 first in DOM, org external link with arrow icon + vh newTab, location, summary; no dates).
   - `renderSkills` — ux §4.6 (`<div class="skills">`, one `<div class="skill-group">` per group with decorative `S1…S6` index, `<h3>`, `<ul class="tags">` of `<li class="tag">`).
   - `renderWork` — ux §4.7 server-rendered markup exactly: lead; `<div class="filters" hidden>` with category group (All + only categories with ≥1 project, `c.categories` order, `data-category=slug`, initial counts), kind group (rendered only if both kinds exist; `data-kind`), `#work-count` live region with initial text `"{n} {countPlural|countSingular}"`; `<ul class="projects" id="project-list">` of cards in `sortProjects()` order; `<div class="projects-empty" hidden>` with `emptyState` + reset button. Chip markup `<button type="button" class="chip" aria-pressed="true|false" data-category|data-kind="…"><span class="chip__label">…</span><span class="chip__count">N</span></button>`.
   - Card: `renderCard(p, c)` exported, ux §4.7 "Card anatomy" exactly: `<li class="card card--{kind}" data-category data-kind data-featured><article aria-labelledby="p-{id}">` → meta row (badge with `lock`/`git-branch` icon + kind label, category span, year span **only if year present**) → `h3#p-{id}` → summary → `ul.card__highlights` → `ul.tags[aria-label=stackLabel]` → `footer.card__foot` (role line with `roleLabel`; case-study → `p.card__private` with lock icon + `privateNote` and **no `<a>` anywhere in the card, `repoUrl` ignored**; open-source → `a.card__repo` exactly as ux §4.7 incl. `<span class="vh"> : {name} {a11y.newTab}</span>`).
   - `renderServices` — ux §4.8 (`<ul class="services">`, decorative `01…06`, h3, desc).
   - `renderProcess` — ux §4.9 (`<ol class="process">`, h3 + p; numbering via CSS counter).
   - `renderContact` — ux §4.10 (lead, email label `id="email-label"`, `a.contact__email` with `aria-describedby`, copy button `hidden` with `data-label-copy`/`data-label-copied` from content, `#copy-status` `.vh` live region, links row: website + GitHub external, location plain text).
   - Strings needed by JS are passed as data attributes on the containers (no hard-coded copy in JS): on `#work` filters root `data-count-singular`, `data-count-plural`.
2. **`src/lib/icons.mjs`** — add `lock, git-branch, copy, check` (official Lucide paths).
3. **CSS**: `src/styles/50-sections.css` (about, experience, skills spec table, services spec grid, process pipeline — ux §4.4–4.6, §4.8–4.9 per breakpoint), `60-work.css` (filters, chips incl. pressed/zero-count/forced-colors, projects grid 1/2/3 cols per ux §2.4, card anatomy, OSS hover, entering-card animation under no-preference only, empty state), `70-contact.css` (ux §4.10).
4. **Browser JS**:
   - `src/scripts/30-filter.js` — ux §4.7 "Filter behaviour (JS)" exactly: un-hide `.filters`; state `{category, kind}`; visibility rule (AND); `hidden` on non-matching cards; `aria-pressed` per group; already-pressed click = no-op; counts recomputed per ux rule; live region re-announce via clear + `requestAnimationFrame`; empty state + reset (sets both to All, focuses category All chip); grid `min-height` softening; entering-card class for animation; URL: read `URLSearchParams` (`category`, `kind`) on load, ignore unknown silently, `history.replaceState` to canonical `?category=…&kind=…#work` (params only when ≠ all; both all → no query, hash `#work`). On load, rewrite the URL only if it carried `category`/`kind` params (canonicalise invalid ones away); a plain `/` load is never rewritten. No console output, no thrown errors.
   - `src/scripts/40-copy.js` — ux §4.10 copy behaviour (show only if `navigator.clipboard?.writeText && window.isSecureContext`; success swap label/icon + live region for 2000 ms, restart timer on repeat; rejection → select email text via Range/Selection, silent).
   - `src/scripts/50-scrollspy.js` — ux §4.2 scroll-spy (IntersectionObserver, rootMargin `-40% 0px -55% 0px`, mapping about/experience→About, skills→Stack, work→Work, services/process→Services, contact→Contact; `aria-current="true"` on one link at a time; none in hero). Skip silently if `IntersectionObserver` missing.
5. **Test** `test/projects.test.mjs` (see Tests).

## Interfaces
```js
// src/render/sections.mjs
export function renderAbout(c): string
export function renderExperience(c): string
export function renderSkills(c): string
export function renderWork(c): string
export function renderCard(p, c): string
export function renderServices(c): string
export function renderProcess(c): string
export function renderContact(c): string
```
Card data attributes: `data-category="{slugify(category)}" data-kind="{kind}" data-featured="{true|false}"`. URL params: `category=<category slug>`, `kind=case-study|open-source`.

## Constraints
- Do not change `scripts/build.mjs`, `src/render/head.mjs`, `layout.mjs`, `header.mjs`, `hero.mjs`, `footer.mjs` or `src/styles/0*-*.css`–`40-*.css`, `90-footer.css` except for a bug that blocks this ticket (report it). T-003 may be editing head/404 files concurrently.
- ux.md tokens/markup exactly; no invented copy; no `style=""` attributes (set `min-height` via CSSOM in JS); no inline handlers; no CSS `order`.
- Never `disabled` on chips. Chips are native `<button>`s in Tab order (no roving tabindex).
- Escape all content (`esc`/`attr`). No case-study card may contain `<a`.
- Zero dependencies. Do not open `.company/private/`, do not edit `.company/`, do not commit or push.

## Acceptance criteria
- [ ] All sections render in DOM order hero → about → experience → skills → work → services → process → contact; one h2 per section, h3 inside, no skipped levels.
- [ ] Card count = `projects.length` (19); featured-first order, content.json order within groups.
- [ ] Every case-study card contains no `<a` and contains `privateNote`; every OSS card has exactly one `<a>` with `href` = its `repoUrl`, `target="_blank" rel="noopener noreferrer"`, and the name in its accessible text.
- [ ] No `undefined`, `null` or empty `card__year` spans in output; projects without `year` render no year span.
- [ ] Server-rendered chip counts: All 19, Enterprise & ERP 4, Analytics & AI 3, FinTech & Banking 2, Education 1, SaaS & Platforms 3, APIs & Backend 3, Developer Tools 3; Case study 11, Open source 8.
- [ ] `.filters` and copy button are `hidden` in HTML; with JS, filters work per ux §4.7 (manual browser check: pick "Education" + "Open source" → empty state → reset focuses All; reload with `?category=developer-tools#work` pre-filters to 3; `?category=nope` → All, no console errors).
- [ ] Contact shows `mailto:eslamjackie@outlook.com` with the email as visible text, ShiftCodes + GitHub external links, location; `#copy-status` exists in initial HTML.
- [ ] No `style="` / inline `on*=` attributes anywhere in `index.html`.
- [ ] `node --check` passes for the new JS files; `dist/assets/site.js` < 30 KB raw.

## Tests
- `test/projects.test.mjs` (builds into a tmp dir via `build({outDir})`, parses with regex/string ops):
  - card count, order (ids in `data-*`/`p-{id}` order) matches featured-first;
  - per-card: case study → no `<a`, has privateNote; OSS → single `<a` with exact repoUrl and rel;
  - a case study given a `repoUrl` (call `renderCard` directly with a modified object) still renders no `<a`;
  - no `undefined`; year span absent for `national-waste-analytics`, `food-manufacturing-erp`, `ocr-omr`;
  - chip counts as listed above; category chips in `c.categories` order;
  - all section ids present and in order; h2 count = 7 (+ hero h1 = 1).
- Commands to run (only these):
  ```
  npm run build
  node --test test/projects.test.mjs test/build.test.mjs
  for f in src/scripts/*.js; do node --check "$f"; done
  ```
  Then `npm run serve` and do the manual browser checks above (report results; if no browser is available, say so).

## Out of scope
Head/SEO/OG/404/robots/sitemap/manifest/font/favicons/confidentiality check (T-003); workflow/README (T-004). Visual QA/axe/Lighthouse (QA role).

## Addendum (lead, after T-001 review)
- Content changed in T-001-fix-r1: new open-source project `ashur-bank-cms` (repoUrl https://github.com/TPCT/ashurbank.iq), `idempotent-session-ingest` removed, email is now `th3professionalcod3r@gmail.com`. Render from `src/content.json`; don't hard-code counts.
- Forced colours: accent squares (brand, eyebrow, origin node) vanish under `forced-colors: active` — add `forced-color-adjust: none` or a `CanvasText` border in a forced-colors media block (review r1 note #8).
- Do not re-format `src/content.json`.
