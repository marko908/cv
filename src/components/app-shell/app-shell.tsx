"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, X } from "lucide-react";
import { SidebarContent } from "./app-sidebar";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "cv-copilot-sidebar-collapsed";

/**
 * Powłoka aplikacji: stały pasek boczny na desktopie (zwijany) oraz wysuwany
 * panel z mobilnym paskiem górnym (hamburger) poniżej breakpointu md.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  // Zamknij wysuwany panel po zmianie trasy.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
  };

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar — desktop (stały, zwijany) */}
      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={toggleCollapse} />
      </aside>

      {/* Sidebar — mobile (wysuwany panel) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Zamknij menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 max-w-[80vw] shadow-dialog">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <button
              type="button"
              aria-label="Zamknij menu"
              className="absolute right-2 top-3 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Kolumna główna */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Pasek górny — tylko mobile */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background px-4 md:hidden">
          <button
            type="button"
            aria-label="Otwórz menu"
            onClick={() => setMobileOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary">
              <FileText className="size-3.5 text-primary-foreground" />
            </span>
            <span className="text-sm font-bold tracking-tight">
              CV Copilot PL
            </span>
          </Link>
        </header>

        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
