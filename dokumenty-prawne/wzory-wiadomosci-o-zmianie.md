# Wzory wiadomości do klienta

Dwie rodziny wzorów:

- **Wzory 1–3 — zmiana dokumentów i cennika.** Do użycia, gdy zmienisz ceny,
  dodasz funkcję, zmienisz dostawcę modeli AI albo operatora płatności.
- **Wzory 4–13 — obsługa ręczna.** Wywołuje je pismo od klienta albo Twoja
  decyzja, więc kod ich nie przewidzi. **Regulamin nakłada za nie terminy** —
  dlatego są tutaj gotowe, a nie pisane pod presją, gdy termin już biegnie.

Maile wysyłane automatycznie przez aplikację (powitanie, potwierdzenia zakupu,
nieudana płatność, rezygnacja, przyjęcie zgłoszenia, usunięcie konta) **nie są
tutaj** — ich treść żyje w kodzie, w `src/lib/maile/tresci.ts`, bo musi się
zmieniać razem z aplikacją.

Wszystkie wzory pisz w oprawie zgodnej z mailami aplikacji: zwracamy się na
„Ty", bez korporacyjnego dystansu, ale i bez spoufalania. Zawsze podaj konkret
(datę, kwotę, termin), nigdy samo „dostosowanie do przepisów".

## Zanim wyślesz — procedura

1. **Podnieś `WERSJA_DOKUMENTOW` i ustaw nową `DATA_OBOWIAZYWANIA`**
   w `src/lib/prawne/dane.ts`.
