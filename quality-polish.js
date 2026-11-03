// Avoid two reservation buttons competing when an inline CTA is in view.
(()=>{
 const sticky=document.querySelector('[data-sticky-cta]');
 if(!sticky||!('IntersectionObserver' in window))return;
 const visible=new Set();
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting&&entry.intersectionRatio>=.6)visible.add(entry.target);
   else visible.delete(entry.target);
  });
  sticky.hidden=visible.size>0;
 },{threshold:[0,.6,1]});
 document.querySelectorAll('.ito-coupon-image-cta').forEach(link=>observer.observe(link));
})();

// Begin loading the result photographs with the first answer, before the LP opens.
(() => {
 const quiz = document.querySelector('[data-quiz]');
 if (!quiz) return;
 const warmResultImages = event => {
  if (!event.target.closest('.card')) return;
  document.querySelectorAll('[data-content] img[loading="lazy"], .page-footer img[loading="lazy"]').forEach(image => {
   image.decoding = 'async';
   image.loading = 'eager';
  });
  quiz.removeEventListener('click', warmResultImages);
 };
 quiz.addEventListener('click', warmResultImages);
})();
