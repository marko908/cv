import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Umiejętności w CV: co wpisać, a czego nie",
      slug: "umiejetnosci-w-cv",
      zajawka:
        "Które umiejętności wpisać do CV, w jakiej proporcji twarde do miękkich, jakich frazesów unikać i jakich danych nie ma prawa tam być.",
      meta_tytul: "Umiejętności w CV: co wpisać, a czego unikać",
      meta_opis:
        "Jakie umiejętności wpisać do CV? Proporcja twardych i miękkich, frazesy do wykreślenia, dane zbędne i dobór pozycji pod konkretną ofertę.",
      kategoria: "pisanie CV",
      tagi: ["cv", "umiejętności", "kompetencje"],
      czas_czytania_min: 7,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Sekcja umiejętności w CV widoczna na ekranie laptopa",
      faq: [
        {
          pytanie: "Ile umiejętności wpisać do CV?",
          odpowiedz:
            "Od ośmiu do dwunastu twardych i najwyżej trzy, cztery miękkie, o ile masz je czym poprzeć. Dłuższa lista przestaje być wyborem, a rekruter i tak czyta tylko początek.",
        },
        {
          pytanie: "Czy umiejętności miękkie w CV mają sens?",
          odpowiedz:
            "Mają, jeśli są związane ze stanowiskiem i widać ich potwierdzenie w opisie doświadczenia. Sama lista przymiotników bez pokrycia w treści niczego nie wnosi.",
        },
        {
          pytanie: "Czy wpisywać znajomość pakietu MS Office?",
          odpowiedz:
            "Ogólne „MS Office" nic nie wnosi, bo zakłada się je domyślnie. Wpisz konkretny program i zastosowanie, na przykład Excel z tabelami przestawnymi, jeśli faktycznie z nich korzystasz.",
        },
        {
          pytanie: "W jakiej kolejności ustawić umiejętności w CV?",
          odpowiedz:
            "Najpierw te, które pojawiają się w wymaganiach obowiązkowych ogłoszenia, potem pozostałe twarde, na końcu miękkie. Przy szybkim przeglądzie liczy się pierwsze kilka pozycji.",
        },
      ],
      tresc: `<p>Sekcja umiejętności bywa traktowana jak worek na wszystko, co przyszło do głowy. Tymczasem to jedno z niewielu miejsc w CV, gdzie rekruter i system rekrutacyjny szukają dokładnie tych samych słów co w ogłoszeniu. Poniżej, co się w tej sekcji broni, co ją osłabia i czego nie ma prawa tam być.</p>

<h2>Twarde i miękkie: proporcja, która działa</h2>
<p>Umiejętności twarde to konkretne, weryfikowalne rzeczy: narzędzia, programy, technologie, metodyki, uprawnienia, języki. Miękkie opisują sposób pracy: komunikację, organizację, pracę w zespole.</p>
<p>Sensowna proporcja to zdecydowana przewaga twardych. Osiem do dwunastu pozycji twardych i najwyżej trzy albo cztery miękkie w zupełności wystarczy. Powód jest prosty: twarde da się sprawdzić na rozmowie albo w zadaniu, miękkie trzeba wziąć na słowo.</p>
<p>Jeśli lista rozrasta się powyżej piętnastu pozycji, przestaje być wyborem i staje się spisem wszystkiego, co kiedykolwiek widziałeś na ekranie. Rekruter czytający szybko i tak zatrzyma się na pierwszych kilku, więc długość działa przeciwko Tobie.</p>

<h2>Frazesy, które osłabiają sekcję</h2>
<p>Największy problem miękkich umiejętności polega na tym, że wszyscy wpisują te same. Zestaw „komunikatywność, praca w zespole, zaangażowanie, dyspozycyjność" pojawia się w takiej liczbie CV, że przestał cokolwiek różnicować.</p>
<table>
<thead><tr><th>Zamiast frazesu</th><th>Pokaż to w doświadczeniu</th></tr></thead>
<tbody>
<tr><td>Komunikatywność</td><td>Prowadzenie szkoleń produktowych dla działu sprzedaży</td></tr>
<tr><td>Gracz zespołowy</td><td>Praca w 6-osobowym zespole scrumowym, rola product ownera przy dwóch projektach</td></tr>
<tr><td>Zorientowanie na cel</td><td>Realizacja planu sprzedażowego w 11 na 12 miesięcy</td></tr>
<tr><td>Dobra organizacja pracy</td><td>Prowadzenie 5 projektów równolegle, każdy z osobnym harmonogramem</td></tr>
<tr><td>Odporność na stres</td><td>Obsługa zgłoszeń krytycznych w systemie dyżurów całodobowych</td></tr>
</tbody>
</table>
<p>Nie chodzi o to, żeby usunąć wszystkie miękkie kompetencje. Chodzi o to, żeby te, które zostaną, miały pokrycie w opisie doświadczenia. Umiejętność wymieniona w jednej sekcji i potwierdzona w drugiej działa, sama deklaracja nie.</p>

<div class="blog-cta-inline">
<p><strong>Kolejność w tej sekcji da się ustawić pod konkretne ogłoszenie.</strong> Przy dopasowaniu Aplikando przestawia umiejętności tak, żeby te wymagane w ofercie znalazły się wyżej, i pokazuje w dzienniku zmian, które dokładnie awansowały. Sama lista zostaje Twoja, zmienia się tylko porządek.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Sekcja umiejętności w CV przedstawiona jako lista, w której trzy górne pozycje są wyróżnione kolorem jako zgodne z wymaganiami oferty, a pozostałe są neutralne.">
  <img src="/blog/obrazki/umiejetnosci-w-cv-01.webp" alt="Lista umiejętności z wyróżnionymi pozycjami wymaganymi w ofercie" width="800" height="450" loading="lazy" />
  <figcaption>Pierwsze trzy pozycje decydują, bo dalej mało kto czyta</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing a vertical list of eight rounded rectangular tags representing CV skills, flat vector illustration style. The top three tags are filled with a soft accent colour and the remaining five are light grey. A Polish label with an arrow points at the top three reading "Wymagane w ofercie". A short Polish heading above the list reads "Umiejętności". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Lista umiejętności z wyróżnionymi pozycjami wymaganymi w ofercie". <strong>Podpis:</strong> "Pierwsze trzy pozycje decydują, bo dalej mało kto czyta". Plik: <code>umiejetnosci-w-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Czego w CV nie ma prawa być</h2>
<p>Pracodawca na etapie rekrutacji może pytać o dane związane z zatrudnieniem: dane kontaktowe, wykształcenie, przebieg zatrudnienia, kwalifikacje. Reszta to informacje, których podawać nie musisz, a część z nich działa wprost na Twoją niekorzyść.</p>
<ul>
<li><strong>PESEL, numer dowodu, adres zameldowania</strong> - potrzebne dopiero przy zawieraniu umowy, nie przy aplikacji. Wystarczy miasto.</li>
<li><strong>Stan cywilny, liczba dzieci, data urodzenia</strong> - nie mają związku z kwalifikacjami, a otwierają drogę do decyzji, których prawo zabrania.</li>
<li><strong>Wyznanie, poglądy polityczne, przynależność związkowa</strong> - to dane szczególnej kategorii według RODO. W CV nie mają czego szukać.</li>
<li><strong>Stan zdrowia, orzeczenia</strong> - wyjątkiem jest sytuacja, gdy sam chcesz je ujawnić, na przykład aplikując na stanowisko z puli dla osób z orzeczeniem.</li>
<li><strong>Zainteresowania wpisane dla zapełnienia miejsca</strong> - „muzyka, podróże, sport" nie mówi nic. Zostaw tylko te, które łączą się ze stanowiskiem albo są nietypowe na tyle, że staną się tematem rozmowy.</li>
</ul>
<p>Jeśli w CV zostają dane wykraczające poza podstawowy zakres, tym bardziej zadbaj o <a href="/blog/klauzula-rodo-w-cv">aktualną klauzulę RODO</a>, bo to ona porządkuje kwestię zgody.</p>

<h2>Jak wybrać umiejętności pod konkretną ofertę</h2>
<p>Zamiast utrzymywać jedną uniwersalną listę, potraktuj ją jak zasób, z którego wybierasz przy każdej aplikacji. Metoda zajmuje kilka minut:</p>
<ol>
<li>Wypisz z ogłoszenia wszystkie nazwy narzędzi, technologii i metodyk, rozdzielając wymagania obowiązkowe od mile widzianych.</li>
<li>Zaznacz te, które faktycznie masz. Tylko te, reszta odpada bezpowrotnie.</li>
<li>Ustaw je na górze swojej listy, w brzmieniu użytym w ogłoszeniu, o ile jest poprawne.</li>
<li>Uzupełnij listę pozostałymi twardymi umiejętnościami, które mają związek ze stanowiskiem.</li>
<li>Na końcu dopisz najwyżej trzy miękkie, mające potwierdzenie w opisie doświadczenia.</li>
</ol>
<p>Punkt trzeci bywa niedoceniany. Jeśli ogłoszenie mówi o „Google Analytics 4", a Ty masz w CV „GA4", człowiek zrozumie, ale wyszukiwarka w systemie rekrutacyjnym szukająca pełnej frazy już niekoniecznie. Nie kombinuj z synonimami tam, gdzie branża ma ustaloną nazwę.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba przy laptopie z otwartym ogłoszeniem o pracę na jednym ekranie i dokumentem CV na drugim, zaznaczająca wymagania. Praca porównawcza nad dwoma dokumentami.">
  <img src="/blog/obrazki/umiejetnosci-w-cv-02.webp" alt="Kandydat zestawiający wymagania z ogłoszenia ze swoim CV" width="800" height="450" loading="lazy" />
  <figcaption>Lista umiejętności to zasób, z którego wybierasz przy każdej ofercie</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person working at a desk with a laptop and a printed document side by side, using a highlighter to mark lines on the printed page, soft natural daylight from a window, shallow depth of field, warm neutral tones, screen content blurred, no visible readable text or logos, focused comparison mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat zestawiający wymagania z ogłoszenia ze swoim CV". <strong>Podpis:</strong> "Lista umiejętności to zasób, z którego wybierasz przy każdej ofercie". Plik: <code>umiejetnosci-w-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Kolejność ma znaczenie</h2>
<p>Rekruter przeglądający kilkadziesiąt CV dziennie nie czyta listy umiejętności do końca. Zatrzymuje wzrok na pierwszych kilku pozycjach i na tej podstawie wyrabia sobie zdanie o profilu kandydata.</p>
<p>To samo dotyczy systemów rekrutacyjnych, choć z innego powodu: one przeczytają całość, ale rekruter filtrujący wyniki i tak zobaczy fragment. Pozycja na liście przekłada się więc na pierwsze wrażenie po obu stronach.</p>
<p>Dlatego przestawienie kolejności jest jedną z najtańszych zmian, jakie możesz zrobić w CV. Nie wymaga dopisywania niczego nowego, zajmuje minutę i realnie zmienia to, co widać najpierw.</p>
<p>Przy okazji porządkowania tej sekcji sprawdź, czy nie zostały w niej paski i procenty poziomu, o których jest osobny tekst: <a href="/blog/paski-umiejetnosci-cv">czy paski umiejętności w CV mają sens</a>. Drogę tej sekcji do systemu po drugiej stronie wyjaśnia natomiast artykuł o tym, <a href="/blog/ats-cv">jak ATS czyta Twoje CV</a>.</p>`,
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
