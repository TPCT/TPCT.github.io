import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { build } from '../scripts/build.mjs';

const source = await readFile(new URL('../src/scripts/70-field.js', import.meta.url), 'utf8');

test('field markup is decorative, first in the hero and absent on 404', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-field-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.match(html, /<section id="top" class="hero"[^>]*><canvas class="sc-field" aria-hidden="true"><\/canvas><div class="container">/);
  assert.doesNotMatch(await readFile(path.join(outDir, '404.html'), 'utf8'), /sc-field/);
  const css = await readFile(path.join(outDir, 'assets/site.css'), 'utf8');
  assert.match(css, /@media\s*\(forced-colors:\s*active\)\s*\{\s*\.sc-field\s*\{\s*display:\s*none/);
  assert.match(css, /@media print\s*\{\s*\.sc-field\s*\{\s*display:\s*none/);
});

test('field source respects its budget and required hooks', () => {
  assert.ok(Buffer.byteLength(source) <= 4096);
  assert.ok(source.startsWith('(function () {\n  "use strict";'));
  for (const hook of ['devicePixelRatio', 'visibilitychange', 'motion-paused', 'IntersectionObserver', '(hover: hover) and (pointer: fine)', 'getComputedStyle']) assert.ok(source.includes(hook), hook);
});

test('field CSS gates all motion on the motion preference', async () => {
  const css = await readFile(new URL('../src/styles/41-field.css', import.meta.url), 'utf8');
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
  assert.doesNotMatch(remainder, /@keyframes|\banimation\s*:|\btransition\s*:/);
  assert.match(css, /\.sc-field\s*\{[^}]*opacity: 0/);
});

for (const missingHero of [true, false]) {
  test('field tolerates ' + (missingHero ? 'missing hero and optional observers' : 'unavailable canvas context'), () => {
    let added = false, contextRequested = false;
    const canvas = { getContext: () => { contextRequested = true; return null; }, classList: { add: () => { added = true; } } };
    const hero = { querySelector: () => canvas };
    assert.doesNotThrow(() => vm.runInNewContext(source, {
      document: { documentElement: { classList: { contains: () => true } }, querySelector: () => missingHero ? null : hero },
      IntersectionObserver: class {}
    }));
    assert.equal(contextRequested, !missingHero);
    assert.equal(added, false);
  });
}

function runningField(fine = true) {
  const classes = new Set(), frames = new Map();
  let id = 0, resize, arcs = 0, removals = 0;
  const context = new Proxy({}, { get: (_, name) => name === 'arc' ? () => { arcs++; } : () => {} });
  const canvas = {
    getContext: () => context,
    classList: { add: name => classes.add(name), remove: name => { removals++; classes.delete(name); } }
  };
  const hero = {
    clientWidth: 1200, clientHeight: 900,
    querySelector: selector => selector === '.sc-field' ? canvas : null,
    getBoundingClientRect: () => ({ left: 0, top: 0 }), addEventListener() {}
  };
  vm.runInNewContext(source, {
    document: {
      documentElement: { classList: { contains: name => name === 'motion' }, dataset: { theme: 'dark' } },
      querySelector: () => hero, readyState: 'complete', hidden: false, addEventListener() {}
    },
    window: { devicePixelRatio: 1 }, matchMedia: () => ({ matches: fine }),
    getComputedStyle: () => ({ getPropertyValue: name => name === '--field-alpha' ? '1.1' : '#8FA0FF' }),
    IntersectionObserver: class { constructor(callback) { this.callback = callback; } observe() { this.callback([{ isIntersecting: true }]); } },
    ResizeObserver: class { constructor(callback) { resize = callback; } observe() {} },
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id), setTimeout: callback => { callback(); }, addEventListener() {}
  });
  return {
    classes, hero, resize: () => resize(), get removals() { return removals; },
    frame(time) {
      assert.equal(frames.size, 1, 'one animation frame remains scheduled');
      const [id, callback] = frames.entries().next().value;
      frames.delete(id); arcs = 0; callback(time);
      return arcs;
    }
  };
}

test('coarse field stays live through 200 frames at 33ms intervals', () => {
  const field = runningField(false);
  for (let frame = 1; frame <= 200; frame++) {
    field.frame(frame * 33);
    assert.ok(field.classes.has('is-live'));
  }
  assert.equal(field.removals, 0);
});

test('fast first quality check preserves the full particle count on resize', () => {
  const field = runningField();
  for (let frame = 1; frame <= 100; frame++) assert.equal(field.frame(frame * 16), 70);
  field.hero.clientWidth = 900;
  field.hero.clientHeight = 800;
  field.resize();
  assert.equal(field.frame(1616), 48);
});

test('slow first quality check preserves the reduced particle count on resize', () => {
  const field = runningField();
  for (let frame = 1; frame <= 91; frame++) field.frame(frame * 33);
  field.hero.clientWidth = 900;
  field.hero.clientHeight = 800;
  field.resize();
  assert.equal(field.frame(3036), 29);
  assert.ok(field.classes.has('is-live'));
});
