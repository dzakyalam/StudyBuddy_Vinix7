"use client";

import Link from "next/link";
import type { Room } from "@/app/lib/mock-data";

export interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const isPenuh = room.peserta >= room.kapasitas;

  // Inisial 2 karakter dari nama room (contoh: "UI/UX Design" -> "UI", "Cyber Security" -> "CS")
  const inisial = room.nama
    .split(/[\s/]+/)
    .filter(Boolean)
    .map((kata) => kata[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      style={{
        border: "1.5px solid #d4e5ff",
        borderRadius: "18px",
        backgroundColor: "#ffffff",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 2px 10px rgba(54, 136, 245, 0.04)",
        boxSizing: "border-box",
      }}
    >
      {/* Thumbnail bulat di kiri (gradasi biru muda dengan inisial) */}
      <div
        aria-hidden="true"
        style={{
          width: "48px",
          height: "48px",
          minWidth: "48px",
          minHeight: "48px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #e4efff 0%, #c8e1ff 100%)",
          border: "2px solid #ffffff",
          boxShadow: "0 2px 6px rgba(54, 136, 245, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2474e5",
          fontWeight: 800,
          fontSize: "15px",
          letterSpacing: "-0.5px",
          userSelect: "none",
        }}
      >
        {inisial}
      </div>

      {/* Bagian Tengah: Nama Room & Teks "Live" Merah */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#26354b",
            margin: "0 0 4px 0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {room.nama}
        </h2>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            color: "#ef4444",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              display: "inline-block",
            }}
          />
          Live
        </div>
      </div>

      {/* Sisi Kanan: Jumlah Peserta (atas) & Tombol Join (bawah) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          minHeight: "56px",
          gap: "8px",
        }}
      >
        {/* Jumlah peserta dengan ikon orang (contoh: 7/10) */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>
            {room.peserta}/{room.kapasitas}
          </span>
        </div>

        {/* Pill Biru Join (atau disabled jika penuh) */}
        {isPenuh ? (
          <button
            type="button"
            disabled
            aria-label={`Room ${room.nama} sudah penuh`}
            style={{
              minWidth: "64px",
              minHeight: "44px",
              padding: "0 18px",
              borderRadius: "9999px",
              backgroundColor: "#cbd5e1",
              color: "#ffffff",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Penuh
          </button>
        ) : (
          <Link
            href={`/room?id=${room.id}`}
            aria-label={`Gabung room ${room.nama}`}
            style={{
              minWidth: "64px",
              minHeight: "44px",
              padding: "0 18px",
              borderRadius: "9999px",
              backgroundColor: "#3688f5",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Join
          </Link>
        )}
      </div>
    </article>
  );
}
