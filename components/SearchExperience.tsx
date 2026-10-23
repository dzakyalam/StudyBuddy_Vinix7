"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import ProfileDetail, {
  type ProfileDetailData,
} from "@/components/ProfileDetail";
import { supabase } from "@/app/lib/supabase";
import styles from "./SearchExperience.module.css";

type FilterKey = "semua" | "teman" | "mentor";

type Person = {
  id: string;
  name: string;
  role: string;
  major: string;
  semester: string;
  category: string;
  avatar: string;
  facultyTitle: string;
  facultySub: string;
  followers: string;
  following: string;
  bio: string;
  sheetBio: string;
  university: string;
  detailMajor: string;
  detailSemester: string;
  skills: string[][];
  keywords: string;
};

// Data mentor rekomendasi (Statis/Dummy)
const mentor: ProfileDetailData = {
  name: "Frenki Herlambang",
  role: "Mentor Web & UI/UX Designer",
  avatar: "/images/figma/frenki.png",
  bio: "Full Stack Frontend Developer, five experiences in public entertainment and international Certificate",
  followers: "1500 Pengikut",
};

const mentorKeywords =
  "frenki herlambang ui/ux mentor web designer frontend developer";

const filters: { key: FilterKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "teman", label: "Teman" },
  { key: "mentor", label: "Mentor" },
];

