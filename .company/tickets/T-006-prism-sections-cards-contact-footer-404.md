# T-006: Prism sections, cards, filters, contact, footer, 404 CSS + data-reveal markup
Size: M   Depends on: T-005   Stories: visual reskin (US-05..US-12 visuals), US-14 (motion hooks)
Parallel: yes with T-007 and T-008 after T-005 lands (disjoint files). If RAM is tight, run T-006 → T-007 → T-008 one after another.

## Context
Goal: finish the Prism visual layer for everything below the hero and the 404 page, and add the `data-reveal` markup hooks that `60-motion.js` (T-007) uses for scroll reveals.

What exists after T-005 (assume it landed as specified in `.company/tickets/T-005-prism-foundation-header-hero.md`):
- `src/styles/01-tokens.css` has only the Prism tokens (`ux-prism.md` §3.2/§3.3). The old tokens (`--bg`, `--line`, `--text*`, `--accent*`, `--oss`, `--radius-*`, `--font-mono`, `--fs-tag`, `--shadow-card-hover`) **no longer exist**, so `50-`..`90-` partials currently reference undefined variables. This ticket fixes that.
- `src/styles/20-components.css` already styles `.eyebrow`, `.section-head`, `.section-head__index`, `.label`, `.btn*`, `.icon-btn`, `.text-link`, `.tag` (incl. the `<360px` wrap rule), `.badge`, `.chip*` (all states), and the prism glyph on `.brand > span` (maybe also `.projects-empty::before`).
- `src/styles/15-motion.css` already defines the shared keyframes `rise`, `fade-in`, `pop`, the reveal rules (`.motion [data-reveal].is-pending/.is-revealing`), the ambient loops and the view-transition CSS. **Use these keyframes; do not redefine `rise`, `fade-in` or `pop`.**
- `src/styles/10-base.css` keeps `[hidden] { display: none !important; }`, the global `prefers-reduced-motion: reduce` neutraliser, and has the §4.3 forced-colours list.
- Build: `scripts/build.mjs` concatenates `src/styles/*.css` by filename into `dist/assets/site.css`. Renderers: `src/render/sections.mjs` (all sections below the hero), `src/render/page-404.mjs`, `src/render/footer.mjs`.

Spec (normative, read these sections fully first): `.company/ux-prism.md` §4.2 (plate + backdrop-filter budget), §4.3 (components, forced colours), §5.1 (gating rules), §5.4 (reveal CSS, for context), §5.6 step 4 (`card-in`), §5.7 (card hover CSS), §5.8 (process draw), §5.9 (copy button success), §6.3–§6.11, §7 (states), §8 (responsive), §10.1 (markup hooks). Behaviour, DOM order and copy stay as in `.company/ux.md` §4. Architecture: `.company/architecture.md` §13.

## Task
1. **Markup hooks** `src/render/sections.mjs` (only add the bare attribute ` data-reveal`, no value; change nothing else in the strings):
   - `section()`: `<header class="section-head" data-reveal>` (all 7 sections).
   - `renderAbout`: `<div class="about__body" data-reveal>`.
   - `renderExperience`: each item `<li data-reveal>`.
   - `renderSkills`: `<div class="skill-group" data-reveal>`.
   - `renderWork`: `<div class="filters" hidden data-reveal>` (keep `hidden` first, the test regex `class="filters" hidden` must still match). Do **not** add it to `#work`'s `<p class="lead">`.
   - `renderCard`: append after `data-featured="…"`: `… data-featured="${attr(p.featured)}" data-reveal>`.
   - `renderServices`: each `<li data-reveal>`.
   - `renderProcess`: `<ol class="process" data-reveal>`.
   - `renderContact`: `<p class="lead" data-reveal>`, `<div class="contact__email-row" data-reveal>`, `<ul class="contact__links" data-reveal>`.
   - Nothing in the hero, header, footer or 404 gets `data-reveal`.
