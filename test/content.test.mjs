import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateContent } from '../src/lib/validate.mjs';
const c = JSON.parse(await readFile(new URL('../src/content.json', import.meta.url), 'utf8'));
export const additions = {
  site: { menuOpen: 'Open menu', menuClose: 'Close menu' },
  sections: { skills: 'Stack', experience: 'Experience', services: 'Services', process: 'Process' },
  hero: { domainsLabel: 'Domains' },
  projectsIntro: { kindFilterLabel: 'Filter projects by type', countSingular: 'project', countPlural: 'projects', resetLabel: 'Show all projects', roleLabel: 'Role', stackLabel: 'Stack' },
  a11y: { newTab: '(opens in new tab)' }
};
test('content validates and §9 additions are exact', () => {
  assert.deepEqual(validateContent(c).errors, []);
  for (const [key, values] of Object.entries(additions)) for (const [k, v] of Object.entries(values)) assert.equal(c[key][k], v);
});
test('original copy is unchanged apart from §9 additions and owner updates', async t => {
  let original;
  try { original = JSON.parse(await readFile(new URL('../.company/content.json', import.meta.url), 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return t.skip('Lead removed original content source'); throw e; }
  original.hero.ctaSecondary.href = 'mailto:th3professionalcod3r@gmail.com';
  original.contact.email = 'th3professionalcod3r@gmail.com';
  original.projects = original.projects.filter(p => p.id !== 'idempotent-session-ingest');
  original.projects.splice(original.projects.findIndex(p => p.id === 'order-payment-api') + 1, 0, {
    "id": "ashur-bank-cms",
    "name": "Bilingual Banking CMS",
    "kind": "open-source",
    "category": "FinTech & Banking",
    "summary": "A bilingual (Arabic/English) content management system for a bank's public website, built on Laravel and a Filament admin panel.",
    "highlights": [
      "Role-based access control for editors and administrators",
      "Full audit log of content changes",
      "Excel import and export for bulk content",
      "Translatable content and site-wide settings managed from the admin panel"
    ],
    "stack": [
      "Laravel",
      "Filament",
      "PHP",
      "Livewire"
    ],
    "role": "Author",
    "year": 2025,
    "repoUrl": "https://github.com/TPCT/ashurbank.iq",
    "featured": true
  });
  const stripped = structuredClone(c);
  for (const [key, values] of Object.entries(additions)) {
    if (['sections', 'a11y'].includes(key)) delete stripped[key];
    else for (const k of Object.keys(values)) delete stripped[key][k];
  }
  assert.deepEqual(stripped, original);
});
for (const [name, mutate, message] of [
  ['bad category', x => { x.projects[0].category = 'invalid'; }, /category/],
  ['duplicate id', x => { x.projects[1].id = x.projects[0].id; }, /duplicate id/],
  ['OSS without repoUrl', x => { delete x.projects.find(p => p.kind === 'open-source').repoUrl; }, /repoUrl/]
]) test(name, () => { const bad = structuredClone(c); mutate(bad); assert.match(validateContent(bad).errors.join('\n'), message); });
