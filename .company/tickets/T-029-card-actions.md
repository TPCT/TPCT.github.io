# T-029 — Card actions row: spacing + one button system (owner screenshot)

Owner: on every open-source card the "Project details" link and the "View on GitHub" pill are glued together (0px gap: `.card__more` ends where `.card__repo` starts; `.card__foot` is display:block) and they don't match (underlined text vs pill, different heights/baselines).

## Spec
1. Markup (`src/render/sections.mjs` card footer): wrap the actions in `<div class="card__actions">…</div>` after `.card__role`: open-source = `a.card__more` + `a.card__repo`; case-study = `a.card__more` + `p.card__private`. Keep all text, hrefs, vh spans, `externalAttrs()`, icons.
2. Styles (`src/styles/60-work.css`, tokens only, same visual language as the hero buttons):
   - `.card__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-block-start: 12px; }` and `gap: 16px` at ≥ 1024px.
   - Shared pill base for `.card__more`, `.card__repo`, `.card__private`: `display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 16px; border-radius: var(--r-pill); font: 600 var(--fs-small)/1 var(--font-sans); text-decoration: none; margin: 0;` (remove the old `margin-block-start: 12px` on repo/private).
   - `.card__more` = primary: `background: var(--primary-skin); color: var(--on-primary); box-shadow: var(--primary-shadow);` + a trailing arrow icon (add `icon('arrow-right', 16)` in markup; add the icon to src/lib/icons.mjs if missing — lucide path) that nudges 2px right on hover; hover uses `--primary-skin-hover`; focus-visible ring as other buttons.
   - `.card__repo` = secondary/ghost: `background: var(--control); color: var(--fg); border: 1px solid var(--control-rim); box-shadow: var(--control-shadow);` keeps GitHub (git-branch) icon + arrow-up-right.
   - `.card__private` = quiet note pill (dashed `--brand-line` border, `--muted` text, lock icon) — same height/radius/font so the row aligns.
   - ≤ 400px: `.card__actions > * { flex: 1 1 100%; justify-content: center; }` (stacked, full width).
   - Check the T-025 compact rail rules and T-012 spotlight/rim still look right (rail cards keep the actions row on one line if it fits).
3. Project pages (`src/render/project-page.mjs`, `src/styles/85-project.css`): use the same `.card__actions`-style row (class `project__actions`, sharing the same rules via a combined selector) for the GitHub button / private note and the back link, so they match. Keep the 85-project.css cap.
4. Tests: in `test/projects.test.mjs` (or a new `test/card-actions.test.mjs`): every card footer has `.card__actions` containing the two expected children in order; CSS has `.card__actions` with `display: flex` and a non-zero `gap`; `.card__more` uses `--primary-skin`; `.card__repo` uses `--control`. Update assertions that pinned the old footer markup.

## Commands
`npm run build`; `node --test` (0 fail); `npm run check:confidential`. Browser check at 1440 + 375 if Chromium launches.

## Constraints
No commit/push; no `.company/` edits; CSP self-only; keep the current look elsewhere; CSS budgets.
