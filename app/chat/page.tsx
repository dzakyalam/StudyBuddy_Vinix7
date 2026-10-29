"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { supabase } from "@/app/lib/supabase";
import styles from "./chat.module.css";

interface ChatItem {
  id: string;
  name: string;
  role: "teman" | "mentor" | "komunitas";
  avatar: string;
  isGroup?: boolean;
  lastMessage: string;
  slug: string;
}

const filters = [
  { key: "semua", label: "Semua" },
  { key: "teman", label: "Teman" },
  { key: "mentor", label: "Mentor" },
  { key: "komunitas", label: "Komunitas" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export default function ChatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchChatData() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || !user.email) {
        router.replace("/login");
        return;
      }

      // Cocokkan akun login ke tabel `users` lewat email
      const emailPattern = user.email.replace(/[\\%_]/g, "\\$&");
      const { data: me, error: meError } = await supabase
        .from("users")
        .select("id")
        .ilike("email", emailPattern)
        .limit(1)
        .maybeSingle();

      if (meError || !me) {
        console.error("Akun belum ada di tabel users:", meError?.message);
        setErrorMsg("Akun kamu belum terdaftar di tabel users.");
        setLoading(false);
        return;
      }

      // A. Teman yang sudah kita tambahkan
      const { data: friendRows, error: friendError } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", me.id);

      if (friendError) {
        console.error("Gagal memuat daftar teman:", friendError.message);
        setErrorMsg("Gagal memuat daftar chat. Coba lagi nanti.");
        setLoading(false);
        return;
      }

      // B. Semua pesan pribadi yang melibatkan kita
      const { data: messageRows, error: messageError } = await supabase
        .from("chat_messages")
        .select("sender_id, receiver_id, text, created_at")
        .or(`sender_id.eq.${me.id},receiver_id.eq.${me.id}`)
        .order("created_at", { ascending: false })
        .limit(500);

      if (messageError) {
        console.error("Gagal memuat riwayat pesan:", messageError.message);
      }

      // Pesan terakhir per lawan bicara
      const lastByPartner = new Map<
        number,
        { text: string; mine: boolean; at: string }
      >();
      (messageRows ?? []).forEach((row) => {
        const mine = Number(row.sender_id) === me.id;
        const partnerId = Number(mine ? row.receiver_id : row.sender_id);
        if (!lastByPartner.has(partnerId)) {
          lastByPartner.set(partnerId, {
            text: String(row.text ?? ""),
            mine,
            at: String(row.created_at ?? ""),
          });
        }
      });

      const friendIds = (friendRows ?? []).map((row) => Number(row.friend_id));
      const allIds = Array.from(
        new Set([...friendIds, ...Array.from(lastByPartner.keys())])
      );

      let loadedChats: { item: ChatItem; at: string }[] = [];

      if (allIds.length > 0) {
        const { data: people, error: peopleError } = await supabase
          .from("users")
          .select("*")
          .in("id", allIds);

        if (!peopleError && people) {
          loadedChats = people.map((person) => {
            const major = person.major || person.prodi || person.jurusan || "";
            const last = lastByPartner.get(Number(person.id));

            const item: ChatItem = {
              id: String(person.id),
              name: person.name || "Pengguna StudyBuddy",
              role: "teman",
              avatar: person.avatar_url || "/images/figma/ilham.png",
              isGroup: false,
              lastMessage: last
                ? `${last.mine ? "Kamu: " : ""}${last.text}`
                : major
                ? `Jurusan: ${major}`
                : "Teman StudyBuddy",
              slug: String(person.id),
            };
            return { item, at: last?.at ?? "" };
          });
        }
      }

      // C. Ambil data grup tempat user tergabung
      const { data: groupMemberRows } = await supabase
        .from("chat_group_members")
        .select("group_id")
        .eq("user_id", me.id);

      const groupIds = (groupMemberRows ?? []).map((row) => Number(row.group_id));
      let groupChats: { item: ChatItem; at: string }[] = [];

      if (groupIds.length > 0) {
        const { data: groupsData, error: groupsError } = await supabase
          .from("chat_groups")
          .select("*")
          .in("id", groupIds);

        if (!groupsError && groupsData) {
          const { data: groupMsgRows } = await supabase
            .from("chat_messages")
            .select("group_id, text, created_at")
            .in("group_id", groupIds)
            .order("created_at", { ascending: false });

          const lastByGroup = new Map<number, { text: string; at: string }>();
          (groupMsgRows ?? []).forEach((row) => {
            if (row.group_id && !lastByGroup.has(Number(row.group_id))) {
              lastByGroup.set(Number(row.group_id), {
                text: String(row.text ?? ""),
                at: String(row.created_at ?? ""),
              });
            }
          });

          groupChats = groupsData.map((group) => {
            const last = lastByGroup.get(Number(group.id));
            const item: ChatItem = {
              id: `group-${group.id}`,
              name: group.name,
              role: "komunitas",
              avatar: group.avatar_url || "/images/figma/ilham.png",
              isGroup: true,
              lastMessage: last ? last.text : "Grup baru dibuat",
              slug: `group-${group.id}`,
            };
            return { item, at: last?.at ?? "" };
          });
        }
      }

      // D. Gabungkan chat pribadi dan chat grup
      const allLoadedChats = [...loadedChats, ...groupChats];

      // Urutkan berdasarkan pesan terbaru, lalu nama
      allLoadedChats.sort((x, y) => {
        if (x.at && y.at) return y.at.localeCompare(x.at);
        if (x.at) return -1;
        if (y.at) return 1;
        return x.item.name.localeCompare(y.item.name);
      });

      setChatList(allLoadedChats.map((entry) => entry.item));
      setLoading(false);
    }

    fetchChatData();
  }, [router]);

  const filteredChats = chatList.filter((item) => {
    if (activeTab !== "semua" && item.role !== activeTab) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      return (
        item.name.toLowerCase().includes(query) ||
        item.lastMessage.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <main className={styles.screen}>
        <div style={{ padding: "2rem", textAlign: "center" }}>Memuat daftar chat...</div>
        <Navbar />
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <Image
            src="/logo/study buddy 1.png"
            alt="Study Buddy"
            width={160}
            height={48}
            className={styles.logo}
            priority
          />
        </div>

        <div className={styles.headerActions}>
          <Link
            href="/search"
            className={styles.iconButton}
            title="Tambah Teman"
            aria-label="Tambah Teman"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 21V19C16 16.79 14.21 15 12 15H5C2.79 15 1 16.79 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="8.5"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M20 8V14M17 11H23"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <button
            type="button"
            className={styles.iconButton}
            title="Notifikasi"
            aria-label="Notifikasi"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type="search"
            placeholder="Cari berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Cari kontak"
          />

          <button
            type="button"
            className={styles.searchButton}
            aria-label="Cari"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M10 10L13 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className={styles.tabs}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`${styles.tab}${
                activeTab === filter.key
                  ? ` ${styles.tabActive}`
                  : ""
              }`}
              onClick={() => setActiveTab(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className={styles.list}>
          {filteredChats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.slug}`}
              className={styles.chatItem}
            >
              <div className={styles.avatarWrap}>
                {chat.isGroup ? (
                  <div className={styles.groupAvatar}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M23 21V19C23 17.2 21.8 15.7 20 15.2M16 3.2C17.8 3.7 19 5.2 19 7S17.8 10.3 16 10.8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <Image
                    src={chat.avatar}
                    alt={chat.name}
                    width={48}
                    height={48}
                    className={styles.avatarImg}
                  />
                )}
              </div>

              <div className={styles.chatContent}>
                <h3 className={styles.chatName}>{chat.name}</h3>
                <p className={styles.chatMessage}>
                  {chat.lastMessage}
                </p>
              </div>
            </Link>
          ))}

          {filteredChats.length === 0 && (
            <p className={styles.emptySearch}>
              {errorMsg ||
                (chatList.length === 0
                  ? "Belum ada chat. Tambahkan teman lewat ikon di kanan atas."
                  : "Tidak ada chat yang cocok.")}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <Navbar />
    </main>
  );
}