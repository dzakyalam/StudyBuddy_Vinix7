
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "StudyBuddy",
  description: "Komunitas belajar bersama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <Suspense fallback={null}>
          <AuthGuard>{children}</AuthGuard>
        </Suspense>
      </body>
    </html>
  );
}
