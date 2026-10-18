"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: (isActive: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: (isActive) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? "2.4" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
  },
  {
    label: "Chat",
    href: "/chat",
    icon: (isActive) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? "2.4" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    label: "Room Server",
    href: "/room-server",
    icon: (isActive) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? "2.4" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Ikon Monitor / Room Server */}
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: "Jadwal",
    href: "/jadwal",
    icon: (isActive) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? "2.4" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Profil",
    href: "/profil",
    icon: (isActive) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={isActive ? "2.4" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi Utama"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          pointerEvents: "auto",
          backgroundColor: "#ffffff",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          borderTop: "1.5px solid #cce1ff",
          borderLeft: "1px solid #edf4fc",
          borderRight: "1px solid #edf4fc",
          boxShadow: "0 -4px 18px rgba(54, 136, 245, 0.08)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          paddingTop: "8px",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
          paddingLeft: "8px",
          paddingRight: "8px",
          boxSizing: "border-box",
        }}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          const activeColor = "#3688f5";
          const inactiveColor = "#475569";
          const currentColor = isActive ? activeColor : inactiveColor;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              style={{
                flex: 1,
                minWidth: "44px",
                minHeight: "44px",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                textDecoration: "none",
                color: currentColor,
                transition: "color 0.15s ease",
                padding: "2px 0",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                }}
              >
                {item.icon(isActive)}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