export default function SearchExperience({
  onClose,
  enterOffset = 0,
}: {
  onClose?: () => void;
  enterOffset?: number;
}) {
  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showMentorDetail, setShowMentorDetail] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);
  const [dbPeople, setDbPeople] = useState<Person[]>([]);
  const [closing, setClosing] = useState(false);
  const [quickPerson, setQuickPerson] = useState<Person | null>(null);
  const [sheetClosing, setSheetClosing] = useState(false);
  
  const sheetCloseTimer = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeFallback = useRef<number | null>(null);
  const closeDone = useRef(false);

  // 1. Ambil data Pengguna Asli dan Daftar Kontak dari Supabase
  useEffect(() => {
    async function loadSearchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // A. Fetch Kontak yang sudah tersambung
        const { data: contactsData } = await supabase
          .from("contacts")
          .select("contact_name")
          .eq("user_id", user.id);

        if (contactsData) {
          setConnected(contactsData.map((c) => c.contact_name));
        }

        // B. Fetch Seluruh Profil Pengguna Lain dari Database Supabase
        const { data: profilesData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", user.id); // Jangan tampilkan diri sendiri di hasil pencarian

        if (!profileErr && profilesData) {
          const mappedPeople: Person[] = profilesData.map((p) => {
            const fullName = p.full_name || p.name || "Pengguna StudyBuddy";
            const majorStr = p.major || p.prodi || "Belum diisi";
            const facultyStr = p.faculty || p.fakultas || "Umum";
            const semStr = p.semester ? `Semester ${p.semester}` : "Semester -";

            return {
              id: p.id,
              name: fullName,
              role: majorStr,
              major: majorStr,
              semester: semStr,
              category: facultyStr,
              avatar: p.avatar_url || p.foto || "/images/figma/arya.png",
              facultyTitle: facultyStr,
              facultySub: majorStr,
              followers: "100 Pengikut",
              following: "50 Mengikuti",
              bio: "Mari belajar dan berdiskusi bersama di StudyBuddy!",
              sheetBio: `${fullName} adalah mahasiswa ${majorStr} di ${facultyStr}.`,
              university: "Universitas Brawijaya",
              detailMajor: majorStr,
              detailSemester: p.semester ? String(p.semester) : "-",
              skills: [["UIUX", "Frontend"], ["Design"]],
              keywords: `${fullName.toLowerCase()} ${majorStr.toLowerCase()} ${facultyStr.toLowerCase()}`,
            };
          });

          setDbPeople(mappedPeople);
        }
      } catch (err) {
        console.error("Gagal memuat data pencarian dari Supabase:", err);
      }
    }

    loadSearchData();
  }, []);

  function requestClose() {
    if (closing || !onClose) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    closeDone.current = false;
    setClosing(true);
    closeFallback.current = window.setTimeout(finishClose, 700);
  }

  function finishClose() {
    if (closeDone.current) return;
    closeDone.current = true;

    if (closeFallback.current !== null) {
      window.clearTimeout(closeFallback.current);
      closeFallback.current = null;
    }

    onClose?.();
  }

  useEffect(() => {
    return () => {
      if (closeFallback.current !== null) {
        window.clearTimeout(closeFallback.current);
        closeFallback.current = null;
      }
    };
  }, []);

  // 2. Fungsi Tambah Kontak ke Database Supabase
  async function connect(name: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Anda harus login terlebih dahulu!");
        return;
      }

      setConnected((prev) => (prev.includes(name) ? prev : [...prev, name]));

      const { error } = await supabase.from("contacts").insert([
        {
          user_id: user.id,
          contact_name: name,
        },
      ]);

      if (error) {
        console.error("Gagal menyimpan kontak ke Supabase:", error.message);
      }
    } catch (err) {
      console.error("Error saat menambah kontak:", err);
    }
  }

  // 3. Fungsi Toggle Kontak (Tambah/Hapus) ke Database Supabase
  async function toggleConnect(name: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const isAlreadyConnected = connected.includes(name);

      if (isAlreadyConnected) {
        setConnected((prev) => prev.filter((n) => n !== name));

        const { error } = await supabase
          .from("contacts")
          .delete()
          .eq("user_id", user.id)
          .eq("contact_name", name);

        if (error) {
          console.error("Gagal menghapus kontak dari Supabase:", error.message);
        }
      } else {
        await connect(name);
      }
    } catch (err) {
      console.error("Error saat mengubah status kontak:", err);
    }
  }

  function openSheet(person: Person) {
    setSheetClosing(false);
    setQuickPerson(person);
  }

  function closeSheet() {
    if (sheetCloseTimer.current !== null) return;

    setSheetClosing(true);
    sheetCloseTimer.current = window.setTimeout(() => {
      sheetCloseTimer.current = null;
      setQuickPerson(null);
      setSheetClosing(false);
    }, 240);
  }

  useEffect(() => {
    if (!quickPerson) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSheet();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      if (sheetCloseTimer.current !== null) {
        window.clearTimeout(sheetCloseTimer.current);
        sheetCloseTimer.current = null;
      }
    };
  }, [quickPerson]);

  const isEntering = enterOffset > 0 && !closing;

  const panelClass = `${styles.panel}${
    isEntering ? ` ${styles.panelEnter}` : ""
  }${closing ? ` ${styles.panelClosing}` : ""}`;

  const detailClass = `${styles.panel} ${styles.panelFade}`;

  const panelStyle = {
    "--enter-offset": `${enterOffset}px`,
  } as CSSProperties;

  // Tampilan Full Profile Detail User
  if (selectedPerson) {
    return (
      <div className={detailClass}>
        <ProfileDetail
          variant="user"
          onBack={() => setSelectedPerson(null)}
          connected={connected.includes(selectedPerson.name)}
          onToggleConnect={() => toggleConnect(selectedPerson.name)}
          data={{
            name: selectedPerson.name,
            role: selectedPerson.role,
            avatar: selectedPerson.avatar,
            bio: selectedPerson.bio,
            followers: selectedPerson.followers,
            following: selectedPerson.following,
            facultyTitle: selectedPerson.facultyTitle,
            facultySub: selectedPerson.facultySub,
            mutualText: "3 teman bersama",
          }}
        />
      </div>
    );
  }

  // Tampilan Full Profile Detail Mentor
  if (showMentorDetail) {
    return (
      <div className={detailClass}>
        <ProfileDetail
          variant="mentor"
          data={mentor}
          onBack={() => setShowMentorDetail(false)}
        />
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const matches = (keywords: string) => !query || keywords.includes(query);

  const showMentor =
    (activeTab === "semua" || activeTab === "mentor") &&
    matches(mentorKeywords);

  // Sumber data utama pencarian diambil dari dbPeople (Database Supabase)
  const visiblePeople =
    activeTab === "semua" || activeTab === "teman"
      ? dbPeople.filter((person) => matches(person.keywords))
      : [];

  const hasResults = showMentor || visiblePeople.length > 0;

  return (
    <div
      ref={panelRef}
      className={panelClass}
      style={panelStyle}
      onAnimationEnd={(event) => {
        if (closing && event.target === panelRef.current) finishClose();
      }}
    >
      {/* Top Bar */}
      <div className={styles.topBar}>
        {onClose ? (
          <button
            type="button"
            className={styles.backArrow}
            onClick={requestClose}
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
        ) : (
          <a href="/home" className={styles.backArrow} aria-label="Kembali">
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path
                d="M10 2L2 10L10 18"
                stroke="#070707"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}

        <div className={styles.searchBar}>
          <input
            type="search"
            placeholder="Cari teman atau mentor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />

          <button
            type="button"
            className={styles.searchButton}
            aria-label="Cari"
          >
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
          </button>
        </div>
      </div>

      <div className={styles.panelBody}>
        {/* Filter Tabs */}
        <div className={styles.tabsRow}>
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
        </div>

        {!hasResults ? (
          <div className={styles.empty}>
            <Image
              src="/images/figma/empty_illustration.png"
              alt="Data Tidak Ditemukan"
              width={180}
              height={180}
              className={styles.emptyImg}
            />
            <p className={styles.emptyText}>Data Tidak Ditemukan</p>
          </div>
        ) : (
          <div className={styles.list}>
            {showMentor && (
              <div
                className={styles.mentorCard}
                onClick={() => setShowMentorDetail(true)}
              >
                <Image
                  src={mentor.avatar}
                  alt={mentor.name}
                  width={60}
                  height={60}
                  className={styles.mentorAvatar}
                />
                <div className={styles.mentorInfo}>
                  <div className={styles.mentorTop}>
                    <h3 className={styles.mentorName}>{mentor.name}</h3>
                    <span className={styles.mentorRating}>★ 4.9</span>
                  </div>
                  <p className={styles.mentorRole}>Web &amp; UI/UX Designer</p>
                  <div className={styles.mentorBottom}>
                    <button
                      type="button"
                      className={styles.trialBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMentorDetail(true);
                      }}
                    >
                      Free Study Trial 3 days
                    </button>
                  </div>
                </div>
              </div>
            )}

            {visiblePeople.map((person) => (
              <div
                key={person.id}
                className={styles.card}
                onClick={() => setSelectedPerson(person)}
              >
                <div className={styles.cardLeft}>
                  <Image
                    src={person.avatar}
                    alt={person.name}
                    width={56}
                    height={56}
                    className={styles.avatar}
                  />
                  <div className={styles.cardInfo}>
                    <h4 className={styles.name}>{person.name}</h4>
                    <p className={styles.major}>{person.major}</p>
                    <p className={styles.sem}>{person.semester}</p>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <span className={styles.category}>{person.category}</span>

                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openSheet(person);
                    }}
                  >
                    {connected.includes(person.name)
                      ? "Tersambung ✓"
                      : "Tambah Teman"}
                  </button>

                  <div className={styles.mutual}>
                    <span className={styles.mutualText}>3 teman bersama</span>
                    <div className={styles.mutualAvatars}>
                      <Image
                        src="/images/figma/mutual_1.png"
                        alt=""
                        width={18}
                        height={18}
                        className={styles.mutualAvatar}
                      />
                      <Image
                        src="/images/figma/mutual_2.png"
                        alt=""
                        width={18}
                        height={18}
                        className={styles.mutualAvatar}
                      />
                      <Image
                        src="/images/figma/mutual_3.png"
                        alt=""
                        width={18}
                        height={18}
                        className={styles.mutualAvatar}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet - Quick Profile */}
      {quickPerson && (
        <div
          className={`${styles.overlay}${
            sheetClosing ? ` ${styles.overlayClosing}` : ""
          }`}
          onClick={closeSheet}
        >
          <div
            className={`${styles.sheet}${
              sheetClosing ? ` ${styles.sheetClosing}` : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={`Profil singkat ${quickPerson.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.handle} aria-hidden="true" />

            <div className={styles.sheetBody}>
              <Image
                src={quickPerson.avatar}
                alt={quickPerson.name}
                width={96}
                height={96}
                className={styles.sheetAvatar}
              />
              <h3 className={styles.sheetName}>{quickPerson.name}</h3>
              <p className={styles.sheetBio}>{quickPerson.sheetBio}</p>

              <div className={styles.skillRows}>
                {quickPerson.skills.map((row, rowIndex) => (
                  <div className={styles.skillRow} key={rowIndex}>
                    {row.map((skill, skillIndex) => (
                      <span
                        className={styles.skillTag}
                        key={`${skill}-${skillIndex}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Universitas</span>
                  <span className={styles.infoValue}>
                    {quickPerson.university}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Jurusan</span>
                  <span className={styles.infoValue}>
                    {quickPerson.detailMajor}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Semester</span>
                  <span className={styles.infoValue}>
                    {quickPerson.detailSemester}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.sheetActions}>
              <button
                type="button"
                className={styles.addFriendBtn}
                onClick={() => {
                  connect(quickPerson.name);
                  closeSheet();
                }}
              >
                {connected.includes(quickPerson.name)
                  ? "Tersambung ✓"
                  : "Add Friend"}
              </button>

              <Link
                href="/chat"
                className={styles.chatBtn}
                aria-label="Kirim pesan"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}