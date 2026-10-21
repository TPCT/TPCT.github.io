import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';

test('atmosphere source stays within budget, CSP rules and chapter moods', async () => {
  const source = await readFile(new URL('../src/scripts/83-atmos.js', import.meta.url), 'utf8');
  assert.ok(Buffer.byteLength(source) <= 2400, Buffer.byteLength(source));
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|cssText|setAttribute\(\s*['"]style|\beval\(|new Function/);
  const table = source.match(/M=(\{(?:\w+:\[[\d.,]+\],?)+\})/)[1];
  const parsed = Object.fromEntries([...table.matchAll(/(\w+):\[([\d.,]+)\]/g)].map(([, id, values]) => [id, values.split(',').map(Number)]));
  assert.deepEqual(parsed, {
    top: [0, 0, 0], about: [0, 0, 0], timeline: [1, .25, 0],
    skills: [.2, 1, 0], work: [.2, 1, 0], services: [.6, .55, .35], process: [.6, .55, .35], contact: [.45, .8, 1]
  });
});

test('built atmosphere CSS gates light layers and leaves splitting to runtime', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-atmos-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const css = await readFile(path.join(outDir, 'assets/site.css'), 'utf8');
  const media = css.match(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.bold \.tint[\s\S]*?\n\}/)[0];
  assert.equal(css.replace(media, '').includes('.bold .tint'), false);
  assert.match(media, /position: fixed; inset: 0; z-index: 0; pointer-events: none/);
  assert.match(css, /:root, \[data-theme="dark"\] \{ --tint-c: rgb\(90 31 224 \/ \.32\); \}/);
  assert.match(css, /\[data-theme="light"\] \{ --tint-c: rgb\(90 31 224 \/ \.14\); \}/);
  assert.match(css, /@media print, \(forced-colors: active\) \{ \.tint \{ display: none !important; \} \}/);
  assert.match(css, /\.ln \{ display: block; overflow: hidden; overflow: clip; padding-block-end: \.1em; margin-block-end: -\.1em; \}/);
  assert.match(css, /\.ln__in \{ display: inline-block; \}/);
  assert.ok(css.includes('.bold .section-head[data-reveal].is-pending, .bold .about__lead[data-reveal].is-pending { opacity: 1; translate: none; scale: none; }'));
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /class="ln"/);
});
