"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import StageView from "@/app/components/room/StageView";
import ParticipantTile from "@/app/components/room/ParticipantTile";
import ControlBar from "@/app/components/room/ControlBar";
import ChatPanel from "@/app/components/room/ChatPanel";
import JoinRoomSheet from "@/app/components/room/JoinRoomSheet";
import LeaveConfirmDialog from "@/app/components/room/LeaveConfirmDialog";
import { useRoomMedia } from "@/app/components/room/useRoomMedia";
import { penggunaAktif, type Member } from "@/app/lib/mock-data";
import {
  getRoomParticipants,
  addParticipantToRoom,
  removeParticipantFromRoom,
  setupRoomPresence,
  useRoom,
} from "@/app/lib/room-store";
import "./room.css";

interface MockJoinRequest {
  id: string;
  nama: string;
  inisial: string;
  warnaAvatar: string;
}

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Cari room berdasarkan id atau kode dari store bersama secara reaktif
  const room = useRoom(id);

  // Status bergabung ke room (sebelum gabung, tampilkan sheet 'Siap bergabung?')
  const [sudahGabung, setSudahGabung] = useState(false);
  const [bukaChat, setBukaChat] = useState(false);
  const [bukaDialogKeluar, setBukaDialogKeluar] = useState(false);

  // Satu data mock permintaan bergabung untuk sidebar desktop
  const [permintaanBergabung, setPermintaanBergabung] =
    useState<MockJoinRequest | null>({
      id: "req-1",
      nama: "Rian Pratama",
      inisial: "RP",
      warnaAvatar: "#6366F1",
    });

  // Sumber data peserta untuk room ini dari room-store
  const [daftarPeserta, setDaftarPeserta] = useState<Member[]>(() => {
    if (!room) return [];
    return getRoomParticipants(room.id);
  });

  // Hook manajemen media lokal
  const media = useRoomMedia();

  // Sinkronisasi peserta room dari localStorage & presence
  useEffect(() => {
    if (!room) return;

    function handleLocalUpdate(e: Event) {
      const customEvent = e as CustomEvent<{
        roomId: string;
        participants: Member[];
      }>;
      if (customEvent.detail && customEvent.detail.roomId === room?.id) {
        setDaftarPeserta(customEvent.detail.participants);
      }
    }

    window.addEventListener("studybuddy_room_update", handleLocalUpdate);

    return () => {
      window.removeEventListener("studybuddy_room_update", handleLocalUpdate);
    };
  }, [room]);

  // Alur Masuk (Gabung Room)
  const handleJoinRoom = useCallback(
    async (micState: boolean, camState: boolean) => {
      if (!room) return;

      const myMember: Member = {
        id: penggunaAktif.id,
        nama: penggunaAktif.nama,
        inisial: penggunaAktif.nama[0]?.toUpperCase() || "Z",
        warnaAvatar: "#3688F5",
        micOn: micState,
        camOn: camState,
        speaking: false,
      };

      // Tambahkan saya ke peserta room di store & localStorage
      const updatedList = addParticipantToRoom(room.id, myMember);
      setDaftarPeserta(updatedList);
      setSudahGabung(true);

      // Toast: "<nama> bergabung"
      media.showToast(`${penggunaAktif.nama} bergabung`);

      // Nyalakan mic/kamera jika dipilih aktif pada sheet pra-gabung
      if (micState) {
        await media.toggleMic();
      }
      if (camState) {
        await media.toggleCam();
      }
    },
    [room, media]
  );

  // Alur Keluar (Leave Room)
  const handleLeaveRoom = useCallback(() => {
    if (!room) return;

    // Hentikan media jika masih menyala
    if (media.isCamOn) media.toggleCam();
    if (media.isScreenSharing) media.toggleScreenShare();

    // Hapus saya dari peserta di store
    removeParticipantFromRoom(room.id, penggunaAktif.id);

    setBukaDialogKeluar(false);
    setSudahGabung(false);

    // Navigasi kembali ke /room-server
    router.push("/room-server");
  }, [room, media, router]);

  // Tangani pagehide dan pembersihan saat keluar dari browser/tab
  useEffect(() => {
    if (!room || !sudahGabung) return;

    const handlePageHide = () => {
      removeParticipantFromRoom(room.id, penggunaAktif.id);
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [room, sudahGabung]);

  // Presence antar-tab dengan BroadcastChannel ("studybuddy-room-<id>")
  useEffect(() => {
    if (!room || !sudahGabung) return;

    const myMember: Member = {
      id: penggunaAktif.id,
      nama: penggunaAktif.nama,
      inisial: penggunaAktif.nama[0]?.toUpperCase() || "Z",
      warnaAvatar: "#3688F5",
      micOn: media.isMicOn,
      camOn: media.isCamOn,
      speaking: media.isSpeaking,
    };

    const cleanupPresence = setupRoomPresence(
      room.id,
      myMember,
      (updatedList) => {
        setDaftarPeserta(updatedList);
      }
    );

    return () => {
      cleanupPresence();
    };
  }, [room, sudahGabung, media.isMicOn, media.isCamOn, media.isSpeaking]);

  function handleIzinkanPermintaan(req: MockJoinRequest) {
    media.showToast(`${req.nama} diizinkan bergabung`);
    setPermintaanBergabung(null);
  }

  function handleTolakPermintaan(req: MockJoinRequest) {
    media.showToast(`Permintaan ${req.nama} ditolak`);
    setPermintaanBergabung(null);
  }

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
            <line x1="21" y1="2" x2="16.65" y2="16.65" />
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
          ID atau kode room yang Anda tuju tidak valid atau sesi belajar telah
          berakhir.
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

  // Presenter layar
  const presenter = daftarPeserta[0]?.nama || "Max Zul";
  const roomNama = room.nama || (room as unknown as { title?: string })?.title || "Room Belajar";
  const roomKode = room.kode || (room as unknown as { code?: string })?.code || "0000";

  return (
    <div className="room-page-wrapper">
      {/* Toast Notifikasi / Error Media Bahasa Indonesia */}
      {media.toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            backgroundColor: "#1e293b",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          <span>{media.toastMessage}</span>
        </div>
      )}

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
            onClick={() => {
              if (sudahGabung) {
                setBukaDialogKeluar(true);
              } else {
                router.push("/room-server");
              }
            }}
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
              title={roomNama}
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#26354b",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "320px",
              }}
            >
              {roomNama}
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
              Code Room: {roomKode} • {daftarPeserta.length} Peserta
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

      {/* Konten Utama Responsif (Mobile: 1 kolom; Desktop: 2 kolom) */}
      <main className="room-main-container">
        {/* Kolom / Area Utama */}
        <div className="room-primary-area">
          {/* Di Desktop (>=1024px): Strip thumbnail peserta di atas panggung */}
          <section
            aria-label="Thumbnail Peserta"
            className="room-desktop-strip"
          >
            {daftarPeserta.map((peserta) => {
              const isLocalUser = peserta.id === penggunaAktif.id;

              return (
                <ParticipantTile
                  key={`strip-${peserta.id}`}
                  member={peserta}
                  isLocalUser={isLocalUser}
                  localCameraStream={isLocalUser ? media.cameraStream : null}
                  isLocalSpeaking={isLocalUser ? media.isSpeaking : undefined}
                  isLocalMicOn={isLocalUser ? media.isMicOn : undefined}
                  compact={true}
                />
              );
            })}
          </section>

          {/* Panggung 16:9 Rounded dengan Overlay */}
          <StageView
            presenterName={presenter}
            screenStream={media.screenStream}
          />

          {/* Di Mobile (<768px) & Tablet (768-1023px): Grid Peserta di Bawah Panggung */}
          <section
            aria-label="Daftar Peserta Room"
            className="room-mobile-participants"
          >
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

            {/* Grid 2 Kolom (Mobile) atau 3 Kolom (Tablet) */}
            <div className="room-participants-grid">
              {daftarPeserta.map((peserta) => {
                const isLocalUser = peserta.id === penggunaAktif.id;

                return (
                  <ParticipantTile
                    key={peserta.id}
                    member={peserta}
                    isLocalUser={isLocalUser}
                    localCameraStream={isLocalUser ? media.cameraStream : null}
                    isLocalSpeaking={isLocalUser ? media.isSpeaking : undefined}
                    isLocalMicOn={isLocalUser ? media.isMicOn : undefined}
                  />
                );
              })}
            </div>
          </section>

          {/* Control bar khusus Desktop berupa pill biru muda di tengah bawah */}
          <div className="room-desktop-controlbar">
            <ControlBar
              isMicOn={media.isMicOn}
              isCamOn={media.isCamOn}
              isScreenSharing={media.isScreenSharing}
              isScreenShareSupported={media.isScreenShareSupported}
              onToggleMic={media.toggleMic}
              onToggleCam={media.toggleCam}
              onToggleScreenShare={media.toggleScreenShare}
              onCaptureScreenshot={media.captureScreenshot}
              onOpenChat={() => setBukaChat(true)}
              onLeaveClick={() => setBukaDialogKeluar(true)}
              isPill={true}
            />
          </div>
        </div>

        {/* Sidebar Kanan Desktop (±340px) */}
        <aside
          aria-label="Panel Samping Room"
          className="room-desktop-sidebar"
        >
          {/* Kartu Permintaan Bergabung (Satu data mock) */}
          {permintaanBergabung ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                border: "1.5px solid #e7edf5",
                padding: "16px",
                boxShadow: "0 2px 10px rgba(38, 53, 75, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#26354b",
                  }}
                >
                  Permintaan Bergabung
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#3688f5",
                    backgroundColor: "#edf5ff",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  1 baru
                </span>
              </div>

              {/* Data Pengguna Mock */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: permintaanBergabung.warnaAvatar,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 800,
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    userSelect: "none",
                  }}
                >
                  {permintaanBergabung.inisial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#26354b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {permintaanBergabung.nama}
                  </p>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Ingin bergabung ke room
                  </span>
                </div>
              </div>

              {/* Tombol Izinkan (Biru) & Tolak (Merah) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleIzinkanPermintaan(permintaanBergabung)}
                  style={{
                    minHeight: "44px",
                    borderRadius: "9999px",
                    backgroundColor: "#3688f5",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(54, 136, 245, 0.25)",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  Izinkan
                </button>
                <button
                  type="button"
                  onClick={() => handleTolakPermintaan(permintaanBergabung)}
                  style={{
                    minHeight: "44px",
                    borderRadius: "9999px",
                    backgroundColor: "#fff1f2",
                    color: "#ef4444",
                    border: "1px solid #fecdd3",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  Tolak
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                border: "1px dashed #cbd5e1",
                padding: "12px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Tidak ada permintaan bergabung baru
            </div>
          )}

          {/* Panel Chat yang Selalu Tampil di Desktop */}
          <ChatPanel
            isOpen={true}
            onClose={() => {}}
            embedded={true}
          />
        </aside>
      </main>

      {/* Panel Kontrol di Mobile & Tablet (Menempel di Bagian Bawah) */}
      <div className="room-mobile-controlbar">
        <ControlBar
          isMicOn={media.isMicOn}
          isCamOn={media.isCamOn}
          isScreenSharing={media.isScreenSharing}
          isScreenShareSupported={media.isScreenShareSupported}
          onToggleMic={media.toggleMic}
          onToggleCam={media.toggleCam}
          onToggleScreenShare={media.toggleScreenShare}
          onCaptureScreenshot={media.captureScreenshot}
          onOpenChat={() => setBukaChat(true)}
          onLeaveClick={() => setBukaDialogKeluar(true)}
          isPill={false}
        />
      </div>

      {/* Bottom Sheet "Siap bergabung?" sebelum masuk live room */}
      <JoinRoomSheet
        isOpen={!sudahGabung}
        room={room}
        currentParticipants={daftarPeserta}
        onJoin={handleJoinRoom}
        onCancel={() => {
          if (room) {
            removeParticipantFromRoom(room.id, penggunaAktif.id);
          }
          router.push("/room-server");
        }}
      />

      {/* Dialog Konfirmasi "Keluar dari room?" */}
      <LeaveConfirmDialog
        isOpen={bukaDialogKeluar}
        onConfirm={handleLeaveRoom}
        onCancel={() => setBukaDialogKeluar(false)}
      />

      {/* Panel Obrolan (Chat Bottom Sheet untuk Mobile & Tablet) */}
      <ChatPanel
        isOpen={bukaChat}
        onClose={() => setBukaChat(false)}
        embedded={false}
      />
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
