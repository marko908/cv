import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Liczby w CV: jak kwantyfikować, gdy nie masz danych",
      slug: "liczby-w-cv",
      zajawka:
        "Nie każda praca ma twarde wyniki, ale prawie każda ma skalę. Pięć źródeł liczby, gdy nikt nic nie mierzył, i określenia, które tylko udają konkret.",
      meta_tytul: "Liczby w CV: jak kwantyfikować bez twardych danych",
      meta_opis:
        "Jak wstawić liczby do CV, gdy nikt nie mierzył efektów Twojej pracy. Pięć źródeł konkretu, przykłady dla stanowisk bez metryk i czego nie zaokrąglać.",
      kategoria: "pisanie CV",
      tagi: ["cv", "osiągnięcia", "doświadczenie"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Notatnik z odręcznie wypisanymi liczbami do CV",
      faq: [
        {
          pytanie: "Co zrobić, gdy w mojej pracy nic nie było mierzone?",
          odpowiedz:
            "Opisz skalę zamiast wyniku: liczbę klientów, wielkość zespołu, częstotliwość zadania, zasięg terytorialny albo wielkość obsługiwanego budżetu. To dane, które znasz z codziennej pracy, nawet jeśli nikt ich nie raportował.",
        },
        {
          pytanie: "Czy mogę zaokrąglać liczby w CV?",
          odpowiedz:
            "Rozsądne zaokrąglenie jest w porządku, na przykład „ponad 200 zgłoszeń miesięcznie” zamiast 214. Nie zaokrąglaj w górę tak, żeby zmienić rząd wielkości, i nie podawaj liczby, której nie obronisz na rozmowie.",
        },
        {
          pytanie: "Ile liczb powinno być w CV?",
          odpowiedz:
            "Nie ma progu do wypełnienia. Sensowniej celować w to, żeby przy każdym stanowisku znalazł się przynajmniej jeden punkt z konkretem, niż upychać cyfry w każdej linii.",
        },
        {
          pytanie: "Czy procent bez punktu odniesienia coś daje?",
          odpowiedz:
            "Niewiele. „Wzrost o 30 procent” bez informacji, z czego na co i w jakim czasie, brzmi jak dane, ale niczego nie mówi. Dopisz bazę albo zamień procent na wartość bezwzględną.",
        },
      ],
      tresc: `<p>Blokada przy pisaniu CV brzmi zwykle tak: „u mnie nic nie było mierzone, nie mam czego wpisać”. Prawie zawsze jest nieprawdziwa, bo myli wynik ze skalą. Nawet jeśli nikt nie liczył efektów Twojej pracy, wiesz, ilu klientów obsługiwałeś, jak duży był zespół i jak często wykonywałeś dane zadanie. To też są liczby i działają.</p>

<h2>Dlaczego liczba działa mocniej niż przymiotnik</h2>
<p>Przymiotnik jest oceną, którą wystawiasz sam sobie. Liczba jest faktem, który da się sprawdzić i o który można dopytać na rozmowie. To druga rzecz jest tu ważniejsza: konkret zaprasza do rozmowy, ogólnik ją zamyka.</p>
<p>Porównaj „obsługiwałem dużą bazę klientów” z „obsługiwałem 180 klientów biznesowych w regionie południowym”. Pierwsze zdanie rekruter przeczyta i zapomni, bo nie wie, czy duża baza to pięćdziesiąt firm, czy pięć tysięcy. Drugie daje mu punkt odniesienia i podstawę do pytania.</p>
<p>Liczba pełni też funkcję porządkującą przy szybkim przeglądzie. Wzrok zatrzymuje się na cyfrach, więc punkt z konkretem zostaje przeczytany nawet wtedy, gdy reszta zostanie przejrzana pobieżnie.</p>

<h2>Pięć źródeł liczby, gdy nikt nic nie mierzył</h2>
<p>Jeśli nie masz wyniku, opisz kontekst pracy. Pięć kategorii poniżej pokrywa większość stanowisk.</p>
<table>
<thead><tr><th>Źródło</th><th>Pytanie, które sobie zadajesz</th><th>Przykład zapisu</th></tr></thead>
<tbody>
<tr><td>Skala</td><td>Ile sztuk, klientów, spraw, dokumentów?</td><td>Rozliczałem 60-80 faktur kosztowych tygodniowo</td></tr>
<tr><td>Częstotliwość</td><td>Jak często to robiłem?</td><td>Przygotowywałem raport zarządczy w cyklu miesięcznym przez 3 lata</td></tr>
<tr><td>Zespół</td><td>Z iloma osobami i w jakiej roli?</td><td>Koordynowałem pracę 7 osób w dwóch lokalizacjach</td></tr>
<tr><td>Budżet lub wartość</td><td>Jakiej wielkości środki albo kontrakty?</td><td>Odpowiadałem za budżet marketingowy 250 tys. zł rocznie</td></tr>
<tr><td>Czas</td><td>Ile trwało, jak szybko, w jakim terminie?</td><td>Wdrożyłem nowy proces przyjęć w 6 tygodni zamiast planowanych 3 miesięcy</td></tr>
</tbody>
</table>
<p>Zwróć uwagę, że żadna z tych liczb nie wymaga systemu raportowego. Wszystkie znasz z codziennej pracy, tylko nie przywykłeś traktować ich jako osiągnięcia.</p>

<div class="blog-cta-inline">
<p><strong>Najtrudniejsze jest przypomnienie sobie tych liczb na żądanie.</strong> Aplikando rozpoznaje punkty w Twoim CV, które opisują zadanie bez żadnego konkretu, i dopytuje o nie po kolei, cytując cały punkt. Twoja odpowiedź nie zastępuje oryginalnego zapisu, tylko zostaje z nim scalona, więc nic z dotychczasowej treści nie ginie.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Pięć kategorii źródeł liczby w CV jako pięć ikonowych kafelków w rzędzie, każdy z krótką polską etykietą: skala, częstotliwość, zespół, budżet, czas.">
  <img src="/blog/obrazki/liczby-w-cv-01.webp" alt="Pięć kategorii, z których można wyprowadzić liczbę do CV" width="800" height="450" loading="lazy" />
  <figcaption>Pięć miejsc, w których liczba czeka, nawet bez raportów</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing five square tiles arranged in a single row, flat vector illustration style, each tile containing a simple line icon and a Polish label below rendered clearly in a modern sans-serif font. The five Polish labels in order read "Skala", "Częstotliwość", "Zespół", "Budżet", "Czas". A short Polish heading above the row reads "Skąd wziąć liczbę". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Pięć kategorii, z których można wyprowadzić liczbę do CV". <strong>Podpis:</strong> "Pięć miejsc, w których liczba czeka, nawet bez raportów". Plik: <code>liczby-w-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Przykłady dla stanowisk bez twardych metryk</h2>
<p>Najczęściej pytają o to osoby z zawodów, w których sukcesu nie da się zapisać w tabeli. Kilka przykładów, jak to rozwiązać:</p>
<ul>
<li><strong>Nauczyciel:</strong> liczba grup i uczniów, liczba przygotowanych do egzaminu, liczba prowadzonych przedmiotów, lata pracy z danym rocznikiem.</li>
<li><strong>Pielęgniarka:</strong> liczba pacjentów na dyżurze, wielkość oddziału, liczba zabiegów danego typu, praca w systemie zmianowym.</li>
<li><strong>Asystentka zarządu:</strong> liczba osób, którym się asystuje, liczba organizowanych wyjazdów i spotkań miesięcznie, liczba obsługiwanych kalendarzy.</li>
<li><strong>Magazynier:</strong> liczba indeksów, liczba wydań dziennie, wielkość powierzchni magazynowej, obsługiwane systemy.</li>
<li><strong>Grafik:</strong> liczba projektów miesięcznie, liczba obsługiwanych marek, liczba kanałów, dla których przygotowujesz materiały.</li>
</ul>
<p>Żadna z tych liczb nie jest wynikiem w sensie biznesowym. Wszystkie mówią jednak rekruterowi, w jakiej skali pracowałeś, a to zwykle jest pytanie, na które faktycznie szuka odpowiedzi.</p>

<h2>Czego nie zaokrąglać i czego nie wymyślać</h2>
<p>Zasada jest jedna: każdą liczbę w CV musisz umieć obronić w rozmowie. Nie chodzi o pamiętanie jej co do jednego, tylko o to, żeby po pytaniu „skąd ta liczba?” nie zapadła cisza.</p>
<p>Bezpieczne zaokrąglenie to takie, które nie zmienia rzędu wielkości i nie idzie zawsze w Twoją stronę. „Około 200 zgłoszeń miesięcznie” przy realnych 214 jest w porządku. „Ponad 500” przy 214 nie jest.</p>
<p>Nie przenoś też cudzych wyników na siebie. Jeśli zespół obniżył koszty o 200 tys. zł, a Ty odpowiadałeś za jeden z pięciu obszarów, napisz o swoim udziale, nie o całości. Rekruterzy sprawdzają takie rzeczy pytaniem o szczegóły, a rozbieżność między CV a odpowiedzią kosztuje więcej niż skromniejsza liczba.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Odręczne notatki w notesie z wypisanymi liczbami i punktami, obok laptop z otwartym dokumentem. Etap zbierania danych przed przepisaniem CV.">
  <img src="/blog/obrazki/liczby-w-cv-02.webp" alt="Odręczna lista liczb przygotowana przed poprawą CV" width="800" height="450" loading="lazy" />
  <figcaption>Zanim przepiszesz punkty, wypisz liczby, które pamiętasz</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of an open paper notebook on a desk filled with handwritten notes and numbers, a pen lying across the page, a laptop open and slightly out of focus in the background, soft natural daylight, shallow depth of field, warm neutral tones, no visible readable text or logos, thoughtful preparation mood, shot on a 50mm lens. <strong>Alt:</strong> "Odręczna lista liczb przygotowana przed poprawą CV". <strong>Podpis:</strong> "Zanim przepiszesz punkty, wypisz liczby, które pamiętasz". Plik: <code>liczby-w-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Skąd wziąć dane, których już nie pamiętasz</h2>
<p>Przy pracy sprzed kilku lat liczby rozmywają się w pamięci. Nie zgaduj i nie wpisuj wartości „mniej więcej takiej”, jeśli nie masz jak jej sprawdzić.</p>
<p>Trzy miejsca, w których dane zwykle wciąż są: stare raporty i podsumowania roczne, jeśli masz do nich dostęp; korespondencja mailowa z okresu, w którym coś rozliczałeś; oraz ogłoszenie o pracę na Twoje własne stanowisko, jeśli firma je publikowała, bo często podaje wielkość zespołu albo skalę działania. Jeśli nic z tego nie zadziała, opisz zakres słowami zamiast wstawiać liczbę na wyczucie.</p>

<h2>Określenia, które tylko udają konkret</h2>
<p>Część zwrotów wygląda jak dane, choć nimi nie jest. Pojawiają się w CV najczęściej wtedy, gdy ktoś wie, że powinien podać liczbę, ale jej nie ma.</p>
<table>
<thead><tr><th>Pozorny konkret</th><th>Dlaczego nie działa</th></tr></thead>
<tbody>
<tr><td>Duże budżety</td><td>Duży dla firmy dziesięcioosobowej i dla korporacji to dwa różne rzędy wielkości</td></tr>
<tr><td>Liczne projekty</td><td>Nie wiadomo, czy trzy, czy trzydzieści, ani jak długie</td></tr>
<tr><td>Znaczący wzrost sprzedaży</td><td>Brak bazy i okresu; wzrost o 2 procent też bywa nazywany znaczącym</td></tr>
<tr><td>Wieloletnie doświadczenie</td><td>Trzy lata to już wiele lat, dwanaście też; wystarczy podać liczbę</td></tr>
<tr><td>Wzrost o 40 procent</td><td>Bez punktu wyjścia i horyzontu czasowego to sama cyfra bez treści</td></tr>
</tbody>
</table>
<p>Naprawa jest zwykle prosta: dopisz bazę i okres albo zamień procent na wartość bezwzględną. Jeśli nie da się ani jednego, ani drugiego, lepiej opisać zakres pracy słowami, niż zostawiać liczbę, której nikt nie umie zinterpretować.</p>
<p>Same liczby nie wystarczą, jeśli punkt nadal opisuje zakres obowiązków, a nie działanie. Sposób budowania takich punktów opisuje tekst o tym, <a href="/blog/jak-opisac-doswiadczenie-w-cv">jak opisać doświadczenie w CV</a>. Warto też sprawdzić, czy najważniejsza liczba wybrzmiewa już w <a href="/blog/podsumowanie-zawodowe-cv">podsumowaniu zawodowym</a>, bo to je rekruter czyta jako pierwsze.</p>`,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("Błąd:", error.message);
    process.exit(1);
  }
  console.log("Zapisano szkic:", data.id, data.slug);
}

wstaw();
