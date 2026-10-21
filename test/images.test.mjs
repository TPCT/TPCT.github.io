import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { esc } from '../src/lib/html.mjs';
const root = new URL('../', import.meta.url);
const c = JSON.parse(await readFile(new URL('src/content.json', root), 'utf8'));
const localPaths = new RegExp(['file:' + '//', '/ho' + 'me/', '/Us' + 'ers/', '(?<![A-Za-z])[A-Za-z]:' + '\\\\'].join('|'));
test('OG SVG uses Prism fonts and content without local paths', async () => {
  const svg = await readFile(new URL('src/images/og-image.svg', root), 'utf8');
  for (const value of ["url('../../public/assets/fonts/outfit-var.woff2')", "url('../../public/assets/fonts/jakarta-var.woff2')", '#1A1726', ...c.hero.name.split(/\s+/).map(esc), ...c.hero.roles.map(esc), ...c.hero.domains.map(esc), esc(new URL(c.site.url).host)]) assert.ok(svg.includes(value), value);
  assert.doesNotMatch(svg, localPaths);
  for (const value of ['file:', '/tm' + 'p/', 'arch' + 'ivo', 'Deja' + 'Vu']) assert.ok(!svg.includes(value), value);
});
test('Prism favicon, ICO entries and apple dimensions', async () => {
  const svg = await readFile(new URL('public/favicon.svg', root), 'utf8');
  assert.ok(svg.includes('#1A1726'));
  assert.ok(svg.includes('points="32,12 54,50 10,50"'));
  assert.doesNotMatch(svg, /#F2A93B|#0B0B12/);
  const ico = await readFile(new URL('public/favicon.ico', root));
  assert.equal(ico.readUInt16LE(4), 2);
  assert.equal(ico[6], 16); assert.equal(ico[22], 32);
  const apple = await readFile(new URL('public/apple-touch-icon.png', root));
  assert.equal(apple.readUInt32BE(16), 180); assert.equal(apple.readUInt32BE(20), 180);
});
test('source and public text files contain no absolute local paths', async () => {
  async function walk(relative) {
    for (const entry of await readdir(new URL(relative + '/', root), { withFileTypes: true })) {
      const file = relative + '/' + entry.name;
      if (entry.isDirectory()) { await walk(file); continue; }
      const bytes = await readFile(new URL(file, root));
      if (bytes.subarray(0, 8192).includes(0)) continue;
      assert.ok(!localPaths.test(bytes.toString('utf8')), file);
    }
  }
  for (const dir of ['src', 'public', 'scripts']) await walk(dir);
});
