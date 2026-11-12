-- ============================================================
-- GELXIT · SQL completo — pégalo en Supabase → SQL Editor → Run
-- Es seguro correrlo más de una vez.
-- ============================================================

-- 1) COLUMNAS NUEVAS EN profiles
alter table public.profiles add column if not exists baneado boolean not null default false;
alter table public.profiles add column if not exists es_creador boolean not null default false;
alter table public.profiles add column if not exists verificado_identidad boolean not null default false;
alter table public.profiles add column if not exists verificado_premium boolean not null default false;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists banner_url text;
update public.profiles set avatar_url = foto_url where avatar_url is null and foto_url is not null;

-- 2) ¿QUIÉN ES ADMIN? (solo es_creador = true)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and es_creador = true)
$$;

-- 3) SEGURIDAD: nadie, excepto el admin, puede cambiar baneado / verificaciones / es_creador
--    (desde el SQL Editor o el Dashboard sí puedes, porque ahí auth.uid() es null)
create or replace function public.protect_profile_cols() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.es_creador := false; new.baneado := false;
      new.verificado_identidad := false; new.verificado_premium := false;
    else
      new.es_creador := old.es_creador; new.baneado := old.baneado;
      new.verificado_identidad := old.verificado_identidad; new.verificado_premium := old.verificado_premium;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile before insert or update on public.profiles
  for each row execute function public.protect_profile_cols();

-- El admin puede editar cualquier perfil (verificar, premium, banear)
drop policy if exists "gx admin actualiza perfiles" on public.profiles;
create policy "gx admin actualiza perfiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4) HISTORIAS (24 horas)
create table if not exists public.historias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  tipo text not null default 'foto',
  creado_en timestamptz not null default now(),
  expira_en timestamptz not null default (now() + interval '24 hours')
);
create table if not exists public.historia_vistas (
  id uuid primary key default gen_random_uuid(),
  historia_id uuid not null references public.historias(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  creado_en timestamptz not null default now(),
  unique (historia_id, user_id)
);

-- 5) LIVES
create table if not exists public.lives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text,
  estado text not null default 'en_vivo',
  video_url text,
  creado_en timestamptz not null default now(),
  terminado_en timestamptz
);

alter table public.historias enable row level security;
alter table public.historia_vistas enable row level security;
alter table public.lives enable row level security;

drop policy if exists "gx historias ver" on public.historias;
create policy "gx historias ver" on public.historias for select to authenticated using (expira_en > now() or user_id = auth.uid());
drop policy if exists "gx historias crear" on public.historias;
create policy "gx historias crear" on public.historias for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "gx historias borrar" on public.historias;
create policy "gx historias borrar" on public.historias for delete to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "gx vistas crear" on public.historia_vistas;
create policy "gx vistas crear" on public.historia_vistas for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "gx vistas ver" on public.historia_vistas;
create policy "gx vistas ver" on public.historia_vistas for select to authenticated using (
  user_id = auth.uid() or exists (select 1 from public.historias h where h.id = historia_id and h.user_id = auth.uid()));

drop policy if exists "gx lives ver" on public.lives;
create policy "gx lives ver" on public.lives for select to authenticated using (true);
drop policy if exists "gx lives crear" on public.lives;
create policy "gx lives crear" on public.lives for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "gx lives editar" on public.lives;
create policy "gx lives editar" on public.lives for update to authenticated using (user_id = auth.uid());

-- 6) BUCKETS DE STORAGE (todos públicos para leer)
insert into storage.buckets (id, name, public) values
  ('avatars','avatars',true), ('banners','banners',true), ('posts','posts',true),
  ('audios','audios',true), ('historias','historias',true), ('lives','lives',true)
on conflict (id) do update set public = true;

-- Leer: cualquiera. Subir/editar/borrar: usuario con sesión, SOLO en su carpeta (id-de-usuario/archivo)
drop policy if exists "gx storage leer" on storage.objects;
create policy "gx storage leer" on storage.objects for select
  using (bucket_id in ('avatars','banners','posts','audios','historias','lives'));
drop policy if exists "gx storage subir" on storage.objects;
create policy "gx storage subir" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars','banners','posts','audios','historias','lives') and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "gx storage editar" on storage.objects;
create policy "gx storage editar" on storage.objects for update to authenticated
  using (bucket_id in ('avatars','banners','posts','audios','historias','lives') and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "gx storage borrar" on storage.objects;
create policy "gx storage borrar" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars','banners','posts','audios','historias','lives') and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- 7) REALTIME para el chat
do $$ begin alter publication supabase_realtime add table public.messages; exception when others then null; end $$;

-- 8) OPCIONAL: borrar historias vencidas cada hora (activa primero la extensión pg_cron en Database → Extensions)
-- select cron.schedule('gx-borrar-historias', '0 * * * *', $$ delete from public.historias where expira_en < now() $$);

-- 9) Cuenta de dueño: ya está asignada. NO vuelvas a promover por nombre de usuario:
--    si esa cuenta se borra, quien registre el mismo nombre quedaría como dueño.
--    Si algún día necesitas asignarla de nuevo, hazlo por ID de usuario (Authentication → Users → UID):
-- update public.profiles set es_creador = true where id = 'PEGA-AQUI-EL-UID';
