import { createHash } from 'node:crypto';
import { jsonLdScript } from '../lib/schema.mjs';
import { esc, attr } from '../lib/html.mjs';
export const THEME_SCRIPT = "(function(d){d.className=d.className.replace(/\\bno-js\\b/,'js');var t;try{t=localStorage.getItem('theme')}catch(e){}if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.content=t==='light'?'#EEEBFA':'#110D1F'}})(document.documentElement);";
export function cspHash(script) { return 'sha256-' + createHash('sha256').update(script).digest('base64'); }
export function renderHead(c, { page = 'home', title, description, path = '/', ogType = 'website', jsonLd = null, assets }) {
  const pageUrl = new URL(path, c.site.url).href;
  const homeUrl = new URL('/', c.site.url).href;
  const image = new URL(c.site.ogImage, homeUrl).href;
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${attr(value)}">`;
  const seo = (page === '404' ? meta('robots', 'noindex') : `<link rel="canonical" href="${attr(pageUrl)}">` + meta('robots', 'index,follow,max-image-preview:large'))
    + meta('author', c.site.author)
    + (page === 'home' ? `<link rel="me" href="${attr(c.contact.github)}"><link rel="me" href="${attr(c.contact.linkedin)}">` : '')
    + '<link rel="preload" href="/assets/fonts/outfit-var.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">'
    + Object.entries({ 'og:type': ogType, 'og:site_name': c.site.shortTitle, 'og:title': title, 'og:description': description, 'og:url': page === '404' ? homeUrl : pageUrl, 'og:image': image, 'og:image:type': 'image/png', 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': c.site.ogImageAlt, 'og:locale': c.site.locale }).map(([k, v]) => meta(k, v, true)).join('')
    + Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': image, 'twitter:image:alt': c.site.ogImageAlt }).map(([k, v]) => meta(k, v)).join('')
    + (jsonLd && page !== '404' ? jsonLdScript(jsonLd) : '');
  const policy = `default-src 'self'; script-src 'self' '${cspHash(THEME_SCRIPT)}'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; manifest-src 'self'`;
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${attr(policy)}"><meta name="theme-color" content="${attr(c.site.themeColorDark)}"><script>${THEME_SCRIPT}</script><title>${esc(title)}</title><meta name="description" content="${attr(description)}">${page === 'home' ? meta('google-site-verification', 'PsjjRMzW2cVBwfM-sNSoLjfU_tR097ytc5RXKuP5dNE') : ''}${seo}<link rel="stylesheet" href="/assets/site.css?v=${attr(assets.css)}"><script src="/assets/site.js?v=${attr(assets.js)}" defer></script>`;
}
