import type { TemplateId } from "./store";

export interface CvTemplate {
  id: TemplateId;
  name: string;
  description: string;
  recommended?: boolean;
  /** Szablon ma miejsce na zdjęcie kandydata (edytor pokaże wgrywanie). */
  withPhoto?: boolean;
}

/** Czy dany szablon korzysta ze zdjęcia kandydata. */
export function templateUsesPhoto(id: TemplateId): boolean {
  return CV_TEMPLATES.find((t) => t.id === id)?.withPhoto === true;
}

/** Wspólny rejestr szablonów dostępnych w obu miejscach wyboru CV. */
export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: "nowoczesny",
    name: "Nowoczesny",
    description:
      "Granatowe akcenty i wyraźna hierarchia. Uniwersalny wybór, w pełni czytelny dla ATS.",
    recommended: true,
  },
  {
    id: "klasyczny",
    name: "Klasyczny",
    description:
      "Czerń i biel, bez ozdobników. Bezpieczny wybór do konserwatywnych branż.",
  },
  {
    id: "minimalny",
    name: "Minimalny",
    description:
      "Dużo światła, cienkie linie i spokojna typografia dla zwięzłego CV.",
  },
  {
    id: "elegancki",
    name: "Elegancki",
    description:
      "Stonowany granat i bardziej reprezentacyjny nagłówek dla ról eksperckich.",
  },
  {
    id: "boczny",
    name: "Boczny panel",
    description:
      "Dwie kolumny ze zdjęciem — kontakt, umiejętności i języki w bocznym pasku. Efektowny dla rekrutera, a tekst zapisujemy w kolejności czytelnej także dla systemów rekrutacyjnych.",
    withPhoto: true,
  },
  {
    id: "prestizowy",
    name: "Prestiżowy",
    description:
      "Jedna kolumna, okrągłe zdjęcie w nagłówku i jeden stonowany akcent w morskiej zieleni. Dużo światła — czyta się jak dokument premium.",
    withPhoto: true,
  },
  {
    id: "kompaktowy",
    name: "Kompaktowy",
    description:
      "Gęstszy rytm i oszczędne odstępy — dobry wybór dla dłuższego doświadczenia.",
  },
];
