import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { validateContent } from '../src/lib/validate.mjs';
import { esc } from '../src/lib/html.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));

test('built About stacks its heading above the full-width body and key facts', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-about-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(`${outDir}/index.html`, 'utf8');
  const css = await readFile(`${outDir}/assets/site.css`, 'utf8');
  const about = html.match(/<section id="about"[^]*?<\/section>/)?.[0];
  assert.ok(about);
  assert.match(about, /<header class="section-head" data-reveal>[^]*?<\/header><div class="about__body" data-reveal>/);
  assert.match(about, /section-head__index[^]*?<h2 id="about-title"/);
  const facts = about.match(/<aside class="about__facts" aria-label="Key facts" data-reveal>[^]*?<\/aside>/)?.[0];
  assert.ok(facts);
  assert.equal((facts.match(/class="about__fact"/g) ?? []).length, c.stats.length);
  for (const stat of c.stats) {
    assert.ok(facts.includes(`<dt>${esc(stat.label)}</dt><dd>${esc(stat.value)}</dd>`));
  }
  for (const chip of [c.hero.location, ...c.hero.roles.slice(0, 2)]) assert.ok(facts.includes(`<li class="tag">${esc(chip)}</li>`));
  assert.ok(!facts.includes(esc(c.hero.roles[2])));
  assert.doesNotMatch(css, /#about h2\s*\{[^}]*sticky/);
  assert.doesNotMatch(css, /#about \.section-head\s*\{\s*display:\s*contents/);
  assert.doesNotMatch(css, /#about > \.container\s*\{[^}]*display:\s*grid/);
  assert.match(css, /\.about__body\s*\{[^}]*grid-template-columns: minmax\(0, 1\.35fr\) minmax\(0, 1fr\)/);
});

test('About requires a non-empty facts label', () => {
  for (const value of [undefined, '', 42]) {
    const bad = structuredClone(c);
    if (value === undefined) delete bad.about.factsLabel;
    else bad.about.factsLabel = value;
    assert.match(validateContent(bad).errors.join('\n'), /about\.factsLabel: required non-empty string/);
  }
});
