"use client";

import { useRouter } from "next/navigation";
import Shell from "@/components/forgot-password/Shell";
import PrivacySettings from "@/components/forgot-password/PrivacySettings";

// Halaman 3: pengaturan privasi  ->  /privasi
export default function PrivasiPage() {
  const router = useRouter();

  return (
    <Shell>
      <PrivacySettings
        onBack={() => router.back()}
        onDone={() => router.push("/login")}
      />
    </Shell>
  );
}
