# T-001-fix-r1 — Header/menu blockers from review r1 + owner content update

Context: T-001 is implemented (uncommitted). Review `.company/reviews/T-001-r1.md` returned CHANGES_REQUESTED. Original ticket: `.company/tickets/T-001-scaffold-build-hero.md`. Do NOT re-flow/re-format `src/content.json` — make only the targeted edits below (keep the existing 2-space JSON layout).

## Part A — Blocking issues (apply exactly as written in the review)
Apply **B1, B2, B3** from `.company/reviews/T-001-r1.md` section "Blocking issues" verbatim, including the test assertions they specify in `test/build.test.mjs`:
- B1 `src/styles/30-header.css`: remove the two `.skip` visibility lines; hidden transform → `translateY(calc(-100% - 16px))`; keep `.skip:focus { transform: translateY(0); }`; add the `doesNotMatch` assertion.
- B2 `src/scripts/20-nav.js`: replace the `focusout` handler with the `e.relatedTarget` version from the review.
- B3: `.js .site-header:not([data-nav-ready]) #primary-nav { display: none; }` (+ `display:block` inside the ≥768px block), set `data-nav-ready` on the header right after `resize();`, add the `match` assertion.

Also apply these cheap non-blocking items from the review: #2 (serve.mjs binds `127.0.0.1`, PORT env default 4321), #3 (tests use `os.tmpdir()`), #6 (outside-click handler only closes when `aria-expanded === 'true'`), #9 (`#primary-nav li:last-child a { border-block-end: 0; }`).

## Part B — Owner content update (decided by the site owner)
In `src/content.json`:
1. Replace every `eslamjackie@outlook.com` with `th3professionalcod3r@gmail.com` (both the hero `ctaSecondary.href` mailto and `contact.email`; search the whole file and all of `src/`/`test/` for any other occurrence).
2. Remove the project with `"id": "idempotent-session-ingest"` (repo palm-resources-01) entirely.
3. Add a new open-source project, inserted directly after the `order-payment-api` project:
```json
{
  "id": "ashur-bank-cms",
  "name": "Bilingual Banking CMS",
  "kind": "open-source",
  "category": "FinTech & Banking",
  "summary": "A bilingual (Arabic/English) content management system for a bank's public website, built on Laravel and a Filament admin panel.",
  "highlights": [
    "Role-based access control for editors and administrators",
    "Full audit log of content changes",
    "Excel import and export for bulk content",
    "Translatable content and site-wide settings managed from the admin panel"
  ],
  "stack": ["Laravel", "Filament", "PHP", "MySQL"],
  "role": "Author",
  "year": 2025,
  "repoUrl": "https://github.com/TPCT/ashurbank.iq",
  "featured": true
}
```
   If MySQL isn't certain from the data model, use `"Livewire"` instead of `"MySQL"` (Filament is Livewire-based) — prefer `"Livewire"`.
4. Ensure the content validation still passes (category exists; ids unique). If any test asserts a fixed project count or the old email, update that expectation accordingly (this is an intended data change, not a test weakening).

## Commands to run
- `npm run build`
- `node --test`
- `node --check src/scripts/20-nav.js`

## Acceptance criteria
- First Tab stop is the skip link; Tab through the open mobile menu does not close it; clicking a menu link navigates; no menu panel before JS initialises.
- `/usr/bin/grep -rn eslamjackie src test dist` → no output.
- `palm-resources-01` appears nowhere in `src/` or `dist/`; `ashurbank.iq` repo link renders on an open-source card.
- Build + all tests pass.

## Constraints
No commits/push. Don't edit `.company/`. Don't touch files beyond those named (header CSS, nav JS, serve.mjs, tests, content.json).
