(() => {
  const quiz = document.querySelector("[data-quiz]");
  const content = document.querySelector("[data-content]");
  const sticky = document.querySelector("[data-sticky-cta]");
  const benefit = document.querySelector("[data-benefit]");
  const resultType = document.querySelector("[data-result-type]");
  const resultBody = document.querySelector("[data-result-body]");
  const resultExtra = document.querySelector("[data-result-extra]");
  const progressDots = [...document.querySelectorAll("[data-progress-dot]")];
  const fv = document.querySelector(".fv");

  if (!quiz || !content) return;

  const typesNode = document.getElementById("lp-types");
  let types = {};
  try {
    types = typesNode
      ? JSON.parse(typesNode.textContent)
      : JSON.parse(quiz.getAttribute("data-types") || "{}");
  } catch (err) {
    console.error("lp-types JSON parse failed", err);
  }

  let autoAdvanceTimer;
  let furthestStep = 0;
  let step = 0; // 0-3 questions, then show content
  let answers = { q1: null, q2: null, q3: null, q4: null };

  const steps = [...quiz.querySelectorAll("[data-step]")];
  quiz.classList.add("is-auto-advance");
  quiz.querySelectorAll("[data-next]").forEach(button => { button.hidden = true; });

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  function scrollToQuiz() {
    const top = 0;
    window.scrollTo({ top: Math.max(0, top), behavior: motion });
  }

  function syncFv(index) {
    // Keep the visual and offer strip above every question.
    if (!fv) return;
    fv.hidden = false;
  }

  function updateCouponProgress() {
    const label = quiz.querySelector("[data-step-label]");
    const remaining = steps.filter(el => !selectedCard(el)).length;
    if (label) label.textContent = remaining > 0
      ? `クーポン獲得まで残り${remaining}問`
      : "初回限定クーポンを受け取れます";
  }

  function showStep(index, initial = false) {
    furthestStep = Math.max(furthestStep, index);
    steps.forEach((el, i) => {
      el.classList.toggle("is-active", i === index);
      el.classList.toggle("is-revealed", i <= furthestStep);
    });
    progressDots.forEach((dot, i) => {
      dot.classList.toggle("is-on", i <= index);
    });
    updateCouponProgress();
    const current = steps[index];
    current.querySelector("[data-next]").disabled = !selectedCard(current);
    syncFv(index);
    if (!initial) {
      current.querySelector(".quiz__q").focus({ preventScroll: true });
      requestAnimationFrame(() => {
        window.scrollTo({top: Math.max(0, current.getBoundingClientRect().top + window.scrollY - 92), behavior: motion});
      });
    }
  }

  function selectedCard(stepEl) {
    return stepEl.querySelector(".card.is-active");
  }

  function goNext() {
    clearTimeout(autoAdvanceTimer);
    const stepEl = steps[step];
    if (!stepEl || !selectedCard(stepEl)) {
      alert("選択してください");
      return;
    }
    if (step < steps.length - 1) {
      step += 1;
      showStep(step);
    } else {
      finishQuiz();
    }
  }

  function goPrev() {
    clearTimeout(autoAdvanceTimer);
    if (step > 0) {
      step -= 1;
      showStep(step);
    }
  }

  quiz.addEventListener("click", (e) => {
    const next = e.target.closest("[data-next]");
    if (next) {
      e.preventDefault();
      step = steps.indexOf(next.closest('[data-step]'));
      goNext();
      return;
    }

    const prev = e.target.closest("[data-prev]");
    if (prev) {
      e.preventDefault();
      step = steps.indexOf(prev.closest('[data-step]'));
      goPrev();
      return;
    }

    const card = e.target.closest(".card");
    if (card && quiz.contains(card)) {
      const stepEl = card.closest("[data-step]");
      if (!stepEl) return;
      stepEl.querySelectorAll(".card").forEach((c) => {
        c.classList.remove("is-active", "is-dim");
        c.setAttribute("aria-pressed", "false");
        c.querySelector(".card__back").setAttribute("aria-hidden", "true");
      });
      card.classList.add("is-active");
      card.setAttribute("aria-pressed", "true");
      card.querySelector(".card__back").setAttribute("aria-hidden", "false");
      stepEl.querySelector("[data-next]").disabled = false;
      stepEl.querySelectorAll(".card:not(.is-active)").forEach((c) => c.classList.add("is-dim"));
      const key = stepEl.getAttribute("data-answer-key");
      answers[key] = card.getAttribute("data-value");
      updateCouponProgress();
      // Briefly show the selected outline, then reuse the existing navigation
      // event so question unlocking, focus and accessible progress stay in sync.
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(() => {
        if (selectedCard(stepEl) === card) stepEl.querySelector("[data-next]").click();
      }, 300);
    }
  });

  // キーボード操作
  quiz.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (!e.repeat) card.click();
    }
  });

  function finishQuiz() {
    clearTimeout(autoAdvanceTimer);
    content.classList.add('is-visible');
    document.body.classList.add('ito-survey-complete');
    const button=steps[steps.length-1].querySelector('[data-next]');
    button.textContent='クーポンを表示しています';
    button.disabled=true;
    content.focus({preventScroll:true});
    requestAnimationFrame(()=>window.scrollTo({top:content.getBoundingClientRect().top+window.scrollY,behavior:motion}));

  }

  function observeSticky() {
    if (!sticky || !benefit) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // show sticky once benefit has been reached / scrolled past top
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            sticky.classList.add("is-show");
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(benefit);

    // also use scroll for "after benefit"
    window.addEventListener(
      "scroll",
      () => {
        const top = benefit.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.55) sticky.classList.add("is-show");
        else sticky.classList.remove("is-show");
      },
      { passive: true }
    );
  }

  // countdown optional
  const countdown = document.querySelector("[data-countdown]");
  if (countdown) {
    const endAttr = countdown.getAttribute("data-end");
    const end = endAttr ? new Date(endAttr) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdown.textContent = `${d}日 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  showStep(0, true);

  const intro = document.querySelector("[data-intro-popup]");
  if (intro && typeof intro.showModal === "function") {
    intro.querySelector("[data-intro-close]").addEventListener("click", () => intro.close());
    intro.querySelectorAll("[data-intro-start]").forEach(button => button.addEventListener("click", () => {
      intro.close();
      steps[0].querySelector(".quiz__q").focus({ preventScroll: true });
      scrollToQuiz();
    }));
    intro.showModal();
  }
})();

// Muted inline playback, with a manual start when browser autoplay is blocked.
(() => {
  const video = document.querySelector('[data-hero-video]');
  const toggle = document.querySelector('[data-video-toggle]');
  if (!video) return;
  video.muted = true;
  video.loop = true;
  const sync = () => {
    if (!toggle) return;
    toggle.textContent = video.paused ? '再生' : '一時停止';
    toggle.setAttribute('aria-label', video.paused ? '動画を再生' : '動画を一時停止');
  };
  const play = () => { if (video.closest(".fv")?.hidden) return; const attempt = video.play(); if (attempt) attempt.catch(sync); };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  if (toggle) toggle.addEventListener('click', () => video.paused ? play() : video.pause());
  document.querySelectorAll('[data-intro-start]').forEach(button => button.addEventListener('click', play));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
  window.addEventListener('pageshow', play);
  document.addEventListener('pointerdown', () => { if (video.paused) play(); }, { passive: true });
  play();
})();
