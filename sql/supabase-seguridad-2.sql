-- ============================================================
-- GELXIT · Seguridad, parte 2 (cambia el comportamiento: probar con 2 cuentas)
-- Corre primero supabase-seguridad-1.sql. Es seguro correrlo más de una vez.
--
-- Hoy los BANEOS y los BLOQUEOS solo se aplican en la app (en el navegador).
-- Cualquiera puede saltárselos hablando directo con la API. Esto los aplica en el servidor.
-- ============================================================

-- 1) ¿ESTÁ SUSPENDIDO ESTE USUARIO? (respeta la fecha de fin del ban)
create or replace function public.is_banned() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles
                 where id = (select auth.uid()) and baneado = true
                   and (ban_hasta is null or ban_hasta > now()))
$$;
revoke execute on function public.is_banned() from public, anon;
grant execute on function public.is_banned() to authenticated;

-- 2) UN USUARIO SUSPENDIDO NO PUEDE CREAR NADA
--    (las políticas "restrictivas" se suman a las que ya tienes; no las reemplazan)
drop policy if exists "gx ban no publica" on public.posts;
create policy "gx ban no publica" on public.posts as restrictive for insert to authenticated
  with check (not public.is_banned());
drop policy if exists "gx ban no escribe" on public.messages;
create policy "gx ban no escribe" on public.messages as restrictive for insert to authenticated
  with check (not public.is_banned());
drop policy if exists "gx ban no xit" on public.xits;
create policy "gx ban no xit" on public.xits as restrictive for insert to authenticated
  with check (not public.is_banned());
drop policy if exists "gx ban no sigue" on public.follows;
create policy "gx ban no sigue" on public.follows as restrictive for insert to authenticated
  with check (not public.is_banned());
drop policy if exists "gx ban no historia" on public.historias;
create policy "gx ban no historia" on public.historias as restrictive for insert to authenticated
  with check (not public.is_banned());
drop policy if exists "gx ban no live" on public.lives;
create policy "gx ban no live" on public.lives as restrictive for insert to authenticated
  with check (not public.is_banned());

-- 3) UN BLOQUEADO NO PUEDE SEGUIR ESCRIBIÉNDOTE EN UN CHAT DE 2 PERSONAS
--    Hoy create_chat ya impide abrir un chat nuevo, pero en uno existente el bloqueado seguía escribiendo.
--    (En grupos no se aplica: un bloqueo no debe callar al grupo entero.)
create or replace function public.is_blocked_in_chat(p_chat text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.chats c
    join public.chat_members m on m.chat_id = c.id and m.user_id <> (select auth.uid())
    join public.blocked_users b on b.blocker_id = m.user_id and b.blocked_id = (select auth.uid())
    where c.id::text = p_chat and c.es_grupo is not true)
$$;
revoke execute on function public.is_blocked_in_chat(text) from public, anon;
grant execute on function public.is_blocked_in_chat(text) to authenticated;

drop policy if exists "gx bloqueo no escribe" on public.messages;
create policy "gx bloqueo no escribe" on public.messages as restrictive for insert to authenticated
  with check (not public.is_blocked_in_chat(chat_id::text));

-- ------------------------------------------------------------
-- PARA DESHACER TODO ESTO (si algo no sale bien):
--   drop policy if exists "gx ban no publica" on public.posts;
--   drop policy if exists "gx ban no escribe" on public.messages;
--   drop policy if exists "gx ban no xit" on public.xits;
--   drop policy if exists "gx ban no sigue" on public.follows;
--   drop policy if exists "gx ban no historia" on public.historias;
--   drop policy if exists "gx ban no live" on public.lives;
--   drop policy if exists "gx bloqueo no escribe" on public.messages;
-- ------------------------------------------------------------
-- Comprobación: deben aparecer las 7 políticas
select tablename, policyname, permissive from pg_policies
where schemaname = 'public' and (policyname like 'gx ban%' or policyname = 'gx bloqueo no escribe')
order by tablename;
