# T-030 — Hero CTAs + Contact actions in one button system (owner feedback)

Owner: "and the Start a conversation button" (+ screenshot of the hero's plain "GitHub ↗" text link). Findings (live): "Start a conversation" is `mailto:` — on machines without a mail client it does nothing, so it looks broken; hero "GitHub" is a plain `.text-link` (44px) on its own line, inconsistent with the two 52px buttons.

## Spec
1. Hero CTAs (`src/render/hero.mjs`, `src/content.json` → `hero.ctaSecondary.href` = `#contact`; validation: allow `#…` for ctaSecondary instead of requiring `mailto:` — update the validator + its test):
   - "Start a conversation" → `href="#contact"` (in-page; Lenis/anchor handling from T-023 already smooth-scrolls and moves focus — verify it lands with the contact heading visible, no offset bug). Keep its mail icon, `btn btn--secondary`.
   - "GitHub" → `a.btn.btn--ghost` (new ghost variant in `src/styles/20-components.css`, same 52px height/radius/font/padding as `.btn`, transparent bg, 1px `--control-rim` border, `--fg` text, hover `--brand-tint` bg): GitHub (git-branch) icon + label + arrow-up-right icon + vh "opens in new tab", `externalAttrs()`.
   - `.hero__ctas`: `display: flex; flex-wrap: wrap; gap: 12px;` — all three on one row at ≥ 768px (nowrap there if they fit; check 768/1024/1440); ≤ 480px stacked full-width in order primary → secondary → ghost, centred content.
2. Contact (`src/render/sections.mjs` contact, `src/styles/70-contact.css`):
   - Email as a big glass card `.contact__email-card`: label, the address in `--font-display` (large, selectable text, `overflow-wrap` as in T-009 with `<wbr>`), and an actions row (same `.card__actions`-style flex + gap from T-029): **"Copy email"** primary pill (existing copy JS in `40-copy.js` — keep its behaviour: clipboard → "Email copied ✓" state + live-region announce, select-text fallback; make the copied state a visible toast-like pill change with the check icon) and **"Open in mail app"** ghost pill (`mailto:`; content key `contact.mailAppLabel` = "Open in mail app", validate).
   - Links row: LinkedIn, GitHub, ShiftCodes as matching ghost pills with icons (linkedin icon — add lucide `linkedin` to icons.mjs if missing; git-branch; globe or the ShiftCodes mark at 16px) + arrow-up-right, `externalAttrs()`, `rel="me"` kept on GitHub/LinkedIn. Flex wrap + gap; ≤ 480px full width stacked.
3. Audit: every `.text-link` used as a call-to-action across home + project pages + 404 → button system (`btn--secondary`/`btn--ghost` pills). Plain inline text links inside prose (e.g. timeline entry links, footer small links) may stay text links — list what you changed vs kept in the report.
4. Tests: hero has 3 `.btn` CTAs, secondary href `#contact`, GitHub is `.btn--ghost` with `target="_blank"`; contact has `.contact__email-card`, a copy button, a mailto ghost pill, and 3 social pills; `.hero__ctas` CSS has flex + gap; validator accepts `#contact` and rejects `javascript:`; no `.text-link` in `.hero__ctas`.

## Commands
`npm run build`; `node --test` (0 fail); `npm run check:confidential`.

## Constraints
No commit/push; no `.company/` edits; CSP self-only; keep the current look/palette; reduced-motion/no-JS (no-JS: the Copy button is hidden or degrades to the visible selectable email + mailto pill).
