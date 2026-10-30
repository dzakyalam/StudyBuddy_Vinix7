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

      const emailPattern = user.email.replace(/[\\%_]/g, "\\$&");
      const { data: me, error: meError } = await supabase
        .from("users")
        .select("id")
        .ilike("email", emailPattern)
        .limit(1)
        .maybeSingle();

      if (meError || !me) {
        setErrorMsg("Akun kamu belum terdaftar di tabel users.");
        setLoading(false);
        return;
      }

      // Ambil data teman & grup (sesuai kode asli daftar chat Anda)
      const { data: friendRows } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", me.id);

      const { data: messageRows } = await supabase
        .from("chat_messages")
        .select("sender_id, receiver_id, text, created_at")
        .or(`sender_id.eq.${me.id},receiver_id.eq.${me.id}`)
        .order("created_at", { ascending: false })
        .limit(500);

      const lastByPartner = new Map<number, { text: string; mine: boolean; at: string }>();
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
      const allIds = Array.from(new Set([...friendIds, ...Array.from(lastByPartner.keys())]));

      let loadedChats: { item: ChatItem; at: string }[] = [];

      if (allIds.length > 0) {
        const { data: people } = await supabase
          .from("users")
          .select("*")
          .in("id", allIds);

        if (people) {
          loadedChats = people.map((person) => {
            const major = person.major || person.prodi || person.jurusan || "";
            const last = lastByPartner.get(Number(person.id));

            const item: ChatItem = {
              id: String(person.id),
              name: person.name || person.full_name || "Pengguna StudyBuddy",
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

      // Ambil data grup
      const { data: groupMemberRows } = await supabase
        .from("chat_group_members")
        .select("group_id")
        .eq("user_id", me.id);

      const groupIds = (groupMemberRows ?? []).map((row) => Number(row.group_id));
      let groupChats: { item: ChatItem; at: string }[] = [];

      if (groupIds.length > 0) {
        const { data: groupsData } = await supabase
          .from("chat_groups")
          .select("*")
          .in("id", groupIds);

        if (groupsData) {
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

      const allLoadedChats = [...loadedChats, ...groupChats];
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
    if (activeTab !== "semua" && item.role !== activeTab) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query) || item.lastMessage.toLowerCase().includes(query);
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
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <Image src="/logo/study buddy 1.png" alt="Study Buddy" width={100} height={80} priority />
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.searchBar}>
          <input
            type="search"
            placeholder="Cari berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tabs}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`${styles.tab} ${activeTab === filter.key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {filteredChats.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.slug}`} className={styles.chatItem}>
              <div className={styles.avatarWrap}>
                {chat.isGroup ? <div className={styles.groupAvatar}>👥</div> : <Image src={chat.avatar} alt={chat.name} width={48} height={48} className={styles.avatarImg} />}
              </div>
              <div className={styles.chatContent}>
                <h3 className={styles.chatName}>{chat.name}</h3>
                <p className={styles.chatMessage}>{chat.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Navbar />
    </main>
  );
}