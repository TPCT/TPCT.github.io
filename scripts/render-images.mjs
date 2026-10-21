import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { esc } from '../src/lib/html.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const root = fileURLToPath(new URL('../', import.meta.url));
const c = JSON.parse(await readFile(path.join(root, 'src/content.json'), 'utf8'));
const font = pathToFileURL(path.join(root, 'public/assets/fonts/archivo-var.woff2')).href;
const mono = '"DejaVu Sans Mono","Liberation Mono",monospace';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const tmp = await mkdtemp(path.join(os.tmpdir(), 'tpct-images-'));
try {
  await mkdir(path.join(root, 'src/images'), { recursive: true });
  await mkdir(path.join(root, 'public/assets'), { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  let x = 80;
  const boxes = c.hero.domains.map(domain => {
    const width = domain.length * 12.34 + 32;
    const svg = `<rect x="${x}" y="448" width="${width}" height="44" rx="4" fill="#13131C" stroke="#6A6A7A"/><text x="${x + 16}" y="477" class="domain">${esc(domain.toUpperCase())}</text>`;
    x += width + 14; return svg;
  }).join('');
  const makeSvg = size => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><style>@font-face{font-family:Archivo;src:url('${font}');font-weight:400 800;font-stretch:100% 125%}text{font-family:Archivo;fill:#ECEAE3}.mono,.domain{font-family:${mono.replaceAll('"', '&quot;')}}.domain{font-size:18px;letter-spacing:1.5px}</style><rect width="1200" height="630" fill="#0B0B12"/><rect x="40" y="40" width="1120" height="550" fill="none" stroke="#24242F"/><path d="M40 56V40H56 M1144 40H1160V56 M40 574V590H56 M1144 590H1160V574" fill="none" stroke="#F2A93B" stroke-width="2"/><rect x="80" y="99" width="12" height="12" fill="#F2A93B"/><text x="104" y="111" class="mono" style="font-size:20px;letter-spacing:3px;fill:#82828F">${esc(c.hero.eyebrow.toUpperCase())}</text><text id="name" x="80" y="250" style="font-size:${size}px;font-weight:800;font-stretch:118%;letter-spacing:-2px">${esc(c.hero.name)}</text><text x="80" y="318" style="font-size:34px;font-weight:600;fill:#F2A93B">${esc(c.hero.roles[0])}</text><text x="80" y="364" style="font-size:34px;font-weight:500;fill:#A3A3B0">${esc(c.hero.roles.slice(1).join(' · '))}</text><path d="M80 470H1112" stroke="#6A6A7A" stroke-width="2"/>${boxes}<rect x="1106" y="464" width="12" height="12" transform="rotate(45 1112 470)" fill="#F2A93B"/><text x="80" y="556" class="mono" style="font-size:20px;fill:#A3A3B0">${esc(c.hero.location + ' · ' + c.hero.reach)}</text><text x="1120" y="556" text-anchor="end" class="mono" style="font-size:20px;fill:#F2A93B">${esc(new URL(c.site.url).host)}</text></svg>`;
  const svgPath = path.join(root, 'src/images/og-image.svg');
  let size = 104;
  while (true) {
    await writeFile(svgPath, makeSvg(size));
    await page.goto(pathToFileURL(svgPath).href);
    await page.evaluate(() => document.fonts.ready);
    if (await page.locator('#name').evaluate(el => el.getComputedTextLength()) <= 1040) break;
    size -= 4;
    if (size <= 0) throw new Error('Name cannot fit');
  }
  await page.screenshot({ path: path.join(root, 'public/assets/og-image.png') });
  const favicon = await readFile(path.join(root, 'public/favicon.svg'), 'utf8');
  const pngs = [];
  for (const n of [16, 32, 192, 512, 180]) {
    const apple = n === 180;
    const svg = apple ? favicon.replace('rx="14"', 'rx="0"').replace('<g fill=', '<g transform="translate(6.4 6.4) scale(.8)"><g fill=').replace('</svg>', '</g></svg>') : favicon;
    const file = path.join(tmp, `icon-${n}.svg`);
    await writeFile(file, svg);
    await page.setViewportSize({ width: n, height: n });
    await page.goto(pathToFileURL(file).href);
    const png = await page.screenshot({ path: n === 16 ? path.join(tmp, 'favicon-16.png') : path.join(root, 'public', apple ? 'apple-touch-icon.png' : n === 32 ? 'favicon-32.png' : `icon-${n}.png`) });
    if (n <= 32) pngs.push({ n, png });
  }
  const header = Buffer.alloc(6 + 16 * pngs.length); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ n, png }, i) => { const at = 6 + i * 16; header[at] = n; header[at + 1] = n; header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6); header.writeUInt32LE(png.length, at + 8); header.writeUInt32LE(offset, at + 12); offset += png.length; });
  await writeFile(path.join(root, 'public/favicon.ico'), Buffer.concat([header, ...pngs.map(p => p.png)]));
} finally { await browser.close(); await rm(tmp, { recursive: true, force: true }); }
