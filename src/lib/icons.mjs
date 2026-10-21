// Lucide icons, ISC license: https://github.com/lucide-icons/lucide/blob/main/LICENSE
const paths = {
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  'git-branch': '<path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',
  check: '<path d="m20 6-11 11-5-5" />',
  sun: "<circle cx=\"12\" cy=\"12\" r=\"4\" />\n  <path d=\"M12 2v2\" />\n  <path d=\"M12 20v2\" />\n  <path d=\"m4.93 4.93 1.41 1.41\" />\n  <path d=\"m17.66 17.66 1.41 1.41\" />\n  <path d=\"M2 12h2\" />\n  <path d=\"M20 12h2\" />\n  <path d=\"m6.34 17.66-1.41 1.41\" />\n  <path d=\"m19.07 4.93-1.41 1.41\" />",
  moon: "<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\" />",
  menu: "<path d=\"M4 5h16\" />\n  <path d=\"M4 12h16\" />\n  <path d=\"M4 19h16\" />",
  x: "<path d=\"M18 6 6 18\" />\n  <path d=\"m6 6 12 12\" />",
  'arrow-up-right': "<path d=\"M7 7h10v10\" />\n  <path d=\"M7 17 17 7\" />",
  'arrow-down': "<path d=\"M12 5v14\" />\n  <path d=\"m19 12-7 7-7-7\" />",
  mail: "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\" />\n  <rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" />"
};
export function icon(name, size = 20) {
  if (!paths[name]) throw new Error(`Unknown icon: ${name}`);
  if (!Number.isFinite(size) || size <= 0) throw new Error('Invalid icon size');
  return `<svg class="icon-${name}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
