// The original controller owns selection, keyboard input and navigation.
// Keep the illustrated choices visible without answer commentary or a flip.
(() => {
  'use strict';
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;
  quiz.querySelectorAll('.survey-comment, .survey-selection-feedback').forEach(panel => panel.remove());
  const steps = [...quiz.querySelectorAll('[data-step]')];
  const dots = [...quiz.querySelectorAll('[data-progress-dot]')];
  const track = quiz.querySelector('.tcb-progress__track');
  const progressLabel = quiz.querySelector('[data-step-label]');
  if (progressLabel) {
    progressLabel.setAttribute('role', 'status');
    progressLabel.setAttribute('aria-live', 'polite');
    progressLabel.setAttribute('aria-atomic', 'true');
  }

  function syncChoices(step) {
    step.querySelectorAll('.card').forEach(card => {
      const front = card.querySelector('.card__front');
      const back = card.querySelector('.card__back');
      if (front) front.setAttribute('aria-hidden', 'false');
      // The original controller still reads this element and its text.
      if (back) {
        back.hidden = true;
        back.setAttribute('aria-hidden', 'true');
      }
      const descriptions = (card.getAttribute('aria-describedby') || '')
        .split(/\s+/).filter(id => id && !id.startsWith('survey-selection-feedback-'));
      if (descriptions.length) card.setAttribute('aria-describedby', descriptions.join(' '));
      else card.removeAttribute('aria-describedby');
    });
  }

  function syncProgress() {
    const current = Math.max(0, steps.findIndex(step => step.classList.contains('is-active')));
    dots.forEach((dot, index) => {
      const answered = Boolean(steps[index]?.querySelector('.card.is-active'));
      dot.dataset.answerState = answered ? 'complete' : 'unanswered';
      dot.setAttribute('aria-label', `${index + 1}問目・${answered ? '回答済み' : index === current ? '回答中' : '未回答'}`);
      if (index === current) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    if (track) {
      track.setAttribute('role', 'progressbar');
      track.setAttribute('aria-label', 'アンケートの進み具合');
      track.setAttribute('aria-valuemin', '1');
      track.setAttribute('aria-valuemax', String(steps.length));
      track.setAttribute('aria-valuenow', String(current + 1));
      track.setAttribute('aria-valuetext', `${current + 1}問目・全${steps.length}問`);
    }
  }

  function refresh() {
    steps.forEach(syncChoices);
    syncProgress();
  }
  refresh();
  // This listener runs after the original controller. Its Enter/Space handlers
  // dispatch the same click, so mouse, touch and keyboard share one update.
  quiz.addEventListener('click', event => {
    if (event.target.closest('.card, [data-next], [data-prev]')) refresh();
  });
})();
