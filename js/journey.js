/**
 * journey.js — Cinematic scroll storytelling interactions
 * Uses GSAP + ScrollTrigger (loaded via CDN on the page)
 * Falls back to IntersectionObserver for non-GSAP elements
 */

(function () {
  'use strict';

  /* ── Utilities ──────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── Register ScrollTrigger ─────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ══════════════════════════════════════════════════════════
     1. READING PROGRESS BAR
     ═════════════════════════════════════════════════════════ */
  const progressBar = qs('#progressBar');
  let currentProgress = 0;
  let targetProgress  = 0;
  let rafId;

  function updateProgress () {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    targetProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    currentProgress = lerp(currentProgress, targetProgress, 0.12);
    if (progressBar) progressBar.style.width = currentProgress.toFixed(2) + '%';

    rafId = requestAnimationFrame(updateProgress);
  }

  updateProgress();


  /* ══════════════════════════════════════════════════════════
     2. NAV SHRINK ON SCROLL
     ═════════════════════════════════════════════════════════ */
  const nav = qs('#nav');
  const scrollThreshold = 80;

  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > scrollThreshold) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true });


  /* ══════════════════════════════════════════════════════════
     3. GSAP PARALLAX — CHAPTER IMAGES
     ═════════════════════════════════════════════════════════ */
  if (typeof gsap !== 'undefined') {
    qsa('.chapter__parallax-img').forEach((img) => {
      gsap.to(img, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.chapter__parallax-wrap'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     4. INTERSECTION OBSERVER — CHAPTER TEXT PANELS
     ═════════════════════════════════════════════════════════ */
  const panelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          panelObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
  );

  qsa('.chapter__text-panel, .chapter__cinematic-text').forEach((el) => {
    panelObserver.observe(el);
  });


  /* ══════════════════════════════════════════════════════════
     5. INTERLUDE QUOTES & LINES
     ═════════════════════════════════════════════════════════ */
  const quoteObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // stagger the lines
          const lines = entry.target.querySelectorAll('.interlude__line');
          lines.forEach((line, i) => {
            setTimeout(() => line.classList.add('is-visible'), i * 200);
          });
          quoteObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  qsa('.interlude__quote').forEach((el) => quoteObserver.observe(el));


  /* ══════════════════════════════════════════════════════════
     6. STATS COUNTER ANIMATION
     ═════════════════════════════════════════════════════════ */
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const num = +el.dataset.num;
        const display = el.querySelector('.journey-stat__num');

        el.classList.add('is-visible');

        let start = 0;
        const duration = 1200;
        const startTime = performance.now();

        function animateNum (now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out-cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * num);
          display.textContent = current;
          if (progress < 1) requestAnimationFrame(animateNum);
        }

        requestAnimationFrame(animateNum);
        statObserver.unobserve(el);
      });
    },
    { threshold: 0.3 }
  );

  qsa('.journey-stat').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.12}s`;
    statObserver.observe(el);
  });


  /* ══════════════════════════════════════════════════════════
     7. JOURNEY END CTA REVEAL
     ═════════════════════════════════════════════════════════ */
  const endEls = qsa('.journey-end__label, .journey-end__title, .journey-end__sub, .journey-end__actions');

  const endObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          endObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  endEls.forEach((el) => endObserver.observe(el));


  /* ══════════════════════════════════════════════════════════
     8. BACK TO TOP BUTTON
     ═════════════════════════════════════════════════════════ */
  const btt = qs('#btt');

  if (btt) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        btt.classList.add('is-visible');
      } else {
        btt.classList.remove('is-visible');
      }
    }, { passive: true });

    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ══════════════════════════════════════════════════════════
     9. TITLE SCREEN — MAGNETIC CURSOR TILT (desktop only)
     ═════════════════════════════════════════════════════════ */
  const titleScreen = qs('#titleScreen');

  if (titleScreen && window.matchMedia('(pointer: fine)').matches) {
    const inner = qs('.title-screen__inner', titleScreen);

    titleScreen.addEventListener('mousemove', (e) => {
      const rect = titleScreen.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;

      inner.style.transform = `
        perspective(900px)
        rotateX(${(-cy * 6).toFixed(2)}deg)
        rotateY(${(cx * 6).toFixed(2)}deg)
        translateZ(0)
      `;
    });

    titleScreen.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    });
  }


  /* ══════════════════════════════════════════════════════════
     10. GSAP — CINEMATIC CHAPTER TEXT (pin + scrub fade)
     ═════════════════════════════════════════════════════════ */
  if (typeof gsap !== 'undefined') {
    qsa('.chapter--cinematic').forEach((chapter) => {
      const heading = qs('.chapter__title--big', chapter);
      const body    = qs('.chapter__body--centered', chapter);

      if (heading) {
        gsap.from(heading, {
          yPercent: 12,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: chapter,
            start: 'top 75%',
            toggleActions: 'play none none none',
          }
        });
      }

      if (body) {
        gsap.from(body, {
          yPercent: 8,
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: chapter,
            start: 'top 70%',
            toggleActions: 'play none none none',
          }
        });
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     11. MOBILE NAV BURGER
     ═════════════════════════════════════════════════════════ */
  const burger = qs('#burger');
  const navLinks = qs('.nav__links');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('nav__links--open');
      burger.textContent = navLinks.classList.contains('nav__links--open') ? '✕' : '☰';
    });
  }


  /* ══════════════════════════════════════════════════════════
     12. AMBIENT GLOW ORBS — MOUSE FOLLOW (desktop)
     ═════════════════════════════════════════════════════════ */
  if (window.matchMedia('(pointer: fine)').matches) {
    const orbs = qsa('.journey-end__orb');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let orbX = mouseX;
    let orbY = mouseY;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateOrbs () {
      orbX = lerp(orbX, mouseX, 0.04);
      orbY = lerp(orbY, mouseY, 0.04);

      const endSection = qs('#journeyEnd');
      if (endSection) {
        const rect = endSection.getBoundingClientRect();
        const relX = orbX - rect.left;
        const relY = orbY - rect.top;

        if (orbs[0]) {
          orbs[0].style.transform = `translate(${relX * 0.04}px, ${relY * 0.04}px)`;
        }
        if (orbs[1]) {
          orbs[1].style.transform = `translate(${relX * -0.03}px, ${relY * -0.03}px)`;
        }
      }

      requestAnimationFrame(animateOrbs);
    }

    animateOrbs();
  }

  /* End of journey.js */
})();
