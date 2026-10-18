// app/lib/room-store.ts
// Manajemen data peserta per room, sinkronisasi localStorage, dan presence antar-tab via BroadcastChannel

import { members as mockMembers, type Member } from "@/app/lib/mock-data";

export interface PresenceMessage {
  type: "hello" | "bye" | "heartbeat";
  member: Member;
  timestamp: number;
}

const STORAGE_PREFIX = "studybuddy_participants_";

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

// Menghapus peserta dari room
export function removeParticipantFromRoom(
  roomId: string,
  memberId: string,
  defaultMembers?: Member[]
): Member[] {
  const current = getRoomParticipants(roomId, defaultMembers);
  const updated = current.filter((m) => m.id !== memberId);
  saveRoomParticipants(roomId, updated);
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
