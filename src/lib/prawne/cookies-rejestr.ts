/**
 * REJESTR PLIKÓW COOKIES I NARZĘDZI — JEDNO ŹRÓDŁO PRAWDY.
 *
 * Ten sam rejestr zasila DWA miejsca:
 *   1) tabelę w sekcji „Pliki cookies" Polityki prywatności
 *      (`polityka-prywatnosci.ts` wstawia `TABELA_COOKIES_MD`),
 *   2) panel zgód w banerze cookies (`components/cookies/panel-cookies.tsx`).
 *
 * DLACZEGO JEDNO ŹRÓDŁO, A NIE DWA ZSYNCHRONIZOWANE MIEJSCA: rozjazd między
 * tym, co baner deklaruje, a tym, co opisuje polityka, to pierwsza rzecz, którą
 * przy kontroli znajduje organ nadzorczy. Specyfikacja
 * (`dokumenty-prawne/specyfikacja-baner-cookies.md`) nakazywała zmieniać oba
 * miejsca w jednym commicie — tutaj nie ma czego rozjeżdżać, bo miejsce jest
 * jedno. Tabela w polityce jest GENEROWANA z tej listy.
 *
 * Dodanie narzędzia = wpis tutaj + PODNIESIENIE `WERSJA_ZGODY`
 * (`lib/cookies/zgody.ts`). Bez podniesienia wersji nowe narzędzie ładowałoby
 * się u osób, które zgodziły się na poprzedni, węższy zestaw — czyli bez zgody.
 *
 * ⚠️ TAGI ŻYJĄ POZA REPO — TO NAJWIĘKSZE RYZYKO TEJ KONSTRUKCJI.
 * Od chwili wpięcia narzędzi w Google Tag Manager (decyzja Marka 2026-08-04)
 * dodanie tagu przestało być commitem. Ktoś dodaje tag w panelu GTM w dwie
 * minuty i w tej samej sekundzie: (a) Polityka prywatności staje się
 * nieprawdziwa, bo opisuje węższy zestaw narzędzi, (b) nowe pliki lądują
 * u osób, które zgodziły się na poprzedni zestaw, (c) `WERSJA_ZGODY` nie
 * została podniesiona, więc nikt nie zostanie zapytany ponownie.
 *
 * Technicznie nie da się tego wymusić z kodu. Obowiązuje więc zasada, w tej
 * kolejności: **wpis w tym pliku → podniesienie `WERSJA_ZGODY` → dopiero
 * publikacja wersji kontenera w GTM.** Uprawnienie do publikowania kontenera
 * powinna mieć jedna osoba, z włączonym powiadomieniem o publikacji.
 */

export type KategoriaCookies = "niezbędne" | "analityczne" | "marketingowe";

export type NarzedzieCookies = {
  /** Nazwa widoczna w tabeli polityki i w panelu zgód. */
  narzedzie: string;
  dostawca: string;
  kategoria: KategoriaCookies;
  /** Do czego służy + zakres pobieranych danych (wymóg informacyjny). */
  funkcje: string;
  okres: string;
  /**
   * Nazwy plików, które narzędzie zakłada w naszej domenie — kasowane przy
   * wycofaniu zgody. Gwiazdka na końcu oznacza prefiks (`_ga_*`).
   * Puste dla narzędzi, które plików nie zakładają (pamięć lokalna, Vercel).
   */
  pliki: readonly string[];
  /**
   * Skąd narzędzie startuje:
   *   "gtm" — tag w kontenerze Google Tag Manager. Kodu w repo NIE MA;
   *           wystrzeleniem rządzi Consent Mode + „Dodatkowe sprawdzenia zgody"
   *           ustawione na tagu w panelu GTM.
   *   "kod" — skrypt wstawiany przez `components/cookies/skrypty-narzedzi.tsx`.
   *   null  — nic się nie ładuje (pliki własne Aplikacji, pamięć lokalna, Stripe
   *           zakłada swoje przy przekierowaniu na stronę płatności).
   *
   * Pole jest dokumentacyjne — nie steruje ładowaniem. Istnieje po to, żeby przy
   * audycie było widać, czego szukać w repo, a czego w panelu GTM.
   */
  przez: "gtm" | "kod" | null;
};

