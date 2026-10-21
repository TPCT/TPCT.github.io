import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { checkConfidential } from '../scripts/check-confidential.mjs';
import { esc, attr, projectPath, sortProjects } from '../src/lib/html.mjs';
import { validateContent } from '../src/lib/validate.mjs';
import { projectTitle, projectDescription, renderProjectPage } from '../src/render/project-page.mjs';
import { THEME_SCRIPT, cspHash } from '../src/render/head.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));
const graph = html => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];

test('static project pages, discovery, metadata, graph and confidentiality', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-project-pages-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir, now: new Date('2026-10-21T12:00:00Z') });
  const home = await readFile(path.join(outDir, 'index.html'), 'utf8');
  const items = graph(home).find(n => n['@type'] === 'ItemList').itemListElement;
  assert.equal((await readdir(path.join(outDir, 'work'))).length, c.projects.length);
  const titles = new Set([c.site.title]), descriptions = new Set([c.site.description]), canonicals = new Set(['https://tpct.github.io/']);
  const ordered = sortProjects(c.projects);
  for (const [i, p] of ordered.entries()) {
    const html = await readFile(path.join(outDir, 'work', p.id, 'index.html'), 'utf8');
    const main = html.match(/<main\b[^>]*>(.*?)<\/main>/s)[1];
    const title = projectTitle(c, p), description = projectDescription(p), canonical = `https://tpct.github.io${projectPath(p)}`;
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(html.includes(`<h1 id="project-title">${esc(p.name)}</h1>`));
    assert.ok(html.includes(`<title>${esc(title)}</title>`));
    assert.ok(title.length <= 65);
    assert.ok(html.includes(`<meta name="description" content="${attr(description)}">`));
    assert.ok(description.length <= 160);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert.ok(html.includes(`property="og:url" content="${canonical}"`));
    assert.match(html, /property="og:type" content="article"/);
    assert.match(html, /name="robots" content="index,follow,max-image-preview:large"/);
    for (const [set, value] of [[titles, title], [descriptions, description], [canonicals, canonical]]) { assert.ok(!set.has(value)); set.add(value); }
    const nodes = graph(html), breadcrumb = nodes.find(n => n['@type'] === 'BreadcrumbList');
    assert.equal(breadcrumb.itemListElement.length, 2);
    assert.equal(breadcrumb.itemListElement[0].item, 'https://tpct.github.io/');
    assert.equal(breadcrumb.itemListElement[1].item, canonical);
    const node = nodes.find(n => n['@type'] === (p.kind === 'case-study' ? 'CreativeWork' : 'SoftwareSourceCode'));
    assert.equal(node['@id'], items.find(({ item }) => item.name === p.name).item['@id']);
    assert.equal(node.url, canonical);
    const external = [...main.matchAll(/href="(https?:[^"]+)"/g)].map(m => m[1]);
    if (p.kind === 'case-study') { assert.ok(!('codeRepository' in node)); assert.deepEqual(external, []); }
    else { assert.equal(node.codeRepository, p.repoUrl); assert.deepEqual(external, [p.repoUrl]); }
    assert.match(main, /href="\/#work"/);
    const actions = main.match(/<div class="project__actions">(.*?)<\/div>/s)?.[1];
    assert.ok(actions);
    assert.deepEqual([...actions.matchAll(/<(a|p) class="([^" ]+)/g)].map(m => [m[1], m[2]]), [[p.kind === 'case-study' ? 'p' : 'a', p.kind === 'case-study' ? 'card__private' : 'card__more'], ['a', 'card__repo']]);
    assert.match(actions, /class="card__repo project__back" href="\/#work"><svg class="icon-arrow-left"[^>]*>.*?<\/svg>Back to all work<\/a>/s);
    assert.match(main, /<nav class="crumbs"[^>]*>.*?aria-current="page"/s);
    for (const [direction, neighbour] of [['prev', ordered[i - 1]], ['next', ordered[i + 1]]]) {
      if (neighbour) assert.ok(main.includes(`rel="${direction}" href="${projectPath(neighbour)}"`));
      else assert.ok(!main.includes(`rel="${direction}"`));
    }
    assert.ok(home.includes(`href="${projectPath(p)}"`));
    const inline = [...html.matchAll(/<script\b([^>]*)>(.*?)<\/script>/gs)].filter(m => !/\btype=|\bsrc=/.test(m[1]));
    assert.deepEqual(inline.map(m => m[2]), [THEME_SCRIPT]);
    assert.ok(html.includes(cspHash(THEME_SCRIPT)));
    assert.ok(html.includes('connect-src &#39;self&#39;'));
    assert.doesNotMatch(html, /style="|\son[a-z]+\s*=|undefined|null|data-reveal/i);
  }
  const sitemap = await readFile(path.join(outDir, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 1 + c.projects.length);
  assert.equal((sitemap.match(/<lastmod>2026-10-21<\/lastmod>/g) ?? []).length, 1 + c.projects.length);
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), ['https://tpct.github.io/', ...ordered.map(p => `https://tpct.github.io${projectPath(p)}`)]);
  assert.doesNotMatch(sitemap, /404/);
  const css = await readFile(new URL('../src/styles/85-project.css', import.meta.url));
  assert.ok(css.length <= 3072);
  assert.doesNotMatch(css.toString(), /@keyframes/);
  assert.equal((await checkConfidential({ dist: outDir })).hits.length, 0);
});

test('project escaping, description boundaries, optional facts and required labels', () => {
  const p = { ...c.projects.find(p => p.kind === 'case-study'), name: '<script>"&', repoUrl: 'https://github.com/TPCT/example', year: undefined };
  const html = renderProjectPage(c, p, { assets: {} });
  assert.ok(html.includes('&lt;script&gt;&quot;&amp;'));
  assert.ok(html.includes('\\u003cscript>'));
  assert.equal(graph(html).find(n => n['@type'] === 'CreativeWork').name, p.name);
  assert.doesNotMatch(html.match(/<main\b[^>]*>(.*?)<\/main>/s)[1], /href="http|github\.com|card__year|undefined/);
  assert.equal(projectDescription({ summary: 'x'.repeat(160) }), 'x'.repeat(160));
  assert.equal(projectDescription({ summary: 'x'.repeat(170) }), 'x'.repeat(159) + '…');
  assert.equal(projectDescription({ summary: 'word, ' + 'x'.repeat(170) }), 'word…');
  for (const key of Object.keys(c.projectPage)) {
    for (const value of ['', undefined]) {
      const copy = structuredClone(c); copy.projectPage[key] = value;
      assert.ok(validateContent(copy).errors.some(e => e.startsWith(`projectPage.${key}:`)));
    }
  }
});
