// app.js — Punto de entrada
const path = require('path');
const express = require('express');
const session = require('express-session');
require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'cambia-este-secreto-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,          // JavaScript del navegador no puede leer la cookie
    sameSite: 'lax',         // mitiga CSRF básico
    maxAge: 1000 * 60 * 60,  // la sesión dura 1 hora
  },
}));

// Variables disponibles en todas las vistas + mensajes flash
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

// Evita que el botón "atrás" muestre páginas protegidas después de cerrar sesión
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/', (req, res) => res.redirect(req.session.usuario ? '/categorias' : '/login'));
app.use('/', require('./routes/auth'));
app.use('/categorias', require('./routes/categorias'));

app.use((req, res) => res.status(404).render('error', { mensaje: 'Página no encontrada.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { mensaje: 'Ocurrió un error en el servidor.' });
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
