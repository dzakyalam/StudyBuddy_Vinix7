// app/lib/room-store.ts
// Manajemen data room & peserta per room, sinkronisasi localStorage, dan presence antar-tab via BroadcastChannel

import { useSyncExternalStore, useCallback } from "react";
import {
  members as mockMembers,
  rooms as initialRooms,
  penggunaAktif,
  type Member,
  type Room,
} from "@/app/lib/mock-data";

export interface PresenceMessage {
  type: "hello" | "bye" | "heartbeat";
  member: Member;
  timestamp: number;
}

/**
 * CATATAN SEMENTARA:
 * Penyimpanan daftar room di localStorage ini adalah solusi state bersama
 * sementara agar sinkronisasi antar halaman (/room-server dan /room) konsisten
 * hingga endpoint backend / API sesungguhnya diintegrasikan.
 */
const ROOMS_STORAGE_KEY = "studybuddy_rooms";
const STORAGE_PREFIX = "studybuddy_participants_";

/**
 * CATATAN SEMENTARA:
 * Penyimpanan daftar kategori di localStorage terpisah dari data room
 * agar kategori bersifat PERMANEN (tidak ikut terhapus ketika room selesai/dihapus).
 * Kategori ini otomatis tersedia di form 'Buat Room' dan filter daftar room
 * sampai endpoint backend / API kategori sesungguhnya tersedia.
 */
const CATEGORIES_STORAGE_KEY = "studybuddy_categories";
export const SEED_CATEGORIES: string[] = [
  "UI/UX Design",
  "Cyber Security",
  "Frontend Web",
];

// Mendapatkan semua kategori dari localStorage (dengan fallback ke SEED_CATEGORIES)
export function getAllCategories(): string[] {
  if (typeof window === "undefined") {
    return SEED_CATEGORIES;
  }
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const unique = Array.from(
          new Set(
            parsed
              .filter(
                (c): c is string => typeof c === "string" && c.trim().length > 0
              )
              .map((c) => c.trim())
          )
        );
        if (unique.length > 0) {
          return unique;
        }
      }
    }
    // Jika belum ada di localStorage, simpan data awal dari SEED_CATEGORIES
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(SEED_CATEGORIES)
    );
  } catch (e) {
    console.error("Gagal membaca daftar kategori dari localStorage:", e);
  }
  return SEED_CATEGORIES;
}

export interface SaveCategoryResult {
  success: boolean;
  category: string;
  error?: string;
}

// Menyimpan kategori baru ke localStorage dengan validasi
export function saveCategory(newCategoryInput: string): SaveCategoryResult {
  const trimmed = (newCategoryInput || "").trim();

  // Validasi: tidak boleh kosong
  if (!trimmed) {
    return {
      success: false,
      category: "",
      error: "Nama kategori tidak boleh kosong.",
    };
  }

  // Validasi: maksimal 30 karakter
  if (trimmed.length > 30) {
    return {
      success: false,
      category: trimmed,
      error: "Nama kategori maksimal 30 karakter.",
    };
  }

  try {
    const currentCategories = getAllCategories();

    // Pengecekan duplikat case-insensitive
    const existing = currentCategories.find(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      // Jika sudah ada, pilih kategori yang sudah ada dan jangan buat dobel
      return {
        success: true,
        category: existing,
      };
    }

    // Tambah kategori baru ke daftar permanen
    const updated = [...currentCategories, trimmed];

    if (typeof window !== "undefined") {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));

      // Emit event agar komponen lain langsung sinkron secara instan
      window.dispatchEvent(
        new CustomEvent("studybuddy_categories_changed", {
          detail: { categories: updated },
        })
      );
    }

    return {
      success: true,
      category: trimmed,
    };
  } catch (e) {
    console.error("Gagal menyimpan kategori ke localStorage:", e);
    return {
      success: false,
      category: trimmed,
      error: "Gagal menyimpan kategori baru.",
    };
  }
}

// Subskripsi perubahan daftar kategori
function subscribeCategories(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("studybuddy_categories_changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("studybuddy_categories_changed", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedCategoriesRaw: string | null = null;
let cachedCategoriesList: string[] = SEED_CATEGORIES;

function getCategoriesSnapshot(): string[] {
  if (typeof window === "undefined") return SEED_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw !== cachedCategoriesRaw) {
      cachedCategoriesRaw = raw;
      cachedCategoriesList = getAllCategories();
    }
  } catch {
    cachedCategoriesList = SEED_CATEGORIES;
  }
  return cachedCategoriesList;
}

