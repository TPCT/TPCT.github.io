# T-020 — Google Search Console verification meta (urgent)
Add to the `<head>` of the HOME page (where the other meta tags are rendered, `src/render/head.mjs`), right after the meta description:
`<meta name="google-site-verification" content="PsjjRMzW2cVBwfM-sNSoLjfU_tR097ytc5RXKuP5dNE">`
(public token). Keep the CSP/hash logic untouched. Add an assertion to `test/seo.test.mjs` that `dist/index.html` contains exactly that tag.
Commands: `npm run build`; `node --test test/seo.test.mjs`.
No commit/push; no other changes.
