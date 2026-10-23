"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { supabase } from "@/app/lib/supabase";
import styles from "./profile.module.css";

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

type DialogType = "email" | "logout" | "delete" | null;

export default function ProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [userName, setUserName] = useState("Pengguna StudyBuddy");
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  // Ambil data user aktif dari Supabase saat halaman dimuat
  useEffect(() => {
    async function fetchUserData() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Jika belum login, alihkan ke halaman login
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");
      setNewEmail(user.email || "");

      // Menggunakan .maybeSingle() agar aman jika baris profil belum ada di database
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.full_name) {
        setUserName(profile.full_name);
      }

      // Pengaturan notifikasi disimpan secara lokal
      const savedNotification = localStorage.getItem("studybuddy_notification");
      if (savedNotification !== null) {
        setNotificationEnabled(savedNotification === "true");
      }

      setReady(true);
    }

    fetchUserData();
  }, [router]);

  function toggleNotification() {
    const nextStatus = !notificationEnabled;
    setNotificationEnabled(nextStatus);
    localStorage.setItem("studybuddy_notification", String(nextStatus));
  }

  // Fungsi Ubah Email via Supabase Auth
  async function saveEmail() {
    const cleanedEmail = newEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanedEmail)) {
      setMessage("Masukkan alamat email yang valid.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: cleanedEmail });

    if (error) {
      setMessage(error.message);
      return;
    }

    setEmail(cleanedEmail);
    setMessage("");
    setDialog(null);
    alert("Permintaan ubah email dikirim. Silakan cek email baru Anda untuk verifikasi.");
  }

  // Fungsi Logout via Supabase Auth
  async function logout() {
    await supabase.auth.signOut();
    setDialog(null);
    router.replace("/login");
  }

  // Fungsi Hapus Akun dengan await untuk memastikan proses sign out selesai
  async function deleteAccount() {
    localStorage.removeItem("studybuddy_notification");
    await supabase.auth.signOut();
    setDialog(null);
    router.replace("/login");
  }

  if (!ready) {
    return <main className={styles.screen} />;
  }

  return (
    <main className={styles.screen}>
      {/* Header */}
      <header className={styles.topHeader}>
        <Link
          href="/home"
          className={styles.backArrow}
          aria-label="Kembali ke Home"
        >
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
        {/* Identitas Pengguna */}
        <div className={styles.identitySection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarCircle}>
              <Image
                src="/images/figma/aditya.png"
                alt="Foto profil"
                width={120}
                height={120}
                className={styles.avatarImg}
                priority
              />
            </div>

            <Link
              href="/profile/edit"
              className={styles.editBadge}
              title="Edit Informasi Profil"
              aria-label="Edit Informasi Profil"
            >
              <Image
                src="/icon-profil/edit-line.png"
                alt=""
                width={16}
                height={16}
                className={styles.editBadgeImg}
              />
            </Link>
          </div>

          <h2 className={styles.userName}>{userName}</h2>

          <p className={styles.userMeta}>
            {email}
            <span className={styles.metaDivider}> | </span>
            Aktif di Supabase
          </p>
        </div>

        {/* Card 1: Pengaturan Akun */}
        <section className={styles.card}>
          <Link href="/profile/edit" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/profile-line.png" />
              <span>Edit Informasi Profil</span>
            </div>
          </Link>

          {/* Edit Email Login */}
          <button
            type="button"
            className={styles.cardRow}
            onClick={() => {
              setNewEmail(email);
              setMessage("");
              setDialog("email");
            }}
          >
            <div className={styles.rowLeft}>
              <RowIcon src="/images/icon google.png" />
              <span>Email Login</span>
            </div>

            <span className={styles.rowRight}>Ubah ›</span>
          </button>

          {/* Notifikasi */}
          <button
            type="button"
            className={styles.cardRow}
            onClick={toggleNotification}
            aria-pressed={notificationEnabled}
          >
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/notification.png" />
              <span>Notifikasi</span>
            </div>

            <div
              className={`${styles.notificationSwitch} ${
                notificationEnabled
                  ? styles.switchOn
                  : styles.switchOff
              }`}
              aria-hidden="true"
            >
              <span className={styles.switchKnob} />
            </div>
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

        {/* Card 3: Dukungan dan Informasi */}
        <section className={styles.card}>
          <Link href="/help-support" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/contacts-line.png" />
              <span>Help &amp; Support</span>
            </div>
          </Link>

          <Link href="/contact-us" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/chat-quote-line.png" />
              <span>Contact us</span>
            </div>
          </Link>

          <Link href="/privacy-policy" className={styles.cardRow}>
            <div className={styles.rowLeft}>
              <RowIcon src="/icon-profil/privacy-policy.png" />
              <span>Privacy policy</span>
            </div>
          </Link>
        </section>

        {/* Card 4: Keamanan Akun */}
        <section className={styles.card}>
          <button
            type="button"
            className={styles.cardRow}
            onClick={() => setDialog("logout")}
          >
            <div className={styles.rowLeft}>
              <span className={styles.actionIcon} aria-hidden="true">
                ↪
              </span>
              <span>Logout</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.cardRow} ${styles.dangerRow}`}
            onClick={() => setDialog("delete")}
          >
            <div className={styles.rowLeft}>
              <span className={styles.actionIcon} aria-hidden="true">
                ×
              </span>
              <span>Hapus Akun</span>
            </div>
          </button>
        </section>
      </div>

      {/* Dialog Edit Email */}
      {dialog === "email" && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDialog(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="emailDialogTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="emailDialogTitle">Ubah Email Login</h2>

            <p className={styles.modalDescription}>
              Masukkan email baru yang ingin kamu gunakan pada akun Supabase.
            </p>

            <label className={styles.inputLabel} htmlFor="newEmail">
              Alamat Email Baru
            </label>

            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(event) => {
                setNewEmail(event.target.value);
                setMessage("");
              }}
              placeholder="nama@email.com"
              className={styles.emailInput}
              autoComplete="email"
            />

            {message && (
              <p className={styles.errorMessage}>{message}</p>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setDialog(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={saveEmail}
              >
                Simpan
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Dialog Logout */}
      {dialog === "logout" && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDialog(null)}
        >
          <section
            className={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logoutDialogTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="logoutDialogTitle">Keluar dari akun?</h2>

            <p className={styles.modalDescription}>
              Kamu akan mengakhiri sesi dan diarahkan kembali ke halaman login.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setDialog(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={logout}
              >
                Ya, Logout
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Dialog Hapus Akun */}
      {dialog === "delete" && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDialog(null)}
        >
          <section
            className={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="deleteDialogTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="deleteDialogTitle">Hapus sesi lokal akun?</h2>

            <p className={styles.modalDescription}>
              Tindakan ini akan keluar dari akun dan membersihkan preferensi lokal browser Anda.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setDialog(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className={styles.deleteButton}
                onClick={deleteAccount}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </section>
        </div>
      )}

      <Navbar />
    </main>
  );
}