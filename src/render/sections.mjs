import { esc } from '../lib/html.mjs';
export function renderAbout(c) { return `<section id="about" tabindex="-1" aria-labelledby="about-title"><div class="container"><h2 id="about-title">${esc(c.about.title)}</h2></div></section>`; }
export function renderExperience(c) { return `<section id="experience" tabindex="-1" aria-labelledby="experience-title"><div class="container"><h2 id="experience-title">${esc(c.sections.experience)}</h2></div></section>`; }
export function renderSkills(c) { return `<section id="skills" tabindex="-1" aria-labelledby="skills-title"><div class="container"><h2 id="skills-title">${esc(c.sections.skills)}</h2></div></section>`; }
export function renderWork(c) { return `<section id="work" tabindex="-1" aria-labelledby="work-title"><div class="container"><h2 id="work-title">${esc(c.projectsIntro.title)}</h2></div></section>`; }
export function renderServices(c) { return `<section id="services" tabindex="-1" aria-labelledby="services-title"><div class="container"><h2 id="services-title">${esc(c.sections.services)}</h2></div></section>`; }
export function renderProcess(c) { return `<section id="process" tabindex="-1" aria-labelledby="process-title"><div class="container"><h2 id="process-title">${esc(c.sections.process)}</h2></div></section>`; }
export function renderContact(c) { return `<section id="contact" tabindex="-1" aria-labelledby="contact-title"><div class="container"><h2 id="contact-title">${esc(c.contact.title)}</h2></div></section>`; }
