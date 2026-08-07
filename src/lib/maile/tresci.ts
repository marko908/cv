import { APLIKACJA, FIRMA, SCIEZKI } from "@/lib/prawne/dane";
import { OKRESY, PLANY, type OkresRozliczeniowy, type PlanId } from "@/lib/subscription";
import {
  akapit,
  drobnymDrukiem,
  link,
  podsumowanie,
  przycisk,
  szablonMaila,
  uwaga,
} from "./szablon";

/**
 * TREŚCI MAILI — jedno miejsce, w którym da się przeczytać wszystko, co
 * aplikacja mówi klientowi.
 *
 * Każda funkcja zwraca `{ temat, html, text }` i NIE wysyła — wysyłką zajmuje
 * się `lib/mail.ts`, oprawą `./szablon`. Rozdział jest celowy: treść tych maili
 * realizuje konkretne obowiązki z Regulaminu, więc musi dać się zaudytować bez
 * czytania tras API, i musi dać się wyrenderować do podglądu bez wysyłania
 * czegokolwiek.
 *
 * PRZY KAŻDYM MAILU STOI PARAGRAF, KTÓRY GO WYMAGA. Jeżeli zmieniasz treść
 * Regulaminu w miejscu, do którego mail się odwołuje — popraw też mail, w tym
 * samym commicie. Rozjazd między tym, co obiecuje Regulamin, a tym, co pisze
 * mail, jest w sporze konsumenckim gorszy niż brak maila.
 *
 * WERSJA TEKSTOWA NIE JEST OZDOBNIKIEM — piszemy ją równolegle, nigdy przez
 * strippowanie HTML-a. Filtry antyspamowe oceniają wiadomość bez `text` gorzej,
 * a treść, od której zależą terminy na odstąpienie, musi być czytelna również
 * w kliencie bez HTML-a.
 */

export interface TrescMaila {
  temat: string;
  html: string;
  text: string;
}

const LINK_APLIKACJA = `${APLIKACJA.adresWww}/app`;
const LINK_USTAWIENIA = `${APLIKACJA.adresWww}/app/ustawienia`;
const LINK_REGULAMIN = `${APLIKACJA.adresWww}${SCIEZKI.regulamin}`;
const LINK_POLITYKA = `${APLIKACJA.adresWww}${SCIEZKI.politykaPrywatnosci}`;
const LINK_REGULAMIN_NEWSLETTERA = `${APLIKACJA.adresWww}${SCIEZKI.regulaminNewslettera}`;

/** Kwota brutto z groszy Stripe'a. Format PL: spacja tysięcy, przecinek groszy. */
function zl(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(grosze / 100);
}

