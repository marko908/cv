import type { ScoreCriterion, TailoredCv } from "@/lib/cv-schema";
import type { AiMeta } from "@/lib/store";
import { buildLedgerFromCv, type FactLedger } from "./fact-ledger";
import { parsujOferte, type ParsedOferta } from "./job-offer";
import { dopasuj, type WynikDopasowania } from "./matching";
import { ocenCv } from "./scoring";
import { przepiszCv, zlozCv } from "./rewrite";
import { validateAgainstLedger, type Violation } from "./validator";
import { opiszZmiany, zbudujWskazowki } from "./changes";
import {
  zbudujPytania,
  zbudujPytaniaOMetryki,
  type PytanieWywiadu,
} from "./interview";

/**
 * Pełny przebieg dopasowania CV do oferty.
 *
 *  1. ogłoszenie → wymagania           (AI, tani model)
 *  2. CV → rejestr faktów              (kod)
 *  3. dopasowanie fakt ↔ wymaganie     (kod)  ← to jest zarazem plan zmian
 *  4. przepisanie CV                   (AI, mocny model)
 *  5. walidacja anty-halucynacyjna     (kod)
 *  6. wynik „po” tym samym miernikiem  (kod)  ← poprawa zmierzona, nie deklarowana
 *  7. opis zmian z realnego diffa      (kod)
 */

export type OpcjeDopasowania = {
  /**
   * Oryginalne CV (sprzed wywiadu). Gdy podane, wynik „przed" i opis zmian
   * liczymy względem NIEGO, a nie względem `baseCv`. Dzięki temu re-run po
   * wywiadzie pokazuje SKUMULOWANĄ poprawę (np. 61→89), a nie chwilowe „+0"
   * względem już wzbogaconego CV.
   */
  oryginalCv?: TailoredCv;
  /**
   * Id pytań już obsłużonych w tej sesji (zadane/potwierdzone/„nie mam"/
   * pominięte). Nie zadajemy ich ponownie — inaczej te same pytania wracałyby
   * w nieskończoność.
   */
  obsluzonePytania?: string[];
  /**
   * Sparsowana oferta z wcześniejszej rundy tej samej sesji. Gdy podana,
   * pomijamy ponowne parsowanie AI — wymagania są wtedy identyczne co rundę,
   * więc wynik „przed"/„po" nie drga z niedeterminizmu modelu, a koszt spada
   * (jedno wywołanie taniego modelu mniej na rundę).
   */
  oferta?: ParsedOferta;
};

export type WynikPipeline = {
  jobTitle: string;
  oferta: ParsedOferta;
  tailoredCv: TailoredCv;
  aiMeta: AiMeta;
  /** Pytania wywiadu do luk — do opcjonalnego wzmocnienia CV. */
  pytania: PytanieWywiadu[];
  /** Naruszenia odrzucone przez walidator — do diagnostyki i logów. */
  odrzucone: Violation[];
  diagnostyka: {
    czasMs: number;
    tokenyWejscie: number;
    tokenyWyjscie: number;
  };
};

/**
 * Cofa do oryginału te fragmenty, które nie przeszły walidacji.
 *
 * Nie odrzucamy całego CV z powodu jednego wymyślonego punktu — wracamy tylko
 * do oryginalnego brzmienia tego fragmentu. Użytkownik dostaje przerobione CV
 * bez zmyśleń, zamiast komunikatu o błędzie.
 */
