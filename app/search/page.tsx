"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";

type ViewMode = "list" | "friend_detail" | "mentor_detail";

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<"semua" | "teman" | "mentor">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFriend, setSelectedFriend] = useState<{
    name: string;
    role: string;
    faculty: string;
    major: string;
    bio: string;
    followers: string;
    following: string;
    avatar: string;
  } | null>(null);

  const [selectedMentor, setSelectedMentor] = useState<{
    name: string;
    role: string;
    bio: string;
    followers: string;
    rating: string;
    avatar: string;
  } | null>(null);

  const [connectedFriends, setConnectedFriends] = useState<string[]>([]);

  function toggleConnect(name: string) {
    setConnectedFriends((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // --- VARIATION 1: FRIEND DETAIL VIEW (Node 455:4904) ---
  if (viewMode === "friend_detail" && selectedFriend) {
    const isAdded = connectedFriends.includes(selectedFriend.name);

    return (
      <main className="figma-screen explore-screen">
        <header className="explore-sub-header">
          <button
            type="button"
            className="header-back-arrow"
            onClick={() => setViewMode("list")}
            aria-label="Kembali"
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path
                d="M10 2L2 10L10 18"
                stroke="#070707"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="figma-search-bar flex-1 ml-3">
            <input
              type="search"
              placeholder="Cari"
              defaultValue={selectedFriend.name}
              className="figma-search-input"
            />
            <button type="button" className="figma-search-btn" aria-label="Cari">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
        </header>

        {/* Blue Banner */}
        <div className="friend-banner-bg" />

        {/* Content Body */}
        <div className="friend-profile-body">
          <div className="friend-avatar-wrap">
            <Image
              src={selectedFriend.avatar}
              alt={selectedFriend.name}
              width={100}
              height={100}
              className="friend-avatar-img"
            />
          </div>

          <div className="friend-heading-row">
            <div>
              <h2 className="friend-heading-name">{selectedFriend.name}</h2>
              <p className="friend-heading-role">{selectedFriend.role}</p>
            </div>
            <div className="text-right">
              <p className="friend-faculty-text">{selectedFriend.faculty}</p>
              <p className="friend-major-text">{selectedFriend.major}</p>
            </div>
          </div>

          <p className="friend-bio-paragraph">{selectedFriend.bio}</p>

          <div className="friend-metrics-row">
            <span className="metric-blue-link">{selectedFriend.followers}</span>
            <span className="metric-blue-link ml-4">{selectedFriend.following}</span>
          </div>

          <div className="friend-mutual-row mt-2">
            <span className="text-xs text-gray-500 mr-2">3 teman bersama</span>
            <div className="flex -space-x-2">
              <Image src="/images/figma/mutual_1.png" alt="Mutual 1" width={22} height={22} className="rounded-full border border-white" />
              <Image src="/images/figma/mutual_2.png" alt="Mutual 2" width={22} height={22} className="rounded-full border border-white" />
              <Image src="/images/figma/mutual_3.png" alt="Mutual 3" width={22} height={22} className="rounded-full border border-white" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="friend-action-buttons-grid mt-6">
            <Link href="/chat" className="btn-figma-blue btn-kirim-pesan">
              <span>Kirim Pesan</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <button
              type="button"
              className="btn-figma-blue btn-tambah-teman"
              onClick={() => toggleConnect(selectedFriend.name)}
            >
              <span>{isAdded ? "Tersambung ✓" : "Tambah Teman"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11ZM20 8V14M17 11H23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <Navbar active="Home" />
      </main>
    );
  }

  // --- VARIATION 2: MENTOR DETAIL VIEW (Node 525:662) ---
  if (viewMode === "mentor_detail" && selectedMentor) {
    return (
      <main className="figma-screen explore-screen mentor-detail-screen">
        <header className="explore-sub-header">
          <button
            type="button"
            className="header-back-arrow"
            onClick={() => setViewMode("list")}
            aria-label="Kembali"
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path
                d="M10 2L2 10L10 18"
                stroke="#070707"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="figma-search-bar flex-1 ml-3">
            <input
              type="search"
              placeholder="Cari"
              defaultValue={selectedMentor.name}
              className="figma-search-input"
            />
            <button type="button" className="figma-search-btn" aria-label="Cari">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
        </header>

        {/* Blue Banner */}
        <div className="friend-banner-bg" />

        <div className="mentor-detail-content">
          <div className="friend-avatar-wrap">
            <Image
              src={selectedMentor.avatar}
              alt={selectedMentor.name}
              width={100}
              height={100}
              className="friend-avatar-img"
            />
          </div>

          <div className="mentor-header-info">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="mentor-name-title">{selectedMentor.name}</h2>
                <p className="mentor-role-subtitle">{selectedMentor.role}</p>
              </div>
              <div className="vinix-badge-container flex items-center gap-1">
                <Image
                  src="/images/figma/vinix7_logo.png"
                  alt="Vinix7"
                  width={68}
                  height={22}
                  className="object-contain"
                />
                <span className="text-[10px] font-semibold text-gray-700">PT Vinix Seven Aurum</span>
              </div>
            </div>

            <p className="mentor-bio-text">{selectedMentor.bio}</p>
            <span className="metric-blue-link">{selectedMentor.followers}</span>
          </div>

          {/* Section: Kelas by Frenki Herlambang */}
          <div className="mentor-section-box mt-5">
            <h3 className="section-heading-text">Kelas by {selectedMentor.name}</h3>

            <div className="mentor-courses-scroll mt-3">
              {/* Course Card 1: Figma Web & UI/UX */}
              <div className="course-card-item">
                <div className="course-logo-box">
                  {/* Figma logo vector */}
                  <svg width="24" height="36" viewBox="0 0 38 57" fill="none">
                    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
                    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
                    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
                    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
                    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
                  </svg>
                </div>
                <div className="course-info">
                  <h4 className="course-title">Web & UI/UX Designer</h4>
                  <div className="course-price-row">
                    <span className="price-active">Rp 500.000,00</span>
                    <span className="price-slash">Rp 1.250.000,00</span>
                  </div>
                  <div className="course-footer-row">
                    <span className="course-rating">★ 4.9 ulasan</span>
                    <span className="course-badge-pill">Berakhir dalam 30 hari</span>
                  </div>
                </div>
              </div>

              {/* Course Card 2: Flutter */}
              <div className="course-card-item course-card-mini">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#02569B">
                  <path d="M14.314 0L2.3 12 6 15.7 21.686 0h-7.372zm.056 10.858L7.857 17.37 14.37 23.886h7.33L14.37 16.514l4.886-4.886h-4.886z" fill="#02569B"/>
                </svg>
              </div>
            </div>

            <div className="carousel-control-row">
              <div className="carousel-pills">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <button type="button" className="carousel-link-more">
                Tampilkan semua &gt;&gt;
              </button>
            </div>
          </div>

          {/* Section: Ulasan */}
          <div className="mentor-section-box mt-4 pb-24">
            <h3 className="section-heading-text">Ulasan</h3>

            <div className="reviews-cards-scroll mt-3">
              {/* Review 1: Annisa Onc. */}
              <div className="review-card-item">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/figma/annisa.png"
                    alt="Annisa Onc."
                    width={46}
                    height={46}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h5 className="review-author-name">Annisa Onc.</h5>
                    <p className="review-author-from">Dari : Web & UI/UX Designer</p>
                    <p className="review-author-uni">Universitas Brawijaya</p>
                  </div>
                </div>
                <p className="review-text-content mt-3">
                  Mudah dipahami, bahasa dalam penjelasannya juga tidak terlalu berat untuk dipahami, aku udah bimbingan disini sekarang aku udah mendapatkan paid internship hehe, luar biasaa , rekomend deh pokoknya.
                </p>
              </div>

              {/* Review 2: Bangren */}
              <div className="review-card-item">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/figma/bangren.png"
                    alt="Bangren"
                    width={46}
                    height={46}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h5 className="review-author-name">Bangren</h5>
                    <p className="review-author-from">Dari : Bahasa Python</p>
                    <p className="review-author-uni">Universitas Indonesia</p>
                  </div>
                </div>
                <p className="review-text-content mt-3">
                  Belajar Python di sini jadi jauh lebih terarah! Penjelasannya simpel dan langsung ke praktik buat yang masih pemula.
                </p>
              </div>
            </div>

            <div className="carousel-control-row">
              <div className="carousel-pills">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <button type="button" className="carousel-link-more">
                Tampilkan semua &gt;&gt;
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button: Konsultasi */}
        <div className="fixed-bottom-consult-bar">
          <button
            type="button"
            className="btn-figma-blue btn-konsultasi-full"
            onClick={() => {
              window.location.href = "/chat";
            }}
          >
            Konsultasi
          </button>
        </div>
      </main>
    );
  }

  // --- VARIATION 3: EXPLORE DEFAULT & LIST VIEW (Nodes 335:3338, 331:1447, 331:1177) ---
  const isSearchingNailong = searchQuery.toLowerCase().includes("nailong");

  return (
    <main className="figma-screen explore-screen">
      {/* Top Header */}
      <header className="figma-explore-header">
        <Link href="/home" className="header-back-arrow" aria-label="Kembali">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
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
        <div className="header-spacer" />
      </header>

      <div className="explore-body-content">
        {/* Search Bar with Filter Slider Button */}
        <div className="flex items-center gap-3">
          <div className="figma-search-bar flex-1">
            <input
              type="search"
              placeholder="Cari teman atau mentor (cth: Frenki, Putra, Nailong)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="figma-search-input"
            />
            <button type="button" className="figma-search-btn" aria-label="Cari">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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

          <button
            type="button"
            className="filter-sliders-btn"
            title="Filter"
            onClick={() => {
              if (activeTab === "semua") setActiveTab("mentor");
              else if (activeTab === "mentor") setActiveTab("teman");
              else setActiveTab("semua");
            }}
          >
            <Image
              src="/images/figma/sliders_filter.svg"
              alt="Filter"
              width={22}
              height={22}
            />
          </button>
        </div>

        {/* Filter Tabs: Semua, Teman, Mentor */}
        <div className="figma-filter-tabs mt-4">
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
        </div>

        {/* Content Views */}
        {isSearchingNailong ? (
          /* EMPTY STATE (Node 331:1177) */
          <div className="figma-empty-state-wrap">
            <Image
              src="/images/figma/empty_illustration.png"
              alt="Data Tidak Ditemukan"
              width={180}
              height={180}
              className="empty-state-img"
            />
            <p className="empty-state-text">Data Tidak Ditemukan</p>
          </div>
        ) : (
          <div className="explore-cards-list mt-5">
            {/* MENTOR CARD: Frenki Herlambang (Node 335:3338) */}
            {(activeTab === "semua" || activeTab === "mentor") &&
              (!searchQuery ||
                "frenki herlambang ui/ux mentor web designer"
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())) && (
                <div
                  className="figma-mentor-card"
                  onClick={() => {
                    setSelectedMentor({
                      name: "Frenki Herlambang",
                      role: "Mentor Web & UI/UX Designer",
                      bio: "Full Stack Frontend Developer, five experiences in public entertainment and international Certificate",
                      followers: "1500 Pengikut",
                      rating: "4.9",
                      avatar: "/images/figma/frenki.png",
                    });
                    setViewMode("mentor_detail");
                  }}
                >
                  <div className="mentor-card-avatar-wrap">
                    <Image
                      src="/images/figma/frenki.png"
                      alt="Frenki Herlambang"
                      width={64}
                      height={64}
                      className="mentor-avatar-img"
                    />
                  </div>

                  <div className="mentor-card-info">
                    <div className="flex justify-between items-start">
                      <h3 className="mentor-card-name">Frenki Herlambang</h3>
                      <span className="mentor-star-rating">★ 4.9</span>
                    </div>
                    <p className="mentor-card-sub">Web & UI/UX Designer</p>

                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        className="btn-trial-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMentor({
                            name: "Frenki Herlambang",
                            role: "Mentor Web & UI/UX Designer",
                            bio: "Full Stack Frontend Developer, five experiences in public entertainment and international Certificate",
                            followers: "1500 Pengikut",
                            rating: "4.9",
                            avatar: "/images/figma/frenki.png",
                          });
                          setViewMode("mentor_detail");
                        }}
                      >
                        Free Study Trial 3 days
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* FRIEND CARDS: Arya Putra & Putri Malasari (Node 331:1447) */}
            {(activeTab === "semua" || activeTab === "teman") && (
              <>
                {(!searchQuery ||
                  "arya putra teknologi informasi vokasi"
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) && (
                  <div
                    className="figma-friend-card"
                    onClick={() => {
                      setSelectedFriend({
                        name: "Arya Putra",
                        role: "UI/UX Designer",
                        faculty: "Fakultas Vokasi",
                        major: "Teknologi Infromasi",
                        bio: "Terus melangkah kecil setiap hari untuk membangun masa depan, never give up !!!",
                        followers: "500 Pengikut",
                        following: "300 Mengikuti",
                        avatar: "/images/figma/arya.png",
                      });
                      setViewMode("friend_detail");
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <Image
                          src="/images/figma/arya.png"
                          alt="Arya Putra"
                          width={60}
                          height={60}
                          className="friend-card-avatar"
                        />
                        <div>
                          <h4 className="friend-card-name">Arya Putra</h4>
                          <p className="friend-card-sub">Teknologi Informasi</p>
                          <p className="friend-card-sem">Semester 6</p>
                        </div>
                      </div>

                      <span className="faculty-pill-tag">Vokasi</span>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500">3 teman bersama</span>
                        <div className="flex -space-x-1.5">
                          <Image src="/images/figma/mutual_1.png" alt="1" width={18} height={18} className="rounded-full" />
                          <Image src="/images/figma/mutual_2.png" alt="2" width={18} height={18} className="rounded-full" />
                          <Image src="/images/figma/mutual_3.png" alt="3" width={18} height={18} className="rounded-full" />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-figma-blue btn-add-friend-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleConnect("Arya Putra");
                        }}
                      >
                        {connectedFriends.includes("Arya Putra") ? "Tersambung ✓" : "Tambah Teman"}
                      </button>
                    </div>
                  </div>
                )}

                {(!searchQuery ||
                  "putri malasari adminitrasi filkom vokasi"
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) && (
                  <div
                    className="figma-friend-card mt-3"
                    onClick={() => {
                      setSelectedFriend({
                        name: "Putri Malasari",
                        role: "UI/UX Designer",
                        faculty: "Fakultas Filkom",
                        major: "Adminitrasi",
                        bio: "Belajar bersama untuk mencapai impian karier di industri digital.",
                        followers: "420 Pengikut",
                        following: "280 Mengikuti",
                        avatar: "/images/figma/putri.png",
                      });
                      setViewMode("friend_detail");
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <Image
                          src="/images/figma/putri.png"
                          alt="Putri Malasari"
                          width={60}
                          height={60}
                          className="friend-card-avatar"
                        />
                        <div>
                          <h4 className="friend-card-name">Putri Malasari</h4>
                          <p className="friend-card-sub">Adminitrasi</p>
                          <p className="friend-card-sem">Semester 4</p>
                        </div>
                      </div>

                      <span className="faculty-pill-tag">Filkom</span>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500">3 teman bersama</span>
                        <div className="flex -space-x-1.5">
                          <Image src="/images/figma/mutual_1.png" alt="1" width={18} height={18} className="rounded-full" />
                          <Image src="/images/figma/mutual_2.png" alt="2" width={18} height={18} className="rounded-full" />
                          <Image src="/images/figma/mutual_3.png" alt="3" width={18} height={18} className="rounded-full" />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-figma-blue btn-add-friend-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleConnect("Putri Malasari");
                        }}
                      >
                        {connectedFriends.includes("Putri Malasari") ? "Tersambung ✓" : "Tambah Teman"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <Navbar active="Home" />
    </main>
  );
}
