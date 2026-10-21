(function () {
  "use strict";
  const d=document,b=d.body,guard=!!(b&&!b.hasAttribute('style')&&d.querySelector('script[src^="/assets/vendor/ScrollTrigger"]'));
  if(guard)b.style.setProperty('--st-guard','0');
  const go=()=>{
    if(guard){b.style.removeProperty('--st-guard');if(!b.getAttribute('style'))b.removeAttribute('style')}
    const g=window.gsap,ST=window.ScrollTrigger,e=d.documentElement;
    if(!g||!ST||!e.classList.contains('motion'))return;
    g.registerPlugin(ST);ST.config({ignoreMobileResize:true});g.defaults({overwrite:'auto'});
    let L=null,tick,timer,done=false;
    const queue=[],run=fn=>{try{fn(B)}catch{}},fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
    const B=window.TPCT_BOLD={
      g,ST,mm:g.matchMedia(),
      Q:{motion:'(prefers-reduced-motion: no-preference)',desk:'(min-width: 1024px) and (min-height: 640px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',rail:'(min-width: 1024px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'},
      now:run,
      ready:fn=>{if(done)setTimeout(()=>{run(fn);B.refresh()},0);else queue.push(fn)},
      headerH:()=>d.querySelector('.site-header')?.offsetHeight??76,
      refresh:()=>{clearTimeout(timer);timer=setTimeout(()=>ST.refresh(),150)},
      lenis:()=>L,paused:()=>e.classList.contains('motion-paused')
    };
    const start=()=>{
      if(L||!window.Lenis)return;
      L=new window.Lenis({lerp:0.11,smoothWheel:true,syncTouch:false,wheelMultiplier:1,autoRaf:false,prevent:n=>n.closest('[data-lenis-prevent]')});
      L.on('scroll',ST.update);tick=t=>L.raf(t*1000);g.ticker.add(tick);g.ticker.lagSmoothing(0);
    };
    const stop=()=>{if(!L)return;g.ticker.remove(tick);L.destroy();L=null};
    B.ready(()=>{
      if(!fine)return;
      const s=d.createElement('script');s.src='/assets/vendor/lenis.min.js?v=1.3.27';s.onload=()=>{if(!B.paused())start()};d.head.append(s);
    });
    d.addEventListener('click',ev=>{
      if(!L||ev.defaultPrevented||ev.button!==0||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;
      const a=ev.target.closest('a[href^="#"]');if(!a)return;
      const id=a.getAttribute('href').slice(1);let target;
      try{target=d.getElementById(decodeURIComponent(id))}catch{return}
      if(!target)return;
      // Lenis honours scroll-padding-top itself
      ev.preventDefault();L.scrollTo(target,{duration:1.0,easing:t=>1-Math.pow(1-t,4)});history.pushState(null,'','#'+id);
    });
    let paused=B.paused();
    new MutationObserver(()=>{const p=B.paused();if(p===paused)return;paused=p;if(p)stop();else if(fine)start()}).observe(e,{attributes:true,attributeFilter:['class']});
    d.fonts?.ready.then(B.refresh);
    d.addEventListener('toggle',ev=>{if(ev.target.matches?.('details.career__more'))B.refresh()},true);
    addEventListener('beforeprint',()=>{B.mm.revert();stop()});
    const next=()=>{if(queue.length){run(queue.shift());setTimeout(next,0)}else{done=true;ST.sort();ST.refresh()}};
    const flush=()=>{e.classList.add('bold');setTimeout(next,0)};
    const idle=()=>{if(window.requestIdleCallback)window.requestIdleCallback(flush,{timeout:1200});else setTimeout(flush,300)};
    d.readyState==='complete'?idle():addEventListener('load',idle,{once:true});
  };
  d.readyState==='complete'?go():d.addEventListener('DOMContentLoaded',go,{once:true});
})();
