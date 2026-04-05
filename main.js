/* ═══════════════════════════════════════════════════════════
   The Weird Wanderer — GSAP + ScrollTrigger + Lenis Engine
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── 1. Register GSAP Plugins ──────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── 2. Lenis Smooth Scroll ────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  // Pipe Lenis into GSAP's ticker for perfect sync
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ── 3. Navigation Scroll Behavior ─────────────────────── */
  const nav = document.querySelector('.nav');

  ScrollTrigger.create({
    start: 80,
    onUpdate: (self) => {
      if (self.direction === 1 && self.scroll() > 80) {
        nav.style.borderBottomColor = 'rgba(240,236,228,0.08)';
        nav.style.background = 'rgba(13,12,11,0.92)';
      } else if (self.scroll() <= 80) {
        nav.style.borderBottomColor = 'transparent';
        nav.style.background = '';
      }
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -60 });
      }
    });
  });

  /* ── 4. Burger Menu ────────────────────────────────────── */
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__links');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      // Pause/resume Lenis when menu is open
      isOpen ? lenis.stop() : lenis.start();
    });
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        lenis.start();
      })
    );
  }

  /* ── 5. Pin Tooltips ───────────────────────────────────── */
  const pinBackdrop = document.querySelector('.pin-backdrop');
  const pinTooltip = document.querySelector('.pin-tooltip');

  function openPin(pin) {
    if (!pinTooltip || !pinBackdrop) return;
    const d = pin.dataset;
    pinTooltip.querySelector('.pin-tooltip__loc').textContent = d.loc || '';
    pinTooltip.querySelector('.pin-tooltip__title').textContent = d.title || '';
    pinTooltip.querySelector('.pin-tooltip__open').textContent = d.open || '';
    pinBackdrop.classList.add('is-open');
    pinTooltip.classList.add('is-open');
    lenis.stop();
  }
  function closePin() {
    if (!pinTooltip || !pinBackdrop) return;
    pinBackdrop.classList.remove('is-open');
    pinTooltip.classList.remove('is-open');
    lenis.start();
  }

  document.querySelectorAll('.pin').forEach((pin) =>
    pin.addEventListener('click', () => openPin(pin))
  );
  pinBackdrop?.addEventListener('click', closePin);
  pinTooltip?.querySelector('.pin-tooltip__close')?.addEventListener('click', closePin);

  /* ── 6. Card Cursor Glow ───────────────────────────────── */
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ═══════════════════════════════════════════════════════════
     GSAP SCROLL ANIMATIONS
     ═══════════════════════════════════════════════════════════ */

  /* ── 7. Hero Parallax ──────────────────────────────────── */
  const heroContent = document.querySelector('.hero__content');
  const heroMap = document.querySelector('.hero__map');
  const heroScroll = document.querySelector('.hero__scroll-hint');

  if (heroContent) {
    gsap.to(heroContent, {
      y: -120,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      }
    });
  }

  if (heroMap) {
    gsap.to(heroMap, {
      scale: 1.08,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      }
    });
  }

  if (heroScroll) {
    gsap.to(heroScroll, {
      opacity: 0,
      y: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: '60% top',
        end: '80% top',
        scrub: true,
      }
    });
  }

  /* ── 8. Opening Quote ──────────────────────────────────── */
  const quote = document.querySelector('.opening-quote');
  if (quote) {
    gsap.from(quote, {
      opacity: 0,
      y: 50,
      scale: 0.97,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.quote-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ── 9. Journeys Section Header ────────────────────────── */
  const journeysHeader = document.querySelector('.journeys__header');
  if (journeysHeader) {
    const headerElements = journeysHeader.querySelectorAll('.label, .journeys__title, .journeys__sub');
    gsap.from(headerElements, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: journeysHeader,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ── 10. Journey Cards Stagger ─────────────────────────── */
  const cards = gsap.utils.toArray('.card');
  cards.forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 60,
      rotateX: 4,
      duration: 0.9,
      delay: i * 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      }
    });
  });

  /* ── 11. Manifesto Label + CTA ─────────────────────────── */
  const manifesto = document.querySelector('.manifesto');
  if (manifesto) {
    const manifestoLabel = manifesto.querySelector('.label');
    const manifestoCta = manifesto.querySelector('.manifesto__cta');

    if (manifestoLabel) {
      gsap.from(manifestoLabel, {
        opacity: 0,
        x: -30,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: manifesto,
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        }
      });
    }
    if (manifestoCta) {
      gsap.from(manifestoCta, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: manifestoCta,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        }
      });
    }
  }

  /* ── 12. Manifesto Text Reveal ─────────────────────────── */
  const manifestoParagraphs = gsap.utils.toArray('.manifesto__text p');
  manifestoParagraphs.forEach((p, i) => {
    gsap.to(p, {
      opacity: 0.85,
      y: 0,
      duration: 1,
      delay: i * 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: p,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      }
    });
  });

  /* ── 13. Stat Counter Animation ────────────────────────── */
  const stats = gsap.utils.toArray('.stat');
  stats.forEach((stat) => {
    const numEl = stat.querySelector('.stat__num');
    if (!numEl) return;
    const raw = numEl.textContent.trim();
    const match = raw.match(/([\d,.]+)(\D*)/);
    if (!match) return;
    const target = parseFloat(match[1].replace(/,/g, ''));
    const suffix = match[2] || '';
    const isDecimal = match[1].includes('.');

    // Set initial display to 0
    numEl.textContent = '0' + suffix;

    // Animate the stat block entrance + counter
    gsap.from(stat, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: stat,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          // Counter tween
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power1.out',
            onUpdate: () => {
              numEl.textContent = (isDecimal ? obj.val.toFixed(1) : Math.round(obj.val).toLocaleString()) + suffix;
            }
          });
        }
      }
    });
  });

  /* ── 14. Untranslatable Section Header ─────────────────── */
  const untransSection = document.querySelector('.untranslatable');
  if (untransSection) {
    const utLabel = untransSection.querySelector('.label');
    const utTitle = untransSection.querySelector('.untranslatable__title');

    gsap.from([utLabel, utTitle].filter(Boolean), {
      opacity: 0,
      y: 40,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: untransSection,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ── 15. Word Cards Cascade ────────────────────────────── */
  const wordCards = gsap.utils.toArray('.word-card');
  wordCards.forEach((wc, i) => {
    gsap.from(wc, {
      opacity: 0,
      y: 50,
      scale: 0.96,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: wc,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      }
    });
  });

  /* ── 16. Footer Reveal ─────────────────────────────────── */
  const footerInner = document.querySelector('.site-footer__inner');
  if (footerInner) {
    gsap.from(footerInner, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.site-footer',
        start: 'top 92%',
        toggleActions: 'play none none reverse',
      }
    });
  }

})();
