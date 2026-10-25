"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import SearchExperience from "@/components/SearchExperience";
import StorySection from "@/components/home/StorySection";

type Discussion = {
  tag: string;
  title: string;
  description: string;
  author: string;
  category: string;
  date: string;
  time: string;
  members: number;
};

const discussions: Discussion[] = [
  {
    tag: "Diskusi",
    title:
      "Fundamental UI/UX Design untuk pemula dan cara penerapannya dalam project live",
    description:
      "Belajar dasar UI/UX bersama teman komunitas dan praktik membuat desain yang lebih menarik.",
    author: "Fresti Herdiansyah",
    category: "UI/UX Designer",
    date: "27 Oktober 2026",
    time: "18:00 - 20:00",
    members: 12,
  },
  {
    tag: "Belajar",
    title: "Belajar Next.js dari dasar hingga membuat project pertama",
    description:
      "Kenali routing, komponen, dan cara membangun aplikasi web menggunakan Next.js.",
    author: "Andi Pratama",
    category: "Frontend Developer",
    date: "28 Oktober 2026",
    time: "19:00 - 21:00",
    members: 8,
  },
];

export default function HomePage() {
  const [discussionIndex, setDiscussionIndex] = useState(0);
  const [joined, setJoined] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  /** Jarak search box Home ke posisi akhir top bar di view pencarian. */
  const [searchEnterOffset, setSearchEnterOffset] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentDiscussion = discussions[discussionIndex];

  /**
   * Ukur posisi search box saat ditekan, supaya view pencarian bisa
   * menganimasikan search box ini "naik" ke atas (bukan pop-up baru).
   */
  function openSearch(event: MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const content = contentRef.current;

    if (content) {
      const contentRect = content.getBoundingClientRect();
      const paddingTop = parseFloat(getComputedStyle(content).paddingTop) || 0;
      // Jangan dibulatkan: selisih 0.5px saja terlihat sebagai "loncatan"
      // kecil saat search box mendarat kembali di posisinya.
      setSearchEnterOffset(
        Number((box.top - contentRect.top - paddingTop).toFixed(2))
      );
    }

    setShowSearch(true);
  }

  function joinDiscussion(title: string) {
    setJoined((previous) =>
      previous.includes(title) ? previous : [...previous, title]
    );
  }

  function createGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = groupName.trim();
    if (!name) return;

    setGroups((previous) => [...previous, name]);
    setGroupName("");
    setShowGroupForm(false);
  }

  return (
    <main className="app-shell">
      {/* Header dengan Logo & Tombol Aksi yang Diperbarui */}
      <header className="home-header">
        <a href="/home" className="brand home-brand flex items-center gap-2">
          <Image
            src="/images/logo study buddy 2.png"
            alt="Study Buddy Logo"
            width={86}
            height={70}
            className="object-contain"
          />
          <span>
            StudyBuddy
            <small>Belajar bersama, tumbuh bersama</small>
          </span>
        </a>

        <div className="header-actions flex items-center gap-2">
          {/* Tombol Buat Grup (Menggunakan gambar tambah grup.jpg) */}
          <button
            className="icon-button flex items-center justify-center"
            aria-label="Buat grup"
            onClick={() => setShowGroupForm(true)}
          >
            <Image
              src="/images/tambah grup.jpg"
              alt="Tambah Grup"
              width={22}
              height={22}
              className="object-contain"
            />
          </button>

          {/* Tombol Notifikasi */}
          <button
            className="icon-button flex items-center justify-center"
            aria-label="Notifikasi"
            onClick={() => alert("Belum ada notifikasi baru.")}
          >
            <Image
              src="/images/Notification.png"
              alt="Notifikasi"
              width={22}
              height={22}
              className="object-contain"
            />
          </button>
        </div>
      </header>

      <div className="home-content" ref={contentRef}>
        {showSearch ? (
          <SearchExperience
            enterOffset={searchEnterOffset}
            onClose={() => setShowSearch(false)}
          />
        ) : (
          <>
        <div className="greeting home-reveal">
          <h1>Halo, Sobat Belajar! 👋</h1>
          <p>Siap berkembang bersama hari ini?</p>
        </div>

        <button
          type="button"
          className="search-box"
          onClick={openSearch}
          aria-label="Cari teman atau mentor"
        >
          <span className="search-box-placeholder">
            Cari komunitas, teman dan topik...
          </span>
          <span className="search-submit" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
          </span>
        </button>

        <StorySection />

        <section className="discussion-section home-reveal">
          <div className="section-title-row">
            <h2>Up Coming Discussion</h2>
            <Link href="/room-server" className="text-link">
              Lihat semuanya ›
            </Link>
          </div>

          {discussions.length === 0 ? (
            <div className="empty-state">
              Tidak ada diskusi yang cocok dengan pencarianmu.
            </div>
          ) : (
            <div className="discussion-list">
              {discussions.map((item) => {
                const isJoined = joined.includes(item.title);

                return (
                  <article
                    className="discussion-card"
                    key={item.title}
                  >
                    <div className="discussion-tags">
                      <span className="tag tag-blue">
                        ◷ {item.date}
                      </span>
                      <span className="tag">{item.tag}</span>
                    </div>

                    <h3>{item.title}</h3>
                    <p className="discussion-description">
                      {item.description}
                    </p>

                    <div className="discussion-author">
                      <div className="author-avatar">👨🏻‍💻</div>
                      <div className="author-info">
                        <strong>{item.author}</strong>
                        <span>{item.category}</span>
                      </div>
                      <button
                        className="btn btn-primary join-button"
                        onClick={() => joinDiscussion(item.title)}
                      >
                        {isJoined ? "Joined ✓" : "Join"}
                      </button>
                    </div>

                    <div className="discussion-meta">
                      <span>👥 {item.members} peserta</span>
                      <span>◷ {item.time}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="carousel-dots">
            {discussions.map((item, index) => (
              <button
                key={item.title}
                className={
                  index === discussionIndex ? "active" : ""
                }
                aria-label={`Tampilkan diskusi ${index + 1}`}
                onClick={() => setDiscussionIndex(index)}
              />
            ))}
          </div>
        </section>

        <section className="add-section home-reveal">
          <button
            className="add-page-card"
            onClick={() => setShowGroupForm(true)}
          >
            <span className="add-circle">+</span>
            <strong>Tambah halaman sesuai keinginanmu</strong>
            <small>Buat ruang belajar baru bersama temanmu</small>
          </button>
        </section>

        {groups.length > 0 && (
          <section className="my-groups home-reveal">
            <h2>Grup Saya</h2>
            {groups.map((group, index) => (
              <div
                className="group-item"
                key={`${group}-${index}`}
              >
                <span>👥</span>
                <strong>{group}</strong>
                <span className="group-status">Grup dibuat</span>
              </div>
            ))}
          </section>
        )}
          </>
        )}
      </div>

      {showGroupForm && (
        <div className="modal-backdrop">
          <form className="group-modal" onSubmit={createGroup}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowGroupForm(false)}
              aria-label="Tutup"
            >
              ×
            </button>

            <div className="feature-icon">👥</div>
            <h2>Buat Grup Belajar</h2>
            <p>
              Buat ruang untuk belajar bersama teman-temanmu.
            </p>

            <label htmlFor="groupName">Nama grup</label>
            <input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Contoh: Belajar UI/UX"
              required
            />

            <button
              type="submit"
              className="btn btn-primary login-submit"
            >
              Buat Grup
            </button>
          </form>
        </div>
      )}

      <Navbar />
    </main>
  );
}
