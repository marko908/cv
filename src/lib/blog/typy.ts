/**
 * Kształt wpisu bloga — odpowiada 1:1 tabeli `wpis_bloga`
 * (`supabase/migrations/20260810160000_blog.sql`).
 *
 * Typy pisane RĘCZNIE, mimo że `typy-bazy.ts` jest generowane: `faq` to
 * w bazie JSONB, więc generator zna je wyłącznie jako `Json`. Tutaj mówimy,
 * co tam naprawdę siedzi (`PozycjaFaq[]`) — dokładnie ta sama decyzja, co przy
 * `tresc`/`ai_meta` w `repo.ts`.
 */

export type StatusWpisu = "szkic" | "opublikowany" | "zarchiwizowany";

/** Jedna para pytanie/odpowiedź — zasila też FAQPage schema.org. */
export interface PozycjaFaq {
  pytanie: string;
  odpowiedz: string;
}

export interface WpisBloga {
  id: string;
  tytul: string;
  slug: string;
  zajawka: string | null;
  /** HTML. Pisze go wyłącznie administrator — renderujemy jako zaufany. */
  tresc: string;
  okladka_url: string | null;
  okladka_alt: string | null;
  meta_tytul: string | null;
  meta_opis: string | null;
  canonical_url: string | null;
  kategoria: string;
  tagi: string[];
  czas_czytania_min: number;
  status: StatusWpisu;
  opublikowano_o: string | null;
  token_podgladu: string | null;
  faq: PozycjaFaq[];
  utworzono: string;
  updated_at: string;
}

/**
 * Podzbiór pól potrzebny na liście. Osobny typ, bo lista NIE pobiera `tresc`
 * — przy kilkudziesięciu wpisach to różnica między kilkoma kB a megabajtami
 * przesyłanymi przy każdym wejściu na `/blog`.
 */
export interface WpisNaLiscie {
  id: string;
  tytul: string;
  slug: string;
  zajawka: string | null;
  okladka_url: string | null;
  okladka_alt: string | null;
  kategoria: string;
  czas_czytania_min: number;
  opublikowano_o: string | null;
}

export type WpisDoZapisu = Omit<WpisBloga, "id" | "utworzono" | "updated_at">;
export type WpisDoAktualizacji = Partial<WpisDoZapisu>;

/** Kategorie do selecta w panelu — dopasowane do tematyki Aplikando. */
export const KATEGORIE_BLOGA = [
  "pisanie CV",
  "list motywacyjny",
  "rozmowa kwalifikacyjna",
  "szukanie pracy",
  "ATS i rekrutacja",
  "rynek pracy",
] as const;
