import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Paski umiejętności w CV: czy mają sens?",
      slug: "paski-umiejetnosci-cv",
      zajawka:
        "Paski postępu i procenty przy umiejętnościach wyglądają nowocześnie, ale rekruter nie ma z nich czego odczytać. Sprawdź, co wpisać zamiast nich.",
      meta_tytul: "Paski umiejętności w CV: czy mają sens?",
      meta_opis:
        "Czy paski poziomu umiejętności w CV coś dają? Dlaczego procenty nic nie znaczą, co wpisać zamiast nich i kiedy skala jest uzasadniona.",
      kategoria: "pisanie CV",
      tagi: ["cv", "umiejętności", "formatowanie"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Sekcja umiejętności w CV z graficznymi paskami poziomu",
      faq: [
        {
          pytanie: "Czy paski umiejętności w CV są błędem?",
          odpowiedz:
            "Nie są błędem formalnym, ale nie niosą informacji. Rekruter nie wie, co dla Ciebie znaczy 80 procent, więc pasek zajmuje miejsce, nie dodając nic do oceny.",
        },
        {
          pytanie: "Czym zastąpić paski poziomu umiejętności?",
          odpowiedz:
            "Konkretem: nazwą narzędzia razem z tym, co w nim robiłeś, i skalą działania. Zamiast „Excel 80%” napisz, że budujesz w nim raporty sprzedażowe z tabel przestawnych dla zespołu 12 osób.",
        },
        {
          pytanie: "Czy przy językach obcych też nie używać skali?",
          odpowiedz:
            "Przy językach skala jest uzasadniona, ale tylko ta oficjalna: A1-C2 według ESOKJ. Ma ustalone znaczenie, które rekruter rozumie tak samo jak Ty. Procenty i gwiazdki przy językach nie mają go wcale.",
        },
        {
          pytanie: "Czy systemy ATS czytają paski umiejętności?",
          odpowiedz:
            "Nie. Pasek to grafika, a system wyciąga z pliku tekst. Odczyta samą nazwę umiejętności, jeśli jest zapisana tekstem obok. Sam poziom przepada niezależnie od tego, jak wygląda.",
        },
      ],
      tresc: `<p>Paski postępu i procenty przy umiejętnościach nie działają, bo nie niosą żadnej informacji, którą dałoby się zweryfikować. Rekruter patrzący na „Excel 80%” nie wie, czy to poziom tabel przestawnych, czy makr w VBA. Jedyny wyjątek to języki obce, ale i tam liczy się konkretna skala, nie grafika. Poniżej dlaczego tak jest i czym te paski zastąpić.</p>

<h2>Co rekruter naprawdę odczytuje z paska</h2>
<p>Pasek wypełniony w trzech czwartych mówi tyle, że sam siebie oceniłeś na trzy czwarte. Brakuje w nim wszystkiego, co pozwoliłoby ten wynik zinterpretować: skali, punktu odniesienia i tego, kto oceniał.</p>
<p>Dwie osoby o identycznej wiedzy zaznaczą różne wartości, bo jedna porównuje się do zespołu, a druga do najlepszego specjalisty w branży. Osoba na początku drogi często zaznacza więcej niż ekspert, który wie, ile jeszcze nie umie. Rekruter, który przejrzał setki takich CV, dawno przestał traktować te wartości jako dane.</p>
<p>W praktyce pasek pełni funkcję dekoracyjną. Wypełnia miejsce, dodaje koloru i sprawia, że dokument wygląda nowocześnie, ale w ocenie merytorycznej jest przezroczysty.</p>

<h2>Dlaczego „Excel 80%” jest bez znaczenia</h2>
<p>Procent sugeruje pomiar, którego nikt nie przeprowadził. Żeby liczba coś znaczyła, musiałaby istnieć znana obu stronom skala od zera do stu. Przy programach biurowych czy językach programowania taka skala nie istnieje.</p>
<p>Porównaj dwa zapisy tej samej kompetencji:</p>
<table>
<thead><tr><th>Zapis z paskiem</th><th>Zapis konkretny</th></tr></thead>
<tbody>
<tr><td>Excel - 80%</td><td>Excel: raporty sprzedażowe na tabelach przestawnych, WYSZUKAJ.PIONOWO, makra nagrywane</td></tr>
<tr><td>SQL - 4/5 gwiazdek</td><td>SQL: zapytania z JOIN i agregacjami na bazie 40 tabel, optymalizacja zapytań raportowych</td></tr>
<tr><td>Zarządzanie projektami - 90%</td><td>Prowadzenie projektów wdrożeniowych dla 3-5 klientów równolegle, metodyka Scrum</td></tr>
</tbody>
</table>
<p>Prawa kolumna jest dłuższa, ale odpowiada na pytanie, które rekruter faktycznie zadaje: co ta osoba potrafi zrobić. Lewa kolumna zostawia go z liczbą, której nie ma jak sprawdzić.</p>

<div class="blog-cta-inline">
<p><strong>To nie jest kwestia gustu.</strong> Aplikando ocenia CV w skali 0-100 z jawnej rubryki, a paski i procenty przy umiejętnościach realnie obniżają wynik w kryterium spójności formatu - wystarczą dwa takie wpisy, żeby ściąć połowę punktów w tej kategorii. Zobaczysz to jako konkretną pozycję w rozbiciu wyniku, razem z podpowiedzią, co wpisać zamiast.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Zestawienie dwóch wersji sekcji umiejętności w CV: po lewej lista z graficznymi paskami poziomu, po prawej ta sama umiejętność opisana konkretem. Wyraźne oznaczenie, która wersja niesie informację.">
  <img src="/blog/obrazki/paski-umiejetnosci-cv-01.webp" alt="Sekcja umiejętności z paskami zestawiona z wersją opisową" width="800" height="450" loading="lazy" />
  <figcaption>Ta sama umiejętność raz jako pasek, raz jako informacja</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic split into two vertical halves, flat vector illustration style. The left half is muted grey and shows three horizontal progress bars partially filled, with a Polish heading above reading "Pasek" and a small Polish label below reading "Brak informacji". The right half is highlighted in a soft accent colour and shows three lines of placeholder text blocks of different lengths, with a Polish heading above reading "Konkret" and a small Polish label below reading "Rekruter wie, co potrafisz". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Sekcja umiejętności z paskami zestawiona z wersją opisową". <strong>Podpis:</strong> "Ta sama umiejętność raz jako pasek, raz jako informacja". Plik: <code>paski-umiejetnosci-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Co wpisać zamiast pasków</h2>
<p>Zamiast oceniać siebie w skali, opisz zakres. Trzy elementy wystarczą i mieszczą się w jednej linii.</p>
<ul>
<li><strong>Nazwa narzędzia</strong> dokładnie tak, jak nazywa je branża i jak pojawia się w ogłoszeniach.</li>
<li><strong>Co w nim robisz</strong> - konkretne zastosowanie, nie ogólnik typu „obsługa”.</li>
<li><strong>Skala albo kontekst</strong>, jeśli je znasz: wielkość zespołu, liczba klientów, rozmiar bazy, częstotliwość.</li>
</ul>
<p>Jeśli nie masz czym uzupełnić drugiego i trzeciego punktu, zostaw samą nazwę. Czysta lista narzędzi jest lepsza niż lista z doklejonymi procentami, bo nie udaje precyzji, której nie ma. Więcej o doborze samych pozycji do tej sekcji znajdziesz w tekście o tym, <a href="/blog/ile-stron-cv">ile stron powinno mieć CV</a> - przy jednej stronie każda linia musi na siebie zarabiać.</p>

<h2>Wyjątek: języki obce i skala A1-C2</h2>
<p>Przy językach obcych skala ma sens, bo istnieje ustalona i niezależna od Ciebie: poziomy A1-C2 według Europejskiego Systemu Opisu Kształcenia Językowego. B2 znaczy to samo dla Ciebie i dla rekrutera, bo definicja jest publiczna i opisuje konkretne umiejętności.</p>
<p>Dlatego przy językach pisz „angielski - C1”, nie „angielski - 85%” ani „angielski - cztery gwiazdki”. Jeśli masz certyfikat, dopisz go razem z rokiem. Jeśli nie masz, sam poziom według skali wystarczy.</p>
<p>Ta sama zasada tłumaczy, dlaczego reszta umiejętności skali nie dostaje: dla Excela ani dla Pythona nikt takiej skali nie ustalił.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba przy laptopie porządkująca sekcję umiejętności w CV, obok notatnik z odręczną listą. Spokojna praca nad dokumentem, naturalne światło.">
  <img src="/blog/obrazki/paski-umiejetnosci-cv-02.webp" alt="Kandydat porządkujący sekcję umiejętności w swoim CV" width="800" height="450" loading="lazy" />
  <figcaption>Krótsza lista z konkretem działa lepiej niż dłuższa z grafiką</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person sitting at a desk working on a laptop, editing a document, with an open paper notebook beside the keyboard showing a handwritten list, soft natural daylight from a window, shallow depth of field, warm neutral tones, no visible readable text or logos, focused and calm working mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat porządkujący sekcję umiejętności w swoim CV". <strong>Podpis:</strong> "Krótsza lista z konkretem działa lepiej niż dłuższa z grafiką". Plik: <code>paski-umiejetnosci-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Co zrobić, gdy naprawdę chcesz pokazać poziom</h2>
<p>Czasem poziom faktycznie ma znaczenie, na przykład przy narzędziu, które jest sednem stanowiska. Są trzy sposoby, żeby go pokazać bez sięgania po skalę, której nikt nie ustalił.</p>
<ul>
<li><strong>Certyfikat z rokiem.</strong> Egzamin ma ustalony zakres i próg zdawalności, więc mówi więcej niż jakikolwiek pasek. Wpisz pełną nazwę i rok uzyskania.</li>
<li><strong>Staż użycia w konkretnym kontekście.</strong> „Cztery lata pracy w SAP w module MM” niesie informację, której nie da żadna liczba procent.</li>
<li><strong>Najtrudniejsze zadanie, jakie w tym narzędziu wykonałeś.</strong> Rekruter techniczny odczyta poziom z samego opisu zadania, bo zna skalę trudności w swojej dziedzinie.</li>
</ul>
<p>Wszystkie trzy mają wspólną cechę: dają się sprawdzić. Pasek nie daje się sprawdzić w żaden sposób, i to jest cała różnica.</p>

<h2>Jak systemy rekrutacyjne traktują grafikę poziomu</h2>
<p>Systemy ATS wyciągają z pliku tekst. Pasek narysowany w edytorze tekstem nie jest, więc do systemu nie trafia w żadnej postaci. Zostaje sama nazwa umiejętności, o ile stoi obok jako zwykły tekst.</p>
<p>Gorszy wariant to szablony, w których cała sekcja umiejętności jest jednym obrazkiem albo siedzi w rozbudowanej tabeli. Wtedy przepada nie tylko poziom, ale i nazwy - a to już realna strata, bo dopasowanie do ogłoszenia liczy się właśnie na tych nazwach.</p>
<p>Dla rekrutera i dla systemu wniosek jest ten sam: liczy się tekst, który da się przeczytać i zweryfikować. Grafika poziomu nie należy do żadnej z tych kategorii. Podobnie niesłusznie za ryzyko techniczne uchodzi coś jeszcze, o czym jest osobny tekst: czy <a href="/blog/zdjecie-w-cv">zdjęcie w CV psuje odczyt</a>.</p>`,
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
