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
  senderName?: string; // Nama pengirim untuk ditampilkan di grup
  time: string;
};

type ContactInfo = {
  name: string;
  status: string;
  avatar: string;
  isGroup: boolean;
};

type MessageRow = {
  id: number;
  sender_id: number;
  receiver_id: number | null;
  group_id: number | null;
  text: string;
  created_at: string;
  users?: { name: string } | null; // Join tabel users untuk nama pengirim di grup
};

const MESSAGE_COLUMNS = "id, sender_id, receiver_id, group_id, text, created_at";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatRoomContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const slug = params.id; // Bisa berupa angka (personal) atau "group-X" (grup)
  const isGroup = slug.startsWith("group-");
  const targetId = isGroup ? Number(slug.replace("group-", "")) : Number(slug);
  const validTarget = Number.isInteger(targetId) && targetId > 0;

  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [checkingContact, setCheckingContact] = useState(true);
  const [myId, setMyId] = useState<number | null>(null);
  const [chatError, setChatError] = useState("");

  const contactReady = contact !== null;

function toMessage(row: any, me: number): Message {
    const isMe = row.sender_id === me;
    
    const senderObj = row.sender_id;
    const senderName = 
      typeof senderObj === "object" && senderObj !== null && "name" in senderObj
        ? (senderObj as { name: string }).name 
        : "Anggota";

    return {
      id: String(row.id),
      text: row.text,
      sender: isMe ? "me" : "other",
      senderName,
      time: formatTime(row.created_at),
    };
  }

  // 1. Inisialisasi Akun & Data Kontak / Grup
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

      if (!validTarget) {
        setContact(null);
        setCheckingContact(false);
        return;
      }

      if (isGroup) {
        // Ambil data grup
        const { data: group, error } = await supabase
          .from("chat_groups")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();

        if (!error && group) {
          setContact({
            name: group.name,
            status: "Grup Komunitas StudyBuddy",
            avatar: "👥",
            isGroup: true,
          });
        } else {
          setContact(null);
        }
      } else {
        // Ambil data personal teman
        const { data: person, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", targetId)
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
            isGroup: false,
          });
        } else {
          setContact(null);
        }
      }

      setCheckingContact(false);
    }

    initChat();
  }, [slug, isGroup, targetId, validTarget, router]);

  // 2. Ambil Riwayat Pesan & Realtime Listener
  useEffect(() => {
    if (myId === null || !contactReady) return;
    const me: number = myId;
    let cancelled = false;

    async function fetchMessages() {
      let query = supabase.from("chat_messages").select(MESSAGE_COLUMNS);

      if (isGroup) {
        query = query.eq("group_id", targetId);
      } else {
        query = query.or(
          `and(sender_id.eq.${me},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${me})`
        );
      }

      const { data, error } = await query.order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Gagal memuat pesan:", error.message);
        setChatError("Gagal memuat pesan. Coba lagi nanti.");
      } else {
        setMessages(((data ?? []) as unknown as MessageRow[]).map((row) => toMessage(row, me)));
      }
      setLoaded(true);
    }

    fetchMessages();

    // Setup Realtime Channel
    const channelName = isGroup ? `group-${targetId}` : `chat-${me}-${targetId}`;
    const filterCondition = isGroup ? `group_id=eq.${targetId}` : `receiver_id=eq.${me}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: filterCondition,
        },
        async (payload) => {
          const row = payload.new as MessageRow;
          
          // Jika chat personal, pastikan pengirimnya sesuai
          if (!isGroup && row.sender_id !== targetId) return;
          // Jika chat grup, abaikan pesan yang dikirim oleh diri sendiri (karena sudah ditangani saat handleSend)
          if (isGroup && row.sender_id === me) return;

          // Ambil nama pengirim jika chat grup agar realtime-nya akurat
          let senderData = row;
          if (isGroup) {
            const { data: userSender } = await supabase
              .from("users")
              .select("name")
              .eq("id", row.sender_id)
              .maybeSingle();
            senderData = { ...row, users: userSender };
          }

          setMessages((prev) =>
            prev.some((m) => m.id === String(senderData.id))
              ? prev
              : [...prev, toMessage(senderData, me)]
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [myId, targetId, isGroup, contactReady]);

  // 3. Kirim Pesan
  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = message.trim();
    if (!text || myId === null || !contact) return;
    const me: number = myId;

    setMessage("");
    setChatError("");

    const payloadData = isGroup
      ? { sender_id: me, group_id: targetId, receiver_id: null, text }
      : { sender_id: me, receiver_id: targetId, group_id: null, text };

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([payloadData])
      .select(MESSAGE_COLUMNS)
      .single();

    if (error || !data) {
      console.error("Gagal mengirim pesan:", error?.message);
      setChatError("Pesan gagal terkirim. Coba lagi.");
      setMessage(text);
      return;
    }

    const row = data as unknown as MessageRow;
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
        <p style={{ padding: "24px" }}>{chatError || "Kontak atau grup tidak ditemukan."}</p>
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
                {/* Tampilkan nama pengirim jika di dalam chat grup */}
                {contact.isGroup && item.sender === "other" && (
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "#0066cc", display: "block", marginBottom: "2px" }}>
                    {item.senderName}
                  </span>
                )}
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