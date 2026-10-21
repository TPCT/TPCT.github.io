(function () {
  "use strict";
  if (!document.documentElement.classList.contains('motion')) return;
const tl=document.querySelector('.tl'),list=tl&&tl.querySelector('.timeline');
if (!list||list.getBoundingClientRect().bottom<innerHeight*.6) return;
const items=[...list.querySelectorAll('.tl__item')];
let H,ys,p=0,raf=0;
function size(){
  H=list.offsetHeight;
  ys=items.map(i=>{const n=i.querySelector('.tl__node');return i.offsetTop+n.offsetTop+n.offsetHeight/2;});
}
function frame(){
  raf=0;
  p=Math.max(p,Math.min(1,Math.max(0,(innerHeight*.6-list.getBoundingClientRect().top)/H)));
  tl.style.setProperty('--tl-p',p.toFixed(4));
  tl.style.setProperty('--tl-y',(p*H).toFixed(1)+'px');
  items.forEach((i,k)=>{if(p*H>=ys[k]-2&&!i.classList.contains('is-lit'))i.classList.add('is-lit');});
  if(p===1){tl.classList.add('is-done');removeEventListener('scroll',queue);removeEventListener('resize',fit);}
}
function queue(){if(!raf)raf=requestAnimationFrame(frame);}
function fit(){size();queue();}
function end(){p=1;frame();}
tl.classList.add('is-drawing');
size();
addEventListener('scroll',queue,{passive:true});
addEventListener('resize',fit);
tl.addEventListener('focusin',end);
addEventListener('beforeprint',end);
frame();
})();
