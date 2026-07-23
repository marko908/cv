import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pusty stan w stylu ResuMax: ikona, eyebrow, tytuł, opis, jedno CTA. */
export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className
      )}
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="eyebrow text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-2 text-base font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
