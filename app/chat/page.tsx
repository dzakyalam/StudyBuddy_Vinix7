"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";

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

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<"semua" | "teman" | "mentor" | "komunitas">("semua");
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
    <main className="figma-screen chat-screen">
      {/* Top Header */}
      <header className="figma-chat-header">
        <Link href="/home" className="header-back-arrow" aria-label="Kembali">
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2L2 10L10 18"
              stroke="#070707"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className="figma-chat-logo-wrap">
          <Image
            src="/images/figma/logo_study_buddy.png"
            alt="Study Buddy"
            width={112}
            height={52}
            className="figma-chat-logo"
            priority
          />
        </div>

        <div className="figma-chat-header-actions">
          {/* Add User Icon */}
          <button
            type="button"
            className="header-icon-action"
            title="Tambah Teman"
            onClick={() => (window.location.href = "/search")}
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
                stroke="#2e90fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                stroke="#2e90fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 8V14M17 11H23"
                stroke="#2e90fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Notification Bell Icon */}
          <button
            type="button"
            className="header-icon-action"
            title="Notifikasi"
            onClick={() => alert("Belum ada notifikasi baru.")}
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
                stroke="#2e90fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="chat-body-content">
        {/* Search Bar */}
        <div className="figma-search-bar">
          <input
            type="search"
            placeholder="Cari"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="figma-search-input"
          />
          <button
            type="button"
            className="figma-search-btn"
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
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 13L9.67 9.67"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="figma-filter-tabs">
          <button
            type="button"
            className={`tab-item ${activeTab === "semua" ? "active" : ""}`}
            onClick={() => setActiveTab("semua")}
          >
            Semua
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === "teman" ? "active" : ""}`}
            onClick={() => setActiveTab("teman")}
          >
            Teman
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === "mentor" ? "active" : ""}`}
            onClick={() => setActiveTab("mentor")}
          >
            Mentor
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === "komunitas" ? "active" : ""}`}
            onClick={() => setActiveTab("komunitas")}
          >
            Komunitas
          </button>
        </div>

        {/* Conversation List */}
        <div className="figma-conversation-list">
          {filteredChats.map((chat) => (
            <div key={chat.id} className="figma-chat-item">
              <div className="chat-item-avatar-wrap">
                {chat.isGroup ? (
                  <div className="chat-item-group-avatar">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                        stroke="#2e90fa"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                        stroke="#2e90fa"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
                        stroke="#2e90fa"
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
                    width={50}
                    height={50}
                    className="chat-item-avatar-img"
                  />
                )}
              </div>

              <div className="chat-item-content">
                <h3 className="chat-item-name">{chat.name}</h3>
                <p className="chat-item-msg">{chat.lastMessage}</p>
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
