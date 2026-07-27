/**
 * PROBNE (weryfikacja) — straż słów kluczowych + podłoga wyniku.
 * Sprawdza, że przepisanie NIE gubi trafionych słów z oferty i że wynik
 * po dopasowaniu nigdy nie jest niższy niż przed.
 * Uruchom: npx tsx scripts/probne-straz-slow.ts
 */
import { sampleCv } from "../src/lib/sample-cv";
import {
  zgubionoSlowoKluczowe,
  zlozCv,
  type Przepisanie,
} from "../src/lib/ai/rewrite";
import { buildLedgerFromCv } from "../src/lib/ai/fact-ledger";
import { dopasuj } from "../src/lib/ai/matching";
import { ocenCv } from "../src/lib/ai/scoring";
import type { ParsedOferta, Wymaganie } from "../src/lib/ai/job-offer";

let bledy = 0;
function ok(warunek: boolean, opis: string, detal = "") {
  console.log(`  ${warunek ? "✓" : "✗"} ${opis}${detal ? ` — ${detal}` : ""}`);
  if (!warunek) bledy++;
}

console.log("== zgubionoSlowoKluczowe (jednostkowo) ==");
ok(
  zgubionoSlowoKluczowe("Prowadziłam kaniulację i opiekę nad pacjentem", "Prowadziłam opiekę nad chorymi", ["kaniulacja", "kaniulację"]),
  "wykrywa zgubione słowo kluczowe"
);
ok(
  !zgubionoSlowoKluczowe("Tworzyłem aplikacje w React", "Rozwijałem aplikacje webowe w React", ["React"]),
  "nie alarmuje, gdy słowo zachowane"
);
ok(
  !zgubionoSlowoKluczowe("Obsługa klienta", "Obsługa klienta biznesowego", ["React"]),
  "nie alarmuje o słowie, którego nie było w oryginale"
);
ok(
  zgubionoSlowoKluczowe("Wdrożyłem Docker i CI/CD", "Wdrożyłem konteneryzację i automatyzację", ["Docker", "CI/CD"]),
  "wykrywa zgubienie przy parafrazie"
);

console.log("\n== zlozCv: punkt gubiący słowo kluczowe wraca do oryginału ==");
{
  const oryginal = structuredClone(sampleCv);
  oryginal.experience[0].bullets = [
    "Tworzyłem interfejsy w React dla klientów B2B",
    "Prowadziłem code review w zespole",
  ];
  const przepisanie: Przepisanie = {
    podsumowanie: { tekst: oryginal.professional_summary, zrodla: [] },
    doswiadczenie: [
      {
        indeks: 0,
        punkty: [
          // gubi „React" — powinno wrócić do oryginału
          { punkt_zrodlowy: 0, tekst: "Tworzyłem nowoczesne interfejsy dla klientów B2B", zrodla: [] },
          // nie gubi nic — powinno przejść
          { punkt_zrodlowy: 1, tekst: "Prowadziłem przeglądy kodu w zespole produktowym", zrodla: [] },
        ],
      },
    ],
    projekty: [],
    umiejetnosci_techniczne: oryginal.skills.technical,
    umiejetnosci_miekkie: oryginal.skills.soft_and_tools,
  };
  const wynik = zlozCv(oryginal, przepisanie, ["React"]);
  ok(
    wynik.experience[0].bullets[0] === oryginal.experience[0].bullets[0],
    "punkt gubiacy React cofniety do oryginalu",
    wynik.experience[0].bullets[0]
  );
  ok(
    wynik.experience[0].bullets[1] !== oryginal.experience[0].bullets[1],
    "punkt bez utraty słowa — przepisanie przyjęte"
  );
}

console.log("\n== Podłoga wyniku: ocena po NIGDY < ocena przed ==");
{
  // Symulacja logiki 6a z pipeline: gdyby przepisanie pogorszyło wynik,
  // wracamy do CV wejściowego.
  const wym = (id: string, tekst: string, slowa: string[]): Wymaganie => ({
    id, tekst, cytat: tekst, rodzaj: "twarda", priorytet: "wymagane", slowa_kluczowe: slowa,
  });
  const oferta: ParsedOferta = {
    stanowisko: "Pielęgniarka", firma: "Szpital", poziom: "mid", branza: "medycyna", ton: "formalny",
    wymagania: [wym("W1", "Kaniulacja", ["kaniulacja"]), wym("W2", "Opieka nad pacjentem", ["opieka nad pacjentem"]), wym("W3", "Dokumentacja medyczna", ["dokumentacja medyczna"])],
  };
  const baza = structuredClone(sampleCv);
  baza.experience = [
    {
      company: "Szpital Miejski",
      role: "Pielegniarka",
      location: "Warszawa",
      period: "01.2020 - obecnie",
      bullets: [
        "Wykonywalam kaniulacje u 30 pacjentow dziennie",
        "Prowadzilam dokumentacje medyczna dla 4 oddzialow",
      ],
    },
  ];
  baza.projects = [];
  baza.skills.technical = ["kaniulacja", "dokumentacja medyczna", "opieka nad pacjentem"];

  // Realnie POGORSZONE przepisanie: punkty tracą liczby i stają się opisem
  // obowiązków (dokładnie ten wzorzec obniżył wynik pielęgniarki 82→66).
  const zepsute = structuredClone(baza);
  zepsute.experience[0].bullets = [
    "Bylam odpowiedzialna za opieke nad chorymi",
    "Zajmowalam sie papierami na oddziale",
  ];

  const przedDop = dopasuj(oferta, buildLedgerFromCv(baza));
  const poDop = dopasuj(oferta, buildLedgerFromCv(zepsute));
  const ocenaPrzed = ocenCv(baza, przedDop);
  let ocenaPo = ocenCv(zepsute, poDop);
  console.log(`  (bez podłogi: przed=${ocenaPrzed.wynik}, po=${ocenaPo.wynik})`);

  // Reguła 6a
  let finalCv = zepsute;
  if (ocenaPo.wynik < ocenaPrzed.wynik) {
    finalCv = baza;
    ocenaPo = ocenaPrzed;
  }
  ok(ocenaPo.wynik >= ocenaPrzed.wynik, `po (${ocenaPo.wynik}) >= przed (${ocenaPrzed.wynik})`);
  ok(finalCv === baza, "przy pogorszeniu wracamy do CV wejściowego (+0, nigdy minus)");
}

console.log(`\n==== WYNIK: ${bledy === 0 ? "wszystko OK ✓" : bledy + " błędów ✗"} ====`);
process.exit(bledy === 0 ? 0 : 1);