function getServerCategoriesSnapshot(): string[] {
  return SEED_CATEGORIES;
}

// Hook reaktif untuk membaca daftar kategori di komponen React secara aman
export function useCategories(): string[] {
  return useSyncExternalStore(
    subscribeCategories,
    getCategoriesSnapshot,
    getServerCategoriesSnapshot
  );
}


// Mendapatkan semua room dari localStorage (dengan fallback ke initialRooms)
export function getAllRooms(): Room[] {
  if (typeof window === "undefined") {
    return initialRooms;
  }
  try {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalisasi dan sanitasi setiap objek room agar tidak ada properti undefined
        const sanitized: Room[] = parsed
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          .map((item, index) => {
            const nama = String(item.nama || item.title || item.name || `Room ${index + 1}`);
            const kode = String(item.kode || item.code || "0000");
            const kategori = String(item.kategori || item.category || "Umum");
            const peserta = typeof item.peserta === "number" ? item.peserta : (Array.isArray(item.participants) ? item.participants.length : 1);
            const kapasitas = typeof item.kapasitas === "number" ? item.kapasitas : (typeof item.maxParticipants === "number" ? item.maxParticipants : 50);
            return {
              id: String(item.id || `room-${Date.now()}-${index}`),
              kode,
              nama,
              kategori,
              peserta,
              kapasitas,
              password: item.password ? String(item.password) : null,
              status: "live" as const,
              hostId: String(item.hostId || "u1"),
            };
          });

        if (sanitized.length > 0) {
          return sanitized;
        }
      }
    }
    // Jika belum ada di localStorage, simpan data awal dari mock-data
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(initialRooms));
  } catch (e) {
    console.error("Gagal membaca daftar room dari localStorage:", e);
  }
  return initialRooms;
}

// Mencari room berdasarkan ID atau 4-digit kode unik
export function getRoomByIdOrCode(
  idOrCode: string | null | undefined
): Room | undefined {
  if (!idOrCode) return undefined;
  const list = getAllRooms();
  const found = list.find((r) => r.id === idOrCode || r.kode === idOrCode);
  if (found) return found;
  return initialRooms.find((r) => r.id === idOrCode || r.kode === idOrCode);
}


// Menyimpan room baru ke localStorage dan memicu pembaruan
export function saveNewRoom(newRoom: Room): Room[] {
  try {
    const currentRooms = getAllRooms();
    const updated = [
      newRoom,
      ...currentRooms.filter(
        (r) => r.id !== newRoom.id && r.kode !== newRoom.kode
      ),
    ];
    if (typeof window !== "undefined") {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(updated));

      // Otomatis daftarkan host sebagai peserta pertama room baru jika belum ada
      const hostMember: Member = {
        id: newRoom.hostId || penggunaAktif.id,
        nama: penggunaAktif.nama,
        inisial: penggunaAktif.nama[0]?.toUpperCase() || "Z",
        warnaAvatar: "#3688F5",
        micOn: false,
        camOn: false,
        speaking: false,
      };
      saveRoomParticipants(newRoom.id, [hostMember]);

      // Emit event agar komponen lain (seperti RoomServerPage) langsung diperbarui
      window.dispatchEvent(
        new CustomEvent("studybuddy_rooms_changed", {
          detail: { rooms: updated },
        })
      );
    }
    return updated;
  } catch (e) {
    console.error("Gagal menyimpan room baru ke localStorage:", e);
    return [newRoom, ...initialRooms];
  }
}

