import { logoMark } from '../lib/logo.mjs';
import { esc, attr, externalAttrs } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
export function renderFooter(c) {
  return `<footer class="site-footer"><div class="container"><p>${logoMark({ idPrefix: 'ftr', className: 'footer__mark' })}${esc(c.site.footer)}</p><div class="footer-links"><a class="text-link" href="mailto:${attr(c.contact.email)}">${esc(c.contact.email)}</a><a class="text-link" href="${attr(c.contact.github)}" ${externalAttrs({ me: true })}>${esc(c.contact.githubLabel)}${icon('arrow-up-right', 14)}<span class="vh"> ${esc(c.a11y.newTab)}</span></a><a class="text-link" href="${attr(c.contact.linkedin)}" ${externalAttrs({ me: true })}>${esc(c.contact.linkedinLabel)}${icon('arrow-up-right', 14)}<span class="vh"> ${esc(c.a11y.newTab)}</span></a></div></div></footer>`;
}
