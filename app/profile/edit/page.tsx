
"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./edit.module.css";

export default function EditProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [foto, setFoto] = useState("/images/figma/aditya.png");
  const [nama, setNama] = useState("Aditya");
  const [email, setEmail] = useState("Aditya@gmail.com");
  const [telepon, setTelepon] = useState("08520978121");
  const [gender, setGender] = useState("Laki-laki");
  const [semester, setSemester] = useState("7");
  const [fakultas, setFakultas] = useState("VOKASI");
  const [prodi, setProdi] = useState("Teknologi Informasi");
  const [ipk, setIpk] = useState("3.6");

  function handleFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    setFoto(URL.createObjectURL(file));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nama.trim() || !email.trim() || !telepon.trim() ||
        !gender || !semester || !fakultas.trim() ||
        !prodi.trim() || !ipk.trim()) {
      alert("Mohon lengkapi semua data profil.");
      return;
    }

    const nilaiIpk = Number(ipk);

    if (!Number.isFinite(nilaiIpk) || nilaiIpk < 0 || nilaiIpk > 4) {
      alert("IPK harus berada di antara 0 sampai 4.");
      return;
    }

    // Prototipe: data belum disimpan ke database.
    alert("Data profil berhasil dikonfirmasi!");
    router.back();
  }

  return (
    <main className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Kembali"
        >
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 2L2 10L10 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1>Profil Kamu</h1>

        <div className={styles.headerSpace} />
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Foto Profil */}
        <section className={styles.photoSection}>
          <button
            type="button"
            className={styles.photoButton}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Pilih foto profil"
          >
            <Image
              src={foto}
              alt="Foto profil"
              width={100}
              height={100}
              className={styles.photo}
              unoptimized={foto.startsWith("blob:")}
            />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFoto}
          />

          <button
            type="button"
            className={styles.changePhoto}
            onClick={() => fileInputRef.current?.click()}
          >
            Ganti Foto
          </button>
        </section>

        {/* Form Informasi Profil */}
        <section className={styles.fields}>
          <label className={styles.field}>
            <span>Nama</span>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Nomor handphone</span>
            <input
              type="tel"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              required
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
                <option value="Memilih tidak menjawab">
                  Memilih tidak menjawab
                </option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Semester</span>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={String(index + 1)}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>Fakultas</span>
            <input
              type="text"
              value={fakultas}
              onChange={(e) => setFakultas(e.target.value)}
              required
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Prodi</span>
              <input
                type="text"
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span>IPK</span>
              <input
                type="number"
                min="0"
                max="4"
                step="0.01"
                value={ipk}
                onChange={(e) => setIpk(e.target.value)}
                required
              />
            </label>
          </div>
        </section>

        {/* Tombol Konfirmasi */}
        <button type="submit" className={styles.nextButton}>
          Konfirmasi
        </button>
      </form>
    </main>
  );
}
