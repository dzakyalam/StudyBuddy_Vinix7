"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import styles from "./chat-room.module.css";

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
};

type ContactInfo = {
  name: string;
  status: string;
  avatar: string;
};

const staticContacts: Record<string, ContactInfo> = {
  ilham: {
    name: "Ilham Spautra",
    status: "Teman belajar",
    avatar: "IS",
  },
  "mentor-agus": {
    name: "Mentor Agus Setiawan",
    status: "Mentor",
    avatar: "AS",
  },
  ani: {
    name: "ani",
    status: "Teman belajar",
    avatar: "A",
  },
  "cyber-security": {
    name: "Grup Cyber Security",
    status: "Grup diskusi",
    avatar: "CS",
  },
};

function getInitialWelcomeMessage(roomId: string): string {
  return roomId === "cyber-security"
    ? "Selamat datang di grup diskusi Cyber Security!"
    : "Halo! Selamat datang di ruang chat StudyBuddy.";
}

function ChatRoomContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = params.id; // <-- Diperbaiki: Ditambahkan 'const'

  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [checkingContact, setCheckingContact] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 1. Ambil data kontak & Session User saat ini
  useEffect(() => {
    async function initChat() {
      setCheckingContact(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }
      setCurrentUserId(user.id);

      // A. Cek apakah ID ada di kontak statis
      if (roomId && staticContacts[roomId]) {
        setContact(staticContacts[roomId]);
        setCheckingContact(false);
        return;
      }

      // B. Jika tidak ada di statis, ambil dari database Supabase berdasarkan UUID
      if (roomId) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", roomId)
          .maybeSingle();

        if (!error && profile) {
          const name = profile.full_name || profile.name || "Pengguna StudyBuddy";
          const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          setContact({
            name: name,
            status: profile.major || profile.prodi || "Teman StudyBuddy",
            avatar: initials || "SB",
          });
        } else {
          setContact(null);
        }
      }

      setCheckingContact(false);
    }

    initChat();
  }, [roomId, router]);

  // Tentukan Room ID bersama yang konsisten untuk kedua akun
  const isStatic = roomId && staticContacts[roomId];
  const activeRoomId =
    !isStatic && currentUserId
      ? [currentUserId, roomId].sort().join("_")
      : roomId;

  // 2. Ambil riwayat pesan dari tabel 'messages' di Supabase
  useEffect(() => {
    if (!currentUserId || !activeRoomId) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", activeRoomId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        if (data.length === 0) {
          setMessages([
            {
              id: "welcome",
              text: getInitialWelcomeMessage(roomId),
              sender: "other",
              time: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        } else {
          const formatted: Message[] = data.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender_id === currentUserId ? "me" : "other",
            time: new Date(msg.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(formatted);
        }
      }
      setLoaded(true);
    }

    fetchMessages();

    // Realtime subscription menggunakan activeRoomId
    const channel = supabase
      .channel(`room-${activeRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${activeRoomId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                text: newMsg.text,
                sender: newMsg.sender_id === currentUserId ? "me" : "other",
                time: new Date(newMsg.created_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoomId, currentUserId, roomId]);

  // 3. Fungsi Kirim Pesan ke Supabase
  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = message.trim();
    if (!text || !contact || !currentUserId || !activeRoomId) return;

    setMessage("");

    const { error } = await supabase.from("messages").insert([
      {
        room_id: activeRoomId,
        sender_id: currentUserId,
        text: text,
      },
    ]);

    if (error) {
      console.error("Gagal mengirim pesan ke Supabase:", error.message);
    }
  }

  if (checkingContact) {
    return (
      <main className={styles.screen}>
        <p style={{ padding: "24px" }}>Memuat ruang chat...</p>
      </main>
    );
  }

  if (!contact) {
    return (
      <main className={styles.screen}>
        <p style={{ padding: "24px" }}>Kontak tidak ditemukan di database.</p>
        <Link href="/chat" style={{ padding: "0 24px", color: "#0066cc" }}>
          Kembali ke daftar chat
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/chat")}
          aria-label="Kembali ke daftar chat"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className={styles.avatar}>{contact.avatar}</div>

        <div className={styles.contactInfo}>
          <h1 className={styles.contactName}>{contact.name}</h1>
          <p className={styles.contactStatus}>{contact.status}</p>
        </div>
      </header>

      <section className={styles.messages} aria-label="Riwayat pesan">
        <div className={styles.dateLabel}>Percakapan</div>

        {loaded &&
          messages.map((item) => (
            <div
              key={item.id}
              className={`${styles.messageRow} ${
                item.sender === "me" ? styles.myRow : styles.theirRow
              }`}
            >
              <div
                className={`${styles.bubble} ${
                  item.sender === "me" ? styles.myBubble : styles.theirBubble
                }`}
              >
                <p className={styles.messageText}>{item.text}</p>
                <span className={styles.messageTime}>{item.time}</span>
              </div>
            </div>
          ))}
      </section>

      <form className={styles.composer} onSubmit={handleSend}>
        <input
          className={styles.messageInput}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis pesan..."
          aria-label="Tulis pesan"
          autoComplete="off"
        />

        <button
          type="submit"
          className={styles.sendButton}
          disabled={!message.trim()}
          aria-label="Kirim pesan"
        >
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </form>
    </main>
  );
}

export default function ChatRoomPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.screen}>
          <p style={{ padding: "24px" }}>Memuat ruang chat...</p>
        </main>
      }
    >
      <ChatRoomContent />
    </Suspense>
  );
}