"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import styles from "./profile.module.css";

/**
 * Ikon baris menu (aset PNG putih untuk kartu biru).
 */
function RowIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={22}
      height={22}
      className={styles.rowIcon}
    />
  );
}

export default function ProfilePage() {
  const [email, setEmail] = useState("aditya@gmail.com");

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("studybuddy_logged_in");
    const savedEmail = sessionStorage.getItem("studybuddy_email");

    if (savedEmail) {
      setEmail(savedEmail);
    }

    // Jangan redirect otomatis sebelum alur login
    // dan navigasi aplikasi dipastikan benar.
  }, []);

  return (
    <main className={styles.screen}>
      {/* Header */}
      <header className={styles.topHeader}>
        <Link href="/home" className={styles.backArrow} aria-label="Kembali">
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
        <h1 className={styles.screenTitle}>Edit Profil</h1>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.bodyContent}>
        {/* User Identity Section */}
        <div className={styles.identitySection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarCircle}>
              <Image
                src="/images/figma/aditya.png"
                alt="Aditya Putra"
                width={120}
                height={120}
                className={styles.avatarImg}
                priority
              />
            </div>
            <button
              className={styles.editBadge}
              title="Ganti Foto Profil"
              aria-label="Ganti Foto Profil"
              type="button"
            >
              <Image
                src="/icon-profil/edit-line.png"
                alt=""
                width={16}
                height={16}
                className={styles.editBadgeImg}
              />
            </button>
          </div>

<h2 className={styles.userName}>Aditya Putra</h2>

<p className={styles.userMeta}>
  {email}
  <span className={styles.metaDivider}> | </span>
  +01 234 567 89
</p>
        </div>

        {/* Card 1: Pengaturan Akun */}
        <section className={styles.card}>
          <button type="button" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/profile-line.png" />
              <span>Edit Informasi Profil</span>
            </div>
          </button>

          <button type="button" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/notification.png" />
              <span>Notifikasi</span>
            </div>
            <span className={styles.rowRight}>ON</span>
          </button>

          <button type="button" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/translate-2.png" />
              <span>Bahasa</span>
            </div>
            <span className={styles.rowRight}>Indonesia</span>
          </button>
        </section>

        {/* Card 2: Pengaturan Tampilan */}
        <section className={styles.card}>
          <button type="button" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/mental-health-line.png" />
              <span>Thema</span>
            </div>
            <span className={styles.rowRight}>Light mode</span>
          </button>
        </section>

        {/* Card 3: Dukungan & Informasi */}
        <section className={styles.card}>
          <button type="button" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/contacts-line.png" />
              <span>Help &amp; Support</span>
            </div>
          </button>

          <button type="button" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/chat-quote-line.png" />
              <span>Contact us</span>
            </div>
          </button>

          <button type="button" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/privacy-policy.png" />
              <span>Privacy policy</span>
            </div>
          </button>
        </section>
      </div>

      {/* Bottom Nav */}
      <Navbar />
    </main>
  );
}
