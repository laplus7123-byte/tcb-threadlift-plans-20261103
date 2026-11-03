// Keep the existing survey's answers, flip, navigation and completion logic.
// This layer only exposes future questions as disabled previews.
(() => {
  'use strict';
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz || quiz.classList.contains('juno-reference')) return;
  const steps = [...quiz.querySelectorAll('[data-step]')];
  if (!steps.length) return;

  quiz.classList.add('juno-reference');
  const originalTabIndex = new WeakMap();

  function setLocked(section, locked) {
    section.classList.toggle('is-juno-locked', locked);
    section.inert = locked;
    if (locked) section.setAttribute('aria-disabled', 'true');
    else section.removeAttribute('aria-disabled');

    // Native inert is the primary guard; tabindex also supports older webviews.
    section.querySelectorAll('.card, button, a[href], [tabindex]').forEach(control => {
      if (!originalTabIndex.has(control)) {
        originalTabIndex.set(control, control.getAttribute('tabindex'));
      }
      const previous = originalTabIndex.get(control);
      if (locked) control.setAttribute('tabindex', '-1');
      else if (previous === null) control.removeAttribute('tabindex');
      else control.setAttribute('tabindex', previous);
    });
  }

  function syncQuestions() {
    steps.forEach((section, index) => {
      const reached = index === 0 || section.classList.contains('is-revealed');
      setLocked(section, !reached);
    });
  }

  // The original controller focuses the next heading synchronously. Make that
  // heading focusable immediately before its existing click handler runs.
  quiz.addEventListener('click', event => {
    const section = event.target.closest('[data-step]');
    if (!section || !quiz.contains(section)) return;
    if (section.classList.contains('is-juno-locked')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const next = event.target.closest('[data-next]');
    if (!next || next.disabled || !section.querySelector('.card.is-active')) return;
    const following = steps[steps.indexOf(section) + 1];
    if (following) setLocked(following, false);
  }, true);

  quiz.addEventListener('keydown', event => {
    if (!event.target.closest('.is-juno-locked')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  // This listener is registered after the original controller, so its state is
  // already current when the manual Next/Back action reaches this listener.
  quiz.addEventListener('click', event => {
    if (event.target.closest('.card, [data-next], [data-prev]')) syncQuestions();
  });

  // Also follow an external reset or a controller-driven step change.
  const observer = new MutationObserver(records => {
    if (records.some(record => record.type === 'attributes' && steps.includes(record.target))) {
      syncQuestions();
    }
  });
  steps.forEach(section => observer.observe(section, { attributes: true, attributeFilter: ['class'] }));
  syncQuestions();
})();
