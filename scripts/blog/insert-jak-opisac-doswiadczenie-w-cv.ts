import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Jak opisać doświadczenie w CV: osiągnięcia, nie obowiązki",
      slug: "jak-opisac-doswiadczenie-w-cv",
      zajawka:
        "Lista obowiązków brzmi jak zakres stanowiska, nie jak Twoja praca. Wzór na punkt z efektem, osiem przykładów przed i po oraz mocne czasowniki.",
      meta_tytul: "Jak opisać doświadczenie w CV: osiągnięcia zamiast zadań",
      meta_opis:
        "Jak opisać doświadczenie w CV, żeby nie brzmiało jak zakres obowiązków. Wzór na punkt z efektem, przykłady przed i po, lista mocnych czasowników.",
      kategoria: "pisanie CV",
      tagi: ["cv", "doświadczenie", "osiągnięcia"],
      czas_czytania_min: 8,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Sekcja doświadczenia w CV z punktowanym opisem stanowiska",
      faq: [
        {
          pytanie: "Ile punktów opisać przy jednym stanowisku?",
          odpowiedz:
            "Od trzech do pięciu przy ostatnim i najważniejszym stanowisku, dwa lub trzy przy wcześniejszych. Starsze niż dziesięć lat możesz skrócić do jednej linii albo pominąć, jeśli nie łączą się z tym, o co się starasz.",
        },
        {
          pytanie: "Co zrobić, gdy nie znam żadnych liczb ze swojej pracy?",
          odpowiedz:
            "Poszukaj skali zamiast wyniku: wielkość zespołu, liczba obsługiwanych klientów, częstotliwość zadania, zakres terytorialny. To też są dane i mówią więcej niż przymiotnik.",
        },
        {
          pytanie: "Czy pisać w pierwszej osobie?",
          odpowiedz:
            "W CV punkty zaczyna się czasownikiem, bez zaimka: „Wdrożyłem", nie „Ja wdrożyłem". Trzymaj jedną formę w obrębie stanowiska, najlepiej dokonaną, bo opisujesz rzeczy zakończone.",
        },
        {
          pytanie: "Czy przepisywać obowiązki z ogłoszenia, na które aplikuję?",
          odpowiedz:
            "Nie. Możesz użyć nazewnictwa z ogłoszenia dla tych samych czynności, które faktycznie wykonywałeś, ale przepisanie cudzego zakresu obowiązków tworzy CV opisujące pracę, której nie było.",
        },
      ],
      tresc: `<p>Najczęstszy problem z sekcją doświadczenia jest taki, że opisuje stanowisko, a nie osobę, która je zajmowała. „Byłem odpowiedzialny za obsługę klienta" mógłby napisać każdy, kto siedział na tym krześle przez ostatnie dziesięć lat. Poniżej wzór na punkt, który mówi coś o Tobie, osiem przykładów przed i po oraz lista czasowników, od których warto zaczynać.</p>

<h2>Dlaczego „byłem odpowiedzialny za" nic nie mówi</h2>
<p>Zwrot opisuje przydzielone zadanie, nie jego wykonanie. Rekruter dowiaduje się z niego, jaki był zakres stanowiska, co zwykle wie już z nazwy roli. Nie dowiaduje się, czy robiłeś to dobrze, na jaką skalę i co się dzięki temu zmieniło.</p>
<p>Druga słabość jest praktyczna: takie punkty są nierozróżnialne. Jeśli dziesięciu kandydatów na to samo stanowisko przepisze swój zakres obowiązków, dostaniesz dziesięć niemal identycznych CV. Wybór między nimi przestaje zależeć od treści.</p>
<p>Nie chodzi o to, żeby każdy punkt kończył się spektakularnym sukcesem. Chodzi o to, żeby dało się z niego wyczytać, co konkretnie robiłeś i w jakiej skali.</p>

<h2>Wzór: czasownik, co, efekt</h2>
<p>Sprawdza się prosta konstrukcja z trzech części:</p>
<ol>
<li><strong>Czasownik w formie dokonanej</strong> na początku punktu: wdrożyłem, uruchomiłem, skróciłem, przejąłem.</li>
<li><strong>Co dokładnie</strong> - przedmiot działania, najlepiej z nazwą narzędzia, procesu albo obszaru.</li>
<li><strong>Efekt albo skala</strong> - liczba, czas, wielkość zespołu, oszczędność, zasięg.</li>
</ol>
<p>Trzeci element bywa najtrudniejszy i to on decyduje o różnicy. Jeśli nie masz twardego wyniku, wstaw skalę: ilu klientów, ile transakcji, jak często, dla jak dużego zespołu. Skala też jest informacją.</p>

<div class="blog-cta-inline">
<p><strong>To nie jest kwestia stylu, tylko mierzalne kryterium.</strong> W rubryce, według której Aplikando ocenia CV w skali 0-100, „Osiągnięcia zamiast obowiązków" to osobna pozycja warta 12 punktów, a „Konkretne liczby i metryki" kolejne 10. Po analizie widzisz, ile z nich zebrałeś i przy których punktach brakuje efektu.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Schemat budowy punktu w CV z trzech elementów: czasownik, przedmiot działania, efekt lub skala. Trzy poziome bloki połączone w jedno zdanie.">
  <img src="/blog/obrazki/jak-opisac-doswiadczenie-w-cv-01.webp" alt="Schemat trzyczęściowej budowy punktu w sekcji doświadczenia" width="800" height="450" loading="lazy" />
  <figcaption>Trzy części, z których powstaje punkt mówiący coś o Tobie</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing three horizontal blocks connected left to right by plus signs, forming a single sentence structure, flat vector illustration style. Polish labels rendered clearly in a modern sans-serif font inside the blocks: the first reads "Czasownik", the second reads "Co dokładnie", the third reads "Efekt lub skala". A short Polish heading above reads "Punkt w doświadczeniu". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Schemat trzyczęściowej budowy punktu w sekcji doświadczenia". <strong>Podpis:</strong> "Trzy części, z których powstaje punkt mówiący coś o Tobie". Plik: <code>jak-opisac-doswiadczenie-w-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Osiem przykładów przed i po</h2>
<p>Przykłady pochodzą z różnych branż, bo mechanizm jest wszędzie ten sam. Zwróć uwagę, że wersje po prawej nie są dłuższe o połowę, tylko lepiej wykorzystują to samo miejsce.</p>
<table>
<thead><tr><th>Zakres obowiązków</th><th>Opis z efektem</th></tr></thead>
<tbody>
<tr><td>Obsługa klienta</td><td>Obsługiwałem 40-50 zgłoszeń dziennie w systemie Zendesk, utrzymując czas pierwszej odpowiedzi poniżej 2 godzin</td></tr>
<tr><td>Odpowiedzialność za media społecznościowe</td><td>Prowadziłem profile na Instagramie i LinkedIn, zwiększając liczbę obserwujących z 3 do 11 tys. w ciągu roku</td></tr>
<tr><td>Prowadzenie dokumentacji magazynowej</td><td>Uporządkowałem ewidencję 2 tys. indeksów magazynowych, skracając czas inwentaryzacji z 3 dni do 1</td></tr>
<tr><td>Praca przy projektach informatycznych</td><td>Wdrożyłem moduł rozliczeń w systemie ERP dla 5 spółek grupy, w terminie i bez przestoju produkcyjnego</td></tr>
<tr><td>Wsparcie działu sprzedaży</td><td>Przygotowywałem tygodniowe raporty sprzedażowe dla 12-osobowego zespołu handlowego, automatyzując je w Power BI</td></tr>
<tr><td>Rekrutacja pracowników</td><td>Przeprowadziłem ponad 120 rozmów rekrutacyjnych rocznie na stanowiska produkcyjne, obsadzając średnio 8 wakatów miesięcznie</td></tr>
<tr><td>Nauczanie języka angielskiego</td><td>Uczyłem angielskiego 6 grup licealnych, przygotowując 24 osoby do matury rozszerzonej</td></tr>
<tr><td>Zarządzanie zespołem</td><td>Kierowałem 9-osobowym zespołem serwisu, wdrażając nowy grafik dyżurów, który obniżył liczbę nadgodzin o połowę</td></tr>
</tbody>
</table>
<p>Uwaga do liczb: mają być prawdziwe i możliwe do obrony na rozmowie. Zaokrąglenie w rozsądnych granicach jest w porządku, wymyślenie wyniku, którego nie było, kończy się źle przy pierwszym pytaniu o szczegóły.</p>

<h2>Czasowniki, od których warto zaczynać</h2>
<p>Sam czasownik nie zmieni słabego punktu w dobry, ale ustawia zdanie od razu na działanie. Przydatna lista, pogrupowana według tego, co opisujesz:</p>
<ul>
<li><strong>Tworzenie i wdrażanie:</strong> wdrożyłem, uruchomiłem, zbudowałem, opracowałem, zaprojektowałem, wprowadziłem</li>
<li><strong>Poprawa i optymalizacja:</strong> skróciłem, obniżyłem, zwiększyłem, usprawniłem, zautomatyzowałem, uporządkowałem</li>
<li><strong>Prowadzenie i koordynacja:</strong> kierowałem, koordynowałem, prowadziłem, nadzorowałem, przejąłem, rozliczałem</li>
<li><strong>Praca z ludźmi:</strong> przeszkoliłem, wdrożyłem do pracy, negocjowałem, doradzałem, obsługiwałem</li>
</ul>
<p>Trzymaj jedną formę w obrębie stanowiska. Mieszanie „wdrożyłem" z „wdrażałem" w tych samych punktach czyta się jak niedokończona redakcja, a przy okazji obniża ocenę spójności językowej.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba przy biurku z wydrukowanym CV, robiąca odręczne notatki na marginesie przy punktach doświadczenia. Praca redakcyjna nad dokumentem, naturalne światło.">
  <img src="/blog/obrazki/jak-opisac-doswiadczenie-w-cv-02.webp" alt="Kandydat nanoszący poprawki na wydrukowanym CV" width="800" height="450" loading="lazy" />
  <figcaption>Przepisanie punktów zwykle wymaga dwóch, trzech podejść</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person at a desk marking handwritten notes in the margin of a printed document with a pen, laptop open beside them, soft natural daylight from a window, shallow depth of field, warm neutral tones, no visible readable text or logos, focused editing mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat nanoszący poprawki na wydrukowanym CV". <strong>Podpis:</strong> "Przepisanie punktów zwykle wymaga dwóch, trzech podejść". Plik: <code>jak-opisac-doswiadczenie-w-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Co zrobić, gdy praca była powtarzalna</h2>
<p>Nie każde stanowisko daje się opisać sukcesami i nie każde musi. Przy pracy operacyjnej, gdzie zadania powtarzają się codziennie, efektem jest utrzymanie poziomu, a nie zmiana.</p>
<p>W takiej sytuacji działają trzy podejścia. Pierwsze to skala: ile sztuk, ile zgłoszeń, ilu klientów, jaki obszar. Drugie to stabilność opisana liczbą: utrzymanie terminowości, brak reklamacji w danym okresie, ciągłość obsługi przy zmianie systemu. Trzecie to drobne usprawnienia, które wprowadziłeś sam, nawet jeśli nikt tego nie nazwał projektem.</p>
<p>Prawie każdy, kto twierdzi, że nie ma czego opisać, po dziesięciu minutach rozmowy znajduje trzy rzeczy. Trudność polega na tym, że rutyna przestaje wyglądać na osiągnięcie, kiedy robi się ją codziennie przez trzy lata.</p>
<p>Gdy masz już przepisane punkty, sprawdź, czy górna część dokumentu za nimi nadąża - o tym jest osobny tekst o <a href="/blog/podsumowanie-zawodowe-cv">podsumowaniu zawodowym</a>. Warto też upewnić się, że układ CV nie gubi tych punktów po drodze do rekrutera, co opisuje tekst o tym, <a href="/blog/ats-cv">jak systemy rekrutacyjne czytają CV</a>.</p>`,
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