2. **`src/styles/50-sections.css`** rewrite per §6.3 (About), §6.4 (Experience), §6.5 (Stack), §6.7 (Services), §6.9 + §5.8 (Process):
   - Keep the generic `.lead { font-size: var(--fs-lead); line-height: var(--lh-snug); font-weight: 500; max-width: 68ch; }` and `.tags { display: flex; flex-wrap: wrap; gap: 8px; }`. Delete the `.tag` rules and the `<360px` `.tag` rule here (they live in `20-components.css`).
   - Plate declarations (§4.2: `background: var(--plate); border: 1px solid var(--rim); border-radius: var(--r-plate); box-shadow: var(--shadow-card);`) written out on `.about__body`, `.experience > li`, `.skill-group`, `.services > li`. Never `backdrop-filter` here.
   - About: keep the lg grid; `#about .section-head__index` additionally gets `justify-self: start` (it is a grid item because `.section-head` is `display: contents` at lg). `p.lead` inside `.about__body` = Outfit 600 `--fs-lead`, `p + p` per §6.3, inner `max-width: 66ch`.
   - Experience: rail `.experience::before`, item node `.experience > li::before`, `.exp__loc` pill, `.exp__org a` font override, all exactly §6.4. Keep the lg `1fr 2fr` placement rules for `h3`, `.exp__org`, `.exp__loc`, `.exp__summary`.
   - Stack: grid 1 / 2 (md, gap 20) / 3 (lg). Delete the lg spec-table rules (`.skills { display:block }`, `.skill-group { display:grid; 1fr 2fr }`). `.skill-group__head` and its `> span` tile per §6.5.
   - Services: per §6.7; delete the 1px-gap shared-border grid. `.services__index` tile.
   - Process: exactly §6.9 geometry for base/md (vertical) and lg (`min-width: 1024px`, horizontal), node tiles via `li::before` with `content: counter(step, decimal-leading-zero); content: counter(step, decimal-leading-zero) / "";`, last-step primary skin, track `::before` (`var(--border-soft)`) and drawn line `::after`. Add the §5.8 block verbatim incl. `.process > li:nth-child(1..8) { --n: 0..7; }` (write all 8 rules). Pending state: base/md `.motion .process.is-pending::after { scale: 1 0; }`, lg `scale: 0 1;` (inside the lg media query), both inside `@media (prefers-reduced-motion: no-preference)`. Delete the old rotated squares and the `h3::before` counter.
   - Delete the old forced-colours line; add a forced-colours block for this partial (see step 7).
3. **`src/styles/60-work.css`** rewrite per §6.6, §5.7, §5.6 step 4:
   - `#work .lead` (`color: var(--fg2); font: 500 var(--fs-lead)/var(--lh-snug) var(--font-sans);`), `.filters` plate + layout, `[role="group"]`, `#work-count` with cyan dot, `.projects` grid (1 / 2 md / 3 xl; gap 20, xl 28; `margin-block-start: 0`).
   - **Delete all `.chip*` and `.badge` rules** from this file (they are in `20-components.css`). Exception: if `src/styles/10-base.css` has no forced-colours rule for `.chip[aria-pressed="true"]`, keep a forced-colours rule here: `.chip[aria-pressed="true"] { background: Highlight; color: HighlightText; forced-color-adjust: none; }`.
   - Card: plate, `padding: 22px` (md 26px), `.card--open-source { background: var(--plate-cyan); }`, `article` flex column `height: 100%; position: relative; z-index: 2`, then the §5.7 CSS block verbatim (`.card` transition, `.card.is-tilt`, `.card.is-tilt.is-tracking`, `.card::after` sheen, the hover/focus-within lift inside no-preference + `(hover: hover) and (pointer: fine)`, and the reduced-motion shadow-only rule) with one correction: move `@keyframes card-sheen` **inside** the `@media (prefers-reduced-motion: no-preference)` block (the spec block has it outside). Keep `min-width: 0; overflow-wrap: anywhere;` on `.card`.
   - `.card__meta`, `.card__year`, `h3`, `.card__summary`, `.card__highlights` (6px dots, OSS cyan), `.card .tags`, `.card__foot`, `.card__role`, `.card__private`, `.card__repo` (control pill, hover `translate: 0 -1px; border-color: var(--cyan-line)`, `:active { scale: .97 }`, trailing `.icon-arrow-up-right` `transition: translate var(--dur-2) var(--ease-out)` and hover `translate: 2px -2px`), exactly §6.6.
   - Empty state `.projects-empty` (`background: var(--plate-brand)`, rim, `--r-plate`, `--shadow-card`, `margin-block-start: 32px; padding: 48px 24px; text-align: center`). Its `::before` is a self-contained 40×36 prism glyph written here in full: `content: ""; display: block; width: 40px; height: 36px; margin: 0 auto 16px; clip-path: polygon(50% 0, 100% 100%, 0 100%); background: conic-gradient(from 210deg at 50% 66%, var(--prism-1), var(--prism-2), var(--prism-3), var(--prism-4), var(--prism-1));`. `p` and `.btn` per §6.6.
   - Replace the old `card-in` with §5.6 step 4, inside `@media (prefers-reduced-motion: no-preference)`: `@keyframes card-in { from { opacity: 0; scale: .94; translate: 0 12px; } }` and `.card.is-entering { animation: card-in 360ms var(--ease-rise) var(--rd, 0ms) both; }`. Delete the old 4px version.
