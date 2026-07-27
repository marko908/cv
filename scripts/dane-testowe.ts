/**
 * Szeroki zestaw danych testowych v3: realistyczne CV (różne branże/poziomy/
 * rozbudowa) + oferty (krótkie/długie/EN/bez sekcji wymagań). Do testów na żywo.
 */
import type { TailoredCv } from "../src/lib/cv-schema";
import { DEFAULT_RODO_CLAUSE, emptyCv } from "../src/lib/cv-schema";
import { sampleCvs } from "../src/lib/sample-cv";

const RODO = DEFAULT_RODO_CLAUSE;

function cv(p: Partial<TailoredCv> & { personal_info: TailoredCv["personal_info"] }): TailoredCv {
  return {
    professional_summary: "",
    experience: [],
    projects: [],
    skills: { technical: [], soft_and_tools: [] },
    education: [],
    languages: [],
    rodo_clause: RODO,
    ...p,
  };
}

// ── Nowe CV ──────────────────────────────────────────────────────────────────

const juniorFrontend = cv({
  personal_info: { full_name: "Bartek Jankowski", title: "Junior Frontend Developer", email: "bartek.j@example.com", phone: "+48 511 234 567", location: "Łódź" },
  professional_summary: "Początkujący frontend developer po bootcampie, z projektami w React. Szukam pierwszej pracy komercyjnej, w której nauczę się dobrych praktyk.",
  experience: [
    { company: "Praktyki — Softneo", role: "Praktykant frontend", location: "Łódź", period: "07.2024 – 09.2024", bullets: ["Pomagałem przy budowie komponentów w React i naprawianiu błędów w interfejsie.", "Uczestniczyłem w code review i codziennych spotkaniach zespołu."] },
  ],
  projects: [
    { name: "Aplikacja pogodowa", technologies: ["React", "JavaScript", "CSS"], bullets: ["Zbudowałem aplikację pobierającą dane z API pogodowego."] },
  ],
  skills: { technical: ["HTML", "CSS", "JavaScript", "React", "Git"], soft_and_tools: ["Chęć do nauki", "Praca zespołowa"] },
  education: [{ institution: "Uniwersytet Łódzki", degree: "Informatyka, lic. (w toku)", location: "Łódź", period: "2022 – obecnie" }],
  languages: ["polski – ojczysty", "angielski – B1"],
});

const seniorBackend = cv({
  personal_info: { full_name: "Tomasz Wiśniewski", title: "Senior Backend Developer", email: "tomasz.w@example.com", phone: "+48 602 345 678", location: "Kraków", linkedin_or_github: "github.com/twisniewski" },
  professional_summary: "Senior backend developer z 9-letnim doświadczeniem w Javie i systemach rozproszonych. Prowadziłem migracje do mikroserwisów i zespoły do 6 osób. Skróciłem czas odpowiedzi kluczowego API o 45%.",
  experience: [
    { company: "FinCore S.A.", role: "Senior Backend Developer", location: "Kraków (zdalnie)", period: "04.2019 – obecnie", bullets: ["Zaprojektowałem architekturę mikroserwisów w Spring Boot obsługującą 2 mln transakcji dziennie.", "Skróciłem czas odpowiedzi API płatności o 45% dzięki cache Redis i optymalizacji zapytań.", "Prowadziłem zespół 6 developerów i wdrożyłem proces code review."] },
    { company: "SoftHouse Sp. z o.o.", role: "Backend Developer", location: "Kraków", period: "06.2015 – 03.2019", bullets: ["Rozwijałem system e-commerce w Java i PostgreSQL dla 300 tys. użytkowników.", "Zautomatyzowałem testy integracyjne, redukując liczbę błędów produkcyjnych o 30%."] },
  ],
  projects: [],
  skills: { technical: ["Java", "Spring Boot", "PostgreSQL", "Redis", "Docker", "Kubernetes", "REST API", "Kafka"], soft_and_tools: ["Przywództwo", "Mentoring", "Scrum"] },
  education: [{ institution: "AGH", degree: "Informatyka, mgr inż.", location: "Kraków", period: "2010 – 2015" }],
  languages: ["polski – ojczysty", "angielski – C1"],
});

