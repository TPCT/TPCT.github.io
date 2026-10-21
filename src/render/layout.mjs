import { esc } from '../lib/html.mjs';
export function renderPage(c, { head, header, main, footer, spine = false }) {
  return `<!doctype html><html lang="en" class="no-js" data-theme="dark"><head>${head}</head><body><a class="skip" href="#main">${esc(c.site.skipLink)}</a>${header}<main id="main" tabindex="-1">${spine ? '<div class="spine" aria-hidden="true"><span class="spine__track"></span><span class="spine__fill"></span></div>' : ''}${main}</main>${footer}<div class="cursor-glow" aria-hidden="true"></div></body></html>`;
}