4. **`src/styles/70-contact.css`** rewrite per §6.8 and §5.9 (copy button):
   - Keep `main > #contact { padding-block-end: var(--space-10); }` and `.contact__email-row { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }`.
   - Panel `#contact > .container` (plate-brand, `--r-lg`, padding 32px 22px / md 48px / lg 56px 64px), static glows `::before`/`::after` (not animated), h2, `.lead`, `#email-label`, all §6.8.
   - `.contact__email`: gradient text exactly §6.8, plus an animated underline `::after` (`content: ""; position: absolute; inset-inline: 0; bottom: -4px; height: 2px; background: linear-gradient(90deg, var(--brand), var(--cyan)); scale: 0 1; transform-origin: left; transition: scale var(--dur-3) var(--ease-out);`), `:hover::after, :focus-visible::after { scale: 1 1; }`.
   - Copy button stacked crossfade (replaces the old `display: none` rules): `.copy-btn svg { transition: opacity var(--dur-2) var(--ease-out), scale var(--dur-2) var(--ease-out); }`, `.copy-btn .icon-check { position: absolute; inset-inline-start: 24px; top: 50%; margin-block-start: -10px; opacity: 0; scale: .5; }`, `.copy-btn.is-copied { color: var(--cyan-text); }`, `.copy-btn.is-copied .icon-copy { opacity: 0; scale: .5; }`, `.copy-btn.is-copied .icon-check { opacity: 1; scale: 1; }`, and inside no-preference `.copy-btn.is-copied .icon-check { animation: pop 360ms var(--ease-spring) both; }` (`pop` is in `15-motion.css`).
   - `.contact__links` tiles per §6.8: grid gap 12 (md 3 columns, gap 16), `li` `min-height: 56px; border: 0; display: flex`, link tile with transition, hover `translate: 0 -2px; color: var(--brand)`, `.contact__links svg { margin-inline-start: auto; transition: translate var(--dur-2) var(--ease-out); }` and on link hover `translate: 2px -2px`. The location tile is `.contact__links li:last-child` (plain text, dashed border, per §6.8).
5. **`src/styles/80-404.css`** rewrite per §6.11 (layout, `.nf__code` gradient text with `--grad-accent`, h1, message, `.nf__schematic` with the three `i` shards). Motion, all inside `@media (prefers-reduced-motion: no-preference)` and prefixed `.js`, with `animation-fill-mode: both` (use the `both` keyword in the shorthand):
   - `@keyframes shard-in { from { opacity: .001; translate: 0 40px; } }`; `.js .nf__schematic i:nth-child(1|2|3)` → `shard-in 900ms var(--ease-rise)` delays 300 / 420 / 540ms.
   - `@keyframes wobble { 0%, 100% { rotate: 0deg; } 30% { rotate: -10deg; } 60% { rotate: 5deg; } }`; the last shard runs `shard-in 900ms var(--ease-rise) 540ms both, wobble 1200ms var(--ease-in-out) 1100ms 1 both`.
   - `.js .nf__code`, `.js .nf h1`, `.js .nf__message`, `.js .nf .btn` → `rise 900ms var(--ease-rise)` delays 0 / 120 / 200 / 280ms, `both`.
