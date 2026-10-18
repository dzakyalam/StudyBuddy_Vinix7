import Navbar from "@/components/navbar/Navbar";
import SearchExperience from "@/components/SearchExperience";

/**
 * Route mandiri `/search` (dipakai ikon di halaman Chat).
 * Konten pencarian yang sama juga dipakai inline di halaman Home
 * (menggantikan konten Home tanpa pindah halaman).
 */
export default function SearchPage() {
  return (
    <main className="app-shell">
      <div className="home-content">
        <SearchExperience />
      </div>
      <Navbar active="Home" />
    </main>
  );
}
