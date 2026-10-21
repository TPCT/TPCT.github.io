# T-007-fix-r1 — finish the addendum (CSS) + budget decision

Codex report `.company/runs/T-007-prism-motion-js-*.md` flagged: pointer budget exceeded and missing CSS for the addendum features. Tech-lead decisions:
1. `61-pointer.js` source budget: raise the cap in its test from 1900 to 4096 bytes (the addendum added logo parallax + cursor glow + replay). Total `site.js` cap stays as is (currently 15,487 — must stay under it).
2. Add the missing CSS (in `src/styles/15-motion.css` or `40-hero.css`, tokens only, no inline styles):
   - `.cursor-glow`: `position: fixed; inset: 0 auto auto 0; width: 480px; height: 480px; margin: -240px 0 0 -240px; border-radius: 50%; pointer-events: none; z-index: 0; background: radial-gradient(circle, var(--glow-a), transparent 65%); opacity: 0; transition: opacity 400ms var(--ease-out); will-change: transform;` + `mix-blend-mode: screen` (dark) / `multiply` (light, `[data-theme="light"] .cursor-glow`). Visible state class set by the JS (use whatever class `61-pointer.js` toggles, e.g. `.is-on { opacity: .9 }`). Hidden entirely (`display: none`) under `(pointer: coarse)`, `(prefers-reduced-motion: reduce)` and the paused-motion state. Make sure page content stays above it (main content z-index ≥ 1) and it never causes horizontal overflow.
   - Logo replay: the class the JS toggles on `.sc-hero` to restart the assemble animation must re-run the T-009 assemble keyframes (e.g. `.sc-hero.is-replay .sc-mark #…` with the same animations; JS removes/re-adds the class with a reflow).
3. The build CLI stderr assertion failure Codex saw is environment-only (passes outside the sandbox) — don't change it.
4. Browser check: Codex's sandbox can't listen on a port; skip it (the reviewer does eyes-on).
Commands: `npm run build`; `node --test test/scripts.test.mjs test/build.test.mjs`; `npm run check:confidential`.
No commit/push; no `.company/` edits.
