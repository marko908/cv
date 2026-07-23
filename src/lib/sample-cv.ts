import type { TailoredCv } from "./cv-schema";
import { DEFAULT_RODO_CLAUSE } from "./cv-schema";

/** Przykładowe dane do testowania edytora zanim podłączymy AI (Krok 2). */
export const sampleCv: TailoredCv = {
  personal_info: {
    full_name: "Anna Kowalska",
    title: "Frontend Developer",
    email: "anna.kowalska@example.com",
    phone: "+48 600 123 456",
    location: "Warszawa",
    linkedin_or_github: "linkedin.com/in/anna-kowalska",
  },
  professional_summary:
    "Frontend Developerka z 5-letnim doświadczeniem w budowie aplikacji SaaS w React i TypeScript. Specjalizuję się w wydajności i dostępności interfejsów — ostatnio skróciłam czas ładowania kluczowego widoku o 40%. Szukam zespołu produktowego, w którym połączę rozwój techniczny z realnym wpływem na produkt.",
  experience: [
    {
      company: "Softwarehouse Sp. z o.o.",
      role: "Frontend Developer",
      location: "Warszawa (hybrydowo)",
      period: "03.2021 – obecnie",
      bullets: [
        "Rozwijałam aplikację B2B (React, TypeScript, Next.js) dla 12 tys. aktywnych użytkowników",
        "Skróciłam czas ładowania dashboardu o 40% przez code-splitting i optymalizację zapytań",
        "Wdrożyłam bibliotekę komponentów UI używaną przez 3 zespoły produktowe",
      ],
    },
    {
      company: "Agencja Interaktywna Pixel",
      role: "Junior Frontend Developer",
      location: "Kraków",
      period: "07.2019 – 02.2021",
      bullets: [
        "Zbudowałam 15+ stron i sklepów (HTML, SCSS, JavaScript, WordPress)",
        "Poprawiłam wyniki Lighthouse klientów średnio z 62 do 90 punktów",
      ],
    },
  ],
  projects: [
    {
      name: "Panel analityczny open-source",
      technologies: ["React", "D3.js", "Vite"],
      link: "github.com/anna-kowalska/analytics",
      period: "2023",
      bullets: [
        "Dashboard wizualizacji danych z 800+ gwiazdkami na GitHubie",
      ],
    },
  ],
  skills: {
    technical: [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "REST API",
      "Git",
    ],
    soft_and_tools: [
      "Praca w Scrum",
      "Figma",
      "Jira",
      "Komunikacja z klientem",
    ],
  },
  education: [
    {
      institution: "Politechnika Warszawska",
      degree: "Informatyka, inż.",
      location: "Warszawa",
      period: "2015 – 2019",
    },
  ],
  languages: ["polski – ojczysty", "angielski – C1"],
  rodo_clause: DEFAULT_RODO_CLAUSE,
};
