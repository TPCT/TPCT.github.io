import { sortProjects } from './html.mjs';
export function schemaIds(c) {
  const base = new URL('/', c.site.url).href;
  return { base, website: base + '#website', person: base + '#person', org: base + '#org', profile: base + '#profilepage', projects: base + '#projects', project: id => base + '#project-' + id };
}
export function projectNode(c, p, { url } = {}) {
  const ids = schemaIds(c);
  return { '@type': p.kind === 'open-source' ? 'SoftwareSourceCode' : 'CreativeWork', '@id': ids.project(p.id), name: p.name, description: p.summary, genre: p.category, keywords: p.stack.join(', '), creator: { '@id': ids.person }, ...(p.year !== undefined && { dateCreated: String(p.year) }), ...(p.kind === 'open-source' && { codeRepository: p.repoUrl }), ...(url && { url }) };
}
export function homeGraph(c, { dateModified, projectUrl = null }) {
  const ids = schemaIds(c), { base } = ids;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': ids.website, url: base, name: c.site.shortTitle, description: c.site.description, inLanguage: c.site.lang, publisher: { '@id': ids.person } },
    { '@type': 'ProfilePage', '@id': ids.profile, url: base, name: c.site.title, description: c.site.description, inLanguage: c.site.lang, isPartOf: { '@id': ids.website }, mainEntity: { '@id': ids.person }, dateModified },
    { '@type': 'Person', '@id': ids.person, name: c.hero.name, alternateName: c.site.alternateName, url: base, image: new URL(c.site.ogImage, base).href, jobTitle: c.site.jobTitle, description: c.site.description, email: 'mailto:' + c.contact.email, sameAs: [c.contact.github, c.contact.linkedin, c.contact.website], worksFor: { '@id': ids.org }, knowsAbout: [...new Set(c.skills.flatMap(s => s.items))], address: { '@type': 'PostalAddress', addressLocality: c.contact.location.split(',')[0].trim(), addressCountry: 'EG' }, mainEntityOfPage: { '@id': ids.profile } },
    { '@type': 'Organization', '@id': ids.org, name: c.contact.websiteLabel, url: c.contact.website, logo: { '@type': 'ImageObject', url: base + 'icon-512.png', width: 512, height: 512 }, founder: { '@id': ids.person } },
    { '@type': 'ItemList', '@id': ids.projects, name: c.projectsIntro.title, numberOfItems: c.projects.length, itemListElement: sortProjects(c.projects).map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: projectNode(c, p, { url: projectUrl ? projectUrl(p) : undefined }) })) }
  ] };
}
export function jsonLdScript(data) { return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`; }
export function projectGraph(c, p, { url, title, description }) {
  const ids = schemaIds(c);
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': url, url, name: title, description, inLanguage: c.site.lang, isPartOf: { '@id': ids.website }, about: { '@id': ids.project(p.id) }, breadcrumb: { '@id': url + '#breadcrumb' } },
    { '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.projectPage.homeLabel, item: ids.base },
      { '@type': 'ListItem', position: 2, name: p.name, item: url }
    ] },
    projectNode(c, p, { url }),
    { '@type': 'Person', '@id': ids.person, name: c.hero.name, url: ids.base },
    { '@type': 'WebSite', '@id': ids.website, url: ids.base, name: c.site.shortTitle }
  ] };
}
