import type { TemplateId } from "./store";

/**
 * Zdjęcie poglądowe pokazywane WYŁĄCZNIE w miniaturach wyboru szablonu.
 * Dzięki niemu od razu widać, że dany układ ma miejsce na zdjęcie. Do CV
 * użytkownika nigdy nie trafia — eksport PDF korzysta tylko z
 * `personal_info.photo`, czyli z pliku wgranego przez użytkownika.
 */
export const STOCK_PHOTO = "/stock/kandydat.jpg";

/**
 * Etykiety szablonów — służą do grupowania w galerii i do filtrowania.
 * Dodanie nowego taga = możliwa nowa kategoria, bez zmian w komponentach.
 */
export type TemplateTag =
  | "ze-zdjeciem"
  | "bez-zdjecia"
  | "jednokolumnowy"
  | "dwukolumnowy"
  | "minimalistyczny"
  | "klasyczny"
  | "nowoczesny";

export interface CvTemplate {
  id: TemplateId;
  name: string;
  description: string;
  recommended?: boolean;
  /** Szablon ma miejsce na zdjęcie kandydata (edytor pokaże wgrywanie). */
  withPhoto?: boolean;
  /** Etykiety do grupowania w galerii i przyszłego filtrowania. */
  tags: TemplateTag[];
}

/** Wspólny rejestr szablonów dostępnych w obu miejscach wyboru CV. */
export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: "nowoczesny",
    name: "Nowoczesny",
    description:
      "Granatowe akcenty i wyraźna hierarchia. Uniwersalny wybór, w pełni czytelny dla ATS.",
    recommended: true,
    tags: ["bez-zdjecia", "jednokolumnowy", "nowoczesny"],
  },
  {
    id: "klasyczny",
    name: "Klasyczny",
    description:
      "Czerń i biel, bez ozdobników. Bezpieczny wybór do konserwatywnych branż.",
    tags: ["bez-zdjecia", "jednokolumnowy", "klasyczny"],
  },
  {
    id: "minimalny",
    name: "Minimalny",
    description:
      "Dużo światła, cienkie linie i spokojna typografia dla zwięzłego CV.",
    tags: ["bez-zdjecia", "jednokolumnowy", "minimalistyczny"],
  },
  {
    id: "elegancki",
    name: "Elegancki",
    description:
      "Stonowany granat i bardziej reprezentacyjny nagłówek dla ról eksperckich.",
    tags: ["bez-zdjecia", "jednokolumnowy", "klasyczny"],
  },
  {
    id: "prestizowy",
    name: "Prestiżowy",
    description:
      "Jedna kolumna, okrągłe zdjęcie w nagłówku i jeden stonowany akcent w morskiej zieleni. Dużo światła — czyta się jak dokument premium.",
    withPhoto: true,
    tags: ["ze-zdjeciem", "jednokolumnowy", "nowoczesny"],
  },
  {
    id: "boczny",
    name: "Boczny panel",
    description:
      "Dwie kolumny ze zdjęciem — kontakt, umiejętności i języki w bocznym pasku. Efektowny dla rekrutera, a tekst zapisujemy w kolejności czytelnej także dla systemów rekrutacyjnych.",
    withPhoto: true,
    tags: ["ze-zdjeciem", "dwukolumnowy", "klasyczny"],
  },
  {
    id: "kompaktowy",
    name: "Kompaktowy",
    description:
      "Gęstszy rytm i oszczędne odstępy — dobry wybór dla dłuższego doświadczenia.",
    tags: ["bez-zdjecia", "jednokolumnowy", "minimalistyczny"],
  },
];

/** Czy dany szablon korzysta ze zdjęcia kandydata. */
export function templateUsesPhoto(id: TemplateId): boolean {
  return CV_TEMPLATES.find((t) => t.id === id)?.withPhoto === true;
}

/** Szablony oznaczone danym tagiem, w kolejności z rejestru. */
export function templatesByTag(tag: TemplateTag): CvTemplate[] {
  return CV_TEMPLATES.filter((t) => t.tags.includes(tag));
}

/**
 * Kategorie widoczne w galerii — jeden wiersz na kategorię, przewijany w bok.
 * Na razie dzielimy po obecności zdjęcia; kolejne podziały wystarczy tu dopisać,
 * bo galeria czyta tę listę i nie zna konkretnych szablonów.
 */
export const TEMPLATE_CATEGORIES: {
  tag: TemplateTag;
  label: string;
  opis: string;
}[] = [
  {
    tag: "ze-zdjeciem",
    label: "Ze zdjęciem",
    opis: "Zdjęcie wgrasz i wykadrujesz w sekcji „Dane osobowe”.",
  },
  {
    tag: "bez-zdjecia",
    label: "Bez zdjęcia",
    opis: "Sam tekst — najprostsze w odbiorze i dla ludzi, i dla automatów.",
  },
];
