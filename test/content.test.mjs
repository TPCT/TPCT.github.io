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
  const career = JSON.parse(await readFile(new URL('../.company/content-career.json', import.meta.url), 'utf8'));
  for (const key of ['experience', 'stats', 'timelineIntro']) original[key] = career[key];
  Object.assign(original.hero, career.hero, { reach: '9+ years · Middle East & US' });
  Object.assign(original.about, career.about);
  Object.assign(original.site, {
    title: 'Islam Elsayed — CEO @ ShiftCodes · Senior Engineer',
    description: 'CEO @ ShiftCodes, technical team lead and consultant, and senior full-stack engineer. 9+ years shipping production software across the Middle East and US.',
    ogImageAlt: 'Islam Elsayed — CEO @ ShiftCodes · Technical Team Lead & Consultant · Senior Full-Stack Engineer'
  });
  for (const project of original.projects) Object.assign(project, career.projectPatches[project.id]);
  for (const addition of career.projectsAdd) {
    const { _insertAfter, ...project } = addition;
    original.projects.splice(original.projects.findIndex(p => p.id === _insertAfter) + 1, 0, project);
  }
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

test('Prism theme and motion labels validate', () => {
  assert.deepEqual(c.hero.motionToggle, { pause: 'Pause animation', play: 'Play animation' });
  assert.equal(c.site.themeColorDark, '#110D1F'); assert.equal(c.site.themeColorLight, '#EEEBFA');
  const bad = structuredClone(c); delete bad.hero.motionToggle.pause;
  assert.match(validateContent(bad).errors.join('\n'), /hero\.motionToggle\.pause/);
});

test('career content has four stats and validates grouped roles', () => {
  assert.equal(c.stats.length, 4);
  assert.equal(c.experience.length, 13);
  assert.deepEqual(validateContent(c).errors, []);
});
for (const [name, mutate, message] of [
  ['bad month', x => { x.experience[0].roles[0].start = '2026-13'; }, /experience\[0\]\.roles\[0\]\.start: expected YYYY-MM with valid month/],
  ['end before start', x => { x.experience[0].roles[0].end = '2026-01'; }, /end: must be >= start/],
  ['missing roles', x => { delete x.experience[0].roles; }, /experience\[0\]\.roles: required array/],
  ['empty roles', x => { x.experience[0].roles = []; }, /roles: must not be empty/],
  ['insecure org URL', x => { x.experience[0].orgUrl = 'http://example.com'; }, /orgUrl: invalid URL protocol/],
  ['missing earlier roles label', x => { delete x.sections.experienceMoreLabel; }, /experienceMoreLabel: required non-empty string/]
]) test(name, () => { const bad = structuredClone(c); mutate(bad); assert.match(validateContent(bad).errors.join('\n'), message); });
