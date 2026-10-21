import { createHash } from 'node:crypto';
import { esc, attr } from '../lib/html.mjs';
export const THEME_SCRIPT = "(function(d){d.className=d.className.replace(/\\bno-js\\b/,'js');var t;try{t=localStorage.getItem('theme')}catch(e){}if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.content=t==='light'?'#EEEBFA':'#110D1F'}})(document.documentElement);";
export function cspHash(script) { return 'sha256-' + createHash('sha256').update(script).digest('base64'); }
export function personJsonLd(c) {
  return { '@context': 'https://schema.org', '@type': 'Person', name: c.hero.name, jobTitle: c.hero.roles.slice(1), url: new URL('/', c.site.url).href, email: 'mailto:' + c.contact.email, sameAs: [c.contact.github, c.contact.website], worksFor: { '@type': 'Organization', name: 'ShiftCodes', url: c.contact.website }, address: { '@type': 'PostalAddress', addressLocality: c.contact.location.split(',')[0].trim(), addressCountry: 'EG' } };
}
export function renderHead(c, { page = 'home', title, description, assets }) {
  const url = new URL('/', c.site.url).href;
  const image = new URL(c.site.ogImage, url).href;
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${attr(value)}">`;
  const seo = (page === 'home' ? `<link rel="canonical" href="${attr(url)}">` : meta('robots', 'noindex'))
    + '<link rel="preload" href="/assets/fonts/outfit-var.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">'
    + Object.entries({ 'og:type': 'website', 'og:site_name': c.site.shortTitle, 'og:title': c.site.title, 'og:description': c.site.description, 'og:url': url, 'og:image': image, 'og:image:type': 'image/png', 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': c.site.ogImageAlt, 'og:locale': c.site.locale }).map(([k, v]) => meta(k, v, true)).join('')
    + Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': c.site.title, 'twitter:description': c.site.description, 'twitter:image': image, 'twitter:image:alt': c.site.ogImageAlt }).map(([k, v]) => meta(k, v)).join('')
    + (page === 'home' ? `<script type="application/ld+json">${JSON.stringify(personJsonLd(c)).replace(/</g, '\\u003c')}</script>` : '');
  const policy = `default-src 'self'; script-src 'self' '${cspHash(THEME_SCRIPT)}'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; manifest-src 'self'`;
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${attr(policy)}"><meta name="theme-color" content="${attr(c.site.themeColorDark)}"><script>${THEME_SCRIPT}</script><title>${esc(title)}</title><meta name="description" content="${attr(description)}">${seo}<link rel="stylesheet" href="/assets/site.css?v=${attr(assets.css)}"><script src="/assets/site.js?v=${attr(assets.js)}" defer></script>`;
}
