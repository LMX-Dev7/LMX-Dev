/* ============================================================
   LMX — Motion

   El movimiento continuo (paralaje, riel horizontal, barra de
   progreso, dibujado del sello) lo resuelve CSS con
   `animation-timeline`, no este archivo. Aquí sólo queda lo que
   CSS todavía no puede hacer:

   1. Revelado one-shot al entrar en pantalla.
   2. Estado compacto del nav.
   3. Sección activa en el nav.
   4. Contadores de las métricas.
   5. Medir el desplazamiento del riel (una vez + en resize) y
      publicarlo como variable CSS.

   Nada aquí escucha el evento `scroll` en caliente: todo va por
   IntersectionObserver, así que no compite con el hilo principal.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ----------------------------------------------------------
     1 · REVELADO
     ---------------------------------------------------------- */
  (function reveal() {
    var items = document.querySelectorAll('.rv, .stagger, .reveal-lines');
    if (!items.length) return;

    if (reduce || !hasIO) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);          // one-shot: no re-anima al volver
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  })();

  /* ----------------------------------------------------------
     2 · NAV COMPACTO
     Un centinela de 1px arriba del todo: cuando deja de verse,
     es que hemos scrolleado. Más barato que escuchar scroll.
     ---------------------------------------------------------- */
  (function stickyNav() {
    var nav = document.querySelector('.nav');
    if (!nav || !hasIO) return;

    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  })();

  /* ----------------------------------------------------------
     3 · SECCIÓN ACTIVA EN EL NAV
     ---------------------------------------------------------- */
  (function scrollSpy() {
    var links = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!links.length || !hasIO) return;

    var map = {};
    var targets = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      map[el.id] = a;
      targets.push(el);
    });
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); });
        var a = map[e.target.id];
        if (a) a.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------
     4 · CONTADORES
     Marcado: <b data-count="120" data-prefix="+" data-suffix="%">
     El HTML ya trae el valor final escrito, así que sin JS la
     cifra se lee igual.
     ---------------------------------------------------------- */
  (function counters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length || reduce || !hasIO) return;

    function run(el) {
      var end = parseFloat(el.dataset.count);
      var pre = el.dataset.prefix || '';
      var suf = el.dataset.suffix || '';
      var dur = 1250;
      var t0 = null;

      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);         // easeOutCubic
        el.textContent = pre + Math.round(end * eased) + suf;
        if (p < 1) requestAnimationFrame(frame);
      }

      el.textContent = pre + '0' + suf;
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------
     5 · RIEL HORIZONTAL
     CSS anima `translateX(-var(--rail-shift))` a lo largo del
     scroll. Aquí sólo se mide cuánto hay que desplazar y cuánta
     altura necesita el riel para que el gesto no se sienta ni
     brusco ni interminable.
     ---------------------------------------------------------- */
  (function rail() {
    var rail = document.querySelector('.rail');
    if (!rail) return;

    var view = rail.querySelector('.rail__view');
    var track = rail.querySelector('.track');
    if (!view || !track) return;

    // En táctil el riel es un carrusel deslizable: no se mide nada.
    var touch = window.matchMedia('(pointer: coarse), (max-width: 900px)');

    // Sin scroll-driven animations no hay anclado posible: se deja el
    // estado base, que ya es un carrusel usable.
    var canPin = window.CSS && CSS.supports &&
                 CSS.supports('animation-timeline', 'view()');

    function unpin() {
      rail.classList.remove('rail--pinned');
      rail.style.removeProperty('--rail-shift');
      rail.style.removeProperty('--rail-h');
    }

    function measure() {
      if (!canPin || touch.matches || reduce) { unpin(); return; }

      // Medir SIEMPRE en geometría anclada: el estado base sangra el
      // visor con margen negativo, así que su clientWidth no coincide.
      rail.classList.add('rail--pinned');

      // +44px de sobrerrecorrido para que la última tarjeta termine
      // fuera del degradado del borde derecho.
      var shift = track.scrollWidth - view.clientWidth + 44;
      if (shift <= 44) { unpin(); return; }   // caben todas: anclar no aporta

      rail.style.setProperty('--rail-shift', shift + 'px');
      // 1 px de recorrido horizontal ≈ 1.15 px de scroll vertical.
      rail.style.setProperty('--rail-h', Math.round(window.innerHeight + shift * 1.15) + 'px');
    }

    measure();

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(measure, 160);
    }, { passive: true });

    // Las webfonts cambian el ancho de las tarjetas al cargar.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  })();

  /* ----------------------------------------------------------
     6 · AÑO DEL FOOTER
     ---------------------------------------------------------- */
  (function year() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  })();
})();
