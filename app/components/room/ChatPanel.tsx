"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  messages as initialMessages,
  penggunaAktif,
  type Message,
} from "@/app/lib/mock-data";

export interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [daftarPesan, setDaftarPesan] = useState<Message[]>(initialMessages);
  const [inputPesan, setInputPesan] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Kunci scroll latar belakang dan dengarkan tombol Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Auto-scroll ke pesan terbaru saat daftar pesan berubah atau panel dibuka
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [daftarPesan, isOpen]);

  if (!isOpen) return null;

  function handleKirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const pesanBersih = inputPesan.trim();
    // Tolak pesan kosong
    if (!pesanBersih) return;

    const sekarang = new Date();
    const jam = String(sekarang.getHours()).padStart(2, "0");
    const menit = String(sekarang.getMinutes()).padStart(2, "0");
    const waktuSekarang = `${jam}:${menit}`;

    const pesanBaru: Message = {
      id: `m-${Date.now()}`,
      pengirimId: penggunaAktif.id,
      nama: penggunaAktif.nama,
      isi: pesanBersih,
      waktu: waktuSekarang,
    };

    setDaftarPesan((prev) => [...prev, pesanBaru]);
    setInputPesan("");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-panel-title"
      onClick={(e) => {
        // Tutup jika mengetuk area overlay gelap
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          height: "75vh",
          maxHeight: "620px",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.22s ease-out",
        }}
      >
        {/* Handle Bar & Header */}
        <div
          style={{
            padding: "10px 16px 8px",
            borderBottom: "1px solid #edf2f7",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Handle kecil di tengah atas */}
          <div
            aria-hidden="true"
            style={{
              width: "38px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "#c5d5e8",
              marginBottom: "10px",
            }}
          />

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              id="chat-panel-title"
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#26354b",
                margin: 0,
              }}
            >
              Obrolan Room
            </h2>

            {/* Tombol Silang Tutup */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup chat"
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
                color: "#64748b",
                borderRadius: "50%",
                padding: 0,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Daftar Pesan */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxSizing: "border-box",
          }}
        >
          {daftarPesan.map((pesan) => {
            // Cek apakah pesan berasal dari pengguna aktif
            const isSaya =
              pesan.pengirimId === penggunaAktif.id ||
              pesan.nama === penggunaAktif.nama ||
              pesan.nama === "Max Zul";

            return (
              <div
                key={pesan.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignSelf: isSaya ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                }}
              >
                {/* Header Pesan: Nama & Waktu */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isSaya ? "flex-end" : "flex-start",
                    gap: "6px",
                    marginBottom: "4px",
                    padding: "0 4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isSaya ? "#3688f5" : "#26354b",
                    }}
                  >
                    {isSaya ? "Anda" : pesan.nama}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                    }}
                  >
                    {pesan.waktu}
                  </span>
                </div>

                {/* Bubble Pesan */}
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: isSaya
                      ? "16px 4px 16px 16px"
                      : "4px 16px 16px 16px",
                    backgroundColor: isSaya ? "#edf5ff" : "#ffffff",
                    border: isSaya
                      ? "1px solid #cce3ff"
                      : "1.5px solid #e2e8f0",
                    color: "#26354b",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                    boxShadow: isSaya
                      ? "none"
                      : "0 2px 6px rgba(0, 0, 0, 0.03)",
                  }}
                >
                  {pesan.isi}
                </div>
              </div>
            );
          })}

          {/* Target Auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Pesan & Tombol Kirim */}
        <form
          onSubmit={handleKirim}
          style={{
            padding: "10px 14px calc(12px + env(safe-area-inset-bottom, 0px))",
            borderTop: "1px solid #edf2f7",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxSizing: "border-box",
          }}
        >
          <label
            htmlFor="input-chat-pesan"
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
            Ketik pesan
          </label>

          <input
            id="input-chat-pesan"
            type="text"
            value={inputPesan}
            onChange={(e) => setInputPesan(e.target.value)}
            placeholder="Ketik pesan..."
            style={{
              flex: 1,
              height: "46px",
              padding: "0 16px",
              borderRadius: "9999px",
              border: "1.5px solid #dce6f2",
              backgroundColor: "#f8faff",
              fontSize: "13px",
              color: "#26354b",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            aria-label="Kirim pesan"
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
              boxShadow: "0 2px 8px rgba(54, 136, 245, 0.3)",
              flexShrink: 0,
            }}
          >
            {/* Ikon Kirim (Paper Plane) */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
