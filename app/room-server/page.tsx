import Header from "@/app/components/room/Header";
import BottomNav from "@/app/components/room/BottomNav";

export default function RoomServerPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        maxWidth: "480px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          padding: "24px 16px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Halaman uji sementara kosong */}
      </main>

      <BottomNav />
    </div>
  );
}
