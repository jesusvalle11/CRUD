// routes/categorias.js — CRUD de categorías (protegido con login)
const express = require('express');
const { all, get, run } = require('../db');
const { requiereLogin } = require('../middlewares/auth');
const { validarCategoria } = require('../validaciones');

const router = express.Router();

// Todas las rutas de este archivo exigen sesión iniciada
router.use(requiereLogin);

const limpiar = (body) => ({
  nombre: (body.nombre || '').trim(),
  descripcion: (body.descripcion || '').trim(),
});

// LEER — listado
router.get('/', async (req, res, next) => {
  try {
    const categorias = await all('SELECT * FROM categorias ORDER BY id DESC');
    res.render('categorias/index', { categorias });
  } catch (err) { next(err); }
});

// CREAR — formulario
router.get('/nueva', (req, res) => {
  res.render('categorias/form', { categoria: {}, errores: {}, accion: '/categorias/nueva', titulo: 'Nueva categoría' });
});

// CREAR — guardar
router.post('/nueva', async (req, res, next) => {
  const categoria = limpiar(req.body);
  const errores = validarCategoria(categoria);
  if (Object.keys(errores).length) {
    return res.status(400).render('categorias/form', { categoria, errores, accion: '/categorias/nueva', titulo: 'Nueva categoría' });
  }
  try {
    await run('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [categoria.nombre, categoria.descripcion]);
    req.session.flash = { tipo: 'exito', mensaje: 'Categoría creada.' };
    res.redirect('/categorias');
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).render('categorias/form', {
        categoria, errores: { nombre: 'Ya existe una categoría con ese nombre.' }, accion: '/categorias/nueva', titulo: 'Nueva categoría',
      });
    }
    next(err);
  }
});

// ACTUALIZAR — formulario
router.get('/editar/:id', async (req, res, next) => {
  try {
    const categoria = await get('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!categoria) {
      req.session.flash = { tipo: 'error', mensaje: 'La categoría no existe.' };
      return res.redirect('/categorias');
    }
    res.render('categorias/form', { categoria, errores: {}, accion: `/categorias/editar/${categoria.id}`, titulo: 'Editar categoría' });
  } catch (err) { next(err); }
});

// ACTUALIZAR — guardar
router.post('/editar/:id', async (req, res, next) => {
  const categoria = { id: req.params.id, ...limpiar(req.body) };
  const accion = `/categorias/editar/${req.params.id}`;
  const errores = validarCategoria(categoria);
  if (Object.keys(errores).length) {
    return res.status(400).render('categorias/form', { categoria, errores, accion, titulo: 'Editar categoría' });
  }
  try {
    const r = await run('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?', [categoria.nombre, categoria.descripcion, req.params.id]);
    req.session.flash = r.cambios
      ? { tipo: 'exito', mensaje: 'Categoría actualizada.' }
      : { tipo: 'error', mensaje: 'La categoría no existe.' };
    res.redirect('/categorias');
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).render('categorias/form', {
        categoria, errores: { nombre: 'Ya existe una categoría con ese nombre.' }, accion, titulo: 'Editar categoría',
      });
    }
    next(err);
  }
});

// ELIMINAR
router.post('/eliminar/:id', async (req, res, next) => {
  try {
    await run('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    req.session.flash = { tipo: 'exito', mensaje: 'Categoría eliminada.' };
    res.redirect('/categorias');
  } catch (err) { next(err); }
});

module.exports = router;