// Subskripsi perubahan daftar room
function subscribeRooms(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("studybuddy_rooms_changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("studybuddy_rooms_changed", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedRoomsRaw: string | null = null;
let cachedRoomsList: Room[] = initialRooms;

function getRoomsSnapshot(): Room[] {
  if (typeof window === "undefined") return initialRooms;
  try {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (raw !== cachedRoomsRaw) {
      cachedRoomsRaw = raw;
      cachedRoomsList = getAllRooms();
    }
  } catch {
    cachedRoomsList = initialRooms;
  }
  return cachedRoomsList;
}

function getServerRoomsSnapshot(): Room[] {
  return initialRooms;
}

// Hook reaktif untuk membaca daftar room di komponen React
export function useRooms(): Room[] {
  return useSyncExternalStore(
    subscribeRooms,
    getRoomsSnapshot,
    getServerRoomsSnapshot
  );
}

// Hook reaktif untuk mencari 1 room berdasarkan ID atau Kode
export function useRoom(idOrCode: string | null | undefined): Room | undefined {
  const roomsList = useRooms();
  if (!idOrCode) return undefined;
  return roomsList.find((r) => r.id === idOrCode || r.kode === idOrCode);
}

// Hook reaktif untuk membaca jumlah peserta suatu room tanpa hydration mismatch
export function useRoomParticipantCount(
  roomId: string,
  fallbackCount: number
): number {
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    function handler() {
      callback();
    }
    window.addEventListener("studybuddy_room_update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("studybuddy_room_update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const getSnapshot = () => getRoomParticipantCount(roomId, fallbackCount);
  const getServerSnapshot = () => fallbackCount;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Mendapatkan daftar peserta untuk room tertentu dari localStorage
export function getRoomParticipants(
  roomId: string,
  defaultMembers?: Member[]
): Member[] {
  try {
    if (typeof window === "undefined") {
      return defaultMembers || [];
    }
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${roomId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Gagal membaca participants dari localStorage:", e);
  }

  // Fallback awal jika localStorage kosong:
  // Untuk room-1 ("UI/UX Design"), ada 7 peserta bawaan (anggota mock selain host lokal Zul/u1)
  if (defaultMembers) return defaultMembers;
  if (roomId === "room-1" || roomId === "2305") {
    return mockMembers.filter((m) => m.id !== "u1");
  }
  return [];
}

// Menyimpan daftar peserta ke localStorage dan mengirim notifikasi lokal
export function saveRoomParticipants(
  roomId: string,
  participants: Member[]
): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `${STORAGE_PREFIX}${roomId}`,
        JSON.stringify(participants)
      );
      // Emit event agar komponen di tab yang sama langsung diperbarui
      window.dispatchEvent(
        new CustomEvent("studybuddy_room_update", {
          detail: { roomId, count: participants.length, participants },
        })
      );
    }
  } catch (e) {
    console.error("Gagal menyimpan participants ke localStorage:", e);
  }
}

// Mendapatkan jumlah peserta untuk room tertentu dari localStorage
export function getRoomParticipantCount(
  roomId: string,
  fallbackCount: number
): number {
  try {
    if (typeof window === "undefined") return fallbackCount;
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${roomId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.length;
      }
    }
  } catch (e) {
    console.error("Gagal membaca jumlah peserta:", e);
  }
  return fallbackCount;
}

// Menambahkan peserta baru ke room
export function addParticipantToRoom(
  roomId: string,
  member: Member,
  defaultMembers?: Member[]
): Member[] {
  const current = getRoomParticipants(roomId, defaultMembers);
  const exists = current.some((m) => m.id === member.id);
  const updated = exists
    ? current.map((m) => (m.id === member.id ? member : m))
    : [member, ...current];
  saveRoomParticipants(roomId, updated);
  return updated;
}

// Menghapus room dari localStorage (khusus room buatan pengguna, bukan room default)
export function deleteRoom(roomId: string): void {
  try {
    // Lindungi room bawaan mock agar tidak terhapus
    const isDefault = initialRooms.some(
      (r) => r.id === roomId || r.kode === roomId
    );
    if (isDefault) return;

    if (typeof window !== "undefined") {
      const currentRooms = getAllRooms();
      const updatedRooms = currentRooms.filter(
        (r) => r.id !== roomId && r.kode !== roomId
      );
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(updatedRooms));
      localStorage.removeItem(`${STORAGE_PREFIX}${roomId}`);

      window.dispatchEvent(
        new CustomEvent("studybuddy_rooms_changed", {
          detail: { rooms: updatedRooms },
        })
      );
    }
  } catch (e) {
    console.error("Gagal menghapus room:", e);
  }
}

