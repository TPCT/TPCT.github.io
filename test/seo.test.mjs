import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { esc, attr } from '../src/lib/html.mjs';
import { THEME_SCRIPT, cspHash, renderHead } from '../src/render/head.mjs';
import { validateContent } from '../src/lib/validate.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));
test('SEO, 404, discovery files and committed assets', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-seo-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.ok(html.includes(`<title>${esc(c.site.title)}</title>`));
  assert.ok(html.includes(`<meta name="description" content="${attr(c.site.description)}">`));
  assert.ok(html.includes('<link rel="canonical" href="https://tpct.github.io/">'));
  for (const [key, value] of Object.entries({ 'og:type': 'website', 'og:site_name': c.site.shortTitle, 'og:title': c.site.title, 'og:description': c.site.description, 'og:url': 'https://tpct.github.io/', 'og:image': 'https://tpct.github.io/assets/og-image.png', 'og:image:type': 'image/png', 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': c.site.ogImageAlt, 'og:locale': c.site.locale, 'twitter:card': 'summary_large_image', 'twitter:title': c.site.title, 'twitter:description': c.site.description, 'twitter:image': 'https://tpct.github.io/assets/og-image.png', 'twitter:image:alt': c.site.ogImageAlt })) assert.ok(html.includes(`<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${attr(value)}">`), key);
  for (const file of ['/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png', '/site.webmanifest', '/assets/fonts/outfit-var.woff2', '/assets/fonts/jakarta-var.woff2']) assert.ok(html.includes(`href="${file}"`));
  assert.match(html, /as="font" type="font\/woff2" crossorigin/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(ld['@type'], 'Person'); assert.equal(ld.name, c.hero.name); assert.deepEqual(ld.jobTitle, c.hero.roles.slice(1)); assert.equal(ld.url, 'https://tpct.github.io/'); assert.equal(ld.email, 'mailto:' + c.contact.email); assert.deepEqual(ld.sameAs, [c.contact.github, c.contact.website]); assert.deepEqual(ld.worksFor, { '@type': 'Organization', name: 'ShiftCodes', url: c.contact.website }); assert.deepEqual(ld.address, { '@type': 'PostalAddress', addressLocality: 'Alexandria', addressCountry: 'EG' });
  const nf = await readFile(path.join(outDir, '404.html'), 'utf8');
  assert.match(nf, /<meta name="robots" content="noindex">/); assert.doesNotMatch(nf, /rel="canonical"|<nav\b|menu-btn|application\/ld\+json/); assert.ok(nf.includes(`<title>404 — ${esc(c.notFound.title)} · ${esc(c.site.shortTitle)}</title>`)); assert.ok(nf.includes(`<h1>${esc(c.notFound.title)}</h1>`)); assert.ok(nf.includes(esc(c.notFound.message))); assert.ok(nf.includes(`href="/">${esc(c.notFound.cta.label)}</a>`)); assert.match(nf, /class="icon-btn theme-toggle" hidden/); assert.ok(nf.includes(THEME_SCRIPT)); assert.ok(nf.includes(cspHash(THEME_SCRIPT))); assert.match(nf, /class="nf__schematic" aria-hidden="true"/);
  assert.equal(await readFile(path.join(outDir, 'robots.txt'), 'utf8'), 'User-agent: *\nAllow: /\nSitemap: https://tpct.github.io/sitemap.xml\n');
  const sitemap = await readFile(path.join(outDir, 'sitemap.xml'), 'utf8'); assert.equal((sitemap.match(/<url>/g) || []).length, 1); assert.match(sitemap, /<loc>https:\/\/tpct.github.io\/<\/loc>/); assert.doesNotMatch(sitemap, /404/);
  const manifest = JSON.parse(await readFile(path.join(outDir, 'site.webmanifest'), 'utf8')); assert.equal(manifest.name, c.site.title); assert.equal(manifest.short_name, c.site.shortTitle); assert.equal(manifest.display, 'browser'); assert.equal(manifest.start_url, '/'); assert.equal(manifest.theme_color, c.site.themeColorDark); assert.equal(manifest.background_color, c.site.themeColorDark); assert.deepEqual(manifest.icons.map(i => i.sizes), ['192x192', '512x512']);
  for (const i of manifest.icons) await readFile(path.join(outDir, i.src));
  for (const [file, width, height, cap] of [['assets/og-image.png', 1200, 630, 300 * 1024], ['apple-touch-icon.png', 180, 180, Infinity], ['favicon-32.png', 32, 32, Infinity], ['icon-192.png', 192, 192, Infinity], ['icon-512.png', 512, 512, Infinity]]) { const bytes = await readFile(new URL('../public/' + file, import.meta.url)); assert.equal(bytes.readUInt32BE(16), width); assert.equal(bytes.readUInt32BE(20), height); assert.ok(bytes.length <= cap); }
  let fontBytes = 0;
  for (const file of ['outfit-var.woff2', 'jakarta-var.woff2']) {
    const font = await readFile(new URL('../public/assets/fonts/' + file, import.meta.url));
    assert.equal(font.subarray(0, 4).toString(), 'wOF2'); assert.ok(font.length <= 80 * 1024); fontBytes += font.length;
  }
  assert.ok(fontBytes <= 120 * 1024);
  assert.ok(!html.includes('arch' + 'ivo'));
  for (const file of ['favicon.ico', 'assets/fonts/OFL-Outfit.txt', 'assets/fonts/OFL-PlusJakartaSans.txt']) await readFile(new URL('../public/' + file, import.meta.url));
});
test('JSON-LD escapes script closing text and normalizes site URL', () => {
  const copy = structuredClone(c); copy.hero.name = '</script>'; copy.site.url += '/';
  const html = renderHead(copy, { page: 'home', title: '', description: '', assets: {} });
  assert.ok(html.includes('\\u003c/script>')); assert.doesNotMatch(html, /github\.io\/\//);
});
test('external and email URL protocols are validated', () => {
  for (const field of ['hero.ctaTertiary.href', 'hero.ctaSecondary.href', 'contact.github', 'contact.website', 'experience.0.orgUrl', 'projects.0.repoUrl']) {
    const copy = structuredClone(c); const parts = field.split('.'); let parent = copy; for (const p of parts.slice(0, -1)) parent = parent[p]; parent[parts.at(-1)] = 'javascript:bad';
    assert.ok(validateContent(copy).errors.some(e => e.includes('invalid URL protocol')), field);
  }
});
