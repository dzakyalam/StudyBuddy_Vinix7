"use client";

import { useEffect, useRef } from "react";
import type { Member } from "@/app/lib/mock-data";

export interface ParticipantTileProps {
  member: Member;
  isLocalUser?: boolean;
  localCameraStream?: MediaStream | null;
  isLocalSpeaking?: boolean;
  isLocalMicOn?: boolean;
  compact?: boolean;
}

export default function ParticipantTile({
  member,
  isLocalUser = false,
  localCameraStream = null,
  isLocalSpeaking,
  isLocalMicOn,
  compact = false,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sambungkan localCameraStream ke elemen video
  useEffect(() => {
    if (videoRef.current && localCameraStream) {
      videoRef.current.srcObject = localCameraStream;
    }
  }, [localCameraStream]);

  // Nilai status jika tile ini adalah pengguna aktif lokal
  const isSpeaking = isLocalUser && isLocalSpeaking !== undefined
    ? isLocalSpeaking
    : member.speaking;

  const isMicOn = isLocalUser && isLocalMicOn !== undefined
    ? isLocalMicOn
    : member.micOn;

  const avatarSize = compact ? "42px" : "56px";

  return (
    <div
      style={{
        backgroundColor: "#edf5ff",
        borderRadius: compact ? "14px" : "18px",
        padding: compact ? "10px 8px 8px" : "16px 12px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        boxSizing: "border-box",
        width: compact ? "120px" : "100%",
        minWidth: compact ? "120px" : undefined,
        flexShrink: compact ? 0 : undefined,
        border: isSpeaking ? "3px solid #3688f5" : "1.5px solid #dce8f8",
        boxShadow: isSpeaking ? "0 0 12px rgba(54, 136, 245, 0.25)" : "none",
        transition: "border 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Tampilan Avatar / Video Kamera */}
      {isLocalUser && localCameraStream ? (
        // Video Lokal (Mirror, Muted)
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Video kamera Anda"
          style={{
            width: avatarSize,
            height: avatarSize,
            minWidth: avatarSize,
            minHeight: avatarSize,
            borderRadius: compact ? "10px" : "14px",
            objectFit: "cover",
            transform: "scaleX(-1)", // Mirror
            backgroundColor: "#000000",
            boxShadow: "0 3px 8px rgba(0, 0, 0, 0.12)",
          }}
        />
      ) : (
        // Avatar PERSEGI bersudut membulat (inisial berwarna)
        <div
          aria-hidden="true"
          style={{
            width: avatarSize,
            height: avatarSize,
            minWidth: avatarSize,
            minHeight: avatarSize,
            borderRadius: compact ? "10px" : "14px", // Persegi bersudut membulat
            backgroundColor: member.warnaAvatar || "#3688f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: compact ? "15px" : "18px",
            fontWeight: 800,
            boxShadow: "0 3px 8px rgba(0, 0, 0, 0.12)",
            userSelect: "none",
          }}
        >
          {member.inisial}
        </div>
      )}

      {/* Nama di bawah avatar */}
      <span
        style={{
          fontSize: compact ? "11px" : "13px",
          fontWeight: 700,
          color: "#26354b",
          marginTop: compact ? "6px" : "10px",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {member.nama} {isLocalUser && "(Anda)"}
      </span>

      {/* Ikon mic dan orang kecil di kanan bawah */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {/* Ikon Mic: merah dicoret bila mati, biru/abu bila aktif */}
        {isMicOn ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isSpeaking ? "#3688f5" : "#64748b"}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Mikrofon aktif"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Mikrofon nonaktif"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}

        {/* Ikon Orang Kecil */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    </div>
  );
}
