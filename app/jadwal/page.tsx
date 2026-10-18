"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/room/Header";
import BottomNav from "@/app/components/room/BottomNav";
import AgendaSummaryCard from "@/app/components/jadwal/AgendaSummaryCard";
import AgendaTabs, { type AgendaTab } from "@/app/components/jadwal/AgendaTabs";
import AgendaCard from "@/app/components/jadwal/AgendaCard";
import {
  agendas as initialAgendas,
  penggunaAktif,
  isHariIni,
  isBesok,
  type Agenda,
} from "@/app/lib/mock-data";

// Helper memformat tanggal hari ini dalam format kapital: "KAMIS, 4 OKT 2026"
function getFormattedToday(): string {
  try {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatter.format(new Date()).toUpperCase();
  } catch {
    return "KAMIS, 4 OKT 2026";
  }
}

export default function JadwalPage() {
  const [daftarAgenda] = useState<Agenda[]>(initialAgendas);
  const [activeTab, setActiveTab] = useState<AgendaTab>("Semua");

  const tanggalHariIni = useMemo(() => getFormattedToday(), []);

  // Hitung jumlah kegiatan hari ini untuk kartu ringkasan
  const jumlahHariIni = useMemo(() => {
    return daftarAgenda.filter((item) => isHariIni(item.tanggal)).length;
  }, [daftarAgenda]);

  // Urutkan agenda berdasarkan tanggal (ASC) kemudian jam mulai (ASC)
  const agendaTerurut = useMemo(() => {
    return [...daftarAgenda].sort((a, b) => {
      const dateCompare = a.tanggal.localeCompare(b.tanggal);
      if (dateCompare !== 0) return dateCompare;
      return a.jamMulai.localeCompare(b.jamMulai);
    });
  }, [daftarAgenda]);

  // Filter agenda berdasarkan tab yang aktif ("Semua" / "Hari Ini" / "Besok")
  const agendaDitampilkan = useMemo(() => {
    if (activeTab === "Hari Ini") {
      return agendaTerurut.filter((item) => isHariIni(item.tanggal));
    }
    if (activeTab === "Besok") {
      return agendaTerurut.filter((item) => isBesok(item.tanggal));
    }
    return agendaTerurut;
  }, [agendaTerurut, activeTab]);

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
      {/* Header Utama dengan logo StudyBuddy */}
      <Header />

      {/* Konten Halaman Jadwal */}
      <main
        style={{
          flex: 1,
          padding: "18px 16px 110px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Tanggal Hari Ini & Sapaan Pengguna */}
        <section
          aria-label="Sapaan Pengguna"
          style={{ marginBottom: "16px" }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#8c9fb5",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}
          >
            {tanggalHariIni}
          </p>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#26354b",
              margin: 0,
              letterSpacing: "-0.4px",
            }}
          >
            Hallo {penggunaAktif.nama} 👋
          </h1>
        </section>

        {/* Kartu Ringkasan Biru Bergradasi */}
        <section aria-label="Ringkasan Agenda">
          <AgendaSummaryCard jumlahHariIni={jumlahHariIni} />
        </section>

        {/* Tab Pill Filter: Semua, Hari Ini, Besok */}
        <section aria-label="Filter Waktu Agenda">
          <AgendaTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </section>

        {/* Daftar Kartu Agenda atau Keadaan Kosong */}
        <section
          aria-label="Daftar Agenda Kegiatan"
          style={{ flex: 1 }}
        >
          {agendaDitampilkan.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {agendaDitampilkan.map((agenda) => (
                <AgendaCard key={agenda.id} agenda={agenda} />
              ))}
            </div>
          ) : (
            /* Keadaan Kosong: "Belum ada agenda" */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 16px",
                textAlign: "center",
                borderRadius: "16px",
                backgroundColor: "#f8fafc",
                border: "1.5px dashed #cbd5e1",
                marginTop: "4px",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  marginBottom: "12px",
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#334155",
                  margin: "0 0 4px",
                }}
              >
                Belum ada agenda
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                Tidak ada kegiatan yang dijadwalkan pada kategori waktu ini.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Tombol "Buat Jadwal +" Mengambang di Kanan Bawah */}
      <div
        style={{
          position: "fixed",
          bottom: "calc(74px + env(safe-area-inset-bottom, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "430px",
          padding: "0 16px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "flex-end",
          pointerEvents: "none",
          zIndex: 45,
        }}
      >
        <button
          type="button"
          aria-label="Buat Jadwal"
          style={{
            pointerEvents: "auto",
            backgroundColor: "#3688f5",
            color: "#ffffff",
            border: "none",
            borderRadius: "9999px",
            padding: "12px 20px",
            minHeight: "44px",
            boxShadow: "0 6px 20px rgba(54, 136, 245, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          <span>Buat Jadwal +</span>
        </button>
      </div>

      {/* Navigasi Bawah */}
      <BottomNav />
    </div>
  );
}
