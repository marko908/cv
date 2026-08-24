import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Podsumowanie zawodowe w CV: jak napisać + przykłady",
      slug: "podsumowanie-zawodowe-cv",
      zajawka:
        "Podsumowanie zawodowe w trzech zdaniach: struktura, pięć gotowych przykładów dla różnych stanowisk i frazesy, które kasują jego wartość.",
      meta_tytul: "Podsumowanie zawodowe w CV: jak napisać, przykłady",
      meta_opis:
        "Jak napisać podsumowanie zawodowe do CV? Struktura w trzech zdaniach, 5 przykładów dla różnych stanowisk i błędy, które je psują.",
      kategoria: "pisanie CV",
      tagi: ["cv", "podsumowanie zawodowe", "profil zawodowy"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Górna część CV z sekcją podsumowania zawodowego",
      faq: [
        {
          pytanie: "Czy podsumowanie zawodowe w CV jest konieczne?",
          odpowiedz:
            "Nie jest obowiązkowe, ale przy jednej stronie CV to najlepiej wykorzystane trzy linijki. Rekruter czyta je jako pierwsze i na ich podstawie decyduje, czy przejrzeć resztę uważnie.",
        },
        {
          pytanie: "Ile zdań powinno mieć podsumowanie zawodowe?",
          odpowiedz:
            "Od dwóch do czterech, w sumie 40-60 słów. Dłuższy tekst przestaje być podsumowaniem i zaczyna konkurować z sekcją doświadczenia, którą i tak przeczyta rekruter zainteresowany szczegółami.",
        },
        {
          pytanie: "Czym różni się podsumowanie zawodowe od sekcji „O mnie"?",
          odpowiedz:
            "To ta sama sekcja pod inną nazwą. „Podsumowanie zawodowe" brzmi bardziej konkretnie i lepiej pasuje do CV z doświadczeniem, „O mnie" częściej pojawia się w CV absolwentów.",
        },
        {
          pytanie: "Czy podsumowanie trzeba zmieniać przy każdej aplikacji?",
          odpowiedz:
            "Tak, jeśli aplikujesz na różne stanowiska. To sekcja najmocniej związana z konkretną ofertą, bo w trzech zdaniach ustawia perspektywę, z której rekruter przeczyta resztę dokumentu.",
        },
      ],
      tresc: `<p>Podsumowanie zawodowe to dwa do czterech zdań na górze CV, które mówią, kim jesteś zawodowo, co potrafisz i czego szukasz. Nie jest obowiązkowe, ale to pierwsze, co czyta rekruter, więc decyduje o tym, z jakim nastawieniem przejrzy resztę. Poniżej struktura, pięć przykładów do przerobienia i błędy, które zamieniają tę sekcję w wypełniacz.</p>

<h2>Po co rekruterowi Twoje podsumowanie</h2>
<p>Przy kilkuset zgłoszeniach na jedno stanowisko pierwszy przegląd CV jest szybki. Rekruter szuka odpowiedzi na jedno pytanie: czy ta osoba w ogóle pasuje do stanowiska, o którym mowa. Podsumowanie daje mu tę odpowiedź od razu, zamiast kazać jej szukać w datach i nazwach firm.</p>
<p>Druga funkcja jest subtelniejsza. Podsumowanie ustawia perspektywę. Ta sama historia zawodowa przeczytana po zdaniu o specjalizacji w analizie danych wygląda inaczej niż przeczytana bez żadnego wprowadzenia. Nie zmieniasz faktów, tylko porządkujesz je zawczasu.</p>
<p>Dlatego pusta sekcja albo trzy zdania frazesów to strata najcenniejszego miejsca w dokumencie.</p>

<h2>Struktura w trzech zdaniach</h2>
<p>Sprawdza się prosty szkielet, w którym każde zdanie ma jedno zadanie:</p>
<ol>
<li><strong>Kim jesteś zawodowo</strong> - stanowisko lub specjalizacja plus staż. To zdanie ma odpowiadać nazwie stanowiska z ogłoszenia.</li>
<li><strong>Co potrafisz najlepiej</strong> - dwie, trzy konkretne kompetencje albo obszary, najlepiej z liczbą lub skalą.</li>
<li><strong>Czego szukasz</strong> - jedno zdanie o kierunku, w którym chcesz iść, powiązane z tą konkretną ofertą.</li>
</ol>
<p>Trzecie zdanie bywa pomijane i nie zawsze jest błędem, ale to ono odróżnia podsumowanie napisane pod ofertę od uniwersalnego akapitu wklejanego wszędzie.</p>

<div class="blog-cta-inline">
<p><strong>Podsumowanie to sekcja, która najbardziej zyskuje na dopasowaniu.</strong> W Aplikando jest jedynym polem przepisywanym w całości pod konkretne ogłoszenie - reszta CV jest chroniona przed zmianami, a wynik przed i po widzisz obok siebie, razem z uzasadnieniem każdej poprawki.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Schemat trzech zdań podsumowania zawodowego jako trzy poziome bloki, każdy z etykietą opisującą jego funkcję: kim jestem, co potrafię, czego szukam.">
  <img src="/blog/obrazki/podsumowanie-zawodowe-cv-01.webp" alt="Schemat budowy podsumowania zawodowego z trzech zdań" width="800" height="450" loading="lazy" />
  <figcaption>Każde zdanie ma jedno zadanie, żadne się nie powtarza</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing three stacked horizontal blocks representing three sentences of a CV professional summary, flat vector illustration style, each block numbered 1, 2 and 3 on the left. Polish labels rendered clearly in a modern sans-serif font: the first block labeled "Kim jestem zawodowo", the second labeled "Co potrafię najlepiej", the third labeled "Czego szukam". A short Polish heading at the top reads "Podsumowanie zawodowe". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Schemat budowy podsumowania zawodowego z trzech zdań". <strong>Podpis:</strong> "Każde zdanie ma jedno zadanie, żadne się nie powtarza". Plik: <code>podsumowanie-zawodowe-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Pięć przykładów do przerobienia</h2>
<p>Przykłady są celowo z różnych branż i różnych etapów kariery. Traktuj je jak szkielet, nie jak gotowy tekst do skopiowania - wklejone bez zmian brzmią tak samo jak u wszystkich, którzy zrobili to samo.</p>

<h3>Specjalista do spraw marketingu, 4 lata doświadczenia</h3>
<blockquote><p>Specjalista marketingu z czteroletnim doświadczeniem w e-commerce. Prowadzę kampanie Google Ads i Meta Ads o budżecie do 40 tys. zł miesięcznie, odpowiadam za raportowanie efektów w Looker Studio. Szukam roli, w której będę mogła połączyć płatne kampanie z pracą nad treścią na stronie.</p></blockquote>

<h3>Programista, 6 lat doświadczenia</h3>
<blockquote><p>Programista backendu z sześcioletnim stażem, głównie Java i Spring. Pracowałem przy systemach obsługujących kilkadziesiąt tysięcy zapytań dziennie, ostatnio przy migracji monolitu do usług. Chcę rozwijać się w kierunku architektury systemów rozproszonych.</p></blockquote>

<h3>Księgowa, 10 lat doświadczenia</h3>
<blockquote><p>Samodzielna księgowa z dziesięcioletnim doświadczeniem w biurze rachunkowym. Prowadzę pełną księgowość dla 15 spółek, rozliczam VAT, CIT i JPK, obsługuję kontrole podatkowe. Szukam pracy w dziale finansowym firmy produkcyjnej.</p></blockquote>

<h3>Absolwentka bez doświadczenia zawodowego</h3>
<blockquote><p>Absolwentka logistyki na Politechnice Śląskiej. Podczas studiów prowadziłam projekt optymalizacji tras dostaw w kole naukowym i odbyłam trzymiesięczną praktykę w dziale planowania produkcji. Szukam pierwszej pracy w obszarze planowania łańcucha dostaw.</p></blockquote>

<h3>Osoba zmieniająca branżę</h3>
<blockquote><p>Przez siedem lat prowadziłem zespół w obsłudze klienta, ostatnie dwa lata odpowiadając za raportowanie wskaźników jakości. Równolegle ukończyłem kurs analizy danych i pracuję w SQL oraz Power BI. Szukam roli analityka, w której doświadczenie w kontakcie z klientem będzie atutem.</p></blockquote>

<h2>Frazesy, które kasują wartość podsumowania</h2>
<p>Najczęstszy błąd to opisanie cech zamiast faktów. Zdania w rodzaju „jestem osobą komunikatywną, zaangażowaną i zorientowaną na cel" pojawiają się w takiej liczbie CV, że rekruter przestaje je czytać. Nie da się ich sprawdzić i nie odróżniają Cię od nikogo.</p>
<table>
<thead><tr><th>Frazes</th><th>Co napisać zamiast</th></tr></thead>
<tbody>
<tr><td>Jestem osobą komunikatywną</td><td>Prowadziłem szkolenia produktowe dla 30-osobowego działu sprzedaży</td></tr>
<tr><td>Szybko się uczę</td><td>W ciągu trzech miesięcy przejąłem obsługę nowego systemu magazynowego</td></tr>
<tr><td>Jestem zorientowany na cel</td><td>Realizowałem plan sprzedażowy w 11 na 12 miesięcy 2025 roku</td></tr>
<tr><td>Posiadam duże doświadczenie</td><td>Sześć lat pracy przy systemach płatności, w tym dwa jako lider zespołu</td></tr>
</tbody>
</table>
<p>Druga pułapka to podsumowanie napisane wyłącznie o Twoich oczekiwaniach: czego szukasz, gdzie chcesz się rozwijać, jakiej atmosfery pracy potrzebujesz. To ważne, ale rekruter na tym etapie ocenia dopasowanie do stanowiska, nie Twoje preferencje. Jedno zdanie o kierunku wystarczy.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba pisząca na laptopie górną część CV, na ekranie widoczny krótki akapit tekstu, obok kubek kawy. Spokojna praca nad dokumentem.">
  <img src="/blog/obrazki/podsumowanie-zawodowe-cv-02.webp" alt="Kandydatka pisząca podsumowanie zawodowe do swojego CV" width="800" height="450" loading="lazy" />
  <figcaption>Trzy zdania, nad którymi warto usiąść dłużej niż nad resztą</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person writing on a laptop at a bright desk, a short paragraph of blurred placeholder text visible on the screen, a cup of coffee beside the laptop, soft natural daylight, shallow depth of field, warm neutral tones, no visible readable text or logos, focused and calm mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydatka pisząca podsumowanie zawodowe do swojego CV". <strong>Podpis:</strong> "Trzy zdania, nad którymi warto usiąść dłużej niż nad resztą". Plik: <code>podsumowanie-zawodowe-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Jak dopasować podsumowanie do konkretnej oferty</h2>
<p>Zacznij od nazwy stanowiska. Jeśli ogłoszenie mówi o specjaliście do spraw obsługi klienta, a Ty w podsumowaniu piszesz o doradcy klienta, rekruter zrobi to tłumaczenie w głowie, ale system rekrutacyjny szukający dokładnej frazy już nie.</p>
<p>Potem przejrzyj wymagania obowiązkowe z ogłoszenia i sprawdź, czy dwa lub trzy z nich pojawiają się w Twoich zdaniach o kompetencjach. Nie chodzi o przepisywanie ogłoszenia, tylko o to, żeby najważniejsze dla pracodawcy rzeczy stały na górze, a nie w czwartym punkcie trzeciego stanowiska.</p>
<p>Na koniec ostatnie zdanie: kierunek, w którym chcesz iść, powinien pasować do tego, co ta firma faktycznie oferuje. Podsumowanie zapowiadające chęć pracy z zespołem rozproszonym w ogłoszeniu na stanowisko wyłącznie stacjonarne działa przeciwko Tobie.</p>
<p>Przy takim tempie zmian sekcja umiejętności też wymaga przeglądu przy każdej aplikacji, a jej porządkowanie opisuje osobny tekst o tym, dlaczego <a href="/blog/paski-umiejetnosci-cv">paski poziomu przy umiejętnościach nie działają</a>. Jeśli podsumowanie rozrasta Ci się kosztem reszty dokumentu, pomocny będzie też tekst o tym, <a href="/blog/ile-stron-cv">ile stron powinno mieć CV</a>.</p>`,
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
