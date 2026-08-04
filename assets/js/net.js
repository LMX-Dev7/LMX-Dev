/* ============================================================
   LMX — Malla de constelación (fondo)

   Un canvas fijo detrás de todo el contenido. Cada punto tiene una
   "profundidad" (d) que decide su tamaño, brillo y velocidad, lo
   que produce sensación de campo sin usar imágenes.

   Consideraciones de rendimiento — el dibujado es O(n²), así que:
   · la densidad se calcula por área y se recorta más en pantallas
     pequeñas (batería en móvil);
   · el bucle interno corta en cuanto la distancia en X ya supera
     el radio de conexión;
   · se detiene con la pestaña oculta y con reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('net');
  if (!cv || !cv.getContext) return;

  var cx = cv.getContext('2d', { alpha: true });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coarse = window.matchMedia('(pointer: coarse)');

  var w = 0, h = 0, pts = [], raf = null, running = false;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    // Menos densidad en táctil: el coste por frame crece al cuadrado.
    var divisor = coarse.matches ? 22000 : 13500;
    var cap = coarse.matches ? 62 : 120;
    var n = Math.max(30, Math.min(cap, Math.round((w * h) / divisor)));

    pts = [];
    for (var i = 0; i < n; i++) {
      var d = Math.random();                      // 0 = lejos, 1 = cerca
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (0.05 + d * 0.14),
        vy: (Math.random() - 0.5) * (0.05 + d * 0.14),
        d: d
      });
    }
    // Ordenar por X permite cortar el bucle interno antes de tiempo.
    pts.sort(function (a, b) { return a.x - b.x; });
  }

  function draw() {
    cx.clearRect(0, 0, w, h);
    var max = Math.max(110, Math.min(200, w / 8.5));

    cx.lineWidth = 0.55;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j];
        var dx = q.x - p.x;
        if (dx > max) break;                       // los siguientes están aún más lejos
        var dy = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < max) {
          var a = (1 - dist / max) * 0.17 * (0.3 + (p.d + q.d) / 2);
          cx.strokeStyle = 'rgba(228,230,216,' + a.toFixed(3) + ')';
          cx.beginPath();
          cx.moveTo(p.x, p.y);
          cx.lineTo(q.x, q.y);
          cx.stroke();
        }
      }
    }

    for (var k = 0; k < pts.length; k++) {
      var s = pts[k];
      var r = 0.45 + s.d * 1.45;
      if (s.d > 0.88) {                            // halo en los más cercanos
        cx.beginPath();
        cx.arc(s.x, s.y, r * 5, 0, 6.2832);
        cx.fillStyle = 'rgba(195,199,158,.045)';
        cx.fill();
      }
      cx.beginPath();
      cx.arc(s.x, s.y, r, 0, 6.2832);
      cx.fillStyle = 'rgba(240,241,232,' + (0.16 + s.d * 0.5).toFixed(3) + ')';
      cx.fill();
    }
  }

  function step() {
    var reorder = false;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -50)      { p.x = w + 50; reorder = true; }
      else if (p.x > w + 50) { p.x = -50; reorder = true; }
      if (p.y < -50)      { p.y = h + 50; }
      else if (p.y > h + 50) { p.y = -50; }
    }
    // El orden por X sólo se rompe cuando un punto da la vuelta.
    if (reorder) pts.sort(function (a, b) { return a.x - b.x; });

    draw();
    raf = requestAnimationFrame(step);
  }

  function start() {
    if (running || reduce.matches) return;
    running = true;
    raf = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      resize();
      if (reduce.matches) draw();
    }, 180);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  // Si el usuario cambia la preferencia en caliente, obedecer sin recargar.
  reduce.addEventListener('change', function () {
    if (reduce.matches) { stop(); draw(); } else { start(); }
  });

  resize();
  if (reduce.matches) draw(); else start();
})();
