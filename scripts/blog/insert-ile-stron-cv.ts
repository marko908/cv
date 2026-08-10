import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Ile stron powinno mieć CV? Zasady i wyjątki",
      slug: "ile-stron-cv",
      zajawka:
        "Jedna strona czy dwie? Sprawdź, kiedy krótkie CV wystarczy, kiedy druga strona ma sens i co wyciąć najpierw, gdy tekstu jest za dużo.",
      meta_tytul: "Ile stron powinno mieć CV? Zasady i wyjątki",
      meta_opis:
        "Ile stron powinno mieć CV - jedna czy dwie? Zasada dla większości kandydatów, wyjątki dla doświadczonych i jak skrócić CV bez utraty treści.",
      kategoria: "pisanie CV",
      tagi: ["cv", "długość cv", "ats"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Kandydat porównujący jedną i dwie wersje swojego CV",
      faq: [
        {
          pytanie: "Czy CV może mieć dwie strony?",
          odpowiedz:
            "Tak, jeśli masz odpowiednio dużo istotnego doświadczenia - zwykle powyżej 5-10 lat pracy albo rozbudowany dorobek projektowy. Przy krótszym stażu jedna strona zwykle wystarcza.",
        },
        {
          pytanie: "Ile stron CV dla absolwenta bez doświadczenia?",
          odpowiedz:
            "Jedna strona. Przy braku doświadczenia zawodowego druga strona najczęściej oznacza wypełniacze, a nie realną treść dla rekrutera.",
        },
        {
          pytanie: "Czy dłuższe CV zwiększa szanse na rozmowę?",
          odpowiedz:
            "Nie ma takiej zależności. Liczy się to, czy treść odpowiada wymaganiom konkretnej oferty, nie liczba stron dokumentu.",
        },
        {
          pytanie: "Czy systemy ATS mają limit stron CV?",
          odpowiedz:
            "Nie, ATS skanuje cały plik tekstowy niezależnie od długości. Limit narzuca w praktyce czas, jaki rekruter poświęca na ręczny przegląd wyników.",
        },
      ],
      tresc: `<p>Dobre CV mieści się na jednej stronie, jeśli masz mniej niż 5 lat doświadczenia zawodowego - to najczęstsza rekomendacja rekruterów. Druga strona ma sens dopiero przy dłuższym stażu, wielu projektach albo gdy oferta wymaga precyzyjnego opisania konkretnych kompetencji.</p>

<h2>Krótka odpowiedź: ile stron powinno mieć CV</h2>
<p>Jedna strona - dla większości kandydatów na starcie i w pierwszych latach kariery. Dwie strony - dla osób z ugruntowanym doświadczeniem, długą listą projektów albo licznymi certyfikatami istotnymi dla danej oferty. Trzy strony i więcej praktycznie nigdy się nie sprawdzają - taka objętość rozmywa to, co w CV najważniejsze.</p>
<p>Nie ma jednego przepisu, który pasuje do każdej branży i każdego etapu kariery. Liczba stron powinna wynikać z ilości treści faktycznie istotnej dla konkretnej oferty, nie z chęci zapełnienia dokumentu.</p>

<h2>Kiedy jedna strona wystarczy</h2>
<p>Przy stażu do 5 lat jedna strona to zwykle optymalny wybór. Rekruter poświęca pierwszemu przeglądowi CV kilkanaście sekund - krótki dokument zwiększa szansę, że w tym czasie zobaczy to, co najważniejsze, zamiast gubić się w przewijaniu.</p>
<p>Dotyczy to też absolwentów i osób na początku kariery, dla których dwie strony często oznaczają rozciąganie treści wypełniaczami, a nie realną wartość dla rekrutera.</p>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Prosta infografika porównująca dwa warianty CV obok siebie - jednostronicowe dla osoby na starcie kariery i dwustronicowe dla seniora, z podpisanymi progami doświadczenia.">
  <img src="/blog/obrazki/ile-stron-cv-01.webp" alt="Porównanie CV jednostronicowego i dwustronicowego w zależności od stażu pracy" width="800" height="450" loading="lazy" />
  <figcaption>Jedna strona przy stażu do 5 lat, druga dopiero przy dłuższym dorobku</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean flat-design infographic comparing two CV page mockups side by side, left one labeled as a single page with a short career timeline icon, right one labeled as two pages with a longer timeline icon, minimal wireframe text blocks in gray, soft blue accent color, plenty of white space, no real readable text, professional vector illustration style. <strong>Alt:</strong> "Porównanie CV jednostronicowego i dwustronicowego w zależności od stażu pracy". <strong>Podpis:</strong> "Jedna strona przy stażu do 5 lat, druga dopiero przy dłuższym dorobku". Plik: <code>ile-stron-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Kiedy dwie strony są uzasadnione</h2>
<p>Druga strona ma sens, gdy masz za sobą kilkanaście lat pracy, kilka stanowisk wymagających osobnego opisania albo dorobek, którego nie da się rzetelnie streścić na jednej kartce - programiści z długą listą projektów, naukowcy z publikacjami, menedżerowie z udokumentowanymi wynikami zespołów.</p>
<p>Druga strona nie jest nagrodą za staż - to konsekwencja ilości treści, która faktycznie ma znaczenie dla danej oferty. Jeśli po usunięciu wszystkiego nieistotnego dalej nie mieścisz się na jednej stronie, druga jest uzasadniona.</p>
<h3>Ile stron CV przy jakim doświadczeniu</h3>
<table>
<thead><tr><th>Etap kariery</th><th>Zalecana długość</th></tr></thead>
<tbody>
<tr><td>Student, absolwent, pierwsza praca</td><td>1 strona</td></tr>
<tr><td>Do 5 lat doświadczenia</td><td>1 strona</td></tr>
<tr><td>5-10 lat, kilka stanowisk</td><td>1-2 strony</td></tr>
<tr><td>Ponad 10 lat, senior lub ekspert</td><td>2 strony</td></tr>
<tr><td>Dorobek naukowy, długa lista publikacji</td><td>2 strony i więcej (CV akademickie rządzą się innymi zasadami)</td></tr>
</tbody>
</table>

<h2>Co wyciąć najpierw, gdy CV się nie mieści</h2>
<p>Zanim dodasz drugą stronę, sprawdź, co realnie nie wnosi nic do konkretnej aplikacji:</p>
<ul>
<li>Doświadczenie sprzed ponad 10-15 lat, niezwiązane z obecnym profilem</li>
<li>Obowiązki opisane ogólnikowo, bez konkretnego efektu</li>
<li>Umiejętności, których dana oferta w ogóle nie wymaga</li>
<li>Kursy i szkolenia bez związku z branżą, do której aplikujesz</li>
<li>Rozbudowane zdania tam, gdzie wystarczy jeden mocny punkt</li>
</ul>
<p>Kolejność cięcia ma znaczenie: najpierw usuwaj to, co nieistotne dla tej konkretnej oferty, dopiero potem skracaj to, co zostało. Zanim jednak zaczniesz skracać, sprawdź też, czy Twoje CV ma <a href="/blog/klauzula-rodo-w-cv">aktualną klauzulę RODO</a> - to jeden z tych drobiazgów, które łatwo przeoczyć przy przycinaniu treści.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba redagująca swoje CV na ekranie laptopa, skreślająca lub zaznaczająca fragmenty tekstu do usunięcia, skupiony wyraz twarzy, jasne biurowe wnętrze.">
  <img src="/blog/obrazki/ile-stron-cv-02.webp" alt="Kandydat skracający swoje CV, usuwając zbędne fragmenty" width="800" height="450" loading="lazy" />
  <figcaption>Skracanie CV zaczyna się od usunięcia tego, co nieistotne dla oferty</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person at a bright modern desk editing a document on a laptop screen, focused expression, printed pages with visible highlighter marks next to the laptop, natural window light, neutral warm tones, shallow depth of field, no readable text or logos. <strong>Alt:</strong> "Kandydat skracający swoje CV, usuwając zbędne fragmenty". <strong>Podpis:</strong> "Skracanie CV zaczyna się od usunięcia tego, co nieistotne dla oferty". Plik: <code>ile-stron-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Jak skrócić CV bez utraty treści</h2>
<p>Skracanie nie polega na obcinaniu zdań w połowie sensu, tylko na zamianie opisu obowiązków na jeden, konkretny efekt liczbowy. Zdanie "Odpowiadałem za obsługę klientów i rozwiązywanie ich problemów" da się zastąpić krótszym i mocniejszym: "Obsłużyłem średnio 40 zgłoszeń dziennie, utrzymując czas odpowiedzi poniżej 2 godzin".</p>
<p>Druga dźwignia to marginesy i odstępy - zbyt szerokie marginesy i duża interlinia potrafią wydłużyć CV o pół strony bez dodania jednej nowej informacji. Trzecia to same nagłówki sekcji: "Podsumowanie doświadczenia zawodowego" można skrócić do "Doświadczenie" bez straty sensu.</p>
<p>Przy dopasowywaniu CV do konkretnej oferty w <a href="/">Aplikando</a> ten sam mechanizm - wybór, co jest istotne akurat dla tego ogłoszenia - działa automatycznie: system wskazuje, które fragmenty CV pokrywają wymagania z oferty, a które są dla niej bez znaczenia.</p>

<h2>Czy systemy ATS czytają drugą stronę CV</h2>
<p>Tak - system ATS (Applicant Tracking System) skanuje cały plik, niezależnie od liczby stron, o ile dokument ma format tekstowy, a nie zeskanowany obraz. Długość CV nie wpływa na to, czy system je "przeczyta".</p>
<p>Wpływa za to na to, co zobaczy rekruter, który przegląda wyniki z ATS ręcznie - a to on, nie system, podejmuje decyzję o zaproszeniu na rozmowę. Dlatego druga strona ma sens tylko wtedy, gdy realnie ułatwia mu tę decyzję, a nie tylko wtedy, gdy system technicznie ją odczyta.</p>`,
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
