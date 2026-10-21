# T-027 — kinetic hero: never leave the name hidden
From `.company/reviews/T-024-r2.md`: if the intro curtain animation is cancelled before it starts, the name can stay hidden. In `src/scripts/81-kinetic.js` use `await a.ready.catch(()=>{})` and fall back to `finish()` (letters shown) on cancel/error; also a hard timeout fallback (name fully visible ≤ 3000ms no matter what). The file is at 2,398/2,400 bytes: you may raise its cap to 2,600 in its test. Add a vm test for the cancelled-curtain path.
Only edit `src/scripts/81-kinetic.js` and its test file (T-025 runs in parallel on other files).
Commands: `npm run build`; `node --test` for the kinetic test.
No commit/push; no `.company/` edits.
