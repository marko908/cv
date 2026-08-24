import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Jak napisać CV w 2026: kompletny przewodnik",
      slug: "jak-napisac-cv",
      zajawka:
        "CV sekcja po sekcji: co wpisać w każdej, jaki format pliku wybrać, ile stron i co sprawdzić przed wysłaniem. Przewodnik z checklistą na koniec.",
      meta_tytul: "Jak napisać CV w 2026: kompletny przewodnik",
      meta_opis:
        "Jak napisać CV krok po kroku: struktura sekcja po sekcji, format pliku, długość, dopasowanie do oferty i checklista przed wysłaniem zgłoszenia.",
      kategoria: "pisanie CV",
      tagi: ["cv", "poradnik", "pisanie CV"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Gotowe CV leżące na biurku obok laptopa",
      faq: [
        {
          pytanie: "Co powinno zawierać CV?",
          odpowiedz:
            "Dane kontaktowe, podsumowanie zawodowe, doświadczenie, umiejętności, wykształcenie i klauzulę RODO. Języki, kursy i projekty dodajesz wtedy, gdy wnoszą coś do konkretnej aplikacji.",
        },
        {
          pytanie: "W jakim formacie wysłać CV?",
          odpowiedz:
            "PDF z prawdziwym tekstem, czyli takim, który da się zaznaczyć i skopiować. Nazwij plik imieniem, nazwiskiem i stanowiskiem, bez wersji roboczych w nazwie.",
        },
        {
          pytanie: "Czy CV trzeba zmieniać przy każdej aplikacji?",
          odpowiedz:
            "Nie całe. Zmieniasz podsumowanie, kolejność umiejętności i rozłożenie akcentów w punktach doświadczenia. Fakty, daty i nazwy firm zostają bez zmian.",
        },
        {
          pytanie: "Czy CV z 2026 roku różni się od tego sprzed kilku lat?",
          odpowiedz:
            "Struktura się nie zmieniła. Zmieniło się otoczenie: większość zgłoszeń przechodzi przez systemy rekrutacyjne, a rekruterzy częściej widzą teksty pisane przez modele językowe, więc konkret i wiarygodność liczą się bardziej niż kiedyś.",
        },
      ],
      tresc: `<p>Dobre CV mieści się zwykle na jednej stronie, opisuje fakty w kolejności od najważniejszych i daje się przeczytać w kilkanaście sekund. Reszta to szczegóły, które rozstrzygamy sekcja po sekcji. Ten przewodnik prowadzi przez cały dokument, od danych kontaktowych po checklistę przed wysłaniem.</p>

<h2>Struktura CV sekcja po sekcji</h2>
<p>Kolejność poniżej sprawdza się u osoby z doświadczeniem zawodowym. Przy pierwszym CV zmienia się miejsce wykształcenia, o czym niżej.</p>

<h3>Dane osobowe i klauzula</h3>
<p>Imię, nazwisko, numer telefonu, adres e-mail i miasto. Tyle wystarczy. Adres zameldowania, PESEL, stan cywilny i data urodzenia nie mają związku z kwalifikacjami i nie powinny się tam znaleźć.</p>
<p>Adres e-mail w formacie imię.nazwisko, nie pseudonim z czasów szkolnych. Jeśli masz publiczny profil zawodowy albo portfolio, dopisz link.</p>
<p>Na dole dokumentu, mniejszą czcionką, wstaw klauzulę zgody. Aktualna treść i najczęstszy błąd z nieaktualną podstawą prawną są w tekście o <a href="/blog/klauzula-rodo-w-cv">klauzuli RODO w CV</a>. Osobną decyzją jest <a href="/blog/zdjecie-w-cv">zdjęcie w CV</a>, które nie jest obowiązkowe, ale na polskim rynku jest powszechne.</p>

<h3>Podsumowanie zawodowe</h3>
<p>Dwa do czterech zdań na górze dokumentu: kim jesteś zawodowo, co potrafisz najlepiej i czego szukasz. To jedyna sekcja, którą warto pisać od nowa przy każdej ofercie, bo ustawia perspektywę dla całej reszty.</p>
<p>Struktura, przykłady dla różnych stanowisk i lista frazesów do wykreślenia są w tekście o <a href="/blog/podsumowanie-zawodowe-cv">podsumowaniu zawodowym</a>.</p>

<h3>Doświadczenie zawodowe</h3>
<p>Od najnowszego stanowiska. Przy każdym: nazwa stanowiska, firma, okres, a pod tym trzy do pięciu punktów przy ostatniej roli i dwa, trzy przy wcześniejszych.</p>
<p>Punkty zaczynaj czasownikiem i dopisuj efekt albo skalę. „Byłem odpowiedzialny za obsługę klienta" opisuje zakres stanowiska, a nie Twoją pracę. Jak to przepisać, pokazuje tekst o tym, <a href="/blog/jak-opisac-doswiadczenie-w-cv">jak opisać doświadczenie w CV</a>, a jeśli blokuje Cię brak twardych wyników, sposoby na to zbiera artykuł o <a href="/blog/liczby-w-cv">liczbach w CV</a>.</p>

<h3>Umiejętności</h3>
<p>Osiem do dwunastu twardych, najwyżej trzy albo cztery miękkie, i tylko takie, które mają pokrycie w opisie doświadczenia. Wymagane w ogłoszeniu ustaw na początku listy.</p>
<p>Dobór pozycji i lista rzeczy, których w tej sekcji być nie powinno, są w tekście o <a href="/blog/umiejetnosci-w-cv">umiejętnościach w CV</a>. Osobno rozstrzygnięta jest kwestia, dlaczego <a href="/blog/paski-umiejetnosci-cv">paski i procenty poziomu</a> nic nie wnoszą, poza jednym wyjątkiem.</p>

<h3>Wykształcenie, języki, kursy</h3>
<p>Wykształcenie: uczelnia, kierunek, rok ukończenia. Szkoła średnia tylko wtedy, gdy nie masz studiów. Po kilku latach pracy ta sekcja schodzi na dół dokumentu.</p>
<p>Języki zapisuj w skali A1-C2, bo ma ustalone i publiczne znaczenie. Kursy wpisuj wtedy, gdy zakończyły się projektem albo certyfikatem mającym związek ze stanowiskiem.</p>

<div class="blog-cta-inline">
<p><strong>Ostatni krok jest zawsze ten sam: sprawdzenie, czy to CV odpowiada na TĘ ofertę.</strong> Aplikando zestawia Twój dokument z konkretnym ogłoszeniem, pokazuje wynik w rozbiciu na kryteria i wypisuje, czego w CV brakuje wobec wymagań. Nie dopisuje niczego od siebie, więc pracujesz wyłącznie na własnych faktach.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Schemat jednej strony CV z podpisanymi sekcjami w kolejności: dane osobowe, podsumowanie, doświadczenie, umiejętności, wykształcenie, klauzula w stopce.">
  <img src="/blog/obrazki/jak-napisac-cv-01.webp" alt="Schemat strony CV z podpisanymi sekcjami w kolejności" width="800" height="450" loading="lazy" />
  <figcaption>Kolejność sekcji w CV osoby z doświadczeniem zawodowym</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing a single CV page wireframe divided into labelled horizontal section blocks, flat vector illustration style, generous white space. Polish labels rendered clearly in a modern sans-serif font, from top to bottom: "Dane osobowe", "Podsumowanie zawodowe", "Doświadczenie", "Umiejętności", "Wykształcenie", and a small footer strip labelled "Klauzula RODO". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme. <strong>Alt:</strong> "Schemat strony CV z podpisanymi sekcjami w kolejności". <strong>Podpis:</strong> "Kolejność sekcji w CV osoby z doświadczeniem zawodowym". Plik: <code>jak-napisac-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Format pliku i nazwa</h2>
<p>Wysyłaj PDF, chyba że ogłoszenie wprost prosi o inny format. PDF wygląda tak samo u każdego odbiorcy, a plik DOCX potrafi rozjechać się na innym komputerze.</p>
<p>Jeden warunek: PDF musi zawierać prawdziwy tekst. Otwórz plik, spróbuj zaznaczyć i skopiować treść. Jeśli się nie da, masz obrazek, którego system rekrutacyjny nie odczyta w ogóle. Jak wygląda ten odczyt po drugiej stronie i co go realnie psuje, wyjaśnia tekst o <a href="/blog/ats-cv">systemach ATS</a>.</p>
<p>Nazwa pliku: imię, nazwisko i stanowisko, na przykład <code>Anna-Kowalska-CV-analityk.pdf</code>. Bez „wersja ostateczna 3" i bez samego „cv.pdf", bo w skrzynce rekrutera takich plików jest kilkadziesiąt.</p>

<h2>Ile stron</h2>
<p>Jedna strona przy stażu do pięciu lat, dwie przy dłuższym dorobku. Trzy strony to prawie zawsze znak, że w dokumencie zostało coś, co można skrócić.</p>
<p>Co ciąć najpierw i jak skracać bez gubienia treści, zbiera tekst o tym, <a href="/blog/ile-stron-cv">ile stron powinno mieć CV</a>.</p>

<h2>Dopasowanie do konkretnej oferty</h2>
<p>Uniwersalne CV wysyłane wszędzie wypada przeciętnie przy każdym ogłoszeniu, bo nie odpowiada na żadne konkretnie. Zmiany nie muszą być duże: podsumowanie, kolejność umiejętności i rozłożenie akcentów w punktach wystarczą.</p>
<p>Pełna procedura ręczna, wraz z tym, czego nie wolno ruszać, jest w tekście o <a href="/blog/dopasowanie-cv-do-oferty">dopasowaniu CV do oferty pracy</a>. Sposób wyławiania właściwych fraz z ogłoszenia opisuje osobno artykuł o <a href="/blog/slowa-kluczowe-w-cv">słowach kluczowych w CV</a>.</p>

<h2>Sytuacje szczególne</h2>
<p>Trzy przypadki wymagają innego podejścia niż standardowe.</p>
<ul>
<li><strong>Pierwsze CV bez etatu za sobą.</strong> Wykształcenie i projekty idą wyżej, doświadczenie zastępują praktyki, koła naukowe i własne projekty. Szczegóły: <a href="/blog/cv-bez-doswiadczenia">CV bez doświadczenia</a>.</li>
<li><strong>Zmiana branży.</strong> Fakty zostają, zmienia się język, którym je opisujesz, a podsumowanie staje się pomostem między dwiema ścieżkami. Szczegóły: <a href="/blog/cv-zmiana-branzy">CV przy zmianie branży</a>.</li>
<li><strong>Korzystanie z narzędzi AI.</strong> Pomagają w redakcji, szkodzą przy faktach, bo dopisują to, czego nie było. Gdzie przebiega granica, opisuje tekst o tym, <a href="/blog/cv-chatgpt">czy pisać CV przez ChatGPT</a>.</li>
</ul>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Gotowe, wydrukowane CV leżące na biurku obok zamykanego laptopa, moment przed wysłaniem zgłoszenia. Spokojna, uporządkowana scena.">
  <img src="/blog/obrazki/jak-napisac-cv-02.webp" alt="Gotowe CV na biurku przed wysłaniem zgłoszenia" width="800" height="450" loading="lazy" />
  <figcaption>Ostatnie spojrzenie na dokument przed kliknięciem wyślij</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a finished printed document lying neatly on a tidy wooden desk beside a partly closed laptop and a cup of coffee, soft natural daylight from a window, shallow depth of field, warm professional tones, no visible readable text or logos, calm and satisfied mood at the end of a task, shot on a 50mm lens. <strong>Alt:</strong> "Gotowe CV na biurku przed wysłaniem zgłoszenia". <strong>Podpis:</strong> "Ostatnie spojrzenie na dokument przed kliknięciem wyślij". Plik: <code>jak-napisac-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Checklista przed wysłaniem</h2>
<p>Przejdź ją za każdym razem. Zajmuje pięć minut i wyłapuje większość rzeczy, które psują dobre skądinąd zgłoszenie.</p>
<ol>
<li>Dane kontaktowe są aktualne, a adres e-mail wygląda profesjonalnie.</li>
<li>Nazwa stanowiska w podsumowaniu odpowiada nazwie z ogłoszenia.</li>
<li>Każdy punkt doświadczenia zaczyna się czasownikiem i mówi coś poza zakresem obowiązków.</li>
<li>Przy każdym stanowisku jest przynajmniej jedna liczba albo skala.</li>
<li>Umiejętności wymagane w ogłoszeniu stoją na początku listy, w brzmieniu z ogłoszenia.</li>
<li>W dokumencie nie ma pasków poziomu, procentów ani gwiazdek przy umiejętnościach.</li>
<li>Daty zapisane jednym formatem w całym CV.</li>
<li>Klauzula RODO jest i odwołuje się do aktualnej podstawy prawnej.</li>
<li>Plik to PDF, z którego da się skopiować tekst, nazwany imieniem i nazwiskiem.</li>
<li>Każdą liczbę i nazwę narzędzia w CV potrafisz obronić na rozmowie.</li>
<li>CV odpowiada na wymagania obowiązkowe z tego konkretnego ogłoszenia.</li>
</ol>
<p>Ostatni punkt jest najważniejszy i jednocześnie najczęściej pomijany, bo wymaga zestawienia dwóch dokumentów zamiast przeczytania jednego. To on decyduje o tym, czy wysyłasz zgłoszenie, czy tylko plik.</p>`,
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
