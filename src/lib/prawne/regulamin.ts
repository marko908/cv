/**
 * REGULAMIN APLIKACJI APLIKANDO — treść publikowana pod /regulamin.
 *
 * Źródło: wzór „Regulamin aplikacji SaaS" z pakietu Creativa Legal, uzupełniony
 * zgodnie z komentarzami pomocniczymi prawnika i DOPASOWANY DO TEGO, CO KOD
 * REALNIE ROBI. Każde odstępstwo od wzoru jest zamierzone i opisane
 * w `dokumenty-prawne/WDROZENIE.md` (sekcja „Odstępstwa od wzoru").
 *
 * ZASADA: regulamin opisuje aplikację taką, jaka jest — nie taką, jaką chcemy,
 * żeby była. Jeżeli zmieniasz flow rejestracji, ceny, model AI albo listę
 * dostawców, ten plik zmienia się w TYM SAMYM commicie.
 *
 * Składnia (obsługiwana przez `components/prawne/dokument-prawny.tsx`):
 *   „## § 1. Tytuł"  — nagłówek paragrafu
 *   „1. …"           — ustęp
 *   „   1) …"        — punkt (3 spacje wcięcia)
 *   „      a) …"     — litera (6 spacji wcięcia)
 *   „**tekst**"      — pogrubienie, „[tekst](/sciezka)" — link
 */

import {
  ADRES,
  APLIKACJA,
  DATA_OBOWIAZYWANIA,
  FIRMA,
  OZNACZENIE_PRZEDSIEBIORCY,
  SCIEZKI,
} from "./dane";