const devopsSenior = cv({
  personal_info: { full_name: "Adam Lewandowski", title: "DevOps Engineer", email: "adam.l@example.com", phone: "+48 605 111 222", location: "Wrocław", linkedin_or_github: "github.com/alewandowski" },
  professional_summary: "DevOps engineer z 7-letnim doświadczeniem w automatyzacji infrastruktury chmurowej. Zbudowałem pipeline CI/CD skracające wdrożenia z godzin do minut.",
  experience: [
    { company: "CloudOps Polska", role: "DevOps Engineer", location: "Wrocław (zdalnie)", period: "01.2020 – obecnie", bullets: ["Zarządzam klastrami Kubernetes i Docker w produkcji dla 40 mikroserwisów.", "Zbudowałem infrastrukturę jako kod w Terraform i Ansible na AWS.", "Skróciłem czas wdrożenia z 3 godzin do 12 minut przez CI/CD w GitLab CI."] },
    { company: "IT Systems S.A.", role: "System Administrator", location: "Wrocław", period: "09.2016 – 12.2019", bullets: ["Administrowałem serwerami Linux i skryptami w Bash oraz Python.", "Wdrożyłem monitoring Prometheus i Grafana dla 60 usług."] },
  ],
  projects: [],
  skills: { technical: ["Kubernetes", "Docker", "Terraform", "Ansible", "AWS", "GitLab CI", "Jenkins", "Bash", "Python", "Prometheus", "Grafana"], soft_and_tools: ["Rozwiązywanie problemów", "Współpraca z developerami"] },
  education: [{ institution: "Politechnika Wrocławska", degree: "Informatyka, inż.", location: "Wrocław", period: "2012 – 2016" }],
  languages: ["polski – ojczysty", "angielski – B2"],
});

const sprzedaz = cv({
  personal_info: { full_name: "Michał Kaczmarek", title: "Przedstawiciel handlowy", email: "michal.k@example.com", phone: "+48 693 444 555", location: "Katowice" },
  professional_summary: "Przedstawiciel handlowy B2B z 6-letnim doświadczeniem w sprzedaży rozwiązań przemysłowych. Zrealizowałem plan sprzedaży na 118% w ostatnim roku i pozyskałem 40 nowych klientów.",
  experience: [
    { company: "IndustPol Sp. z o.o.", role: "Przedstawiciel handlowy", location: "Śląsk", period: "03.2020 – obecnie", bullets: ["Zrealizowałem roczny plan sprzedaży na 118%, zwiększając przychód regionu o 22%.", "Pozyskałem 40 nowych klientów B2B w sektorze produkcyjnym.", "Negocjowałem kontrakty roczne o wartości do 500 tys. zł."] },
    { company: "TechDystrybucja S.A.", role: "Specjalista ds. sprzedaży", location: "Katowice", period: "05.2017 – 02.2020", bullets: ["Obsługiwałem portfel 80 klientów, utrzymując retencję na poziomie 92%.", "Prowadziłem prezentacje produktowe i szkolenia dla klientów."] },
  ],
  projects: [],
  skills: { technical: ["CRM Salesforce", "Negocjacje handlowe", "Prospecting", "Lejek sprzedaży", "Excel"], soft_and_tools: ["Budowanie relacji", "Komunikatywność", "Prawo jazdy kat. B"] },
  education: [{ institution: "Uniwersytet Ekonomiczny w Katowicach", degree: "Zarządzanie, lic.", location: "Katowice", period: "2013 – 2016" }],
  languages: ["polski – ojczysty", "angielski – B1"],
});