6. **`src/styles/90-footer.css`** rewrite per §6.10: `.site-footer`, `p`, `p::before` self-contained 16×14 glyph (`content: ""; display: inline-block; width: 16px; height: 14px; margin-inline-end: 10px; vertical-align: -2px;` + the same clip-path/conic background as step 3), keep the existing md+ row layout (gap `var(--space-5)`).
7. **Forced colours**: each of `50-`, `60-`, `70-`, `80-`, `90-` ends with one `@media (forced-colors: active)` block for its own elements: plates/tiles/pills (`.about__body, .experience > li, .skill-group, .services > li, .process > li::before, .filters, .card, .projects-empty, .card__repo, #contact > .container, .contact__links a`) get `border: 1px solid CanvasText`; gradient text (`.contact__email`, `.nf__code`) gets `background: none; color: CanvasText; -webkit-text-fill-color: CanvasText`; `.experience::before` and `.process::after` get `background: CanvasText`; `.nf__schematic`, `.projects-empty::before`, `.site-footer p::before` get `display: none`. Duplicating a selector already in `10-base.css` is fine; do not edit `10-base.css`.

## Interfaces
- Markup attribute: bare `data-reveal` (no value) on exactly the elements in Task 1. Expected count on `/` with current content: 7 section heads + 1 about body + experience items + 6 skill groups + 1 filters + 19 cards + 6 services + 1 process + 3 contact = ≥ 30.
- Card start tag (exact shape): `<li class="card card--{kind}" data-category="{slug}" data-kind="{kind}" data-featured="{bool}" data-reveal>`.
- JS hooks styled here, set by T-007 (do not write JS): `.card.is-tilt`, `.card.is-tilt.is-tracking`, `--rx`, `--ry` on `.card`; `.card.is-entering` + `--rd`; `.motion .process.is-pending`; `.copy-btn.is-copied` (existing, set by `40-copy.js`).
- Tokens: only names defined in `src/styles/01-tokens.css` after T-005. No new tokens, no alias tokens.

## Constraints
- Do not commit or push. Do not edit anything under `.company/`.
- Files you may change: `src/render/sections.mjs`, `src/styles/50-sections.css`, `60-work.css`, `70-contact.css`, `80-404.css`, `90-footer.css`, and the new `test/sections.test.mjs`. Do not touch `src/scripts/*`, `src/render/hero.mjs|header.mjs|head.mjs|footer.mjs|layout.mjs|page-404.mjs`, styles `00-`..`40-`, `scripts/*`, `public/*`, `content.json`, or other test files.
- CSP stays self-only: no `style="` attributes, no inline handlers, no external URLs, no new fonts/images.
- Animations/transitions animate only `transform`/`translate`/`rotate`/`scale`/`opacity` (hover `color`, `box-shadow`, `border-color`, `background-color` transitions allowed), per §5.1.4.
- Every `@keyframes` and every `animation:` declaration sits inside `@media (prefers-reduced-motion: no-preference)`. Do not weaken the global reduce rule in `10-base.css`.
- Content visible at rest and without JS: no rule outside `.motion …` / `.js …` (inside no-preference) may set `opacity: 0`, a non-zero `translate`, or `scale` < 1 on content. At rest the process line is drawn and nodes are shown.
- `backdrop-filter` is forbidden in these partials (budget of 3 is used up by T-005).
- Keep `[hidden] { display: none !important; }` working: never add `display` with `!important` to anything that can carry `hidden` (`.filters`, `.projects`, `.projects-empty`, `.copy-btn`, cards).
- Logical properties for new CSS (§8). No `font-stretch` (Outfit/Jakarta have no width axis). No `--font-mono`.
- Never put private brand names from `.company/private/` in any file.

