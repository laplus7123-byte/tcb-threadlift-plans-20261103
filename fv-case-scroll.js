(() => {
  const frame = document.querySelector('.art-plan2 [data-scroll-case]');
  if (!frame) return;
  const handle = frame.querySelector('[data-case-handle]');
  if (!handle) return;
  const hint = document.getElementById('fv-case-scroll-hint');
  const autoButton = document.querySelector('[data-case-auto]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationFrame = 0;
  let manual = false;
  let activePointer = null;
  let dragOffset = 0;
  let split = 50;

  function updateControls() {
    if (autoButton) autoButton.hidden = !manual || reducedMotion.matches;
    if (hint) {
      hint.textContent = manual || reducedMotion.matches
        ? '中央の↕を上下に動かして比較'
        : '下へスクロールするとアフターが広がります';
    }
  }

  function setSplit(value) {
    split = Math.max(0, Math.min(100, value));
    frame.style.setProperty('--case-split', `${split.toFixed(2)}%`);
    frame.classList.toggle('is-at-end', split <= 0 || split >= 100);
    const after = Math.round(100 - split);
    handle.setAttribute('aria-valuenow', String(after));
    handle.setAttribute('aria-valuetext', `施術前 ${100 - after}%・施術後 ${after}%`);
  }

  function stopScheduledRender() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function useManualControl() {
    manual = true;
    stopScheduledRender();
    updateControls();
  }

  function splitAtPointer(event) {
    const rect = frame.getBoundingClientRect();
    if (rect.height) setSplit((event.clientY - rect.top - dragOffset) / rect.height * 100);
  }

  function render() {
    animationFrame = 0;
    if (manual || activePointer !== null || reducedMotion.matches) return;
    const rect = frame.getBoundingClientRect();
    if (!rect.height) return;
    const center = rect.top + rect.height / 2;
    // Complete the reveal while the full photo is still in the viewport.
    const start = window.innerHeight * 0.72;
    const end = window.innerHeight * 0.26;
    setSplit((center - end) / (start - end) * 100);
  }

  function schedule() {
    if (animationFrame || manual || reducedMotion.matches) return;
    animationFrame = window.requestAnimationFrame(render);
  }

  function syncMotionPreference() {
    stopScheduledRender();
    // Manual comparison remains available when automatic motion is disabled.
    if (reducedMotion.matches && !manual) setSplit(50);
    updateControls();
    schedule();
  }

  handle.addEventListener('pointerdown', event => {
    if (activePointer !== null || !event.isPrimary || event.button !== 0) return;
    useManualControl();
    activePointer = event.pointerId;
    const rect = frame.getBoundingClientRect();
    dragOffset = event.clientY - rect.top - rect.height * split / 100;
    frame.classList.add('is-dragging');
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  handle.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) return;
    splitAtPointer(event);
  });

  function finishPointer(event) {
    if (event.pointerId !== activePointer) return;
    if (event.type === 'pointerup') splitAtPointer(event);
    const pointerId = activePointer;
    activePointer = null;
    frame.classList.remove('is-dragging');
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
  }

  handle.addEventListener('pointerup', finishPointer);
  handle.addEventListener('pointercancel', finishPointer);
  handle.addEventListener('lostpointercapture', finishPointer);

  handle.addEventListener('keydown', event => {
    let next;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight': next = split - 5; break;
      case 'ArrowDown':
      case 'ArrowLeft': next = split + 5; break;
      case 'PageUp': next = split - 10; break;
      case 'PageDown': next = split + 10; break;
      case 'Home': next = 100; break;
      case 'End': next = 0; break;
      default: return;
    }
    event.preventDefault();
    useManualControl();
    setSplit(next);
  });

  if (autoButton) autoButton.addEventListener('click', () => {
    manual = false;
    updateControls();
    schedule();
    handle.focus({ preventScroll: true });
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule, { once: true });
  window.addEventListener('pageshow', schedule);
  reducedMotion.addEventListener('change', syncMotionPreference);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(frame);
  frame.classList.add('is-scroll-ready');
  frame.closest('.art-plan2').classList.add('has-interactive-case');
  setSplit(50);
  syncMotionPreference();
})();
