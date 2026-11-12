-- ============================================================
-- Gelxit · Panel de Dueño: reportes, anuncio global, apelaciones y modo mantenimiento
-- Pégalo completo en Supabase → SQL Editor → Run. Se puede correr más de una vez.
-- Requiere haber corrido antes: supabase-seguridad-2.sql (is_banned) y los SQL anteriores.
-- ============================================================

-- 1) REPORTES: estado y fecha, y solo el dueño/admin puede verlos y cerrarlos
alter table public.reports add column if not exists estado text not null default 'abierto';
alter table public.reports add column if not exists creado_en timestamptz default now();
alter table public.reports add column if not exists resuelto_en timestamptz;
alter table public.reports add column if not exists resuelto_por uuid;
alter table public.reports enable row level security;

drop policy if exists "gx rep admin ver" on public.reports;
create policy "gx rep admin ver" on public.reports for select to authenticated
  using (public.is_admin());
drop policy if exists "gx rep admin editar" on public.reports;
create policy "gx rep admin editar" on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, update on public.reports to authenticated;

-- 2) ANUNCIO GLOBAL
create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  texto text not null check (char_length(btrim(texto)) between 1 and 280),
  activo boolean not null default true,
  creado_por uuid references auth.users(id) on delete set null,
  creado_en timestamptz not null default now()
);
alter table public.anuncios enable row level security;
revoke all on public.anuncios from anon, public;
grant select, insert, update, delete on public.anuncios to authenticated;

drop policy if exists "gx anuncio ver" on public.anuncios;
create policy "gx anuncio ver" on public.anuncios for select to authenticated
  using (activo or public.is_admin());
drop policy if exists "gx anuncio crear" on public.anuncios;
create policy "gx anuncio crear" on public.anuncios for insert to authenticated
  with check (public.is_admin());
drop policy if exists "gx anuncio editar" on public.anuncios;
create policy "gx anuncio editar" on public.anuncios for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "gx anuncio borrar" on public.anuncios;
create policy "gx anuncio borrar" on public.anuncios for delete to authenticated
  using (public.is_admin());

-- 3) APELACIONES (un suspendido puede escribir una; el admin las resuelve)
create table if not exists public.apelaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mensaje text not null check (char_length(btrim(mensaje)) between 1 and 500),
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobada','rechazada')),
  creado_en timestamptz not null default now(),
  resuelto_por uuid,
  resuelto_en timestamptz
);
create unique index if not exists apelaciones_una_pendiente on public.apelaciones (user_id) where estado = 'pendiente';
alter table public.apelaciones enable row level security;
revoke all on public.apelaciones from anon, public;
grant select, insert, update on public.apelaciones to authenticated;

drop policy if exists "gx apel ver" on public.apelaciones;
create policy "gx apel ver" on public.apelaciones for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "gx apel crear" on public.apelaciones;
create policy "gx apel crear" on public.apelaciones for insert to authenticated
  with check (user_id = auth.uid() and estado = 'pendiente' and resuelto_por is null and resuelto_en is null and public.is_banned());
drop policy if exists "gx apel resolver" on public.apelaciones;
create policy "gx apel resolver" on public.apelaciones for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4) MODO MANTENIMIENTO (una sola fila; la puede leer cualquiera, solo el admin la cambia)
create table if not exists public.app_estado (
  id int primary key default 1 check (id = 1),
  mantenimiento boolean not null default false,
  mensaje text not null default 'Estamos mejorando Gelxit. Volvemos en un momento.',
  actualizado_en timestamptz not null default now()
);
insert into public.app_estado (id) values (1) on conflict (id) do nothing;
alter table public.app_estado enable row level security;
revoke all on public.app_estado from anon, public;
grant select on public.app_estado to anon, authenticated;
grant update on public.app_estado to authenticated;

drop policy if exists "gx estado ver" on public.app_estado;
create policy "gx estado ver" on public.app_estado for select to anon, authenticated using (true);
drop policy if exists "gx estado editar" on public.app_estado;
create policy "gx estado editar" on public.app_estado for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Para deshacer:
--   drop table if exists public.app_estado, public.apelaciones, public.anuncios;
--   (los cambios a reports son aditivos y no estorban)

-- Comprobación: deben salir 11 políticas
select tablename, policyname from pg_policies
where schemaname = 'public' and policyname in (
 'gx rep admin ver','gx rep admin editar','gx anuncio ver','gx anuncio crear','gx anuncio editar','gx anuncio borrar',
 'gx apel ver','gx apel crear','gx apel resolver','gx estado ver','gx estado editar')
order by tablename, policyname;
