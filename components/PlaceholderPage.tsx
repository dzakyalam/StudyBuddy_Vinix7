import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import styles from "./PlaceholderPage.module.css";

/**
 * Halaman sementara untuk menu yang belum punya halaman asli.
 * Dipakai oleh /room-server dan /jadwal.
 */
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className={styles.screen}>
      <header className={styles.topHeader}>
        <Link href="/home" className={styles.backArrow} aria-label="Kembali">
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2L2 10L10 18"
              stroke="#070707"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className={styles.screenTitle}>{title}</h1>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.body}>
        <div className={styles.icon}>🚧</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.text}>
          Halaman ini sedang dalam pengembangan. Silakan kembali lagi nanti.
        </p>
        <Link href="/home" className={styles.button}>
          Kembali ke Home
        </Link>
      </div>

      <Navbar />
    </main>
  );
}
