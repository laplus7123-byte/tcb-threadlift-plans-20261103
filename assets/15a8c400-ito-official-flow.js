(() => {
  document.querySelectorAll('[data-flow-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-flow-track]');
    const slides = Array.from(track.children);
    const prev = carousel.querySelector('[data-flow-prev]');
    const next = carousel.querySelector('[data-flow-next]');
    const dots = Array.from(carousel.querySelectorAll('[data-flow-dot]'));
    let index = 0;
    let frame = 0;
    const paint = () => {
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    };
    const go = target => {
      index = Math.max(0, Math.min(slides.length - 1, target));
      track.scrollTo({left: slides[index].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      paint();
    };
    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    track.addEventListener('keydown', event => {
      const targets = {ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1};
      if (!(event.key in targets)) return;
      event.preventDefault();
      go(targets[event.key]);
    });
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track.clientWidth) return;
        index = slides.reduce((best, slide, i) => Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[best].offsetLeft - track.scrollLeft) ? i : best, 0);
        paint();
      });
    }, {passive: true});
    new ResizeObserver(() => {
      if (track.clientWidth) track.scrollTo({left: slides[index].offsetLeft, behavior: 'instant'});
    }).observe(track);
    paint();
  });
})();
