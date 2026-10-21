export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
export const attr = esc;
export function slugify(s) { return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
export function sortProjects(projects) { return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured)); }
export function externalAttrs() { return 'target="_blank" rel="noopener noreferrer"'; }
