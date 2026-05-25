-- Esquema para la app "Diario de Cefaleas".
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase.

create table if not exists public.headache_entries (
  date          date primary key,
  intensidad    text not null check (intensidad in ('leve', 'moderado', 'intenso')),
  tipo          text not null,
  zona          text not null,
  desencadenantes text[] not null default '{}',
  notas         text not null default '',
  updated_at    timestamptz not null default now()
);

-- RLS: en esta app no hay autenticación, así que dejamos lectura/escritura
-- abiertas para la clave anónima. Si quieres aislar por usuario, añade una
-- columna user_id y políticas basadas en auth.uid().
alter table public.headache_entries enable row level security;

drop policy if exists "anon read"  on public.headache_entries;
drop policy if exists "anon write" on public.headache_entries;
drop policy if exists "anon update" on public.headache_entries;
drop policy if exists "anon delete" on public.headache_entries;

create policy "anon read"   on public.headache_entries for select using (true);
create policy "anon write"  on public.headache_entries for insert with check (true);
create policy "anon update" on public.headache_entries for update using (true) with check (true);
create policy "anon delete" on public.headache_entries for delete using (true);