function naprawCv(
  przerobione: TailoredCv,
  oryginal: TailoredCv,
  naruszenia: Violation[]
): TailoredCv {
  if (naruszenia.length === 0) return przerobione;
  const wynik: TailoredCv = structuredClone(przerobione);

  for (const n of naruszenia) {
    if (n.field === "professional_summary") {
      wynik.professional_summary = oryginal.professional_summary;
      continue;
    }
    const exp = /^experience\[(\d+)\]\.bullets\[(\d+)\]$/.exec(n.field);
    if (exp) {
      const [i, j] = [Number(exp[1]), Number(exp[2])];
      const zrodlo = oryginal.experience[i]?.bullets[j];
      if (zrodlo !== undefined && wynik.experience[i]) {
        wynik.experience[i].bullets[j] = zrodlo;
      }
      continue;
    }
    const proj = /^projects\[(\d+)\]\.bullets\[(\d+)\]$/.exec(n.field);
    if (proj) {
      const [i, j] = [Number(proj[1]), Number(proj[2])];
      const zrodlo = oryginal.projects[i]?.bullets[j];
      if (zrodlo !== undefined && wynik.projects[i]) {
        wynik.projects[i].bullets[j] = zrodlo;
      }
      continue;
    }
    // Cokolwiek innego — sekcje twarde wracają do oryginału w całości.
    wynik.skills = oryginal.skills;
    wynik.education = oryginal.education;
    wynik.languages = oryginal.languages;
    wynik.personal_info = oryginal.personal_info;
  }
  return wynik;
}

/** Tytuł pozycji w historii — ze sparsowanej oferty, nie z heurystyki. */
function tytulDopasowania(oferta: ParsedOferta): string {
  return oferta.firma
    ? `${oferta.stanowisko} — ${oferta.firma}`
    : oferta.stanowisko;
}

