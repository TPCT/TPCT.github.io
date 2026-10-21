# T-010-fix-r1 — field self-disables on touch; resize shrink; visibility
Review `.company/reviews/T-010-T-017-r1.md`. Only edit `src/scripts/70-field.js`, `src/styles/41-field.css`, `test/wow-field.test.mjs`.
1. Blocking 1: apply the review's fix exactly (`p/90>24` → `p/90>(o?24:48)` or equivalent readable form) so the 30fps touch profile isn't judged "slow"; add a vm test.
2. Blocking 2: separate flags for "first check was fast" and "particles were reduced" (review's fix with a new flag), used in the resize re-fit; add a vm test.
3. Owner priority = visible wow: the dark-theme field is too faint. Raise particle/link opacity in DARK only (via the existing CSS vars/tokens in 41-field.css, e.g. dot alpha ~.55→.8, link alpha cap ~.18→.35, cursor-link colour `--cyan` at ~.6) while keeping text contrast: field must stay behind content and never reduce hero text contrast below AA (it sits under the text; keep the existing text-side fade/mask if any, or add a mask that fades the field to ~35% under the left text column on ≥1024px).
Commands: `npm run build`; `node --test test/wow-field.test.mjs test/scripts.test.mjs`. Keep the 4,096-byte source cap.
No commit/push; no `.company/` edits.
