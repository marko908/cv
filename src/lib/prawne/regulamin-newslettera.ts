/**
 * REGULAMIN DOSTARCZANIA NEWSLETTERA — treść publikowana pod
 * /regulamin-newslettera.
 *
 * Źródło: wzór „Regulamin dostarczania newslettera" z pakietu Creativa Legal.
 * Dane spółki kapitałowej zastąpione danymi JDG (Administrator to przedsiębiorca
 * wpisany do CEIDG — nie ma KRS ani kapitału zakładowego).
 *
 * ⚠️ TEN DOKUMENT NIE JEST OBECNIE PUBLIKOWANY. Newslettera nie ma (decyzja
 * Marka 2026-08-04: „na razie nie potrzebuję, kiedyś to dodamy"), a regulamin
 * bez działającego formularza opisywałby usługę, której nie ma — jego § 5
 * mówi o formularzu zapisu, potwierdzeniu e-mail i linku rezygnacji.
 * Trasa `/regulamin-newslettera` została z tego powodu usunięta, a odnośnik
 * zniknął ze stopki. Treść zostaje gotowa do użycia.
 *
 * PRZYWRÓCENIE (gdy powstanie formularz zapisu) — cztery kroki:
 *   1. odtwórz `src/app/(prawne)/regulamin-newslettera/page.tsx`
 *      (wzór: `regulamin/page.tsx`, podmień import i metadata),
 *   2. dodaj wpis do `ODNOSNIKI` w `src/components/stopka.tsx`,
 *   3. przywróć moduł „Umowa o dostarczanie Newslettera" w polityce
 *      prywatności (cel przetwarzania) i dopisz Newsletter przy Resend
 *      w tabeli odbiorców,
 *   4. wykonaj sekcję „Newsletter" w `dokumenty-prawne/WDROZENIE.md`
 *      (checkbox zgody, link rezygnacji w każdej wysyłce, PDF w potwierdzeniu).
 *
 * Składnia — patrz `regulamin.ts`.
 */

import {
  ADRES,
  APLIKACJA,
  DATA_OBOWIAZYWANIA,
  FIRMA,
  OZNACZENIE_PRZEDSIEBIORCY,
  SCIEZKI,
} from "./dane";

