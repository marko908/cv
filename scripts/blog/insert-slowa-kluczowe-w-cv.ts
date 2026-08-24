import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Słowa kluczowe w CV: jak wyciągnąć je z ogłoszenia",
      slug: "slowa-kluczowe-w-cv",
      zajawka:
        "Metoda ręczna: jak wyłowić z ogłoszenia frazy, które mają znaczenie, gdzie je umieścić w CV i dlaczego upychanie ich na siłę działa przeciwko Tobie.",
      meta_tytul: "Słowa kluczowe w CV: jak wyciągnąć je z ogłoszenia",
      meta_opis:
        "Jak znaleźć słowa kluczowe w ogłoszeniu i wpleść je w CV, żeby działały u rekrutera i w systemie ATS. Metoda krok po kroku, bez upychania fraz.",
      kategoria: "ATS i rekrutacja",
      tagi: ["cv", "słowa kluczowe", "ats"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Ogłoszenie o pracę z zaznaczonymi frazami kluczowymi",
      faq: [
        {
          pytanie: "Ile słów kluczowych umieścić w CV?",
          odpowiedz:
            "Tyle, ile faktycznie Cię dotyczy. Sensowny punkt odniesienia to pokrycie większości wymagań obowiązkowych z ogłoszenia. Dokładanie fraz, za którymi nie stoi Twoje doświadczenie, nie zwiększa szans.",
        },
        {
          pytanie: "Czy pisać słowa kluczowe białą czcionką na białym tle?",
          odpowiedz:
            "Nie. Ta sztuczka jest stara, znana i łatwa do wykrycia przy pobieżnym sprawdzeniu pliku. Wykryta oznacza odrzucenie z powodu poważniejszego niż brak dopasowania, bo chodzi o próbę oszukania procesu.",
        },
        {
          pytanie: "Czy używać dokładnie tych samych słów co w ogłoszeniu?",
          odpowiedz:
            "Przy nazwach własnych tak: narzędzia, technologie i certyfikaty zapisz w brzmieniu z ogłoszenia. Przy opisie obowiązków pisz własnymi słowami, bo przepisany zakres przestaje opisywać Twoją pracę.",
        },
        {
          pytanie: "Czy słowa kluczowe mają znaczenie, gdy CV czyta człowiek?",
          odpowiedz:
            "Tak, choć inaczej. Rekruter skanuje dokument w kilkanaście sekund i szuka wzrokiem terminów, które zna z ogłoszenia. Ich brak w widocznych miejscach działa tak samo jak brak w pliku.",
        },
      ],
      tresc: `<p>Słowa kluczowe w CV to nazwy, których pracodawca użył w ogłoszeniu: technologie, narzędzia, metodyki, obszary odpowiedzialności. Nie chodzi o ich upychanie, tylko o to, żeby te, które faktycznie Cię dotyczą, w ogóle w CV wystąpiły i były widoczne. Poniżej metoda ręczna, miejsca, w których mają największy sens, i wyjaśnienie, dlaczego przesada obraca się przeciwko Tobie.</p>

<h2>Czym są dla systemu, a czym dla rekrutera</h2>
<p>System rekrutacyjny traktuje je dosłownie. Rekruter wpisuje w wyszukiwarkę frazę i dostaje listę zgłoszeń, w których ta fraza występuje. Jeśli w Twoim CV jej nie ma, nie pojawiasz się na liście, choćbyś umiał dokładnie to samo pod inną nazwą.</p>
<p>Człowiek robi to samo, tylko wzrokiem. Przy pierwszym przeglądzie rekruter skanuje dokument w kilkanaście sekund, szukając terminów, które zna z ogłoszenia. Nie czyta zdań w całości, tylko wyłapuje punkty zaczepienia.</p>
<p>Obie strony potrzebują więc tego samego: żeby właściwe nazwy występowały w CV i stały w miejscach, na które pada wzrok. Różnica polega tylko na tym, że system przeczyta cały plik, a człowiek pierwszy ekran.</p>

<h2>Jak znaleźć właściwe frazy w ogłoszeniu</h2>
<p>Nie każde słowo z ogłoszenia jest słowem kluczowym. Szukasz nazw, nie przymiotników.</p>
<ol>
<li><strong>Wypisz wszystkie nazwy własne.</strong> Programy, technologie, systemy, metodyki, certyfikaty, normy. To trzon listy.</li>
<li><strong>Dopisz nazwy obszarów odpowiedzialności.</strong> „Rozliczanie VAT", „obsługa reklamacji", „planowanie produkcji". To one opisują, czym się zajmujesz.</li>
<li><strong>Zaznacz nazwę stanowiska</strong> w brzmieniu, którego używa pracodawca.</li>
<li><strong>Odrzuć przymiotniki i frazesy.</strong> „Samodzielność", „zaangażowanie" i „umiejętność pracy pod presją" to nie są słowa kluczowe. Nikt ich nie wyszukuje i niczego nie różnicują.</li>
<li><strong>Podziel listę na dwie części:</strong> te, które faktycznie masz, i te, których nie masz. Pracujesz tylko na pierwszej.</li>
</ol>
<p>Zwykle zostaje kilkanaście pozycji, z czego realnie Twoich jest osiem, dziesięć. To jest materiał na resztę pracy.</p>

<div class="blog-cta-inline">
<p><strong>Pokrycie słów kluczowych jest u nas osobnym, mierzonym kryterium.</strong> Aplikando wyciąga wymagania z ogłoszenia, sprawdza, które mają odpowiednik w Twoim CV, i pokazuje wynik w rozbiciu na kryteria, gdzie pokrycie fraz pod ATS waży 10 ze 100 punktów. Widzisz nie tylko liczbę, ale i to, których konkretnie fraz zabrakło.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Ogłoszenie o pracę z wyróżnionymi frazami kluczowymi po lewej i lista wyciągniętych z niego terminów po prawej, podzielona na te obecne w CV i brakujące.">
  <img src="/blog/obrazki/slowa-kluczowe-w-cv-01.webp" alt="Frazy wyciągnięte z ogłoszenia podzielone na obecne i brakujące w CV" width="800" height="450" loading="lazy" />
  <figcaption>Z ogłoszenia zostaje kilkanaście nazw, nie cała jego treść</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic with two panels side by side, flat vector illustration style. The left panel shows a job advertisement wireframe with several short text bars, four of them highlighted in a soft accent colour, labelled in Polish above as "Ogłoszenie". The right panel shows a vertical list of six rounded tags split into two groups, the upper group in green and the lower in muted red, labelled in Polish above as "Wyciągnięte frazy", with small Polish sublabels reading "Masz w CV" above the green group and "Brakuje" above the red group. All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Frazy wyciągnięte z ogłoszenia podzielone na obecne i brakujące w CV". <strong>Podpis:</strong> "Z ogłoszenia zostaje kilkanaście nazw, nie cała jego treść". Plik: <code>slowa-kluczowe-w-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Gdzie je umieścić</h2>
<p>Miejsce ma znaczenie, bo decyduje o tym, czy fraza zostanie zauważona przez człowieka. Kolejność od najskuteczniejszego:</p>
<table>
<thead><tr><th>Miejsce</th><th>Co tam wstawić</th></tr></thead>
<tbody>
<tr><td>Podsumowanie zawodowe</td><td>Nazwę stanowiska i dwie, trzy najważniejsze frazy z wymagań obowiązkowych</td></tr>
<tr><td>Sekcja umiejętności</td><td>Nazwy narzędzi i technologii, w brzmieniu z ogłoszenia, na początku listy</td></tr>
<tr><td>Punkty przy ostatnim stanowisku</td><td>Frazy wplecione w opis tego, co faktycznie robiłeś</td></tr>
<tr><td>Nazwy stanowisk w doświadczeniu</td><td>Jeśli Twoje stanowisko nazywało się inaczej, dopisz w nawiasie odpowiednik znany na rynku</td></tr>
<tr><td>Sekcja projektów</td><td>Technologie użyte w konkretnym projekcie, razem z jego opisem</td></tr>
</tbody>
</table>
<p>Najlepiej działa fraza występująca w dwóch miejscach: raz na liście umiejętności, raz w kontekście, czyli w punkcie opisującym, co konkretnie z nią robiłeś. Pierwsze załatwia wyszukiwanie, drugie wiarygodność.</p>

<h2>Dlaczego upychanie szkodzi</h2>
<p>Pokusa jest oczywista: skoro system szuka fraz, wystarczy wstawić ich jak najwięcej. W praktyce kończy się to trzema problemami.</p>
<p>Pierwszy jest ludzki. CV z listą czterdziestu technologii wygląda niewiarygodnie, bo nikt nie zna czterdziestu narzędzi na poziomie wartym wpisania. Rekruter zakłada wtedy, że lista jest życzeniowa, i przestaje ufać całej reszcie dokumentu.</p>
<p>Drugi jest praktyczny. Każda fraza w CV jest zaproszeniem do pytania na rozmowie. Wpisując narzędzie, którego użyłeś raz na szkoleniu, sam ustawiasz sobie pytanie, na które nie odpowiesz.</p>
<p>Trzeci dotyczy sztuczek technicznych. Biały tekst na białym tle, frazy ukryte w metadanych pliku albo wklejone drobną czcionką na dole strony to metody znane od lat. Wychodzą przy pobieżnym sprawdzeniu i są traktowane inaczej niż zwykłe niedopasowanie, bo dotyczą próby obejścia procesu rekrutacji.</p>
<p>Sensowna granica jest prosta: fraza wchodzi do CV wtedy, gdy potrafisz opowiedzieć o niej dwa zdania. Jeśli nie potrafisz, jej tam nie ma.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba przy laptopie z otwartym ogłoszeniem i dokumentem CV, robiąca listę fraz na kartce. Etap analizy przed poprawą dokumentu.">
  <img src="/blog/obrazki/slowa-kluczowe-w-cv-02.webp" alt="Kandydat wypisujący frazy z ogłoszenia na kartce" width="800" height="450" loading="lazy" />
  <figcaption>Lista fraz powstaje raz, potem wraca przy każdej podobnej ofercie</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person at a desk writing a short list on a paper notepad while looking at a laptop screen, pen in hand, soft natural daylight from a window, shallow depth of field, warm neutral tones, screen content blurred and unreadable, no visible readable text or logos, focused analytical mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat wypisujący frazy z ogłoszenia na kartce". <strong>Podpis:</strong> "Lista fraz powstaje raz, potem wraca przy każdej podobnej ofercie". Plik: <code>slowa-kluczowe-w-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Odmiana i skróty: na co uważać po polsku</h2>
<p>Polska fleksja komplikuje wyszukiwanie bardziej niż angielska. „Zarządzanie projektami" i „zarządzał projektami" to dla wyszukiwarki dwie różne frazy, choć dla człowieka jedna.</p>
<p>Bezpieczna praktyka jest taka: nazwę własną zapisz w mianowniku przynajmniej raz, na liście umiejętności, a w opisie doświadczenia używaj jej naturalnie, w dowolnej formie. Przy skrótach podaj obie wersje przy pierwszym użyciu, na przykład „Google Analytics 4 (GA4)". Kosztuje to trzy znaki, a pokrywa oba warianty wyszukiwania.</p>

<h2>Jak sprawdzić pokrycie</h2>
<p>Najprostsza metoda ręczna zajmuje pięć minut. Weź swoją listę fraz z ogłoszenia, otwórz CV i użyj wyszukiwania w dokumencie, przechodząc pozycja po pozycji.</p>
<p>Przy każdej frazie odpowiedz sobie na trzy pytania: czy w ogóle występuje, czy występuje w brzmieniu z ogłoszenia i czy stoi w miejscu, na które pada wzrok w pierwszych sekundach. Trzy razy „tak" znaczy, że ta fraza działa.</p>
<p>Nie oczekuj stu procent. Pełne pokrycie wymagań zdarza się rzadko i nie jest warunkiem aplikowania. Sensowny cel to większość wymagań obowiązkowych, przy czym te powtórzone w ogłoszeniu kilka razy powinny znaleźć się w CV na pewno.</p>
<p>Jeśli w trakcie tego przeglądu okaże się, że brakuje nie fraz, tylko całych obszarów doświadczenia, to nie jest problem do rozwiązania edycją słów. Wtedy wracasz o krok wcześniej, do <a href="/blog/dopasowanie-cv-do-oferty">dopasowania CV do oferty</a>, a przy samej sekcji umiejętności pomoże tekst o tym, <a href="/blog/umiejetnosci-w-cv">co wpisać, a czego nie</a>. Techniczne tło całego procesu, czyli to, jak plik jest odczytywany po drugiej stronie, opisuje artykuł o <a href="/blog/ats-cv">systemach ATS</a>.</p>`,
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
