# T-013: W-4 "Journey" timeline section (content, validation, render, CSS, draw JS)
Size: M   Depends on: T-010 (caps raised), T-015 (landed)   Stories: owner request "و يكون في timeline" (2026-10-21), US-14 (motion)
Parallel: may run at the same time as T-011 or T-012 (disjoint files). It must finish BEFORE T-014 starts, because both edit `src/render/sections.mjs`. Max 2 Codex runs at once.

## Goal
A first-class "Journey" section between Experience and Stack shows 15 real milestones, 2016 → 2026, on a vertical line:
- the line draws as you scroll, with a spark riding its tip
- each node pops violet when the line reaches it
- cards slide in toward the line
- the last node keeps a soft "now" pulse

Without JS or with reduced motion, it is a complete static, fully drawn timeline.

## Files (only these)
- `src/content.json`: add `sections.timeline`, `timelineIntro`, `timeline`, the nav item, and the `year` on one project (details below)
- `src/lib/validate.mjs`: timeline validation
- `src/render/sections.mjs`: new exported `renderTimeline(c)`; renumber indices in the other renderers (index strings only)
- `scripts/build.mjs`: import and render order
- `src/scripts/50-scrollspy.js`: one mapping entry
- `src/styles/30-header.css`: one media block for nav fit
- new `src/styles/55-timeline.css`
- new `src/scripts/73-timeline.js` (≤ 1,250 bytes raw)
- new `test/timeline.test.mjs`
- update pins (intended change only): `test/sections.test.mjs` (section-head count), `test/projects.test.mjs` (h2 count, section order, project year)

## Spec (normative): `.company/ux-wow.md`
- §1 Global rules 1–10.
- §6.1 Placement, the indices table, the nav item and the nav-fit CSS.
- §6.2 Content shape and validation.
- §6.3 Markup, verbatim.
- §6.5 CSS: copy it verbatim into `55-timeline.css`.
- §6.6 JS behaviour.
- §6.7 States.

### Baseline T-015 (assume landed) and spine consistency (lead decisions)
- **Rhythm:** the Journey section is a normal `main > section` built with `section()`. It gets the one-pad gap from T-015 automatically, so add NO section padding or margins. In `55-timeline.css`, change `.tl__lead { … margin-block-end: var(--space-7) }` to `var(--space-6)` to match T-015's section-head gap.
- **Chapter node:** the Journey head is a standard `.section-head`, so it gets T-015's spine node and connector for free. Do not style `.section-head` or the pill here.
- **Same violet line as the spine.** The timeline line must read as a branch of the T-015 spine. Override these ux-wow §6.5 declarations:
  - `.timeline::before` (track): `background: linear-gradient(180deg, transparent, var(--brand-line) 6%, var(--brand-line) 94%, transparent);`. This is the same gradient as `.spine__track`.
  - `.timeline::after` (fill): `background: linear-gradient(180deg, var(--logo-a), var(--cyan));`. This is the same gradient as `.spine__fill`. Keep `transform-origin: 50% 0; scale: 1 var(--tl-p, 1);`.
  - Both stay 2px wide, like the spine.
  - Before writing them, open T-015's spine CSS (grep `spine__track`/`spine__fill` in `src/styles/`). If its gradients differ from the two above, copy T-015's exact values instead, so the lines are identical. Do not edit T-015's files.
  - `.tl__spark` keeps the ux-wow look. The lit node colour stays `--primary-skin` (violet) and matches the spine's lit chapter nodes (`--logo-b`).
