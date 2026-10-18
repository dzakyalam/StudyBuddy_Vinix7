
"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./profil.css";

export default function ProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [foto, setFoto] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [gender, setGender] = useState("");
  const [semester, setSemester] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [prodi, setProdi] = useState("");
  const [ipk, setIpk] = useState("");
  const [error, setError] = useState("");

  function handleFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Silakan pilih file gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setError("");
    setFoto(URL.createObjectURL(file));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (
      !nama.trim() ||
      !email.trim() ||
      !telepon.trim() ||
      !gender ||
      !semester ||
      !fakultas.trim() ||
      !prodi.trim() ||
      !ipk.trim()
    ) {
      setError("Mohon lengkapi semua data profil.");
      return;
    }

    const nilaiIpk = Number(ipk);

    if (!Number.isFinite(nilaiIpk) || nilaiIpk < 0 || nilaiIpk > 4) {
      setError("IPK harus berada di antara 0,00 sampai 4,00.");
      return;
    }

    // Profil belum disimpan ke database.
    router.push("/home");
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <button
          type="button"
          className="profile-back"
          onClick={() => router.push("/bidang-minat")}
          aria-label="Kembali ke bidang minat"
        >
          ‹
        </button>

        <button
          type="button"
          className="profile-skip"
          onClick={() => router.push("/home")}
        >
          Lewati
        </button>
      </header>

      <section className="profile-content">
        <h1>Profil Kamu</h1>

        <div className="profile-photo-section">
          <button
            type="button"
            className="profile-photo"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Pilih foto profil"
          >
            {foto ? (
              <img src={foto} alt="Pratinjau foto profil" />
            ) : (
              <span className="profile-photo-placeholder">
                <svg
                  viewBox="0 0 24 24"
                  width="36"
                  height="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                </svg>
              </span>
            )}
          </button>

          <input
            ref={fileInputRef}
            className="profile-file-input"
            type="file"
            accept="image/*"
            onChange={handleFoto}
          />

          <button
            type="button"
            className="profile-change-photo"
            onClick={() => fileInputRef.current?.click()}
          >
            {foto ? "Ganti Foto" : "Ganti Foto"}
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-phone">Nomor handphone</label>
            <input
              id="profile-phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="profile-gender">Genre</label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih gender
                </option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
                <option value="Memilih tidak menjawab">
                  Memilih tidak menjawab
                </option>
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-semester">Semester</label>
              <select
                id="profile-semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih
                </option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((angka) => (
                  <option key={angka} value={String(angka)}>
                    {angka}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-faculty">Fakultas</label>
            <input
              id="profile-faculty"
              type="text"
              placeholder="Masukkan fakultas"
              value={fakultas}
              onChange={(e) => setFakultas(e.target.value)}
              required
            />
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="profile-prodi">Prodi</label>
              <input
                id="profile-prodi"
                type="text"
                placeholder="Program studi"
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-ipk">IPK</label>
              <input
                id="profile-ipk"
                type="number"
                placeholder="0.00"
                min="0"
                max="4"
                step="0.01"
                value={ipk}
                onChange={(e) => setIpk(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="profile-error" role="alert">
              {error}
            </p>
          )}

          <button className="profile-next" type="submit">
            Selanjutnya
          </button>
        </form>

        <div className="profile-pagination" aria-label="Langkah 3 dari 4">
          <span />
          <span />
          <span className="is-active" />
          <span />
        </div>
      </section>
    </main>
  );
}
