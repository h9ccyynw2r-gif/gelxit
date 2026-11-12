-- Gelxit · Xits en historias. Pégalo completo en Supabase → SQL Editor → Run (se puede repetir).
do $$
declare t text;
begin
  select format_type(a.atttypid, a.atttypmod) into t
  from pg_attribute a
  where a.attrelid = 'public.historias'::regclass and a.attname = 'id' and not a.attisdropped;
  execute format($f$
    create table if not exists public.historia_xits (
      id uuid primary key default gen_random_uuid(),
      historia_id %s not null references public.historias(id) on delete cascade,
      user_id uuid not null references auth.users(id) on delete cascade,
      creado_en timestamptz not null default now(),
      unique (historia_id, user_id)
    )$f$, t);
end $$;
create index if not exists historia_xits_idx on public.historia_xits (historia_id);
alter table public.historia_xits enable row level security;
revoke all on public.historia_xits from anon, public;
grant select, insert, delete on public.historia_xits to authenticated;

drop policy if exists "gx hxit ver" on public.historia_xits;
create policy "gx hxit ver" on public.historia_xits for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.historias h where h.id = historia_xits.historia_id and h.user_id = auth.uid()) or public.is_admin());
drop policy if exists "gx hxit crear" on public.historia_xits;
create policy "gx hxit crear" on public.historia_xits for insert to authenticated
  with check (user_id = auth.uid() and not public.is_banned() and exists (select 1 from public.historias h where h.id = historia_xits.historia_id));
drop policy if exists "gx hxit borrar" on public.historia_xits;
create policy "gx hxit borrar" on public.historia_xits for delete to authenticated
  using (user_id = auth.uid());

select tablename, policyname from pg_policies where schemaname='public' and policyname like 'gx hxit%' order by policyname;