- **`.is-lit` scoping:** T-015 uses `.is-lit` on chapter nodes. Every timeline rule must be scoped as `.tl__item.is-lit` / `.tl.is-drawing …`, as written in §6.5. Before finishing, grep `is-lit` in `src/styles/`: no T-015 rule may match `.tl__item`, and no timeline rule may match `.section-head`. If one does, report it; do not edit T-015 files.
- **Index renumbering:** after this ticket, the 8 `.section-head__index` pills read `01`…`08` in DOM order, with Journey = `03` (table below). If T-015 changed how indices are produced (e.g. computed instead of literal strings in `section()` calls), use that same mechanism. Do not hard-code a second scheme.
- **Spine length:** the spine spans `main` from the hero to Contact. Adding a section must not need any spine change. If T-015 hard-coded section ids or counts for the spine/chapter nodes in a file you own here, update it there only; if it is in a T-015 file, report it.

### Content (exact)
1. `site.nav`: insert `{ "label": "Journey", "href": "#timeline" }` directly after the About item, giving 6 items.
2. `sections`: add `"timeline": "Journey"`.
3. Add a top-level `timelineIntro`:
   ```json
   "timelineIntro": {
     "title": "The journey so far",
     "lead": "From the first public commit in 2016 to founding ShiftCodes: the companies, client systems, open-source work and milestones along the way.",
     "kindLabels": { "company": "Company", "client": "Client work", "open-source": "Open source", "milestone": "Milestone" },
     "linkLabel": "Learn more"
   }
   ```
4. Add a top-level `timeline`: copy the array in `.company/timeline.json` **verbatim** (15 entries, same order, same keys and values; do not re-sort, re-word or add links). Read the file; do not edit it.
5. Projects (owner-supplied years, user 2026-10-21):
   - `national-waste-analytics`: add `"year": 2025`, placed after `"role"`, like the other projects.
   - `aic-operations-suite`: must have `"year": 2026`. It already does, so keep it and do not duplicate the key.
6. No other copy changes.

### Validation (`validateContent`), all errors unless noted
- `timeline`: a required, non-empty array.
- Each item:
  - `title` and `text` are non-empty strings.
  - `kind` ∈ `company|client|open-source|milestone`.
  - `year` is an integer 1990–2100 OR a string matching `/^\d{4}(\s?[–-]\s?(\d{4}|now|present))?$/i`.
  - `link`, if present, is either an `https://` string or an object with a non-empty string `label` and an `https://` `href`.
  - Error paths look like `timeline[3].kind: invalid kind` (follow the existing `projects[i].field` style).
- `timelineIntro`: `title lead linkLabel` are non-empty strings, and `kindLabels` has all 4 keys as non-empty strings.
- `sections.timeline`: a non-empty string. Add it to the existing `strings(c.sections, …)` key list.
- **Warning** (not an error) when the leading 4-digit years (`String(year).slice(0, 4)`) are not non-decreasing: `timeline: years out of order at [i]`.

### Render
- `renderTimeline(c)` uses the existing `section('timeline', '03', c.sections.timeline, c.timelineIntro.title, body)` and `external(href, label, 'text-link', c.a11y.newTab)` helpers. Markup is exactly §6.3:
  - The lead is `<p class="lead tl__lead" data-reveal>`.
  - `.tl > .tl__spark[aria-hidden] + ol.timeline > li.tl__item.tl__item--{kind}`, with `.tl__node[aria-hidden]`, `<time class="tl__year">`, and `article.tl__card[aria-labelledby="tl-{i}"][data-reveal]` containing `.tl__meta > .tl__kind`, `h3#tl-{i}`, `.tl__text`, and the optional `.tl__more`.
  - A string `link` is labelled with `timelineIntro.linkLabel`; an object link uses its own `label`.
  - `datetime="YYYY"` only when `String(year)` is exactly 4 digits.
  - `tl__item--same-year` on the `li`, plus `vh` on the `<time>`, when `String(year)` equals the previous item's.
  - Everything goes through `esc`/`attr`.
- Index strings: about `01`, experience `02`, timeline `03`, skills `04`, work `05`, services `06`, process `07`, contact `08`.
- `build.mjs` order: `renderHero, renderAbout, renderExperience, renderTimeline, renderSkills, renderWork, renderServices, renderProcess, renderContact`.

