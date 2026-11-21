// public/validar.js — Validación en el navegador (la definitiva es la del servidor)
(function () {
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;

  function mostrar(form, campo, msg) {
    const input = form.querySelector('#' + campo);
    const small = form.querySelector('.error[data-para="' + campo + '"]');
    if (small) small.textContent = msg || '';
    if (input) input.classList.toggle('invalido', !!msg);
    return !msg;
  }

  const reg = document.getElementById('formRegistro');
  if (reg) {
    reg.addEventListener('submit', (e) => {
      const v = (id) => reg.querySelector('#' + id).value;
      const nombre = v('nombre').trim();
      const email = v('email').trim();
      const pass = v('password');
      const conf = v('confirmar');
      let ok = true;

      ok &= mostrar(reg, 'nombre',
        !nombre ? 'El nombre es obligatorio.' :
        nombre.length < 3 ? 'Mínimo 3 caracteres.' :
        !REGEX_NOMBRE.test(nombre) ? 'Solo letras y espacios.' : '');
      ok &= mostrar(reg, 'email',
        !email ? 'El correo es obligatorio.' :
        !REGEX_EMAIL.test(email) ? 'Correo no válido.' : '');
      ok &= mostrar(reg, 'password',
        !pass ? 'La contraseña es obligatoria.' :
        pass.length < 8 ? 'Mínimo 8 caracteres.' :
        !/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/[0-9]/.test(pass) ? 'Debe tener mayúscula, minúscula y número.' :
        /\s/.test(pass) ? 'Sin espacios.' : '');
      ok &= mostrar(reg, 'confirmar',
        !conf ? 'Confirma tu contraseña.' :
        conf !== pass ? 'Las contraseñas no coinciden.' : '');

      if (!ok) e.preventDefault();
    });
  }

  const log = document.getElementById('formLogin');
  if (log) {
    log.addEventListener('submit', (e) => {
      const email = log.querySelector('#email').value.trim();
      const pass = log.querySelector('#password').value;
      let ok = true;
      ok &= mostrar(log, 'email', !email ? 'El correo es obligatorio.' : !REGEX_EMAIL.test(email) ? 'Correo no válido.' : '');
      ok &= mostrar(log, 'password', !pass ? 'La contraseña es obligatoria.' : '');
      if (!ok) e.preventDefault();
    });
  }
})();
