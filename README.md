# GELXIT

Red social de Xits (videos, fotos, audios), historias, lives, círculos y chat privado. Aplicación web estática con Supabase como backend.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Pantallas, navegación y overlays |
| `app.js` / `app.css` | Lógica y estilos base |
| `gelxit-fixes.css` | Correcciones de estilo (color predeterminado: aqua `#a0fbfd`) |
| `gelxit-patch.js` | Ajustes que se cargan después de `app.js` (chat privado, ajustes, avatares) |
| `gelxit-design.css` | Diseño visual v3 (para volver al anterior, quitar su `<link>`) |
| `gelxit-viewer.js` / `.css` | Visor de publicaciones a pantalla completa, comentarios, Xit en historias y miniaturas |
| `gelxit-motion.js` / `.css` | Pantalla de inicio, animaciones de carga, jalar para actualizar, botón Xit de la barra |
| `gelxit-panel.js` / `.css` | Panel de dueño: reportes, filtros, anuncio, apelaciones y modo mantenimiento |
| `gelxit-chat.js` / `.css` | Borrar mensajes propios y quitar chats de la bandeja |
| `gelxit-social.js` / `.css` | Listas de Seguidores y Siguiendo (con "Se siguen") y conteos reales |
| `gelxit-auth.js` / `.css` | Bienvenida, entrar, crear cuenta y recuperar (mostrar contraseña y medidor de seguridad) |
| `gelxit-logo.jpg` | Logo (también la imagen al compartir el enlace) |
| `_headers` / `_redirects` | Caché, cabeceras de seguridad y bloqueo de la carpeta `sql/` en el sitio |
| `sql/` | Scripts para pegar en Supabase (no forman parte del sitio) |

Al cambiar un archivo, sube el número `?v=` en `index.html` para romper la caché.

## SQL (orden en que se corren; todos se pueden repetir)

1. `sql/supabase.sql` — esquema base (parcial, ver nota)
2. `sql/supabase-seguridad-1.sql` — permisos, funciones y Storage
3. `sql/supabase-hardening.sql` — límites de tamaño y tipo de archivo por bucket
4. `sql/supabase-seguridad-2.sql` — baneos y bloqueos en el servidor
5. `sql/supabase-comentarios.sql` — comentarios y Xits a comentarios
6. `sql/supabase-panel.sql` — reportes, anuncios, apelaciones y modo mantenimiento
7. `sql/supabase-historias-xits.sql` — Xits en historias
8. `sql/supabase-chat-borrar.sql` — borrar mensajes y chats

`sql/supabase-security-check.sql` es una consulta de solo lectura para auditar la base real.
Nota: `supabase.sql` no incluye todas las tablas (chats, mensajes, posts, follows…) ni las funciones `admin_*`; viven solo en el proyecto de Supabase.

## Publicar

Sitio estático en Cloudflare Pages. Cada commit en `main` se despliega solo (tarda aprox. un minuto).

## Pendiente

Ver `TODO.md`.