const hr = cv({
  personal_info: { full_name: "Agnieszka Mazur", title: "Specjalistka ds. HR", email: "agnieszka.m@example.com", phone: "+48 512 666 777", location: "Warszawa" },
  professional_summary: "Specjalistka HR z 5-letnim doświadczeniem w rekrutacji IT i administracji kadrowej. Skróciłam średni czas rekrutacji o 30% i prowadziłam onboarding dla 60 nowych pracowników rocznie.",
  experience: [
    { company: "TalentHub Sp. z o.o.", role: "Specjalistka ds. rekrutacji", location: "Warszawa (hybrydowo)", period: "02.2021 – obecnie", bullets: ["Prowadzę pełen proces rekrutacji IT, zamykając średnio 8 wakatów miesięcznie.", "Skróciłam czas rekrutacji z 40 do 28 dni dzięki uproszczeniu etapów.", "Wdrożyłam system ATS i szablony ocen kandydatów."] },
    { company: "Biuro Kadr Nowak", role: "Młodsza specjalistka ds. kadr", location: "Warszawa", period: "06.2018 – 01.2021", bullets: ["Prowadziłam dokumentację kadrową i umowy dla 150 pracowników.", "Koordynowałam onboarding 60 nowych osób rocznie."] },
  ],
  projects: [],
  skills: { technical: ["Rekrutacja IT", "ATS", "Prawo pracy", "Kodeks pracy", "Excel", "Employer branding"], soft_and_tools: ["Empatia", "Organizacja", "MS Office"] },
  education: [{ institution: "SWPS", degree: "Psychologia, mgr", location: "Warszawa", period: "2013 – 2018" }],
  languages: ["polski – ojczysty", "angielski – B2"],
});

const pielegniarka = cv({
  personal_info: { full_name: "Ewa Kowalczyk", title: "Pielęgniarka", email: "ewa.k@example.com", phone: "+48 668 888 999", location: "Lublin" },
  professional_summary: "Pielęgniarka z 8-letnim doświadczeniem na oddziale internistycznym. Prawo wykonywania zawodu, doświadczenie w opiece nad pacjentem i podawaniu leków.",
  experience: [
    { company: "Szpital Wojewódzki w Lublinie", role: "Pielęgniarka", location: "Lublin", period: "09.2016 – obecnie", bullets: ["Opiekuję się pacjentami na oddziale internistycznym (do 30 łóżek).", "Podaję leki, prowadzę dokumentację medyczną i asystuję przy zabiegach.", "Szkolę praktykantki i nowe pielęgniarki."] },
  ],
  projects: [],
  skills: { technical: ["Opieka nad pacjentem", "Podawanie leków", "Dokumentacja medyczna", "Pobieranie krwi", "EKG"], soft_and_tools: ["Empatia", "Odporność na stres", "Praca zmianowa"] },
  education: [{ institution: "Uniwersytet Medyczny w Lublinie", degree: "Pielęgniarstwo, lic.", location: "Lublin", period: "2013 – 2016" }],
  languages: ["polski – ojczysty", "angielski – A2"],
});

const administracja = cv({
  personal_info: { full_name: "Joanna Wróbel", title: "Pracownik administracyjny", email: "joanna.w@example.com", phone: "+48 500 121 212", location: "Poznań" },
  professional_summary: "Pracownica biurowa z doświadczeniem w obsłudze sekretariatu i dokumentacji.",
  experience: [
    { company: "Kancelaria Prawna Lex", role: "Asystentka biura", location: "Poznań", period: "01.2021 – obecnie", bullets: ["Obsługuję sekretariat, korespondencję i kalendarz spotkań.", "Przygotowuję dokumenty i archiwizuję akta."] },
  ],
  projects: [],
  skills: { technical: ["MS Office", "Obsługa biura", "Fakturowanie"], soft_and_tools: ["Organizacja", "Dokładność"] },
  education: [{ institution: "Liceum Ogólnokształcące nr 5", degree: "Wykształcenie średnie", location: "Poznań", period: "2015 – 2018" }],
  languages: ["polski – ojczysty", "angielski – A2"],
});

