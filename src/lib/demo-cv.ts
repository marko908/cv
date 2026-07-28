import type { TailoredCv } from "./cv-schema";
import { DEFAULT_RODO_CLAUSE } from "./cv-schema";

/**
 * CV pokazowe UŻYWANE WYŁĄCZNIE W GALERII SZABLONÓW.
 *
 * Ma dwa zadania:
 *  1. Wypełnić całą stronę A4 w KAŻDYM szablonie — także w najgęstszym
 *     („kompaktowy"). Dzięki temu żadna miniatura nie ma pustego pasa na dole,
 *     a wszystkie kończą się na tej samej wysokości.
 *  2. Dać uczciwe porównanie układów: każdy szablon dostaje te same dane,
 *     więc różnice widać w typografii i siatce, a nie w ilości treści.
 *
 * Nie mylić z `sampleCvs` (sample-cv.ts) — tamte są do wczytania jako realne
 * dane użytkownika w edytorze.
 */
export const demoCv: TailoredCv = {
  personal_info: {
    full_name: "Michał Zawadzki",
    title: "Senior Product Manager",
    email: "michal.zawadzki@example.com",
    phone: "+48 601 234 567",
    location: "Warszawa",
    linkedin_or_github: "https://linkedin.com/in/michal-zawadzki",
  },
  professional_summary:
    "Product Manager z 8-letnim doświadczeniem w budowie produktów cyfrowych dla rynku B2B. Prowadziłem zespoły od odkrywania potrzeb po wdrożenie i skalowanie; ostatnio zwiększyłem retencję kluczowego produktu o 24% w rok. Łączę pracę z danymi z bliskim kontaktem z klientem — najlepsze decyzje podejmuję po rozmowie z użytkownikiem, nie tylko po wykresie.",
  experience: [
    {
      company: "Nordvia Software",
      role: "Senior Product Manager",
      location: "Warszawa (hybrydowo)",
      period: "04.2021 – obecnie",
      bullets: [
        "Zwiększyłem retencję 12-miesięczną platformy B2B z 61% do 85% dzięki przebudowie procesu wdrożenia klienta.",
        "Zbudowałem od zera zespół produktowy (6 osób) i wprowadziłem cykl odkrywania potrzeb oparty na wywiadach z klientami.",
        "Wprowadziłem model wyceny oparty na zużyciu, co podniosło średni przychód na klienta o 31%.",
        "Skróciłem czas od pomysłu do wdrożenia z 14 do 6 tygodni, porządkując backlog i kryteria gotowości.",
      ],
    },
    {
      company: "Kaleido Group",
      role: "Product Manager",
      location: "Kraków",
      period: "08.2018 – 03.2021",
      bullets: [
        "Odpowiadałem za aplikację mobilną z 240 tys. aktywnych użytkowników miesięcznie.",
        "Przeprowadziłem migrację na nowy system płatności bez przerwy w działaniu usługi.",
        "Zwiększyłem konwersję rejestracji o 18%, upraszczając formularz z 9 do 4 pól.",
      ],
    },
    {
      company: "Sensora Labs",
      role: "Junior Product Manager",
      location: "Wrocław",
      period: "09.2016 – 07.2018",
      bullets: [
        "Prowadziłem badania z użytkownikami i przygotowałem 40 wywiadów pogłębionych.",
        "Opracowałem pierwszy zestaw wskaźników produktowych używany do dziś przez zespół.",
      ],
    },
    {
      company: "Formica Interactive",
      role: "Analityk biznesowy",
      location: "Wrocław",
      period: "07.2015 – 08.2016",
      bullets: [
        "Zebrałem wymagania dla 3 wdrożeń u klientów z branży logistycznej.",
        "Zautomatyzowałem raportowanie miesięczne, oszczędzając zespołowi 20 godzin pracy w miesiącu.",
        "Przygotowałem dokumentację procesów wdrożeniowych używaną przez dział obsługi klienta.",
      ],
    },
  ],
  projects: [
    {
      name: "Panel analityczny dla partnerów",
      technologies: ["Discovery", "Figma", "SQL"],
      period: "2023",
      bullets: [
        "Zaprojektowałem panel, z którego korzysta 120 partnerów handlowych.",
        "Skróciłem czas przygotowania raportu miesięcznego z 3 dni do 2 godzin.",
      ],
    },
    {
      name: "Program mentoringowy dla juniorów",
      technologies: ["Mentoring", "Rekrutacja"],
      period: "2022 – 2023",
      bullets: [
        "Przeszkoliłem 9 osób, z których 7 awansowało w ciągu roku.",
      ],
    },
  ],
  skills: {
    technical: [
      "Strategia produktu",
      "Badania z użytkownikami",
      "Analiza danych (SQL)",
      "Roadmapa i priorytetyzacja",
      "A/B testy",
      "Jira",
      "Figma",
      "Amplitude",
      "Google Analytics",
      "Notion",
      "Scrum",
    ],
    soft_and_tools: [
      "Przywództwo bez podległości służbowej",
      "Komunikacja z zarządem",
      "Negocjacje",
      "Mentoring",
      "Facylitacja warsztatów",
      "Praca z danymi jakościowymi",
    ],
  },
  education: [
    {
      institution: "Uniwersytet Ekonomiczny w Krakowie",
      degree: "Zarządzanie, mgr",
      location: "Kraków",
      period: "2014 – 2016",
    },
    {
      institution: "Politechnika Wrocławska",
      degree: "Informatyka, inż.",
      location: "Wrocław",
      period: "2010 – 2014",
    },
  ],
  languages: ["polski – ojczysty", "angielski – C1", "niemiecki – B1"],
  rodo_clause: DEFAULT_RODO_CLAUSE,
};
