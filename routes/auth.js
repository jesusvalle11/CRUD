// routes/auth.js — Registro, inicio y cierre de sesión
const express = require('express');
const bcrypt = require('bcryptjs');
const { get, run } = require('../db');
const { soloInvitados } = require('../middlewares/auth');
const { validarRegistro, validarLogin } = require('../validaciones');

const router = express.Router();

const MAX_INTENTOS = 5;               // intentos fallidos antes de bloquear
const MINUTOS_BLOQUEO = 15;           // tiempo de bloqueo

// ---------- REGISTRO ----------
router.get('/registro', soloInvitados, (req, res) => {
  res.render('registro', { errores: {}, datos: {} });
});

router.post('/registro', soloInvitados, async (req, res, next) => {
  try {
    const datos = {
      nombre: (req.body.nombre || '').trim().replace(/\s+/g, ' '),
      email: (req.body.email || '').trim().toLowerCase(),
      password: req.body.password || '',
      confirmar: req.body.confirmar || '',
    };

    const errores = validarRegistro(datos);

    // Correo único
    if (!errores.email) {
      const existe = await get('SELECT id FROM usuarios WHERE email = ?', [datos.email]);
      if (existe) errores.email = 'Ya existe una cuenta con ese correo.';
    }

    if (Object.keys(errores).length) {
      // Nunca se devuelven las contraseñas al formulario
      return res.status(400).render('registro', { errores, datos: { nombre: datos.nombre, email: datos.email } });
    }

    const hash = await bcrypt.hash(datos.password, 10);
    await run('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)', [datos.nombre, datos.email, hash]);

    req.session.flash = { tipo: 'exito', mensaje: 'Cuenta creada correctamente. Ya puedes iniciar sesión.' };
    res.redirect('/login');
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).render('registro', {
        errores: { email: 'Ya existe una cuenta con ese correo.' },
        datos: { nombre: req.body.nombre, email: req.body.email },
      });
    }
    next(err);
  }
});

// ---------- LOGIN ----------
router.get('/login', soloInvitados, (req, res) => {
  res.render('login', { errores: {}, datos: {} });
});

router.post('/login', soloInvitados, async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const errores = validarLogin({ email, password });

    if (Object.keys(errores).length) {
      return res.status(400).render('login', { errores, datos: { email } });
    }

    const usuario = await get('SELECT * FROM usuarios WHERE email = ?', [email]);
    const ahora = Date.now();

    // Cuenta bloqueada temporalmente
    if (usuario && usuario.bloqueado_hasta && usuario.bloqueado_hasta > ahora) {
      const min = Math.ceil((usuario.bloqueado_hasta - ahora) / 60000);
      return res.status(429).render('login', {
        errores: { general: `Cuenta bloqueada por demasiados intentos. Intenta de nuevo en ${min} minuto(s).` },
        datos: { email },
      });
    }

    const valida = usuario ? await bcrypt.compare(password, usuario.password_hash) : false;

    if (!valida) {
      if (usuario) {
        const intentos = usuario.intentos_fallidos + 1;
        const bloqueo = intentos >= MAX_INTENTOS ? ahora + MINUTOS_BLOQUEO * 60000 : null;
        await run('UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?', [
          bloqueo ? 0 : intentos,
          bloqueo,
          usuario.id,
        ]);
      }
      // Mensaje genérico: no revela si el correo existe o no
      return res.status(401).render('login', {
        errores: { general: 'Correo o contraseña incorrectos.' },
        datos: { email },
      });
    }

    // Login correcto: reiniciar contador
    await run('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?', [usuario.id]);

    // Regenerar la sesión evita la fijación de sesión
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.usuario = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
      req.session.flash = { tipo: 'exito', mensaje: `Bienvenido, ${usuario.nombre}.` };
      res.redirect('/categorias');
    });
  } catch (err) {
    next(err);
  }
});

// ---------- LOGOUT ----------
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/login');
  });
});

module.exports = router;
