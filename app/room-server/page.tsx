"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/room/Header";
import BottomNav from "@/app/components/room/BottomNav";
import RoomCard from "@/app/components/room/RoomCard";
import {
  rooms as initialRooms,
  kategoriContoh,
  type Room,
} from "@/app/lib/mock-data";

export default function RoomServerPage() {
  const [daftarRoom] = useState<Room[]>(initialRooms);
  const [kataKunci, setKataKunci] = useState<string>("");
  const [kategoriDipilih, setKategoriDipilih] = useState<string>("");
  const [bukaDropdown, setBukaDropdown] = useState<boolean>(false);

  // Filter daftar room berdasarkan pencarian (nama atau kode) dan kategori
  const roomTerfilter = useMemo(() => {
    return daftarRoom.filter((room) => {
      const query = kataKunci.trim().toLowerCase();
      const cocokPencarian =
        !query ||
        room.nama.toLowerCase().includes(query) ||
        room.kode.toLowerCase().includes(query);

      const cocokKategori =
        !kategoriDipilih ||
        kategoriDipilih === "Semua Kategori" ||
        room.kategori.toLowerCase() === kategoriDipilih.toLowerCase();

      return cocokPencarian && cocokKategori;
    });
  }, [daftarRoom, kataKunci, kategoriDipilih]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        maxWidth: "430px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Header Utama */}
      <Header />

      {/* Konten Halaman Room Server */}
      <main
        style={{
          flex: 1,
          padding: "18px 16px 96px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Kolom Pencarian */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f3f6fa",
            borderRadius: "9999px",
            padding: "3px 4px 3px 16px",
            minHeight: "46px",
            boxSizing: "border-box",
          }}
        >
          <label
            htmlFor="input-pencarian-room"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              border: 0,
            }}
          >
            Cari room berdasarkan nama atau kode
          </label>
          <input
            id="input-pencarian-room"
            type="search"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Masukan kode"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "13px",
              color: "#26354b",
              minWidth: 0,
            }}
          />
          <button
            type="button"
            aria-label="Cari room"
            style={{
              width: "44px",
              height: "44px",
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "50%",
              backgroundColor: "#3688f5",
              color: "#ffffff",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {/* Ikon Kaca Pembesar (Search) */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* Baris Tombol Aksi: Dropdown Kategori & Buat Room */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginTop: "16px",
            position: "relative",
          }}
        >
          {/* Dropdown Pill Biru "Pilih Kategori" */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setBukaDropdown((prev) => !prev)}
              aria-expanded={bukaDropdown}
              aria-haspopup="listbox"
              aria-label="Pilih kategori room"
              style={{
                minHeight: "44px",
                padding: "0 14px",
                borderRadius: "9999px",
                backgroundColor: "#3688f5",
                color: "#ffffff",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{kategoriDipilih || "Pilih Kategori"}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: bukaDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Menu Pop-up Pilihan Kategori */}
            {bukaDropdown && (
              <>
                <div
                  onClick={() => setBukaDropdown(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 20,
                  }}
                />
                <div
                  role="listbox"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    zIndex: 30,
                    backgroundColor: "#ffffff",
                    border: "1px solid #d4e5ff",
                    borderRadius: "14px",
                    boxShadow: "0 8px 24px rgba(38, 53, 75, 0.12)",
                    minWidth: "160px",
                    padding: "6px 0",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!kategoriDipilih}
                    onClick={() => {
                      setKategoriDipilih("");
                      setBukaDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: "0 16px",
                      border: "none",
                      backgroundColor: !kategoriDipilih ? "#edf5ff" : "transparent",
                      color: !kategoriDipilih ? "#3688f5" : "#26354b",
                      fontWeight: !kategoriDipilih ? 700 : 500,
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Semua Kategori
                  </button>

                  {kategoriContoh.map((kat) => {
                    const terpilih = kategoriDipilih === kat;
                    return (
                      <button
                        key={kat}
                        type="button"
                        role="option"
                        aria-selected={terpilih}
                        onClick={() => {
                          setKategoriDipilih(kat);
                          setBukaDropdown(false);
                        }}
                        style={{
                          width: "100%",
                          minHeight: "44px",
                          padding: "0 16px",
                          border: "none",
                          backgroundColor: terpilih ? "#edf5ff" : "transparent",
                          color: terpilih ? "#3688f5" : "#26354b",
                          fontWeight: terpilih ? 700 : 500,
                          fontSize: "12px",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {kat}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Pill Biru "Buat Room Belajar" dengan Ikon Plus */}
          <button
            type="button"
            aria-label="Buat Room Belajar"
            onClick={() => {
              // Belum berfungsi, akan dibuat pada langkah berikutnya
            }}
            style={{
              minHeight: "44px",
              padding: "0 14px",
              borderRadius: "9999px",
              backgroundColor: "#3688f5",
              color: "#ffffff",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Buat Room Belajar</span>
          </button>
        </div>

        {/* Daftar Kartu Room */}
        <section
          aria-label="Daftar Room Belajar"
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {roomTerfilter.length > 0 ? (
            roomTerfilter.map((room) => <RoomCard key={room.id} room={room} />)
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 16px",
                color: "#7c899b",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Room tidak ditemukan
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Navigasi Bawah */}
      <BottomNav />
    </div>
  );
}
