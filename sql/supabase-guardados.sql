-- Gelxit · Guardar publicaciones. Pégalo completo en Supabase → SQL Editor → Run (se puede repetir).
do $$
declare t text;
begin
  select format_type(a.atttypid, a.atttypmod) into t
  from pg_attribute a
  where a.attrelid = 'public.posts'::regclass and a.attname = 'id' and not a.attisdropped;
  execute format($f$
    create table if not exists public.guardados (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users(id) on delete cascade,
      post_id %s not null references public.posts(id) on delete cascade,
      creado_en timestamptz not null default now(),
      unique (user_id, post_id)
    )$f$, t);
end $$;
create index if not exists guardados_user_idx on public.guardados (user_id, creado_en desc);
alter table public.guardados enable row level security;
revoke all on public.guardados from anon, public;
grant select, insert, delete on public.guardados to authenticated;

drop policy if exists "gx guard ver" on public.guardados;
create policy "gx guard ver" on public.guardados for select to authenticated using (user_id = auth.uid());
drop policy if exists "gx guard crear" on public.guardados;
create policy "gx guard crear" on public.guardados for insert to authenticated
  with check (user_id = auth.uid() and not public.is_banned() and exists (select 1 from public.posts p where p.id = guardados.post_id));
drop policy if exists "gx guard borrar" on public.guardados;
create policy "gx guard borrar" on public.guardados for delete to authenticated using (user_id = auth.uid());

select tablename, policyname from pg_policies where schemaname='public' and policyname like 'gx guard%' order by policyname;
