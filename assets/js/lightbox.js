/* ============================================================
   LMX — Visor de foto

   Casi todo lo hace <dialog> por su cuenta: cierre con ESC, fondo
   inerte, devolución del foco al botón que lo abrió y el
   pseudoelemento ::backdrop. El bloqueo del scroll de fondo lo
   resuelve CSS con :has(dialog[open]).

   Aquí sólo queda lo que no viene de serie:

   1. Abrir.
   2. Cargar la imagen grande en la PRIMERA apertura, no antes: así
      sus 30 KB no se descargan si nadie pulsa.
   3. Cerrar al pulsar fuera de la foto, que es lo que todo el mundo
      espera de un visor.

   Sin soporte para <dialog> no se engancha nada y el botón queda
   inerte: la foto pequeña se sigue viendo en su sitio.
   ============================================================ */
(function () {
  'use strict';

  var dlg = document.getElementById('zoom');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  var img = dlg.querySelector('img[data-src]');
  var openers = document.querySelectorAll('[data-zoom]');
  if (!openers.length) return;

  openers.forEach(function (el) {
    el.addEventListener('click', function () {
      if (img && !img.getAttribute('src')) img.src = img.dataset.src;
      dlg.showModal();
    });
  });

  dlg.querySelectorAll('[data-zoom-close]').forEach(function (el) {
    el.addEventListener('click', function () { dlg.close(); });
  });

  /* El click sobre el ::backdrop tiene como target el propio <dialog>,
     así que basta comprobar que no venga de un hijo. */
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) dlg.close();
  });
})();
