-- =====================================================
-- PENCARIAN + TAMBAH TEMAN (schema Zul: public.users, id int8)
-- Project: StuddyBuddy-Database
-- Jalankan di Supabase -> SQL Editor.
--
-- Syarat: stories_zul.sql sudah dijalankan (butuh fungsi
-- public.current_user_id()).
-- =====================================================

-- 1. Pastikan user login boleh membaca daftar pengguna (untuk pencarian).
--    Aman dijalankan ulang.
alter table public.users enable row level security;

drop policy if exists "users_select_authenticated" on public.users;
create policy "users_select_authenticated"
  on public.users for select
  to authenticated
  using (true);

-- 2. Tabel teman (satu arah: user_id menambahkan friend_id)
create table if not exists public.friends (
  id          bigint generated always as identity primary key,
  user_id     bigint not null references public.users(id) on delete cascade,
  friend_id   bigint not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friends_user_id_idx on public.friends (user_id);

-- 3. RLS: hanya boleh lihat / tambah / hapus teman milik sendiri
alter table public.friends enable row level security;

drop policy if exists "friends_select_own" on public.friends;
create policy "friends_select_own"
  on public.friends for select
  to authenticated
  using (user_id = public.current_user_id());

drop policy if exists "friends_insert_own" on public.friends;
create policy "friends_insert_own"
  on public.friends for insert
  to authenticated
  with check (user_id = public.current_user_id());

drop policy if exists "friends_delete_own" on public.friends;
create policy "friends_delete_own"
  on public.friends for delete
  to authenticated
  using (user_id = public.current_user_id());
