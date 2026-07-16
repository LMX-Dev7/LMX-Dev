/* ── Motion: revelado al scroll + respeto a reduced-motion ──
   - Aplica .is-visible a los [data-reveal] al entrar en viewport
     (respetando data-delay en ms).
   - Con prefers-reduced-motion, detiene la partícula SMIL del
     diagrama de flujo (CSS no puede pausar <animateMotion>).
   ────────────────────────────────────────────────────────── */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Detener la partícula del diagrama de flujo si se pide menos movimiento.
  if (prefersReduced) {
    document.querySelectorAll('.flow-svg animateMotion').forEach((el) => el.remove());
    document.querySelectorAll('.flow-svg circle').forEach((c) => { c.style.display = 'none'; });
  }

  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => observer.observe(el));
})();
