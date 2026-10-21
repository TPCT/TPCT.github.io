# T-019-fix-r1 — update stale invariants to T-019's intended behaviour
T-019 intentionally adds `/work/<id>/` pages. Three older tests still pin the old invariants; update them to the NEW invariants (keep them strict):
1. `test/sections.test.mjs:69` (career test) — find what conflicts with T-019 (likely card/link or page-count assumptions) and update to the new markup; career assertions themselves stay.
2. `test/seo-meta.test.mjs:12` — case-study entries in the JSON-LD ItemList may now carry an internal `url` = `https://tpct.github.io/work/<id>/`; still assert NO external/repo URL for case studies and that open-source entries keep `codeRepository`.
3. `test/seo.test.mjs:12` — sitemap now lists the home page + every `/work/<id>/` page (count = projects + 1), each with `lastmod`; case-study cards may contain exactly one `<a>` whose href is `/work/<id>/` and no other link (still no external links).
Commands: `npm run build`; `node --test` (must be 0 fail); `npm run check:confidential`.
No commit/push; no `.company/` edits; no product-code changes unless a test reveals a real bug (then report it).
