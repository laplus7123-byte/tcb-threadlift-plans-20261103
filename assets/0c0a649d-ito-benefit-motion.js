(() => {
  const cards = document.querySelectorAll('.ito-benefit-feature, [data-luna-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-feature-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  cards.forEach(card => observer.observe(card));
})();
