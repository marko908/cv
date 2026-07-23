"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  Target,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/app", label: "Start", icon: Home },
  { href: "/app/kreator", label: "Moje CV", icon: FileText },
  { href: "/app/dopasowania", label: "Dopasowania", icon: Target },
];

const upcomingItems = [
  { label: "Oferty pracy", icon: Briefcase },
  { label: "Rozmowa kwalifikacyjna", icon: MessageSquare },
  { label: "Profil", icon: User },
];

/**
 * Zawartość paska bocznego — współdzielona przez stały sidebar (desktop)
 * i wysuwany panel (mobile).
 */
export function SidebarContent({
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div
        className={cn(
          "flex items-center pb-4 pt-5",
          collapsed ? "flex-col gap-3 px-0" : "justify-between pl-5 pr-3"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5"
          title="CV Copilot PL"
          onClick={onNavigate}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
            <FileText className="size-4 text-primary-foreground" />
          </span>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight">
              CV Copilot PL
            </span>
          )}
        </Link>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? "Rozwiń nawigację" : "Zwiń nawigację"}
            className="hidden size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        )}
      </div>

      <nav className={cn("flex flex-col gap-0.5", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-accent font-bold text-foreground"
                  : "font-normal text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-6 px-3">
          <p className="eyebrow px-3 pb-2 text-muted-foreground/60">Wkrótce</p>
          {upcomingItems.map((item) => (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/40"
            >
              <item.icon className="size-4" />
              {item.label}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "mt-auto border-t border-border/60 py-3",
          collapsed ? "px-2" : "px-3"
        )}
      >
        <Link
          href="/app/ustawienia"
          title="Ustawienia"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
            collapsed ? "justify-center px-0" : "px-3",
            pathname.startsWith("/app/ustawienia")
              ? "bg-accent font-bold text-foreground"
              : "font-normal text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && "Ustawienia"}
        </Link>
      </div>
    </div>
  );
}
