import { esc } from '../lib/html.mjs';
export function renderPage(c, { head, header, main, footer }) {
  return `<!doctype html><html lang="en" class="no-js" data-theme="dark"><head>${head}</head><body><a class="skip" href="#main">${esc(c.site.skipLink)}</a>${header}<main id="main" tabindex="-1">${main}</main>${footer}<div class="cursor-glow" aria-hidden="true"></div></body></html>`;
}
