import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name) || (path.basename(dir) === '.company' && entry.name === 'private')) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else if (entry.isFile()) files.push(file);
  }
  return files;
}
export async function checkConfidential({ root = REPO_ROOT, dist = 'dist', denylist = '.company/private/denylist.txt', git = true } = {}) {
  root = path.resolve(root); dist = path.resolve(root, dist); denylist = path.resolve(root, denylist);
  let terms = [], denylistLoaded = true;
  try { terms = (await readFile(denylist, 'utf8')).split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')); }
  catch (e) { if (e.code !== 'ENOENT') throw e; denylistLoaded = false; }
  const rules = [{ name: 'hostname', re: /[a-z0-9-]+\.(shiftcodes\.net|xcutor\.net)/i }, ...terms.map((term, i) => ({ name: `denylist#${i + 1}`, re: new RegExp(`(?<![A-Za-z0-9_-])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9_-])`, 'i') }))];
  const hits = [];
  let files = [];
  try { if (!(await stat(dist)).isDirectory()) throw Object.assign(new Error(), { code: 'ENOENT' }); files = await walk(dist); }
  catch (e) { if (e.code !== 'ENOENT') throw e; hits.push({ file: path.relative(root, dist), line: 0, rule: 'missing dist' }); }
  const source = git ? (await promisify(execFile)('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, maxBuffer: 16 * 1024 * 1024 })).stdout.split('\0').filter(Boolean).map(f => path.resolve(root, f)) : await walk(root);
  files.push(...source.filter(f => { const rel = path.relative(root, f).split(path.sep).join('/'); return !rel.startsWith('test/fixtures/') && !rel.startsWith('.company/private/') && f !== denylist; }));
  for (const file of new Set(files)) {
    let bytes;
    try { bytes = await readFile(file); } catch (e) { if (['ENOENT', 'EISDIR'].includes(e.code)) continue; throw e; }
    if (bytes.subarray(0, 8192).includes(0)) continue;
    bytes.toString('utf8').split(/\r?\n/).forEach((line, i) => {
      for (const rule of rules) if (rule.re.test(line)) hits.push({ file: path.relative(root, file), line: i + 1, rule: rule.name });
    });
  }
  return { hits, denylistLoaded };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opts = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--no-git') opts.git = false;
    else if (['--dist', '--denylist', '--root'].includes(arg) && process.argv[i + 1]) opts[arg.slice(2)] = process.argv[++i];
    else throw new Error('Invalid CLI option');
  }
  checkConfidential(opts).then(({ hits, denylistLoaded }) => {
    if (!denylistLoaded) console.log('denylist: not found, skipped');
    for (const hit of hits) console.log(`${hit.file}:${hit.line}: ${hit.rule}`);
    process.exitCode = hits.length ? 1 : 0;
  }).catch(() => { console.error('Confidentiality check failed'); process.exitCode = 1; });
}
