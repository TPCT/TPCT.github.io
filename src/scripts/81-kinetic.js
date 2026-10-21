(function () {
  "use strict";
  const go=()=>{
  const B=window.TPCT_BOLD;if(!B)return;
    B.now(async B=>{
  const e=document.documentElement,h=document.querySelector('.hero h1');
    if(!e.classList.contains('kinetic')||!h||performance.now()>800+(e.classList.contains('intro')?700:0))return;
  const words=[...h.querySelectorAll('.w > span')],texts=words.map(w=>w.textContent),chars=[];
    h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
    words.forEach((w,i)=>{
    const nodes=[...texts[i]].map(t=>{const c=document.createElement('span');c.className='ch';c.setAttribute('aria-hidden','true');c.textContent=t;chars.push(c);return c});
    w.replaceChildren(...nodes);
    });
    h.classList.add('is-kinetic');
    words.forEach(w=>{if(w.parentElement.classList.contains('w--accent')){w.style.setProperty('--ww',String(w.offsetWidth));[...w.children].forEach(c=>c.style.setProperty('--cx',String(c.offsetLeft)))}});
    let done=false,tl;
    const observer=new MutationObserver(()=>{if(e.classList.contains('motion-paused')){tl?.progress(1);revert()}});
    const revert=()=>{if(done)return;done=true;observer.disconnect();removeEventListener('beforeprint',finish);words.forEach((w,i)=>{w.textContent=texts[i];w.style.removeProperty('--ww')});h.removeAttribute('aria-label')};
    const finish=()=>{tl?.progress(1);revert()};
    observer.observe(e,{attributes:true,attributeFilter:['class']});addEventListener('beforeprint',finish);
    B.g.set(chars,{yPercent:118,rotationX:-88,opacity:0.001,transformOrigin:'50% 100% -12px'});
    const intro=e.classList.contains('intro'),a=intro&&document.querySelector('.intro-screen')?.getAnimations().find(x=>x.animationName==='intro-out');
    if(a&&a.startTime==null)await a.ready;
    if(done)return;
    const delay=a&&a.startTime!=null?Math.max(0,(a.startTime+820-document.timeline.currentTime)/1000):Math.max(0,(intro?0.72:0.10)-performance.now()/1000);
    tl=B.g.timeline({delay,onComplete:revert}).to(chars,{yPercent:0,rotationX:0,opacity:1,duration:0.8,ease:'expo.out',stagger:{each:0.020}});
    });
    B.ready(B=>{if(document.querySelector('.sc-hero'))B.mm.add(B.Q.motion,()=>{B.g.to('.sc-hero',{'--sy':1,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:0.5}})})});
  };
  document.readyState==='complete'?go():document.addEventListener('DOMContentLoaded',go,{once:true});
})();
