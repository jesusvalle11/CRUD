# CRUD de Categorías + Registro y Autenticación de Usuarios
Node.js · Express · EJS · SQLite

## Cómo ejecutarlo
```bash
npm install
npm start          # o: node app.js
```
Abrir http://localhost:3000. La base `database.db` se crea sola al arrancar.

## Qué se agregó al CRUD del video
| Pieza | Archivo |
|---|---|
| Tabla `usuarios` (id, nombre, email único, password_hash, intentos_fallidos, bloqueado_hasta, creado_en) | `db.js` |
| Formulario de registro `/registro` | `views/registro.ejs`, `routes/auth.js` |
| Formulario de login `/login` y cierre de sesión `/logout` | `views/login.ejs`, `routes/auth.js` |
| Middleware que protege `/categorias` | `middlewares/auth.js` |
| Reglas de validación del servidor | `validaciones.js` |
| Validación en el navegador | `public/validar.js` |

## Flujo
1. El usuario entra a `/registro` y crea su cuenta.
2. Inicia sesión en `/login`.
3. Solo con sesión activa puede entrar a `/categorias` (crear, listar, editar, eliminar).
4. Si intenta entrar a `/categorias` sin sesión, se le redirige a `/login`.

## Validaciones
**Registro**
- Nombre obligatorio, 3–50 caracteres, solo letras y espacios.
- Correo obligatorio, formato válido, se guarda en minúsculas y **no puede repetirse**.
- Contraseña de 8–64 caracteres, con mayúscula, minúscula y número, sin espacios.
- Confirmación de contraseña igual a la contraseña.
- Si hay errores, el formulario conserva nombre y correo (nunca la contraseña).

**Login**
- Correo y contraseña obligatorios.
- Mensaje genérico “Correo o contraseña incorrectos” (no revela si el correo existe).
- Bloqueo de la cuenta por 15 minutos tras 5 intentos fallidos.

**Seguridad**
- Contraseñas guardadas con hash **bcrypt** (nunca en texto plano).
- Consultas SQL parametrizadas (`?`) contra inyección SQL.
- EJS escapa la salida con `<%= %>` contra XSS.
- Sesión regenerada al iniciar sesión; cookie `httpOnly` y `sameSite=lax`; expira en 1 hora.
- Usuario logueado que visita `/login` o `/registro` es enviado a `/categorias`.
- `Cache-Control: no-store` para que “atrás” no muestre páginas tras cerrar sesión.

**Categorías**
- Nombre obligatorio (2–50) y único; descripción máximo 255 caracteres.