/** Data słownie („6 sierpnia 2026") — czytelniejsza i bez pomyłki DD/MM vs MM/DD. */
function dzien(kiedy: Date | string | number): string {
  const d = kiedy instanceof Date ? kiedy : new Date(kiedy);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Stopka podpisu — jedna dla wszystkich, żeby ton się nie rozjeżdżał. */
const POZDROWIENIA_TEXT = `Pozdrawiamy,\n${APLIKACJA.nazwa}`;

/**
 * Zdanie o fakturze. Faktury VAT wystawia Fakturownia (przez Striptu, ze
 * zdarzeń Stripe'a) i ONA wysyła je klientowi — nie ta aplikacja. Dlatego mail
 * zapowiada fakturę, ale jej nie załącza i nie twierdzi, że wysyła ją sam.
 *
 * ⚠️ To zdanie jest obietnicą wobec konsumenta (Regulamin § 5 ust. 4).
 * Nie może pójść na produkcję, zanim integracja z Fakturownią realnie działa.
 */
const O_FAKTURZE =
  "Fakturę VAT wyślemy osobną wiadomością na ten sam adres e-mail.";

/**
 * 1. POWITANIE PO ZAŁOŻENIU KONTA
 *
 * Regulamin § 4 ust. 4: wprowadzenie kodu aktywacyjnego = zawarcie nieodpłatnej
 * Umowy o Konto. Checklista prawnika, poz. 1: Regulamin w PDF jako załącznik do
 * każdej wiadomości potwierdzającej utworzenie konta.
 *
 * Mail NIE jest marketingiem i nie wymaga zgody marketingowej — potwierdza
 * zawarcie umowy, o którą użytkownik właśnie poprosił. Dotyczy to również
 * wariantu z `zgodaMarketing = true`: akapit o newsletterze POTWIERDZA zapis,
 * a nie zachęca do zakupu, więc wychodzi także do osób, które zgody nie
 * udzieliły — tyle że wtedy bez tego akapitu.
 *
 * `zgodaMarketing` dokłada potwierdzenie zawarcia Umowy o dostarczanie
 * Newslettera (Regulamin § 4 ust. 20, Regulamin newslettera § 5 ust. 1–2)
 * i drugi załącznik PDF — checklista prawnika, poz. 42. Wołający ustala tę
 * wartość czytając `profil.zgoda_marketing` z bazy, nigdy z treści żądania.
 */
export function mailPowitalny(zgodaMarketing = false): TrescMaila {
  // Potwierdzenie zawarcia Umowy o dostarczanie Newslettera — dokładany TYLKO
  // przy udzielonej zgodzie. Regulamin newslettera § 5 ust. 1–2: zgoda złożona
  // przy rejestracji zawiera tę umowę, a checklista prawnika (poz. 42) wymaga
  // potwierdzenia jej wraz z regulaminem w PDF. Dla osoby, która zgody nie
  // udzieliła, ten akapit byłby nieprawdą.
  const akapitNewsletteraHtml = zgodaMarketing
    ? akapit(
        `Zapisaliśmy Cię też na newsletter — zgodziłeś/-aś się na otrzymywanie informacji handlowych o nowościach i promocjach. Zasady opisuje ${link("Regulamin newslettera", LINK_REGULAMIN_NEWSLETTERA)}, dołączony do tej wiadomości w PDF. Zgodę możesz wycofać w każdej chwili w ${link("ustawieniach konta", LINK_USTAWIENIA)} albo klikając link rezygnacji w dowolnej wiadomości — nie wpływa to na nic innego w Twoim koncie.`
      )
    : "";

  const akapitNewsletteraText = zgodaMarketing
    ? `\nZapisaliśmy Cię też na newsletter — zgodziłeś/-aś się na otrzymywanie informacji handlowych o nowościach i promocjach. Zasady opisuje Regulamin newslettera (${LINK_REGULAMIN_NEWSLETTERA}), dołączony do tej wiadomości w PDF. Zgodę możesz wycofać w każdej chwili w ustawieniach konta (${LINK_USTAWIENIA}) albo klikając link rezygnacji w dowolnej wiadomości — nie wpływa to na nic innego w Twoim koncie.\n`
    : "";

  return {
    temat: `Witaj w ${APLIKACJA.nazwa} — potwierdzenie założenia konta`,
    html: szablonMaila({
      naglowek: `Witaj w ${APLIKACJA.nazwa}`,
      tresc: [
        akapit("Cześć!"),
        akapit(
          `Twoje konto zostało utworzone. Przy rejestracji potwierdziłeś/-aś zapoznanie się z ${link("Regulaminem", LINK_REGULAMIN)} i ${link("Polityką prywatności", LINK_POLITYKA)} oraz akceptację ich postanowień — aktualną treść Regulaminu znajdziesz też w załączniku do tej wiadomości (PDF).`
        ),
        akapitNewsletteraHtml,
        akapit(
          "Kreator CV, wszystkie szablony i pobranie własnego CV w PDF są bezpłatne. Płatne jest dopasowanie CV do konkretnej oferty pracy."
        ),
        przycisk("Przejdź do aplikacji", LINK_APLIKACJA),
        drobnymDrukiem(
          `Konto możesz usunąć w każdej chwili w ustawieniach — bez podawania przyczyny (Regulamin § 4 ust. 14). Jeśli to nie Ty zakładałeś/-aś konto, napisz na ${FIRMA.email}.`
        ),
      ]
        .filter(Boolean)
        .join("\n"),
    }),
    text: `Cześć!

Twoje konto w ${APLIKACJA.nazwa} zostało utworzone. Przy rejestracji potwierdziłeś/-aś zapoznanie się z Regulaminem (${LINK_REGULAMIN}) i Polityką prywatności (${LINK_POLITYKA}) oraz akceptację ich postanowień — aktualną treść Regulaminu znajdziesz też w załączniku do tej wiadomości (PDF).
${akapitNewsletteraText}
Kreator CV, wszystkie szablony i pobranie własnego CV w PDF są bezpłatne. Płatne jest dopasowanie CV do konkretnej oferty pracy.

Przejdź do aplikacji: ${LINK_APLIKACJA}

Konto możesz usunąć w każdej chwili w ustawieniach, bez podawania przyczyny (Regulamin § 4 ust. 14). Jeśli to nie Ty zakładałeś/-aś konto, napisz na ${FIRMA.email}.

${POZDROWIENIA_TEXT}`,
  };
}

/**
 * 2. POTWIERDZENIE ODBLOKOWANIA JEDNORAZOWEGO (12 zł)
 *
 * Regulamin § 4 ust. 10: potwierdzenie zawarcia Umowy WRAZ Z JEJ TREŚCIĄ —
 * stąd tabela z przedmiotem, kwotą i datą, a nie samo zdanie „dziękujemy".
 *
 * Regulamin § 8 ust. 6 i art. 38 ust. 1 pkt 1 ustawy o prawach konsumenta:
 * usługa wykonana w pełni za uprzednią zgodą → prawo odstąpienia NIE
 * przysługuje. To musi paść wprost i musi się różnić od maila subskrypcyjnego,
 * gdzie 14 dni zostaje. Napisanie subskrybentowi, że stracił prawo odstąpienia,
 * byłoby nieprawdą działającą na jego szkodę.
 */
export function mailZakupJednorazowy(dane: {
  kwotaGrosze: number;
  zawartoUmowe: Date | string | number;
  linkDopasowania?: string;
}): TrescMaila {
  const { kwotaGrosze, zawartoUmowe, linkDopasowania } = dane;
  const kwota = zl(kwotaGrosze);
  const data = dzien(zawartoUmowe);
  const cel = linkDopasowania ?? LINK_APLIKACJA;

  const zgoda =
    "Przy zakupie potwierdziłeś/-aś zapoznanie się z Regulaminem i Polityką prywatności " +
    "oraz wyraziłeś/-aś zgodę na rozpoczęcie świadczenia usługi cyfrowej przed upływem " +
    "terminu na odstąpienie od umowy. Zgodnie z art. 38 ust. 1 pkt 1 ustawy o prawach " +
    "konsumenta oznacza to, że po pełnym wykonaniu usługi — czyli po udostępnieniu " +
    "pełnego wyniku Dopasowania — prawo odstąpienia od tej umowy Ci nie przysługuje.";

  return {
    temat: `${APLIKACJA.nazwa} — potwierdzenie zamówienia: odblokowanie dopasowania`,
    html: szablonMaila({
      naglowek: "Potwierdzenie zamówienia",
      tresc: [
        akapit("Cześć!"),
        akapit("Potwierdzamy zawarcie umowy i udostępnienie zamówionej usługi."),
        podsumowanie([
          ["Przedmiot", "Odblokowanie jednego Dopasowania"],
          ["Kwota brutto", kwota],
          ["Data zawarcia umowy", data],
          ["Dostęp", "bezterminowy, bez odnowień"],
        ]),
        akapit(
          "Dostęp obejmuje również wynik ponownie przeliczony po skorzystaniu z wywiadu uzupełniającego w ramach tego samego Dopasowania."
        ),
        akapit(O_FAKTURZE),
        przycisk("Zobacz swój raport", cel),
        drobnymDrukiem(
          `${zgoda} Aktualną treść Regulaminu znajdziesz w załączniku do tej wiadomości (PDF).`
        ),
      ].join("\n"),
    }),
    text: `Cześć!

Potwierdzamy zawarcie umowy i udostępnienie zamówionej usługi.

Przedmiot: Odblokowanie jednego Dopasowania
Kwota brutto: ${kwota}
Data zawarcia umowy: ${data}
Dostęp: bezterminowy, bez odnowień

Dostęp obejmuje również wynik ponownie przeliczony po skorzystaniu z wywiadu uzupełniającego w ramach tego samego Dopasowania.

${O_FAKTURZE}

Zobacz swój raport: ${cel}

${zgoda} Aktualną treść Regulaminu znajdziesz w załączniku do tej wiadomości (PDF).

${POZDROWIENIA_TEXT}`,
  };
}

/**
 * 3. POTWIERDZENIE SUBSKRYPCJI
 *
 * Regulamin § 4 ust. 10 (potwierdzenie z treścią umowy), § 5 ust. 5
 * (AUTOMATYCZNE ODNOWIENIE — musi paść wprost, razem z datą i sposobem
 * rezygnacji; subskrypcja odnawiająca się po cichu to klasyczna klauzula
 * abuzywna), § 5 ust. 6 (rezygnacja w panelu, dostęp do końca okresu),
 * § 8 ust. 7 (14 dni na odstąpienie ZOSTAJE, zwrot proporcjonalny, art. 35).
 */
export function mailZakupSubskrypcja(dane: {
  plan: PlanId;
  okres: OkresRozliczeniowy;
  kwotaGrosze: number;
  zawartoUmowe: Date | string | number;
  koniecOkresu: Date | string | number | null;
}): TrescMaila {
  const { plan, okres, kwotaGrosze, zawartoUmowe, koniecOkresu } = dane;
  const nazwaPlanu = PLANY[plan].nazwa;
  const limit = PLANY[plan].limit;
  const etykietaOkresu = OKRESY[okres].etykieta.toLowerCase();
  const kwota = zl(kwotaGrosze);
  const data = dzien(zawartoUmowe);
  const odnowienie = koniecOkresu ? dzien(koniecOkresu) : null;

  const zdanieOdnowienia = odnowienie
    ? `Subskrypcja odnawia się automatycznie. Kolejna opłata w wysokości ${kwota} zostanie pobrana <strong>${odnowienie}</strong>, chyba że wcześniej zrezygnujesz z odnowienia.`
    : `Subskrypcja odnawia się automatycznie na kolejny okres rozliczeniowy, chyba że wcześniej zrezygnujesz z odnowienia.`;

  const zdanieOdnowieniaText = odnowienie
    ? `Subskrypcja odnawia się automatycznie. Kolejna opłata w wysokości ${kwota} zostanie pobrana ${odnowienie}, chyba że wcześniej zrezygnujesz z odnowienia.`
    : `Subskrypcja odnawia się automatycznie na kolejny okres rozliczeniowy, chyba że wcześniej zrezygnujesz z odnowienia.`;

  const zgoda =
    "Przy zakupie potwierdziłeś/-aś zapoznanie się z Regulaminem i Polityką prywatności " +
    "oraz wyraziłeś/-aś zgodę na rozpoczęcie świadczenia usługi przed upływem terminu na " +
    "odstąpienie od umowy. Mimo to, jeśli jesteś Konsumentem albo Przedsiębiorcą na prawach " +
    "Konsumenta, masz prawo odstąpić od tej umowy bez podania przyczyny w terminie 14 dni od " +
    "jej zawarcia — jeżeli w tym czasie korzystałeś/-aś z usługi, zwrócimy Ci opłatę " +
    "pomniejszoną proporcjonalnie do zakresu spełnionego świadczenia (art. 35 ustawy " +
    "o prawach konsumenta).";

  return {
    temat: `${APLIKACJA.nazwa} — potwierdzenie zamówienia: subskrypcja ${nazwaPlanu}`,
    html: szablonMaila({
      naglowek: "Potwierdzenie zamówienia",
      tresc: [
        akapit("Cześć!"),
        akapit("Potwierdzamy zawarcie umowy i aktywację subskrypcji."),
        podsumowanie([
          ["Plan", `${nazwaPlanu} (${etykietaOkresu})`],
          ["Limit", `${limit} dopasowań miesięcznie`],
          ["Kwota brutto", `${kwota} za okres rozliczeniowy`],
          ["Data zawarcia umowy", data],
          ...(odnowienie ? ([["Opłacone do", odnowienie]] as [string, string][]) : []),
        ]),
        uwaga(
          `${zdanieOdnowienia} Rezygnacja jest natychmiastowa i nie odbiera dostępu przed końcem opłaconego okresu — znajdziesz ją w ${link("ustawieniach konta", LINK_USTAWIENIA)}, w panelu zarządzania płatnościami.`
        ),
        akapit(O_FAKTURZE),
        przycisk("Przejdź do aplikacji", LINK_APLIKACJA),
        drobnymDrukiem(
          `${zgoda} Aktualną treść Regulaminu znajdziesz w załączniku do tej wiadomości (PDF).`
        ),
      ].join("\n"),
    }),
    text: `Cześć!

Potwierdzamy zawarcie umowy i aktywację subskrypcji.

Plan: ${nazwaPlanu} (${etykietaOkresu})
Limit: ${limit} dopasowań miesięcznie
Kwota brutto: ${kwota} za okres rozliczeniowy
Data zawarcia umowy: ${data}${odnowienie ? `\nOpłacone do: ${odnowienie}` : ""}

${zdanieOdnowieniaText} Rezygnacja jest natychmiastowa i nie odbiera dostępu przed końcem opłaconego okresu — znajdziesz ją w ustawieniach konta (${LINK_USTAWIENIA}), w panelu zarządzania płatnościami.

${O_FAKTURZE}

Przejdź do aplikacji: ${LINK_APLIKACJA}

${zgoda} Aktualną treść Regulaminu znajdziesz w załączniku do tej wiadomości (PDF).

${POZDROWIENIA_TEXT}`,
  };
}

/**
 * 4. NIEUDANA PŁATNOŚĆ ZA ODNOWIENIE
 *
 * Regulamin § 5 ust. 7: brak zapłaty za kolejny okres wstrzymuje dostęp do
 * Usług Płatnych z końcem okresu opłaconego. Bez tego maila człowiek z wygasłą
 * kartą traci dostęp bez jednego słowa ostrzeżenia — i dowiaduje się o tym
 * dopiero wtedy, gdy potrzebuje dopasowania.
 *
 * Świadomie NIE dajemy w mailu bezpośredniego linku do panelu Stripe'a: sesja
 * portalu jest krótkotrwała i wygasłaby, zanim ktoś kliknie. Prowadzimy do
 * ustawień konta, skąd portal otwiera się na świeżej sesji.
 */
export function mailNieudanaPlatnosc(dane: {
  plan: PlanId | null;
  kwotaGrosze: number | null;
  dostepDo: Date | string | number | null;
}): TrescMaila {
  const { plan, kwotaGrosze, dostepDo } = dane;
  const nazwaPlanu = plan ? PLANY[plan].nazwa : null;
  const kwota = kwotaGrosze ? zl(kwotaGrosze) : null;
  const doKiedy = dostepDo ? dzien(dostepDo) : null;

  const coSieStalo = kwota
    ? `Nie udało nam się pobrać opłaty w wysokości ${kwota} za odnowienie Twojej subskrypcji${nazwaPlanu ? ` ${nazwaPlanu}` : ""}.`
    : `Nie udało nam się pobrać opłaty za odnowienie Twojej subskrypcji${nazwaPlanu ? ` ${nazwaPlanu}` : ""}.`;

  const doKiedyZdanie = doKiedy
    ? `Dostęp do płatnych funkcji działa do <strong>${doKiedy}</strong>. Jeśli do tego czasu płatność nie przejdzie, dostęp zostanie wstrzymany.`
    : `Jeśli płatność nie przejdzie, dostęp do płatnych funkcji zostanie wstrzymany z końcem opłaconego okresu rozliczeniowego.`;

  const doKiedyText = doKiedy
    ? `Dostęp do płatnych funkcji działa do ${doKiedy}. Jeśli do tego czasu płatność nie przejdzie, dostęp zostanie wstrzymany.`
    : `Jeśli płatność nie przejdzie, dostęp do płatnych funkcji zostanie wstrzymany z końcem opłaconego okresu rozliczeniowego.`;

  const oDanych =
    "Twoje CV i historia dopasowań zostają na koncie niezależnie od statusu płatności — " +
    "kreator CV, szablony i pobieranie własnego CV w PDF działają dalej bezpłatnie.";

  return {
    temat: `${APLIKACJA.nazwa} — nie udało się pobrać opłaty za subskrypcję`,
    html: szablonMaila({
      naglowek: "Płatność nie przeszła",
      tresc: [
        akapit("Cześć!"),
        akapit(
          `${coSieStalo} Najczęściej to sprawa wygasłej karty albo braku środków — nie musi oznaczać niczego więcej.`
        ),
        uwaga(doKiedyZdanie),
        akapit(
          `Zaktualizuj metodę płatności w panelu zarządzania płatnościami — otworzysz go z ${link("ustawień konta", LINK_USTAWIENIA)}. Po udanej płatności dostęp wraca automatycznie, nie musisz nic zgłaszać.`
        ),
        przycisk("Zaktualizuj metodę płatności", LINK_USTAWIENIA),
        drobnymDrukiem(
          `${oDanych} Podstawa: Regulamin § 5 ust. 7. Jeśli uważasz, że to pomyłka, napisz na ${FIRMA.email}.`
        ),
      ].join("\n"),
    }),
    text: `Cześć!

${coSieStalo} Najczęściej to sprawa wygasłej karty albo braku środków — nie musi oznaczać niczego więcej.

${doKiedyText}

Zaktualizuj metodę płatności w panelu zarządzania płatnościami — otworzysz go z ustawień konta: ${LINK_USTAWIENIA}. Po udanej płatności dostęp wraca automatycznie, nie musisz nic zgłaszać.

${oDanych}

Podstawa: Regulamin § 5 ust. 7. Jeśli uważasz, że to pomyłka, napisz na ${FIRMA.email}.

${POZDROWIENIA_TEXT}`,
  };
}

/**
 * 5. POTWIERDZENIE REZYGNACJI Z ODNOWIENIA
 *
 * Regulamin § 5 ust. 6: rezygnacja NIE powoduje utraty dostępu przed upływem
 * opłaconego okresu. Mail istnieje właśnie po to, żeby to powiedzieć — bez
 * niego „anulowałem, a nadal mam dostęp" wygląda jak błąd systemu i wraca do
 * nas jako zgłoszenie albo, gorzej, jako reklamacja płatności.
 */
export function mailAnulowanieSubskrypcji(dane: {
  plan: PlanId | null;
  dostepDo: Date | string | number | null;
}): TrescMaila {
  const { plan, dostepDo } = dane;
  const nazwaPlanu = plan ? ` ${PLANY[plan].nazwa}` : "";
  const doKiedy = dostepDo ? dzien(dostepDo) : null;

  const zdanieDostepu = doKiedy
    ? `Zachowujesz pełny dostęp do <strong>${doKiedy}</strong> — czyli do końca okresu, który już opłaciłeś/-aś. Po tej dacie subskrypcja po prostu się nie odnowi.`
    : `Zachowujesz pełny dostęp do końca okresu, który już opłaciłeś/-aś. Po tej dacie subskrypcja po prostu się nie odnowi.`;

  const zdanieDostepuText = doKiedy
    ? `Zachowujesz pełny dostęp do ${doKiedy} — czyli do końca okresu, który już opłaciłeś/-aś. Po tej dacie subskrypcja po prostu się nie odnowi.`
    : `Zachowujesz pełny dostęp do końca okresu, który już opłaciłeś/-aś. Po tej dacie subskrypcja po prostu się nie odnowi.`;

  return {
    temat: `${APLIKACJA.nazwa} — potwierdzenie rezygnacji z odnowienia subskrypcji`,
    html: szablonMaila({
      naglowek: "Subskrypcja nie odnowi się",
      tresc: [
        akapit("Cześć!"),
        akapit(
          `Potwierdzamy rezygnację z automatycznego odnowienia subskrypcji${nazwaPlanu}. Nie pobierzemy już kolejnej opłaty.`
        ),
        uwaga(zdanieDostepu),
        akapit(
          "Twoje CV i historia dopasowań zostają na koncie. Kreator CV, wszystkie szablony i pobieranie własnego CV w PDF pozostają bezpłatne i działają dalej."
        ),
        akapit(
          `Jeśli zmienisz zdanie, możesz wznowić odnawianie w panelu zarządzania płatnościami w ${link("ustawieniach konta", LINK_USTAWIENIA)}.`
        ),
        przycisk("Przejdź do ustawień", LINK_USTAWIENIA),
        drobnymDrukiem(
          `Podstawa: Regulamin § 5 ust. 6. Rezygnacja z subskrypcji nie usuwa konta — konto usuwa się osobno, w ustawieniach.`
        ),
      ].join("\n"),
    }),
    text: `Cześć!

Potwierdzamy rezygnację z automatycznego odnowienia subskrypcji${nazwaPlanu}. Nie pobierzemy już kolejnej opłaty.

${zdanieDostepuText}

Twoje CV i historia dopasowań zostają na koncie. Kreator CV, wszystkie szablony i pobieranie własnego CV w PDF pozostają bezpłatne i działają dalej.

Jeśli zmienisz zdanie, możesz wznowić odnawianie w panelu zarządzania płatnościami w ustawieniach konta: ${LINK_USTAWIENIA}

Podstawa: Regulamin § 5 ust. 6. Rezygnacja z subskrypcji nie usuwa konta — konto usuwa się osobno, w ustawieniach.

${POZDROWIENIA_TEXT}`,
  };
}

/**
 * 6. POTWIERDZENIE PRZYJĘCIA ZGŁOSZENIA
 *
 * Do tej pory zgłoszenie leciało WYŁĄCZNIE na naszą skrzynkę, a zgłaszający nie
 * dostawał nic — nie wiedział nawet, czy do nas dotarło.
 *
 * Termin 14 dni bierze się z Regulaminu § 7 ust. 9 (odpowiedź na reklamację
 * Konsumenta). Zgłoszenie przez formularz może być reklamacją w rozumieniu
 * § 7, więc deklarujemy termin krótszy z możliwych — obiecanie 21 dni (§ 9,
 * przedsiębiorcy) osobie, której przysługuje 14, byłoby wprowadzeniem w błąd.
 */
export function mailZgloszenieOdebrane(dane: { kategoria: string }): TrescMaila {
  const { kategoria } = dane;

  return {
    temat: `${APLIKACJA.nazwa} — potwierdzenie przyjęcia zgłoszenia`,
    html: szablonMaila({
      naglowek: "Mamy Twoje zgłoszenie",
      tresc: [
        akapit("Cześć!"),
        akapit(
          "Dziękujemy — zgłoszenie do nas dotarło i trafiło do obsługi. Nie musisz wysyłać go ponownie."
        ),
        podsumowanie([
          ["Kategoria", kategoria],
          ["Przyjęto", dzien(new Date())],
        ]),
        akapit(
          `Odpowiemy na adres, z którego przyszło zgłoszenie, najpóźniej w ciągu <strong>14 dni</strong>. Jeśli sprawa okaże się pilniejsza albo będziemy potrzebowali szczegółów, odezwiemy się wcześniej.`
        ),
        drobnymDrukiem(
          `Termin wynika z Regulaminu § 7 ust. 9. Możesz odpowiedzieć wprost na tę wiadomość albo napisać na ${FIRMA.email}.`
        ),
      ].join("\n"),
    }),
    text: `Cześć!

Dziękujemy — zgłoszenie do nas dotarło i trafiło do obsługi. Nie musisz wysyłać go ponownie.

Kategoria: ${kategoria}
Przyjęto: ${dzien(new Date())}

Odpowiemy na adres, z którego przyszło zgłoszenie, najpóźniej w ciągu 14 dni. Jeśli sprawa okaże się pilniejsza albo będziemy potrzebowali szczegółów, odezwiemy się wcześniej.

Termin wynika z Regulaminu § 7 ust. 9. Możesz odpowiedzieć wprost na tę wiadomość albo napisać na ${FIRMA.email}.

${POZDROWIENIA_TEXT}`,
  };
}

/**
 * 7. POTWIERDZENIE USUNIĘCIA KONTA
 *
 * Regulamin § 4 ust. 14 (wypowiedzenie Umowy o Konto ze skutkiem
 * natychmiastowym) i § 4 ust. 17 (usunięcie jest NIEODWRACALNE, bez kopii
 * archiwalnych). Mail jest jedynym śladem, jaki po tej operacji zostaje
 * użytkownikowi — konta już nie ma, więc nie ma gdzie tego sprawdzić.
 *
 * WYSYŁANY NA ADRES ZAPAMIĘTANY PRZED KASOWANIEM. Po `usun_moje_konto` wiersz
 * w `profil` nie istnieje i nie ma już czego odczytać.
 */
export function mailKontoUsuniete(): TrescMaila {
  const oDanychKsiegowych =
    "Zachowujemy wyłącznie dane, których dalsze przechowywanie nakazują przepisy — " +
    "przede wszystkim dokumentację księgową zrealizowanych płatności — w zakresie " +
    "i przez okres opisany w Polityce prywatności.";

  return {
    temat: `${APLIKACJA.nazwa} — Twoje konto zostało usunięte`,
    html: szablonMaila({
      naglowek: "Konto zostało usunięte",
      tresc: [
        akapit("Cześć!"),
        akapit(
          `Potwierdzamy usunięcie Twojego konta w ${APLIKACJA.nazwa} w dniu <strong>${dzien(new Date())}</strong>. Umowa o Konto została tym samym rozwiązana.`
        ),
        uwaga(
          "Zapisane CV, historia dopasowań i zdjęcia zostały trwale usunięte. Nie tworzymy kopii archiwalnych, więc nie da się ich odtworzyć — również na Twoją prośbę."
        ),
        akapit(
          `Jeśli usunięcie nastąpiło przez pomyłkę, możesz w każdej chwili założyć nowe konto na ${link(APLIKACJA.domena, APLIKACJA.adresWww)} — będzie jednak puste.`
        ),
        drobnymDrukiem(
          `${oDanychKsiegowych} Podstawa: Regulamin § 4 ust. 14 i 17. Jeśli to nie Ty usunąłeś/usunęłaś konto, napisz natychmiast na ${FIRMA.email}.`
        ),
      ].join("\n"),
    }),
    text: `Cześć!

Potwierdzamy usunięcie Twojego konta w ${APLIKACJA.nazwa} w dniu ${dzien(new Date())}. Umowa o Konto została tym samym rozwiązana.

Zapisane CV, historia dopasowań i zdjęcia zostały trwale usunięte. Nie tworzymy kopii archiwalnych, więc nie da się ich odtworzyć — również na Twoją prośbę.

Jeśli usunięcie nastąpiło przez pomyłkę, możesz w każdej chwili założyć nowe konto na ${APLIKACJA.adresWww} — będzie jednak puste.

${oDanychKsiegowych}

Podstawa: Regulamin § 4 ust. 14 i 17. Jeśli to nie Ty usunąłeś/usunęłaś konto, napisz natychmiast na ${FIRMA.email}.

${POZDROWIENIA_TEXT}`,
  };
}
