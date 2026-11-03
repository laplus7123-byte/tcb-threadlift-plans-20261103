// Keep the fixed CTA clear of inline buttons and the final notes/footer.
(()=>{
 const sticky=document.querySelector('[data-sticky-cta]');
 if(!sticky||!('IntersectionObserver' in window))return;
 const visible=new Set();
 let atPageEnd=false;
 const updateSticky=()=>{sticky.hidden=visible.size>0||atPageEnd;};
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting&&entry.intersectionRatio>=.6)visible.add(entry.target);
   else visible.delete(entry.target);
  });
  updateSticky();
 },{threshold:[0,.6,1]});
 document.querySelectorAll('.ito-coupon-image-cta').forEach(link=>observer.observe(link));
 const finalSection=document.querySelector('.ito-final-reservation');
 if(finalSection){
  const endObserver=new IntersectionObserver(entries=>{
   const entry=entries[0];
   // Stay hidden after this section leaves the top, including expanded legal notes.
   atPageEnd=entry.boundingClientRect.height>0&&(entry.isIntersecting||entry.boundingClientRect.top<0);
   updateSticky();
  },{threshold:0});
  endObserver.observe(finalSection);
 }
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
