
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import styles from "./chat.module.css";

interface ChatItem {
  id: string;
  name: string;
  role: "teman" | "mentor" | "komunitas";
  avatar: string;
  isGroup?: boolean;
  lastMessage: string;
}

const chatList: ChatItem[] = [
  {
    id: "1",
    name: "Ilham Spautra",
    role: "teman",
    avatar: "/images/figma/ilham.png",
    lastMessage: "You : Kok anaknya ijazahnya isa ngga terverifikasi",
  },
  {
    id: "2",
    name: "Mentor Agus Setiawan",
    role: "mentor",
    avatar: "/images/figma/agus.png",
    lastMessage: "You : Hari ini ada pertemuan ya kak ?",
  },
  {
    id: "3",
    name: "ani",
    role: "teman",
    avatar: "/images/figma/ani.png",
    lastMessage: "You : mau belajar apa aja gw mah ah role kok cuy...",
  },
  {
    id: "4",
    name: "Grup Cyber Security",
    role: "komunitas",
    avatar: "",
    isGroup: true,
    lastMessage: "You : mau belajar apa aja gw mah ah role kok cuy...",
  },
];

const roomIdMap: Record<string, string> = {
  "1": "ilham",
  "2": "mentor-agus",
  "3": "ani",
  "4": "cyber-security",
};

const filters = [
  { key: "semua", label: "Semua" },
  { key: "teman", label: "Teman" },
  { key: "mentor", label: "Mentor" },
  { key: "komunitas", label: "Komunitas" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");

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
            placeholder="Cari"
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
              href={`/chat/${roomIdMap[chat.id]}`}
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
              Kontak tidak ditemukan.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <Navbar />
    </main>
  );
}