export const REGULAMIN = `
# Regulamin aplikacji ${APLIKACJA.nazwa}

## § 1. Postanowienia ogólne

1. Niniejszy regulamin (dalej: „Regulamin") określa zasady i warunki korzystania z aplikacji „${APLIKACJA.nazwa}", dostępnej pod adresem internetowym ${APLIKACJA.adresWww} (dalej: „Aplikacja"), oraz usług świadczonych przez Usługodawcę.
2. Aplikacja służy do tworzenia i redagowania dokumentów aplikacyjnych (CV) oraz do dopasowywania treści CV do konkretnego ogłoszenia o pracę z wykorzystaniem systemów sztucznej inteligencji. Aplikacja jest przeznaczona zarówno dla konsumentów, jak i dla przedsiębiorców.
3. Regulamin jest regulaminem, o którym mowa w art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną (dalej: „Ustawa o świadczeniu usług drogą elektroniczną").
4. Dostawcą usług jest ${OZNACZENIE_PRZEDSIEBIORCY} (dalej: „Usługodawca").
5. Kontakt z Usługodawcą jest możliwy za pomocą:
   1) poczty elektronicznej – pod adresem: ${FIRMA.email},
   2) poczty tradycyjnej – pod adresem: ${ADRES}.
6. Zgodnie z przepisami Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2022/2065 z dnia 19 października 2022 r. w sprawie jednolitego rynku usług cyfrowych oraz zmiany dyrektywy 2000/31/WE (akt o usługach cyfrowych) (dalej: „DSA"), Usługodawca wyznaczył punkt kontaktowy służący do bezpośredniej komunikacji z organami państw członkowskich UE, Komisją Europejską, Radą ds. Usług Cyfrowych oraz Użytkownikami Aplikacji w sprawach objętych regulacją DSA. Punkt kontaktowy jest dostępny pod adresem: ${FIRMA.email}. Językiem komunikacji w ramach punktu kontaktowego jest język polski oraz język angielski.
7. Przed rozpoczęciem korzystania z Aplikacji Użytkownik zobowiązany jest zapoznać się z Regulaminem oraz [Polityką prywatności](${SCIEZKI.politykaPrywatnosci}).

## § 2. Definicje

1. Użyte w Regulaminie wyrazy pisane wielką literą mają następujące znaczenie:
   1) **Aplikacja** – termin zdefiniowany w § 1 ust. 1 Regulaminu,
   2) **Cennik** – informacja określająca aktualne ceny Usług Płatnych, limity przypisane do poszczególnych wariantów Subskrypcji, okresy rozliczeniowe oraz pozostałe warunki tam wskazane, dostępna w Aplikacji pod adresem: [${APLIKACJA.domena}${SCIEZKI.cennik}](${SCIEZKI.cennik}),
   3) **Dopasowanie** – Usługa Płatna polegająca na porównaniu treści CV Usługobiorcy z treścią wskazanego przez niego ogłoszenia o pracę oraz na przygotowaniu na tej podstawie raportu i przeredagowanej wersji CV, na zasadach opisanych w § 3 i § 11 Regulaminu,
   4) **Konsument** – osoba fizyczna dokonująca z Usługodawcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową,
   5) **Konto** – panel tworzony w systemie informatycznym Aplikacji, umożliwiający Usługobiorcy korzystanie z jej funkcjonalności oraz przechowywanie Treści Usługobiorcy,
   6) **Niezgodność** – niezgodność Usługi z Umową (kryteria oceny zgodności usługi cyfrowej z umową dotyczącą jej dostarczania określa art. 43k ust. 1–2 Ustawy o prawach konsumenta),
   7) **Odblokowanie Jednorazowe** – nabycie przez Usługobiorcę dostępu do pełnego wyniku jednego, wskazanego Dopasowania, bez zawierania Umowy Subskrypcji,
   8) **Okres Rozliczeniowy** – okres, za który z góry uiszczana jest Opłata Subskrypcyjna (miesiąc albo rok), zgodnie z wariantem wybranym przez Usługobiorcę w Cenniku,
   9) **Opłata Subskrypcyjna** – opłata uiszczana przez Usługobiorcę z góry za dany Okres Rozliczeniowy, ustalana zgodnie z Cennikiem obowiązującym w chwili zawarcia Umowy Subskrypcji,
   10) **Polityka prywatności** – dokument zawierający informacje o przetwarzaniu danych osobowych Użytkowników przez Usługodawcę, dostępny pod adresem: [${APLIKACJA.domena}${SCIEZKI.politykaPrywatnosci}](${SCIEZKI.politykaPrywatnosci}),
   11) **Przedsiębiorca** – osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, której przepisy szczególne przyznają zdolność prawną, prowadząca we własnym imieniu działalność gospodarczą lub zawodową,
   12) **Przedsiębiorca na prawach Konsumenta** – osoba fizyczna prowadząca we własnym imieniu działalność gospodarczą lub zawodową, która zawarła z Usługodawcą Umowę bezpośrednio związaną z jej działalnością gospodarczą, nieposiadającą jednak dla tej osoby charakteru zawodowego, wynikającego w szczególności z przedmiotu wykonywanej przez nią działalności gospodarczej,
   13) **Regulamin** – termin zdefiniowany w § 1 ust. 1 Regulaminu,
   14) **Subskrypcja** – odpłatny dostęp do Usług Płatnych, udzielany na kolejne Okresy Rozliczeniowe, w ramach limitu Dopasowań określonego w Cenniku dla wybranego wariantu,
   15) **Treści Usługobiorcy** – wszelkie dane (w tym dane osobowe), pliki, informacje i materiały wprowadzone lub zapisane przez Usługobiorcę w Aplikacji, w szczególności treść CV, zdjęcie oraz treść ogłoszeń o pracę,
   16) **Umowa** – umowa o dostarczanie usługi cyfrowej w rozumieniu Ustawy o prawach konsumenta, zawierana pomiędzy Usługodawcą a Usługobiorcą; Regulamin wyróżnia Umowę o Konto (§ 4 ust. 4) oraz Umowę Subskrypcji i Odblokowanie Jednorazowe (§ 4 ust. 8–10),
   17) **Usługa** – usługa świadczona przez Usługodawcę drogą elektroniczną za pośrednictwem Aplikacji,
   18) **Usługa Bezpłatna** – Usługa wskazana w § 3 ust. 5 Regulaminu,
   19) **Usługa Płatna** – Usługa wskazana w § 3 ust. 6 Regulaminu,
   20) **Usługobiorca** – Użytkownik, który zawarł z Usługodawcą Umowę,
   21) **Usługodawca** – termin zdefiniowany w § 1 ust. 4 Regulaminu,
   22) **Ustawa o prawach konsumenta** – ustawa z dnia 30 maja 2014 r. o prawach konsumenta,
   23) **Ustawa o świadczeniu usług drogą elektroniczną** – termin zdefiniowany w § 1 ust. 3 Regulaminu,
   24) **Użytkownik** – każda osoba korzystająca z Aplikacji.

## § 3. Wymagania techniczne, zakres usług i bezpieczeństwo

1. Aplikacja jest aplikacją internetową, uruchamianą w przeglądarce. Usługodawca nie udostępnia Aplikacji w formie programu instalowanego na urządzeniu Użytkownika, w tym w formie aplikacji mobilnej.
2. W celu prawidłowego korzystania z Usług niezbędne jest łącznie:
   1) połączenie z siecią Internet,
   2) posiadanie urządzenia pozwalającego na korzystanie z zasobów sieci Internet,
   3) korzystanie z aktualnej wersji przeglądarki internetowej obsługującej język JavaScript oraz akceptującej pliki cookies,
   4) posiadanie aktywnego konta poczty elektronicznej – w zakresie Usług wymagających Konta.
3. W ramach Aplikacji zabronione jest korzystanie przez Użytkowników z wirusów, botów, robaków bądź innych kodów komputerowych, plików czy programów (w szczególności automatyzujących procesy skryptów i aplikacji bądź innych kodów, plików lub narzędzi).
4. Usługodawca ma prawo czasowo ograniczyć lub zablokować dostęp do Usługi w przypadku wykrycia nadzwyczajnie wysokiego, nietypowego lub zautomatyzowanego jej zużycia, wskazującego na korzystanie z Aplikacji niezgodnie z Regulaminem.
5. **Usługami Bezpłatnymi są:** utworzenie i prowadzenie Konta, korzystanie z kreatora CV, dostęp do wszystkich szablonów CV, podgląd CV na żywo oraz pobranie własnego CV w pliku PDF.
6. **Usługą Płatną jest Dopasowanie**, obejmujące: raport z oceną CV wraz z rozbiciem wyniku na kryteria, dziennik zmian („co zmieniliśmy i dlaczego"), wywiad uzupełniający oraz przeredagowaną wersję CV udostępnioną do edycji i pobrania.
7. Korzystanie z kreatora CV nie wymaga posiadania Konta. Utworzenie Konta jest wymagane do zapisania CV, pobrania CV w pliku PDF oraz do skorzystania z Dopasowania.
8. Usługodawca informuje, że stosuje środki techniczne i organizacyjne służące ochronie danych, w szczególności:
   1) szyfrowanie połączenia protokołem TLS (HTTPS),
   2) przechowywanie haseł wyłącznie w postaci skrótów kryptograficznych, po stronie dostawcy usługi uwierzytelniania,
   3) izolację danych poszczególnych Kont na poziomie bazy danych, uniemożliwiającą odczyt danych jednego Usługobiorcy przez innego Usługobiorcę,
   4) przechowywanie zdjęć dołączanych do CV w prywatnej przestrzeni dyskowej, dostępnej wyłącznie przez odnośniki generowane czasowo dla uprawnionego Usługobiorcy.
9. Usługodawca informuje, że pomimo stosowania zabezpieczeń, o których mowa w ust. 8 powyżej, korzystanie z sieci Internet oraz z usług świadczonych drogą elektroniczną może wiązać się z ryzykiem przedostania się do systemu teleinformatycznego oraz urządzenia Użytkownika szkodliwego oprogramowania lub uzyskania dostępu do danych znajdujących się na tym urządzeniu przez osoby trzecie. W celu zminimalizowania tego ryzyka Usługodawca zaleca stosowanie aktualnego oprogramowania antywirusowego oraz środków chroniących identyfikację w sieci Internet.
10. Użytkownik korzystający z Usług zobowiązany jest podawać wyłącznie dane (w tym dane osobowe) zgodne ze stanem rzeczywistym. Usługodawca nie ponosi odpowiedzialności za skutki podania przez Użytkownika nieprawdziwych lub niepełnych danych.
11. Usługobiorca oświadcza, że:
   1) posiada pełną zdolność do zawarcia Umowy,
   2) korzysta z Aplikacji zgodnie z obowiązującymi przepisami prawa,
   3) przysługują mu wszelkie prawa do Treści Usługobiorcy wprowadzanych do Aplikacji.
12. Usługobiorca ponosi wyłączną odpowiedzialność za Treści Usługobiorcy oraz za skutki ich wykorzystania, w tym za naruszenie praw osób trzecich, przepisów prawa lub Regulaminu.
13. Usługobiorca przyjmuje do wiadomości, że Aplikacja nie świadczy usług doradczych, w szczególności doradztwa zawodowego, personalnego ani rekrutacyjnego. Wszelkie oceny, wyniki, analizy, rekomendacje i wskazówki generowane przez Aplikację mają charakter pomocniczy, nie stanowią gwarancji uzyskania zatrudnienia, zaproszenia na rozmowę kwalifikacyjną ani jakiegokolwiek innego rezultatu procesu rekrutacyjnego, i nie mogą stanowić wyłącznej podstawy podejmowania decyzji zawodowych.

## § 4. Umowa o dostarczanie Usługi

1. Na podstawie Umowy Usługodawca umożliwia Usługobiorcy korzystanie z funkcjonalności Aplikacji – w zakresie Usług Bezpłatnych oraz, w przypadku zawarcia Umowy Subskrypcji albo dokonania Odblokowania Jednorazowego, w zakresie Usług Płatnych.
2. W celu utworzenia Konta Usługobiorca powinien wykonać następujące czynności:
   1) wejść na stronę internetową Aplikacji i wybrać opcję „Załóż konto",
   2) w wyświetlonym formularzu podać adres poczty elektronicznej oraz ustalić hasło,
   3) obowiązkowo zaznaczyć checkbox przy oświadczeniu o zapoznaniu się z Regulaminem i Polityką prywatności oraz akceptacji ich postanowień,
   4) kliknąć przycisk „Załóż konto",
   5) wprowadzić w Aplikacji kod aktywacyjny przesłany na podany adres poczty elektronicznej.
3. Usługodawca nie stosuje aktywacji Konta w drodze kliknięcia w link przesłany pocztą elektroniczną. Aktywacja następuje wyłącznie przez wprowadzenie kodu, o którym mowa w ust. 2 pkt 5 powyżej.
4. Wprowadzenie prawidłowego kodu aktywacyjnego jest równoznaczne z zawarciem nieodpłatnej Umowy o Konto, na czas nieoznaczony.
5. Do chwili utworzenia Konta dane wprowadzone przez Użytkownika w kreatorze CV przechowywane są wyłącznie w pamięci przeglądarki na jego urządzeniu. Usługodawca nie ma do nich dostępu, nie odpowiada za ich utratę wynikającą z wyczyszczenia danych przeglądarki, zmiany urządzenia lub korzystania z trybu prywatnego, i zaleca utworzenie Konta przed wprowadzeniem obszerniejszych treści.
6. Po utworzeniu Konta dane wprowadzone przez Użytkownika przed rejestracją są jednorazowo przenoszone na Konto. Od tej chwili Treści Usługobiorcy są przechowywane na Koncie i dostępne na każdym urządzeniu, na którym Usługobiorca zaloguje się do Aplikacji.
7. Usługodawca informuje, a Usługobiorca przyjmuje do wiadomości, że zachowanie zgodności Usługi z Umową nie wymaga instalowania przez Usługobiorcę jakichkolwiek aktualizacji – Aplikacja jest udostępniana w wersji przeglądarkowej, a aktualizacje wprowadza Usługodawca po swojej stronie.
8. W celu zawarcia Umowy Subskrypcji Usługobiorca powinien:
   1) będąc zalogowanym na Konto, przejść do Cennika,
   2) wybrać wariant Subskrypcji oraz Okres Rozliczeniowy,
   3) obowiązkowo zaznaczyć checkbox przy oświadczeniu o zapoznaniu się z Regulaminem i Polityką prywatności oraz akceptacji ich postanowień, a także checkbox przy zgodzie, o której mowa w § 8 ust. 5 Regulaminu,
   4) kliknąć przycisk rozpoczynający płatność i dokonać zapłaty za pośrednictwem operatora płatności.
9. W celu dokonania Odblokowania Jednorazowego Usługobiorca powinien, będąc zalogowanym na Konto, wybrać przy danym Dopasowaniu opcję jego odblokowania, złożyć oświadczenia wskazane w ust. 9 pkt 3 powyżej oraz dokonać zapłaty za pośrednictwem operatora płatności.
10. Umowa Subskrypcji albo umowa, na podstawie której następuje Odblokowanie Jednorazowe, zostaje zawarta z chwilą otrzymania przez Usługodawcę potwierdzenia dokonania płatności od operatora płatności. Niezwłocznie po tej chwili Usługodawca udostępnia Usługobiorcy dostęp do Usług Płatnych oraz przesyła na jego adres poczty elektronicznej potwierdzenie zawarcia Umowy wraz z jej treścią.
11. Postanowienia ust. 12–15 poniżej stosuje się wyłącznie do Usługobiorców będących Konsumentami lub Przedsiębiorcami na prawach Konsumenta.
12. W przypadku braku udzielenia Usługobiorcy dostępu do Usługi niezwłocznie po zawarciu Umowy, Usługobiorca wzywa Usługodawcę do niezwłocznego udzielenia dostępu do Usługi. Wezwanie może zostać wysłane za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu. W przypadku, gdy Usługodawca nie udzieli dostępu do Usługi niezwłocznie po otrzymaniu wezwania, Usługobiorca może odstąpić od Umowy.
13. Niezależnie od postanowień ust. 12 powyżej, w przypadku braku udzielenia dostępu do Usługi Usługobiorca może odstąpić od Umowy bez wzywania Usługodawcy do udzielenia dostępu, jeżeli zachodzi co najmniej jeden z przypadków wskazanych w art. 43j ust. 5 Ustawy o prawach konsumenta.
14. Niezależnie od postanowień ust. 12–13 powyżej, Usługobiorca może w każdym czasie i bez podania przyczyny wypowiedzieć Umowę o Konto ze skutkiem natychmiastowym poprzez samodzielne usunięcie Konta w ustawieniach Aplikacji albo poprzez wysłanie dyspozycji usunięcia Konta na adres wskazany w § 1 ust. 5 pkt 1 Regulaminu.
15. Odstąpienie od Umowy albo jej wypowiedzenie, niezależnie od podstawy dokonania tej czynności, następuje poprzez złożenie Usługodawcy stosownego oświadczenia. Oświadczenie może zostać wysłane za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu.
16. W przypadku naruszenia przez Usługobiorcę postanowień Regulaminu i nieusunięcia tego naruszenia pomimo otrzymania wezwania, Usługodawca może wypowiedzieć Umowę z zachowaniem okresu wypowiedzenia wynoszącego 7 (siedem) dni, poprzez złożenie Usługobiorcy oświadczenia o wypowiedzeniu za pomocą poczty elektronicznej. Po upływie okresu wypowiedzenia Usługodawca wstrzymuje dostarczanie Usługi. W czasie trwania okresu wypowiedzenia Usługodawca może zablokować Usługobiorcy dostęp do Usługi, jeżeli jest to niezbędne w celu zapobieżenia dalszym naruszeniom. Usługodawca zwraca Usługobiorcy Opłatę Subskrypcyjną w części przypadającej na niewykorzystany Okres Rozliczeniowy, chyba że wypowiedzenie nastąpiło z powodu naruszenia § 13 ust. 4 Regulaminu.
17. Usunięcie Konta powoduje trwałe usunięcie Treści Usługobiorcy, w tym zapisanych CV, historii Dopasowań oraz zdjęć. Usunięcie jest nieodwracalne, a Usługodawca nie tworzy kopii archiwalnych umożliwiających ich odtworzenie. Nie dotyczy to danych, których dalsze przechowywanie jest wymagane przepisami prawa (w szczególności dokumentacji księgowej) albo niezbędne do ustalenia, dochodzenia lub obrony przed roszczeniami – w zakresie i przez okres opisany w Polityce prywatności.
18. **Usługodawca zaleca pobranie kopii danych przed usunięciem Konta.** Na żądanie zgłoszone na adres wskazany w § 1 ust. 5 pkt 1 Regulaminu Usługodawca nieodpłatnie udostępnia Usługobiorcy komplet jego danych w powszechnie używanym formacie nadającym się do odczytu maszynowego (JSON), obejmujący zapisane CV, historię Dopasowań oraz dane Konta – niezwłocznie, nie później niż w terminie 30 dni od dnia otrzymania żądania. Niezależnie od powyższego, Usługobiorca może w każdej chwili pobrać każde ze swoich CV w pliku PDF bezpośrednio z Aplikacji.

## § 5. Opłaty i rozliczenia

1. Ceny wskazane w Cenniku są wyrażone w złotych polskich (PLN) i stanowią **ceny brutto – zawierają podatek od towarów i usług (VAT)** według stawki obowiązującej w dniu zawarcia Umowy. Usługobiorca nie ponosi żadnych dodatkowych kosztów poza ceną wskazaną w Cenniku.
2. Wszelkie płatności należne Usługodawcy są uiszczane przez Usługobiorcę za pomocą systemu płatności udostępnionego w ramach Aplikacji, obsługiwanego przez zewnętrznego operatora płatności. Rozliczenie płatności odbywa się zgodnie z regulaminem tego operatora, udostępnianym Usługobiorcy przed dokonaniem płatności.
3. Za dzień płatności uznaje się dzień otrzymania przez Usługodawcę potwierdzenia dokonania płatności od operatora płatności.
4. Usługodawca wystawia i przesyła Usługobiorcy fakturę VAT na adres poczty elektronicznej przypisany do Konta.
5. Opłata Subskrypcyjna jest uiszczana z góry za dany Okres Rozliczeniowy. **Subskrypcja odnawia się automatycznie** na kolejny Okres Rozliczeniowy, a Opłata Subskrypcyjna pobierana jest automatycznie z zapisanej metody płatności, chyba że Usługobiorca zrezygnuje z odnowienia przed końcem bieżącego Okresu Rozliczeniowego.
6. Usługobiorca może w każdym czasie zrezygnować z automatycznego odnowienia Subskrypcji w panelu zarządzania płatnościami, dostępnym z poziomu ustawień Konta. Rezygnacja nie powoduje utraty dostępu do Usług Płatnych przed upływem opłaconego Okresu Rozliczeniowego – dostęp wygasa z jego końcem.
7. Brak zapłaty Opłaty Subskrypcyjnej za kolejny Okres Rozliczeniowy powoduje wstrzymanie dostępu do Usług Płatnych z końcem opłaconego Okresu Rozliczeniowego. Usługobiorca zachowuje w takim wypadku dostęp do Usług Bezpłatnych oraz do Treści Usługobiorcy zapisanych na Koncie.
8. Odblokowanie Jednorazowe jest opłatą jednorazową, dotyczącą jednego wskazanego Dopasowania, i nie odnawia się. Dostęp uzyskany w drodze Odblokowania Jednorazowego jest bezterminowy i obejmuje również wynik ponownie przeliczony po skorzystaniu z wywiadu uzupełniającego w ramach tego samego Dopasowania.

## § 6. Cennik

1. Aktualny Cennik jest dostępny pod adresem: [${APLIKACJA.domena}${SCIEZKI.cennik}](${SCIEZKI.cennik}).
2. Cennik określa dla każdego wariantu Subskrypcji **limit Dopasowań przypadających na jeden miesiąc kalendarzowy**. Limit jest odnawiany pierwszego dnia każdego miesiąca kalendarzowego i nie przechodzi na kolejny miesiąc. Po wyczerpaniu limitu Usługobiorca zachowuje dostęp do Usług Bezpłatnych oraz do wyników wcześniejszych Dopasowań, a kolejne Dopasowanie może wykonać po rozpoczęciu kolejnego miesiąca kalendarzowego, po zmianie wariantu Subskrypcji albo w drodze Odblokowania Jednorazowego.
3. Skorzystanie z wywiadu uzupełniającego powoduje ponowne przeliczenie Dopasowania i zużywa kolejną jednostkę limitu, o czym Usługobiorca jest informowany w Aplikacji przed uruchomieniem przeliczenia.
4. Usługodawca może dokonać zmiany Cennika w każdym czasie ze skutkiem na przyszłość. Zmiana Cennika nie stanowi zmiany Regulaminu i nie wpływa na Umowy zawarte przed jej wprowadzeniem.
5. O zmianie Cennika mającej zastosowanie do aktywnych Subskrypcji Usługobiorca zostanie poinformowany za pomocą poczty elektronicznej z co najmniej 30-dniowym wyprzedzeniem. Zmieniona cena obowiązuje od najbliższego Okresu Rozliczeniowego rozpoczynającego się po upływie tego terminu. Usługobiorca, który nie akceptuje zmiany, może zrezygnować z automatycznego odnowienia Subskrypcji na zasadach opisanych w § 5 ust. 6 Regulaminu.

## § 7. Reklamacje – Konsumenci oraz Przedsiębiorcy na prawach Konsumenta

1. Postanowienia niniejszego paragrafu mają zastosowanie wyłącznie do Usługobiorców będących Konsumentami oraz Przedsiębiorcami na prawach Konsumenta.
2. Dostarczana Usługobiorcy przez Usługodawcę Usługa musi być zgodna z dotyczącą jej Umową przez cały okres dostarczania Usługi.
3. Usługodawca ponosi odpowiedzialność za Niezgodność ujawnioną w okresie dostarczania Usługi.
4. W przypadku ujawnienia Niezgodności Usługobiorca może złożyć reklamację zawierającą żądanie doprowadzenia Usługi do zgodności z Umową.
5. Reklamacja składana jest za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu.
6. Reklamacja powinna zawierać:
   1) imię i nazwisko Usługobiorcy,
   2) adres poczty elektronicznej,
   3) opis ujawnionej Niezgodności,
   4) żądanie doprowadzenia Usługi do zgodności z Umową.
7. Usługodawca może odmówić doprowadzenia Usługi do zgodności z Umową, jeżeli jest to niemożliwe albo wymagałoby poniesienia przez Usługodawcę nadmiernych kosztów.
8. Po rozpatrzeniu reklamacji Usługodawca udziela Usługobiorcy odpowiedzi na reklamację, w której:
   1) uznaje reklamację oraz wskazuje planowany termin doprowadzenia Usługi do zgodności z Umową,
   2) odmawia doprowadzenia Usługi do zgodności z Umową z przyczyn wskazanych w ust. 7 powyżej, albo
   3) odrzuca reklamację z powodu jej bezzasadności.
9. Usługodawca udziela odpowiedzi na reklamację za pomocą poczty elektronicznej w terminie 14 (czternastu) dni od dnia jej otrzymania.
10. W przypadku uznania reklamacji Usługodawca na własny koszt doprowadza Usługę do zgodności z Umową w rozsądnym czasie od chwili otrzymania reklamacji i bez nadmiernych niedogodności dla Usługobiorcy, uwzględniając charakter Usługi oraz cel, w jakim jest ona wykorzystywana. Planowany termin Usługodawca wskazuje w odpowiedzi na reklamację.
11. W przypadku ujawnienia Niezgodności Usługobiorca może złożyć Usługodawcy oświadczenie o obniżeniu ceny albo o odstąpieniu od Umowy, gdy:
   1) doprowadzenie Usługi do zgodności z Umową jest niemożliwe albo wymaga nadmiernych kosztów,
   2) Usługodawca nie doprowadził Usługi do zgodności z Umową zgodnie z ust. 10 powyżej,
   3) Niezgodność występuje nadal, mimo że Usługodawca próbował doprowadzić Usługę do zgodności z Umową,
   4) Niezgodność jest na tyle istotna, że uzasadnia odstąpienie od Umowy bez uprzedniego żądania doprowadzenia Usługi do zgodności z Umową,
   5) z oświadczenia Usługodawcy lub okoliczności wyraźnie wynika, że Usługodawca nie doprowadzi Usługi do zgodności z Umową w rozsądnym czasie lub bez nadmiernych niedogodności dla Usługobiorcy.
12. Usługobiorca nie może odstąpić od Umowy, jeżeli Niezgodność jest nieistotna. Domniemywa się, że Niezgodność jest istotna.
13. Oświadczenie, o którym mowa w ust. 11 powyżej, może zostać złożone za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu, i powinno zawierać:
   1) imię i nazwisko Usługobiorcy,
   2) adres poczty elektronicznej,
   3) datę zawarcia Umowy,
   4) opis Niezgodności,
   5) wskazanie przyczyny złożenia oświadczenia, wybranej spośród przyczyn wskazanych w ust. 11 powyżej,
   6) oświadczenie o obniżeniu ceny wraz ze wskazaniem obniżonej ceny albo oświadczenie o odstąpieniu od Umowy.
14. Usługodawca zwraca Usługobiorcy kwoty należne wskutek skorzystania z prawa obniżenia ceny niezwłocznie, nie później niż w terminie 14 (czternastu) dni od dnia otrzymania oświadczenia. W przypadku odstąpienia od Umowy Usługodawca zwraca cenę w terminie 14 (czternastu) dni od dnia otrzymania oświadczenia, przy użyciu takiego samego sposobu zapłaty, jakiego użył Usługobiorca, chyba że Usługobiorca wyraźnie zgodził się na inny sposób zwrotu, który nie wiąże się dla niego z żadnymi kosztami.
15. Na podstawie art. 34 ust. 1a Ustawy o prawach konsumenta, w przypadku odstąpienia od Umowy Usługobiorca jest zobowiązany do zaprzestania korzystania z Usługi i udostępniania jej osobom trzecim.

## § 8. Prawo odstąpienia od Umowy – Konsumenci oraz Przedsiębiorcy na prawach Konsumenta

1. Postanowienia niniejszego paragrafu mają zastosowanie wyłącznie do Usługobiorców będących Konsumentami oraz Przedsiębiorcami na prawach Konsumenta.
2. Na podstawie art. 27 i n. Ustawy o prawach konsumenta Usługobiorca ma prawo odstąpić od Umowy bez podania jakiejkolwiek przyczyny w terminie 14 (czternastu) dni od dnia jej zawarcia.
3. Prawo odstąpienia od Umowy Usługobiorca wykonuje poprzez złożenie Usługodawcy oświadczenia o odstąpieniu od Umowy. Do zachowania terminu wystarczy wysłanie oświadczenia przed jego upływem.
4. Oświadczenie o odstąpieniu od Umowy może być złożone w jakiejkolwiek formie, w szczególności za pomocą poczty elektronicznej pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu albo na formularzu stanowiącym załącznik nr 2 do Ustawy o prawach konsumenta. Usługodawca niezwłocznie przesyła Usługobiorcy potwierdzenie otrzymania oświadczenia za pomocą poczty elektronicznej.
5. Usługodawca udostępnia dostęp do Usług Płatnych niezwłocznie po zawarciu Umowy, czyli **przed upływem terminu na odstąpienie od Umowy**. Wymaga to wyraźnej i uprzedniej zgody Usługobiorcy, wyrażanej przez zaznaczenie odrębnego checkboxa w procesie zakupu, wraz z przyjęciem do wiadomości skutków opisanych w ust. 6 i 7 poniżej.
6. **Odblokowanie Jednorazowe:** usługa zostaje wykonana w pełni z chwilą udostępnienia Usługobiorcy pełnego wyniku Dopasowania. Zgodnie z art. 38 ust. 1 pkt 1 Ustawy o prawach konsumenta, jeżeli Usługodawca wykonał usługę w pełni za wyraźną i uprzednią zgodą Usługobiorcy, który przed rozpoczęciem świadczenia został poinformowany, że po spełnieniu świadczenia utraci prawo odstąpienia od umowy, i przyjął to do wiadomości – **prawo odstąpienia od tej umowy nie przysługuje**.
7. **Subskrypcja:** prawo odstąpienia od Umowy Subskrypcji przysługuje Usługobiorcy przez pełne 14 (czternaście) dni od dnia jej zawarcia. Jeżeli na żądanie Usługobiorcy świadczenie Usług Płatnych rozpoczęło się przed upływem terminu na odstąpienie, Usługobiorca odstępujący od Umowy ma obowiązek zapłaty za świadczenia spełnione do chwili odstąpienia, w wysokości proporcjonalnej do zakresu spełnionego świadczenia (art. 35 Ustawy o prawach konsumenta). Pozostałą część Opłaty Subskrypcyjnej Usługodawca zwraca w terminie 14 (czternastu) dni od dnia otrzymania oświadczenia o odstąpieniu.
8. Odstąpienie od Umowy Subskrypcji albo od umowy, na podstawie której nastąpiło Odblokowanie Jednorazowe, nie powoduje usunięcia Konta ani Treści Usługobiorcy. Usunięcie Konta następuje wyłącznie na zasadach opisanych w § 4 ust. 14 Regulaminu.
9. Prawo odstąpienia od Umowy o Konto Usługobiorca może wykonać także przez samodzielne usunięcie Konta w ustawieniach Aplikacji.

## § 9. Reklamacje – Przedsiębiorcy

1. Postanowienia niniejszego paragrafu mają zastosowanie wyłącznie do Usługobiorców będących Przedsiębiorcami, z wyłączeniem Przedsiębiorców na prawach Konsumenta.
2. W przypadku ujawnienia niezgodności Usługi z Regulaminem Usługobiorca może złożyć reklamację.
3. Reklamacja składana jest pisemnie lub za pomocą poczty elektronicznej, pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu, nie później niż w terminie 30 dni od dnia ujawnienia niezgodności.
4. Reklamacja powinna zawierać:
   1) nazwę Usługobiorcy,
   2) adres poczty elektronicznej,
   3) opis ujawnionej niezgodności Usługi z Regulaminem.
5. Usługodawca może odmówić doprowadzenia Usługi do zgodności z Regulaminem, jeżeli jest to niemożliwe albo wymagałoby poniesienia przez Usługodawcę nadmiernych kosztów.
6. Po rozpatrzeniu reklamacji Usługodawca udziela Usługobiorcy odpowiedzi na reklamację, w której:
   1) uznaje reklamację oraz wskazuje planowany termin doprowadzenia Usługi do zgodności z Regulaminem,
   2) odmawia doprowadzenia Usługi do zgodności z Regulaminem z przyczyny wskazanej w ust. 5 powyżej, albo
   3) odrzuca reklamację z powodu jej bezzasadności.
7. Usługodawca udziela odpowiedzi na reklamację za pomocą poczty elektronicznej w terminie 21 (dwudziestu jeden) dni od dnia jej otrzymania. W przypadkach szczególnie skomplikowanych termin odpowiedzi na reklamację może ulec wydłużeniu do 30 dni kalendarzowych.
8. Odpowiedzialność Usługodawcy z tytułu rękojmi wobec Usługobiorców, o których mowa w ust. 1 powyżej, zostaje wyłączona.

## § 10. Treści Usługobiorcy i zgłaszanie treści niedozwolonych

1. Treści Usługobiorcy, w tym treść CV oraz treść ogłoszeń o pracę wprowadzanych do Aplikacji, są przechowywane na Koncie Usługobiorcy i **nie są publicznie dostępne**. Aplikacja nie udostępnia funkcji publikowania Treści Usługobiorcy ani udostępniania ich innym Użytkownikom.
2. Zabronione jest wprowadzanie do Aplikacji Treści Usługobiorcy:
   1) zawierających nieprawdziwe dane, sprzecznych z prawem, Regulaminem lub dobrymi obyczajami,
   2) służących prowadzeniu działań zabronionych przez prawo, nawołujących do przemocy, nienawiści lub znieważających jakąkolwiek grupę osób lub osobę,
   3) mogących naruszać dobra osobiste, prawa autorskie, prawo do wizerunku lub innego rodzaju prawa osób trzecich,
   4) obejmujących dane osobowe osób trzecich, jeżeli Usługobiorca nie dysponuje podstawą prawną do ich przetwarzania i powierzenia Usługodawcy.
3. Każda osoba (dalej: „Zgłaszający") jest uprawniona do zgłoszenia Usługodawcy Treści Usługobiorcy, którą uznaje za nielegalną lub naruszającą Regulamin. Zgłoszenia można dokonać za pomocą poczty elektronicznej, pod adres: ${FIRMA.email}.
4. Zgłoszenie powinno zawierać:
   1) wystarczająco uzasadnione wyjaśnienie powodów, dla których dana treść stanowi treść nielegalną lub narusza Regulamin,
   2) jasne wskazanie dokładnej elektronicznej lokalizacji informacji oraz, w stosownych przypadkach, dodatkowe informacje umożliwiające identyfikację treści,
   3) imię i nazwisko lub nazwę oraz adres e-mail Zgłaszającego, z wyjątkiem zgłoszenia dotyczącego informacji uznawanych za związane z jednym z przestępstw, o których mowa w art. 3–7 dyrektywy 2011/93/UE,
   4) oświadczenie potwierdzające powzięte w dobrej wierze przekonanie Zgłaszającego, że informacje i zarzuty w nim zawarte są prawidłowe i kompletne.
5. Po otrzymaniu zgłoszenia Usługodawca przesyła Zgłaszającemu potwierdzenie jego otrzymania na wskazany przez niego adres e-mail.
6. W przypadku, gdy zgłoszenie nie zawiera elementów wskazanych w ust. 4 powyżej lub zawiera błędy, Usługodawca może zwrócić się do Zgłaszającego z prośbą o jego uzupełnienie lub poprawienie w terminie 14 dni od dnia otrzymania prośby. W przypadku bezskutecznego upływu tego terminu Usługodawca może pozostawić zgłoszenie bez rozpoznania.
7. Usługodawca weryfikuje zgłoszoną treść w terminie 14 dni od dnia otrzymania kompletnego i prawidłowego zgłoszenia. Do czasu rozpoznania zgłoszenia Usługodawca może zablokować dostęp do zgłoszonej treści.
8. Po dokonaniu weryfikacji zgłoszenia Usługodawca odpowiednio usuwa zgłoszoną treść albo przywraca do niej dostęp, podając uzasadnienie swojej decyzji. O decyzji Usługodawca niezwłocznie powiadamia Zgłaszającego oraz Usługobiorcę, którego treść dotyczy.
9. Uzasadnienie decyzji Usługodawcy obejmuje:
   1) wskazanie, czy decyzja obejmuje usunięcie treści, zablokowanie dostępu do niej albo nałożenie innych środków, oraz – w stosownych przypadkach – zakres terytorialny decyzji i okres jej obowiązywania,
   2) fakty i okoliczności, na podstawie których podjęto decyzję, w tym informację, czy decyzję podjęto na podstawie zgłoszenia, czy na podstawie dobrowolnych czynności sprawdzających prowadzonych z inicjatywy Usługodawcy,
   3) informację na temat wykorzystania zautomatyzowanych środków podczas podejmowania decyzji,
   4) wskazanie podstawy prawnej lub umownej, na której opiera się decyzja, wraz z wyjaśnieniem powodów,
   5) jasne i przyjazne informacje na temat przysługujących możliwości odwołania się od decyzji.
10. Usługobiorca, którego treść została usunięta, oraz Zgłaszający, któremu Usługodawca odmówił usunięcia zgłoszonej treści, mogą złożyć odwołanie od decyzji Usługodawcy w terminie 6 miesięcy od dnia jej otrzymania:
   1) za pomocą poczty elektronicznej – na adres: ${FIRMA.email},
   2) na piśmie – na adres: ${ADRES}.
11. Odwołanie powinno zawierać imię i nazwisko lub nazwę odwołującego się, jego dane kontaktowe oraz szczegółowe uzasadnienie, dlaczego decyzja Usługodawcy jest w ocenie odwołującego się błędna.
12. Usługodawca niezwłocznie potwierdza otrzymanie odwołania. Odwołania są rozpatrywane w terminie 14 dni od dnia ich otrzymania, przez upoważnioną osobę – czynności te nie są dokonywane w sposób zautomatyzowany, bez udziału człowieka. O decyzji Usługodawca zawiadamia odwołującego się za pomocą poczty elektronicznej.
13. Usługodawca nie stosuje zautomatyzowanych narzędzi moderowania Treści Usługobiorcy. Weryfikacja treści następuje wyłącznie w następstwie zgłoszenia albo nakazu organu.
14. Usługodawca nie korzysta z Treści Usługobiorcy w celach promocyjnych ani marketingowych i nie nabywa do nich jakichkolwiek praw poza uprawnieniem do ich przetwarzania w zakresie niezbędnym do świadczenia Usług.

## § 11. Wykorzystanie sztucznej inteligencji (AI)

1. Usługodawca informuje, że Aplikacja wykorzystuje systemy sztucznej inteligencji:
   1) **model AI:** modele z rodziny Google Gemini, udostępniane przez Google Ireland Limited oraz Google LLC za pośrednictwem interfejsu programistycznego (API),
   2) **przeznaczenie:** analiza treści ogłoszenia o pracę i wyodrębnienie z niego wymagań pracodawcy; przeredagowanie wskazanych elementów CV; rozpoznanie struktury pliku CV wgranego przez Usługobiorcę przy imporcie,
   3) **kategoria ryzyka według rozporządzenia (UE) 2024/1689 (AI Act):** system AI podlegający obowiązkom przejrzystości, o których mowa w art. 50 AI Act. Aplikacja jest narzędziem redakcyjnym adresowanym do osoby przygotowującej własne dokumenty aplikacyjne, nie jest udostępniana pracodawcom ani rekruterom i nie służy do oceny, selekcji ani szeregowania kandydatów – nie stanowi zatem systemu wysokiego ryzyka w rozumieniu załącznika III pkt 4 AI Act. Usługodawca występuje w roli podmiotu stosującego system AI.
2. **Aplikacja nie tworzy treści CV.** System AI wyłącznie wybiera, porządkuje i przeformułowuje fakty podane przez Usługobiorcę. Zakres ingerencji jest ograniczony do podsumowania zawodowego, treści punktów opisujących doświadczenie i projekty oraz kolejności wymienionych umiejętności. **Dane twarde – nazwy pracodawców, stanowiska, okresy zatrudnienia, wykształcenie, poziomy znajomości języków oraz dane osobowe – nie są generowane przez system AI i są przenoszone z materiału wprowadzonego przez Usługobiorcę bez zmian.**
3. Usługodawca stosuje mechanizm kontrolny, który porównuje wynik działania systemu AI z materiałem wprowadzonym przez Usługobiorcę i odrzuca fragmenty zawierające informacje niemające w nim pokrycia. Mechanizm ten ogranicza ryzyko powstania treści nieprawdziwych, lecz go nie eliminuje.
4. Usługobiorca przyjmuje do wiadomości, że wyniki generowane przez system AI:
   1) mogą zawierać błędy, nieścisłości lub treści nieodpowiadające rzeczywistości,
   2) wymagają sprawdzenia przez Usługobiorcę przed ich wykorzystaniem,
   3) nie stanowią porady zawodowej, prawnej ani finansowej.
5. **Usługobiorca zobowiązuje się sprawdzić treść przygotowanego dokumentu przed wysłaniem go do pracodawcy** oraz nie polegać wyłącznie na wyniku działania systemu AI. Usługobiorca ponosi wyłączną odpowiedzialność za treść dokumentów, które składa w procesach rekrutacyjnych.
6. Dane wprowadzane do Aplikacji w zakresie niezbędnym do wykonania Dopasowania (treść CV oraz treść ogłoszenia) są przekazywane dostawcy modeli AI wskazanemu w ust. 1 pkt 1 powyżej. **Dane te nie są wykorzystywane do trenowania ani ulepszania modeli AI.** Szczegółowe informacje o przetwarzaniu danych osobowych w tym zakresie, w tym o przekazywaniu danych poza Europejski Obszar Gospodarczy, zawiera [Polityka prywatności](${SCIEZKI.politykaPrywatnosci}).
7. Usługobiorca nie powinien wprowadzać do Aplikacji danych, których ujawnienie dostawcy modeli AI byłoby dla niego niepożądane, w szczególności informacji objętych tajemnicą przedsiębiorstwa jego obecnego lub byłego pracodawcy oraz danych osobowych osób trzecich.
8. Prawa do treści powstałych w wyniku działania systemu AI przysługują Usługobiorcy w zakresie dopuszczalnym przez prawo. Usługobiorca przyjmuje do wiadomości, że:
   1) treści wygenerowane przez system AI mogą nie podlegać ochronie prawa autorskiego,
   2) podobne treści mogą zostać wygenerowane dla innych Użytkowników, a Usługodawca nie gwarantuje unikalności wyników.
9. W zakresie dozwolonym przez przepisy Kodeksu cywilnego oraz Ustawy o prawach konsumenta, Usługodawca nie ponosi odpowiedzialności za decyzje podjęte przez Usługobiorcę wyłącznie na podstawie wyników działania systemu AI, w tym za wynik procesu rekrutacyjnego.

## § 12. Odpowiedzialność

1. Usługodawca zobowiązuje się świadczyć Usługi z dochowaniem należytej staranności.
2. Usługodawca nie gwarantuje określonego poziomu wydajności, efektywności lub użyteczności Aplikacji w relacji do konkretnych potrzeb i zastosowań Usługobiorcy, ani osiągnięcia przez Usługobiorcę konkretnego rezultatu w procesie rekrutacyjnym.
3. Strony wyłączają odpowiedzialność Usługodawcy z tytułu utraconych korzyści Usługobiorcy będącego Przedsiębiorcą, z wyłączeniem Przedsiębiorców na prawach Konsumenta.
4. Usługodawca może ograniczyć, zmodyfikować lub wyłączyć określone funkcjonalności Aplikacji, jeżeli jest to niezbędne do zapewnienia zgodności z przepisami prawa, decyzjami organów nadzorczych lub wytycznymi regulatorów. Do zmian takich stosuje się § 16 Regulaminu.
5. W zakresie dozwolonym przez przepisy Kodeksu cywilnego oraz Ustawy o prawach konsumenta Usługodawca nie ponosi wobec Użytkowników odpowiedzialności za skutki:
   1) wykorzystywania przez Użytkowników usług lub funkcjonalności dostępnych w ramach Aplikacji niezgodnie z ich przeznaczeniem,
   2) podania przez Użytkowników nieprawidłowych lub nieprawdziwych danych,
   3) wykorzystania danych autoryzujących dostęp do Konta przez osoby trzecie, jeżeli osoby te weszły w ich posiadanie na skutek ujawnienia przez Użytkownika albo niedostatecznego zabezpieczenia przez Użytkownika przed dostępem takich osób.
6. W zakresie dozwolonym przez przepisy Kodeksu cywilnego oraz Ustawy o prawach konsumenta Usługodawca nie ponosi odpowiedzialności za zakłócenia w funkcjonowaniu Aplikacji wynikające z:
   1) działania siły wyższej, za którą uznaje się także niedostępność interfejsów programistycznych kluczowych dostawców zewnętrznych oraz zakaz stosowania konkretnych modeli AI wydany przez organy nadzorcze,
   2) prowadzonych w Aplikacji niezbędnych prac serwisowych,
   3) przyczyn leżących po stronie Użytkownika,
   4) innych przyczyn niezależnych od Usługodawcy, w szczególności działania osób trzecich, za które Usługodawca nie ponosi odpowiedzialności.
7. Usługodawca zobowiązuje się przeprowadzać prace, o których mowa w ust. 6 pkt 2 powyżej, w sposób możliwie najmniej uciążliwy dla Użytkowników oraz w miarę możliwości informować ich o planowanych pracach z wyprzedzeniem, a także na bieżąco usuwać zakłócenia w funkcjonowaniu Aplikacji.
8. Usługobiorca będący Przedsiębiorcą, z wyłączeniem Przedsiębiorców na prawach Konsumenta, zobowiązuje się zwolnić Usługodawcę z odpowiedzialności oraz pokryć szkody, koszty i roszczenia osób trzecich powstałe w związku z korzystaniem z Aplikacji niezgodnie z Regulaminem, z Treściami Usługobiorcy oraz z naruszeniem przepisów prawa przez Usługobiorcę, w tym koszty postępowań sądowych, administracyjnych oraz obsługi prawnej.

## § 13. Własność intelektualna Usługodawcy

1. Wszystkie elementy składowe Aplikacji, w szczególności jej nazwa, logo, szablony CV, zasady działania, elementy graficzne, interfejs, oprogramowanie, kod źródłowy oraz bazy danych, podlegają ochronie prawnej na podstawie przepisów ustawy z dnia 4 lutego 1994 r. o prawie autorskim i prawach pokrewnych, ustawy z dnia 30 czerwca 2000 r. – Prawo własności przemysłowej, ustawy z dnia 16 kwietnia 1993 r. o zwalczaniu nieuczciwej konkurencji oraz innych przepisów prawa powszechnie obowiązującego, w tym prawa Unii Europejskiej.
2. Usługodawca udziela Usługobiorcy niewyłącznej, niezbywalnej i nieprzenoszalnej licencji na korzystanie z Aplikacji wyłącznie w zakresie wynikającym z Regulaminu oraz z wybranego wariantu Subskrypcji.
3. Licencja nie obejmuje prawa do modyfikacji, kopiowania lub dekompilacji Aplikacji ani prawa do udostępniania Aplikacji osobom trzecim.
4. Zabrania się korzystania z Aplikacji w celu tworzenia produktów konkurencyjnych, prowadzenia testów porównawczych lub inżynierii wstecznej oraz obchodzenia limitów technicznych lub licencyjnych.
5. **Ustęp 1–4 powyżej nie dotyczą Treści Usługobiorcy ani dokumentów CV przygotowanych przez Usługobiorcę przy użyciu Aplikacji.** Usługobiorca zachowuje do nich wszelkie przysługujące mu prawa i może korzystać z nich bez ograniczeń, w tym w celach zarobkowych.
6. Usługodawca jest uprawniony do monitorowania sposobu korzystania z Aplikacji w zakresie niezbędnym do zapewnienia bezpieczeństwa, zapobiegania nadużyciom oraz egzekwowania Regulaminu. Monitorowanie nie obejmuje zapoznawania się z treścią CV Usługobiorców poza przypadkami rozpatrywania reklamacji, zgłoszeń, o których mowa w § 10 Regulaminu, albo wykonywania obowiązku wynikającego z przepisów prawa.
7. Naruszenie zasad, o których mowa w ust. 3 i 4 powyżej, uprawnia Usługodawcę do zawieszenia Konta lub rozwiązania Umowy bez zachowania okresu wypowiedzenia.

## § 14. Pozasądowe rozwiązywanie sporów – Konsumenci oraz Przedsiębiorcy na prawach Konsumenta

1. Postanowienia niniejszego paragrafu mają zastosowanie wyłącznie do Usługobiorców będących Konsumentami oraz Przedsiębiorcami na prawach Konsumenta.
2. Usługobiorca ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń.
3. Szczegółowe informacje dotyczące możliwości skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń oraz zasady dostępu do tych procedur dostępne są w siedzibach oraz na stronach internetowych:
   1) powiatowych (miejskich) rzeczników konsumentów oraz organizacji społecznych, do których zadań statutowych należy ochrona konsumentów,
   2) Wojewódzkich Inspektoratów Inspekcji Handlowej,
   3) Urzędu Ochrony Konkurencji i Konsumentów.

## § 15. Dane osobowe

1. Informacje o przetwarzaniu danych osobowych przez Usługodawcę znajdują się w [Polityce prywatności](${SCIEZKI.politykaPrywatnosci}).
2. W przypadku, gdy Usługobiorca będący Przedsiębiorcą wprowadza do Aplikacji dane osobowe osób trzecich, wobec których pozostaje administratorem danych, powierzenie ich przetwarzania Usługodawcy następuje na warunkach określonych w Umowie powierzenia przetwarzania danych osobowych, stanowiącej Załącznik nr 1 do Regulaminu. Załącznik nr 1 udostępniany jest przez Usługodawcę na żądanie zgłoszone na adres wskazany w § 1 ust. 5 pkt 1 Regulaminu.

## § 16. Zmiana Usługi – Konsumenci oraz Przedsiębiorcy na prawach Konsumenta

1. Postanowienia niniejszego paragrafu mają zastosowanie wyłącznie do Usługobiorców będących Konsumentami oraz Przedsiębiorcami na prawach Konsumenta.
2. Usługodawca może dokonać zmiany Usługi w przypadku:
   1) konieczności dostosowania Usługi do nowopowstających urządzeń lub oprogramowania używanych przez Użytkowników do korzystania z Usługi,
   2) podjęcia przez Usługodawcę decyzji o usprawnieniu Usługi poprzez dodanie nowych funkcjonalności lub modyfikację funkcjonalności dotychczasowych,
   3) zmiany dostawcy usług, z których Usługodawca korzysta w celu świadczenia Usługi, w tym dostawcy modeli AI,
   4) prawnego obowiązku dokonania zmian, w tym obowiązku dostosowania Usługi do aktualnego stanu prawnego.
3. Zmiana Usługi nie może wiązać się z jakimikolwiek kosztami po stronie Usługobiorcy.
4. Usługodawca informuje Usługobiorcę o dokonanej zmianie Usługi poprzez umieszczenie na Koncie komunikatu informującego o zmianach. Niezależnie, informacja o dokonanej zmianie może zostać przesłana Usługobiorcom za pomocą poczty elektronicznej.
5. Jeżeli zmiana Usługi będzie istotnie i negatywnie wpływała na dostęp do Usługi, Usługodawca zobowiązany jest poinformować Usługobiorcę o:
   1) właściwościach i terminie dokonania zmiany oraz
   2) prawie Usługobiorcy do wypowiedzenia Umowy ze skutkiem natychmiastowym w terminie 30 (trzydziestu) dni od dokonania zmiany.
6. Informację, o której mowa w ust. 5 powyżej, Usługodawca przesyła Usługobiorcy za pomocą poczty elektronicznej, nie później niż na 7 (siedem) dni przed dokonaniem zmiany.
7. Wypowiedzenie Umowy na podstawie ust. 5 pkt 2 powyżej następuje poprzez złożenie Usługodawcy oświadczenia o wypowiedzeniu Umowy, które może zostać wysłane za pomocą poczty elektronicznej pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu. Usługodawca zwraca Usługobiorcy Opłatę Subskrypcyjną w części przypadającej na niewykorzystany Okres Rozliczeniowy.

## § 17. Zmiana Regulaminu

1. Usługodawca może dokonać zmiany Regulaminu w przypadku:
   1) zmiany danych Usługodawcy,
   2) zmiany przedmiotu działalności Usługodawcy,
   3) rozpoczęcia dostarczania przez Usługodawcę nowych usług, modyfikacji usług dotychczas dostarczanych lub zaprzestania ich dostarczania,
   4) dokonania technicznej modyfikacji Aplikacji wymagającej dostosowania do niej postanowień Regulaminu,
   5) zmiany dostawców usług, z których Usługodawca korzysta w celu świadczenia Usług, w tym dostawcy modeli AI, operatora płatności lub dostawcy infrastruktury,
   6) prawnego obowiązku dokonania zmian, w tym obowiązku dostosowania Regulaminu do aktualnego stanu prawnego.
2. O zmianie Regulaminu Usługobiorca zostanie poinformowany poprzez opublikowanie jego zmienionej wersji w Aplikacji. Niezależnie, zmieniona wersja Regulaminu zostanie przesłana Usługobiorcy pocztą elektroniczną, nie później niż na 10 (dziesięć) dni przed dniem jej wejścia w życie.
3. Do Umów zawartych przed zmianą Regulaminu stosuje się postanowienia Regulaminu w brzmieniu obowiązującym w chwili ich zawarcia. Zmiana Regulaminu nie wpływa na wysokość Opłaty Subskrypcyjnej uzgodnionej dla trwającego Okresu Rozliczeniowego.
4. Usługobiorca, który nie zgadza się na zmianę Regulaminu, może wypowiedzieć Umowę ze skutkiem natychmiastowym w terminie 10 (dziesięciu) dni od dnia otrzymania informacji o zmianie Regulaminu. Brak wypowiedzenia w tym terminie uznaje się za zgodę na zmianę Regulaminu.
5. Wypowiedzenie Umowy następuje poprzez złożenie Usługodawcy oświadczenia o wypowiedzeniu, które może zostać wysłane za pomocą poczty elektronicznej pod adres wskazany w § 1 ust. 5 pkt 1 Regulaminu. Usługodawca zwraca Usługobiorcy Opłatę Subskrypcyjną w części przypadającej na niewykorzystany Okres Rozliczeniowy.

## § 18. Postanowienia końcowe

1. Aktualna wersja Regulaminu obowiązuje od dnia ${DATA_OBOWIAZYWANIA} r.
2. Usługodawca może przenieść prawa i obowiązki wynikające z Umowy na inny podmiot w ramach restrukturyzacji, sprzedaży przedsiębiorstwa lub jego zorganizowanej części. Przeniesienie nie może pogorszyć sytuacji Usługobiorcy będącego Konsumentem lub Przedsiębiorcą na prawach Konsumenta; o zamiarze przeniesienia Usługodawca informuje takich Usługobiorców za pomocą poczty elektronicznej z co najmniej 30-dniowym wyprzedzeniem, wraz z pouczeniem o prawie wypowiedzenia Umowy ze skutkiem natychmiastowym.
3. Jeżeli którekolwiek postanowienie Regulaminu okaże się nieważne, pozostałe zachowują pełną moc.
4. Brak egzekwowania postanowień Regulaminu nie stanowi zrzeczenia się prawa do ich późniejszego egzekwowania.
5. Regulamin podlega prawu polskiemu. Wybór prawa polskiego nie pozbawia Konsumenta ochrony wynikającej z bezwzględnie obowiązujących przepisów prawa państwa jego zwykłego pobytu, których nie można wyłączyć w drodze umowy.
6. Wszelkie spory na gruncie Regulaminu będą rozwiązywane w drodze polubownych negocjacji, a w razie ich bezskuteczności – przed sądem powszechnym. W sporach z Usługobiorcami będącymi Przedsiębiorcami, z wyłączeniem Przedsiębiorców na prawach Konsumenta, sądem właściwym jest sąd właściwy ze względu na miejsce wykonywania działalności gospodarczej przez Usługodawcę. W sporach z Konsumentami oraz Przedsiębiorcami na prawach Konsumenta właściwość sądu określają przepisy powszechnie obowiązującego prawa.
7. W przypadku udostępnienia Regulaminu w innych wersjach językowych, wersją wiążącą jest wersja polska.
8. W sprawach nieuregulowanych w Regulaminie zastosowanie znajdą przepisy powszechnie obowiązującego prawa polskiego.
`.trim();
