import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { validateContent } from '../src/lib/validate.mjs';
import { esc } from '../src/lib/html.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));

test('built About has the statement, pillars and accessible company rail', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-about-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(`${outDir}/index.html`, 'utf8');
  assert.doesNotMatch(html, /id="experience"/);
  const about = html.match(/<section id="about"[^]*?<\/section>/)?.[0];
  assert.ok(about);
  const lead = about.match(/<p class="about__lead" data-reveal>(.*?)<\/p>/)[1];
  assert.equal((lead.match(/class="about__line(?: about__line--accent)?"/g) ?? []).length, 2);
  assert.equal(lead.replace(/<[^>]*>/g, ''), c.about.lead.map(esc).join(' '));
  assert.ok(about.includes(`<p class="about__intro" data-reveal>${esc(c.about.intro)}</p>`));
  assert.match(about, /<ul class="pillars" aria-label="How I work" data-reveal>/);
  const pillars = [...about.matchAll(/<li class="pillar">(.*?)<\/li>/g)];
  assert.equal(pillars.length, 4);
  pillars.forEach(([ , pillar], i) => {
    assert.ok(pillar.includes(`<svg class="icon-${c.about.pillars[i].icon}"`));
    assert.ok(pillar.includes(`<span class="pillar__index" aria-hidden="true">0${i + 1}</span>`));
    assert.equal((pillar.match(/<h3>/g) ?? []).length, 1);
    assert.equal((pillar.match(/<p>/g) ?? []).length, 1);
    assert.ok(pillar.includes(`<h3>${esc(c.about.pillars[i].title)}</h3>`));
    assert.ok(pillar.includes(`<p>${esc(c.about.pillars[i].text)}</p>`));
  });
  assert.match(about, /<div class="clients" data-reveal><p class="label" id="clients-label">Worked with<\/p>/);
  const lists = [...about.matchAll(/<ul class="clients__list([^\"]*)"([^>]*)>(.*?)<\/ul>/g)];
  assert.equal(lists.length, 2);
  assert.equal(lists[0][2], ' aria-labelledby="clients-label"');
  assert.equal(lists[1][1], ' clients__list--dup');
  assert.equal(lists[1][2], ' aria-hidden="true"');
  for (const list of lists) {
    assert.equal((list[3].match(/<li>/g) ?? []).length, 12);
    assert.equal(list[3], c.about.companies.map(name => `<li>${esc(name)}</li>`).join(''));
  }
  assert.doesNotMatch(about, /about__facts|about__body|<dl/);
  for (const stat of c.stats) assert.ok(!about.includes(esc(stat.value)));
  for (const file of await readdir(new URL('../src/styles/', import.meta.url))) {
    if (file.endsWith('.css')) assert.doesNotMatch(await readFile(new URL(`../src/styles/${file}`, import.meta.url), 'utf8'), /\.about__(?:body|fact|stats)/);
  }
});

