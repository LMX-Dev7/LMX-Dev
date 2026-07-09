// Envío del formulario CTA vía Web3Forms.
const form = document.getElementById('cta-form');
const statusEl = document.getElementById('cta-form-status');
const submitBtn = document.getElementById('cta-submit-btn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const accessKey = form.querySelector('input[name="access_key"]').value;
    if (!accessKey || accessKey === 'TU_ACCESS_KEY_WEB3FORMS') {
      statusEl.textContent = 'Falta configurar el access_key de Web3Forms.';
      statusEl.className = 'text-red-400';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    statusEl.textContent = '';
    statusEl.className = '';

    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        statusEl.textContent = '¡Listo! Nos comunicaremos en breve.';
        statusEl.className = 'text-emerald-400 font-semibold';
        form.reset();
      } else {
        throw new Error(result.message || 'Error al enviar');
      }
    } catch (err) {
      statusEl.textContent = 'No se pudo enviar. Intenta de nuevo.';
      statusEl.className = 'text-red-400';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Quiero mi auditoría gratis';
    }
  });
}
