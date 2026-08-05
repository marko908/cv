/**
 * POLITYKA PRYWATNOŚCI APLIKACJI APLIKANDO — treść publikowana pod
 * /polityka-prywatnosci.
 *
 * Źródło: wzór „Polityka prywatności aplikacji SaaS" z pakietu Creativa Legal,
 * uzupełniony zgodnie z komentarzami pomocniczymi prawnika.
 *
 * USUNIĘTO WZGLĘDEM WZORU (bo nie odpowiadałoby rzeczywistości):
 *   - sekcję o Inspektorze Ochrony Danych (IOD nie został wyznaczony —
 *     komentarz nr 10: „IOD na niby to proszenie się o kłopot"),
 *   - moduł „Udostępnianie Opinii o usługach" (Aplikacja nie publikuje opinii),
 *   - dane spółki kapitałowej (KRS, kapitał zakładowy) — Administrator to JDG.
 *
 * ⚠️ SYNCHRONIZACJA Z NARZĘDZIAMI ANALITYCZNYMI
 * Tabela narzędzi w sekcji „Pliki cookies" NIE jest już wpisana w treść —
 * generuje ją `TABELA_COOKIES_MD` z `cookies-rejestr.ts`, z tej samej listy,
 * którą renderuje panel zgód w banerze. Rozjazd między polityką a banerem jest
 * więc niemożliwy z konstrukcji. Dodanie/usunięcie narzędzia = zmiana WYŁĄCZNIE
 * w rejestrze (+ podniesienie `WERSJA_ZGODY` w `lib/cookies/zgody.ts`).
 *
 * Narzędzia ładują się dopiero po zgodzie właściwej kategorii
 * (`components/cookies/skrypty-narzedzi.tsx`) i tylko wtedy, gdy w env jest ich
 * identyfikator. Sekcja „Odbiorcy danych osobowych" wymienia je niezależnie od
 * tego, czy identyfikator jest już ustawiony — jeżeli któregoś narzędzia
 * ostatecznie nie wdrożysz, usuń je z rejestru ORAZ z listy odbiorców.
 * Szczegóły: `dokumenty-prawne/WDROZENIE.md`.
 *
 * Składnia — patrz `regulamin.ts`. Dodatkowo tabele w składni „| a | b |".
 */

import { TABELA_COOKIES_MD } from "./cookies-rejestr";
import {
  ADRES,
  APLIKACJA,
  DATA_OBOWIAZYWANIA,
  FIRMA,
  OZNACZENIE_PRZEDSIEBIORCY,
  SCIEZKI,
} from "./dane";

