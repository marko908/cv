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
