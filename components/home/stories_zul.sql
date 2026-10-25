-- =====================================================
-- STORIES untuk schema Zul (tabel public.users, id int8)
-- Project: StuddyBuddy-Database
-- Jalankan di Supabase -> SQL Editor.
-- JANGAN jalankan stories.sql yang lama di project ini.
--
-- Akun yang login (Supabase Auth) dicocokkan ke public.users
-- lewat EMAIL, sesuai kesepakatan dengan Zul.
-- =====================================================

-- 0. Helper: id baris public.users milik akun yang sedang login
create or replace function public.current_user_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.users
  where lower(email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

grant execute on function public.current_user_id() to authenticated;

-- 1. Tabel stories
create table if not exists public.stories (
  id          bigint generated always as identity primary key,
  user_id     bigint not null references public.users(id) on delete cascade,
  media_url   text not null,              -- URL gambar di Storage
  media_path  text not null,              -- path file di bucket (buat hapus)
  caption     text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '24 hours')
);

create index if not exists stories_user_id_idx    on public.stories (user_id);
create index if not exists stories_expires_at_idx on public.stories (expires_at);

-- 2. Row Level Security
alter table public.stories enable row level security;

-- Semua user login boleh lihat story yang belum expired
create policy "stories_select_active"
  on public.stories for select
  to authenticated
  using (expires_at > now());

-- Hanya boleh upload story atas nama sendiri
create policy "stories_insert_own"
  on public.stories for insert
  to authenticated
  with check (user_id = public.current_user_id());

-- Hanya boleh hapus story sendiri
create policy "stories_delete_own"
  on public.stories for delete
  to authenticated
  using (user_id = public.current_user_id());

-- 3. Storage bucket (public biar gambar bisa dibuka lewat URL)
insert into storage.buckets (id, name, public)
values ('stories', 'stories', true)
on conflict (id) do nothing;

create policy "stories_storage_read"
  on storage.objects for select
  using (bucket_id = 'stories');

-- Upload hanya ke folder sendiri: <users.id>/namafile
create policy "stories_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'stories'
    and (storage.foldername(name))[1] = public.current_user_id()::text
  );

create policy "stories_storage_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'stories'
    and (storage.foldername(name))[1] = public.current_user_id()::text
  );

-- =====================================================
-- CEK DENGAN ZUL: kalau RLS di tabel public.users AKTIF dan
-- belum ada policy select, nama/foto teman tidak akan muncul di Story.
-- Policy yang dibutuhkan (jalankan hanya kalau Zul setuju):
--
-- create policy "users_select_authenticated"
--   on public.users for select
--   to authenticated
--   using (true);
-- =====================================================
