import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { build } from '../scripts/build.mjs';

test('script source conventions, syntax and CSP safety', async () => {
  const dir = new URL('../src/scripts/', import.meta.url);
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.js')) continue;
    const file = new URL(name, dir), source = await readFile(file, 'utf8');
    assert.ok(source.startsWith('(function () {\n  "use strict";'), name);
    const result = spawnSync(process.execPath, ['--check', file.pathname], { encoding: 'utf8' });
    assert.equal(result.status, 0, name + ': ' + result.stderr);
    assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|cssText|setAttribute\(\s*['"]style|\beval\(|new Function/, name);
  }
});

for (const [name, cap] of [['60-motion.js', 3000], ['62-spine.js', 700], ['61-pointer.js', 4096], ['10-theme.js', 1500], ['30-filter.js', 5000]]) {
  test(name + ' stays within its source byte budget', async () => {
    const source = await readFile(new URL('../src/scripts/' + name, import.meta.url));
    assert.ok(source.length <= cap, name + ': ' + source.length + ' > ' + cap);
  });
}

function context(reduce) {
  const classes = new Set();
  const classList = {
    add: (...names) => names.forEach(n => classes.add(n)),
    remove: (...names) => names.forEach(n => classes.delete(n)),
    contains: n => classes.has(n),
    toggle(n, force = !classes.has(n)) {
      if (force) classes.add(n); else classes.delete(n);
      return force;
    }
  };
  const ctx = {
    document: {
      documentElement: { classList, dataset: { theme: 'dark' }, style: { setProperty() {}, removeProperty() {} } },
      querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
      addEventListener() {}
    },
    matchMedia: q => ({ matches: q.includes('reduce') ? reduce : false, addEventListener() {} }),
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    setTimeout: () => 0, clearTimeout() {}, performance: { now: () => 0 },
    localStorage: { getItem: () => null, setItem() {} },
    location: { search: '', pathname: '/' }, history: { replaceState() {} }, navigator: {},
    innerHeight: 800, innerWidth: 1280, scrollY: 0, addEventListener() {}
  };
  ctx.window = ctx;
  return ctx;
}

test('built scripts respect the bundle budget and tolerate missing hooks', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-scripts-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const source = await readFile(path.join(outDir, 'assets/site.js'), 'utf8');
  assert.ok(Buffer.byteLength(source) <= 26392);
  for (const reduce of [true, false]) {
    const ctx = context(reduce);
    assert.doesNotThrow(() => vm.runInNewContext(source, ctx));
    assert.equal(ctx.document.documentElement.classList.contains('motion'), !reduce);
  }
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.match(html, /<div class="cursor-glow" aria-hidden="true"><\/div>/);
  const pointer = await readFile(new URL('../src/scripts/61-pointer.js', import.meta.url), 'utf8');
  assert.match(pointer, /--px/);
  assert.match(pointer, /--py/);
  assert.match(pointer, /pointer: fine/);
  assert.match(pointer, /prefers-reduced-motion: reduce/);
});

test('hero assembly is independent of pointer initialization and replay resets synchronously', async () => {
  const css = await readFile(new URL('../src/styles/40-hero.css', import.meta.url), 'utf8');
  for (const part of ['hook-top', 'hook-bottom', 'lt', 'gt', 'slash']) {
    assert.ok(css.includes('.js .sc-hero .sc-part--' + part + ' path { animation:'));
  }
  assert.doesNotMatch(css, /is-assembling/);
  assert.match(css, /\.sc-hero\.is-replay \.sc-mark path \{ animation: none !important; \}/);
  const pointer = await readFile(new URL('../src/scripts/61-pointer.js', import.meta.url), 'utf8');
  assert.doesNotMatch(pointer, /is-assembling/);
  assert.doesNotMatch(pointer, /is-replay/);
  const motion = await readFile(new URL('../src/scripts/60-motion.js', import.meta.url), 'utf8');
  assert.match(motion, /addEventListener\('click',\(\)=>\{[^}]*classList\.add\('is-replay'\);\s*void r\.offsetWidth;\s*r\.classList\.remove\('is-replay'\)/);
});

test('spine progress is clamped, frame-throttled and respects motion changes', async () => {
  const source = await readFile(new URL('../src/scripts/62-spine.js', import.meta.url), 'utf8');
  let top = 480, progress, queued, frames = 0;
  const events = {}, preference = { matches: false, addEventListener: (name, fn) => { events[name] = fn; } };
  const main = { style: { setProperty: (name, value) => { assert.equal(name, '--spine-progress'); progress = value; } } };
  vm.runInNewContext(source, {
    document: { querySelector: selector => { assert.equal(selector, '.spine'); return { getBoundingClientRect: () => ({ top, height: 4000 }), parentElement: main }; } }, matchMedia: () => preference, innerHeight: 800,
    addEventListener: (name, fn) => { events[name] = fn; },
    requestAnimationFrame: fn => { queued = fn; frames++; return frames; }
  });
  assert.equal(progress, 0);
  top = -1520;
  events.scroll(); events.scroll();
  assert.equal(frames, 1);
  queued(); assert.equal(progress, .5);
  top = -5000;
  events.scroll(); queued(); assert.equal(progress, 1);
  preference.matches = true; top = 1000;
  events.change(); queued(); assert.equal(progress, 1);
});

test('stat count-up animates simple numbers and leaves composite values static', async () => {
  const source = await readFile(new URL('../src/scripts/60-motion.js', import.meta.url), 'utf8');
  for (const reduce of [false, true]) {
    const ctx = context(reduce), animated = [], frames = [];
    const values = ['9+', '~250', '3 s → 500 ms', '$15k → $2k'];
    const nodes = values.map(textContent => ({ textContent, offsetWidth: 80, style: { set minWidth(value) {} }, replaceChildren() { animated.push(textContent); } }));
    const stats = { querySelectorAll: () => nodes, getBoundingClientRect: () => ({ top: 100, bottom: 300 }) };
    ctx.document.querySelector = selector => selector === '.stats' ? stats : null;
    ctx.document.createElement = () => ({ setAttribute() {} });
    ctx.setTimeout = fn => { fn(); return 0; };
    ctx.requestAnimationFrame = fn => { frames.push(fn); return 0; };
    vm.runInNewContext(source, ctx);
    assert.deepEqual(animated, reduce ? [] : ['9+', '~250']);
    for (const fn of frames) fn(1400);
    assert.equal(nodes[2].textContent, values[2]);
    assert.equal(nodes[3].textContent, values[3]);
  }
});