const produkcja = cv({
  personal_info: { full_name: "Krzysztof Zając", title: "Operator maszyn CNC", email: "krzysztof.z@example.com", phone: "+48 691 313 131", location: "Rzeszów" },
  professional_summary: "Operator maszyn CNC z doświadczeniem w produkcji seryjnej.",
  experience: [
    { company: "MetalTech Sp. z o.o.", role: "Operator CNC", location: "Rzeszów", period: "05.2019 – obecnie", bullets: ["Obsługuję maszyny CNC i kontroluję jakość detali.", "Praca zmianowa na produkcji seryjnej."] },
  ],
  projects: [],
  skills: { technical: ["Obsługa CNC", "Czytanie rysunku technicznego", "Kontrola jakości"], soft_and_tools: ["Sumienność", "Praca zmianowa"] },
  education: [{ institution: "Technikum Mechaniczne", degree: "Technik mechanik", location: "Rzeszów", period: "2013 – 2017" }],
  languages: ["polski – ojczysty"],
});

const kucharz = cv({
  personal_info: { full_name: "Damian Sikora", title: "Kucharz", email: "damian.s@example.com", phone: "+48 723 141 414", location: "Gdańsk" },
  professional_summary: "Kucharz z 6-letnim doświadczeniem w kuchni restauracyjnej. Specjalizuję się w kuchni włoskiej.",
  experience: [
    { company: "Trattoria Bella", role: "Kucharz", location: "Gdańsk", period: "03.2019 – obecnie", bullets: ["Przygotowuję dania kuchni włoskiej na 120 kuwertów dziennie.", "Zarządzam stanowiskiem i dbam o normy HACCP."] },
    { company: "Restauracja Portowa", role: "Pomoc kuchenna", location: "Gdańsk", period: "06.2017 – 02.2019", bullets: ["Pomagałem przy przygotowaniu dań i utrzymaniu porządku."] },
  ],
  projects: [],
  skills: { technical: ["Kuchnia włoska", "HACCP", "Organizacja kuchni", "Praca pod presją"], soft_and_tools: ["Praca zespołowa", "Odporność na stres"] },
  education: [{ institution: "Zespół Szkół Gastronomicznych", degree: "Technik żywienia", location: "Gdańsk", period: "2013 – 2017" }],
  languages: ["polski – ojczysty", "angielski – A2"],
});

const nauczyciel = cv({
  personal_info: { full_name: "Magdalena Krawczyk", title: "Nauczycielka języka angielskiego", email: "magda.k@example.com", phone: "+48 604 151 515", location: "Bydgoszcz" },
  professional_summary: "Nauczycielka angielskiego z 7-letnim doświadczeniem w szkole podstawowej i kursach. Przygotowuję uczniów do egzaminu ósmoklasisty, zdawalność 96%.",
  experience: [
    { company: "Szkoła Podstawowa nr 12", role: "Nauczycielka języka angielskiego", location: "Bydgoszcz", period: "09.2017 – obecnie", bullets: ["Uczę angielskiego w klasach 4–8, prowadzę 24 godziny lekcyjne tygodniowo.", "Przygotowuję uczniów do egzaminu ósmoklasisty ze zdawalnością 96%.", "Prowadzę kółko konwersacyjne dla 20 uczniów."] },
  ],
  projects: [],
  skills: { technical: ["Metodyka nauczania", "Angielski C1", "Egzamin ósmoklasisty", "Platformy e-learning"], soft_and_tools: ["Cierpliwość", "Komunikatywność"] },
  education: [{ institution: "UKW Bydgoszcz", degree: "Filologia angielska, mgr", location: "Bydgoszcz", period: "2011 – 2016" }],
  languages: ["polski – ojczysty", "angielski – C1", "niemiecki – B1"],
});

