import { createHash } from 'node:crypto';
import { esc, attr } from '../lib/html.mjs';
export const THEME_SCRIPT = "(function(d){d.className=d.className.replace(/\\bno-js\\b/,'js');var t;try{t=localStorage.getItem('theme')}catch(e){}if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.content=t==='light'?'#FAFAFC':'#0B0B12'}})(document.documentElement);";
export function cspHash(script) { return 'sha256-' + createHash('sha256').update(script).digest('base64'); }
export function renderHead(c, { title, description, assets }) {
  // T-003: seo tags
  const policy = `default-src 'self'; script-src 'self' '${cspHash(THEME_SCRIPT)}'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; manifest-src 'self'`;
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${attr(policy)}"><meta name="theme-color" content="${attr(c.site.themeColorDark)}"><script>${THEME_SCRIPT}</script><title>${esc(title)}</title><meta name="description" content="${attr(description)}"><link rel="stylesheet" href="/assets/site.css?v=${attr(assets.css)}"><script src="/assets/site.js?v=${attr(assets.js)}" defer></script>`;
}
