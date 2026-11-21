// db.js — Conexión a SQLite y creación de tablas
// Usa el módulo SQLite que YA VIENE INCLUIDO en Node.js (node:sqlite),
// así no hay que compilar nada ni instalar la librería sqlite3.
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, 'database.db'));
console.log('Conectado a la base de datos SQLite');

db.exec('PRAGMA foreign_keys = ON');

// Tabla del CRUD original
db.exec(`CREATE TABLE IF NOT EXISTS categorias (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL UNIQUE,
  descripcion TEXT
)`);

// NUEVA tabla de usuarios
db.exec(`CREATE TABLE IF NOT EXISTS usuarios (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre            TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  intentos_fallidos INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta   INTEGER,
  creado_en         TEXT NOT NULL DEFAULT (datetime('now','localtime'))
)`);

// Marca los errores de UNIQUE para que las rutas los reconozcan
function normalizarError(err) {
  if (/constraint/i.test(err.message)) err.code = 'SQLITE_CONSTRAINT';
  return err;
}

// Envoltorios con promesas para usar async/await en las rutas
const ejecutar = (fn) => {
  try { return Promise.resolve(fn()); }
  catch (err) { return Promise.reject(normalizarError(err)); }
};

const run = (sql, params = []) =>
  ejecutar(() => {
    const r = db.prepare(sql).run(...params);
    return { id: Number(r.lastInsertRowid), cambios: Number(r.changes) };
  });

const get = (sql, params = []) => ejecutar(() => db.prepare(sql).get(...params));
const all = (sql, params = []) => ejecutar(() => db.prepare(sql).all(...params));

module.exports = { db, run, get, all };