const dataAnalyst = cv({
  personal_info: { full_name: "Rafał Nowicki", title: "Analityk danych", email: "rafal.n@example.com", phone: "+48 606 161 616", location: "Warszawa", linkedin_or_github: "linkedin.com/in/rnowicki" },
  professional_summary: "Analityk danych z 4-letnim doświadczeniem w raportowaniu i modelowaniu. Zbudowałem dashboardy, które skróciły czas raportowania o 60%.",
  experience: [
    { company: "DataDriven Sp. z o.o.", role: "Analityk danych", location: "Warszawa (hybrydowo)", period: "07.2021 – obecnie", bullets: ["Buduję raporty i dashboardy w Power BI i SQL dla działu sprzedaży.", "Skróciłem czas przygotowania raportu miesięcznego o 60% przez automatyzację.", "Analizuję dane w Python (pandas) i tworzę modele predykcyjne churnu."] },
  ],
  projects: [
    { name: "Model predykcji churnu", technologies: ["Python", "scikit-learn", "SQL"], bullets: ["Zbudowałem model przewidujący odejścia klientów z dokładnością 82%."] },
  ],
  skills: { technical: ["SQL", "Python", "pandas", "Power BI", "Excel", "Statystyka", "scikit-learn"], soft_and_tools: ["Analityczne myślenie", "Prezentacja danych"] },
  education: [{ institution: "SGH", degree: "Metody ilościowe, mgr", location: "Warszawa", period: "2015 – 2020" }],
  languages: ["polski – ojczysty", "angielski – C1"],
});

const pm = cv({
  personal_info: { full_name: "Wojciech Adamski", title: "Project Manager", email: "wojciech.a@example.com", phone: "+48 601 171 717", location: "Warszawa", linkedin_or_github: "linkedin.com/in/wadamski" },
  professional_summary: "Project manager z 8-letnim doświadczeniem w prowadzeniu projektów IT. Dostarczyłem 25 projektów w budżecie, zarządzałem zespołami do 12 osób.",
  experience: [
    { company: "Digital Projects S.A.", role: "Project Manager", location: "Warszawa", period: "01.2018 – obecnie", bullets: ["Prowadzę projekty wdrożeniowe IT o budżetach do 2 mln zł.", "Dostarczyłem 25 projektów w terminie i budżecie, zarządzając zespołami do 12 osób.", "Wdrożyłem Scrum i Jira, skracając cykl dostarczania o 20%."] },
  ],
  projects: [],
  skills: { technical: ["Zarządzanie projektami", "Scrum", "Jira", "Budżetowanie", "PRINCE2", "Zarządzanie ryzykiem"], soft_and_tools: ["Przywództwo", "Komunikacja", "Negocjacje"] },
  education: [{ institution: "Politechnika Warszawska", degree: "Zarządzanie i inżynieria produkcji, mgr inż.", location: "Warszawa", period: "2009 – 2014" }],
  languages: ["polski – ojczysty", "angielski – C1"],
});

const grafik = cv({
  personal_info: { full_name: "Ola Dąbrowska", title: "UX/UI Designer", email: "ola.d@example.com", phone: "+48 512 181 818", location: "Kraków", linkedin_or_github: "behance.net/oladabrowska" },
  professional_summary: "Projektantka UX/UI z 5-letnim doświadczeniem w produktach cyfrowych. Poprawiłam konwersję kluczowego flow o 18% dzięki redesignowi.",
  experience: [
    { company: "ProductLab", role: "UX/UI Designer", location: "Kraków (zdalnie)", period: "04.2020 – obecnie", bullets: ["Projektuję interfejsy w Figma i prowadzę testy użyteczności.", "Poprawiłam konwersję rejestracji o 18% dzięki redesignowi onboardingu.", "Tworzę i utrzymuję design system dla 3 produktów."] },
  ],
  projects: [],
  skills: { technical: ["Figma", "Sketch", "Prototypowanie", "Testy użyteczności", "Design system", "Adobe XD"], soft_and_tools: ["Empatia z użytkownikiem", "Współpraca z developerami"] },
  education: [{ institution: "ASP Kraków", degree: "Wzornictwo, mgr", location: "Kraków", period: "2013 – 2018" }],
  languages: ["polski – ojczysty", "angielski – B2"],
});

