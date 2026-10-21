# T-025-fix-r4
`test/scripts.test.mjs` fails for `82-story.js`: the file no longer starts with exactly `(function () {\n  "use strict";` because fix-r3 squeezed whitespace/identifiers to fit the 3,800-byte cap. Tech-lead decision: raise the `82-story.js` source cap to 4,000 bytes (in whichever test holds it) and restore readable identifiers/formatting and the exact header prefix. Keep the fix-r3 `:focus-visible` guard and its test.
Commands: `npm run build`; `node --test test/scripts.test.mjs test/bold-story.test.mjs`.
No commit/push; no `.company/` edits.
