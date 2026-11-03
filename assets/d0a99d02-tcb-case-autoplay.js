(() => {
 document.querySelectorAll('.cases').forEach(track => {
  // Stacked cases are ordinary document content: no clones, tabs or autoplay.
  if(track.classList.contains('cases--stacked'))return;
  const cards = [...track.querySelectorAll('.case')];
  if(cards.length < 2)return;
  const duplicate = card => {
   const clone=card.cloneNode(true);
   clone.setAttribute('aria-hidden','true');
   clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
   clone.querySelectorAll('a,button,input,summary,[tabindex]').forEach(e=>e.setAttribute('tabindex','-1'));
   return clone;
  };
  const before=cards.map(duplicate), after=cards.map(duplicate);
  track.prepend(...before);track.append(...after);track.classList.add('cases--loop');
  const all=[...before,...cards,...after], count=cards.length;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let dragging=false,hovered=false,focused=false,visible=false,resumeAt=Date.now()+4000,timer;
  const target=card=>{const r=card.getBoundingClientRect(),t=track.getBoundingClientRect();return track.scrollLeft+r.left+r.width/2-t.left-track.clientWidth/2;};
  const nearest=()=>{let index=count,distance=Infinity;all.forEach((card,i)=>{const delta=Math.abs(target(card)-track.scrollLeft);if(delta<distance){distance=delta;index=i;}});return index;};
  const nav=document.createElement('nav');nav.className='tcb-case-nav';nav.setAttribute('aria-label','症例の切り替え');
  const tabs=cards.map((card,i)=>{const button=document.createElement('button');button.type='button';button.textContent=`Case${i+1}`;button.addEventListener('click',()=>{resumeAt=Date.now()+7000;track.scrollTo({left:target(card),behavior:reduced.matches?'instant':'smooth'});});nav.append(button);return button;});track.after(nav);
  const update=()=>{const current=nearest()%count;tabs.forEach((tab,i)=>{tab.classList.toggle('is-current',i===current);if(i===current)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');});};
  const normalize=()=>{if(dragging)return;const i=nearest();if(i<count||i>=count*2){const cycle=target(cards[0])-target(before[0]);track.scrollTo({left:track.scrollLeft+(i<count?cycle:-cycle),behavior:'instant'});}update();};
  track.addEventListener('scroll',()=>{update();clearTimeout(timer);timer=setTimeout(normalize,180);},{passive:true});
  requestAnimationFrame(()=>{track.scrollTo({left:target(cards[0]),behavior:'instant'});update();});
  window.addEventListener('resize',()=>{const i=nearest()%count;track.scrollTo({left:target(cards[i]),behavior:'instant'});update();});
  track.addEventListener('mouseenter',()=>{hovered=true;});track.addEventListener('mouseleave',()=>{hovered=false;resumeAt=Date.now()+4000;});
  track.addEventListener('focusin',()=>{focused=true;});track.addEventListener('focusout',e=>{focused=track.contains(e.relatedTarget);resumeAt=Date.now()+4000;});
  track.addEventListener('pointerdown',()=>{dragging=true;});
  const release=()=>{if(dragging){dragging=false;resumeAt=Date.now()+7000;normalize();}};
  window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
  track.addEventListener('wheel',()=>{resumeAt=Date.now()+7000;},{passive:true});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resumeAt=Date.now()+4000;},{threshold:.35}).observe(track);
  setInterval(()=>{if(reduced.matches||!visible||document.hidden||hovered||focused||dragging||Date.now()<resumeAt)return;normalize();const next=all[nearest()+1];if(next)track.scrollTo({left:target(next),behavior:'smooth'});resumeAt=Date.now()+4000;},100);
 });
})();