export async function uruchomDopasowanie(
  baseCv: TailoredCv,
  trescOferty: string,
  opcje: OpcjeDopasowania = {}
): Promise<WynikPipeline> {
  const start = Date.now();
  let tokenyWejscie = 0;
  let tokenyWyjscie = 0;

  // 1-3. Oferta, fakty, dopasowanie przed zmianami.
  //   Ofertę parsujemy RAZ na sesję: na re-runie klient odsyła sparsowaną
  //   ofertę (opcje.oferta), więc pomijamy ponowne wywołanie AI. To usuwa
  //   drganie wyniku (te same wymagania co rundę) i obniża koszt.
  let oferta: ParsedOferta;
  if (opcje.oferta) {
    oferta = opcje.oferta;
  } else {
    const { oferta: sparsowana, zuzycie: zuzycieOferty } =
      await parsujOferte(trescOferty);
    oferta = sparsowana;
    tokenyWejscie += zuzycieOferty.wejscie;
    tokenyWyjscie += zuzycieOferty.wyjscie;
  }

  const ledger: FactLedger = buildLedgerFromCv(baseCv);
  const przed: WynikDopasowania = dopasuj(oferta, ledger);

  // Trafione słowa kluczowe z oferty (obecne w CV wejściowym) — straż
  // przepisywania nie pozwoli ich zgubić, bo ich utrata obniża wynik ATS.
  const trafioneSlowa = [
    ...new Set(
      przed.dopasowania
        .filter((d) => d.pokrycie !== "brak")
        .flatMap((d) => d.trafioneSlowa)
    ),
  ];

  // 4. Przepisanie — model dostaje wyłącznie fakty i plan.
  const { przepisanie, zuzycie: zuzycieCv } = await przepiszCv(
    ledger,
    oferta,
    przed
  );
  tokenyWejscie += zuzycieCv.wejscie;
  tokenyWyjscie += zuzycieCv.wyjscie;

  let tailoredCv = zlozCv(baseCv, przepisanie, trafioneSlowa);

  // 5. Walidacja i naprawa. Rejestr faktów pochodzi z ORYGINAŁU — to on jest
  //    źródłem prawdy, a nie to, co model właśnie napisał.
  const walidacja = validateAgainstLedger(tailoredCv, ledger);
  tailoredCv = naprawCv(tailoredCv, baseCv, walidacja.violations);

  // 6. Wynik „po” liczony tym samym miernikiem co „przed”.
  let po = dopasuj(oferta, buildLedgerFromCv(tailoredCv));
  let ocenaPo = ocenCv(tailoredCv, po);

  // 6a. PODŁOGA WYNIKU — dopasowanie NIE MOŻE obniżyć oceny względem CV, które
  //     dostaliśmy na wejściu. Jeśli przepisanie mimo straży pogorszyło wynik
  //     (np. przy bardzo krótkiej ofercie, gdzie jedno słowo waży dużo), wracamy
  //     do CV wejściowego: użytkownik w najgorszym razie dostaje +0, nigdy minus.
  //     To gwarancja w kodzie, nie prośba do modelu.
  const ocenaBazy = ocenCv(baseCv, przed);
  if (ocenaPo.wynik < ocenaBazy.wynik) {
    tailoredCv = baseCv;
    po = przed;
    ocenaPo = ocenaBazy;
  }

  // 6b. Rubryka oceny 0–100 — wynik rozłożony na jawne, ważone kryteria.
  //     Ten sam rachunek dla „przed” i „po”, więc różnica na każdym kryterium
  //     jest realną, wytłumaczalną miarą tego, co poprawiliśmy.
  // Odniesienie dla wyniku „przed" i opisu zmian: oryginalne CV (gdy podane —
  // czyli na re-runie po wywiadzie), inaczej samo baseCv. Dzięki temu po
  // wywiadzie widać skumulowaną poprawę względem punktu wyjścia, a nie względem
  // już wzbogaconego CV (które fałszywie pokazywało „+0").
  const odniesienie = opcje.oryginalCv ?? baseCv;
  const dopOdniesienie =
    odniesienie === baseCv
      ? przed
      : dopasuj(oferta, buildLedgerFromCv(odniesienie));
  const ocenaPrzed = ocenCv(odniesienie, dopOdniesienie);
  const scoreBreakdown: ScoreCriterion[] = ocenaPo.kryteria.map((k) => {
    const przedK = ocenaPrzed.kryteria.find((x) => x.id === k.id);
    return {
      id: k.id,
      label: k.etykieta,
      weight: k.waga,
      before: przedK?.zdobyte ?? 0,
      after: k.zdobyte,
      explanation: k.opis,
      dependsOnOffer: k.zalezyOdOferty,
    };
  });

  // 7. Opis zmian z rzeczywistej różnicy — względem odniesienia (oryginału na
  //    re-runie), żeby dziennik zmian obejmował całą skumulowaną pracę.
  const changesLog = opiszZmiany(odniesienie, tailoredCv, oferta, po);
  const findings = zbudujWskazowki(oferta, po, changesLog.length);

  const addedKeywords = [
    ...new Set(
      po.dopasowania
        .filter((d) => d.pokrycie !== "brak")
        .flatMap((d) => d.trafioneSlowa)
    ),
  ];

  // Pytania wywiadu: najpierw luki wobec oferty (najważniejsze), potem
  // uzupełnienie o metryki dla mętnych punktów. Limit, by nie przytłoczyć.
  // Odfiltrowujemy pytania już obsłużone w tej sesji — bez tego te same pytania
  // (odrzucona luka „nie mam", pominięta metryka) wracałyby w każdej rundzie
  // bez końca. To domyka pętlę wywiadu.
  const obsluzone = new Set(opcje.obsluzonePytania ?? []);
  const pytania = [
    ...zbudujPytania(po.luki),
    ...zbudujPytaniaOMetryki(tailoredCv),
  ]
    .filter((p) => !obsluzone.has(p.id))
    .slice(0, 5);

  return {
    jobTitle: tytulDopasowania(oferta),
    oferta,
    tailoredCv,
    pytania,
    aiMeta: {
      matchScoreBefore: ocenaPrzed.wynik,
      matchScoreAfter: ocenaPo.wynik,
      addedKeywords,
      changesLog,
      findings,
      scoreBreakdown,
      unlocked: false,
    },
    odrzucone: walidacja.violations,
    diagnostyka: {
      czasMs: Date.now() - start,
      tokenyWejscie,
      tokenyWyjscie,
    },
  };
}
