import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';

test('story source stays within budget and uses CSP-safe scroll and focus APIs', async () => {
  const source = await readFile(new URL('../src/scripts/82-story.js', import.meta.url), 'utf8');
  assert.ok(Buffer.byteLength(source) <= 4000, Buffer.byteLength(source));
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|cssText|setAttribute\(\s*['"]style|\beval\(|new Function/);
  for (const hook of ['pin: true', 'focusin', '.chip', 'invalidateOnRefresh', 'clearProps']) assert.ok(source.includes(hook), hook);
  assert.equal((source.match(/B\.ready\(/g) || []).length, 1);
  assert.deepEqual([...source.matchAll(/B\.mm\.add\(B\.Q\.(\w+)/g)].map(m => m[1]), ['desk', 'rail', 'desk']);
});

test('built story CSS gates layouts and leaves static chapter markup unchanged', async t => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-story-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const css = await readFile(path.join(outDir, 'assets/site.css'), 'utf8');
  const media = css.match(/@media \(min-width: 1024px\) and \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/)[0];
  assert.match(media, /\.rail-on \.projects \{[^}]*flex-wrap: nowrap/);
  const outside = css.replace(media, '');
  assert.match(outside, /\.process__ticker \{ display: none; \}/);
  assert.match(outside, /main > \.pin-spacer \{ margin-block-start: var\(--section-gap\); \}/);
  assert.match(outside, /main > \.pin-spacer \+ section \{ margin-block-start: var\(--section-gap\); \}/);
  assert.match(outside, /\.story \.pillars\[data-reveal\]\.is-pending \{ opacity: 1; translate: none; scale: none; \}/);
  assert.match(media, /\.process__ticker \{ display: block;/);
  assert.match(media, /\.rail-on \.work-rail__bar \{ display: block;/);
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.doesNotMatch(html.match(/<section id="work"[\s\S]*?<\/section>/)[0], /work-rail/);
  assert.doesNotMatch(html.match(/<section id="process"[\s\S]*?<\/section>/)[0], /process__ticker/);
});

test('rail compaction is scoped to eligible cards and Contact spacer wins specificity', async () => {
  const css = await readFile(new URL('../src/styles/47-story.css', import.meta.url), 'utf8');
  assert.match(css, /\.rail-on \.projects > \.card \{[^}]*min\(420px, 32vw\); padding: 22px/);
  assert.match(css, /\.rail-on \.card__summary \{[^}]*-webkit-line-clamp: 3; line-clamp: 3; overflow: hidden/);
  assert.match(css, /\.rail-on \.card__highlights li:nth-child\(n\+3\) \{ display: none; \}/);
  assert.match(css, /\.rail-on \.card \.tags \{[^}]*flex-wrap: nowrap; overflow: hidden; max-height:/);
  assert.match(css, /main > \.pin-spacer \+ #contact \{ margin-block-start: var\(--section-gap\); \}/);
  const source = await readFile(new URL('../src/scripts/82-story.js', import.meta.url), 'utf8');
  assert.ok(source.indexOf("work.classList.add('rail-on')") < source.indexOf('list.offsetHeight>'));
  assert.ok(source.includes('Math.min(728,innerHeight-B.headerH()-96)'));
});

test('rail isolates intrinsic width and keeps the pinned viewport full bleed', async () => {
  const css = await readFile(new URL('../src/styles/47-story.css', import.meta.url), 'utf8');
  const rail = css.match(/\.rail-on \.work-rail \{([^}]+)\}/)[1];
  assert.match(rail, /contain: inline-size;/);
  assert.match(rail, /width: 100vw !important;/);
  assert.match(rail, /max-width: none !important;/);
  assert.match(rail, /min-width: 0;/);
  assert.match(rail, /margin-inline: calc\(50% - 50vw\)/);
});

test('rail fit ignores temporary filter height and only keyboard focus targets the card', async () => {
  const { runInNewContext } = await import('node:vm');
  const source = await readFile(new URL('../src/scripts/82-story.js', import.meta.url), 'utf8');
  for (const naturalHeight of [607, 800]) {
    for (let reload = 0; reload < 20; reload++) {
      const listeners = {}, classes = new Set();
      let tween, cleanup, scrolled, updates = 0, cleared = false, refreshes = 0, pending;
      const pa = { insertBefore() {} };
      const list = { parentNode: pa, nextSibling: null, style: { minHeight: '732px' }, offsetWidth: 3000,
        get offsetHeight() { return Math.max(naturalHeight, parseFloat(this.style.minHeight) || 0); },
        addEventListener(name, callback) { listeners[name] = callback; }, removeEventListener(name) { delete listeners[name]; } };
      const work = { classList: { add(name) { classes.add(name); }, remove(name) { classes.delete(name); } },
        addEventListener(name, callback) { listeners[name] = callback; }, removeEventListener(name) { delete listeners[name]; } };
      const B = { Q: { rail: 'rail' }, headerH: () => 76, lenis: () => null, refresh: () => refreshes++,
        ST: { update() { updates++; } },
        mm: { add(query, callback) { if (query === 'rail') cleanup = callback(); } },
        g: { to(target, options) { tween = options; return { scrollTrigger: { start: 100, end: 1900 } }; },
          set(target, options) { cleared = options.clearProps === 'transform'; } } };
      B.ready = callback => callback(B);
      runInNewContext(source, { window: { TPCT_BOLD: B }, innerHeight: 900,
        document: { readyState: 'complete', documentElement: {},
          querySelector: selector => selector === '#project-list' ? list : selector === '#work' ? work : null,
          createElement: () => ({ clientWidth: 1440, append() {}, remove() {}, style: { removeProperty() {} } }) },
        getComputedStyle: () => ({ paddingInlineStart: '120', paddingInlineEnd: '120' }),
        scrollTo: (x, y) => { scrolled = y; }, setTimeout(callback) { pending = callback; }, clearTimeout() {} });
      assert.equal(list.style.minHeight, '732px', 'filter height is restored');
      assert.equal(classes.has('rail-on'), naturalHeight === 607);
      if (naturalHeight > 728) {
        assert.equal(tween, undefined, 'intrinsically tall cards keep the grid');
        assert.equal(cleared, true);
        continue;
      }
      assert.equal(tween.x(), -1800);
      assert.equal(tween.scrollTrigger.end(), '+=1800', 'pin and translation distances agree');
      listeners.focusin({ target: { matches: selector => {
        assert.equal(selector, ':focus-visible');
        return false;
      }, closest: () => ({ offsetLeft: 600 }) } });
      assert.equal(scrolled, undefined, 'mouse focus does not scroll');
      assert.equal(updates, 0, 'mouse focus does not update the scroll trigger');
      for (const offsetLeft of [0, 600, 2400]) {
        listeners.focusin({ target: { matches: selector => {
          assert.equal(selector, ':focus-visible');
          return true;
        }, closest: () => ({ offsetLeft,
          getBoundingClientRect: () => ({ left: 120, right: 540 }) }) } });
        assert.equal(scrolled, 100 + Math.min(1, offsetLeft / 1800) * 1800);
      }
      assert.equal(updates, 3, 'even currently visible first card resets the scroll target');
      listeners.click({ target: { closest: () => true } });
      pending();
      assert.equal(refreshes, 1, 'filters still schedule remeasurement');
      cleanup();
      assert.equal(classes.has('rail-on'), false);
      assert.equal(cleared, true);
      assert.deepEqual(Object.keys(listeners), []);
    }
  }
});
