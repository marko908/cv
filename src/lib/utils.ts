import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Polska odmiana rzeczownika przez liczebnik.
 * plural(1, "poprawka", "poprawki", "poprawek") → "poprawka"
 * plural(3, ...) → "poprawki", plural(5, ...) → "poprawek"
 */
export function plural(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  if (n === 1) return one
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

/** Skrót: „N poprawek" z poprawną odmianą. */
export function pluralize(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  return `${n} ${plural(n, one, few, many)}`
}

/**
 * Zamienia adres profilu na parę: krótka etykieta + pełny adres.
 *
 * W CV lepiej wygląda klikalne „LinkedIn" niż surowy adres na pół linijki, ale
 * pod spodem musi zostać PRAWDZIWY odnośnik — inaczej rekruter widzi napis,
 * którego nie da się kliknąć (realny błąd zgłoszony przez użytkownika).
 * Zwraca null, gdy pole jest puste.
 */
export function opisLinku(
  surowy?: string
): { etykieta: string; href: string | null } | null {
  const t = (surowy ?? "").trim()
  if (!t) return null

  const href = /^https?:\/\//i.test(t) ? t : `https://${t}`
  let host = ""
  try {
    host = new URL(href).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    // Nie da się sparsować — pokazujemy to, co wpisał użytkownik, jako tekst.
    return { etykieta: t, href: null }
  }

  // Sam napis („LinkedIn") bez domeny to NIE jest adres — renderujemy go jako
  // zwykły tekst, zamiast robić martwy odnośnik do „https://LinkedIn".
  if (!host.includes(".")) return { etykieta: t, href: null }

  if (host.includes("linkedin")) return { etykieta: "LinkedIn", href }
  if (host.includes("github")) return { etykieta: "GitHub", href }
  if (host.includes("behance")) return { etykieta: "Behance", href }
  if (host.includes("dribbble")) return { etykieta: "Dribbble", href }
  if (host.includes("gitlab")) return { etykieta: "GitLab", href }

  // Nieznany serwis: pokazujemy adres bez protokołu i bez końcowego ukośnika.
  return { etykieta: href.replace(/^https?:\/\//i, "").replace(/\/$/, ""), href }
}