2. **Wpisz konkretnie, co się zmienia.** Nie „dostosowanie do przepisów", tylko
   „Dodaliśmy płatność BLIK" albo „Zmieniliśmy dostawcę modeli AI z X na Y".
   Instrukcja prawnika (Krok „Ważne na przyszłość") jest tu jednoznaczna.
3. **Wyślij z wyprzedzeniem wynikającym z dokumentu:**
   - regulamin aplikacji — **10 dni** przed wejściem w życie (§ 17 ust. 2),
   - regulamin newslettera — przed wejściem w życie, użytkownik ma **7 dni**
     na wypowiedzenie (§ 9 ust. 3),
   - zmiana ceny aktywnej Subskrypcji — **30 dni** (§ 6 ust. 5).
4. **Załącz PDF** z nową wersją dokumentu. Sama informacja o zmianie nie
   wystarcza — użytkownik ma dostać treść na trwałym nośniku.
5. **Wyślij do wszystkich naraz**, a nie partiami — terminy na wypowiedzenie
   liczą się od dnia otrzymania wiadomości.

---

## Wzór 1 — użytkownicy aplikacji

**Temat:** Aktualizacja regulaminu i polityki prywatności Aplikando

**Treść:**

> Cześć!
>
> Informujemy o aktualizacji [Regulaminu](https://aplikando.pl/regulamin)
> i [Polityki prywatności](https://aplikando.pl/polityka-prywatnosci) aplikacji Aplikando.
>
> **Co się zmienia:**
>
> - [KONKRETNA ZMIANA 1 — np. „Dodaliśmy płatność BLIK"]
> - [KONKRETNA ZMIANA 2 — np. „Zmieniliśmy dostawcę modeli AI na …"]
>
> Zmiany wchodzą w życie **[DATA]**. Pełną treść nowego regulaminu i polityki
> prywatności znajdziesz w załączniku do tej wiadomości.
>
> **Czy muszę coś zrobić?**
>
> Jeżeli zgadzasz się na zmianę — nie musisz robić nic.
>
> Jeżeli nowe zapisy budzą Twoje zastrzeżenia, możesz wypowiedzieć umowę
> ze skutkiem natychmiastowym w ciągu **10 dni** od otrzymania tej wiadomości —
> wystarczy usunąć konto w ustawieniach aplikacji albo napisać do nas na adres
> poniżej. Wówczas nowe zapisy nie będą Cię dotyczyły, a niewykorzystaną część
> opłaty za subskrypcję zwrócimy.
>
> Niezależnie od tego możesz usunąć konto w każdej chwili — również po upływie
> tego terminu.
>
> **Gdzie uzyskam pomoc?**
>
> Napisz do nas: marko@aplikando.pl
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 2 — subskrybenci newslettera

**Temat:** Aktualizacja regulaminu newslettera i polityki prywatności

**Treść:**

> Cześć!
>
> Informujemy o aktualizacji
> [Regulaminu newslettera](https://aplikando.pl/regulamin-newslettera)
> i [Polityki prywatności](https://aplikando.pl/polityka-prywatnosci).
>
> **Co się zmienia:**
>
> - [KONKRETNA ZMIANA 1]
> - [KONKRETNA ZMIANA 2]
>
> Zmiany wchodzą w życie **[DATA]**. Pełną treść nowego regulaminu i polityki
> prywatności znajdziesz w załączniku do tej wiadomości.
>
> **Czy muszę coś zrobić?**
>
> Jeżeli zgadzasz się na zmianę — nie musisz robić nic.
>
> Jeżeli nowe zapisy budzą Twoje zastrzeżenia, możesz zrezygnować z newslettera
> w ciągu **7 dni** od otrzymania tej wiadomości — wystarczy kliknąć link
> rezygnacji na dole tego maila. Wówczas nowe zapisy nie będą Cię dotyczyły.
>
> Niezależnie od tego możesz zrezygnować w każdej chwili — również po upływie
> tego terminu. Rezygnacja z newslettera nie usuwa Twojego konta w aplikacji.
>
> **Gdzie uzyskam pomoc?**
>
> Napisz do nas: marko@aplikando.pl
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 3 — zmiana ceny aktywnej subskrypcji (30 dni)

**Temat:** Zmiana ceny subskrypcji Aplikando od [DATA]

**Treść:**

> Cześć!
>
> Od **[DATA]** zmienia się cena Twojego planu **[NAZWA PLANU]**:
> z **[STARA CENA] zł** na **[NOWA CENA] zł** za [okres rozliczeniowy].
> Podane kwoty są cenami brutto i zawierają podatek VAT.
>
> Nowa cena zacznie obowiązywać od pierwszego okresu rozliczeniowego
> rozpoczynającego się po tej dacie. Za bieżący, już opłacony okres nic nie
> dopłacasz.
>
> **Jeśli nie akceptujesz zmiany** — zrezygnuj z automatycznego odnowienia
> subskrypcji w panelu zarządzania płatnościami (ustawienia konta → zarządzaj
> subskrypcją). Zachowasz dostęp do końca opłaconego okresu, a subskrypcja
> po prostu się nie odnowi. Twoje CV i historia dopasowań zostają na koncie.
>
> Masz pytania? Napisz: marko@aplikando.pl
>
> Pozdrawiamy,
> Aplikando

---

# Wzory obsługi ręcznej

## Wzór 4 — potwierdzenie otrzymania oświadczenia o odstąpieniu

**Kiedy:** klient przysłał oświadczenie o odstąpieniu od umowy.
**Termin: niezwłocznie** (Regulamin § 8 ust. 4 — potwierdzenie jest obowiązkowe,
niezależnie od tego, czy odstąpienie uznasz za skuteczne).
**Temat:** Potwierdzenie otrzymania oświadczenia o odstąpieniu od umowy

> Cześć!
>
> Potwierdzamy, że **[DATA OTRZYMANIA]** otrzymaliśmy Twoje oświadczenie
> o odstąpieniu od umowy: **[SUBSKRYPCJA (PLAN, OKRES) / ODBLOKOWANIE
> JEDNORAZOWE]**, zawartej **[DATA ZAWARCIA]**.
>
> **Co dalej:** [WYBIERZ JEDEN AKAPIT]
>
> *(subskrypcja)* Zwrot opłaty wykonamy w ciągu 14 dni od dziś, tą samą metodą
> płatności, której użyłeś/-aś przy zakupie. Jeżeli w okresie od zawarcia umowy
> korzystałeś/-aś z płatnych funkcji, opłata zostanie pomniejszona
> proporcjonalnie do zakresu wykonanej usługi (art. 35 ustawy o prawach
> konsumenta). Kwotę zwrotu podamy w osobnej wiadomości.
>
> *(odblokowanie jednorazowe — usługa wykonana)* Przy zakupie wyraziłeś/-aś
> zgodę na rozpoczęcie świadczenia usługi przed upływem terminu na odstąpienie
> i przyjąłeś/-ęłaś do wiadomości, że po jej pełnym wykonaniu prawo odstąpienia
> nie przysługuje. Pełny wynik Dopasowania został udostępniony **[DATA]**, więc
> zgodnie z art. 38 ust. 1 pkt 1 ustawy o prawach konsumenta prawo odstąpienia
> od tej umowy wygasło. Jeżeli powodem Twojego pisma jest wada albo błąd
> w działaniu usługi, potraktujemy je jako reklamację — napisz nam, na czym
> problem polegał, a odpowiemy w ciągu 14 dni.
>
> Odstąpienie nie usuwa konta ani Twoich CV — konto usuwa się osobno,
> w ustawieniach aplikacji.
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 5 — odpowiedź na reklamację (Konsument / Przedsiębiorca na prawach Konsumenta)

**Termin: 14 dni** od otrzymania (Regulamin § 7 ust. 9). Odpowiedź musi wskazać
JEDNO z trzech rozstrzygnięć z § 7 ust. 8 — uznanie, odmowę albo odrzucenie.
**Temat:** Odpowiedź na reklamację z dnia [DATA]

> Cześć!
>
> Dotyczy reklamacji zgłoszonej **[DATA ZGŁOSZENIA]**, w sprawie: **[KRÓTKI OPIS]**.
>
> **Rozstrzygnięcie:** [WYBIERZ JEDEN]
>
> *(uznanie)* Uznajemy reklamację. Doprowadzimy usługę do zgodności z umową
> do **[TERMIN]**. [CO KONKRETNIE ZROBIMY]
>
> *(odmowa doprowadzenia do zgodności)* Nie możemy doprowadzić usługi do
> zgodności z umową, ponieważ [jest to niemożliwe / wymagałoby nadmiernych
> kosztów]: **[UZASADNIENIE]**. Podstawa: Regulamin § 7 ust. 7.
>
> *(odrzucenie)* Reklamacja jest bezzasadna: **[UZASADNIENIE — konkretnie,
> co sprawdziliśmy i co ustaliliśmy]**.
>
> **Twoje dalsze uprawnienia.** Jeżeli nie zgadzasz się z naszym stanowiskiem
> albo niezgodność występuje nadal, możesz złożyć oświadczenie o obniżeniu ceny
> albo o odstąpieniu od umowy na zasadach z § 7 ust. 11–13 Regulaminu. Możesz
> też skorzystać z pozasądowych sposobów rozpatrywania sporów — informacje
> udostępniają powiatowi (miejscy) rzecznicy konsumentów, Wojewódzkie
> Inspektoraty Inspekcji Handlowej oraz UOKiK (Regulamin § 14).
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 6 — odpowiedź na reklamację (Przedsiębiorca)

**Termin: 21 dni**, w sprawach szczególnie skomplikowanych do 30 dni
(Regulamin § 9 ust. 7). Jeżeli korzystasz z wydłużenia — napisz o tym przed
upływem 21 dni, nie po.
**Temat:** Odpowiedź na reklamację z dnia [DATA]

> Dzień dobry,
>
> dotyczy reklamacji zgłoszonej **[DATA]** przez **[NAZWA]**, w sprawie:
> **[OPIS]**.
>
> **Rozstrzygnięcie:** [uznanie z terminem naprawy / odmowa doprowadzenia do
> zgodności z uzasadnieniem / odrzucenie jako bezzasadnej].
>
> **[UZASADNIENIE]**
>
> Przypominamy, że zgodnie z § 9 ust. 8 Regulaminu odpowiedzialność z tytułu
> rękojmi wobec Usługobiorców będących Przedsiębiorcami jest wyłączona.
>
> Pozdrawiamy,
> Aplikando

**Wariant — przedłużenie terminu:**

> Dzień dobry,
>
> sprawa wymaga dodatkowych ustaleń [KRÓTKO JAKICH]. Zgodnie z § 9 ust. 7
> Regulaminu odpowiedzi udzielimy najpóźniej **[DATA — nie później niż 30 dni
> od zgłoszenia]**.

---

## Wzór 7 — potwierdzenie zgłoszenia treści nielegalnej (DSA)

**Termin: niezwłocznie** (Regulamin § 10 ust. 5). Dotyczy zgłoszeń na
marko@aplikando.pl, nie formularza „Zgłoś błąd" (ten ma potwierdzenie
automatyczne).
**Temat:** Potwierdzenie otrzymania zgłoszenia

> Dzień dobry,
>
> potwierdzamy otrzymanie **[DATA]** zgłoszenia dotyczącego treści, którą
> uznajesz za nielegalną lub naruszającą Regulamin.
>
> Zgłoszenie rozpoznamy w terminie **14 dni** od otrzymania kompletnego
> zgłoszenia (Regulamin § 10 ust. 7). O decyzji wraz z uzasadnieniem
> poinformujemy Cię na ten adres e-mail.
>
> Informujemy, że przy rozpoznawaniu zgłoszeń **nie stosujemy zautomatyzowanych
> narzędzi moderowania** — decyzję podejmuje człowiek (Regulamin § 10 ust. 13).
>
> Pozdrawiamy,
> Aplikando

**Wariant — zgłoszenie niekompletne** (§ 10 ust. 6, termin 14 dni na uzupełnienie):

> Żeby rozpoznać zgłoszenie, potrzebujemy jeszcze: **[CZEGO — z listy w § 10
> ust. 4]**. Prosimy o uzupełnienie w ciągu **14 dni**. Po bezskutecznym upływie
> tego terminu zgłoszenie możemy pozostawić bez rozpoznania.

---

## Wzór 8 — decyzja o zgłoszonej treści

**Termin: 14 dni** od kompletnego zgłoszenia. **Wysyłasz do DWÓCH stron** —
Zgłaszającego oraz Usługobiorcy, którego treść dotyczy (§ 10 ust. 8).
Uzasadnienie musi zawierać **wszystkie pięć elementów** z § 10 ust. 9 — poniższe
śródtytuły odpowiadają im po kolei, nie usuwaj żadnego.
**Temat:** Decyzja w sprawie zgłoszonej treści

> Dzień dobry,
>
> w sprawie zgłoszenia z **[DATA]** podjęliśmy następującą decyzję.
>
> **1. Rozstrzygnięcie:** [usunięcie treści / zablokowanie dostępu do treści /
> przywrócenie dostępu / brak działań]. Zakres terytorialny: **[np. wszystkie
> kraje]**. Okres obowiązywania: **[np. bezterminowo]**.
>
> **2. Ustalenia:** **[FAKTY I OKOLICZNOŚCI]**. Decyzję podjęliśmy
> [na podstawie zgłoszenia / w wyniku własnych czynności sprawdzających].
>
> **3. Środki zautomatyzowane:** przy podejmowaniu tej decyzji **nie
> korzystaliśmy** ze środków zautomatyzowanych — sprawę rozpoznał człowiek.
>
> **4. Podstawa:** **[przepis prawa / postanowienie Regulaminu, np. § 10 ust. 2
> pkt X]**, ponieważ **[WYJAŚNIENIE]**.
>
> **5. Odwołanie:** od tej decyzji możesz odwołać się w terminie **6 miesięcy**
> od jej otrzymania, pisząc na marko@aplikando.pl. Odwołanie powinno zawierać
> Twoje imię i nazwisko lub nazwę, dane kontaktowe oraz szczegółowe
> uzasadnienie, dlaczego uważasz decyzję za błędną. Odwołanie rozpozna
> upoważniona osoba, w terminie 14 dni, bez udziału środków zautomatyzowanych.
> Niezależnie od tego przysługuje Ci droga sądowa.
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 9 — potwierdzenie i rozpoznanie odwołania

**Termin: potwierdzenie niezwłocznie, rozpoznanie 14 dni** (§ 10 ust. 12).
**Temat:** Potwierdzenie otrzymania odwołania / Decyzja w sprawie odwołania

> Dzień dobry,
>
> potwierdzamy otrzymanie **[DATA]** odwołania od naszej decyzji z **[DATA
> DECYZJI]**. Odwołanie rozpozna upoważniona osoba w terminie **14 dni**.
> Czynności te nie są dokonywane w sposób zautomatyzowany.
>
> Pozdrawiamy,
> Aplikando

**Rozpoznanie:**

> Po ponownym rozpatrzeniu sprawy **[utrzymujemy naszą decyzję z DATA /
> zmieniamy decyzję i CO ROBIMY]**.
>
> **Uzasadnienie:** **[CO SPRAWDZILIŚMY PONOWNIE I DO JAKICH WNIOSKÓW DOSZLIŚMY]**
>
> Niezależnie od naszego rozstrzygnięcia przysługuje Ci droga sądowa.

---

## Wzór 10 — wypowiedzenie umowy za naruszenie Regulaminu

**Uwaga na kolejność.** § 4 ust. 16 pozwala wypowiedzieć umowę dopiero, gdy
klient **nie usunął naruszenia mimo wezwania**. Wezwanie musi więc pójść
pierwsze — wypowiedzenie bez niego jest bezskuteczne. Okres wypowiedzenia:
**7 dni**. Niewykorzystaną część opłaty subskrypcyjnej **zwracasz**, chyba że
powodem było naruszenie § 13 ust. 4 (produkt konkurencyjny, inżynieria wsteczna,
obchodzenie limitów).

**Krok 1 — wezwanie. Temat:** Wezwanie do zaprzestania naruszeń Regulaminu

> Dzień dobry,
>
> stwierdziliśmy korzystanie z aplikacji Aplikando w sposób naruszający
> Regulamin: **[KONKRETNY OPIS + PARAGRAF]**.
>
> Wzywamy do zaprzestania naruszenia w terminie **[TERMIN, np. 7 dni]** od
> otrzymania tej wiadomości. Po bezskutecznym upływie tego terminu możemy
> wypowiedzieć umowę zgodnie z § 4 ust. 16 Regulaminu.
>
> Jeżeli uważasz, że doszło do pomyłki — odpisz na tę wiadomość.

**Krok 2 — wypowiedzenie. Temat:** Wypowiedzenie umowy

> Dzień dobry,
>
> mimo wezwania z **[DATA]** naruszenie nie zostało usunięte. Na podstawie § 4
> ust. 16 Regulaminu wypowiadamy umowę z zachowaniem **7-dniowego** okresu
> wypowiedzenia. Umowa rozwiąże się **[DATA]**, a po tym dniu wstrzymamy
> dostarczanie usługi. [JEŚLI DOTYCZY: Do tego czasu dostęp pozostaje
> zablokowany, co jest niezbędne, by zapobiec dalszym naruszeniom.]
>
> **Twoje dane:** zalecamy pobranie kopii CV przed tą datą — każde CV pobierzesz
> w PDF bezpośrednio z aplikacji. Na żądanie wysłane na marko@aplikando.pl
> nieodpłatnie udostępnimy komplet Twoich danych w formacie JSON.
>
> **[JEŚLI SUBSKRYPCJA I NARUSZENIE INNE NIŻ § 13 UST. 4:]** Niewykorzystaną
> część opłaty subskrypcyjnej (**[KWOTA]**) zwrócimy w ciągu 14 dni.
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 11 — istotna, negatywna zmiana usługi

**Kiedy:** zmiana **istotnie i negatywnie** wpływa na dostęp do usługi (§ 16
ust. 5). Zwykłe usprawnienia i nowe funkcje tego nie wymagają — wystarczy
komunikat na koncie (§ 16 ust. 4).
**Termin: najpóźniej 7 dni przed** wprowadzeniem zmiany (§ 16 ust. 6).
**Temat:** Ważna zmiana w działaniu Aplikando od [DATA]

> Cześć!
>
> Od **[DATA]** zmieniamy sposób działania aplikacji:
>
> - **[NA CZYM POLEGA ZMIANA — konkretnie, co przestanie działać lub zadziała
>   inaczej]**
>
> Powód: **[np. zmiana dostawcy modeli AI / obowiązek prawny]**.
>
> **Zmiana nic Cię nie kosztuje** — nie wiąże się z żadną dopłatą.
>
> **Jeśli zmiana Ci nie odpowiada**, możesz wypowiedzieć umowę ze skutkiem
> natychmiastowym w terminie **30 dni od jej wprowadzenia** — wystarczy napisać
> na marko@aplikando.pl. Niewykorzystaną część opłaty subskrypcyjnej zwrócimy.
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 12 — przeniesienie praw i obowiązków z umowy

**Kiedy:** sprzedaż przedsiębiorstwa lub jego zorganizowanej części,
restrukturyzacja. **Termin: 30 dni przed** (§ 18 ust. 2). Obowiązkowo z
pouczeniem o prawie wypowiedzenia.
**Temat:** Zmiana podmiotu prowadzącego Aplikando od [DATA]

> Cześć!
>
> Informujemy, że od **[DATA]** prawa i obowiązki wynikające z Twojej umowy
> przejmie **[PEŁNE OZNACZENIE PODMIOTU: nazwa, adres, NIP, KRS/CEIDG]**.
>
> **Dla Ciebie nie zmienia się nic** poza podmiotem, z którym masz umowę: cena,
> zakres usługi, Twoje CV i historia dopasowań pozostają bez zmian. Przeniesienie
> nie może pogorszyć Twojej sytuacji.
>
> **Jeśli nie chcesz kontynuować umowy z nowym podmiotem**, możesz ją wypowiedzieć
> ze skutkiem natychmiastowym — napisz na marko@aplikando.pl. Niewykorzystaną
> część opłaty subskrypcyjnej zwrócimy.
>
> Informacja o przetwarzaniu danych osobowych po przejęciu: **[LINK / OPIS]**.
>
> Pozdrawiamy,
> Aplikando

---

## Wzór 13 — eksport danych na żądanie

**Termin: niezwłocznie, najpóźniej 30 dni** (§ 4 ust. 18, RODO art. 20).
Dane generuje RPC `eksportuj_moje_dane` w Supabase.
**Temat:** Twoje dane z Aplikando

> Cześć!
>
> W załączniku znajdziesz komplet Twoich danych z aplikacji Aplikando
> w formacie JSON: zapisane CV, historię dopasowań i dane konta. Format nadaje
> się do odczytu maszynowego i możesz przenieść go do innej usługi.
>
> Niezależnie od tego każde CV pobierzesz w pliku PDF bezpośrednio z aplikacji.
>
> **[JEŚLI ŻĄDANIE ŁĄCZYŁO SIĘ Z USUNIĘCIEM KONTA:]** Konto usuniemy dopiero po
> potwierdzeniu przez Ciebie, że plik dotarł i daje się otworzyć — usunięcia nie
> da się cofnąć, a kopii archiwalnych nie tworzymy.
>
> Pozdrawiamy,
> Aplikando
