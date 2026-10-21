import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { logoMark } from '../src/lib/logo.mjs';

test('ShiftCodes vector and renderer preserve the five traced paths', async () => {
  const svg = await readFile('src/images/brand/shiftcodes-mark.svg', 'utf8');
  assert.equal((svg.match(/<path /g) ?? []).length, 5);
  assert.match(svg, /viewBox="0 0 \d+ \d+"/);
  assert.doesNotMatch(svg, /style=|<image|<text|file:|\/home\//i);
  const inline = logoMark({ idPrefix: 'test', title: 'ShiftCodes' });
  for (const part of ['hook-top', 'hook-bottom', 'lt', 'slash', 'gt']) {
    assert.ok(svg.includes(`id="sc-${part}"`));
    assert.ok(inline.includes(`id="test-sc-${part}"`));
  }
  for (const [, d] of svg.matchAll(/ d="([^"]+)"/g)) assert.ok(inline.includes(`d="${d}"`));
  assert.match(inline, /aria-labelledby="test-title"/);
  assert.match(logoMark({ idPrefix: 'decorative' }), /aria-hidden="true"/);
  assert.doesNotMatch(inline, /style=/);
});
test('styles use the violet palette and retain layout fixes', async () => {
  const css = (await Promise.all((await readdir('src/styles')).map(f => readFile(`src/styles/${f}`, 'utf8')))).join('\n');
  assert.doesNotMatch(css, /F299C4|A8125A|EC8DBB|7FD3E3|157E95|242 153 196|168 18 90|127 211 227/i);
  assert.match(css, /--logo-b: #6E2BFB/);
  assert.match(css, /\.exp__loc\s*\{[^}]*align-self: start/);
});
