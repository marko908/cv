import type { TailoredCv } from "./cv-schema";
import { DEFAULT_RODO_CLAUSE } from "./cv-schema";

export type SampleCv = {
  id: string;
  name: string;
  description: string;
  cv: TailoredCv;
};

/** Realistyczne, kompletne przykłady do demonstracji edytora. */
export const sampleCvs: SampleCv[] = [
  {
    id: "frontend",
    name: "Anna Kowalska — Frontend Developerka",
    description: "IT · poziom regular",
    cv: {
      personal_info: {
        full_name: "Anna Kowalska",
        title: "Frontend Developerka",
        email: "anna.kowalska@example.com",
        phone: "+48 600 123 456",
        location: "Warszawa",
        linkedin_or_github: "linkedin.com/in/anna-kowalska",
      },
      professional_summary:
        "Frontend Developerka z 5-letnim doświadczeniem w budowie aplikacji SaaS w React i TypeScript. Specjalizuję się w wydajności i dostępności interfejsów; ostatnio skróciłam czas ładowania kluczowego widoku o 40%. Szukam zespołu produktowego, w którym połączę rozwój techniczny z realnym wpływem na produkt.",
      experience: [
        {
          company: "BrightStack Sp. z o.o.",
          role: "Frontend Developerka",
          location: "Warszawa (hybrydowo)",
          period: "03.2021 – obecnie",
          bullets: [
            "Rozwijam aplikację B2B w React, TypeScript i Next.js dla 12 tys. aktywnych użytkowników miesięcznie.",
            "Skróciłam czas ładowania dashboardu o 40% dzięki podziałowi kodu i optymalizacji zapytań.",
            "Wdrożyłam bibliotekę komponentów UI używaną przez 3 zespoły produktowe.",
          ],
        },
        {
          company: "Pixelowa Agencja Interaktywna",
          role: "Junior Frontend Developerka",
          location: "Kraków",
          period: "07.2019 – 02.2021",
          bullets: [
            "Zbudowałam 15 stron i sklepów internetowych w HTML, SCSS, JavaScript i WordPressie.",
            "Podniosłam średni wynik Lighthouse klientów z 62 do 90 punktów.",
          ],
        },
      ],
      projects: [
        {
          name: "Panel analityczny open source",
          technologies: ["React", "D3.js", "Vite"],
          link: "github.com/anna-kowalska/analytics",
          period: "2023",
          bullets: ["Stworzyłam dashboard wizualizacji danych używany przez ponad 800 obserwujących projekt."],
        },
      ],
      skills: {
        technical: ["React", "TypeScript", "Next.js", "Tailwind CSS", "REST API", "Git"],
        soft_and_tools: ["Scrum", "Figma", "Jira", "Komunikacja z klientem"],
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
    },
  },
  {
    id: "marketing",
    name: "Marta Zielińska — Marketing Managerka",
    description: "Marketing · poziom mid",
    cv: {
      personal_info: {
        full_name: "Marta Zielińska",
        title: "Marketing Managerka",
        email: "marta.zielinska@example.com",
        phone: "+48 502 447 821",
        location: "Wrocław",
        linkedin_or_github: "linkedin.com/in/marta-zielinska-marketing",
      },
      professional_summary:
        "Marketing Managerka z 7-letnim doświadczeniem w kampaniach B2B i e-commerce. Łączę planowanie komunikacji, analitykę i współpracę ze sprzedażą, aby przekładać działania marketingowe na realny wzrost przychodów. W ostatniej roli zwiększyłam liczbę kwalifikowanych leadów o 58% rok do roku.",
      experience: [
        {
          company: "GreenMetric S.A.",
          role: "Marketing Managerka",
          location: "Wrocław (hybrydowo)",
          period: "05.2022 – obecnie",
          bullets: [
            "Przygotowałam strategię contentową i kampanie LinkedIn Ads, zwiększając liczbę leadów SQL o 58% rok do roku.",
            "Zredukowałam koszt pozyskania leada o 24% przez testy kreacji, segmentacji i stron docelowych.",
            "Koordynuję pracę 4-osobowego zespołu oraz zewnętrznych partnerów SEO i PR.",
          ],
        },
        {
          company: "Dom i Forma Sp. z o.o.",
          role: "Specjalistka ds. marketingu",
          location: "Wrocław",
          period: "09.2018 – 04.2022",
          bullets: [
            "Prowadziłam kalendarz kampanii e-commerce dla 3 marek, podnosząc przychód z newslettera o 35%.",
            "Wdrożyłam automatyzacje e-mail marketingu, które odzyskały średnio 11% porzuconych koszyków.",
          ],
        },
      ],
      projects: [
        {
          name: "Rebranding linii ekologicznej",
          technologies: ["Brand strategy", "Google Analytics 4", "Meta Ads"],
          period: "2024",
          bullets: ["Przeprowadziłam premierę nowej linii produktów, osiągając 126% planu sprzedażowego w pierwszym kwartale."],
        },
      ],
      skills: {
        technical: ["Google Analytics 4", "Google Ads", "LinkedIn Ads", "HubSpot", "SEO", "Looker Studio"],
        soft_and_tools: ["Zarządzanie projektami", "Copywriting", "Negocjacje", "Asana"],
      },
      education: [
        {
          institution: "Uniwersytet Ekonomiczny we Wrocławiu",
          degree: "Marketing i komunikacja rynkowa, mgr",
          location: "Wrocław",
          period: "2013 – 2018",
        },
      ],
      languages: ["polski – ojczysty", "angielski – B2"],
      rodo_clause: DEFAULT_RODO_CLAUSE,
    },
  },
  {
    id: "ksiegowosc",
    name: "Piotr Nowak — Samodzielny księgowy",
    description: "Finanse · poziom senior",
    cv: {
      personal_info: {
        full_name: "Piotr Nowak",
        title: "Samodzielny księgowy",
        email: "piotr.nowak@example.com",
        phone: "+48 691 228 174",
        location: "Poznań",
        linkedin_or_github: "linkedin.com/in/piotr-nowak-finanse",
      },
      professional_summary:
        "Samodzielny księgowy z 10-letnim doświadczeniem w prowadzeniu pełnej księgowości spółek handlowych. Sprawnie łączę skrupulatność z usprawnianiem procesów i partnerską współpracą z audytorami. Prowadzę rozliczenia, zamknięcia miesiąca i raportowanie zarządcze bez opóźnień.",
      experience: [
        {
          company: "NordTech Polska Sp. z o.o.",
          role: "Samodzielny księgowy",
          location: "Poznań",
          period: "01.2020 – obecnie",
          bullets: [
            "Prowadzę pełną księgowość 3 spółek z obrotem łącznym 85 mln zł rocznie.",
            "Skróciłem zamknięcie miesiąca z 8 do 5 dni roboczych przez automatyzację uzgodnień i obiegu dokumentów.",
            "Przygotowałem dane do 4 audytów rocznych zakończonych bez istotnych zastrzeżeń.",
          ],
        },
        {
          company: "Biuro Rachunkowe Bilans",
          role: "Księgowy",
          location: "Poznań",
          period: "06.2015 – 12.2019",
          bullets: [
            "Obsługiwałem portfel 28 klientów z branży usługowej i handlowej w zakresie ksiąg rachunkowych oraz VAT.",
            "Wdrożyłem elektroniczny obieg faktur, ograniczając liczbę korekt dokumentów o 30%.",
          ],
        },
      ],
      projects: [],
      skills: {
        technical: ["Ustawa o rachunkowości", "CIT", "VAT", "Comarch ERP Optima", "Excel", "Płatnik"],
        soft_and_tools: ["Dokładność", "Organizacja pracy", "Współpraca z audytorem", "MS Teams"],
      },
      education: [
        {
          institution: "Uniwersytet Ekonomiczny w Poznaniu",
          degree: "Finanse i rachunkowość, mgr",
          location: "Poznań",
          period: "2010 – 2015",
        },
      ],
      languages: ["polski – ojczysty", "angielski – B1"],
      rodo_clause: DEFAULT_RODO_CLAUSE,
    },
  },
  {
    id: "logistyka",
    name: "Karolina Wójcik — Koordynatorka logistyki",
    description: "Logistyka · poziom mid",
    cv: {
      personal_info: {
        full_name: "Karolina Wójcik",
        title: "Koordynatorka logistyki",
        email: "karolina.wojcik@example.com",
        phone: "+48 728 551 903",
        location: "Gdańsk",
        linkedin_or_github: "linkedin.com/in/karolina-wojcik-logistyka",
      },
      professional_summary:
        "Koordynatorka logistyki z 6-letnim doświadczeniem w planowaniu dostaw, współpracy z przewoźnikami i obsłudze magazynu. Działam skutecznie pod presją czasu, wykorzystując dane do poprawy terminowości i kosztów transportu. W obecnej roli poprawiłam wskaźnik dostaw na czas do 97%.",
      experience: [
        {
          company: "Baltic Supply Sp. z o.o.",
          role: "Koordynatorka logistyki",
          location: "Gdańsk",
          period: "02.2022 – obecnie",
          bullets: [
            "Koordynuję dziennie do 45 wysyłek krajowych i międzynarodowych dla sieci 120 odbiorców B2B.",
            "Podniosłam wskaźnik dostaw na czas z 91% do 97% dzięki nowym oknom załadunkowym i codziennemu monitorowaniu tras.",
            "Wynegocjowałam stawki z przewoźnikami, obniżając roczne koszty transportu o 9%.",
          ],
        },
        {
          company: "Portowa Dystrybucja S.A.",
          role: "Specjalistka ds. logistyki",
          location: "Gdynia",
          period: "08.2018 – 01.2022",
          bullets: [
            "Planowałam dostawy dla magazynu o przepustowości 8 tys. palet miesięcznie.",
            "Usprawniłam raportowanie reklamacji, skracając czas odpowiedzi do klienta z 48 do 24 godzin.",
          ],
        },
      ],
      projects: [
        {
          name: "Standaryzacja raportu dostaw",
          technologies: ["Excel", "Power Query", "SAP"],
          period: "2023",
          bullets: ["Zaprojektowałam automatyczny raport terminowości, oszczędzając zespołowi około 12 godzin pracy miesięcznie."],
        },
      ],
      skills: {
        technical: ["SAP", "Excel", "Power Query", "Planowanie transportu", "WMS", "Incoterms"],
        soft_and_tools: ["Negocjacje", "Priorytetyzacja", "Komunikacja", "Praca pod presją czasu"],
      },
      education: [
        {
          institution: "Uniwersytet Morski w Gdyni",
          degree: "Logistyka, lic.",
          location: "Gdynia",
          period: "2015 – 2018",
        },
      ],
      languages: ["polski – ojczysty", "angielski – B2", "niemiecki – A2"],
      rodo_clause: DEFAULT_RODO_CLAUSE,
    },
  },
];

/** Zachowany eksport domyślnego przykładu dla testów i istniejących importów. */
export const sampleCv: TailoredCv = sampleCvs[0].cv;