## Acceptance criteria
- [ ] `dist/index.html` has ≥ 30 `data-reveal` attributes, exactly 7 `<header class="section-head" data-reveal>`, every `<li class="card card--` start tag ends with `data-reveal>`, `<ol class="process" data-reveal>`, `class="filters" hidden data-reveal`, and no `data-reveal` inside `<section id="top"`…`</section>`; `#work`'s lead is still `<p class="lead">` without `data-reveal`.
- [ ] `dist/404.html` has no `data-reveal`.
- [ ] `grep -E -- '--(bg|surface-2|line|line-strong|text|text-muted|text-subtle|accent|accent-hover|on-accent|accent-text|oss|radius-[123]|font-mono|fs-tag|shadow-card-hover)\b' src/styles` returns nothing; `font-stretch` appears nowhere in `src/styles`.
- [ ] `site.css` contains exactly one `@keyframes card-in` (the §5.6 version with `scale: .94`), `@keyframes shard-in`, `@keyframes wobble`, `.card.is-tilt`, `.card::after`, `.process > li:nth-child(8)`, and no `.chip` rule outside `20-components.css` (except the optional forced-colours fallback).
- [ ] `site.css` still contains `[hidden] { display: none !important; }`, at most 3 non-prefixed `backdrop-filter: var(--glass-blur)`, and is ≤ 46,080 bytes (45 KB).
- [ ] No `@keyframes` outside a `prefers-reduced-motion: no-preference` block in the files you changed.
- [ ] Existing assertions in `test/projects.test.mjs` and `test/build.test.mjs` still pass unchanged (card regex, chip regex, no `style="`, `class="filters" hidden`, copy-btn hidden, mailto link).
- [ ] Eyes-on (`npm run serve`, then open `http://localhost:<port>/` and `/404.html` in a browser if one is available to you; otherwise skip and say so): sections render as plates in dark and light (toggle `data-theme` in devtools), process draws horizontal at ≥1024px and vertical below, no horizontal scroll at 360px.
- [ ] `npm run build`, the affected tests and `npm run check:confidential` pass.

## Tests
Add `test/sections.test.mjs` (node:test, same style as `test/projects.test.mjs`: build into an `os.tmpdir()` temp dir, `t.after` cleanup):
- HTML: `data-reveal` count ≥ 30; `(html.match(/<header class="section-head" data-reveal>/g) ?? []).length === 7`; every match of `/<li class="card card--[^>]*>/g` ends with ` data-reveal>` and the number of matches equals `c.projects.length`; `html.includes('<ol class="process" data-reveal>')`; `/class="filters" hidden data-reveal/`; the hero substring (from `<section id="top"` to the first `</section>` after it) does not include `data-reveal`; `html.includes('<p class="lead">' + esc(c.projectsIntro.lead) + '</p>')`; `404.html` does not include `data-reveal`; no `style="` in either page.
- CSS (`assets/site.css`): migration regex above (build it from an array of names, test with `new RegExp('--(' + names.join('|') + ')\\b')`) does not match; does not include `font-stretch`; `(css.match(/@keyframes card-in\b/g) ?? []).length === 1` and the card-in block contains `scale: .94`; includes `@keyframes shard-in`, `@keyframes wobble`, `.card.is-tilt`, `.process > li:nth-child(8)`; `[hidden]` regex `/\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/`; `/(?<!-webkit-)backdrop-filter:\s*var\(--glass-blur\)/g` count ≤ 3; `Buffer.byteLength(css) <= 46080`.
- Partials (read `src/styles/{50-sections,60-work,70-contact,80-404,90-footer}.css` as text): for each file, every `@keyframes` index lies inside a `@media (prefers-reduced-motion: no-preference)` block (simple check: strip all `@media (prefers-reduced-motion: no-preference) { … }` blocks using a brace-matching scan, then assert the remainder contains no `@keyframes` and no `animation:`).

Commands (only these):
```
npm run build
node --test test/sections.test.mjs test/projects.test.mjs test/build.test.mjs
npm run check:confidential
```

## Out of scope
- All JS (`60-motion.js`, `61-pointer.js`, filter FLIP/leave, theme reveal, motion toggle, count-up): T-007.
- Fonts, tokens, base, components, header, hero CSS/markup: T-005 (do not edit).
- OG image, favicons, `render-images.mjs`: T-008.
- Copy, IA, heading tree, filter/menu/copy behaviour changes.