test('About CSS gates drift and preserves static, paused and print states', async () => {
  const css = await readFile(new URL('../src/styles/51-about.css', import.meta.url), 'utf8');
  const start = css.indexOf('@media (prefers-reduced-motion: no-preference)');
  const end = css.indexOf('@media (forced-colors:', start);
  const motion = css.slice(start, end);
  const staticCss = css.slice(0, start) + css.slice(end);
  const topLevel = css.replace(/@media[^{}]*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
  assert.match(topLevel, /\.clients__list--dup \{ display: none; \}/);
  assert.match(staticCss, /\.clients__list \{ display: flex; flex-wrap: wrap;/);
  assert.match(staticCss, /\.clients__rail \{ overflow: hidden; overflow: clip; \}/);
  assert.doesNotMatch(css.slice(0, start), /@keyframes|\banimation:/);
  assert.doesNotMatch(css.slice(end, css.indexOf('@media print')), /@keyframes|\banimation:/);
  assert.match(motion, /@keyframes clients-drift/);
  assert.match(motion, /\.js \.clients__list \{[^}]*animation: clients-drift 48s linear infinite/);
  assert.match(motion, /\.js \.clients__list--dup \{ display: flex; \}/);
  assert.match(motion, /\.clients__rail:hover \.clients__list, \.motion-paused \.clients__list \{ animation-play-state: paused; \}/);
  assert.match(css, /min-width: 640px[^]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /min-width: 1024px[^]*repeat\(auto-fit, minmax\(220px, 1fr\)\)/);
  assert.match(css, /@media print[^]*animation: none !important/);
});

test('current About validates', () => assert.deepEqual(validateContent(c).errors, []));
const cases = [];
for (const key of ['title', 'intro', 'pillarsLabel', 'companiesLabel']) {
  for (const value of [undefined, '', ' ', 42]) cases.push([`${key} ${value}`, x => { x.about[key] = value; }, `about.${key}: required non-empty string`]);
}
cases.push(['long intro', x => { x.about.intro = 'x'.repeat(201); }, 'about.intro: must be ≤ 200 characters']);
for (const value of [undefined, [], ['one'], ['one', 'two', 'three'], ['', 'two'], [42, 'two']]) cases.push(['invalid lead', x => { x.about.lead = value; }, 'about.lead: expected exactly 2 lines']);
for (const i of [0, 1]) cases.push(['long lead', x => { x.about.lead[i] = 'x'.repeat(61); }, `about.lead[${i}]: must be ≤ 60 characters`]);
for (const value of [undefined, [], c.about.pillars.slice(0, 2), [...c.about.pillars, c.about.pillars[0]]]) cases.push(['pillar count', x => { x.about.pillars = value; }, 'about.pillars: expected 3–4 items']);
for (const value of [undefined, '', 'toString', 'unknown']) cases.push(['unknown icon', x => { x.about.pillars[0].icon = value; }, 'about.pillars[0].icon: unknown icon']);
for (const [key, cap] of [['title', 24], ['text', 120]]) {
  for (const value of [undefined, '', ' ', 42]) cases.push([`pillar ${key}`, x => { x.about.pillars[0][key] = value; }, `about.pillars[0].${key}: required non-empty string`]);
  cases.push([`long pillar ${key}`, x => { x.about.pillars[0][key] = 'x'.repeat(cap + 1); }, `about.pillars[0].${key}: must be ≤ ${cap} characters`]);
}
for (const stat of c.stats) cases.push(['hero stat', x => { x.about.pillars[0].text = `Delivered ${stat.value}.`; }, 'about.pillars[0].text: repeats a hero stat']);
for (const item of [...c.skills.flatMap(s => s.items), 'C#', '.NET']) cases.push([`Stack ${item}`, x => { x.skills[0].items.push(item); x.about.pillars[0].text = `Using ${item.toUpperCase()} today.`; }, 'about.pillars[0].text: repeats a Stack item']);
for (const value of [undefined, [], c.about.companies.slice(0, 5), Array(17).fill('Kearney')]) cases.push(['company count', x => { x.about.companies = value; }, 'about.companies: expected 6–16 items']);
cases.push(['unknown company', x => { x.about.companies[0] = 'Unknown'; }, 'about.companies[0]: not found in experience']);
cases.push(['duplicate company', x => { x.about.companies[1] = 'KEARNEY'; }, 'about.companies: duplicate "KEARNEY"']);
for (const value of ['', ' ', 42]) cases.push(['company string', x => { x.about.companies[0] = value; }, 'about.companies[0]: required non-empty string']);
for (const key of ['paragraphs', 'factsLabel']) cases.push([`removed ${key}`, x => { x.about[key] = undefined; }, 'about.paragraphs: removed, use lead/intro/pillars']);
for (const [i, [name, mutate, message]] of cases.entries()) test(`About rejects ${name} (${i})`, () => {
  const bad = structuredClone(c);
  mutate(bad);
  assert.ok(validateContent(bad).errors.includes(message), message);
});
test('About accepts limits, case-insensitive companies and phrase boundaries', () => {
  const good = structuredClone(c);
  good.about.intro = 'x'.repeat(200);
  good.about.lead = ['x'.repeat(60), 'y'.repeat(60)];
  good.about.pillars = good.about.pillars.slice(0, 3);
  good.about.pillars[0].title = 'x'.repeat(24);
  good.about.pillars[0].text = 'x'.repeat(120);
  good.about.companies = good.about.companies.slice(0, 6).map(name => name.toUpperCase());
  assert.deepEqual(validateContent(good).errors, []);
  good.skills[0].items.push('C#', '.NET');
  good.about.pillars[0].text = 'XC# and .NETwork stay separate.';
  assert.deepEqual(validateContent(good).errors, []);
});
