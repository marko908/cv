/**
 * Lista serwisów, z których przyjmujemy LINK do ogłoszenia.
 *
 * BEZ ZALEŻNOŚCI OD NODE — ten moduł jest importowany także przez komponent
 * kliencki (`tailor-flow.tsx`), żeby walidacja działała od razu w formularzu.
 * Dlatego kontrole sieciowe (DNS, SSRF) siedzą osobno,
 * w `lib/bezpieczenstwo/adresy.ts`, i biegną wyłącznie na serwerze.
 *
 * PO CO TO JEST (decyzja Marka 2026-08-10): ograniczyć przypadkowe wklejenie
 * adresu, który nie ma nic wspólnego z ofertą — link do artykułu, do strony
 * głównej firmy, do dokumentu w chmurze. Model dostawał wtedy tekst bez
 * wymagań i produkował dopasowanie do niczego.
 *
 * TO NIE JEST ZABEZPIECZENIE. Lista domen niczego nie chroni (host da się
 * podrobić tylko do granicy, jaką stawia DNS) — od bezpieczeństwa jest
 * `sprawdzAdresPubliczny`. To filtr JAKOŚCI wejścia.
 *
 * ODRZUCENIE NIE KOŃCZY DROGI. Trasa `/api/dopasuj` zwraca wtedy 422, a
 * `tailor-flow` prosi o wklejenie treści ogłoszenia ręcznie — dokładnie tak
 * samo, jak przy portalu renderowanym w przeglądarce, z którego i tak nie da
 * się nic pobrać. Dzięki temu lista może być niepełna bez blokowania nikomu
 * pracy.
 *
 * UTRZYMANIE: to jedyne miejsce, w którym dopisuje się serwis. Dopasowanie
 * obejmuje domenę i wszystkie jej poddomeny (`jobs.lever.co` pasuje do
 * `lever.co`), ale NIE domeny, które tylko kończą się tym samym ciągiem
 * (`nie-pracuj.pl` nie pasuje do `pracuj.pl`).
 */

/** Polska — tu trafia większość ruchu. */
const POLSKIE = [
  "pracuj.pl",
  "praca.pl",
  "olx.pl",
  "nofluffjobs.com",
  "justjoin.it",
  "theprotocol.it",
  "rocketjobs.pl",
  "bulldogjob.pl",
  "solid.jobs",
  "infopraca.pl",
  "aplikuj.pl",
  "gowork.pl",
  "jobs.pl",
  "goldenline.pl",
  "gratka.pl",
  "indeed.pl",
  "stepstone.pl",
  "erecruiter.pl",
  "traffit.com",
];

/** Zagraniczne portale ogłoszeniowe. */
const ZAGRANICZNE = [
  "linkedin.com",
  "indeed.com",
  "glassdoor.com",
  "monster.com",
  "ziprecruiter.com",
  "welcometothejungle.com",
  "otta.com",
  "wellfound.com",
  "dice.com",
  "stepstone.de",
  "xing.com",
  "totaljobs.com",
  "reed.co.uk",
  "seek.com.au",
  "jobs.ch",
  "talent.com",
  "careerjet.com",
  "jooble.org",
  "efinancialcareers.com",
  "jobteaser.com",
  "eurotechjobs.com",
];

/** Praca zdalna. */
const ZDALNE = [
  "remoteok.com",
  "weworkremotely.com",
  "remote.co",
  "himalayas.app",
  "builtin.com",
  "workatastartup.com",
];

/**
 * Systemy rekrutacyjne (ATS), na których firmy hostują własne strony karier.
 *
 * Ta grupa jest równie ważna, co portale: coraz więcej ofert nie ma wpisu na
 * żadnej tablicy ogłoszeń, tylko link prosto do `jobs.lever.co/firma/…` albo
 * `firma.myworkdayjobs.com`. Bez tych domen odsyłalibyśmy do ręcznego wklejania
 * ludzi aplikujących bezpośrednio.
 */
const SYSTEMY_REKRUTACYJNE = [
  "greenhouse.io",
  "lever.co",
  "workable.com",
  "smartrecruiters.com",
  "ashbyhq.com",
  "myworkdayjobs.com",
  "recruitee.com",
  "teamtailor.com",
  "personio.com",
  "personio.de",
  "breezy.hr",
  "jobvite.com",
  "icims.com",
  "bamboohr.com",
  "applytojob.com",
  "join.com",
  "factorialhr.com",
  "pinpointhq.com",
  "taleo.net",
];

export const DOZWOLONE_SERWISY = [
  ...POLSKIE,
  ...ZAGRANICZNE,
  ...ZDALNE,
  ...SYSTEMY_REKRUTACYJNE,
];

/** Adres z uzupełnionym schematem — `pracuj.pl/oferta` też ma zadziałać. */
function zeSchematem(url: string): string {
  const t = url.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** Czy tekst wygląda na sensowny adres http(s). */
export function czyPoprawnyLink(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  try {
    const u = new URL(zeSchematem(t));
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Czy adres wskazuje na znany serwis z ogłoszeniami. */
export function czySerwisOfert(url: string): boolean {
  if (!czyPoprawnyLink(url)) return false;
  let host: string;
  try {
    host = new URL(zeSchematem(url)).hostname.toLowerCase();
  } catch {
    return false;
  }
  // `www.` zdejmujemy, żeby nie mnożyć wpisów na liście.
  const czysty = host.startsWith("www.") ? host.slice(4) : host;
  return DOZWOLONE_SERWISY.some(
    (d) => czysty === d || czysty.endsWith(`.${d}`)
  );
}

/** Komunikat pokazywany, gdy adres nie jest z listy. */
export const KOMUNIKAT_NIEZNANY_SERWIS =
  "Ten adres nie wygląda na ogłoszenie o pracę ze znanego nam serwisu. " +
  "Wklej treść ogłoszenia poniżej — zadziała tak samo dobrze.";
