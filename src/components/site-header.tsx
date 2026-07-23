import Link from "next/link";
import { FileText } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary">
            <FileText className="size-4 text-primary-foreground" />
          </span>
          <span className="text-[15px] font-bold tracking-tight">
            CV Copilot PL
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
