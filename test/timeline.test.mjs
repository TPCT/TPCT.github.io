import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build.mjs';
import { checkConfidential } from '../scripts/check-confidential.mjs';
import { validateContent } from '../src/lib/validate.mjs';
import { renderTimeline } from '../src/render/sections.mjs';
import { esc } from '../src/lib/html.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));

test('timeline validation rejects invalid fields and accepts both link shapes and ranges', () => {
  for (const [change, expected] of [
    [c => delete c.timeline, 'timeline: required array'],
    [c => c.timeline = [], 'timeline: must not be empty'],
    [c => c.timeline[0].kind = 'bad', 'timeline[0].kind: invalid kind'],
    ...[1980, '20x6'].map(year => [c => c.timeline[0].year = year, 'timeline[0].year: invalid year']),
    [c => c.timeline[0].link = 'http://example.com', 'timeline[0].link: invalid URL protocol'],
    [c => c.timeline[0].link = { href: 'https://github.com/TPCT/example' }, 'timeline[0].link.label: required non-empty string'],
    [c => delete c.timelineIntro.kindLabels.client, 'timelineIntro.kindLabels.client: required non-empty string'],
    [c => delete c.sections.timeline, 'sections.timeline: required non-empty string'],
    [c => c.timeline[0].title = '', 'timeline[0].title: required non-empty string'],
    [c => c.timeline[0].text = '', 'timeline[0].text: required non-empty string']
  ]) {
    const fixture = structuredClone(c);
    change(fixture);
    assert.ok(validateContent(fixture).errors.includes(expected), expected);
  }
  for (const link of ['https://github.com/TPCT/example', { href: 'https://github.com/TPCT/example', label: 'Repository' }]) {
    const fixture = structuredClone(c);
    fixture.timeline = [{ ...fixture.timeline[0], year: '2024–now', link }];
    assert.deepEqual(validateContent(fixture).errors, []);
  }
  const fixture = structuredClone(c);
  fixture.timeline[0].year = 2026;
  const result = validateContent(fixture);
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.includes('timeline: years out of order at [1]'));
  assert.deepEqual(validateContent(c), { errors: [], warnings: [] });
});

test('timeline escapes content, labels object links and omits datetime for ranges', () => {
  const fixture = structuredClone(c);
  fixture.timeline = [{ year: '2024–now', kind: 'milestone', title: '<b>"&', text: '<b>"&', link: { href: 'https://github.com/TPCT/example', label: '<b>"&' } }];
  const html = renderTimeline(fixture);
  assert.ok(html.includes('<h3 id="tl-0">&lt;b&gt;&quot;&amp;</h3>'));
  assert.ok(html.includes('<p class="tl__text">&lt;b&gt;&quot;&amp;</p>'));
  assert.match(html, /class="text-link"[^>]*>&lt;b&gt;&quot;&amp;/);
  assert.doesNotMatch(html, /datetime=|<b>/);
});