### Scroll-spy and header
- `50-scrollspy.js` mapping gains `timeline: 'timeline'`. Change nothing else; the file grows by at most 40 bytes.
- `30-header.css`: append, after the existing `@media (min-width: 768px)` block:
  `@media (min-width: 768px) and (max-width: 1023px) { #primary-nav a { padding-inline: 10px; font-size: .875rem; } #primary-nav ul { gap: 2px; } }`

### JS `73-timeline.js` (§6.6)
- Gate: `html.motion` + `.tl` + `.timeline`.
- `measure()`: `H` and the node centre `ys[i]` from `offsetTop`.
- Init:
  - If the list bottom is above `innerHeight * .6`, return and leave everything drawn and lit.
  - Otherwise add `is-drawing`, measure, and run `frame()`.
- `frame()`:
  - Throttle with one rAF via a passive `scroll` listener; on `resize`, re-measure first.
  - `q = clamp((innerHeight*.6 - top) / H, 0, 1)`; `p = max(p, q)`. The draw is monotonic.
  - Set `--tl-p` (`toFixed(4)`) and `--tl-y` (`toFixed(1) + 'px'`) on `.tl` via `style.setProperty`.
  - Add `is-lit` once per item when `p*H >= ys[i] - 2`.
  - At `p === 1`: add `is-done` and remove the listeners.
- `finish()` (`p = 1`, then `frame()`) runs on `focusin` inside `.tl` and on `beforeprint`.
- The motion toggle does not pause the draw; the CSS pauses the "now" pulse.

## Acceptance
- [ ] `node -e` check (below) proves `content.timeline` deep-equals `.company/timeline.json`.
- [ ] `validateContent(content).errors` is empty and there is no out-of-order warning for the real content.
- [ ] Built `index.html`:
  - `#timeline` sits between `#experience` and `#skills`.
  - Nav order is About, Journey, Stack, Work, Services, Contact.
  - The 8 index pills read `01 / …` … `08 / …` in DOM order.
  - There are 15 `.tl__item`, each with `tl__item--{kind}`.
  - Every `<time>` has `datetime`, since all years are integers here.
  - Repeated years carry `vh` and `tl__item--same-year`. The first 2025 and the first 2026 entries do not.
  - Every `.tl__node`/`.tl__spark` is `aria-hidden="true"`.
  - The 6 links are `target="_blank" rel="noopener noreferrer"`, carry the vh new-tab text, and point to `https://github.com/TPCT/…`.
- [ ] The `national-waste-analytics` card shows `<span class="card__year">2025</span>`, and the `aic-operations-suite` card shows `2026`.
- [ ] **Confidentiality:**
  - The rendered `#timeline` section passes `checkConfidential` with zero hits, using the hostname rule plus the private denylist when it is present.
  - It contains no hrefs other than `https://github.com/TPCT/…`.
  - `npm run check:confidential` exits 0.
- [ ] `55-timeline.css`: the `.timeline::before`/`::after` gradients equal the spine track/fill gradients from T-015. `.tl__lead` uses `var(--space-6)`. Every `@keyframes`/`animation:` sits inside `@media (prefers-reduced-motion: no-preference)`. At rest (no `.tl.is-drawing`), the line is fully drawn (`--tl-p` defaults to 1) and all nodes are lit.
- [ ] `73-timeline.js` is ≤ 1,250 bytes with the IIFE header. `50-scrollspy.js` contains `timeline:'timeline'` (any quoting/spacing). The vm smoke test still passes.
- [ ] No `style="` in the output. No new focusable elements except the real timeline links. h2 → h3 with no skipped levels.

## Tests
New `test/timeline.test.mjs`:
- `validateContent` rejects each of these:
  - a missing or empty `timeline`
  - a bad `kind`
  - a bad year (`1980`, `'20x6'`)
  - an `http://` link
  - a link object without `label`
  - a missing `timelineIntro.kindLabels.client`
  - a missing `sections.timeline`
