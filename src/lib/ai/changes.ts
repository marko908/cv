import type { ChangeLogEntry, TailoredCv } from "@/lib/cv-schema";
import type { ReviewFinding } from "@/lib/store";
import type { ParsedOferta } from "./job-offer";
import type { WynikDopasowania } from "./matching";
import { pluralize } from "@/lib/utils";

/**
 * KROK 7 PIPELINE'U: opis zmian i wskazówki.
 *
 * Wszystko tutaj powstaje z PORÓWNANIA dwóch wersji CV i z wyniku dopasowania.
 * Model nie jest pytany „co poprawiłeś” — bo wtedy napisałby, że poprawił
 * rzeczy, których nie ruszył. Opis zmian musi odpowiadać temu, co faktycznie
 * jest w pliku.
 */

/**
 * Normalizacja do PORÓWNANIA — pomija interpunkcję, wielkość liter i zwielokrotnione
 * spacje. Dzięki temu zmiana czysto kosmetyczna (usunięta kropka, „.” → „!”) NIE
 * jest raportowana jako przeredagowanie merytoryczne. Liczy się różnica w słowach,
 * nie w znakach interpunkcyjnych.
 */
function znormalizuj(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Różnica ISTOTNA — po odrzuceniu interpunkcji teksty wciąż mają inne słowa. */
function rozne(a: string, b: string): boolean {
  return znormalizuj(a) !== znormalizuj(b);
}

/** Wymagania, które dana treść pokrywa — do uzasadnienia „dlaczego”. */
function czegoDotyczy(
  tekst: string,
  dopasowanie: WynikDopasowania
): string[] {
  const t = znormalizuj(tekst);
  return dopasowanie.dopasowania
    .filter(
      (d) =>
        d.pokrycie !== "brak" &&
        d.trafioneSlowa.some((s) => t.includes(znormalizuj(s)))
    )
    .map((d) => d.wymaganie.tekst);
}

/** Buduje dziennik zmian na podstawie rzeczywistej różnicy między wersjami. */
export function opiszZmiany(
  przed: TailoredCv,
  po: TailoredCv,
  oferta: ParsedOferta,
  dopasowanie: WynikDopasowania
): ChangeLogEntry[] {
  const zmiany: ChangeLogEntry[] = [];

  if (rozne(przed.professional_summary, po.professional_summary)) {
    const dotyczyPrzed = new Set(
      czegoDotyczy(przed.professional_summary, dopasowanie)
    );
    // Tylko wymagania, które NAPRAWDĘ pojawiły się nowe w podsumowaniu (nie było
    // ich w wersji „przed") — inaczej twierdzilibyśmy, że coś wyeksponowaliśmy,
    // choć było tam od początku.
    const nowe = czegoDotyczy(po.professional_summary, dopasowanie).filter(
      (d) => !dotyczyPrzed.has(d)
    );
    zmiany.push({
      section: "Podsumowanie zawodowe",
      change:
        "Przeredagowaliśmy podsumowanie tak, aby od pierwszego zdania odpowiadało na to, czego szuka ta oferta.",
      reason: nowe.length
        ? `Rekruter czyta podsumowanie jako pierwsze. Wyeksponowaliśmy w nim: ${nowe
            .slice(0, 3)
            .join(", ")}.`
        : `Dopasowaliśmy brzmienie do stanowiska „${oferta.stanowisko}” - bez dopisywania czegokolwiek, czego nie ma w Twoim CV.`,
    });
  }

  przed.experience.forEach((exp, i) => {
    const poExp = po.experience[i];
    if (!poExp) return;
    const zmienione = poExp.bullets.filter(
      (b, j) => exp.bullets[j] !== undefined && rozne(exp.bullets[j], b)
    );
    // Punkty dopisane (np. z wywiadu) — realne „co dodaliśmy", nie zmyślenie.
    const dodane = Math.max(0, poExp.bullets.length - exp.bullets.length);
    if (zmienione.length === 0 && dodane === 0) return;

    const dotyczy = [
      ...new Set(zmienione.flatMap((b) => czegoDotyczy(b, dopasowanie))),
    ];

    // Opis składamy z tego, co FAKTYCZNIE zaszło (przeformułowania i/lub dodania).
    const czesci: string[] = [];
    if (zmienione.length > 0) {
      czesci.push(
        `przeformułowaliśmy ${pluralize(
          zmienione.length,
          "punkt",
          "punkty",
          "punktów"
        )}`
      );
    }
    if (dodane > 0) {
      czesci.push(
        `dodaliśmy ${pluralize(
          dodane,
          "punkt",
          "punkty",
          "punktów"
        )} na podstawie Twojej odpowiedzi w wywiadzie`
      );
    }
    const opis = czesci.join(" i ");
    zmiany.push({
      section: `Doświadczenie - ${exp.role || "pozycja"}${
        exp.company ? ` (${exp.company})` : ""
      }`,
      change: `${opis.charAt(0).toUpperCase()}${opis.slice(
        1
      )}, zachowując wszystkie liczby i technologie z Twojego oryginału.`,
      reason: dotyczy.length
        ? `Użyliśmy słownictwa z ogłoszenia tam, gdzie opisuje to samo, co już robiłeś - dzięki temu CV lepiej przechodzi przez filtry ATS. Dotyczy: ${dotyczy
            .slice(0, 3)
            .join(", ")}.`
        : "Uporządkowaliśmy opis tak, aby zaczynał się od konkretu, a nie od opisu obowiązków.",
    });
  });

  // Kolejność umiejętności: raportujemy TYLKO gdy wymagane w ofercie realnie
  // poszły w górę. Wcześniej był sztywny opis „są teraz na początku", który
  // potrafił kłamać (przy odwrotnym ruchu albo braku wymaganych skilli w CV).
  if (
    przed.skills.technical.join("|") !== po.skills.technical.join("|") &&
    przed.skills.technical.length === po.skills.technical.length
  ) {
    const slowaOferty = new Set(
      oferta.wymagania
        .flatMap((w) => w.slowa_kluczowe)
        .map(znormalizuj)
        .filter(Boolean)
    );
    const czyWymagany = (skill: string): boolean => {
      const n = znormalizuj(skill);
      if (!n) return false;
      return [...slowaOferty].some((s) => n.includes(s) || s.includes(n));
    };
    const wymagane = po.skills.technical.filter(czyWymagany);
    const sredniaPozycja = (lista: string[]): number => {
      const idx = wymagane
        .map((s) => lista.findIndex((x) => znormalizuj(x) === znormalizuj(s)))
        .filter((i) => i >= 0);
      return idx.length ? idx.reduce((a, b) => a + b, 0) / idx.length : Infinity;
    };
    const poszlyWGore =
      wymagane.length > 0 &&
      sredniaPozycja(po.skills.technical) < sredniaPozycja(przed.skills.technical);

    if (poszlyWGore) {
      zmiany.push({
        section: "Umiejętności",
        change: `Przenieśliśmy wyżej umiejętności wymagane w tej ofercie: ${wymagane
          .slice(0, 4)
          .join(", ")}.`,
        reason:
          "Rekruter skanuje CV przez kilka sekund - to, czego szuka oferta, powinno rzucać się w oczy najpierw. Żadna umiejętność nie została dodana ani usunięta.",
      });
    }
    // Jeśli kolejność się zmieniła, ale wymagane NIE poszły w górę — nie
    // raportujemy nic (to była nieistotna zmiana kolejności, nie poprawa).
  }

  return zmiany;
}

/**
 * Wskazówki edukacyjne — opisują ZASADĘ i to, co zrobiliśmy.
 * Nie są poleceniami dla użytkownika, bo poprawki są już wprowadzone.
 */
export function zbudujWskazowki(
  oferta: ParsedOferta,
  dopasowanie: WynikDopasowania,
  liczbaZmian: number
): ReviewFinding[] {
  const wskazowki: ReviewFinding[] = [];

  const trafione = dopasowanie.dopasowania
    .filter((d) => d.pokrycie !== "brak")
    .flatMap((d) => d.trafioneSlowa);

  if (trafione.length > 0) {
    wskazowki.push({
      id: "slowa-kluczowe",
      category: "ats",
      severity: "high",
      title: "Słowa kluczowe z ogłoszenia",
      detail: `Systemy ATS filtrują CV po dosłownym brzmieniu słów z ogłoszenia. Zadbaliśmy o to, by w Twoim CV pojawiły się te, które faktycznie opisują Twoje doświadczenie: ${[
        ...new Set(trafione),
      ]
        .slice(0, 8)
        .join(", ")}. Pokrycie słów kluczowych z tej oferty wynosi ${dopasowanie.pokrycieSlowKluczowych}%.`,
    });
  }

  const luki = dopasowanie.luki.filter((d) => d.pokrycie === "brak");
  if (luki.length > 0) {
    wskazowki.push({
      id: "luki",
      category: "dopasowanie",
      severity: luki.some((l) => l.wymaganie.priorytet === "wymagane")
        ? "high"
        : "medium",
      title: "Czego ta oferta wymaga, a czego nie ma w Twoim CV",
      detail:
        "Nie dopisaliśmy tego do CV, bo nie podałeś tego o sobie, a wymyślone kompetencje wychodzą na rozmowie. Brakuje:",
      items: luki.map((l) => l.wymaganie.tekst),
      podsumowanie:
        "Jeśli faktycznie masz z tym styczność, dopisz to w edytorze, a dopasowanie policzymy od nowa.",
    });
  }

  wskazowki.push({
    id: "fakty",
    category: "wiarygodnosc",
    severity: "medium",
    title: "Wszystko opiera się na Twoich danych",
    detail: `Przy przepisywaniu CV korzystaliśmy wyłącznie z informacji, które sam podałeś - żadna liczba, technologia ani nazwa firmy nie została dodana. ${
      liczbaZmian > 0
        ? `Wprowadziliśmy ${liczbaZmian === 1 ? "jedną zmianę" : `${liczbaZmian} zmiany`} w treści.`
        : ""
    } To dlatego możesz spokojnie iść z tym CV na rozmowę.`,
  });

  return wskazowki;
}
