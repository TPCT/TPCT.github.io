import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { renderCard } from '../src/render/sections.mjs';
import { esc, slugify, sortProjects } from '../src/lib/html.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));

test('projects render complete cards, filters and section hierarchy', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-projects-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(`${outDir}/index.html`, 'utf8');
  const cards = [...html.matchAll(/<li class="card card--[^>]+>[\s\S]*?<\/article><\/li>/g)].map(m => m[0]);
  assert.equal(cards.length, c.projects.length);
  assert.equal(c.projects.length, 20);
  assert.deepEqual(cards.map(card => card.match(/<h3 id="p-([^"]+)"/)[1]), sortProjects(c.projects).map(p => p.id));
  for (const p of c.projects) {
    const card = cards.find(card => card.includes(`id="p-${p.id}"`));
    assert.ok(card.includes(`data-category="${slugify(p.category)}"`));
    assert.ok(card.includes(`data-featured="${p.featured}"`));
    const actions = card.match(/<footer class="card__foot"><p class="card__role">.*?<\/p><div class="card__actions">(.*?)<\/div><\/footer>/s)?.[1];
    assert.ok(actions);
    assert.deepEqual([...actions.matchAll(/<(a|p) class="(card__more|card__repo|card__private)"/g)].map(m => [m[1], m[2]]), [['a', 'card__more'], [p.kind === 'case-study' ? 'p' : 'a', p.kind === 'case-study' ? 'card__private' : 'card__repo']]);
    assert.match(actions, /icon-arrow-right/);
    if (p.kind === 'case-study') {
      assert.equal((card.match(/<a\b/g) || []).length, 1);
      assert.ok(card.includes(`href="/work/${p.id}/"`));
      assert.doesNotMatch(card, /target=|href="http/);
      assert.ok(card.includes(esc(c.projectsIntro.privateNote)));
    } else {
      assert.equal((card.match(/<a\b/g) || []).length, 2);
      assert.ok(card.includes(`href="/work/${p.id}/"`));
      assert.ok(card.includes(`href="${esc(p.repoUrl)}" target="_blank" rel="noopener noreferrer"`));
      assert.ok(card.includes(`<span class="vh"> : ${esc(p.name)} ${esc(c.a11y.newTab)}</span>`));
    }
    if (p.year === undefined) assert.doesNotMatch(card, /card__year/);
    else assert.ok(card.includes(`<span class="card__year">${esc(p.year)}</span>`));
  }
  assert.doesNotMatch(html, /undefined|null|class="card__year"><\/span>|style="|\son[a-z]+\s*=/i);
  for (const id of ['food-manufacturing-erp', 'ocr-omr']) assert.doesNotMatch(cards.find(card => card.includes(`id="p-${id}"`)), /card__year/);
  assert.equal(c.projects.find(p => p.id === 'national-waste-analytics').year, 2025);
  assert.match(cards.find(card => card.includes('id="p-national-waste-analytics"')), /<span class="card__year">2025<\/span>/);
  const chips = [...html.matchAll(/<button type="button" class="chip"[^>]+data-(category|kind)="([^"]+)"><span class="chip__label">([^<]+)<\/span><span class="chip__count">(\d+)<\/span><\/button>/g)];
  assert.deepEqual(chips.filter(m => m[1] === 'category').map(m => [m[2], Number(m[4])]), [['all', c.projects.length], ...c.categories.filter(category => c.projects.some(p => p.category === category)).map(category => [slugify(category), c.projects.filter(p => p.category === category).length])]);
  assert.deepEqual(
    chips.filter(m => m[1] === 'category').slice(1).map(m => [m[2], Number(m[4])]),
    c.categories.filter(cat => c.projects.some(p => p.category === cat)).map(cat => [slugify(cat), c.projects.filter(p => p.category === cat).length])
  );
  assert.deepEqual(chips.filter(m => m[1] === 'kind').map(m => [m[2], Number(m[4])]), [['all', c.projects.length], ...['case-study', 'open-source'].map(kind => [kind, c.projects.filter(p => p.kind === kind).length])]);
  const ids = ['top', 'about', 'timeline', 'skills', 'work', 'services', 'process', 'contact'];
  const positions = ids.map(id => html.indexOf(`<section id="${id}"`));
  assert.ok(positions.every((position, i) => position >= 0 && (!i || position > positions[i - 1])));
  assert.equal((html.match(/<h2\b/g) || []).length, 7);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const id of ids.slice(1)) assert.ok(html.includes(`aria-labelledby="${id}-title"`));
  assert.match(html, /class="filters" hidden/);
  assert.match(html, /class="btn btn--secondary copy-btn" hidden/);
  assert.ok(html.includes(`href="mailto:${c.contact.email}" aria-describedby="email-label">${c.contact.email.split('@')[0]}<wbr><span class="email__domain">@${c.contact.email.split('@')[1]}</span></a>`));
  assert.ok(html.includes('id="copy-status"'));
  assert.ok((await readFile(`${outDir}/assets/site.js`)).length <= 39704);
});

test('case-study repoUrl is ignored and content is escaped', () => {
  const p = c.projects.find(p => p.kind === 'case-study');
  const card = renderCard({ ...p, repoUrl: 'https://github.com/TPCT/example', name: '<script>"&' }, c);
  assert.doesNotMatch(card, /href="http|github\.com|<script>/);
  assert.deepEqual([...card.matchAll(/href="([^"]+)"/g)].map(m => m[1]), [`/work/${p.id}/`]);
  assert.ok(card.includes('&lt;script&gt;&quot;&amp;'));
  assert.ok(card.includes(esc(c.projectsIntro.privateNote)));
});

test('card and project actions share spaced, responsive pill styles', async () => {
  const css = await readFile(new URL('../src/styles/60-work.css', import.meta.url), 'utf8');
  const row = css.match(/\.card__actions, \.project__actions \{([^}]+)\}/)[1];
  assert.match(row, /display: flex;/);
  assert.match(row, /flex-wrap: wrap;/);
  assert.match(row, /gap: 12px;/);
  assert.match(css, /\.card__more \{[^}]*background: var\(--primary-skin\)/);
  assert.match(css, /\.card__repo \{[^}]*background: var\(--control\)/);
  assert.match(css, /@media \(min-width: 1024px\) \{ \.card__actions, \.project__actions \{ gap: 16px;/);
  assert.match(css, /@media \(max-width: 400px\) \{ \.card__actions > \*, \.project__actions > \* \{ flex: 1 1 100%; justify-content: center;/);
});


test('mobile private notes fit one line and back arrows nudge left', async () => {
  const css = await readFile(new URL('../src/styles/60-work.css', import.meta.url), 'utf8');
  const mobile = css.match(/@media \(max-width: 400px\) \{.*?\.card__private \{([^}]+)\}/s)?.[1];
  assert.ok(mobile);
  assert.match(mobile, /font-size: \.8125rem;/);
  assert.match(mobile, /padding-inline: 12px;/);
  assert.match(mobile, /text-align: center;/);
  assert.match(mobile, /line-height: 1\.25;/);
  assert.match(css, /\.card__private span \{ min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; \}/);
  assert.match(css, /\.project__back:hover \.icon-arrow-left \{ translate: -2px 0; \}/);
  assert.match(css, /\.card__more:hover \.icon-arrow-right \{ translate: 2px 0; \}/);
});
