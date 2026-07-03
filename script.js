// Envío del formulario de auditoría vía Web3Forms.
// Requiere reemplazar el access_key en index.html (input hidden "access_key")
// por el key real generado en https://web3forms.com

const form = document.getElementById('audit-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const accessKey = form.querySelector('input[name="access_key"]').value;
  if (!accessKey || accessKey === 'TU_ACCESS_KEY_WEB3FORMS') {
    statusEl.textContent = 'Falta configurar el access_key de Web3Forms.';
    statusEl.className = 'form-note error';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  statusEl.textContent = '';
  statusEl.className = 'form-note';

  try {
    const formData = new FormData(form);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
    const result = await response.json();

    if (result.success) {
      statusEl.textContent = 'Listo. Te contactamos en menos de 24 horas.';
      statusEl.className = 'form-note success';
      form.reset();
    } else {
      throw new Error(result.message || 'Error al enviar');
    }
  } catch (err) {
    statusEl.textContent = 'No se pudo enviar. Intenta de nuevo o escríbenos directo.';
    statusEl.className = 'form-note error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar y agendar mi auditoría';
  }
});
