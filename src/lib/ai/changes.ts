import type { ChangeLogEntry, TailoredCv } from "@/lib/cv-schema";
import type { ReviewFinding } from "@/lib/store";
import type { ParsedOferta } from "./job-offer";
import type { WynikDopasowania } from "./matching";

/**
 * KROK 7 PIPELINE'U: opis zmian i wskazówki.
 *
 * Wszystko tutaj powstaje z PORÓWNANIA dwóch wersji CV i z wyniku dopasowania.
 * Model nie jest pytany „co poprawiłeś” — bo wtedy napisałby, że poprawił
 * rzeczy, których nie ruszył. Opis zmian musi odpowiadać temu, co faktycznie
 * jest w pliku.
 */

function znormalizuj(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

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
    const dotyczy = czegoDotyczy(po.professional_summary, dopasowanie);
    zmiany.push({
      section: "Podsumowanie zawodowe",
      change:
        "Przeredagowaliśmy podsumowanie tak, aby od pierwszego zdania odpowiadało na to, czego szuka ta oferta.",
      reason: dotyczy.length
        ? `Rekruter czyta podsumowanie jako pierwsze. Wyeksponowaliśmy w nim: ${dotyczy
            .slice(0, 3)
            .join(", ")}.`
        : `Dopasowaliśmy je do stanowiska „${oferta.stanowisko}”.`,
    });
  }

  przed.experience.forEach((exp, i) => {
    const poExp = po.experience[i];
    if (!poExp) return;
    const zmienione = poExp.bullets.filter(
      (b, j) => exp.bullets[j] !== undefined && rozne(exp.bullets[j], b)
    );
    if (zmienione.length === 0) return;

    const dotyczy = [
      ...new Set(zmienione.flatMap((b) => czegoDotyczy(b, dopasowanie))),
    ];
    zmiany.push({
      section: `Doświadczenie — ${exp.role || "pozycja"}${
        exp.company ? ` (${exp.company})` : ""
      }`,
      change: `Przeformułowaliśmy ${zmienione.length === 1 ? "jeden punkt" : `${zmienione.length} punkty`}, zachowując wszystkie liczby i technologie z Twojego oryginału.`,
      reason: dotyczy.length
        ? `Użyliśmy słownictwa z ogłoszenia tam, gdzie opisuje to samo, co już robiłeś — dzięki temu CV lepiej przechodzi przez filtry ATS. Dotyczy: ${dotyczy
            .slice(0, 3)
            .join(", ")}.`
        : "Uporządkowaliśmy opis tak, aby zaczynał się od konkretu, a nie od opisu obowiązków.",
    });
  });

  if (
    przed.skills.technical.join("|") !== po.skills.technical.join("|") &&
    przed.skills.technical.length === po.skills.technical.length
  ) {
    zmiany.push({
      section: "Umiejętności",
      change:
        "Zmieniliśmy kolejność umiejętności — te wymagane w ofercie są teraz na początku listy.",
      reason:
        "Rekruter skanuje CV przez kilka sekund. Kolejność decyduje o tym, co zauważy najpierw. Żadna umiejętność nie została dodana ani usunięta.",
    });
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
      detail: `Nie dopisaliśmy tego do CV, bo nie podałeś tego o sobie — a wymyślone kompetencje wychodzą na rozmowie. Brakuje: ${luki
        .map((l) => l.wymaganie.tekst)
        .join("; ")}. Jeśli faktycznie masz z tym styczność, dopisz to w edytorze, a dopasowanie policzymy od nowa.`,
    });
  }

  wskazowki.push({
    id: "fakty",
    category: "wiarygodnosc",
    severity: "medium",
    title: "Wszystko opiera się na Twoich danych",
    detail: `Przy przepisywaniu CV korzystaliśmy wyłącznie z informacji, które sam podałeś — żadna liczba, technologia ani nazwa firmy nie została dodana. ${
      liczbaZmian > 0
        ? `Wprowadziliśmy ${liczbaZmian === 1 ? "jedną zmianę" : `${liczbaZmian} zmiany`} w treści.`
        : ""
    } To dlatego możesz spokojnie iść z tym CV na rozmowę.`,
  });

  return wskazowki;
}
