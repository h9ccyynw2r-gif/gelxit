-- ============================================================
-- GELXIT · Revisión de seguridad (SOLO LECTURA, no cambia nada)
-- Pégalo en Supabase → SQL Editor → Run.
-- Copia el resultado completo (una sola celda "auditoria") y mándaselo a Claude.
-- ============================================================
select jsonb_pretty(jsonb_build_object(
  'tablas_y_rls', (
    select coalesce(jsonb_agg(jsonb_build_object('tabla', tablename, 'rls', rowsecurity) order by tablename), '[]'::jsonb)
    from pg_tables where schemaname = 'public'),
  'politicas', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'esquema', schemaname, 'tabla', tablename, 'nombre', policyname, 'accion', cmd,
      'roles', roles, 'using', qual, 'with_check', with_check) order by schemaname, tablename, policyname), '[]'::jsonb)
    from pg_policies where schemaname in ('public', 'storage')),
  'buckets', (
    select coalesce(jsonb_agg(jsonb_build_object('id', id, 'publico', public) order by id), '[]'::jsonb)
    from storage.buckets),
  'funciones', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'nombre', p.proname, 'security_definer', p.prosecdef, 'definicion', pg_get_functiondef(p.oid)) order by p.proname), '[]'::jsonb)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'),
  'permisos_anon', (
    select coalesce(jsonb_agg(distinct jsonb_build_object('tabla', table_name, 'permiso', privilege_type)), '[]'::jsonb)
    from information_schema.role_table_grants where grantee = 'anon' and table_schema = 'public')
)) as auditoria;
