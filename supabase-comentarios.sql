-- ============================================================
-- Gelxit · Comentarios y "Xits" a comentarios
-- Pégalo completo en Supabase → SQL Editor → Run. Se puede correr más de una vez.
-- Crea: comentarios, comentario_xits (con RLS, límites y bloqueo a usuarios baneados).
-- Requiere haber corrido antes supabase-seguridad-2.sql (usa public.is_banned()).
-- ============================================================

do $$
declare t text;
begin
  select format_type(a.atttypid, a.atttypmod) into t
  from pg_attribute a
  where a.attrelid = 'public.posts'::regclass and a.attname = 'id' and not a.attisdropped;

  execute format($f$
    create table if not exists public.comentarios (
      id uuid primary key default gen_random_uuid(),
      post_id %s not null references public.posts(id) on delete cascade,
      user_id uuid not null references auth.users(id) on delete cascade,
      texto text not null check (char_length(btrim(texto)) between 1 and 500),
      creado_en timestamptz not null default now()
    )$f$, t);
end $$;

create index if not exists comentarios_post_idx on public.comentarios (post_id, creado_en);

create table if not exists public.comentario_xits (
  id uuid primary key default gen_random_uuid(),
  comentario_id uuid not null references public.comentarios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now(),
  unique (comentario_id, user_id)
);
create index if not exists comentario_xits_idx on public.comentario_xits (comentario_id);

alter table public.comentarios enable row level security;
alter table public.comentario_xits enable row level security;

-- Permisos de tabla: solo usuarios con sesión (nada para anon).
revoke all on public.comentarios, public.comentario_xits from anon, public;
grant select, insert, delete on public.comentarios, public.comentario_xits to authenticated;

-- Ver: solo comentarios de publicaciones que el usuario ya puede ver (respeta círculos/privacidad de posts).
drop policy if exists "gx coment ver" on public.comentarios;
create policy "gx coment ver" on public.comentarios for select to authenticated
  using (exists (select 1 from public.posts p where p.id = comentarios.post_id));

-- Comentar: como tú mismo, en publicaciones visibles, y sin estar baneado.
drop policy if exists "gx coment crear" on public.comentarios;
create policy "gx coment crear" on public.comentarios for insert to authenticated
  with check (
    user_id = auth.uid()
    and not public.is_banned()
    and exists (select 1 from public.posts p where p.id = comentarios.post_id)
  );

-- Borrar: tu propio comentario, el dueño de la publicación o un admin.
drop policy if exists "gx coment borrar" on public.comentarios;
create policy "gx coment borrar" on public.comentarios for delete to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.posts p where p.id = comentarios.post_id and p.user_id = auth.uid())
  );

-- Xits a comentarios
drop policy if exists "gx cxit ver" on public.comentario_xits;
create policy "gx cxit ver" on public.comentario_xits for select to authenticated
  using (exists (select 1 from public.comentarios c where c.id = comentario_xits.comentario_id));

drop policy if exists "gx cxit crear" on public.comentario_xits;
create policy "gx cxit crear" on public.comentario_xits for insert to authenticated
  with check (
    user_id = auth.uid()
    and not public.is_banned()
    and exists (select 1 from public.comentarios c where c.id = comentario_xits.comentario_id)
  );

drop policy if exists "gx cxit borrar" on public.comentario_xits;
create policy "gx cxit borrar" on public.comentario_xits for delete to authenticated
  using (user_id = auth.uid());

-- Para deshacer todo:
--   drop table if exists public.comentario_xits;
--   drop table if exists public.comentarios;
