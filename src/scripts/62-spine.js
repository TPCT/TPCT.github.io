(function () {
  "use strict";
  const sp=document.querySelector('.spine');
  if(!sp)return;const m=sp.parentElement;
  const q=matchMedia('(prefers-reduced-motion: reduce)');let r;
  const u=()=>{r=0;const b=sp.getBoundingClientRect();m.style.setProperty('--spine-progress',q.matches?1:Math.max(0,Math.min(1,(innerHeight*.6-b.top)/b.height)))};
  const s=()=>{if(!r)r=requestAnimationFrame(u)};
  addEventListener('scroll',s,{passive:true});addEventListener('resize',s);q.addEventListener('change',s);u();
})();
