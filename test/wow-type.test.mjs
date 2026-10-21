import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/scripts/71-decode.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/styles/42-type.css', import.meta.url), 'utf8');

test('decode source meets its byte, module and CSP contracts', () => {
  assert.ok(Buffer.byteLength(source) <= 1800, `${Buffer.byteLength(source)} bytes`);
  assert.ok(source.startsWith('(function () {\n  "use strict";'));
  for (const required of ['aria-hidden', 'textContent', 'performance.now', "classList.contains('motion')"]) assert.ok(source.includes(required), required);
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|cssText|setAttribute\(\s*['"]style|\beval\(|new Function/);
});

test('type CSS gates every keyframe and animation on motion preference', () => {
  assert.match(css, /@property --flow/);
  assert.match(css, /@keyframes name-flow/);
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
    assert.equal(depth, 0, 'unbalanced motion block');
    start = end;
    gate.lastIndex = end;
  }
  remainder += css.slice(start);
  assert.doesNotMatch(remainder, /@keyframes|\banimation\s*:/);
});

test('flow gradients reuse exactly the approved name colours in each theme', async () => {
  const tokens = await readFile(new URL('../src/styles/01-tokens.css', import.meta.url), 'utf8');
  for (const theme of ['dark', 'light']) {
    const block = text => text.match(new RegExp('\\[data-theme="' + theme + '"\\]\\s*\\{([^}]+)'))[1];
    const hexes = (text, property) => [...new Set(text.match(new RegExp('--' + property + ':([^;]+)'))[1].match(/#[\da-f]{6}/gi))].sort();
    assert.deepEqual(hexes(block(css), 'grad-flow'), hexes(block(tokens), 'grad-name'), theme);
  }
});

test('decode tolerates absent hooks with and without IntersectionObserver', () => {
  for (const observer of [undefined, class { observe() {} }]) {
    const ctx = {
      document: { documentElement: { classList: { contains: () => true } }, querySelector: () => null, querySelectorAll: () => [] },
      performance: { now: () => 0 }, matchMedia: () => ({ matches: false })
    };
    if (observer) ctx.IntersectionObserver = observer;
    assert.doesNotThrow(() => vm.runInNewContext(source, ctx));
  }
});

test('decode preserves original text nodes and recreates only the decorative overlay', () => {
  class Element {
    constructor(className = '', text = '') {
      this.className = className;
      this.childNodes = [];
      this.nodeType = text ? 3 : 1;
      this.value = text;
      this.classes = new Set();
      this.classList = { contains: n => this.classes.has(n), add: n => this.classes.add(n), remove: n => this.classes.delete(n) };
    }
    append(...nodes) {
      for (const node of nodes) {
        node.remove();
        node.parent = this;
        this.childNodes.push(node);
      }
    }
    remove() {
      if (this.parent) this.parent.childNodes.splice(this.parent.childNodes.indexOf(this), 1);
      this.parent = null;
    }
    querySelector(selector) {
      for (const node of this.childNodes) {
        if ('.' + node.className === selector) return node;
        const found = node.querySelector(selector);
        if (found) return found;
      }
      return null;
    }
    get textContent() { return this.nodeType === 3 ? this.value : this.childNodes.map(n => n.textContent).join(''); }
    set textContent(value) { this.childNodes = []; this.value = value; this.nodeType = 3; }
    getClientRects() { return [{}]; }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(name, fn) { assert.equal(name, 'pointerenter'); this.enter = fn; }
  }
  const link = new Element(), original = new Element('', 'Work samples');
  link.append(original);
  let now = 2000, frame;
  vm.runInNewContext(source, {
    document: {
      documentElement: { classList: { contains: () => true } },
      querySelectorAll: selector => selector === '#primary-nav a' ? [link] : [],
      createElement: () => new Element()
    },
    matchMedia: () => ({ matches: true }), performance: { now: () => now },
    requestAnimationFrame: fn => { assert.equal(frame, undefined); frame = fn; }
  });
  for (let run = 0; run < 2; run++) {
    link.enter();
    link.enter(); // Re-entry must not create another overlay or rAF.
    const overlay = link.querySelector('.dc');
    assert.equal(overlay['aria-hidden'], 'true');
    assert.equal(link.querySelector('.dc-txt').childNodes[0], original);
    assert.equal(link.classList.contains('is-decoding'), true);
    while (frame) {
      const next = frame;
      frame = undefined;
      now += 40;
      next(now);
    }
    assert.equal(link.querySelector('.dc'), null);
    assert.equal(link.textContent, 'Work samples');
    assert.equal(link.querySelector('.dc-txt').childNodes[0], original);
    assert.equal(link.classList.contains('is-decoding'), false);
  }
});
