# T-004: GitHub Pages workflow + README
Size: S   Depends on: T-003 (uses `check:confidential`); T-002 should be merged first so the README matches the final site   Stories: US-20, US-15 (CI gate)

## Context
The site builds with `npm run build` into `dist/`; tests run with `npm test`; `npm run check:confidential` guards leaks (T-001…T-003). Deploy target is GitHub Pages for the public user-site repo `TPCT/TPCT.github.io` with Pages `build_type: workflow`. Decisions: `.company/architecture.md` §9 (pinned action majors, verified 2026-10-21) and §12. Do not edit `.company/`; do not open `.company/private/`.

## Goal
Every push to `main` (and manual dispatch) builds, tests, runs the confidentiality check and deploys `dist/` to Pages; any failure blocks deploy. A README explains the project.

## Task
1. **`.github/workflows/pages.yml`** — exactly this structure:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
     workflow_dispatch:
   permissions:
     contents: read
     pages: write
     id-token: write
   concurrency:
     group: pages
     cancel-in-progress: false
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v7
         - uses: actions/setup-node@v7
           with:
             node-version: 22
         - run: npm run build
         - run: npm test
         - run: npm run check:confidential
         - uses: actions/configure-pages@v6
         - uses: actions/upload-pages-artifact@v5
           with:
             path: dist
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v5
   ```
   No `npm ci`/`npm install` (zero dependencies, no lockfile). No secrets. No other workflows.
2. **`README.md`** (repo root, English) with sections:
   - Title + one-line description + live URL `https://tpct.github.io`.
   - **Stack**: zero-dependency Node build (Node ≥ 20), plain HTML/CSS/vanilla JS, GitHub Pages via Actions.
   - **Project structure**: short tree of `src/`, `public/`, `scripts/`, `test/`, `.github/workflows/`.
   - **Commands**: `npm run build`, `npm run serve` (port 4321), `npm test`, `npm run check:confidential`, `npm run check`, `npm run images` (dev only; needs a local Chromium via `CHROME_PATH` and `playwright-core` via `PLAYWRIGHT_CORE`), `bash scripts/build-font.sh` (dev only).
   - **Editing content**: all copy lives in `src/content.json`; adding a project = add an object to `projects` (fields, allowed `kind` values, `category` must be in `categories`, `repoUrl` only for open source; case studies never link out). Build fails on invalid content.
   - **Confidentiality**: what the check scans; that a local, gitignored denylist may be used; never commit private hostnames, client data or private repo names.
   - **Deploy**: push to `main` → workflow builds, tests, checks and deploys; repo Settings → Pages → Source = GitHub Actions.
   - **Credits / licences**: Archivo by Omnibus-Type, SIL Open Font License 1.1 (`public/assets/fonts/OFL.txt`); icons from Lucide (ISC licence); site content © Islam Elsayed, all rights reserved.
   Keep it under ~120 lines. No badges that call third-party services other than the GitHub Actions status badge for this workflow (`https://github.com/TPCT/TPCT.github.io/actions/workflows/pages.yml/badge.svg`).

## Interfaces
Workflow file path and job names `build` / `deploy` are fixed (QA and the lead reference them).

## Constraints
- Do not change any file under `src/`, `scripts/`, `test/`, `public/` or `package.json`.
- Do not edit `.gitignore` or `.company/`. Do not commit, push, create the GitHub repo or change repo settings (the lead does that).
- README must not contain internal hostnames, private repo names or client data.

## Acceptance criteria
- [ ] `.github/workflows/pages.yml` matches the structure above (triggers, permissions, concurrency, action versions, `path: dist`, deploy `needs: build`).
- [ ] YAML parses (PyYAML command below; if PyYAML is unavailable, report that and that the file was checked by eye).
- [ ] README covers every section listed; commands in it match `package.json` scripts exactly.
- [ ] `npm run check:confidential` still exits 0 after adding these files.

## Tests
No new test files. Commands to run (only these):
```
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pages.yml')); print('yaml ok')" || echo "PyYAML unavailable"
npm run build
npm run check:confidential
```

## Out of scope
Creating the remote repo, enabling Pages (`build_type: workflow`), first push, live verification — all lead/QA tasks.
