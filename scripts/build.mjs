import { readFile, writeFile, readdir, mkdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { validateContent } from '../src/lib/validate.mjs';
import { render404 } from '../src/render/page-404.mjs';
import { renderHead } from '../src/render/head.mjs';
import { renderPage } from '../src/render/layout.mjs';
import { renderHeader } from '../src/render/header.mjs';
import { renderHero } from '../src/render/hero.mjs';
import { renderFooter } from '../src/render/footer.mjs';
import { renderAbout, renderExperience, renderSkills, renderWork, renderServices, renderProcess, renderContact } from '../src/render/sections.mjs';
const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));
export async function build({ outDir = 'dist', root = REPO_ROOT } = {}) {
  let c;
  try { c = JSON.parse(await readFile(path.join(root, 'src/content.json'), 'utf8')); }
  catch (e) { throw new Error(`src/content.json: ${e.message}`); }
  const { errors, warnings } = validateContent(c);
  for (const warning of warnings) process.stderr.write(`${warning}\n`);
  if (errors.length) throw new Error(errors.join('\n'));
  outDir = path.resolve(root, outDir);
  // A caller-supplied output directory must never erase the source tree.
  if (outDir === path.resolve(root) || path.resolve(root).startsWith(outDir + path.sep) || ['src', 'scripts', 'test', 'public', '.company', '.git'].some(d => outDir === path.resolve(root, d) || outDir.startsWith(path.resolve(root, d) + path.sep))) throw new Error('Unsafe output directory');
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  try { await cp(path.join(root, 'public'), outDir, { recursive: true }); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await mkdir(path.join(outDir, 'assets'), { recursive: true });
  const assets = {};
  for (const [folder, ext] of [['styles', 'css'], ['scripts', 'js']]) {
    const dir = path.join(root, 'src', folder);
    const names = (await readdir(dir)).filter(n => n.endsWith(`.${ext}`)).sort();
    const content = (await Promise.all(names.map(n => readFile(path.join(dir, n), 'utf8')))).join('\n');
    await writeFile(path.join(outDir, `assets/site.${ext}`), content);
    assets[ext] = createHash('sha256').update(content).digest('hex').slice(0, 10);
  }
  const head = renderHead(c, { page: 'home', title: c.site.title, description: c.site.description, assets });
  const main = [renderHero, renderAbout, renderExperience, renderSkills, renderWork, renderServices, renderProcess, renderContact].map(render => render(c)).join('');
  await writeFile(path.join(outDir, 'index.html'), renderPage(c, { head, header: renderHeader(c), main, footer: renderFooter(c) }));
  const url = new URL('/', c.site.url).href;
  await writeFile(path.join(outDir, '404.html'), render404(c, { assets }));
  await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', url).href}\n`);
  await writeFile(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}</loc></url></urlset>\n`);
  await writeFile(path.join(outDir, 'site.webmanifest'), JSON.stringify({ name: c.site.title, short_name: c.site.shortTitle, background_color: c.site.themeColorDark, theme_color: c.site.themeColorDark, display: 'browser', start_url: '/', icons: [192, 512].map(size => ({ src: `/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })) }, null, 2) + '\n');
  const files = await readdir(outDir, { recursive: true, withFileTypes: true });
  return { outDir, files: files.filter(f => f.isFile()).map(f => path.relative(outDir, path.join(f.parentPath ?? f.path, f.name))).sort() };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch(e => { process.stderr.write(`${e.message}\n`); process.exitCode = 1; });
}
