
"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./chat-room.module.css";

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
};

const contacts: Record<
  string,
  { name: string; status: string; avatar: string }
> = {
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

function getInitialMessages(roomId: string): Message[] {
  const now = new Date();
  const time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const text =
    roomId === "cyber-security"
      ? "Selamat datang di grup diskusi Cyber Security!"
      : "Halo! Selamat datang di ruang chat StudyBuddy.";

  return [
    {
      id: "welcome",
      text,
      sender: "other",
      time,
    },
  ];
}

function ChatRoomContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = params.id;
  const contact = contacts[roomId];

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  const storageKey = `studybuddy-chat-${roomId}`;

  useEffect(() => {
    if (!contact) {
      router.replace("/chat");
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        setMessages(JSON.parse(saved) as Message[]);
      } else {
        setMessages(getInitialMessages(roomId));
      }
    } catch {
      setMessages(getInitialMessages(roomId));
    }

    setLoaded(true);
  }, [roomId, storageKey, contact, router]);

  useEffect(() => {
    if (loaded && contact) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, loaded, storageKey, contact]);

  function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = message.trim();

    if (!text || !contact) return;

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      sender: "me",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previous) => [...previous, newMessage]);
    setMessage("");
  }

  if (!contact) {
    return (
      <main className={styles.screen}>
        <p>Kontak tidak ditemukan. Mengarahkan kembali ke chat...</p>
        <Link href="/chat">Kembali ke daftar chat</Link>
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
          <p style={{ padding: "24px" }}>
            Memuat ruang chat...
          </p>
        </main>
      }
    >
      <ChatRoomContent />
    </Suspense>
  );
}