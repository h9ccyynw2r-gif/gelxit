-- ============================================================
-- GELXIT · Endurecimiento de Storage (opcional, seguro correrlo varias veces)
-- Pégalo en Supabase → SQL Editor → Run.
--
-- Qué hace: pone un tope de tamaño y limita los tipos de archivo que acepta cada bucket
-- EN EL SERVIDOR. Hoy esas validaciones solo existen en el navegador y se pueden saltar.
-- Los límites coinciden con los de app.js (5 MB imágenes, 50 MB video/historias, 25 MB audio).
-- Excluye SVG a propósito (puede llevar scripts).
-- Si algo deja de subirse, el error dirá "mime type not supported" o "exceeded the maximum size":
-- ajusta la lista de abajo o corre: update storage.buckets set allowed_mime_types = null where id = '...';
-- ============================================================

update storage.buckets set file_size_limit = 5242800,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','image/avif']
  where id in ('avatars','banners');

update storage.buckets set file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','image/avif','video/*']
  where id in ('posts','historias','chat');

update storage.buckets set file_size_limit = 26214400,
  allowed_mime_types = array['audio/*','video/mp4','video/webm']
  where id = 'audios';

-- Comprobar el resultado:
select id, public, file_size_limit, allowed_mime_types from storage.buckets order by id;
