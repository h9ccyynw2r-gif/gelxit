-- ============================================================
-- GELXIT · Seguridad, parte 1 (riesgo funcional casi nulo)
-- Pégalo en Supabase → SQL Editor → Run. Es seguro correrlo más de una vez.
-- Basado en la auditoría real de tu base de datos.
-- ============================================================

-- 1) PERMISOS DE TABLAS
--    Las reglas RLS ya protegen los datos, pero los permisos de fábrica de Supabase son
--    demasiado amplios. Aquí se quita lo que la app nunca usa (defensa en profundidad).
revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;
revoke all on public.admin_log from anon, authenticated;  -- solo las funciones admin_* la escriben

-- 2) FUNCIONES SENSIBLES: solo para usuarios con sesión iniciada
revoke execute on function public.admin_ban_user(uuid, integer, text) from public, anon;
revoke execute on function public.admin_set_verification(uuid, text, boolean, text) from public, anon;
revoke execute on function public.admin_unban_user(uuid, text) from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
revoke execute on function public.create_chat(uuid[], text) from public, anon;
grant execute on function public.admin_ban_user(uuid, integer, text) to authenticated;
grant execute on function public.admin_set_verification(uuid, text, boolean, text) to authenticated;
grant execute on function public.admin_unban_user(uuid, text) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.create_chat(uuid[], text) to authenticated;

-- 3) STORAGE: que nadie pueda LISTAR los archivos de los buckets públicos
--    (los enlaces directos a fotos y videos siguen funcionando igual; la app nunca lista archivos).
--    Para deshacerlo: create policy "gx storage leer" on storage.objects for select
--      using (bucket_id in ('avatars','banners','posts','audios','historias','lives'));
drop policy if exists "gx storage leer" on storage.objects;

-- 4) UN XIT / UN SEGUIDOR POR PERSONA (evita inflar contadores desde la API)
--    Si ya hay duplicados, el aviso lo dirá y no se rompe nada.
do $$ begin
  create unique index if not exists xits_post_user_uniq on public.xits (post_id, user_id);
exception when others then raise notice 'xits: no se creó el índice único (%).', sqlerrm; end $$;
do $$ begin
  create unique index if not exists follows_seguidor_seguido_uniq on public.follows (seguidor_id, seguido_id);
exception when others then raise notice 'follows: no se creó el índice único (%).', sqlerrm; end $$;

-- Comprobación: debe devolver 0 filas
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon' and privilege_type <> 'SELECT';
