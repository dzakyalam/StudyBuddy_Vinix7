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

type MessageRow = {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string;
  created_at: string;
};

const MESSAGE_COLUMNS = "id, sender_id, receiver_id, text, created_at";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatRoomContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // id di URL = id baris teman di tabel `users` (angka)
  const otherId = Number(params.id);
  const validId = Number.isInteger(otherId) && otherId > 0;

  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [checkingContact, setCheckingContact] = useState(true);
  const [myId, setMyId] = useState<number | null>(null);
  const [chatError, setChatError] = useState("");

  const contactReady = contact !== null;

  function toMessage(row: MessageRow, me: number): Message {
    return {
      id: String(row.id),
      text: row.text,
      sender: row.sender_id === me ? "me" : "other",
      time: formatTime(row.created_at),
    };
  }

  // 1. Ambil akun yang login (baris `users`) dan data teman yang diajak chat
  useEffect(() => {
    async function initChat() {
      setCheckingContact(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        router.replace("/login");
        return;
      }

      const emailPattern = user.email.replace(/[\\%_]/g, "\\$&");
      const { data: me } = await supabase
        .from("users")
        .select("id")
        .ilike("email", emailPattern)
        .limit(1)
        .maybeSingle();

      if (!me) {
        setChatError("Akun kamu belum terdaftar di tabel users.");
        setContact(null);
        setCheckingContact(false);
        return;
      }
      setMyId(me.id);

      if (!validId) {
        setContact(null);
        setCheckingContact(false);
        return;
      }

      const { data: person, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", otherId)
        .maybeSingle();

      if (!error && person) {
        const name: string = person.name || "Pengguna StudyBuddy";
        const initials = name
          .split(" ")
          .filter(Boolean)
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        setContact({
          name,
          status: person.major || person.prodi || "Teman StudyBuddy",
          avatar: initials || "SB",
        });
      } else {
        setContact(null);
      }

      setCheckingContact(false);
    }

    initChat();
  }, [otherId, validId, router]);

  // 2. Ambil riwayat pesan + dengarkan pesan baru dari teman
  useEffect(() => {
    if (myId === null || !contactReady) return;
    const me: number = myId;
    let cancelled = false;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(MESSAGE_COLUMNS)
        .or(
          `and(sender_id.eq.${me},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${me})`
        )
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Gagal memuat pesan:", error.message);
        setChatError("Gagal memuat pesan. Coba lagi nanti.");
      } else {
        setMessages(((data ?? []) as MessageRow[]).map((row) => toMessage(row, me)));
      }
      setLoaded(true);
    }

    fetchMessages();

    // Pesan yang kita kirim sendiri ditambahkan langsung setelah insert,
    // jadi di sini cukup mendengarkan pesan masuk (receiver = kita).
    const channel = supabase
      .channel(`chat-${me}-${otherId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${me}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          if (row.sender_id !== otherId) return;

          setMessages((prev) =>
            prev.some((m) => m.id === String(row.id))
              ? prev
              : [...prev, toMessage(row, me)]
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, otherId, contactReady]);

  // 3. Kirim pesan
  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = message.trim();
    if (!text || myId === null || !contact) return;
    const me: number = myId;

    setMessage("");
    setChatError("");

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([{ sender_id: me, receiver_id: otherId, text }])
      .select(MESSAGE_COLUMNS)
      .single();

    if (error || !data) {
      console.error("Gagal mengirim pesan:", error?.message);
      setChatError("Pesan gagal terkirim. Coba lagi.");
      setMessage(text);
      return;
    }

    const row = data as MessageRow;
    setMessages((prev) =>
      prev.some((m) => m.id === String(row.id))
        ? prev
        : [...prev, toMessage(row, me)]
    );
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
        <p style={{ padding: "24px" }}>{chatError || "Kontak tidak ditemukan."}</p>
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

      {chatError && (
        <p style={{ padding: "8px 24px", color: "#d93025", fontSize: "13px" }}>
          {chatError}
        </p>
      )}

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