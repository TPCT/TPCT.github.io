import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';

test('bold hero preserves static markup and gates intro and roles on motion', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-bold-hero-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const css = await readFile(`${outDir}/assets/site.css`, 'utf8');
  const html = await readFile(`${outDir}/index.html`, 'utf8');
  for (const hook of ['--intro-offset', '--kinetic-wait: 800ms', '.is-kinetic .w > span { animation: none; }']) assert.ok(css.includes(hook), hook);
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
  for (const name of ['role-cycle', 'role-hold', 'intro-draw', 'intro-out']) {
    assert.match(css, new RegExp('@keyframes ' + name + '\\b'));
    assert.doesNotMatch(remainder, new RegExp('@keyframes ' + name + '\\b'));
  }
  assert.match(html, /<h1[^>]*>\s*<span class="w"><span>Islam<\/span><\/span> <span class="w w--accent"><span>Elsayed<\/span><\/span>\s*<\/h1>/);
  assert.doesNotMatch(html, /class="ch"/);
});

test('hero entrance offsets and kinetic source meet watchdog and CSP contracts', async () => {
  const css = await readFile(new URL('../src/styles/40-hero.css', import.meta.url), 'utf8');
  const entrance = css.slice(css.indexOf('@keyframes word-up'), css.indexOf('@keyframes sc-top-in'));
  const animations = [...entrance.matchAll(/animation:\s*([^;]+);/g)].map(m => m[1]).filter(a => a !== 'none');
  assert.equal(animations.length, 15);
  for (const animation of animations) assert.ok(animation.includes('var(--intro-offset)'), animation);
  assert.doesNotMatch(css, /\.js \.roles li:nth-child/);
  const source = await readFile(new URL('../src/scripts/81-kinetic.js', import.meta.url), 'utf8');
  assert.ok(Buffer.byteLength(source) <= 2600);
  for (const hook of ['aria-label', 'is-kinetic', 'expo.out', '--sy']) assert.ok(source.includes(hook));
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|cssText|setAttribute\(\s*['"]style|\beval\(|new Function/);
});


test('hero fallback and latest kinetic entrance finish within 3000ms', async () => {
  const css = await readFile(new URL('../src/styles/40-hero.css', import.meta.url), 'utf8');
  const intro = await readFile(new URL('../src/styles/44-intro.css', import.meta.url), 'utf8');
  const source = await readFile(new URL('../src/scripts/81-kinetic.js', import.meta.url), 'utf8');
  const content = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));
  const introOffset = Number(intro.match(/\.intro \{ --intro-offset: (\d+)ms/)[1]);
  const wait = Number(intro.match(/\.kinetic \{ --kinetic-wait: (\d+)ms/)[1]);
  const words = [...css.matchAll(/word-up (\d+)ms[^;]+calc\((\d+)ms \+ var\(--intro-offset\) \+ var\(--kinetic-wait\)\)/g)];
  assert.ok(words.length >= 2);
  const cutoff = Number(source.match(/performance.now\(\)>(\d+)\+/)[1]);
  const duration = Number(source.match(/duration:([\d.]+)/)[1]) * 1000;
  const stagger = Number(source.match(/each:([\d.]+)/)[1]) * 1000;
  const characters = [...content.hero.name.replace(/\s/g, '')].length;
  for (const offset of [0, introOffset]) {
    const fallbackEnd = Math.max(...words.slice(0, 2).map(m => Number(m[1]) + Number(m[2]))) + offset + wait;
    const kineticEnd = cutoff + offset + duration + (characters - 1) * stagger;
    for (const end of [fallbackEnd, kineticEnd]) {
      assert.ok(end <= 2800, `last letter settles at ${end}ms`);
      assert.ok(end <= 3000, `hero visible at ${end}ms`);
    }
  }
});


test('roles 2 and 3 hold opacity at zero until the rotator starts', async () => {
  const css = await readFile(new URL('../src/styles/44-intro.css', import.meta.url), 'utf8');
  assert.match(css, /@keyframes role-hold \{ from, to \{ opacity: 0; \} \}/);
  assert.match(css, /li:nth-child\(n\+2\) \{ animation: role-cycle 9s var\(--ease-in-out\) infinite both, role-hold var\(--roles-start\) linear; \}/);
  for (const [role, phase] of [[2, 6], [3, 3]]) {
    assert.ok(css.includes(`li:nth-child(${role}) { animation-delay: calc(var(--roles-start) - ${phase}s), 0s; }`));
  }
});

test('kinetic rise follows the curtain clock, waits for ready, and preserves repeat timing', async () => {
  const { runInNewContext } = await import('node:vm');
  const source = await readFile(new URL('../src/scripts/81-kinetic.js', import.meta.url), 'utf8');
  for (const mode of ['intro', 'pending', 'repeat', 'missing']) {
    let release, task, options, target, initial, observer;
    const animation = { animationName: 'intro-out', startTime: mode === 'pending' ? null : 400,
      ready: new Promise(resolve => { release = resolve; }) };
    const classes = new Set(['kinetic', ...(mode === 'repeat' ? [] : ['intro'])]);
    const word = { textContent: 'Islam', parentElement: { classList: { contains: () => false } },
      replaceChildren() {}, style: { removeProperty() {} } };
    const heading = { textContent: 'Islam', querySelectorAll: () => [word],
      setAttribute() {}, removeAttribute() {}, classList: { add() {} } };
    const g = { set: (chars, values) => { initial = values; }, timeline: value => {
      options = value;
      return { to: (chars, values) => { target = values; return { progress() {} }; } };
    } };
    runInNewContext(source, {
      window: { TPCT_BOLD: { now: callback => { task = callback({ g }); }, ready() {} } },
      document: { readyState: 'complete', timeline: { currentTime: 500 },
        documentElement: { classList: { contains: name => classes.has(name) } },
        querySelector: selector => selector === '.hero h1' ? heading : mode === 'missing' ? null : { getAnimations: () => [animation] },
        createElement: () => ({ setAttribute() {} }) },
      performance: { now: () => 50 },
      MutationObserver: class { constructor(callback) { observer = callback; } observe() {} disconnect() {} },
      addEventListener() {}, removeEventListener() {}, setTimeout() {}, clearTimeout() {}
    });
    assert.equal(initial.yPercent, 118);
    assert.equal(initial.opacity, 0.001);
    if (mode === 'pending') {
      assert.equal(options, undefined, 'letters are hidden before animation.ready');
      animation.startTime = 400;
      release();
    }
    await task;
    const expected = mode === 'repeat' ? 0.05 : mode === 'missing' ? 0.67 : 0.72;
    assert.ok(Math.abs(options.delay - expected) < 1e-9, mode);
    assert.equal(target.yPercent, 0);
    assert.equal(target.opacity, 1);
    classes.add('motion-paused');
    observer();
  }
});

test('kinetic restores the name on curtain cancellation, errors, and the hard deadline', async () => {
  const { runInNewContext } = await import('node:vm');
  const source = await readFile(new URL('../src/scripts/81-kinetic.js', import.meta.url), 'utf8');
  for (const mode of ['cancelled', 'pending', 'error', 'stalled']) {
    let rejectReady, resolveReady, task, timeout, delay, cleared = false, disconnected = false, labelled = false, timelines = 0;
    const word = { textContent: 'Islam', parentElement: { classList: { contains: () => false } },
      replaceChildren(...nodes) { this.textContent = ''; this.children = nodes; }, style: { removeProperty() {} } };
    const heading = { textContent: 'Islam', querySelectorAll: () => [word],
      setAttribute() { labelled = true; }, removeAttribute() { labelled = false; }, classList: { add() {} } };
    const animation = { animationName: 'intro-out', startTime: null,
      ready: new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; }) };
    const g = { set() { if (mode === 'error') throw new Error('animation unavailable'); },
      timeline() { timelines++; return { to() { return { progress() {} }; } }; } };
    runInNewContext(source, {
      window: { TPCT_BOLD: { now: callback => { task = callback({ g }); }, ready() {} } },
      document: { readyState: 'complete', timeline: { currentTime: 500 },
        documentElement: { classList: { contains: name => ['kinetic', 'intro'].includes(name) } },
        querySelector: selector => selector === '.hero h1' ? heading : { getAnimations: () => [animation] },
        createElement: () => ({ setAttribute() {} }) },
      performance: { now: () => 500 },
      MutationObserver: class { observe() {} disconnect() { disconnected = true; } },
      addEventListener() {}, removeEventListener() {},
      setTimeout(callback, ms) { timeout = callback; delay = ms; return 1; },
      clearTimeout(id) { assert.equal(id, 1); cleared = true; }
    });
    assert.equal(delay, 2500, 'watchdog expires at 3000ms from navigation');
    if (mode === 'cancelled') rejectReady(new Error('curtain cancelled before starting'));
    if (mode === 'pending' || mode === 'stalled') {
      assert.equal(word.textContent, '', 'letters start hidden');
      if (mode === 'stalled') {
        animation.startTime = 400;
        resolveReady();
        await task;
      }
      timeout();
    }
    if (mode !== 'pending' && mode !== 'stalled') await task;
    assert.equal(word.textContent, 'Islam', mode);
    assert.equal(labelled, false, mode);
    assert.equal(disconnected, true, mode);
    assert.equal(cleared, true, mode);
    assert.equal(timelines, mode === 'stalled' ? 1 : 0, 'fallback does not start a new entrance');
  }
});
