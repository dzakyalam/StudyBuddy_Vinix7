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
    if (activeTab !== "semua" && item.role !== activeTab) return false;
    if (searchQuery.trim()) {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
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
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
              <path
                d="M6.5 11C8.98528 11 11 8.98528 11 6.5C11 4.01472 8.98528 2 6.5 2C4.01472 2 2 4.01472 2 6.5C2 8.98528 4.01472 11 6.5 11Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 13L9.67 9.67"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                activeTab === filter.key ? ` ${styles.tabActive}` : ""
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
            <div key={chat.id} className={styles.chatItem}>
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
                        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
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
                <p className={styles.chatMessage}>{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <Navbar />
    </main>
  );
}