export const NARZEDZIA_COOKIES: readonly NarzedzieCookies[] = [
  {
    narzedzie: "Cookies uwierzytelniające (sb-…-auth-token)",
    dostawca: "Administrator / Supabase",
    kategoria: "niezbędne",
    funkcje:
      "Utrzymanie sesji zalogowania. Bez nich niemożliwe jest korzystanie z Konta. Zakres: token sesji, identyfikator użytkownika.",
    okres: "do wylogowania, nie dłużej niż 7 dni",
    pliki: [],
    przez: null,
  },
  {
    narzedzie: "Zapis zgód cookies",
    dostawca: "Administrator",
    kategoria: "niezbędne",
    funkcje:
      "Zapamiętanie Twojego wyboru w panelu zgód, żeby nie pytać ponownie przy każdej wizycie. Zakres: identyfikator wersji zgody, wybrane kategorie, data wyrażenia.",
    okres: "12 miesięcy",
    pliki: [],
    przez: null,
  },
  {
    narzedzie: "Dane kreatora CV (pamięć lokalna przeglądarki)",
    dostawca: "Administrator",
    kategoria: "niezbędne",
    funkcje:
      "Przechowanie CV tworzonego bez zakładania Konta, w pamięci Twojego urządzenia. Dane te nie są wysyłane do Administratora do czasu utworzenia Konta.",
    okres: "do wyczyszczenia danych przeglądarki",
    pliki: [],
    przez: null,
  },
  {
    narzedzie: "Cookies płatności (__stripe_mid, __stripe_sid)",
    dostawca: "Stripe",
    kategoria: "niezbędne",
    funkcje:
      "Zabezpieczenie procesu płatności przed nadużyciami i powiązanie sesji płatniczej. Zakres: identyfikator urządzenia i sesji płatniczej.",
    okres: "sesyjne oraz do 12 miesięcy",
    pliki: [],
    przez: null,
  },
  {
    narzedzie: "Vercel Analytics / Speed Insights",
    dostawca: "Vercel",
    kategoria: "analityczne",
    funkcje:
      "Pomiar liczby odwiedzin, źródeł ruchu i wydajności ładowania podstron. Narzędzie działa bez identyfikowania pojedynczych osób. Zakres: adres podstrony, źródło wejścia, rodzaj urządzenia, parametry wydajności.",
    okres: "do 24 godzin (identyfikator wyliczany dziennie, nietrwały)",
    pliki: [],
    przez: "kod",
  },
  {
    narzedzie: "Google Analytics 4",
    dostawca: "Google",
    kategoria: "analityczne",
    funkcje:
      "Zbieranie danych statystycznych o sposobie korzystania z Aplikacji: liczba i czas trwania odwiedzin, źródło wejścia, przybliżona lokalizacja, odwiedzone podstrony, wykonane działania.",
    okres: "do 14 miesięcy lub do momentu ich usunięcia",
    pliki: ["_ga", "_ga_*", "_gid", "_gat*"],
    przez: "gtm",
  },
  {
    narzedzie: "Microsoft Clarity",
    dostawca: "Microsoft",
    kategoria: "analityczne",
    funkcje:
      "Analiza zachowania na stronie (mapy kliknięć, nagrania sesji z ukrytą treścią pól tekstowych) w celu wykrywania błędów interfejsu. Zakres: zdarzenia interfejsu, rodzaj urządzenia i przeglądarki.",
    okres: "do 12 miesięcy lub do momentu ich usunięcia",
    pliki: ["_clck", "_clsk"],
    przez: "gtm",
  },
  {
    narzedzie: "Meta Pixel",
    dostawca: "Meta Platforms Ireland",
    kategoria: "marketingowe",
    funkcje:
      "Ustalenie, że odwiedziłeś Aplikację, skierowanie do Ciebie reklam wyświetlanych w serwisach Facebook i Instagram oraz mierzenie ich skuteczności.",
    okres: "do 3 miesięcy lub do momentu ich usunięcia",
    pliki: ["_fbp", "_fbc"],
    przez: "gtm",
  },
] as const;

/** Narzędzia danej kategorii — panel zgód rozwija je pod przełącznikiem. */
export function narzedziaKategorii(
  kategoria: KategoriaCookies,
): readonly NarzedzieCookies[] {
  return NARZEDZIA_COOKIES.filter((n) => n.kategoria === kategoria);
}

/** Wszystkie pliki zakładane przez narzędzia danej kategorii (do skasowania). */
export function plikiKategorii(kategoria: KategoriaCookies): readonly string[] {
  return narzedziaKategorii(kategoria).flatMap((n) => n.pliki);
}

const NAGLOWKI = [
  "Narzędzie",
  "Dostawca",
  "Kategoria",
  "Funkcje i zakres pobieranych danych",
  "Okres działania",
];

const wiersz = (komorki: readonly string[]) => `| ${komorki.join(" | ")} |`;

/**
 * Tabela narzędzi w składni dokumentów prawnych („| a | b |", pierwszy wiersz
 * z serii jest nagłówkiem — patrz `components/prawne/dokument-prawny.tsx`).
 */
export const TABELA_COOKIES_MD = [
  wiersz(NAGLOWKI),
  ...NARZEDZIA_COOKIES.map((n) =>
    wiersz([n.narzedzie, n.dostawca, n.kategoria, n.funkcje, n.okres]),
  ),
].join("\n");
