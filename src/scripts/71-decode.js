(function () {
  "use strict";
if(!document.documentElement.classList.contains('motion'))return;
const G='<>/{}[]=+*#01',make=c=>{const s=document.createElement('span');s.className=c;return s};
const run=(el,dur)=>{
if(!el||el.classList.contains('is-decoding'))return;
let s=el.querySelector('.dc-src');
if(!s){s=make('dc-src');const t=make('dc-txt');
[...el.childNodes].filter(n=>n.nodeType===3).forEach(n=>t.append(n));
s.append(t);el.append(s)}
if(s.getClientRects().length>1)return;
const o=s.textContent.trim(),dc=make('dc'),d=make('dc-done'),v=make('dc-noise');
dc.setAttribute('aria-hidden','true');dc.append(d,v);s.append(dc);
el.classList.add('is-decoding');const t0=performance.now();let l=0;
const f=now=>{
if(now-l>=40){l=now;const p=Math.min(1,(now-t0)/dur),n=Math.floor(p*o.length);
d.textContent=o.slice(0,n);v.textContent=o.slice(n).replace(/\S/g,()=>G[Math.random()*G.length|0]);
if(p===1){dc.remove();el.classList.remove('is-decoding');return}}
requestAnimationFrame(f)};
f(t0)
};
if(performance.now()<=1500){
[document.querySelector('.hero .eyebrow'),...document.querySelectorAll('.roles li')].forEach((e,i)=>{if(e)setTimeout(()=>run(e,i?720:640),Math.max(0,(i?380+60*(i-1):60)-performance.now()))})}
if(typeof IntersectionObserver!=='undefined'){
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);run(e.target,560)}}),{threshold:1,rootMargin:'0px 0px -10% 0px'});
document.querySelectorAll('.section-head__index').forEach(e=>{if(e.getBoundingClientRect().top>=innerHeight)io.observe(e)})}
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
if(fine)document.querySelectorAll('#primary-nav a').forEach(e=>e.addEventListener('pointerenter',()=>{if(matchMedia('(min-width: 768px)').matches)run(e,320)}));
})();
