import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { sortProjects, esc, attr } from '../src/lib/html.mjs';
import { validateContent } from '../src/lib/validate.mjs';
import { THEME_SCRIPT, cspHash, renderHead } from '../src/render/head.mjs';
import { homeGraph, projectNode } from '../src/lib/schema.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));
test('SEO metadata, linked graph, identity and accessible names', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-seo-meta-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir, now: new Date('2026-10-21T12:00:00Z') });
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  const nf = await readFile(path.join(outDir, '404.html'), 'utf8');
  assert.ok(html.includes(`<title>${esc(c.site.title)}</title>`));
  assert.ok(c.site.title.length <= 65);
  assert.ok(html.includes(`<meta name="description" content="${attr(c.site.description)}">`));
  assert.ok(c.site.description.length <= 160);
  for (const keyword of ['Laravel', 'Python', 'FastAPI']) assert.ok(c.site.description.includes(keyword));
  assert.ok(html.includes('<meta name="robots" content="index,follow,max-image-preview:large">'));
  assert.match(nf, /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(nf, /index,follow|rel="me"|rel="canonical"|application\/ld\+json/);
  const head = html.match(/<head>(.*?)<\/head>/s)[1];
  for (const url of [c.contact.github, c.contact.linkedin]) {
    assert.ok(head.includes(`<link rel="me" href="${url}">`));
    for (const fragment of [html.match(/<footer class="site-footer".*?<\/footer>/s)[0], html.match(/<section id="contact".*?<\/section>/s)[0]]) assert.ok(fragment.includes(`href="${url}" target="_blank" rel="me noopener noreferrer"`));
  }
  for (const p of c.projects.filter(p => p.kind === 'open-source')) assert.ok(html.includes(`href="${p.repoUrl}" target="_blank" rel="noopener noreferrer"`));
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert.deepEqual(graph.map(n => n['@type']), ['WebSite', 'ProfilePage', 'Person', 'Organization', 'ItemList']);
  const ids = new Set();
  const walk = (value, visit) => { if (value && typeof value === 'object') { visit(value); for (const child of Object.values(value)) walk(child, visit); } };
  walk(graph, n => { if (n['@id'] && Object.keys(n).length > 1) ids.add(n['@id']); });
  walk(graph, n => { if (Object.keys(n).length === 1 && n['@id']) assert.ok(ids.has(n['@id']), n['@id']); });
  const [, profile, person, org, list] = graph;
  assert.equal(profile.mainEntity['@id'], person['@id']);
  assert.equal(profile.dateModified, '2026-10-21');
  assert.ok(org.logo.url.endsWith('/icon-512.png'));
  await readFile(path.join(outDir, 'icon-512.png'));
  assert.equal(org.founder['@id'], person['@id']);
  for (const skill of ['Laravel', 'FastAPI']) assert.ok(person.knowsAbout.includes(skill));
  assert.equal(new Set(person.knowsAbout).size, person.knowsAbout.length);
  assert.equal(list.numberOfItems, c.projects.length);
  const sorted = sortProjects(c.projects);
  list.itemListElement.forEach(({ position, item }, i) => {
    const p = sorted[i];
    assert.equal(position, i + 1);
    assert.equal(item.name, p.name);
    assert.equal(item['@type'], p.kind === 'open-source' ? 'SoftwareSourceCode' : 'CreativeWork');
    if (p.kind === 'open-source') assert.equal(item.codeRepository, p.repoUrl);
    else {
      assert.ok(!('codeRepository' in item));
      assert.equal(item.url, `https://tpct.github.io/work/${p.id}/`);
    }
  });
  const urls = ['https://tpct.github.io/', ...sorted.map(p => `https://tpct.github.io/work/${p.id}/`)];
  assert.equal(await readFile(path.join(outDir, 'sitemap.xml'), 'utf8'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc><lastmod>2026-10-21</lastmod></url>`).join('')}</urlset>\n`);
  for (const page of [html, nf]) {
    for (const [tag] of page.matchAll(/<img\b[^>]*>/g)) assert.match(tag, /\balt="[^"]+"/);
    for (const [svg] of page.matchAll(/<svg\b.*?<\/svg>/gs)) assert.ok(/^[^>]*aria-hidden="true"/.test(svg) || (/^[^>]*role="img"/.test(svg) && /<title\b[^>]*>[^<]+<\/title>/.test(svg)), svg);
    for (const [element, tag, attributes] of page.matchAll(/<(button|a)\b([^>]*)>(.*?)<\/\1>/gs)) assert.ok(/aria-label="[^"]+"/.test(attributes) || element.replace(/<[^>]*>/g, '').trim(), `${tag}: ${element}`);
    assert.ok(page.match(/property="og:image:alt" content="([^"]*)"/)[1].length >= 20);
    assert.ok(page.includes(cspHash(THEME_SCRIPT)));
    const inline = [...page.matchAll(/<script\b([^>]*)>(.*?)<\/script>/gs)].filter(m => !/\btype=|\bsrc=/.test(m[1]));
    assert.equal(inline.length, 1); assert.equal(inline[0][2], THEME_SCRIPT);
    assert.equal((page.match(/<meta name="theme-color"/g) ?? []).length, 1);
    assert.ok(page.includes(`<meta name="author" content="${attr(c.site.author)}">`));
  }
});
test('SEO validation rejects invalid fields', () => {
  for (const [group, key, value] of [['site', 'title', 'x'.repeat(66)], ['site', 'description', 'x'.repeat(161)], ['contact', 'linkedin', 'https://example.com/x'], ['site', 'jobTitle', undefined]]) {
    const copy = structuredClone(c); copy[group][key] = value;
    assert.ok(validateContent(copy).errors.some(e => e.startsWith(`${group}.${key}:`)));
  }
});
test('head supports reusable page metadata and project URLs', () => {
  const html = renderHead(c, { page: 'project', title: 'A < B', description: 'A & B', path: '/projects/example/', ogType: 'article', jsonLd: homeGraph(c, { dateModified: '2026-10-21' }), assets: {} });
  assert.ok(html.includes('<link rel="canonical" href="https://tpct.github.io/projects/example/">'));
  assert.ok(html.includes('property="og:type" content="article"'));
  assert.ok(html.includes('property="og:title" content="A &lt; B"'));
  assert.ok(html.includes('name="twitter:description" content="A &amp; B"'));
  assert.doesNotMatch(html, /rel="me"/);
  const p = { ...c.projects[0], kind: 'case-study', repoUrl: 'https://example.com/repo' };
  const node = projectNode(c, p, { url: 'https://example.com/project' });
  assert.equal(node.url, 'https://example.com/project'); assert.ok(!('codeRepository' in node));
});
