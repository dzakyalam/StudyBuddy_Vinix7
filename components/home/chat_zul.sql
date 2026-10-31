-- =====================================================
-- CHAT 1-ke-1 (schema Zul: public.users, id int8)
-- Project: StuddyBuddy-Database
-- Jalankan di Supabase -> SQL Editor.
--
-- Syarat:
--   - stories_zul.sql sudah dijalankan (fungsi public.current_user_id())
--   - search_zul.sql sudah dijalankan (tabel public.friends)
--
-- Tabel baru bernama chat_messages supaya tidak bentrok dengan
-- tabel `messages` lama (sender_id-nya UUID).
-- =====================================================

create table if not exists public.chat_messages (
  id           bigint generated always as identity primary key,
  sender_id    bigint not null references public.users(id) on delete cascade,
  receiver_id  bigint not null references public.users(id) on delete cascade,
  text         text not null check (char_length(text) between 1 and 2000),
  created_at   timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create index if not exists chat_messages_pair_idx
  on public.chat_messages (sender_id, receiver_id, created_at);

create index if not exists chat_messages_receiver_idx
  on public.chat_messages (receiver_id, created_at);

-- RLS: hanya pengirim dan penerima yang boleh membaca pesan,
-- dan kirim pesan hanya atas nama sendiri.
alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
  on public.chat_messages for select
  to authenticated
  using (
    sender_id = public.current_user_id()
    or receiver_id = public.current_user_id()
  );

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  to authenticated
  with check (sender_id = public.current_user_id());

-- Realtime: pesan baru muncul tanpa refresh
do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
end $$;
