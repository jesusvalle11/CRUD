// middlewares/auth.js — Protección de rutas

// Solo deja pasar si hay un usuario autenticado
function requiereLogin(req, res, next) {
  if (req.session && req.session.usuario) return next();
  req.session.flash = { tipo: 'error', mensaje: 'Debes iniciar sesión para ver las categorías.' };
  return res.redirect('/login');
}

// Si ya inició sesión, no tiene sentido mostrarle login/registro
function soloInvitados(req, res, next) {
  if (req.session && req.session.usuario) return res.redirect('/categorias');
  return next();
}

module.exports = { requiereLogin, soloInvitados };
