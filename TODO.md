# GELXIT — Pendiente

## Seguridad
- [ ] Cuenta privada aplicada desde el servidor (hoy solo se respeta en la app).
- [ ] Revisar qué columnas de perfiles puede leer cualquiera.
- [ ] Probar baneos, bloqueos y apelaciones con dos cuentas reales.
- [ ] Cambiar el Tailwind por CDN a un CSS propio compilado.

## Producto
- [ ] Barra de abajo: decidir si se quita Inbox para dejar el + al centro.
- [ ] Barra de progreso real al subir videos (hoy es indeterminada).
- [ ] Modo mantenimiento que también cierre la base de datos (hoy solo muestra aviso).

## Código
- [ ] Integrar `gelxit-patch.js` dentro de `app.js`.

- Notificaciones se calculan en el cliente (xits, comentarios y follows hacia tus publicaciones); si crece, mover a tabla `notificaciones` con triggers.
- Color de acento y "visto" de notificaciones viven en localStorage (por dispositivo).