export const POLITYKA_PRYWATNOSCI = `
# Polityka prywatności aplikacji ${APLIKACJA.nazwa}

Niniejsza Polityka prywatności (dalej: „Polityka") zawiera informacje na temat przetwarzania Twoich danych osobowych w związku z korzystaniem z aplikacji „${APLIKACJA.nazwa}", działającej pod adresem internetowym ${APLIKACJA.adresWww} (dalej: „Aplikacja").

Wszelkie terminy pisane wielką literą, które nie zostały zdefiniowane inaczej w Polityce, mają znaczenie nadane im w [Regulaminie](${SCIEZKI.regulamin}).

## Administrator danych osobowych

Administratorem Twoich danych osobowych jest ${OZNACZENIE_PRZEDSIEBIORCY} (dalej: „Administrator").

## Kontakt z Administratorem

We wszystkich sprawach związanych z przetwarzaniem danych osobowych możesz kontaktować się z Administratorem za pomocą:

1. poczty elektronicznej – pod adresem: ${FIRMA.email},
2. poczty tradycyjnej – pod adresem: ${ADRES}.

Administrator nie wyznaczył Inspektora Ochrony Danych. Wszystkie sprawy dotyczące danych osobowych obsługiwane są pod adresami wskazanymi powyżej.

## Środki ochrony danych osobowych

Administrator stosuje zabezpieczenia organizacyjne i techniczne, aby zapewnić ochronę Twoich danych osobowych, oraz gwarantuje, że przetwarza je zgodnie z przepisami Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (dalej: „RODO"), ustawy z dnia 10 maja 2018 r. o ochronie danych osobowych oraz innymi przepisami o ochronie danych osobowych.

W szczególności Administrator stosuje: szyfrowanie połączenia protokołem TLS, przechowywanie haseł wyłącznie w postaci skrótów kryptograficznych, izolację danych poszczególnych kont na poziomie bazy danych oraz przechowywanie zdjęć dołączanych do CV w prywatnej przestrzeni dyskowej dostępnej wyłącznie przez odnośniki generowane czasowo.

## Dane szczególnych kategorii

**Administrator nie prosi Cię o podanie danych szczególnych kategorii**, o których mowa w art. 9 ust. 1 RODO (m.in. danych o stanie zdrowia, orzeczeniu o niepełnosprawności, przynależności związkowej, poglądach politycznych, przekonaniach religijnych, pochodzeniu rasowym lub etnicznym, orientacji seksualnej) ani danych dotyczących wyroków skazujących i czynów zabronionych (art. 10 RODO). Formularze Aplikacji nie zawierają pól przeznaczonych na takie dane.

Jeżeli mimo to zamieścisz takie dane w treści swojego CV albo w treści ogłoszenia, które wklejasz do Aplikacji, Administrator przetwarza je wyłącznie na podstawie **Twojej wyraźnej zgody (art. 9 ust. 2 lit. a RODO)**, wyrażonej przez ich dobrowolne wprowadzenie do Aplikacji, i wyłącznie w celu wykonania usługi, której dotyczą. Zgodę możesz wycofać w każdej chwili, usuwając te dane z CV albo usuwając Konto. Zdjęcie dołączone do CV nie jest przetwarzane w celu identyfikacji ani weryfikacji tożsamości, w związku z czym nie stanowi danych biometrycznych w rozumieniu RODO.

Administrator zaleca niezamieszczanie w CV danych, które nie są niezbędne w procesie rekrutacyjnym.

## Informacje o przetwarzanych danych osobowych

Korzystanie z Aplikacji wymaga przetwarzania Twoich danych osobowych. Poniżej znajdziesz szczegółowe informacje o celach i podstawach prawnych przetwarzania, a także o okresie przetwarzania oraz obowiązku lub dobrowolności ich podania.

### 1. Zawarcie i wykonanie Umowy o Konto

**Przetwarzane dane osobowe:** adres poczty elektronicznej.

**Podstawa prawna:** art. 6 ust. 1 lit. b RODO (przetwarzanie jest niezbędne do wykonania Umowy o Konto zawartej z osobą, której dane dotyczą, lub podjęcia działań w celu jej zawarcia).

Podanie ww. danych osobowych jest warunkiem zawarcia i wykonania Umowy o Konto (ich podanie jest dobrowolne, lecz konsekwencją ich niepodania będzie niemożność utworzenia Konta). Administrator będzie przetwarzał ww. dane osobowe do czasu usunięcia Konta, a następnie do czasu przedawnienia roszczeń wynikających z Umowy o Konto.

### 2. Zawarcie i wykonanie Umowy korzystania z Aplikacji, w tym wykonanie Dopasowania

**Przetwarzane dane osobowe:** dane, które samodzielnie wprowadzasz do Aplikacji jako treść CV, w szczególności imię i nazwisko, adres poczty elektronicznej, numer telefonu, miejscowość zamieszkania, odnośniki do profili zawodowych, przebieg zatrudnienia (nazwy pracodawców, stanowiska, okresy, opisy obowiązków), opisy projektów, wykształcenie, umiejętności, znajomość języków oraz – opcjonalnie – zdjęcie; a także treść ogłoszenia o pracę, którą wprowadzasz w celu wykonania Dopasowania, oraz odpowiedzi udzielone w wywiadzie uzupełniającym.

**Podstawa prawna:** art. 6 ust. 1 lit. b RODO (przetwarzanie jest niezbędne do wykonania Umowy zawartej z osobą, której dane dotyczą, lub podjęcia działań w celu jej zawarcia).

Podanie ww. danych osobowych jest warunkiem wykonania Umowy (ich podanie jest dobrowolne, lecz konsekwencją ich niepodania będzie niemożność przygotowania dokumentu CV lub wykonania Dopasowania). Zakres podawanych danych określasz samodzielnie – Aplikacja nie wymaga wypełnienia wszystkich pól. Administrator będzie przetwarzał ww. dane osobowe do czasu ich usunięcia przez Ciebie z Aplikacji albo do czasu usunięcia Konta.

### 3. Realizacja płatności i rozliczenie Subskrypcji

**Przetwarzane dane osobowe:** adres poczty elektronicznej, identyfikator klienta i identyfikator subskrypcji nadane przez operatora płatności, status i okres opłaconej Subskrypcji, informacja o dokonanych zakupach jednorazowych, licznik wykonanych Dopasowań w danym miesiącu. **Administrator nie przetwarza i nie ma dostępu do danych Twojej karty płatniczej ani do danych logowania do bankowości** – dane te podajesz bezpośrednio operatorowi płatności, na jego stronie.

**Podstawa prawna:** art. 6 ust. 1 lit. b RODO (przetwarzanie jest niezbędne do wykonania Umowy zawartej z osobą, której dane dotyczą).

Podanie ww. danych jest warunkiem uzyskania dostępu do Usług Płatnych. Administrator będzie przetwarzał ww. dane osobowe przez czas trwania Umowy, a następnie do czasu przedawnienia roszczeń z niej wynikających.

### 4. Przeprowadzenie postępowania reklamacyjnego

**Przetwarzane dane osobowe:** imię i nazwisko, adres poczty elektronicznej, dane zawarte w treści reklamacji.

**Podstawa prawna:** art. 6 ust. 1 lit. c RODO (przetwarzanie jest niezbędne do wypełnienia obowiązku prawnego ciążącego na Administratorze, w tym przypadku obowiązków: udzielenia odpowiedzi na reklamację – art. 7a ustawy o prawach konsumenta; realizacji uprawnień wynikających z przepisów o odpowiedzialności Administratora w przypadku niezgodności usługi cyfrowej z dotyczącą jej umową).

Podanie ww. danych osobowych jest warunkiem otrzymania odpowiedzi na reklamację (ich podanie jest dobrowolne, lecz konsekwencją ich niepodania będzie niemożność jej rozpatrzenia). Administrator będzie przetwarzał ww. dane osobowe przez czas postępowania reklamacyjnego, a w wypadku realizacji uprawnień – do czasu ich przedawnienia.

### 5. Rozpatrywanie zgłoszeń treści niedozwolonych i odwołań od decyzji

**Przetwarzane dane osobowe:** imię i nazwisko lub nazwa, dane kontaktowe (w tym adres poczty elektronicznej), dane zawarte w treści zgłoszenia lub odwołania.

**Podstawa prawna:** art. 6 ust. 1 lit. c RODO (przetwarzanie jest niezbędne do wypełnienia obowiązku prawnego ciążącego na Administratorze, w tym przypadku obowiązków zapewnienia mechanizmu zgłaszania treści niedozwolonych – art. 16 rozporządzenia 2022/2065 w sprawie jednolitego rynku usług cyfrowych (akt o usługach cyfrowych, dalej: „DSA") oraz rozpatrywania skarg – art. 20 DSA).

Podanie ww. danych osobowych jest warunkiem rozpatrzenia zgłoszenia lub odwołania (ich podanie jest dobrowolne, lecz konsekwencją ich niepodania będzie niemożność ich rozpatrzenia). Administrator będzie przetwarzał ww. dane przez czas postępowania, a w wypadku realizacji uprawnień – do czasu ich przedawnienia.

### 6. Obsługa zapytań i zgłoszeń błędów

**Przetwarzane dane osobowe:** adres poczty elektronicznej, inne dane zawarte w wiadomości do Administratora.

**Podstawa prawna:** art. 6 ust. 1 lit. f RODO (przetwarzanie jest niezbędne w celu realizacji prawnie uzasadnionego interesu Administratora, w tym przypadku udzielenia odpowiedzi na otrzymane zapytanie oraz usunięcia zgłoszonego błędu).

Podanie ww. danych osobowych jest dobrowolne, ale niezbędne w celu otrzymania odpowiedzi (konsekwencją ich niepodania będzie niemożność jej otrzymania). Administrator będzie przetwarzał ww. dane osobowe do czasu skutecznego wniesienia sprzeciwu lub osiągnięcia celu przetwarzania – w zależności od tego, które z wymienionych zdarzeń nastąpi wcześniej.

### 7. Spełnianie obowiązków podatkowych i księgowych

**Przetwarzane dane osobowe:** imię i nazwisko lub firma, adres zamieszkania lub siedziby, NIP (jeżeli został podany), dane o dokonanych transakcjach.

**Podstawa prawna:** art. 6 ust. 1 lit. c RODO (przetwarzanie jest niezbędne do wypełnienia obowiązku prawnego ciążącego na Administratorze, w tym przypadku obowiązków wynikających z prawa podatkowego i przepisów o rachunkowości).

Podanie ww. danych osobowych jest dobrowolne, ale niezbędne w celu spełnienia przez Administratora ciążących na nim obowiązków podatkowych. Administrator będzie przetwarzał ww. dane osobowe przez okres 5 lat od końca roku kalendarzowego, w którym upłynął termin płatności podatku.

### 8. Wypełnienie obowiązków związanych z ochroną danych osobowych

**Przetwarzane dane osobowe:** imię i nazwisko, podane przez Ciebie dane kontaktowe (adres poczty elektronicznej, adres do korespondencji), treść zgłoszonego żądania oraz udzielonej odpowiedzi.

**Podstawa prawna:** art. 6 ust. 1 lit. c RODO (przetwarzanie jest niezbędne do wypełnienia obowiązku prawnego ciążącego na Administratorze, w tym przypadku obowiązków wynikających z przepisów o ochronie danych osobowych).

Podanie ww. danych osobowych jest dobrowolne, ale niezbędne w celu prawidłowego wykonywania przez Administratora obowiązków wynikających z przepisów o ochronie danych osobowych, m.in. realizacji przyznanych Ci przez RODO uprawnień. Administrator będzie przetwarzał ww. dane osobowe do czasu upływu terminów przedawnienia roszczeń z tytułu naruszenia przepisów o ochronie danych osobowych.

### 9. Ustalenie, dochodzenie lub obrona przed roszczeniami

**Przetwarzane dane osobowe:** imię i nazwisko lub firma, adres poczty elektronicznej, adres zamieszkania lub siedziby, NIP, dane o zawartych Umowach i dokonanych płatnościach.

**Podstawa prawna:** art. 6 ust. 1 lit. f RODO (przetwarzanie jest niezbędne w celu realizacji prawnie uzasadnionego interesu Administratora, w tym przypadku ustalenia, dochodzenia lub obrony przed roszczeniami mogącymi powstać w związku z wykonywaniem Umów zawartych z Administratorem).

Podanie ww. danych osobowych jest dobrowolne, ale niezbędne w celu ustalenia, dochodzenia lub obrony przed roszczeniami. Administrator będzie przetwarzał ww. dane osobowe do czasu upływu terminów przedawnienia tych roszczeń.

### 10. Administrowanie Aplikacją i zapewnienie jej bezpieczeństwa

**Przetwarzane dane osobowe:** adres IP, data i czas serwera, informacje o przeglądarce internetowej, informacje o systemie operacyjnym, adres wywoływanego zasobu i kod odpowiedzi serwera. Powyższe dane zapisywane są automatycznie w tzw. logach serwera, przy każdorazowym korzystaniu z Aplikacji (administrowanie nią bez użycia logów serwera i automatycznego zapisu nie byłoby możliwe).

**Podstawa prawna:** art. 6 ust. 1 lit. f RODO (przetwarzanie jest niezbędne w celu realizacji prawnie uzasadnionego interesu Administratora, w tym przypadku zapewnienia prawidłowego i bezpiecznego działania Aplikacji oraz wykrywania nadużyć).

Podanie ww. danych osobowych jest dobrowolne, ale niezbędne w celu zapewnienia prawidłowego działania Aplikacji. Administrator będzie przetwarzał ww. dane osobowe **przez okres nie dłuższy niż 30 dni**, a w razie wykrycia naruszenia bezpieczeństwa – do czasu jego wyjaśnienia oraz upływu terminów przedawnienia związanych z nim roszczeń.

### 11. Analiza sposobu korzystania z Aplikacji oraz działania marketingowe

**Przetwarzane dane osobowe:** identyfikator nadany plikiem cookie lub podobną technologią, adres IP (w postaci skróconej, jeżeli narzędzie na to pozwala), przybliżona lokalizacja, rodzaj urządzenia, systemu operacyjnego i przeglądarki, źródło wejścia do Aplikacji, odwiedzone podstrony, czas spędzony w Aplikacji, kliknięcia i inne zdarzenia dotyczące korzystania z Aplikacji.

**Podstawa prawna:** art. 6 ust. 1 lit. a RODO (Twoja zgoda, wyrażona w panelu zgód na pliki cookies).

Podanie ww. danych osobowych jest całkowicie dobrowolne, a ich niepodanie (odmowa zgody) nie ogranicza w żaden sposób możliwości korzystania z Aplikacji. Administrator będzie przetwarzał ww. dane osobowe do czasu cofnięcia zgody albo do upływu okresu działania danego pliku cookie – w zależności od tego, które z wymienionych zdarzeń nastąpi wcześniej. Cofnięcie zgody nie wpływa na zgodność z prawem przetwarzania dokonanego przed jej cofnięciem.

## Profilowanie

Jeżeli wyrazisz zgodę na marketingowe pliki cookies, Twoje dane osobowe będą przetwarzane w sposób zautomatyzowany, w tym profilowane, w celu stworzenia Twojego profilu na potrzeby marketingu bezpośredniego oraz kierowania do Ciebie reklam dostosowanych do Twoich preferencji. **Nie będzie to wywoływać wobec Ciebie żadnych skutków prawnych ani w podobny sposób istotnie wpływać na Twoją sytuację** – w szczególności nie wpływa na dostępność Usług, ich zakres, cenę ani na warunki zawartej z Tobą Umowy.

Do profilowania wykorzystywane są wyłącznie dane wskazane w pkt 11 powyżej, czyli informacje o sposobie korzystania z Aplikacji. **Do profilowania nie jest wykorzystywana treść Twojego CV, treść ogłoszeń o pracę, które wprowadzasz, ani wyniki Dopasowań.**

Podstawą prawną profilowania jest art. 6 ust. 1 lit. a RODO (Twoja zgoda). Możesz ją w każdej chwili cofnąć w panelu ustawień plików cookies, dostępnym w stopce Aplikacji – wówczas profilowanie ustanie, a Ty nadal będziesz mógł korzystać z Aplikacji w pełnym zakresie.

## Odbiorcy danych osobowych

Odbiorcami danych osobowych są następujące podmioty zewnętrzne współpracujące z Administratorem:

| Podmiot | Rola | Zakres danych |
| Vercel Inc. (USA) | hosting i udostępnianie Aplikacji, analityka ruchu | wszystkie dane przetwarzane w Aplikacji, dane z logów serwera |
| Supabase Inc. (USA; instancja bazy danych zlokalizowana we Frankfurcie nad Menem, Niemcy) | baza danych, uwierzytelnianie, przechowywanie plików | dane Konta, treść CV, historia Dopasowań, zdjęcia |
| Stripe Payments Europe, Limited (Irlandia) oraz Stripe, Inc. (USA) | obsługa płatności i subskrypcji | adres e-mail, identyfikatory klienta i subskrypcji, dane transakcji |
| Google Ireland Limited oraz Google LLC (USA) | modele sztucznej inteligencji (Gemini API), zarządzanie tagami (Google Tag Manager), analityka (Google Analytics 4) | treść CV i treść ogłoszenia przekazywane w celu wykonania Dopasowania; dane o korzystaniu z Aplikacji |
| Resend, Inc. (USA) | wysyłka wiadomości e-mail (kody aktywacyjne, powiadomienia) | adres e-mail, treść wiadomości |
| Meta Platforms Ireland Limited (Irlandia) | działania marketingowe i pomiar ich skuteczności (Meta Pixel) | dane o korzystaniu z Aplikacji – wyłącznie po wyrażeniu zgody |
| Microsoft Ireland Operations Limited oraz Microsoft Corporation (USA) | analiza sposobu korzystania z Aplikacji (Microsoft Clarity) | dane o korzystaniu z Aplikacji – wyłącznie po wyrażeniu zgody |
| Podmiot świadczący usługi księgowe na rzecz Administratora | prowadzenie ksiąg i rozliczenia podatkowe | dane z dokumentów księgowych |

Z każdym z ww. podmiotów, który przetwarza dane osobowe w imieniu Administratora, zawarta została umowa powierzenia przetwarzania danych osobowych zgodna z art. 28 RODO.

Ponadto dane osobowe mogą zostać przekazane podmiotom publicznym lub prywatnym, jeśli taki obowiązek będzie wynikał z powszechnie obowiązujących przepisów prawa, prawomocnego wyroku sądu lub prawomocnej decyzji administracyjnej.

## Przekazywanie danych osobowych do państwa trzeciego

W związku z korzystaniem z usług podmiotów wskazanych powyżej Twoje dane osobowe mogą być przekazywane poza Europejski Obszar Gospodarczy, w szczególności do Stanów Zjednoczonych Ameryki.

Podstawą przekazania danych do państw trzecich są:

1. w odniesieniu do dostawców posiadających aktywną certyfikację w programie **Data Privacy Framework** – decyzja wykonawcza Komisji Europejskiej (UE) 2023/1795 z dnia 10 lipca 2023 r. stwierdzająca odpowiedni stopień ochrony danych osobowych zapewniony przez Ramy Ochrony Danych UE–USA;
2. w odniesieniu do pozostałych dostawców – **standardowe klauzule umowne** zgodne z decyzją wykonawczą Komisji (UE) 2021/914 z dnia 4 czerwca 2021 r. w sprawie standardowych klauzul umownych dotyczących przekazywania danych osobowych do państw trzecich na podstawie RODO, wraz z dodatkowymi środkami zabezpieczającymi, w tym szyfrowaniem danych w tranzycie i w spoczynku.

Możesz uzyskać od Administratora kopię danych przekazywanych do państwa trzeciego oraz informację o zastosowanych zabezpieczeniach – w tym celu skontaktuj się pod adresem ${FIRMA.email}.

## Uprawnienia

W związku z przetwarzaniem danych osobowych przysługują Ci następujące uprawnienia:

1. prawo do informacji, jakie dane osobowe Ciebie dotyczące są przetwarzane przez Administratora, oraz do otrzymania kopii tych danych (tzw. prawo dostępu). Wydanie pierwszej kopii danych jest darmowe, za kolejne Administrator może naliczyć opłatę;
2. jeżeli przetwarzane dane staną się nieaktualne lub niekompletne (lub w inny sposób niepoprawne), masz prawo zażądać ich sprostowania;
3. w pewnych sytuacjach możesz zwrócić się do Administratora o usunięcie swoich danych osobowych, np. gdy:
   1) dane przestaną być potrzebne Administratorowi do celów, o których poinformował,
   2) skutecznie cofnąłeś zgodę na przetwarzanie danych – o ile Administrator nie ma prawa przetwarzać danych na innej podstawie prawnej,
   3) przetwarzanie jest niezgodne z prawem,
   4) konieczność usunięcia danych wynika z ciążącego na Administratorze obowiązku prawnego;
4. w przypadku, gdy dane osobowe są przetwarzane przez Administratora na podstawie udzielonej zgody na przetwarzanie albo w celu wykonania Umowy z nim zawartej, masz prawo przenieść swoje dane do innego administratora;
5. w przypadku, gdy dane osobowe przetwarzane są przez Administratora na podstawie udzielonej przez Ciebie zgody na przetwarzanie, masz prawo cofnąć tę zgodę w każdym momencie (cofnięcie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem);
6. jeśli uznasz, że przetwarzane dane osobowe są nieprawidłowe, ich przetwarzanie jest niezgodne z prawem lub Administrator nie potrzebuje już określonych danych, możesz zażądać, aby przez określony, potrzebny czas (np. sprawdzenia poprawności danych lub dochodzenia roszczeń) Administrator nie dokonywał na danych żadnych operacji, a jedynie je przechowywał;
7. masz prawo do wyrażenia sprzeciwu wobec przetwarzania danych osobowych, których podstawą przetwarzania jest prawnie uzasadniony interes Administratora. W razie skutecznego wniesienia sprzeciwu Administrator przestanie przetwarzać dane osobowe w tym celu;
8. masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa), gdy uznasz, że przetwarzanie danych osobowych narusza przepisy RODO.

**Usunięcie Konta i eksport danych.** Z poziomu ustawień Konta możesz w każdej chwili samodzielnie i nieodpłatnie **trwale usunąć Konto** wraz ze wszystkimi zapisanymi CV, historią Dopasowań i zdjęciami – bez kontaktu z Administratorem i bez podawania przyczyny. Kopię kompletu swoich danych w formacie JSON otrzymasz nieodpłatnie na żądanie zgłoszone na adres ${FIRMA.email}, niezwłocznie, nie później niż w terminie 30 dni. Każde ze swoich CV możesz też w każdej chwili pobrać w pliku PDF bezpośrednio z Aplikacji.

## Pliki cookies

1. Administrator informuje, że Aplikacja korzysta z plików „cookies" (ciasteczek) oraz z podobnych technologii przechowujących informacje w Twoim urządzeniu końcowym (m.in. pamięci lokalnej przeglądarki). Są to niewielkie pliki tekstowe, które mogą być odczytywane przez system Administratora, a także przez systemy należące do innych podmiotów, z których usług korzysta Administrator.
2. Administrator wykorzystuje pliki cookies w następujących celach:
   1) **zapewnienie prawidłowego działania Aplikacji** – dzięki plikom cookies możliwe jest utrzymanie sesji zalogowania, bezpieczne przeprowadzenie płatności oraz zapamiętanie Twojego wyboru w panelu zgód,
   2) **tworzenie statystyk** – pliki cookies są wykorzystywane w celu analizy sposobu korzystania z Aplikacji przez Użytkowników, co pozwala ją ulepszać,
   3) **prowadzenie działań marketingowych** – dzięki plikom cookies Administrator może kierować do Użytkowników reklamy dostosowane do ich preferencji oraz mierzyć ich skuteczność.
3. Administrator może umieszczać w Twoim urządzeniu zarówno pliki trwałe, jak i tymczasowe (sesyjne). Pliki sesyjne są zazwyczaj usuwane z chwilą zamknięcia przeglądarki, natomiast zamknięcie przeglądarki nie powoduje usunięcia plików trwałych.
4. **Pliki cookies inne niż niezbędne są instalowane wyłącznie po wyrażeniu przez Ciebie zgody.** Informacja o plikach cookies wyświetlana jest w panelu zgód przy pierwszym wejściu do Aplikacji. Zgody są domyślnie niezaznaczone, a odmowa zgody nie ogranicza możliwości korzystania z Aplikacji.
5. **Swoją decyzję możesz zmienić w każdej chwili** – panel ustawień plików cookies jest stale dostępny pod odnośnikiem „Ustawienia cookies" w stopce Aplikacji.
6. Administrator korzysta z następujących plików cookies i wykorzystujących je narzędzi:

${TABELA_COOKIES_MD}

7. Narzędzia analityczne i marketingowe wymienione w tabeli powyżej są uruchamiane za pośrednictwem **Google Tag Manager** – usługi Google Ireland Limited służącej do zarządzania kodami pomiarowymi. Sam Google Tag Manager nie zapisuje żadnych plików w Twoim urządzeniu; decyduje jedynie o tym, które z narzędzi zostaje uruchomione. **Administrator nie pobiera Google Tag Managera, dopóki nie wyrazisz zgody na co najmniej jedną kategorię opcjonalną** – jeżeli odmówisz wszystkich zgód, do serwerów Google nie zostanie wysłane żadne zapytanie. Wyjątkiem są narzędzia Vercel Analytics i Speed Insights, uruchamiane bezpośrednio przez Aplikację, bez pośrednictwa Google Tag Managera.
8. **Treść Twojego CV, treść ogłoszeń o pracę oraz wyniki Dopasowań nie są przekazywane do żadnego z narzędzi analitycznych ani marketingowych** wymienionych w tabeli powyżej ani do Google Tag Managera.
9. Za pośrednictwem większości powszechnie używanych przeglądarek możesz sprawdzić, czy na Twoim urządzeniu końcowym zostały zainstalowane pliki cookies, jak również usunąć zainstalowane pliki cookies oraz zablokować instalowanie ich w przyszłości przez Aplikację. Wyłączenie lub ograniczenie obsługi niezbędnych plików cookies może jednak spowodować poważne trudności w korzystaniu z Aplikacji, w szczególności brak możliwości zalogowania się na Konto.

## Postanowienia końcowe

1. W zakresie nieuregulowanym Polityką stosuje się powszechnie obowiązujące przepisy o ochronie danych osobowych.
2. Administrator zastrzega sobie prawo do zmiany Polityki. O każdej zmianie Administrator poinformuje Użytkowników posiadających Konto za pomocą poczty elektronicznej oraz przez opublikowanie zmienionej wersji w Aplikacji.
3. Polityka obowiązuje od dnia ${DATA_OBOWIAZYWANIA} r.
`.trim();
