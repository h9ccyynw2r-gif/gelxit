# GELXIT

Red social de Xits (videos, fotos, audios), historias, lives, círculos y chat privado. Aplicación web estática con Supabase como backend.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Pantallas, navegación y overlays |
| `app.css` / `gelxit-fixes.css` | Sistema visual (color predeterminado: aqua `#a0fbfd`) |
| `app.js` | Lógica: autenticación, feed, Xits, chat, historias, lives, perfiles, panel de dueño |
| `gelxit-patch.js` | Ajustes que se cargan después de `app.js` (chat privado, ajustes, avatares) |
| `supabase.sql` | Esquema y políticas de seguridad (parcial, ver nota) |
| `supabase-security-check.sql` | Consulta de solo lectura para auditar la base real |
| `supabase-hardening.sql` | Límites de tamaño y tipo de archivo por bucket (opcional) |
| `_headers` | Evita versiones viejas en caché y agrega cabeceras de seguridad |

## Publicar

Sitio estático en Cloudflare Pages. Si el proyecto está conectado a GitHub, cada commit en `main` se despliega solo. Si se subió a mano, hay que volver a desplegar tras cada cambio.

## Base de datos

Pega `supabase.sql` en Supabase → SQL Editor. Es seguro correrlo más de una vez.
Nota: no incluye todas las tablas (chats, mensajes, posts, follows, etc.) ni las funciones `admin_*`; esas viven solo en el proyecto de Supabase.
Antes de abrir la app al público, corre `supabase-security-check.sql` y revisa las políticas de cada tabla.

## Pendiente

Ver `TODO.md`.
