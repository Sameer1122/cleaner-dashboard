"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type Item = {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
};

const items: Item[] = [
  {
    href: "/",
    label: "Home",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-10.5z" />
      </svg>
    ),
  },
  {
    href: "/cleaner",
    label: "Cleaners",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8h18" />
        <path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8" />
        <path d="M8 8V6a4 4 0 018 0v2" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
        <path d="M19.4 15a1.7 1.7 0 00.33 1.86l.05.05a2 2 0 01-2.83 2.83l-.05-.05a1.7 1.7 0 00-1.86-.33 1.7 1.7 0 00-1 1.55V21a2 2 0 01-4 0v-.14A1.7 1.7 0 009.4 19.7a1.7 1.7 0 00-1.86.33l-.05.05A2 2 0 014.66 17.2l.05-.05A1.7 1.7 0 005.04 15a1.7 1.7 0 00-1.55-1H3.3a2 2 0 010-4h.14A1.7 1.7 0 005 8.4a1.7 1.7 0 00-.33-1.86l-.05-.05A2 2 0 017.45 3.66l.05.05A1.7 1.7 0 009.36 4a1.7 1.7 0 001-1.55V2.3a2 2 0 014 0v.14A1.7 1.7 0 0015 4.3a1.7 1.7 0 001.86-.33l.05-.05A2 2 0 0119.34 6.8l-.05.05A1.7 1.7 0 0019 8.4c.6.32 1 .94 1 1.6s-.4 1.28-1 1.6z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("sidebar:collapsed");
    const c = saved === "true";
    setCollapsed(c);
    document.documentElement.style.setProperty("--sidebar-w", c ? "4rem" : "14rem");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sidebar:collapsed", String(collapsed));
    document.documentElement.style.setProperty("--sidebar-w", collapsed ? "4rem" : "14rem");
  }, [collapsed]);

  return (
    <aside
      data-collapsed={collapsed}
      className={`fixed left-0 top-0 z-30 h-dvh overflow-hidden border-r border-input/50 bg-background/80 backdrop-blur transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <nav className="flex h-full flex-col px-2 py-3">
        {!collapsed && (
          <div className="mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">Menu</div>
        )}
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={`group flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent/60 ${
                    active ? "bg-accent/60 text-foreground" : "text-muted-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.icon(active)}
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? "hidden" : "opacity-100"}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto px-2">
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center justify-center rounded-md border border-input/50 bg-background/70 py-2 text-sm hover:bg-accent/60"
          >
            {collapsed ? (
              // chevron-right
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 6l6 6-6 6" />
              </svg>
            ) : (
              // chevron-left
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 6l-6 6 6 6" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
}
