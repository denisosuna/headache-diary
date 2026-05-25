-- Esquema para la app "Diario de Cefaleas".
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase.
-- Es idempotente: puedes relanzarlo sin perder datos.

create extension if not exists "pgcrypto";

-- Tabla base (crea con la nueva estructura si no existe).
create table if not exists public.headache_entries (
  id              uuid primary key default gen_random_uuid(),
  date            date not null,
  hora            time null,
  intensidad      text not null check (intensidad in ('leve', 'moderado', 'intenso')),
  tipo            text not null,
  zona            text not null,
  desencadenantes text[] not null default '{}',
  notas           text not null default '',
  updated_at      timestamptz not null default now()
);

-- ---- Migración desde el esquema anterior (cuando `date` era PK) ----

alter table public.headache_entries
  add column if not exists id uuid;

update public.headache_entries
  set id = gen_random_uuid()
  where id is null;

alter table public.headache_entries
  alter column id set not null,
  alter column id set default gen_random_uuid();

-- Cambiar PK a id si aún está sobre date.
do $$
declare
  pk_col text;
begin
  select a.attname into pk_col
  from pg_index i
  join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
  where i.indrelid = 'public.headache_entries'::regclass
    and i.indisprimary
  limit 1;

  if pk_col = 'date' then
    alter table public.headache_entries drop constraint headache_entries_pkey;
    alter table public.headache_entries add primary key (id);
  end if;
end $$;

alter table public.headache_entries
  add column if not exists hora time null;

create index if not exists headache_entries_date_idx
  on public.headache_entries (date desc);

-- ---- RLS abierta para la clave anónima ----
alter table public.headache_entries enable row level security;

drop policy if exists "anon read"   on public.headache_entries;
drop policy if exists "anon write"  on public.headache_entries;
drop policy if exists "anon update" on public.headache_entries;
drop policy if exists "anon delete" on public.headache_entries;

create policy "anon read"   on public.headache_entries for select using (true);
create policy "anon write"  on public.headache_entries for insert with check (true);
create policy "anon update" on public.headache_entries for update using (true) with check (true);
create policy "anon delete" on public.headache_entries for delete using (true);