// Prawie puste CV (edge) — tylko dane + szczątkowe doświadczenie.
const prawiePuste = cv({
  personal_info: { full_name: "Jan Test", title: "", email: "jan.test@example.com", phone: "+48 500 000 000", location: "Warszawa" },
  professional_summary: "",
  experience: [{ company: "Firma X", role: "Pracownik", location: "", period: "2022", bullets: ["Praca w firmie."] }],
  skills: { technical: [], soft_and_tools: [] },
  education: [],
  languages: [],
});

// ── Oferty ───────────────────────────────────────────────────────────────────

export const OFERTY = {
  frontendReact: `Frontend Developer (React)
Netguru — Warszawa / zdalnie
Wymagania:
- Minimum 3 lata doświadczenia komercyjnego w React
- Bardzo dobra znajomość TypeScript
- Doświadczenie w optymalizacji wydajności
- Znajomość języka angielskiego na poziomie min. B2
- Praca w metodykach zwinnych
Mile widziane: Next.js, Docker`,

  juniorFrontend: `Junior Frontend Developer
Szukamy osoby na start kariery. Wymagania:
- Podstawy HTML, CSS, JavaScript
- Znajomość React będzie atutem
- Chęć do nauki i praca zespołowa
Oferujemy staż płatny i mentoring.`,

  devops: `DevOps Engineer
Wymagania obowiązkowe:
- Doświadczenie z Kubernetes i Docker w środowisku produkcyjnym
- Terraform, Ansible
- CI/CD (GitLab CI, Jenkins)
- Chmura AWS lub GCP
- Skrypty w Bash i Python
Mile widziane: Prometheus, Grafana`,

  seniorJava: `Senior Java Developer
Dołącz do zespołu budującego platformę fintech. Poszukujemy doświadczonego inżyniera, który poprowadzi rozwój backendu i zadba o jakość.
Wymagania:
- Minimum 6 lat doświadczenia w Java
- Bardzo dobra znajomość Spring Boot
- Doświadczenie z mikroserwisami i systemami rozproszonymi
- Znajomość PostgreSQL i baz relacyjnych
- Doświadczenie z Kafka lub innym systemem kolejkowym
- Praktyczna znajomość Docker i Kubernetes
- Umiejętność prowadzenia zespołu i mentoringu
Mile widziane:
- Redis
- Doświadczenie w fintech
- Angielski C1`,

  marketing: `Marketing Manager
Wymagania:
- Doświadczenie w kampaniach B2B i e-commerce
- Znajomość Google Analytics i Google Ads
- Umiejętność zarządzania zespołem
- Analityczne podejście do wyników
Mile widziane: HubSpot, SEO`,

  salesEN: `Sales Representative (B2B)
We are looking for an experienced B2B sales representative to grow our client base.
Requirements:
- 3+ years of B2B sales experience
- Strong negotiation skills
- Experience with CRM systems (Salesforce preferred)
- Driving license (category B)
- Communicative English
Nice to have: experience in industrial sector`,

  hr: `Specjalista ds. rekrutacji IT
Wymagania:
- Doświadczenie w rekrutacji IT
- Znajomość systemów ATS
- Znajomość prawa pracy
- Bardzo dobra organizacja pracy
Mile widziane: employer branding, angielski B2`,

  pielegniarka: `Pielęgniarka/Pielęgniarz — oddział internistyczny
Wymagania: prawo wykonywania zawodu, doświadczenie w opiece nad pacjentem, gotowość do pracy zmianowej.`,

  dataAnalystEN: `Data Analyst
We are hiring a Data Analyst to support our business teams.
Requirements:
- Strong SQL skills
- Experience with Python (pandas)
- Data visualization (Power BI or Tableau)
- Statistical analysis
- Business English
Nice to have: machine learning basics, churn modeling`,

  administracjaProza: `Poszukujemy osoby do pracy w naszym biurze. Firma z branży prawniczej zaprasza do współpracy. Oferujemy stabilne zatrudnienie, miłą atmosferę i pracę od poniedziałku do piątku. Do zadań należy obsługa sekretariatu, korespondencji oraz przygotowywanie dokumentów. Mile widziana dokładność i dobra organizacja pracy. Zapraszamy do aplikowania.`,

  kucharz: `Kucharz — restauracja włoska
Wymagania: doświadczenie w kuchni, znajomość kuchni włoskiej, znajomość zasad HACCP, praca pod presją czasu.`,

  nauczyciel: `Nauczyciel języka angielskiego
Szkoła podstawowa poszukuje nauczyciela angielskiego.
Wymagania:
- Wykształcenie kierunkowe (filologia angielska)
- Przygotowanie pedagogiczne
- Doświadczenie w nauczaniu dzieci
- Znajomość angielskiego na poziomie C1`,

  pmEN: `Project Manager (IT)
Join our team delivering digital transformation projects for enterprise clients. You will lead cross-functional teams and own delivery end to end.
Requirements:
- 5+ years of project management experience
- Strong knowledge of Scrum and Agile
- Experience with Jira
- Budget and risk management
- Excellent stakeholder communication
- Fluent English
Nice to have: PRINCE2 or PMP certification`,

  ofertaBezWymagan: `Zostań częścią naszego zespołu! Jesteśmy dynamicznie rozwijającą się firmą i szukamy zaangażowanych ludzi. Oferujemy owocowe czwartki, pakiet sportowy i świetną atmosferę. Aplikuj już dziś!`,

  ofertaKrotka: `Frontend developer React. Warszawa.`,

  produkcja: `Operator maszyn CNC
Wymagania: obsługa maszyn CNC, czytanie rysunku technicznego, gotowość do pracy zmianowej, sumienność.`,

  ux: `UX/UI Designer
Wymagania:
- Doświadczenie w projektowaniu produktów cyfrowych
- Biegła znajomość Figma
- Prowadzenie testów użyteczności
- Tworzenie design system
Mile widziane: znajomość HTML/CSS`,
};

