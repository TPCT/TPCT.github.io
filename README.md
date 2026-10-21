# Islam Elsayed — Portfolio

Personal portfolio of Islam Elsayed, systems architect and senior full-stack engineer.

Live site: [https://tpct.github.io](https://tpct.github.io)

## Stack

- Zero-dependency Node build; requires Node ≥ 20.
- Plain HTML, CSS and vanilla JavaScript.
- GitHub Pages deployment via GitHub Actions.

## Project structure

```text
src/                  Content, renderers, styles and browser scripts
public/               Static assets copied to dist/
scripts/              Build, preview and development tools
test/                 Node tests
.github/workflows/    GitHub Pages deployment workflow
```

## Commands

No dependency installation is needed for the build or tests.

| Command | Purpose |
| --- | --- |
| `npm run build` | Validate content and build the site into `dist/`. |
| `npm run serve` | Serve `dist/` locally at `http://127.0.0.1:4321` (build first). |
| `npm test` | Run the Node test suite. |
| `npm run check:confidential` | Scan generated output and repository files for confidential terms. |
| `npm run check` | Run build, tests and confidentiality check in sequence. |
| `npm run images` | Development only: regenerate social images and icons. |
| `bash scripts/build-font.sh` | Development only: download and subset Archivo using Python font tools. |

Image generation needs a local Chromium executable via `CHROME_PATH` and an
externally installed `playwright-core` module via `PLAYWRIGHT_CORE` (module path).
The font script needs Python with venv/pip and curl; it installs fonttools and
brotli in a temporary environment. Generated assets are used by the normal build.

## Editing content

All copy lives in `src/content.json`. To add a project, add an object to `projects`
with these fields:

- `id`: unique lowercase letters, digits and hyphens.
- `name`, `summary`, `role`: non-empty strings.
- `kind`: `case-study` or `open-source`.
- `category`: an existing entry in the top-level `categories` array.
- `highlights`, `stack`: non-empty arrays of non-empty strings.
- `featured`: boolean.
- `year`: optional integer from 1990 to 2100.
- `repoUrl`: required only for open source; an HTTPS repository URL under
  `https://github.com/TPCT/`.

Omit `repoUrl` for case studies; case studies never link out.
The build fails on invalid content. Rebuild after editing to preview changes.

## Confidentiality

`npm run check:confidential` scans text files in `dist/` and tracked plus untracked,
non-ignored repository files for protected hostname patterns and denylisted terms.
Binary files, test fixtures and the private directory are excluded from the
repository scan. Build first; missing `dist/` fails the check.

A local, gitignored denylist may be used at `.company/private/denylist.txt`, with
one term per line; blank lines and lines starting with `#` are ignored. If absent,
the denylist is skipped and the built-in hostname check still runs.
Never commit private hostnames, client data or private repository names.

## Deploy

Push to `main` (or manually dispatch the Pages workflow) to build, test, run the
confidentiality check and deploy `dist/` to GitHub Pages. Any failed step blocks
deployment. In repository **Settings → Pages → Source**, select **GitHub Actions**.

## Credits / licences

- Archivo by Omnibus-Type: SIL Open Font License 1.1;
  see [public/assets/fonts/OFL.txt](public/assets/fonts/OFL.txt).
- Icons from Lucide: ISC licence.
- Site content © Islam Elsayed, all rights reserved.
