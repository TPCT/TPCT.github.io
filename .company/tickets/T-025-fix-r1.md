# T-025-fix-r1 — make the Work rail actually engage on common desktops
Codex report `.company/runs/T-025-bold-story-*.md`: at 1440×900 the rail height is 885px > the 728px limit, so Work always falls back to the grid; also the Contact spacer rule is overridden by existing Contact CSS (pin spacing 1438px vs 1080px).
Tech-lead decisions:
1. Compact rail cards (rail mode only, i.e. under the class that T-025 adds when the rail is active/eligible — not the grid): card width ~ min(420px, 32vw); summary clamped to 3 lines (`-webkit-line-clamp`/`line-clamp`), highlights limited to the first 2 items (CSS `li:nth-child(n+3){display:none}` in rail mode), stack chips limited to one row (overflow hidden, max-height one chip row), tighter padding (22px). Target: rail height ≤ min(728px, 100vh − header − 96px) at 1440×900 and 1280×800. Keep the same visual style (glass, chips, rim/spotlight). Measure eligibility against the compact height, so the rail engages at 1440×900, 1280×800 and 1920×1080; still falls back below 1024px width or under ~700px height.
2. Contact spacing: raise the specificity of the spacer rule (or adjust the conflicting Contact rule in the same partial T-025 owns) so pin spacing matches the spec (±10%).
3. Rail keyboard + filters: verify (in tests/vm or by code) that filtering re-measures the rail and focused cards scroll into view inside the rail.
Commands: `npm run build`; `node --test` for the story tests; browser check at 1440×900 and 1280×800 if Chromium launches.
No commit/push; no `.company/` edits.
