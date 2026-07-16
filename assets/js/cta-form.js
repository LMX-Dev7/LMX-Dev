// Envío del formulario de auditoría vía Web3Forms.
const form = document.getElementById('cta-form');
const statusEl = document.getElementById('cta-form-status');
const submitBtn = document.getElementById('cta-submit-btn');
const formWrap = document.getElementById('cta-form-wrap');
const successBox = document.getElementById('cta-success');

if (form) {
  const submitLabel = submitBtn ? submitBtn.textContent : 'Enviar solicitud';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const accessKey = form.querySelector('input[name="access_key"]').value;
    if (!accessKey || accessKey === 'TU_ACCESS_KEY_WEB3FORMS') {
      statusEl.textContent = 'Falta configurar el access_key de Web3Forms.';
      statusEl.className = 'form-status err';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        // Sustituye el formulario por el bloque de confirmación del diseño.
        if (formWrap && successBox) {
          formWrap.classList.add('is-hidden');
          successBox.classList.remove('is-hidden');
        } else {
          statusEl.textContent = 'Solicitud recibida. Te escribimos en menos de 24 h.';
          statusEl.className = 'form-status ok';
          form.reset();
        }
      } else {
        throw new Error(result.message || 'Error al enviar');
      }
    } catch (err) {
      statusEl.textContent = 'No se pudo enviar. Intenta de nuevo.';
      statusEl.className = 'form-status err';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
}
