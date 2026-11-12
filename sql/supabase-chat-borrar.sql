-- Gelxit · Borrar mensajes propios y quitar chats de tu bandeja.
-- Pégalo completo en Supabase → SQL Editor → Run (se puede repetir).

-- 1) Cada quien puede borrar SUS mensajes.
grant delete on public.messages to authenticated;
drop policy if exists "gx msg borrar propio" on public.messages;
create policy "gx msg borrar propio" on public.messages for delete to authenticated
  using (user_id = auth.uid());

-- 2) Cada quien puede salirse de un chat (lo deja de ver; la otra persona conserva el suyo).
grant delete on public.chat_members to authenticated;
drop policy if exists "gx miembro salir" on public.chat_members;
create policy "gx miembro salir" on public.chat_members for delete to authenticated
  using (user_id = auth.uid());

-- 3) Cuando ya no queda nadie en un chat, se borran sus mensajes y el chat.
create or replace function public.gx_limpiar_chat() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.chat_members where chat_id = old.chat_id) then
    delete from public.messages where chat_id = old.chat_id;
    delete from public.chats where id = old.chat_id;
  end if;
  return old;
end $$;
revoke all on function public.gx_limpiar_chat() from public, anon, authenticated;
drop trigger if exists gx_limpiar_chat on public.chat_members;
create trigger gx_limpiar_chat after delete on public.chat_members
  for each row execute function public.gx_limpiar_chat();

select tablename, policyname from pg_policies
where schemaname='public' and policyname in ('gx msg borrar propio','gx miembro salir') order by 1,2;
