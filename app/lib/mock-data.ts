// app/lib/mock-data.ts
// Data tiruan (mock data) dan definisi tipe untuk StudyBuddy

export interface Room {
  id: string;
  kode: string; // 4 digit kode room (contoh: "2305")
  nama: string;
  kategori: string;
  peserta: number; // jumlah peserta saat ini
  kapasitas: number; // kapasitas maksimal (maksimal 50)
  password: string | null;
  status: "live";
  hostId: string;
}

export interface Member {
  id: string;
  nama: string;
  inisial: string;
  warnaAvatar: string;
  warna?: string; // alias kompatibilitas untuk warna avatar
  micOn: boolean;
  camOn: boolean;
  speaking: boolean;
}

export interface Message {
  id: string;
  pengirimId: string;
  nama: string;
  isi: string;
  waktu: string;
}

export interface Agenda {
  id: string;
  judul: string;
  kategori: string;
  tanggal: string; // Tanggal dalam format ISO (YYYY-MM-DD)
  jamMulai: string;
  jamSelesai: string;
  kodeRoom?: string; // opsional
  catatan?: string;
}

export interface PenggunaAktif {
  id: string;
  nama: string;
}

// Helper untuk menghasilkan tanggal format ISO (YYYY-MM-DD) relatif terhadap hari ini
export function getTanggalRelatif(offsetHari: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetHari);
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const tanggal = String(date.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${tanggal}`;
}

export const getRelativeDate = getTanggalRelatif;

// Helper pengecekan hari ini dan besok
export function isHariIni(tanggalIso: string): boolean {
  return tanggalIso === getTanggalRelatif(0);
}

export function isBesok(tanggalIso: string): boolean {
  return tanggalIso === getTanggalRelatif(1);
}

// 1. Pengguna Aktif
export const penggunaAktif: PenggunaAktif = {
  id: "u1",
  nama: "Zul",
};

export const currentUser = penggunaAktif;

// 2. Kategori Contoh
export const kategoriContoh: string[] = [
  "UI/UX",
  "Cyber Security",
  "Data",
  "Umum",
];

export const categories = kategoriContoh;

// 3. Data Room
export const rooms: Room[] = [
  {
    id: "room-1",
    kode: "2305",
    nama: "UI/UX Design",
    kategori: "UI/UX",
    peserta: 7,
    kapasitas: 10,
    password: null,
    status: "live",
    hostId: "u1",
  },
  {
    id: "room-2",
    kode: "4821",
    nama: "Cyber Security",
    kategori: "Cyber Security",
    peserta: 37,
    kapasitas: 50,
    password: null,
    status: "live",
    hostId: "u3",
  },
];

export const mockRooms = rooms;

// 4. Data 8 Anggota
export const members: Member[] = [
  {
    id: "u1",
    nama: "Max Zul",
    inisial: "MZ",
    warnaAvatar: "#3688F5",
    warna: "#3688F5",
    micOn: true,
    camOn: true,
    speaking: true,
  },
  {
    id: "u2",
    nama: "Putri",
    inisial: "P",
    warnaAvatar: "#EC4899",
    warna: "#EC4899",
    micOn: true,
    camOn: false,
    speaking: false,
  },
  {
    id: "u3",
    nama: "Andreas",
    inisial: "A",
    warnaAvatar: "#10B981",
    warna: "#10B981",
    micOn: false,
    camOn: true,
    speaking: false,
  },
  {
    id: "u4",
    nama: "Frando",
    inisial: "F",
    warnaAvatar: "#F59E0B",
    warna: "#F59E0B",
    micOn: false,
    camOn: false,
    speaking: false,
  },
  {
    id: "u5",
    nama: "Bilah",
    inisial: "B",
    warnaAvatar: "#8B5CF6",
    warna: "#8B5CF6",
    micOn: true,
    camOn: false,
    speaking: true,
  },
  {
    id: "u6",
    nama: "Jii Kan",
    inisial: "JK",
    warnaAvatar: "#06B6D4",
    warna: "#06B6D4",
    micOn: false,
    camOn: true,
    speaking: false,
  },
  {
    id: "u7",
    nama: "Sarah",
    inisial: "S",
    warnaAvatar: "#F43F5E",
    warna: "#F43F5E",
    micOn: true,
    camOn: true,
    speaking: false,
  },
  {
    id: "u8",
    nama: "Reza",
    inisial: "R",
    warnaAvatar: "#6366F1",
    warna: "#6366F1",
    micOn: false,
    camOn: false,
    speaking: false,
  },
];

export const mockMembers = members;

// 5. Data Pesan
export const messages: Message[] = [
  {
    id: "m1",
    pengirimId: "u2",
    nama: "Putri",
    isi: "Halo semuanya! Apakah materi wireframe sudah bisa kita review bersama?",
    waktu: "19:30",
  },
  {
    id: "m2",
    pengirimId: "u3",
    nama: "Andreas",
    isi: "Sudah saya buka file-nya di Figma, struktur layout-nya sudah rapi.",
    waktu: "19:32",
  },
  {
    id: "m3",
    pengirimId: "u1",
    nama: "Max Zul",
    isi: "Bagus sekali! Mari kita fokus pada bagian navigasi dan kartu konten terlebih dahulu.",
    waktu: "19:35",
  },
  {
    id: "m4",
    pengirimId: "u5",
    nama: "Bilah",
    isi: "Saya setuju, terutama untuk kontras warna teks dan tap target tombol aksi.",
    waktu: "19:38",
  },
  {
    id: "m5",
    pengirimId: "u7",
    nama: "Sarah",
    isi: "Link prototype interaktif sudah saya bagikan di sini ya teman-teman 👍",
    waktu: "19:40",
  },
  {
    id: "m6",
    pengirimId: "u1",
    nama: "Max Zul",
    isi: "Terima kasih banyak Sarah! Ayo kita mulai sesi review sekarang.",
    waktu: "19:42",
  },
];

export const mockMessages = messages;

// 6. Data Agenda (Relatif: selalu ada Hari Ini dan Besok)
export const agendas: Agenda[] = [
  {
    id: "ag-1",
    judul: "Zoom bersama mentor",
    kategori: "UI/UX",
    tanggal: getTanggalRelatif(0), // Hari Ini
    jamMulai: "19:00",
    jamSelesai: "20:30",
    kodeRoom: "2305",
    catatan: "Sesi review portofolio desain dan feedback langsung dari mentor industri.",
  },
  {
    id: "ag-2",
    judul: "Diskusi Komunitas",
    kategori: "Cyber Security",
    tanggal: getTanggalRelatif(1), // Besok
    jamMulai: "15:30",
    jamSelesai: "17:00",
    kodeRoom: "4821",
    catatan: "Sharing session dan bedah kasus seputar dasar penetration testing dan bug bounty.",
  },
  {
    id: "ag-3",
    judul: "Tugas Kuliah",
    kategori: "Umum",
    tanggal: getTanggalRelatif(1), // Besok
    jamMulai: "19:30",
    jamSelesai: "21:30",
    kodeRoom: "2305",
    catatan: "Kerja kelompok menyelesaikan laporan project akhir dan presentasi tim.",
  },
];

export const mockAgendas = agendas;
export const daftarAgenda = agendas;
