-- =====================================================
-- HUBUNGKAN JOIN DISKUSI -> JADWAL (public.schedules)
-- Jalankan di Supabase -> SQL Editor, setelah discussions_zul.sql.
--
-- Perubahan di tabel Zul (public.schedules): hanya MENAMBAH 1 kolom
-- nullable, discussion_id. Kolom lain tidak diubah.
-- Kabari Zul sebelum menjalankan ini.
-- =====================================================

-- 1. Kategori diskusi (dipakai sebagai interest_field di jadwal)
alter table public.discussions
  add column if not exists category text;

update public.discussions set category = 'UI/UX'
  where category is null and title like 'Fundamental UI/UX%';
update public.discussions set category = 'Frontend'
  where category is null and title like 'Belajar Next.js%';

-- 2. Penanda jadwal ini berasal dari diskusi mana
--    (supaya bisa dihapus saat user keluar dari diskusi)
alter table public.schedules
  add column if not exists discussion_id bigint
  references public.discussions(id) on delete cascade;

-- Satu user hanya punya satu jadwal per diskusi
create unique index if not exists schedules_user_discussion_uidx
  on public.schedules (user_id, discussion_id)
  where discussion_id is not null;

-- 3. Policy (hanya berpengaruh kalau RLS di schedules AKTIF).
--    Cek status RLS dulu:
--      select relrowsecurity from pg_class where oid = 'public.schedules'::regclass;
--    Kalau hasilnya false, 3 policy di bawah tidak berpengaruh dan aman dijalankan.
create policy "schedules_select_own_tyo"
  on public.schedules for select
  to authenticated
  using (user_id = public.current_user_id());

create policy "schedules_insert_own_tyo"
  on public.schedules for insert
  to authenticated
  with check (user_id = public.current_user_id());

create policy "schedules_delete_own_tyo"
  on public.schedules for delete
  to authenticated
  using (user_id = public.current_user_id());
