import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { build } from '../scripts/build.mjs';

const source = await readFile(new URL('../src/scripts/72-spot.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/styles/61-cards-live.css', import.meta.url), 'utf8');

function withoutBlocks(text, gate) {
  let remainder = '', start = 0, match;
  while ((match = gate.exec(text))) {
    remainder += text.slice(start, match.index);
    let depth = 1, end = gate.lastIndex;
    while (depth && end < text.length) {
      if (text[end] === '{') depth++;
      if (text[end] === '}') depth--;
      end++;
    }
    assert.equal(depth, 0, 'balanced media block');
    start = end;
    gate.lastIndex = end;
  }
  return remainder + text.slice(start);
}

test('spotlight source stays within budget and CSP conventions', () => {
  assert.ok(Buffer.byteLength(source) <= 900);
  assert.ok(source.startsWith('(function () {\n  "use strict";'));
  for (const token of ['--sx', '--sy', 'is-spot', 'pointer: fine', 'motion-paused']) assert.ok(source.includes(token), token);
  assert.doesNotMatch(source, /is-lit|innerHTML|outerHTML|insertAdjacentHTML|cssText|setAttribute\(\s*['"]style|\beval\(|new Function/);
});

test('rim and spotlight CSS retain motion, input and accessibility gates', () => {
  for (const token of ['@property --rim-angle', '@keyframes rim-spin', '.card.is-spot::before', '.card:focus-within > article::before', '.motion-paused .card > article::before', '@supports not ((mask-composite: exclude) or (-webkit-mask-composite: xor))', '@media (forced-colors: active) { .card::before, .card > article::before { display: none; } }']) assert.ok(css.includes(token), token);
  assert.doesNotMatch(withoutBlocks(css, /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{/g), /@keyframes|\banimation\s*:/);
  assert.doesNotMatch(withoutBlocks(css, /@media\s*\(hover:\s*hover\) and \(pointer:\s*fine\)\s*\{/g), /:hover/);
  assert.match(css, /\.motion \.card:focus-within > article::before \{ animation:/);
  assert.match(css, /\.motion-paused \.card::before \{ opacity: 0; \}/);
  assert.doesNotMatch(css, /is-lit|will-change|\.card::after\s*\{/);
});

test('spotlight returns early for each missing gate', () => {
  for (const [motion, fine] of [[false, true], [true, false], [true, true]]) {
    assert.doesNotThrow(() => vm.runInNewContext(source, {
      document: { documentElement: { classList: { contains: () => motion } }, getElementById: () => null },
      matchMedia: () => ({ matches: fine })
    }));
  }
});

test('built cards retain markup without inline styles', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-cards-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /style="/);
});