// Menghapus peserta dari room
export function removeParticipantFromRoom(
  roomId: string,
  memberId: string,
  defaultMembers?: Member[]
): Member[] {
  const current = getRoomParticipants(roomId, defaultMembers);
  const updated = current.filter((m) => m.id !== memberId);
  saveRoomParticipants(roomId, updated);

  // Opsi A: Jika seluruh peserta telah keluar (jumlah = 0), dan ini adalah room buatan pengguna, hapus otomatis
  if (updated.length === 0) {
    const isDefault = initialRooms.some(
      (r) => r.id === roomId || r.kode === roomId
    );
    if (!isDefault) {
      deleteRoom(roomId);
    }
  }

  return updated;
}


// Presence antar-tab menggunakan BroadcastChannel("studybuddy-room-<id>")
export function setupRoomPresence(
  roomId: string,
  currentMember: Member,
  onPresenceUpdate: (participants: Member[]) => void
): () => void {
  // Pengecekan ketersediaan BroadcastChannel di window
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return () => {};
  }

  const channelName = `studybuddy-room-${roomId}`;
  let channel: BroadcastChannel | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let timeoutCheckInterval: NodeJS.Timeout | null = null;

  // Lacak timestamp terakhir heartbeat dari tab lain
  const lastSeenMap = new Map<string, number>();

  try {
    channel = new BroadcastChannel(channelName);

    // Kirim pesan 'hello' saat pertama kali tab bergabung
    channel.postMessage({
      type: "hello",
      member: currentMember,
      timestamp: Date.now(),
    } as PresenceMessage);

    // Heartbeat berkala setiap 5 detik
    heartbeatInterval = setInterval(() => {
      try {
        channel?.postMessage({
          type: "heartbeat",
          member: currentMember,
          timestamp: Date.now(),
        } as PresenceMessage);
      } catch {
        // Channel mungkin telah tertutup
      }
    }, 5000);

    // Cek timeout 15 detik untuk peserta lain
    timeoutCheckInterval = setInterval(() => {
      const now = Date.now();
      let hasTimeout = false;
      const currentList = getRoomParticipants(roomId);

      const filtered = currentList.filter((m) => {
        // Jangan hapus tab kita sendiri
        if (m.id === currentMember.id) return true;
        const lastSeen = lastSeenMap.get(m.id);
        if (lastSeen && now - lastSeen > 15000) {
          hasTimeout = true;
          return false;
        }
        return true;
      });

      if (hasTimeout) {
        saveRoomParticipants(roomId, filtered);
        onPresenceUpdate(filtered);
      }
    }, 5000);

    // Terima pesan presence dari tab lain
    channel.onmessage = (event: MessageEvent<PresenceMessage>) => {
      const data = event.data;
      if (!data || !data.member) return;

      const { type, member, timestamp } = data;
      // Abaikan pesan yang berasal dari tab sendiri
      if (member.id === currentMember.id) return;

      lastSeenMap.set(member.id, timestamp || Date.now());

      if (type === "hello") {
        // Balas dengan heartbeat agar tab baru segera mendeteksi kehadiran kita
        try {
          channel?.postMessage({
            type: "heartbeat",
            member: currentMember,
            timestamp: Date.now(),
          } as PresenceMessage);
        } catch {
          // Abaikan
        }

        const updated = addParticipantToRoom(roomId, member);
        onPresenceUpdate(updated);
      } else if (type === "heartbeat") {
        const currentList = getRoomParticipants(roomId);
        if (!currentList.some((m) => m.id === member.id)) {
          const updated = addParticipantToRoom(roomId, member);
          onPresenceUpdate(updated);
        }
      } else if (type === "bye") {
        lastSeenMap.delete(member.id);
        const updated = removeParticipantFromRoom(roomId, member.id);
        onPresenceUpdate(updated);
      }
    };
  } catch (e) {
    console.error("Gagal menginisialisasi BroadcastChannel:", e);
  }

  // Fungsi pembersihan (cleanup)
  return () => {
    try {
      if (channel) {
        channel.postMessage({
          type: "bye",
          member: currentMember,
          timestamp: Date.now(),
        } as PresenceMessage);
        channel.close();
      }
    } catch {
      // Abaikan error saat menutup channel
    }
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (timeoutCheckInterval) clearInterval(timeoutCheckInterval);
  };
}
