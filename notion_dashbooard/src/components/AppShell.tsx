"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/plan", label: "Week plan" },
  { href: "/revise", label: "Review" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") {
    return <div className="min-h-screen">{children}</div>;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 border-b px-5 py-3 md:px-8"
        style={{
          background: "rgba(16, 17, 12, 0.92)",
          borderColor: "var(--border)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            Notion Dash
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-sm transition-colors"
                  style={{
                    background: active ? "var(--bg-hover)" : "transparent",
                    color: active ? "var(--text)" : "var(--text-secondary)",
                    border: active
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => void logout()}
              className="ml-1 rounded-lg px-3 py-1.5 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Lock
            </button>
          </nav>
        </div>
      </header>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