export const REGULAMIN_NEWSLETTERA = `
# Regulamin dostarczania newslettera

## § 1. Postanowienia ogólne

1. Niniejszy regulamin (dalej: „Regulamin") określa zasady i warunki dostarczania Newslettera aplikacji „${APLIKACJA.nazwa}", działającej pod adresem internetowym ${APLIKACJA.adresWww} (dalej: „Aplikacja").
2. Regulamin jest regulaminem, o którym mowa w art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną (dalej: „Ustawa o świadczeniu usług drogą elektroniczną").
3. Dostawcą Newslettera jest ${OZNACZENIE_PRZEDSIEBIORCY} (dalej: „Dostawca").
4. Kontakt z Dostawcą jest możliwy za pomocą:
   1) poczty elektronicznej – pod adresem: ${FIRMA.email},
   2) poczty tradycyjnej – pod adresem: ${ADRES}.
5. Przed rozpoczęciem subskrypcji Newslettera Subskrybent zobowiązany jest zapoznać się z Regulaminem oraz [Polityką prywatności](${SCIEZKI.politykaPrywatnosci}).
6. W sprawach nieuregulowanych w Regulaminie stosuje się postanowienia [Regulaminu aplikacji ${APLIKACJA.nazwa}](${SCIEZKI.regulamin}) (dalej: „Regulamin Aplikacji").

## § 2. Definicje

1. Użyte w Regulaminie wyrazy pisane wielką literą mają następujące znaczenie:
   1) **Aplikacja** – termin zdefiniowany w § 1 ust. 1 Regulaminu,
   2) **Dostawca** – termin zdefiniowany w § 1 ust. 3 Regulaminu,
   3) **Konsument** – osoba fizyczna dokonująca z Dostawcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową,
   4) **Newsletter** – treść cyfrowa w rozumieniu przepisów Ustawy o prawach konsumenta, obejmująca informacje handlowe dotyczące bieżącej działalności Dostawcy, w tym informacje o nowościach, aktualizacjach i promocjach dostępnych w Aplikacji, a także materiały edukacyjne dotyczące przygotowywania dokumentów aplikacyjnych i procesu rekrutacji,
   5) **Niezgodność** – niezgodność Newslettera z Umową o dostarczanie Newslettera (kryteria oceny zgodności określa art. 43k ust. 1–2 Ustawy o prawach konsumenta),
   6) **Polityka prywatności** – dokument zawierający informacje o przetwarzaniu danych osobowych Subskrybentów przez Dostawcę, dostępny pod adresem: [${APLIKACJA.domena}${SCIEZKI.politykaPrywatnosci}](${SCIEZKI.politykaPrywatnosci}),
   7) **Przedsiębiorca** – osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, której przepisy szczególne przyznają zdolność prawną, prowadząca we własnym imieniu działalność gospodarczą lub zawodową,
   8) **Przedsiębiorca na prawach Konsumenta** – osoba fizyczna prowadząca we własnym imieniu działalność gospodarczą lub zawodową, która zawarła z Dostawcą Umowę bezpośrednio związaną z jej działalnością gospodarczą, nieposiadającą jednak dla tej osoby charakteru zawodowego, wynikającego w szczególności z przedmiotu wykonywanej przez nią działalności gospodarczej,
   9) **Regulamin** – termin zdefiniowany w § 1 ust. 1 Regulaminu,
   10) **Regulamin Aplikacji** – termin zdefiniowany w § 1 ust. 6 Regulaminu,
   11) **Subskrybent** – osoba będąca Konsumentem, Przedsiębiorcą albo Przedsiębiorcą na prawach Konsumenta, która zawarła z Dostawcą Umowę o dostarczanie Newslettera lub podjęła działania zmierzające do jej zawarcia,
   12) **Umowa o dostarczanie Newslettera** – umowa o dostarczanie treści cyfrowej w rozumieniu przepisów Ustawy o prawach konsumenta, na podstawie której Dostawca zobowiązuje się nieodpłatnie dostarczać Subskrybentowi Newsletter przez czas nieoznaczony, a Subskrybent zobowiązuje się dostarczyć Dostawcy dane osobowe,
   13) **Ustawa o prawach konsumenta** – ustawa z dnia 30 maja 2014 r. o prawach konsumenta,
   14) **Ustawa o świadczeniu usług drogą elektroniczną** – termin zdefiniowany w § 1 ust. 2 Regulaminu.

## § 3. Wymagania techniczne

1. W celu otrzymywania Newslettera niezbędne jest łącznie:
   1) połączenie z siecią Internet,
   2) posiadanie urządzenia pozwalającego na korzystanie z zasobów sieci Internet,
   3) korzystanie z przeglądarki internetowej umożliwiającej wyświetlanie dokumentów hipertekstowych, obsługującej język JavaScript oraz akceptującej pliki cookies,
   4) posiadanie aktywnego konta poczty elektronicznej.
2. W ramach Aplikacji zabronione jest korzystanie przez Subskrybentów z wirusów, botów, robaków bądź innych kodów komputerowych, plików lub programów (w szczególności automatyzujących procesy skryptów i aplikacji bądź innych kodów, plików lub narzędzi).
3. Dostawca informuje, że wykorzystuje kryptograficzną ochronę transferu elektronicznego przez zastosowanie właściwych środków logicznych, organizacyjnych i technicznych, w szczególności w celu uniemożliwienia dostępu osobom trzecim do danych, w tym przez szyfrowanie połączenia protokołem TLS oraz stosowanie haseł dostępu.
4. Dostawca informuje, że pomimo stosowania zabezpieczeń, o których mowa w ust. 3 powyżej, korzystanie z sieci Internet oraz z usług świadczonych drogą elektroniczną może wiązać się z ryzykiem przedostania się do systemu teleinformatycznego oraz urządzenia Subskrybenta szkodliwego oprogramowania lub uzyskania dostępu do danych znajdujących się na tym urządzeniu przez osoby trzecie. W celu zminimalizowania tego ryzyka Dostawca zaleca stosowanie aktualnego oprogramowania antywirusowego oraz środków chroniących identyfikację w sieci Internet.

## § 4. Zasady ogólne

1. Subskrybent jest zobowiązany do korzystania z Newslettera w sposób zgodny z przepisami prawa powszechnie obowiązującego, postanowieniami Regulaminu, a także z dobrymi obyczajami.
2. Dostarczanie przez Subskrybenta treści o charakterze bezprawnym jest zabronione.

## § 5. Umowa o dostarczanie Newslettera

1. W celu zawarcia Umowy o dostarczanie Newslettera Subskrybent powinien podać Dostawcy adres poczty elektronicznej oraz złożyć oświadczenie o wyrażeniu zgody na otrzymywanie Newslettera, zapoznaniu się z Regulaminem i Polityką prywatności oraz akceptacji ich postanowień.
2. Dokonanie czynności wskazanych w ust. 1 powyżej może nastąpić w jakikolwiek sposób, w szczególności poprzez wypełnienie przez Subskrybenta elektronicznego formularza udostępnionego w Aplikacji.
3. Umowa o dostarczanie Newslettera zawierana jest na czas nieoznaczony i jest nieodpłatna.
4. Niezwłocznie po zawarciu Umowy o dostarczanie Newslettera Dostawca przesyła Subskrybentowi, na podany przez niego adres poczty elektronicznej, potwierdzenie zapisu wraz z treścią Regulaminu w formacie PDF.
5. Dostawca informuje, a Subskrybent przyjmuje do wiadomości, że:
   1) dostarczony Newsletter nie podlega późniejszej aktualizacji,
   2) częstotliwość oraz terminy dostarczania Newsletterów nie są z góry określone i zależą od aktualnej sytuacji Dostawcy.
6. Dostarczanie Newslettera następuje za pomocą poczty elektronicznej, pod adres poczty elektronicznej podany przez Subskrybenta.
7. Subskrybent może w każdym czasie i bez podania przyczyny wypowiedzieć Umowę o dostarczanie Newslettera ze skutkiem natychmiastowym. Ponadto, na podstawie art. 27 i n. Ustawy o prawach konsumenta, Subskrybent będący Konsumentem albo Przedsiębiorcą na prawach Konsumenta może odstąpić od Umowy o dostarczanie Newslettera bez podania przyczyny, w terminie 14 (czternastu) dni od dnia jej zawarcia.
8. Odstąpienie od Umowy o dostarczanie Newslettera albo jej wypowiedzenie, niezależnie od podstawy dokonania tej czynności, wymaga złożenia Dostawcy przez Subskrybenta stosownego oświadczenia. Oświadczenie może zostać złożone poprzez:
   1) kliknięcie przez Subskrybenta w link umożliwiający rezygnację z otrzymywania Newslettera, przesyłany wraz z każdym Newsletterem,
   2) wysłanie Dostawcy oświadczenia o odstąpieniu od Umowy o dostarczanie Newslettera albo o jej wypowiedzeniu za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 4 pkt 1 Regulaminu. Oświadczenie może zostać złożone także na formularzu stanowiącym załącznik nr 2 do Ustawy o prawach konsumenta.
9. Dostawca wstrzymuje dostarczanie Newslettera Subskrybentowi niezwłocznie po dokonaniu przez Subskrybenta jednej z czynności wskazanych w ust. 8 powyżej.
10. Rezygnacja z Newslettera nie powoduje usunięcia konta Subskrybenta w Aplikacji ani nie wpływa na możliwość korzystania z Aplikacji.

## § 6. Reklamacje dotyczące Newslettera

1. Postanowienia niniejszego paragrafu dotyczą wyłącznie Subskrybentów będących Konsumentami lub Przedsiębiorcami na prawach Konsumenta.
2. Dostarczany Subskrybentowi przez Dostawcę Newsletter musi być zgodny z Umową o dostarczanie Newslettera w chwili jego dostarczenia.
3. Dostawca ponosi odpowiedzialność za Niezgodność istniejącą w chwili dostarczenia Newslettera i ujawnioną w ciągu 2 (dwóch) lat od tej chwili.
4. W przypadku ujawnienia Niezgodności Subskrybent może złożyć reklamację zawierającą żądanie doprowadzenia Newslettera do zgodności z Umową o dostarczanie Newslettera.
5. Reklamacja składana jest za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 4 pkt 1 Regulaminu.
6. Reklamacja powinna zawierać:
   1) imię i nazwisko Subskrybenta,
   2) adres poczty elektronicznej,
   3) opis ujawnionej Niezgodności,
   4) żądanie doprowadzenia Newslettera do zgodności z Umową o dostarczanie Newslettera.
7. Dostawca może odmówić doprowadzenia Newslettera do zgodności z Umową o dostarczanie Newslettera, jeżeli jest to niemożliwe albo wymagałoby poniesienia przez Dostawcę nadmiernych kosztów.
8. Po rozpatrzeniu reklamacji Dostawca udziela Subskrybentowi odpowiedzi na reklamację, w której:
   1) uznaje reklamację oraz wskazuje planowany termin doprowadzenia Newslettera do zgodności z Umową o dostarczanie Newslettera,
   2) odmawia doprowadzenia Newslettera do zgodności z Umową o dostarczanie Newslettera z przyczyn wskazanych w ust. 7 powyżej, albo
   3) odrzuca reklamację z powodu jej bezzasadności.
9. Dostawca udziela odpowiedzi na reklamację za pomocą poczty elektronicznej w terminie 14 (czternastu) dni od dnia jej otrzymania.
10. W przypadku uznania reklamacji Dostawca na własny koszt doprowadza Newsletter do zgodności z Umową o dostarczanie Newslettera w rozsądnym czasie od chwili otrzymania reklamacji i bez nadmiernych niedogodności dla Subskrybenta, uwzględniając charakter Newslettera oraz cel, w jakim jest on wykorzystywany. Planowany termin Dostawca wskazuje w odpowiedzi na reklamację.
11. W przypadku ujawnienia Niezgodności Subskrybent może złożyć Dostawcy oświadczenie o odstąpieniu od Umowy o dostarczanie Newslettera, gdy:
   1) doprowadzenie Newslettera do zgodności z Umową o dostarczanie Newslettera jest niemożliwe albo wymaga nadmiernych kosztów,
   2) Dostawca nie doprowadził Newslettera do zgodności z Umową o dostarczanie Newslettera zgodnie z ust. 10 powyżej,
   3) Niezgodność występuje nadal, mimo że Dostawca próbował doprowadzić Newsletter do zgodności z Umową o dostarczanie Newslettera,
   4) Niezgodność jest na tyle istotna, że uzasadnia odstąpienie od Umowy o dostarczanie Newslettera bez uprzedniego żądania doprowadzenia Newslettera do zgodności z tą umową,
   5) z oświadczenia Dostawcy lub okoliczności wyraźnie wynika, że Dostawca nie doprowadzi Newslettera do zgodności z Umową o dostarczanie Newslettera w rozsądnym czasie lub bez nadmiernych niedogodności dla Subskrybenta.
12. Oświadczenie o odstąpieniu od Umowy o dostarczanie Newslettera może zostać złożone za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 4 pkt 1 Regulaminu, i powinno zawierać:
   1) imię i nazwisko Subskrybenta,
   2) adres poczty elektronicznej,
   3) datę dostarczenia Newslettera,
   4) opis ujawnionej Niezgodności,
   5) wskazanie przyczyny złożenia oświadczenia, wybranej spośród przyczyn wskazanych w ust. 11 powyżej,
   6) oświadczenie o odstąpieniu od Umowy o dostarczanie Newslettera.
13. Subskrybent nie może odstąpić od Umowy o dostarczanie Newslettera, jeżeli Niezgodność jest nieistotna.
14. W przypadku odstąpienia przez Subskrybenta od Umowy o dostarczanie Newslettera Dostawca wstrzymuje dostarczanie Newslettera niezwłocznie po otrzymaniu oświadczenia o odstąpieniu.

## § 7. Przetwarzanie danych osobowych

1. Informacje o przetwarzaniu danych osobowych przez Dostawcę znajdują się w [Polityce prywatności](${SCIEZKI.politykaPrywatnosci}).

## § 8. Pozasądowe rozwiązywanie sporów

1. Postanowienia niniejszego paragrafu dotyczą wyłącznie Subskrybentów będących Konsumentami oraz Przedsiębiorcami na prawach Konsumenta.
2. Subskrybent ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń.
3. Szczegółowe informacje dotyczące możliwości skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń oraz zasady dostępu do tych procedur dostępne są w siedzibach oraz na stronach internetowych:
   1) powiatowych (miejskich) rzeczników konsumentów oraz organizacji społecznych, do których zadań statutowych należy ochrona konsumentów,
   2) Wojewódzkich Inspektoratów Inspekcji Handlowej,
   3) Urzędu Ochrony Konkurencji i Konsumentów.

## § 9. Zmiana Regulaminu

1. Dostawca może dokonać zmiany Regulaminu w przypadku:
   1) zmiany danych Dostawcy,
   2) zmiany przedmiotu działalności Dostawcy,
   3) rozpoczęcia dostarczania przez Dostawcę nowych usług, modyfikacji usług dotychczas dostarczanych lub zaprzestania ich dostarczania,
   4) dokonania technicznej modyfikacji Newslettera wymagającej dostosowania do niej postanowień Regulaminu,
   5) prawnego obowiązku dokonania zmian, w tym obowiązku dostosowania Regulaminu do aktualnego stanu prawnego.
2. O zmianie Regulaminu Subskrybenci zostaną poinformowani poprzez opublikowanie jego zmienionej wersji w Aplikacji. Równocześnie zmieniona wersja Regulaminu zostanie przesłana Subskrybentom pocztą elektroniczną.
3. Subskrybent, który nie zgadza się na zmianę Regulaminu, może wypowiedzieć Umowę o dostarczanie Newslettera ze skutkiem natychmiastowym w terminie 7 (siedmiu) dni od dnia otrzymania zmienionej wersji Regulaminu za pomocą poczty elektronicznej. Brak wypowiedzenia uznaje się za zgodę na zmianę Regulaminu.
4. Wypowiedzenie Umowy o dostarczanie Newslettera następuje poprzez złożenie Dostawcy oświadczenia o wypowiedzeniu, które może zostać wysłane za pomocą poczty elektronicznej pod adres wskazany w § 1 ust. 4 pkt 1 Regulaminu, albo poprzez kliknięcie w link rezygnacji przesyłany wraz z każdym Newsletterem.
5. Niezwłocznie po otrzymaniu oświadczenia, o którym mowa w ust. 4 powyżej, Dostawca wstrzymuje dostarczanie Newslettera.

## § 10. Postanowienia końcowe

1. Prawem właściwym dla Regulaminu oraz Umowy o dostarczanie Newslettera jest prawo polskie. Wybór prawa polskiego dokonany w zdaniu poprzedzającym nie pozbawia jednak Konsumenta ochrony wynikającej z przepisów prawa obcego, których nie można wyłączyć w drodze umowy i które znajdowałyby zastosowanie w razie braku wyboru prawa polskiego.
2. Aktualna wersja Regulaminu obowiązuje od dnia ${DATA_OBOWIAZYWANIA} r.
`.trim();
