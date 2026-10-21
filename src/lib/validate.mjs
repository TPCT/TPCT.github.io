export function validateContent(c) {
  const errors = [], warnings = [];
  const object = (v, p) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) { errors.push(`${p}: required object`); return {}; }
    return v;
  };
  const strings = (v, keys, p) => {
    v = object(v, p);
    for (const k of keys.split(' ')) if (typeof v[k] !== 'string' || !v[k].trim()) errors.push(`${p}.${k}: required non-empty string`);
    return v;
  };
  const array = (v, p, nonempty = true) => {
    if (!Array.isArray(v)) { errors.push(`${p}: required array`); return []; }
    if (nonempty && !v.length) errors.push(`${p}: must not be empty`);
    return v;
  };
  const stringArray = (v, p) => array(v, p).forEach((s, i) => { if (typeof s !== 'string' || !s.trim()) errors.push(`${p}[${i}]: required non-empty string`); });
  c = object(c, 'content');
  const site = strings(c.site, 'title shortTitle description url lang locale author ogImage ogImageAlt themeColorDark themeColorLight skipLink footer menuOpen menuClose', 'site');
  strings(site.themeToggle, 'toDark toLight', 'site.themeToggle');
  array(site.nav, 'site.nav').forEach((n, i) => {
    n = strings(n, 'label href', `site.nav[${i}]`);
    if (typeof n.href === 'string' && !n.href.startsWith('#')) errors.push(`site.nav[${i}].href: must start with #`);
  });
  const hero = strings(c.hero, 'eyebrow name headline subheadline location reach domainsLabel', 'hero');
  strings(hero.motionToggle, 'pause play', 'hero.motionToggle');
  for (const k of ['roles', 'domains']) stringArray(hero[k], `hero.${k}`);
  for (const k of ['ctaPrimary', 'ctaSecondary', 'ctaTertiary']) strings(hero[k], 'label href', `hero.${k}`);
  const protocol = (value, pattern, field) => { if (typeof value !== 'string' || !pattern.test(value)) errors.push(`${field}: invalid URL protocol`); };
  protocol(hero.ctaSecondary?.href, /^mailto:/, 'hero.ctaSecondary.href');
  protocol(hero.ctaTertiary?.href, /^https:\/\//, 'hero.ctaTertiary.href');
  for (const k of ['github', 'website']) protocol(c.contact?.[k], /^https:\/\//, `contact.${k}`);
  if (Array.isArray(c.experience)) c.experience.forEach((v, i) => protocol(v?.orgUrl, /^https:\/\//, `experience[${i}].orgUrl`));
  const about = strings(c.about, 'title', 'about'); stringArray(about.paragraphs, 'about.paragraphs');
  strings(c.sections, 'skills experience services process', 'sections');
  strings(c.a11y, 'newTab', 'a11y');
  strings(c.contact, 'title lead email emailLabel copyLabel copiedLabel website websiteLabel github githubLabel location', 'contact');
  const nf = strings(c.notFound, 'title code message', 'notFound'); strings(nf.cta, 'label href', 'notFound.cta');
  const intro = strings(c.projectsIntro, 'title lead filterLabel allLabel repoLinkLabel privateNote emptyState kindFilterLabel countSingular countPlural resetLabel roleLabel stackLabel', 'projectsIntro');
  strings(intro.kindLabels, 'case-study open-source', 'projectsIntro.kindLabels');
  array(c.skills, 'skills').forEach((s, i) => { s = strings(s, 'group', `skills[${i}]`); stringArray(s.items, `skills[${i}].items`); });
  for (const [key, fields] of [['experience', 'role org orgUrl location summary'], ['services', 'title desc'], ['process', 'step desc']]) array(c[key], key).forEach((v, i) => strings(v, fields, `${key}[${i}]`));
  if (c.stats !== undefined) array(c.stats, 'stats', false).forEach((s, i) => strings(s, 'value label', `stats[${i}]`));
  const categories = array(c.categories, 'categories'); stringArray(c.categories, 'categories');
  if (new Set(categories).size !== categories.length) errors.push('categories: must be unique');
  const ids = new Set();
  array(c.projects, 'projects').forEach((p, i) => {
    const path = `projects[${i}]`;
    p = strings(p, 'id name kind category summary role', path);
    if (!/^[a-z0-9-]+$/.test(p.id ?? '')) errors.push(`${path}.id: invalid id`);
    if (ids.has(p.id)) errors.push(`${path}.id: duplicate id`); ids.add(p.id);
    if (!['case-study', 'open-source'].includes(p.kind)) errors.push(`${path}.kind: invalid kind`);
    if (!categories.includes(p.category)) errors.push(`${path}.category: not in categories`);
    for (const k of ['highlights', 'stack']) stringArray(p[k], `${path}.${k}`);
    if (p.year !== undefined && (!Number.isInteger(p.year) || p.year < 1990 || p.year > 2100)) errors.push(`${path}.year: expected integer 1990–2100`);
    if (typeof p.featured !== 'boolean') errors.push(`${path}.featured: expected boolean`);
    if (p.kind === 'open-source' && (typeof p.repoUrl !== 'string' || !/^https:\/\/github\.com\/TPCT\/[A-Za-z0-9._-]+$/.test(p.repoUrl))) errors.push(`${path}.repoUrl: required TPCT GitHub repository URL`);
    if (p.repoUrl !== undefined) protocol(p.repoUrl, /^https:\/\//, `${path}.repoUrl`);
    if (p.kind === 'case-study' && p.repoUrl !== undefined) warnings.push(`${path}.repoUrl: ignored for case study`);
  });
  return { errors, warnings };
}
