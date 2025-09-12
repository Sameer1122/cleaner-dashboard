"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  return prefersDark ? "dark" : "light";
};

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  // Close on outside click / escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem("theme", next);
    } catch {}
  };

  const onLogout = async () => {
    startTransition(async () => {
      try {
        await axios.post("/api/logout");
      } catch {}
      router.push("/login");
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="px-4" style={{ paddingLeft: "calc(var(--sidebar-w, 14rem) + 1rem)" }}>
        <div className="mt-3 flex h-14 items-center justify-between rounded-xl border border-input/50 bg-background/70 px-3 shadow-md backdrop-blur">
          {/* Brand (left) */}
          <Link href="/" className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/60">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow ring-1 ring-input/60">
              <svg viewBox="0 0 48 48" className="h-5 w-5 text-primary-foreground">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path fill="url(#g1)" d="M24 6c10 0 18 8 18 18s-8 18-18 18S6 34 6 24 14 6 24 6zm0 6a12 12 0 100 24 12 12 0 000-24z" />
                <circle cx="24" cy="24" r="6" fill="white" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Blue Ridge</p>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </Link>

          {/* User menu (right) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="group grid h-10 w-10 place-items-center overflow-hidden rounded-full ring-1 ring-input/60 transition hover:ring-input focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="User menu"
            >
              <div className="relative h-full w-full bg-gradient-to-br from-primary/80 to-primary">
                <span className="absolute inset-0 grid place-items-center text-primary-foreground font-semibold">
                  U
                </span>
              </div>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-input/50 bg-background/95 p-1.5 text-sm text-foreground shadow-lg ring-1 ring-black/5 backdrop-blur"
              >
                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                  <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                    <span className="text-xs font-semibold">U</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">user@example.com</p>
                    <p className="truncate text-xs text-muted-foreground">Signed in</p>
                  </div>
                </div>
                <div className="h-px bg-input/50" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-accent/60"
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
                    <path d="M19.4 15a1.7 1.7 0 00.33 1.86l.05.05a2 2 0 01-2.83 2.83l-.05-.05a1.7 1.7 0 00-1.86-.33 1.7 1.7 0 00-1 1.55V21a2 2 0 01-4 0v-.14A1.7 1.7 0 009.4 19.7a1.7 1.7 0 00-1.86.33l-.05.05A2 2 0 014.66 17.2l.05-.05A1.7 1.7 0 005.04 15a1.7 1.7 0 00-1.55-1H3.3a2 2 0 010-4h.14A1.7 1.7 0 005 8.4a1.7 1.7 0 00-.33-1.86l-.05-.05A2 2 0 017.45 3.66l.05.05A1.7 1.7 0 009.36 4a1.7 1.7 0 001-1.55V2.3a2 2 0 014 0v.14A1.7 1.7 0 0015 4.3a1.7 1.7 0 001.86-.33l.05-.05A2 2 0 0119.34 6.8l-.05.05A1.7 1.7 0 0019 8.4c.6.32 1 .94 1 1.6s-.4 1.28-1 1.6z" />
                  </svg>
                  Settings
                </button>

                <div className="mx-3 flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    {theme === "dark" ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 6.07l-1.41-1.41M8.34 8.34L6.93 6.93m10.14-0l-1.41 1.41M8.34 15.66l-1.41 1.41" />
                      </svg>
                    )}
                    <span>Theme</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle dark mode"
                    aria-pressed={theme === "dark"}
                    className={`relative h-6 w-11 rounded-full transition-colors ${theme === "dark" ? "bg-accent" : "bg-accent"}`}
                  >
                    <span
                      className={`absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-background shadow transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                <div className="h-px bg-input/50" />
                <button
                  onClick={onLogout}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-red-600 hover:bg-accent/60 disabled:opacity-60"
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 21H7a2 2 0 01-2-2V5a2 2 0 012-2h2" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
