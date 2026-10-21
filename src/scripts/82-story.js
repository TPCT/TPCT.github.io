(function () {
  "use strict";
  const go=()=>{const B=window.TPCT_BOLD;if(!B)return;B.ready(B=>{
  const d=document,g=B.g,h=d.documentElement;
  B.mm.add(B.Q.desk,()=>{
  if(!d.querySelector('.pillars'))return;
  h.classList.add('story');
  g.fromTo('.pillar',{y:i=>90+i*40,rotation:i=>(i-1.5)*4,transformOrigin:'50% 100%'},{y:0,rotation:0,ease:'none',scrollTrigger:{trigger:'.pillars',start:'top 92%',end:'top 50%',scrub:0.6}});
  return()=>h.classList.remove('story');
  });
  B.mm.add(B.Q.rail,()=>{
  const list=d.querySelector('#project-list'),work=d.querySelector('#work');if(!list||!work)return;
  const parent=list.parentNode,next=list.nextSibling,rail=d.createElement('div'),bar=d.createElement('div');
  rail.className='work-rail';bar.className='work-rail__bar';bar.ariaHidden='true';bar.append(d.createElement('span'));
  parent.insertBefore(rail,list);rail.append(list,bar);work.classList.add('rail-on');
  const restore=()=>{parent.insertBefore(list,next);rail.remove();work.classList.remove('rail-on');g.set(list,{clearProps:'transform'})};
  const minHeight=list.style.minHeight;list.style.minHeight='';const tall=list.offsetHeight>Math.min(728,innerHeight-B.headerH()-96);list.style.minHeight=minHeight;if(tall){restore();return}
  const p=()=>{const s=getComputedStyle(rail);return[parseFloat(s.paddingInlineStart)||0,parseFloat(s.paddingInlineEnd)||0]},dist=()=>{const[a,b]=p();return Math.max(0,list.offsetWidth-(rail.clientWidth-a-b))};
  const tween=g.to(list,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:rail,pin: true,start:()=>'center '+Math.round((innerHeight+B.headerH())/2),end:()=>'+='+Math.max(1,dist()),scrub:0.6,anticipatePin:1,invalidateOnRefresh:true,onUpdate:s=>bar.style.setProperty('--rp',s.progress.toFixed(4))}});
  let timer;
  const click=e=>{if(e.target.closest('#work .filters .chip, #work .projects-empty button')){clearTimeout(timer);timer=setTimeout(B.refresh,650)}},focus=e=>{
  if (!e.target.matches(':focus-visible')) return;
  const c=e.target.closest('.card');if(!c)return;
  const st=tween.scrollTrigger,y=st.start+Math.min(1,c.offsetLeft/(dist()||1))*(st.end-st.start);
  B.lenis()?B.lenis().scrollTo(y,{immediate:true}):scrollTo(0,y);B.ST.update();
  };
  work.addEventListener('click',click);list.addEventListener('focusin',focus);
  return()=>{clearTimeout(timer);work.removeEventListener('click',click);list.removeEventListener('focusin',focus);bar.style.removeProperty('--rp');restore()};
  });
  B.mm.add(B.Q.desk,()=>{
  const list=d.querySelector('#process .process'),ct=d.querySelector('#process > .container');if(!list||!ct)return;
  const it=[...list.children],n=it.length;if(!n)return;
  list.classList.remove('is-pending','is-revealing');list.classList.add('process--story');
  const ticker=d.createElement('div'),digits=d.createElement('div');ticker.className='process__ticker';ticker.setAttribute('aria-hidden','true');digits.className='process__ticker-in';
  it.forEach((_,i)=>{const span=d.createElement('span');span.textContent=String(i+1).padStart(2,'0');digits.append(span)});ticker.append(digits);ct.append(ticker);
  let last=-1;const pr={p:0},apply=p=>{list.style.setProperty('--pp',Math.min(1,p/0.8).toFixed(4));const idx=Math.min(n-1,Math.floor(p*n+1e-6));if(idx===last)return;last=idx;it.forEach((li,i)=>{li.classList.toggle('is-on',i<=idx);li.classList.toggle('is-current',i===idx)});g.to(digits,{yPercent:-100/n*idx,duration:0.6,ease:'expo.out'})};
  apply(0);g.to(pr,{p:1,ease:'none',onUpdate:()=>apply(pr.p),scrollTrigger:{trigger:'#process',pin: true,start:()=>'center '+Math.round((innerHeight+B.headerH())/2),end:()=>'+='+Math.round(innerHeight*1.2),scrub:0.6,anticipatePin:1,invalidateOnRefresh:true}});
  return()=>{g.killTweensOf(digits);ticker.remove();list.classList.remove('process--story');it.forEach(li=>li.classList.remove('is-on','is-current'));list.style.removeProperty('--pp')};
  });
  })};document.readyState==='complete'?go():addEventListener('DOMContentLoaded',go,{once:true});
})();
