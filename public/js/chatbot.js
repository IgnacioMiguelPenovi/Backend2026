(function () {
  const toggle = document.getElementById('chatToggle');
  const box = document.getElementById('chatBox');
  const cerrar = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const mensajes = document.getElementById('chatMensajes');
  if (!toggle || !box) return;

  toggle.addEventListener('click', () => {
    box.hidden = !box.hidden;
    if (!box.hidden) input.focus();
  });
  cerrar.addEventListener('click', () => { box.hidden = true; });

  function agregar(texto, clase) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + clase;
    div.textContent = texto; // textContent evita inyección de HTML
    mensajes.appendChild(div);
    mensajes.scrollTop = mensajes.scrollHeight;
    return div;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    agregar(texto, 'user');
    input.value = '';
    input.disabled = true;
    const espera = agregar('Escribiendo...', 'bot');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto })
      });
      if (res.status === 401) {
        espera.textContent = 'Tu sesión expiró. Redirigiendo al login...';
        setTimeout(() => { window.location.href = '/login'; }, 1500);
        return;
      }
      const datos = await res.json();
      espera.textContent = res.ok ? datos.respuesta : (datos.error || 'Ocurrió un error.');
    } catch (err) {
      espera.textContent = 'No se pudo conectar con el asistente.';
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
})();
