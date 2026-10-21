import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { esc } from '../src/lib/html.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));

test('stack marquee duplicates decorative rows and preserves accessible skills', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-wow-css-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(`${outDir}/index.html`, 'utf8');
  const css = await readFile(`${outDir}/assets/site.css`, 'utf8');
  const skills = html.match(/<section id="skills"[^>]*>(.*?)<\/section>/s)?.[1];
  assert.ok(skills);
  assert.match(skills, />03 \/ /);
  assert.equal((skills.match(/class="marquee" aria-hidden="true"/g) ?? []).length, 1);
  const marquee = skills.slice(skills.indexOf('<div class="marquee"'), skills.indexOf('<div class="skills">'));
  assert.ok(skills.indexOf('</header>') < skills.indexOf('<div class="marquee"'));
  assert.doesNotMatch(marquee, /<(?:a|button)\b|tabindex/i);
  const rows = [...marquee.matchAll(/<div class="marquee__row marquee__row--([ab])">(.*?)<\/div>/gs)];
  assert.deepEqual(rows.map(r => r[1]), ['a', 'b']);
  const items = [...new Set(c.skills.flatMap(s => s.items))];
  rows.forEach((row, parity) => {
    const lists = [...row[2].matchAll(/<ul class="marquee__list">(.*?)<\/ul>/gs)];
    assert.equal(lists.length, 2);
    assert.equal(lists[0][1], lists[1][1]);
    assert.equal(lists[0][1], items.filter((_, i) => i % 2 === parity).map(item => `<li>${esc(item)}</li>`).join(''));
  });
  const groups = [...skills.matchAll(/<div class="skill-group" data-reveal>(.*?)<\/ul><\/div>/gs)];
  assert.equal(groups.length, c.skills.length);
  groups.forEach((group, i) => {
    assert.ok(group[1].includes(`<h3>${esc(c.skills[i].group)}</h3>`));
    assert.equal(group[1].slice(group[1].indexOf('<ul class="tags">')), `<ul class="tags">${c.skills[i].items.map(item => `<li class="tag">${esc(item)}</li>`).join('')}`);
  });
  assert.doesNotMatch(html, /style="/);
  for (const hook of ['@property --shift', '@supports (animation-timeline: view())', '@keyframes marquee', '.motion-paused .marquee__row', '.marquee:hover .marquee__row', 'transition: --shift 520ms var(--ease-spring)', 'margin-block: 0 var(--space-6)']) assert.ok(css.includes(hook), hook);
  assert.match(css, /\.marquee \{ display: none; \}/);
  assert.match(css, /#skills\s*\{[^}]*\bmin-width:\s*0\s*[;}]/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.js \.marquee \{ display: grid;/);
  assert.match(css, /@media print, \(forced-colors: active\) \{ \.marquee \{ display: none !important; \} \}/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\) and \(hover: hover\) and \(pointer: fine\) \{\s*\.motion \.sc-hero:hover \{ --shift: 1; \}/);
  assert.match(css, /\.motion \.sc-hero \{ animation: hero-exit linear both; animation-timeline: view\(\); animation-range: exit 0% exit 100%; \}/);
});

test('wow partials gate every keyframe and animation on motion preference', async () => {
  for (const name of ['43-hero-wow', '56-marquee']) {
    const css = await readFile(new URL(`../src/styles/${name}.css`, import.meta.url), 'utf8');
    const gate = /@media\s*\(prefers-reduced-motion:\s*no-preference\)[^{]*\{/g;
    let remainder = '', start = 0, match;
    while ((match = gate.exec(css))) {
      remainder += css.slice(start, match.index);
      let depth = 1, end = gate.lastIndex;
      while (depth && end < css.length) {
        if (css[end] === '{') depth++;
        if (css[end] === '}') depth--;
        end++;
      }
      assert.equal(depth, 0, `${name}: unbalanced motion block`);
      start = end;
      gate.lastIndex = end;
    }
    remainder += css.slice(start);
    assert.doesNotMatch(remainder, /@keyframes|\banimation\s*:/, name);
    assert.doesNotMatch(css, /will-change|(?:filter|box-shadow)\s*:/, name);
  }
});

test('hero replay works on touch and respects reduced motion and pause', async () => {
  const { runInNewContext } = await import('node:vm');
  const source = await readFile(new URL('../src/scripts/60-motion.js', import.meta.url), 'utf8');
  for (const reduce of [false, true]) {
    const rootClasses = new Set(), markClasses = new Set(), events = {};
    let reflows = 0;
    const classList = classes => ({
      add: value => classes.add(value), remove: value => classes.delete(value),
      contains: value => classes.has(value)
    });
    const mark = {
      classList: classList(markClasses), addEventListener: (name, fn) => { events[name] = fn; },
      get offsetWidth() { assert.ok(markClasses.has('is-replay')); reflows++; return 100; }
    };
    const hero = {};
    runInNewContext(source, {
      document: {
        documentElement: { classList: classList(rootClasses) },
        querySelector: selector => selector === '.hero' ? hero : selector === '.hero .sc-hero' ? mark : null,
        querySelectorAll: () => []
      },
      window: { IntersectionObserver: true },
      IntersectionObserver: class { observe() {} },
      matchMedia: query => ({ matches: query.includes('reduce') && reduce })
    });
    if (reduce) { assert.equal(events.click, undefined); continue; }
    events.click();
    assert.equal(reflows, 1);
    assert.ok(!markClasses.has('is-replay'));
    rootClasses.add('motion-paused');
    events.click();
    assert.equal(reflows, 1);
    rootClasses.delete('motion-paused');
    markClasses.add('is-idle');
    events.click();
    assert.equal(reflows, 1);
  }
});
