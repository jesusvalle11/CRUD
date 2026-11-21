// validaciones.js — Reglas de validación del lado del servidor

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;

function validarRegistro({ nombre, email, password, confirmar }) {
  const errores = {};

  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.length < 3 || nombre.length > 50) errores.nombre = 'El nombre debe tener entre 3 y 50 caracteres.';
  else if (!REGEX_NOMBRE.test(nombre)) errores.nombre = 'El nombre solo puede contener letras y espacios.';

  if (!email) errores.email = 'El correo es obligatorio.';
  else if (email.length > 100 || !REGEX_EMAIL.test(email)) errores.email = 'Ingresa un correo válido (ej: usuario@correo.com).';

  if (!password) errores.password = 'La contraseña es obligatoria.';
  else if (password.length < 8 || password.length > 64) errores.password = 'La contraseña debe tener entre 8 y 64 caracteres.';
  else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password))
    errores.password = 'La contraseña debe tener al menos una mayúscula, una minúscula y un número.';
  else if (/\s/.test(password)) errores.password = 'La contraseña no puede contener espacios.';

  if (!confirmar) errores.confirmar = 'Confirma tu contraseña.';
  else if (password !== confirmar) errores.confirmar = 'Las contraseñas no coinciden.';

  return errores;
}

function validarLogin({ email, password }) {
  const errores = {};
  if (!email) errores.email = 'El correo es obligatorio.';
  else if (!REGEX_EMAIL.test(email)) errores.email = 'Ingresa un correo válido.';
  if (!password) errores.password = 'La contraseña es obligatoria.';
  return errores;
}

function validarCategoria({ nombre, descripcion }) {
  const errores = {};
  if (!nombre) errores.nombre = 'El nombre de la categoría es obligatorio.';
  else if (nombre.length < 2 || nombre.length > 50) errores.nombre = 'El nombre debe tener entre 2 y 50 caracteres.';
  if (descripcion && descripcion.length > 255) errores.descripcion = 'La descripción no puede superar 255 caracteres.';
  return errores;
}

module.exports = { validarRegistro, validarLogin, validarCategoria };
