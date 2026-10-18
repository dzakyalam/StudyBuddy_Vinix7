"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import StageView from "@/app/components/room/StageView";
import ParticipantTile from "@/app/components/room/ParticipantTile";
import ControlBar from "@/app/components/room/ControlBar";
import { rooms, members } from "@/app/lib/mock-data";

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Cari room berdasarkan id atau kode
  const room = rooms.find((r) => r.id === id || r.kode === id);

  // Sumber data peserta (satu sumber data untuk header dan judul daftar)
  const daftarPeserta = members;

  // Jika room tidak ditemukan, tampilkan pesan error + tombol kembali
  if (!room) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          maxWidth: "430px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#edf5ff",
            color: "#3688f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#26354b",
            margin: "0 0 8px 0",
          }}
        >
          Room tidak ditemukan
        </h1>

        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            margin: "0 0 24px 0",
            lineHeight: 1.6,
          }}
        >
          ID atau kode room yang Anda tuju tidak valid atau sesi belajar telah berakhir.
        </p>

        <Link
          href="/room-server"
          style={{
            minHeight: "44px",
            padding: "0 22px",
            borderRadius: "9999px",
            backgroundColor: "#3688f5",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(54, 136, 245, 0.25)",
          }}
        >
          Kembali ke Room Server
        </Link>
      </main>
    );
  }

  // Presenter yang sedang berbagi layar (misal anggota pertama)
  const presenter = daftarPeserta[0]?.nama || "Max Zul";

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
      {/* Header Room */}
      <header
        style={{
          width: "100%",
          height: "60px",
          minHeight: "60px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e7edf5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 0 8px",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxSizing: "border-box",
        }}
      >
        {/* Sisi Kiri: Tombol Kembali + Judul & Subjudul */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
            flex: 1,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/room-server")}
            aria-label="Kembali ke Room Server"
            style={{
              width: "44px",
              height: "44px",
              minWidth: "44px",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#26354b",
              padding: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Judul Room (dipotong "...") */}
            <h1
              title={room.nama}
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#26354b",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "240px",
              }}
            >
              {room.nama}
            </h1>

            {/* Subjudul: Code Room: <kode> • N Peserta */}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#64748b",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Code Room: {room.kode} • {daftarPeserta.length} Peserta
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Tombol Menu Bulat Biru Kecil */}
        <button
          type="button"
          aria-label="Menu opsi room"
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#3688f5",
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(54, 136, 245, 0.25)",
            }}
          >
            {/* Ikon Tiga Titik Menu */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </span>
        </button>
      </header>

      {/* Konten Utama Room */}
      <main
        style={{
          flex: 1,
          padding: "16px 16px calc(92px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* Label "Screen" dan Panggung Rounded Besar */}
        <StageView presenterName={presenter} />

        {/* Daftar Peserta */}
        <section aria-label="Daftar Peserta Room">
          <h2
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#26354b",
              margin: "0 0 12px 0",
            }}
          >
            Peserta ({daftarPeserta.length})
          </h2>

          {/* Grid 2 Kolom Peserta */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {daftarPeserta.map((peserta) => (
              <ParticipantTile key={peserta.id} member={peserta} />
            ))}
          </div>
        </section>
      </main>

      {/* Panel Kontrol di Bagian Bawah */}
      <ControlBar />
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#ffffff",
            maxWidth: "430px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Memuat room...
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
