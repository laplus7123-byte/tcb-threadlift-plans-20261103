(() => {
 const steps=[...document.querySelectorAll('[data-step]')];
 const bar=document.querySelector('[data-tcb-progress]');
 const update=()=>{const i=steps.findIndex(s=>s.classList.contains('is-active'));if(bar)bar.style.width=`${(Math.max(0,i)+1)/4*100}%`;};
 steps.forEach(step=>new MutationObserver(update).observe(step,{attributes:true,attributeFilter:['class']}));update();
 // The body preview shares the same benefit-triggered reservation footer.
 if(location.pathname.endsWith('body-tcb.html')) {
  const sticky=document.querySelector('[data-sticky-cta]'),benefit=document.querySelector('[data-benefit]');
  if(sticky&&benefit)new IntersectionObserver(es=>es.forEach(e=>sticky.classList.toggle('is-show',e.isIntersecting||e.boundingClientRect.top<0))).observe(benefit);
 }
})();
