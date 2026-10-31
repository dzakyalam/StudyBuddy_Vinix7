"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

/**
 * Halaman yang boleh diakses TANPA login.
 * Semua path lain (/home, /chat, /jadwal, /profil, dst.) otomatis diproteksi.
 */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/registrasi",
  "/lupa-sandi",
  "/otp",
  "/privacy-policy",
  "/privasi",
  "/contact-us",
  "/help-support",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/"))
  );
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const publicPage = isPublic(pathname);

  // Hanya perlu "memeriksa" kalau halamannya terproteksi
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (publicPage) return;

    let active = true;

    function toLogin() {
      setAllowed(false);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }

    // Cek sesi saat halaman dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) setAllowed(true);
      else toLogin();
    });

    // Kalau user logout / sesi habis di tengah jalan, tendang ke login
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) toLogin();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, publicPage, router]);

  if (publicPage) return <>{children}</>;
  if (!allowed) return null; // atau ganti dengan spinner/loading

  return <>{children}</>;
}