// ── Zestaw par testowych (≥20) ───────────────────────────────────────────────

export type Para = {
  nazwa: string;
  profil: string;
  cv: TailoredCv;
  oferta: string;
  ofertaNazwa: string;
  dopasowanieOczekiwane: "idealne" | "dobre" | "slabe" | "mismatch" | "edge";
};

export const PARY: Para[] = [
  { nazwa: "Anna → Frontend React", profil: "IT frontend mid (bogate)", cv: sampleCvs[0].cv, oferta: OFERTY.frontendReact, ofertaNazwa: "Frontend React", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Bartek(junior) → Junior Frontend", profil: "IT junior (ubogie)", cv: juniorFrontend, oferta: OFERTY.juniorFrontend, ofertaNazwa: "Junior Frontend", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Bartek(junior) → Frontend React (za wysoko)", profil: "IT junior (ubogie)", cv: juniorFrontend, oferta: OFERTY.frontendReact, ofertaNazwa: "Frontend React", dopasowanieOczekiwane: "slabe" },
  { nazwa: "Tomasz(senior) → Senior Java", profil: "IT senior/lead (bogate)", cv: seniorBackend, oferta: OFERTY.seniorJava, ofertaNazwa: "Senior Java (długa)", dopasowanieOczekiwane: "idealne" },
  { nazwa: "Tomasz(senior) → DevOps", profil: "IT senior backend", cv: seniorBackend, oferta: OFERTY.devops, ofertaNazwa: "DevOps", dopasowanieOczekiwane: "slabe" },
  { nazwa: "Adam(devops) → DevOps", profil: "IT devops senior", cv: devopsSenior, oferta: OFERTY.devops, ofertaNazwa: "DevOps", dopasowanieOczekiwane: "idealne" },
  { nazwa: "Adam(devops) → Frontend React", profil: "IT devops senior", cv: devopsSenior, oferta: OFERTY.frontendReact, ofertaNazwa: "Frontend React", dopasowanieOczekiwane: "mismatch" },
  { nazwa: "Marta(marketing) → Marketing Manager", profil: "Marketing mid (bogate)", cv: sampleCvs[1].cv, oferta: OFERTY.marketing, ofertaNazwa: "Marketing Manager", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Marta(marketing) → DevOps", profil: "Marketing mid", cv: sampleCvs[1].cv, oferta: OFERTY.devops, ofertaNazwa: "DevOps", dopasowanieOczekiwane: "mismatch" },
  { nazwa: "Piotr(księgowy) → Senior Java", profil: "Księgowość senior", cv: sampleCvs[2].cv, oferta: OFERTY.seniorJava, ofertaNazwa: "Senior Java", dopasowanieOczekiwane: "mismatch" },
  { nazwa: "Michał(sprzedaż) → Sales Rep (EN)", profil: "Sprzedaż B2B", cv: sprzedaz, oferta: OFERTY.salesEN, ofertaNazwa: "Sales Rep (EN)", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Agnieszka(HR) → Rekruter IT", profil: "HR mid", cv: hr, oferta: OFERTY.hr, ofertaNazwa: "Rekruter IT", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Ewa(pielęgniarka) → Pielęgniarka (krótka)", profil: "Medyczne", cv: pielegniarka, oferta: OFERTY.pielegniarka, ofertaNazwa: "Pielęgniarka (krótka)", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Joanna(admin) → Biuro (proza, bez sekcji)", profil: "Administracja (ubogie)", cv: administracja, oferta: OFERTY.administracjaProza, ofertaNazwa: "Biuro (proza)", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Krzysztof(produkcja) → Operator CNC", profil: "Produkcja/fizyczne (ubogie)", cv: produkcja, oferta: OFERTY.produkcja, ofertaNazwa: "Operator CNC", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Damian(kucharz) → Kucharz (krótka)", profil: "Gastronomia", cv: kucharz, oferta: OFERTY.kucharz, ofertaNazwa: "Kucharz (krótka)", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Magdalena(nauczyciel) → Nauczyciel ang.", profil: "Edukacja", cv: nauczyciel, oferta: OFERTY.nauczyciel, ofertaNazwa: "Nauczyciel ang.", dopasowanieOczekiwane: "idealne" },
  { nazwa: "Rafał(analityk) → Data Analyst (EN)", profil: "Analityka danych", cv: dataAnalyst, oferta: OFERTY.dataAnalystEN, ofertaNazwa: "Data Analyst (EN)", dopasowanieOczekiwane: "idealne" },
  { nazwa: "Wojciech(PM) → Project Manager (EN długa)", profil: "PM senior", cv: pm, oferta: OFERTY.pmEN, ofertaNazwa: "Project Manager (EN)", dopasowanieOczekiwane: "idealne" },
  { nazwa: "Ola(UX) → UX/UI Designer", profil: "Design", cv: grafik, oferta: OFERTY.ux, ofertaNazwa: "UX/UI Designer", dopasowanieOczekiwane: "dobre" },
  { nazwa: "Karolina(logistyka) → Marketing (mismatch)", profil: "Logistyka mid", cv: sampleCvs[3].cv, oferta: OFERTY.marketing, ofertaNazwa: "Marketing Manager", dopasowanieOczekiwane: "mismatch" },
  { nazwa: "EDGE: puste CV → Frontend React", profil: "puste", cv: emptyCv, oferta: OFERTY.frontendReact, ofertaNazwa: "Frontend React", dopasowanieOczekiwane: "edge" },
  { nazwa: "EDGE: prawie puste CV → oferta krótka", profil: "prawie puste", cv: prawiePuste, oferta: OFERTY.ofertaKrotka, ofertaNazwa: "oferta krótka", dopasowanieOczekiwane: "edge" },
  { nazwa: "EDGE: Anna → oferta bez wymagań", profil: "IT frontend", cv: sampleCvs[0].cv, oferta: OFERTY.ofertaBezWymagan, ofertaNazwa: "oferta bez wymagań", dopasowanieOczekiwane: "edge" },
];

export const CV_DO_PETLI = { juniorFrontend, sprzedaz, hr, dataAnalyst, seniorBackend, devopsSenior };
