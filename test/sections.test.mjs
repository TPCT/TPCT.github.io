import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { build } from '../scripts/build.mjs';
import { esc } from '../src/lib/html.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));

test('Prism sections retain markup contracts and CSS budgets', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-sections-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(`${outDir}/index.html`, 'utf8');
  const nf = await readFile(`${outDir}/404.html`, 'utf8');
  const css = await readFile(`${outDir}/assets/site.css`, 'utf8');
  assert.ok((html.match(/\bdata-reveal\b/g) ?? []).length >= 30);
  assert.equal((html.match(/<header class="section-head" data-reveal>/g) ?? []).length, 7);
  const cards = html.match(/<li class="card card--[^>]*>/g) ?? [];
  assert.equal(cards.length, c.projects.length);
  for (const card of cards) assert.ok(card.endsWith(' data-reveal>'));
  assert.ok(html.includes('<ol class="process" data-reveal>'));
  assert.match(html, /class="filters" hidden data-reveal/);
  const heroStart = html.indexOf('<section id="top"');
  assert.ok(heroStart >= 0);
  assert.ok(!html.slice(heroStart, html.indexOf('</section>', heroStart)).includes('data-reveal'));
  assert.ok(html.includes('<p class="lead">' + esc(c.projectsIntro.lead) + '</p>'));
  assert.ok(!nf.includes('data-reveal'));
  for (const page of [html, nf]) assert.ok(!page.includes('style="'));
  const names = ['bg', 'surface-2', 'line', 'line-strong', 'text', 'text-muted', 'text-subtle', 'accent', 'accent-hover', 'on-accent', 'accent-text', 'oss', 'radius-[123]', 'font-mono', 'fs-tag', 'shadow-card-hover'];
  await t.test('legacy token migration', () => {
    assert.doesNotMatch(css, new RegExp('(?<![\\w-])--(' + names.join('|') + ')(?![\\w-])'));
  });
  assert.ok(!css.includes('font-stretch'));
  assert.equal((css.match(/@keyframes card-in\b/g) ?? []).length, 1);
  assert.match(css, /@keyframes card-in\s*\{\s*from\s*\{[^}]*scale: \.94/);
  for (const hook of ['@keyframes shard-in', '@keyframes wobble', '.card.is-tilt', '.card::after', '.process > li:nth-child(8)']) assert.ok(css.includes(hook), hook);
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.ok((css.match(/(?<!-webkit-)backdrop-filter:\s*var\(--glass-blur\)/g) ?? []).length <= 3);
  await t.test('CSS byte budget', () => {
    assert.ok(Buffer.byteLength(css) <= 81920, `CSS is ${Buffer.byteLength(css)} bytes`);
    assert.ok(zlib.gzipSync(css).length <= 18432, `Gzipped CSS is ${zlib.gzipSync(css).length} bytes`);
  });
});

test('section partials gate every keyframe and animation on motion preference', async () => {
  for (const name of ['50-sections', '60-work', '70-contact', '80-404', '90-footer']) {
    const css = await readFile(new URL(`../src/styles/${name}.css`, import.meta.url), 'utf8');
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
      assert.equal(depth, 0, `${name}: unbalanced motion block`);
      start = end;
      gate.lastIndex = end;
    }
    remainder += css.slice(start);
    assert.doesNotMatch(remainder, /@keyframes|\banimation\s*:/, name);
  }
});

test('career is grouped with native earlier roles and deterministic inclusive dates', async () => {
  const { renderExperience, renderCard } = await import('../src/render/sections.mjs');
  const html = renderExperience(c, new Date('2026-10-21T00:00:00Z'));
  assert.match(html, /<ol class="career">/);
  assert.equal((html.match(/class="career__org"/g) ?? []).length, 13);
  assert.equal((html.split('<details')[0].match(/class="career__org"/g) ?? []).length, 6);
  assert.match(html, /<details class="career__more"><summary>Earlier roles<\/summary>/);
  assert.match(html, /<time datetime="2017-03">Mar 2017<\/time>/);
  assert.match(html, /Present · 3 mos/);
  assert.match(html, /1 yr 7 mos/);
  assert.doesNotMatch(html, /exp__summary/);
  assert.equal((html.match(/class="career__now"/g) ?? []).length, 3);
  const project = c.projects.find(p => p.id === 'multi-vendor-restaurant-platform');
  assert.doesNotMatch(renderCard(project, c), /<a\b/);
  assert.match(renderCard(c.projects.find(p => p.id === 'national-waste-analytics'), c), /class="card__year">2025</);
  assert.equal(c.projects.find(p => p.id === 'aic-operations-suite').year, 2026);
});