test('built Journey meets structure, accessibility, confidentiality and spine contracts', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tpct-timeline-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const outDir = path.join(root, 'build');
  await build({ outDir });
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  const css = await readFile(path.join(outDir, 'assets/site.css'), 'utf8');
  const section = html.match(/<section id="timeline"[\s\S]*?<\/section>/)[0];
  const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['top', 'about', 'experience', 'timeline', 'skills', 'work', 'services', 'process', 'contact']);
  const nav = html.match(/<nav\b[^>]*id="primary-nav"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...nav.matchAll(/href="#([^"]+)"[^>]*>([^<]+)/g)].map(m => [m[1], m[2]]), [['about', 'About'], ['timeline', 'Journey'], ['skills', 'Stack'], ['work', 'Work'], ['services', 'Services'], ['contact', 'Contact']]);
  assert.deepEqual([...html.matchAll(/class="section-head__index"[^>]*>(\d{2}) \//g)].map(m => m[1]), ['01', '02', '03', '04', '05', '06', '07', '08']);
  const items = [...section.matchAll(/<li class="tl__item ([^"]+)">([\s\S]*?)<\/li>/g)];
  assert.equal(items.length, 15);
  for (const [i, item] of c.timeline.entries()) {
    const same = i > 0 && item.year === c.timeline[i - 1].year;
    assert.equal(items[i][1], 'tl__item--' + item.kind + (same ? ' tl__item--same-year' : ''));
    assert.ok(items[i][2].includes('<time class="tl__year' + (same ? ' vh' : '') + '" datetime="' + item.year + '">' + item.year + '</time>'));
    assert.ok(items[i][2].includes('<h3 id="tl-' + i + '">' + esc(item.title) + '</h3>'));
  }
  assert.equal((section.match(/class="tl__node" aria-hidden="true"/g) ?? []).length, 15);
  assert.match(section, /class="tl__spark" aria-hidden="true"/);
  const links = [...section.matchAll(/<a href="([^"]+)" class="text-link" target="_blank" rel="noopener noreferrer">([\s\S]*?)<\/a>/g)];
  assert.equal(links.length, 3);
  for (const link of links) assert.ok(link[2].includes('<span class="vh"> ' + esc(c.a11y.newTab) + '</span>'));
  const hrefs = [...section.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  assert.equal(hrefs.length, 3);
  for (const href of hrefs) assert.match(href, /^https:\/\/github\.com\/TPCT\//);
  assert.doesNotMatch(html, /style="/);
  assert.deepEqual([...section.matchAll(/<h([1-6])\b/g)].map(m => m[1]), ['2', ...Array(15).fill('3')]);
  assert.doesNotMatch(section, /<(?:button|input|select|textarea)\b|tabindex="(?!-1)/);
  for (const [id, year] of [['national-waste-analytics', 2025], ['aic-operations-suite', 2026]]) {
    const card = [...html.matchAll(/<li class="card card--[^>]*>[\s\S]*?<\/article><\/li>/g)].map(m => m[0]).find(card => card.includes('id="p-' + id + '"'));
    assert.ok(card.includes('<span class="card__year">' + year + '</span>'));
  }
  const background = selector => {
    const escaped = selector.replace(/[.*+?^\u0024{}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(escaped + ' \\{[^}]*background: ([^;]+);'))[1];
  };
  assert.equal(background('.timeline::before'), background('.spine__track'));
  assert.equal(background('.timeline::after'), background('.spine__fill'));
  assert.match(css, /\.tl__lead \{[^}]*margin-block-end: var\(--space-6\)/);
  assert.match(css, /scale: 1 var\(--tl-p, 1\)/);
  await mkdir(path.join(root, 'dist'));
  await writeFile(path.join(root, 'dist/index.html'), section);
  await rm(outDir, { recursive: true });
  const result = await checkConfidential({ root, dist: 'dist', denylist: fileURLToPath(new URL('../.company/private/denylist.txt', import.meta.url)), git: false });
  assert.deepEqual(result.hits, []);
  if (!result.denylistLoaded) t.diagnostic('denylist absent: hostname rule only');
  // Exercise the hostname rule independently even when the private list is absent.
  await writeFile(path.join(root, 'dist/index.html'), 'example.' + 'shiftcodes' + '.net');
  assert.ok((await checkConfidential({ root, dist: 'dist', git: false })).hits.some(h => h.rule === 'hostname'));
});

test('timeline source budgets and motion scoping', async () => {
  const source = await readFile(new URL('../src/scripts/73-timeline.js', import.meta.url));
  assert.ok(source.length <= 1250, String(source.length));
  const spy = await readFile(new URL('../src/scripts/50-scrollspy.js', import.meta.url), 'utf8');
  assert.match(spy, /timeline:\s*'timeline'/);
  let css = await readFile(new URL('../src/styles/55-timeline.css', import.meta.url), 'utf8');
  const gate = /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{/g;
  let remainder = '', start = 0, match;
  while ((match = gate.exec(css))) {
    remainder += css.slice(start, match.index);
    let depth = 1, end = gate.lastIndex;
    while (depth && end < css.length) {
      if (css[end] === '{') depth++;
      if (css[end] === '}') depth--;
      end++;
    }
    assert.equal(depth, 0);
    start = end;
    gate.lastIndex = end;
  }
  remainder += css.slice(start);
  assert.doesNotMatch(remainder, /@keyframes|\banimation\s*:/);
  assert.doesNotMatch(css, /section-head|will-change/);
});
