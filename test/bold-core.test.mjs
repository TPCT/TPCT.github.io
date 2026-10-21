import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { build } from '../scripts/build.mjs';
import { THEME_SCRIPT, VENDOR, cspHash } from '../src/render/head.mjs';

function context(vendors) {
  const classes = new Set();
  const classList = { add: (...ns) => ns.forEach(n => classes.add(n)), remove: (...ns) => ns.forEach(n => classes.delete(n)), contains: n => classes.has(n), toggle(n, force = !classes.has(n)) { if (force) classes.add(n); else classes.delete(n); return force; } };
  const noop = () => {};
  const ctx = {
    document: { readyState: 'complete', documentElement: { classList, dataset: { theme: 'dark' }, style: { setProperty() {}, removeProperty() {} } }, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener() {} },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    MutationObserver: class { observe() {} }, requestIdleCallback: noop,
    requestAnimationFrame: () => 0, cancelAnimationFrame: noop, setTimeout: () => 0, clearTimeout: noop,
    performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem() {} },
    location: { search: '', pathname: '/' }, history: { replaceState() {} }, navigator: {}, innerHeight: 800, innerWidth: 1280, scrollY: 0, addEventListener: noop
  };
  if (vendors) {
    ctx.gsap = { registerPlugin: noop, defaults: noop, matchMedia: () => ({ add: noop, revert: noop }), ticker: { add: noop, remove: noop, lagSmoothing: noop } };
    ctx.ScrollTrigger = { config: noop, sort: noop, refresh: noop, update: noop };
  }
  ctx.window = ctx;
  return ctx;
}

test('Lenis anchor scrolling leaves the CSS scroll padding offset to Lenis', async () => {
  const source = await readFile(new URL('../src/scripts/80-bold.js', import.meta.url), 'utf8');
  const ctx = context(true);
  const pending = [];
  const listeners = {};
  const target = {};
  const calls = [];
  const hashes = [];
  ctx.document.documentElement.classList.add('motion');
  ctx.matchMedia = () => ({ matches: true });
  ctx.requestIdleCallback = fn => fn();
  ctx.setTimeout = fn => { pending.push(fn); return pending.length; };
  ctx.document.addEventListener = (name, fn) => { listeners[name] = fn; };
  ctx.document.createElement = () => ({});
  ctx.document.head = { append: script => script.onload() };
  ctx.document.getElementById = id => id === 'about' ? target : null;
  ctx.history.pushState = (...args) => hashes.push(args[2]);
  ctx.Lenis = class {
    on() {}
    scrollTo(...args) { calls.push(args); }
  };
  vm.runInNewContext(source, ctx);
  while (pending.length) pending.shift()();
  let prevented = false;
  listeners.click({
    button: 0,
    target: { closest: () => ({ getAttribute: () => '#about' }) },
    preventDefault() { prevented = true; }
  });
  assert.equal(prevented, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], target);
  assert.equal(Object.hasOwn(calls[0][1], 'offset'), false);
  assert.equal(calls[0][1].duration, 1.0);
  assert.equal(calls[0][1].easing(0.5), 0.9375);
  assert.deepEqual(hashes, ['#about']);
});

test('home-only motion foundation markup, CSP, CSS and built script smoke tests', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-bold-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const result = await build({ outDir });
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.match(html, new RegExp('<script src="/assets/site.js\\?v=[^"]+" defer></script><script src="/assets/vendor/gsap.min.js\\?v=' + VENDOR.gsap + '" defer fetchpriority="low"></script><script src="/assets/vendor/ScrollTrigger.min.js\\?v=' + VENDOR.gsap + '" defer fetchpriority="low"></script>'));
  for (const text of ['kinetic', 'intro', 'sessionStorage', 'motion-paused']) assert.ok(THEME_SCRIPT.includes(text));
  assert.equal([...html.matchAll(/<script>(.*?)<\/script>/gs)].length, 1);
  assert.ok(html.includes(cspHash(THEME_SCRIPT)));
  assert.ok(html.includes("style-src &#39;self&#39;"));
  assert.match(html, /<a class="skip"[^>]*>[^<]*<\/a><div class="intro-screen" aria-hidden="true">/);
  const intro = html.match(/<div class="intro-screen"[^>]*>(.*?)<\/div>/s)[1];
  assert.equal((intro.match(/pathLength="1"/g) ?? []).length, 5);
  assert.doesNotMatch(intro, /sc-sheen|clip-path|clipPath/);
  assert.match(intro, /width="120" height="130"/);
  assert.match(html, /<div class="tint" aria-hidden="true"><span><\/span><span><\/span><span><\/span><\/div>/);
  for (const file of ['404.html', result.files.find(f => /^work\/.*\/index.html$/.test(f))]) {
    const other = await readFile(path.join(outDir, file), 'utf8');
    assert.doesNotMatch(other, /\/assets\/vendor\/|intro-screen|class="tint"/);
  }
  const core = await readFile(new URL('../src/scripts/80-bold.js', import.meta.url));
  assert.ok(core.length <= 4600);
  assert.ok(core.toString().includes(`/assets/vendor/lenis.min.js?v=${VENDOR.lenis}`));
  const css = await readFile(path.join(outDir, 'assets/site.css'), 'utf8');
  assert.ok(css.includes('.intro-screen, .tint { display: none; }'));
  assert.match(css, /lenis-smooth/);
  const source = await readFile(path.join(outDir, 'assets/site.js'), 'utf8');
  const missing = context(false);
  assert.doesNotThrow(() => vm.runInNewContext(source, missing));
  assert.equal(missing.TPCT_BOLD, undefined);
  const ctx = context(true);
  assert.doesNotThrow(() => vm.runInNewContext(source, ctx));
  assert.deepEqual(Object.keys(ctx.TPCT_BOLD).sort(), ['g', 'ST', 'mm', 'Q', 'now', 'ready', 'headerH', 'refresh', 'lenis', 'paused'].sort());
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.TPCT_BOLD.Q)), {
    motion: '(prefers-reduced-motion: no-preference)',
    desk: '(min-width: 1024px) and (min-height: 640px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    rail: '(min-width: 1024px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
  });
});
