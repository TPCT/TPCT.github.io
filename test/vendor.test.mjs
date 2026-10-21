import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { VENDOR } from '../src/render/head.mjs';

const dir = new URL('../public/assets/vendor/', import.meta.url);
test('unmodified vendors match checksums, versions, licences and budgets and survive build', async t => {
  const sums = await readFile(new URL('SHA256SUMS', dir), 'utf8');
  const entries = sums.trim().split('\n').map(line => {
    const match = line.match(/^([a-f0-9]{64})  (\S+)$/);
    assert.ok(match, line);
    return { hash: match[1], name: match[2] };
  });
  assert.deepEqual((await readdir(dir)).filter(n => n.endsWith('.js')).sort(), entries.map(e => e.name).sort());
  const buffers = {};
  for (const { hash, name } of entries) {
    const buf = buffers[name] = await readFile(new URL(name, dir));
    assert.equal(createHash('sha256').update(buf).digest('hex'), hash, name);
  }
  const gsap = buffers['gsap.min.js'], st = buffers['ScrollTrigger.min.js'], lenis = buffers['lenis.min.js'];
  assert.ok(gsap.length + st.length <= 120000);
  assert.ok(gzipSync(gsap, { level: 9 }).length + gzipSync(st, { level: 9 }).length <= 49152);
  assert.ok(lenis.length <= 20000);
  assert.ok(gzipSync(lenis, { level: 9 }).length <= 7168);
  for (const [buf, name] of [[gsap, 'GSAP'], [st, 'ScrollTrigger']]) {
    assert.doesNotMatch(buf.toString(), /sourceMappingURL/);
    assert.ok(buf.toString().startsWith('/*!'));
    assert.ok(buf.toString().split('*/')[0].includes(`${name} ${VENDOR.gsap}`));
  }
  assert.ok(lenis.toString().includes(VENDOR.lenis));
  assert.match(lenis.toString(), /Lenis/);
  for (const [file, text] of [['LICENSE-gsap.txt', /standard-license/], ['LICENSE-lenis.txt', /MIT/]]) {
    const licence = await readFile(new URL(file, dir), 'utf8');
    assert.ok(licence.length); assert.match(licence, text);
  }
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'tpct-vendor-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await build({ outDir });
  const names = await readdir(dir);
  assert.equal(names.length, 6);
  for (const name of names) assert.deepEqual(await readFile(path.join(outDir, 'assets/vendor', name)), await readFile(new URL(name, dir)));
});