- It accepts the string link and the `{ href, label }` link, and a range year `'2024–now'`. It warns, without erroring, when years go out of order.
- Build into a `mkdtemp` dir and check all of the built-HTML acceptance items above.
- `renderTimeline` with a 1-item fixture whose title is `<b>"&` produces escaped output. A `{ href, label }` link renders its label.
- **Confidentiality test:**
  - Extract the `<section id="timeline"` … `</section>` HTML from the build and write it to `<tmpRoot>/dist/index.html`.
  - Call `checkConfidential({ root: tmpRoot, dist: 'dist', denylist: <absolute path of repo .company/private/denylist.txt>, git: false })` from `scripts/check-confidential.mjs` and assert `hits` is `[]`.
  - If `denylistLoaded` is false (CI), still assert the hostname rule and call `t.diagnostic('denylist absent: hostname rule only')`.
  - Assert every `href` in that section matches `^https://github\.com/TPCT/`.
- Source checks: `73-timeline.js` byte cap; `50-scrollspy.js` mapping.
- Spine consistency: the CSS bundle's `.timeline::after` background string equals the `.spine__fill` background string, and `.timeline::before` equals `.spine__track`. Parse both from the built `site.css`.
- The 8 index pills read `01`…`08` in DOM order.

Update existing pins (intended):
- `test/sections.test.mjs`: the section-head count goes `7` → `8`.
- `test/projects.test.mjs`:
  - the h2 count goes `7` → `8`
  - the section-order ids are `['top','about','experience','timeline','skills','work','services','process','contact']`
  - drop `national-waste-analytics` from the "no card__year" list and assert its card contains `<span class="card__year">2025</span>`

Do not weaken any other assertion.

## Commands (affected only; do NOT run `npm test`)
```
node --test test/timeline.test.mjs test/content.test.mjs test/projects.test.mjs test/sections.test.mjs test/scripts.test.mjs test/build.test.mjs test/seo.test.mjs $(ls test/rhythm.test.mjs 2>/dev/null)
npm run build
npm run check:confidential
node -e "const a=require('./src/content.json').timeline,b=require('./.company/timeline.json');require('assert').deepStrictEqual(a,b);console.log('timeline verbatim OK',a.length)"
```

## Out of scope
- T-015 files (`01-tokens`, `10-base`, `20-components`, `40-hero`, `15-motion`, `90-footer` CSS, `layout.mjs`, `60-motion.js`, `62-spine.js`) and the spine itself.
- Marquee and `renderSkills` body changes (T-014). Only renumber the index strings in renderers here.
- Editing `.company/timeline.json` or any `.company/` file.
- CSS scroll-timelines for the line draw: it is JS-driven by decision.
- Re-sorting entries.
- Adding links that are not in the PO file.
- Any T-007 file.

## Constraints
- No commit, no push. No edits under `.company/`; it is read-only here.
- CSP self-only: no inline `style` attributes, no `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`cssText`/`setAttribute('style')`/`eval`/`new Function`. CSSOM `style.setProperty` is allowed. No network.
- No third-party libraries.
- Animate only transform/translate/scale/opacity. The spark's custom property is the one allowed paint exception. No `filter`/`box-shadow` keyframe animation, no `will-change`.
- Reduced motion or no JS → a fully drawn line, all nodes lit, no spark, no pulse, static visible cards. The pause toggle freezes the "now" pulse; the scroll-linked draw is not a loop. Card hover-lift only on `(hover: hover) and (pointer: fine)`.
- Content stays visible at rest and without JS. JS only adds `is-drawing`/`is-lit`/`is-done`, and `focusin`/`beforeprint` finish the draw immediately.
- Timeline copy must stay anonymised exactly as in the PO file. No client names beyond those already public in `src/content.json`, no hostnames other than `github.com/TPCT`.
