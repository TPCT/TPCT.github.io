import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { deflateSync, inflateSync } from 'node:zlib';
import { esc } from '../src/lib/html.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const root = fileURLToPath(new URL('../', import.meta.url));
const c = JSON.parse(await readFile(path.join(root, 'src/content.json'), 'utf8'));
const words = c.hero.name.split(/\s+/);
const names = [words.slice(0, -1).join(' '), words.at(-1)];
const layout = { name: 104, roles: [28, 24], chips: 16, pill: 40, widths: c.hero.domains.map(() => 28) };
const makeSvg = () => {
  let x = 80;
  const chips = c.hero.domains.map((domain, i) => {
    const width = layout.widths[i];
    const svg = `<rect x="${x}" y="478" width="${width}" height="36" rx="18" fill="#3A3349"/><text id="chip-${i}" x="${x + width / 2}" y="502" text-anchor="middle" class="domain">${esc(domain)}</text>`;
    x += width + 10;
    return svg;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
<radialGradient id="plum"><stop stop-color="#4A2346" stop-opacity=".9"/><stop offset="1" stop-color="#4A2346" stop-opacity="0"/></radialGradient>
<radialGradient id="blue"><stop stop-color="#1E3A52"/><stop offset="1" stop-color="#1E3A52" stop-opacity="0"/></radialGradient>
<radialGradient id="glow"><stop stop-color="#F299C4" stop-opacity=".35"/><stop offset="1" stop-color="#F299C4" stop-opacity="0"/></radialGradient>
<radialGradient id="shadow"><stop stop-color="#04020C" stop-opacity=".6"/><stop offset="1" stop-color="#04020C" stop-opacity="0"/></radialGradient>
<linearGradient id="name"><stop stop-color="#F299C4"/><stop offset=".55" stop-color="#C3AEF5"/><stop offset="1" stop-color="#7FD3E3"/></linearGradient>
<linearGradient id="dot"><stop stop-color="#F299C4"/><stop offset="1" stop-color="#7FD3E3"/></linearGradient>
<linearGradient id="beam"><stop stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".85"/></linearGradient>
<linearGradient id="spectrum"><stop stop-color="#F299C4"/><stop offset=".25" stop-color="#F299C4"/><stop offset=".25" stop-color="#C3AEF5"/><stop offset=".5" stop-color="#C3AEF5"/><stop offset=".5" stop-color="#88C8FC"/><stop offset=".75" stop-color="#88C8FC"/><stop offset=".75" stop-color="#7FD3E3"/><stop offset="1" stop-color="#7FD3E3"/></linearGradient>
<linearGradient id="left" x2="0" y2="1"><stop stop-color="#F299C4"/><stop offset="1" stop-color="#C3AEF5"/></linearGradient>
<linearGradient id="centre" x2="0" y2="1"><stop stop-color="#C3AEF5"/><stop offset="1" stop-color="#88C8FC"/></linearGradient>
<linearGradient id="right" x2="0" y2="1"><stop stop-color="#88C8FC"/><stop offset="1" stop-color="#7FD3E3"/></linearGradient>
</defs>
<style>
@font-face{font-family:"Outfit";src:url('../../public/assets/fonts/outfit-var.woff2');font-weight:500 800}
@font-face{font-family:"Plus Jakarta Sans";src:url('../../public/assets/fonts/jakarta-var.woff2');font-weight:400 800}
text{font-family:"Plus Jakarta Sans";fill:#F1ECF8}.eyebrow{font-size:17px;font-weight:800;letter-spacing:2px;fill:#F299C4}.name{font-family:"Outfit";font-size:${layout.name}px;font-weight:800;letter-spacing:-3px}.last{fill:url(#name)}.role-main{font-size:${layout.roles[0]}px;font-weight:600}.role-other{font-size:${layout.roles[1]}px;font-weight:500;fill:#CFC6DC}.domain{font-size:${layout.chips}px;font-weight:600;fill:#CFC6DC}.location{font-size:20px;font-weight:500;fill:#B7ACC6}.host{font-size:20px;font-weight:700;fill:#7FD3E3}
</style>
<rect width="1200" height="630" fill="#1A1726"/><circle cx="216" cy="76" r="520" fill="url(#plum)"/><circle cx="1104" cy="346" r="560" fill="url(#blue)"/>
<rect x="24" y="24" width="1152" height="582" rx="32" fill="none" stroke="#E8DEFF" stroke-opacity=".18"/>
<circle cx="930" cy="290" r="220" fill="url(#glow)"/><path d="M640 330L850 300" stroke="url(#beam)" stroke-width="3" stroke-linecap="round"/>
<polygon points="1010,300 1176,236 1176,404 1010,322" fill="url(#spectrum)" opacity=".6"/>
<polygon points="930,120 870,420 770,420" fill="url(#left)"/><polygon points="930,120 1010,420 870,420" fill="url(#centre)"/><polygon points="930,120 1090,420 1010,420" fill="url(#right)" opacity=".9"/><polygon points="930,120 870,420 770,420" fill="#FFFFFF" opacity=".25"/>
<polygon points="930,120 1090,420 770,420" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="1.5"/>
<rect x="760" y="150" width="60" height="76" rx="12" transform="rotate(-14 790 188)" fill="#2E283D" fill-opacity=".9" stroke="#E8DEFF" stroke-opacity=".25"/><rect x="1078" y="140" width="44" height="44" rx="10" transform="rotate(18 1100 162)" fill="#3A2840" stroke="#E8DEFF" stroke-opacity=".25"/>
<ellipse cx="930" cy="440" rx="130" ry="14" fill="url(#shadow)"/>
<rect x="80" y="64" width="${layout.pill}" height="40" rx="20" fill="#4A2D47"/><circle cx="100" cy="84" r="4" fill="url(#dot)"/><text id="eyebrow" x="116" y="90" class="eyebrow">${esc(c.hero.eyebrow.toUpperCase())}</text>
${names[0] ? `<text id="name-0" x="80" y="232" class="name">${esc(names[0])}</text>` : ''}<text id="name-1" x="80" y="334" class="name last">${esc(names[1])}</text>
<text id="role-0" x="80" y="398" class="role-main">${esc(c.hero.roles[0])}</text><text id="role-1" x="80" y="438" class="role-other">${esc(c.hero.roles.slice(1).join(' · '))}</text>
${chips}
<text id="location" x="80" y="574" class="location">${esc(`${c.hero.location} · ${c.hero.reach}`)}</text><text id="host" x="1120" y="574" text-anchor="end" class="host">${esc(new URL(c.site.url).host)}</text>
</svg>\n`;
};
function iconSvg({ bleed }) {
  const art = '<polygon points="32,12 54,50 10,50" fill="url(#g)"/><polygon points="32,12 32,50 10,50" fill="#FFFFFF" opacity=".22"/><polygon points="32,12 54,50 43,50" fill="#0E081E" opacity=".18"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F299C4"/><stop offset=".5" stop-color="#C3AEF5"/><stop offset="1" stop-color="#7FD3E3"/></linearGradient></defs><rect width="64" height="64" rx="${bleed ? 0 : 16}" fill="#1A1726"/>${bleed ? `<g transform="translate(6.4 6.4) scale(.8)">${art}</g>` : art}</svg>\n`;
}
function compressPng(png) {
  const chunks = []; const data = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const chunk = png.subarray(offset, offset + length + 12);
    if (type === 'IDAT') data.push(chunk.subarray(8, -4));
    else chunks.push({ type, chunk });
    offset += length + 12;
  }
  const compressed = deflateSync(inflateSync(Buffer.concat(data)), { level: 9 });
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length); idat.write('IDAT', 4); compressed.copy(idat, 8);
  let crc = 0xffffffff;
  for (const byte of idat.subarray(4, -4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  idat.writeUInt32BE((crc ^ 0xffffffff) >>> 0, idat.length - 4);
  return Buffer.concat([png.subarray(0, 8), ...chunks.flatMap(({ type, chunk }) => type === 'IEND' ? [idat, chunk] : [chunk])]);
}
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const tmp = await mkdtemp(path.join(os.tmpdir(), 'tpct-images-'));
try {
  await mkdir(path.join(root, 'src/images'), { recursive: true });
  await mkdir(path.join(root, 'public/assets'), { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const svgPath = path.join(root, 'src/images/og-image.svg');
  while (true) {
    await writeFile(svgPath, makeSvg());
    await page.goto(pathToFileURL(svgPath).href);
    await page.evaluate(() => document.fonts.ready);
    if (!await page.evaluate(() => document.fonts.check('800 104px "Outfit"') && document.fonts.check('600 28px "Plus Jakarta Sans"'))) throw new Error('OG fonts did not load');
    const boxes = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('text[id]')].map(el => { const { x, width } = el.getBBox(); return [el.id, { x, width }]; })));
    const before = structuredClone(layout);
    layout.pill = boxes.eyebrow.width + 40;
    if (names.some((name, i) => name && boxes[`name-${i}`].width > 620)) {
      if (layout.name === 56) throw new Error('OG name does not fit');
      layout.name -= 4;
    }
    layout.roles.forEach((size, i) => {
      if (boxes[`role-${i}`].width <= 620) return;
      if (size === 18) throw new Error('OG roles do not fit');
      layout.roles[i] -= 2;
    });
    layout.widths = c.hero.domains.map((_, i) => boxes[`chip-${i}`].width + 28);
    if (80 + layout.widths.reduce((sum, width) => sum + width, 0) + Math.max(0, layout.widths.length - 1) * 10 > 1120) {
      if (layout.chips === 14) throw new Error('OG domain chips do not fit');
      layout.chips = 14;
    }
    if (boxes.location.x + boxes.location.width + 24 >= boxes.host.x) throw new Error('OG footer does not fit');
    if (before.name === layout.name && before.chips === layout.chips && before.roles.every((size, i) => size === layout.roles[i]) && Math.abs(before.pill - layout.pill) < .01 && before.widths.every((width, i) => Math.abs(width - layout.widths[i]) < .01)) break;
  }
  let og = await page.screenshot({ path: path.join(root, 'public/assets/og-image.png') });
  og = compressPng(og);
  if (og.length > 300 * 1024) {
    // Chromium dithers gradients heavily. Reduce only their low colour bits
    // through its canvas encoder to keep the committed PNG within budget.
    const encoded = await page.evaluate(async base64 => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + base64;
      await image.decode();
      const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
      canvas.width = 1200; canvas.height = 630;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, 1200, 630);
      for (let i = 0; i < pixels.data.length; i += 4) {
        for (let channel = 0; channel < 3; channel++) pixels.data[i + channel] = Math.round(pixels.data[i + channel] / 4) * 4;
      }
      ctx.putImageData(pixels, 0, 0);
      return canvas.toDataURL('image/png').split(',')[1];
    }, og.toString('base64'));
    og = compressPng(Buffer.from(encoded, 'base64'));
  }
  if (og.length > 300 * 1024) throw new Error('OG image exceeds 300 KB');
  await writeFile(path.join(root, 'public/assets/og-image.png'), og);
  await writeFile(path.join(root, 'public/favicon.svg'), iconSvg({ bleed: false }));
  const pngs = [];
  for (const n of [16, 32, 192, 512, 180]) {
    const apple = n === 180;
    const file = path.join(tmp, `icon-${n}.svg`);
    await writeFile(file, iconSvg({ bleed: apple }));
    await page.setViewportSize({ width: n, height: n });
    await page.goto(pathToFileURL(file).href);
    // Scale the SVG viewport without changing the shared artwork.
    await page.locator('svg').evaluate(el => { el.setAttribute('width', '100%'); el.setAttribute('height', '100%'); });
    const png = await page.screenshot({ path: n === 16 ? path.join(tmp, 'favicon-16.png') : path.join(root, 'public', apple ? 'apple-touch-icon.png' : n === 32 ? 'favicon-32.png' : `icon-${n}.png`) });
    if (n <= 32) pngs.push({ n, png });
  }
  const header = Buffer.alloc(6 + 16 * pngs.length); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ n, png }, i) => { const at = 6 + i * 16; header[at] = n; header[at + 1] = n; header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6); header.writeUInt32LE(png.length, at + 8); header.writeUInt32LE(offset, at + 12); offset += png.length; });
  await writeFile(path.join(root, 'public/favicon.ico'), Buffer.concat([header, ...pngs.map(p => p.png)]));
} finally { await browser.close(); await rm(tmp, { recursive: true, force: true }); }
