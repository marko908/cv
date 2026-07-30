import Image from "next/image";
import Link from "next/link";

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
        <nav className="flex items-center gap-2">
          <Link
            href="/app"
            className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
          >Otwórz aplikację</Link>
        </nav>
      </div>
    </header>
  );
}
