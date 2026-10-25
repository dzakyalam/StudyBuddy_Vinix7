-- =====================================================
-- OPSIONAL: 2 diskusi contoh supaya Home langsung ada isinya.
-- Jalankan SETELAH discussions_zul.sql.
-- Boleh dilewati kalau mau isi diskusi sendiri lewat Table Editor.
--
-- Hapus lagi contohnya kapan saja:
--   delete from public.discussions
--   where title in (
--     'Fundamental UI/UX Design untuk pemula dan cara penerapannya dalam project live',
--     'Belajar Next.js dari dasar hingga membuat project pertama'
--   );
-- =====================================================

insert into public.discussions
  (title, description, tag, host_name, host_role, starts_at, ends_at)
values
  (
    'Fundamental UI/UX Design untuk pemula dan cara penerapannya dalam project live',
    'Belajar dasar UI/UX bersama teman komunitas dan praktik membuat desain yang lebih menarik.',
    'Diskusi', 'Fresti Herdiansyah', 'UI/UX Designer',
    '2026-10-27 18:00:00+07', '2026-10-27 20:00:00+07'
  ),
  (
    'Belajar Next.js dari dasar hingga membuat project pertama',
    'Kenali routing, komponen, dan cara membangun aplikasi web menggunakan Next.js.',
    'Belajar', 'Andi Pratama', 'Frontend Developer',
    '2026-10-28 19:00:00+07', '2026-10-28 21:00:00+07'
  );
