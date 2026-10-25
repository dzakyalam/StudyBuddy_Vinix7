-- =====================================================
-- UP COMING DISCUSSION + JOIN (Modul Home - Tyo)
-- Schema Zul (public.users, id int8). Project: StuddyBuddy-Database
-- Jalankan di Supabase -> SQL Editor.
--
-- Syarat: stories_zul.sql sudah dijalankan (butuh fungsi
-- public.current_user_id()).
-- =====================================================

-- 1. Diskusi
create table if not exists public.discussions (
  id           bigint generated always as identity primary key,
  title        text not null,
  description  text,
  tag          text not null default 'Diskusi',   -- label kecil: Diskusi / Belajar
  host_id      bigint references public.users(id) on delete set null,
  host_name    text,                              -- dipakai kalau host bukan user terdaftar
  host_role    text,                              -- contoh: UI/UX Designer
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  created_at   timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists discussions_starts_at_idx on public.discussions (starts_at);

-- 2. Peserta diskusi (tombol Join)
create table if not exists public.discussion_participants (
  id             bigint generated always as identity primary key,
  discussion_id  bigint not null references public.discussions(id) on delete cascade,
  user_id        bigint not null references public.users(id) on delete cascade,
  joined_at      timestamptz not null default now(),
  unique (discussion_id, user_id)
);

create index if not exists discussion_participants_user_idx
  on public.discussion_participants (user_id);

-- 3. RLS
alter table public.discussions enable row level security;
alter table public.discussion_participants enable row level security;

-- Semua user login boleh melihat diskusi dan daftar peserta (untuk hitung jumlah)
create policy "discussions_select_all"
  on public.discussions for select
  to authenticated
  using (true);

create policy "discussion_participants_select_all"
  on public.discussion_participants for select
  to authenticated
  using (true);

-- Join hanya atas nama sendiri
create policy "discussion_participants_insert_own"
  on public.discussion_participants for insert
  to authenticated
  with check (user_id = public.current_user_id());

-- Keluar (batal join) hanya untuk diri sendiri
create policy "discussion_participants_delete_own"
  on public.discussion_participants for delete
  to authenticated
  using (user_id = public.current_user_id());

-- Membuat diskusi baru: tabel diisi lewat Table Editor / fitur lain,
-- jadi sengaja belum ada policy insert untuk discussions.
