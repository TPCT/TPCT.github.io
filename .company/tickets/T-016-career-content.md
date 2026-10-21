# T-016 — Real career history: Experience section, hero/about/stats, new case study

## Why
The owner supplied his full LinkedIn experience. The Product Owner turned it into final copy: `.company/content-career.json` (read its `_notes` key first — it explains the merge; `_notes` itself is NOT merged). This ticket merges it and rebuilds the Experience section as a real, grouped career history in the current Prism/ShiftCodes style. The Journey timeline (T-013) renders `.company/timeline.json` later — not here.

## Part A — Content merge (`src/content.json`, don't re-format the rest of the file)
Apply exactly as `content-career.json` says: replace `experience` (new shape), `stats`, `hero.roles`, `hero.headline`, `hero.subheadline`, `about.paragraphs`; apply `projectPatches` (e.g. `national-waste-analytics`: year 2025 + new highlights; `aic-operations-suite` stays 2026) and insert `projectsAdd` (new case study `multi-vendor-restaurant-platform`, no links) at the position the notes give; apply `timelineIntro` only if the key already exists in content.json, else store it for T-013 under `timelineIntro`.
Also (lead decision, PO's out-of-scope item 10): update `site.title`, `site.description`, `site.ogImageAlt` (if present) and `hero.reach` so they no longer say "Founder" / are consistent with "CEO @ ShiftCodes · Technical Team Lead & Consultant · Senior Full-Stack Engineer" and the 9+ years; keep them short (title ≤ 60 chars, description ≤ 160 chars). The JSON-LD `jobTitle` derives from `hero.roles` — check it still reads well.

## Part B — Validation (`src/lib/validate.mjs`)
New experience shape: array of `{ org, orgUrl?, location, type, roles: [{ title, start: "YYYY-MM", end: "YYYY-MM" | null, highlights: string[1..3] }] }`. Validate: required strings, `orgUrl` https-only when present, `start`/`end` match `^\d{4}-(0[1-9]|1[0-2])$`, `end` null or ≥ `start`, roles non-empty. Remove the old `role org orgUrl location summary` rule.

## Part C — Renderer + styles (`src/render/sections.mjs`, `src/styles/50-sections.css`)
Render `#experience` as an ordered career list (keep section id, index pill numbering and `data-reveal` hooks):
```
<ol class="career">
  <li class="career__org" data-reveal>
    <div class="career__head"><h3>{org (external link if orgUrl, existing external() helper + new-tab sr text)}</h3><p class="career__meta">{type} · {location}</p></div>
    <ol class="career__roles">
      <li class="career__role"><p class="career__title">{title}</p><p class="career__dates"><time datetime="YYYY-MM">Mon YYYY</time> – <time …>Mon YYYY</time>|Present · {duration like "1 yr 7 mos"}</p><ul class="career__points">{highlights}</ul></li>
    </ol>
  </li>
</ol>
```
- Dates formatted at build time in English (`Aug 2026`, `Present`); duration computed at build (inclusive months, LinkedIn style: "1 yr 7 mos", "8 mos"); "Present" computed against the build date — fine.
- Visual: a compact vertical rail on the left of the list (2px `--brand-line`, the same violet language as the T-015 spine), each company a frosted plate (existing plate tokens) with the org name in `--font-display`, meta in `--muted`; multi-role companies show roles stacked with small violet dots on an inner rail; current roles (end null) get a small "Now" chip (`--brand-tint` bg, `--brand` text). Two columns of companies on ≥ 1024px is NOT wanted — single column, max-width ~ 860px, so it reads as a story; dense but airy (use the T-015 rhythm tokens, no big gaps).
- Long list (13 companies): show the 6 most recent expanded; the rest inside a native `<details class="career__more"><summary>Earlier roles (2017–2022)</summary>…</details>` (label from content: add `sections.experience.moreLabel` or similar key + validate). Works without JS; summary is keyboard-accessible; style the summary as a secondary button.
- `.exp__*` classes become unused → remove their CSS (and `.exp__loc` rule) to keep CSS budget.
- Stats strip renders 4 items now: make the stats grid handle 4 (2×2 on < 768px, 4 columns ≥ 1024px), keep count-up working (values like "3s → 500ms" and "$15k → $2k" are not pure numbers: count-up must only animate the leading number of simple numeric values like "9+" / "~250" and leave composite values static — check `60-motion.js` handles that gracefully; fix if not).

## Tests
- `test/content.test.mjs`: new experience validation (good data passes; bad month, end < start, missing roles each fail with a clear message); stats length 4.
- `test/build.test.mjs` / `test/sections.test.mjs`: `#experience` contains `class="career"`, 13 `career__org` items, a `<details class="career__more">`, `<time datetime="2017-03">` present, "Present" present; no `exp__summary`; the new case study card renders with no `<a`; national-waste-analytics shows 2025.
- `npm run check:confidential` passes (company names are allowed; no hostnames / private repo names).

## Commands
`npm run build`; `node --test test/content.test.mjs test/build.test.mjs test/sections.test.mjs test/projects.test.mjs test/scripts.test.mjs`; `npm run check:confidential`.

## Constraints
No commit/push; no `.company/` edits. CSP self-only, no inline styles. Reduced motion respected; content visible at rest/no-JS. No horizontal overflow 360–1440. Keep CSS/JS caps (raise CSS cap by ≤ 4 KB raw only if needed and say so).
