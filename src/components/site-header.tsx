import Image from "next/image";
import Link from "next/link";
import { PrzyciskiKontaNaglowek } from "@/components/auth/menu-konta";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/aplikando-icon.png"
            alt=""
            width={32}
            height={26}
            className="h-8 w-auto"
          />
          <span className="text-[15px] font-bold tracking-tight">
            Aplikando
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {/* Blog widoczny TAKŻE na telefonie (bez `hidden sm:inline-block`,
              które ukrywa Cennik) — to wejście dla ruchu z wyszukiwarki,
              a większość tego ruchu przychodzi z telefonu. */}
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Blog
          </Link>
          <Link
            href="/#cennik"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
          >
            Cennik
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <PrzyciskiKontaNaglowek />
          </div>
        </nav>
      </div>
    </header>
  );
}
