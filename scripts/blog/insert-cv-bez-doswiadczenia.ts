import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "CV bez doświadczenia: co wpisać, gdy nie masz co wpisać",
      slug: "cv-bez-doswiadczenia",
      zajawka:
        "Pierwsze CV bez etatu za sobą: co liczy się jako doświadczenie, jak ustawić sekcje, co dać na górę i czego nie robić, żeby nie zaszkodzić sobie.",
      meta_tytul: "CV bez doświadczenia: co wpisać w pierwszym CV",
      meta_opis:
        "Jak napisać CV bez doświadczenia zawodowego. Co liczy się zamiast etatu, jak ułożyć sekcje, co dać na początek i jakich wypełniaczy unikać.",
      kategoria: "pisanie CV",
      tagi: ["cv", "pierwsza praca", "studenci"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Osoba pisząca swoje pierwsze CV przy laptopie",
      faq: [
        {
          pytanie: "Co wpisać w CV, jeśli nigdy nie pracowałem?",
          odpowiedz:
            "Projekty studenckie, koła naukowe, wolontariat, praktyki, prace dorywcze i własne projekty. Liczy się to, co robiłeś, a nie czy była za to umowa o pracę.",
        },
        {
          pytanie: "Czy wpisywać prace dorywcze niezwiązane z branżą?",
          odpowiedz:
            "Tak, jeśli CV jest krótkie. Praca w gastronomii czy magazynie pokazuje odpowiedzialność i pracę z ludźmi. Opisz ją krótko, bez rozbudowanych punktów, i nie stawiaj na pierwszym miejscu.",
        },
        {
          pytanie: "Ile stron powinno mieć CV bez doświadczenia?",
          odpowiedz:
            "Jedna. Przy braku etatu za sobą nie ma czego rozciągać na dwie strony, a próba wypełnienia miejsca na siłę jest widoczna od pierwszego spojrzenia.",
        },
        {
          pytanie: "Czy w pierwszym CV umieszczać sekcję zainteresowań?",
          odpowiedz:
            "Tylko jeśli mają związek ze stanowiskiem albo są na tyle konkretne, że staną się tematem rozmowy. „Muzyka, sport, podróże” to wypełniacz, który nie mówi nic.",
        },
      ],
      tresc: `<p>Brak etatu za sobą nie oznacza braku doświadczenia. Oznacza, że doświadczenie nazywa się inaczej: projekt zaliczeniowy, praktyka, wolontariat, praca dorywcza, własna strona zrobiona wieczorami. Pierwsze CV polega głównie na tym, żeby to nazwać i ułożyć w kolejności, która ma sens. Poniżej jak to zrobić i czego przy okazji nie robić.</p>

<h2>Co liczy się jako doświadczenie</h2>
<p>Rekruter rekrutujący na stanowisko juniorskie wie, że nie ma przed sobą osoby z pięcioletnim stażem. Szuka czegoś innego: śladów samodzielności, kontaktu z tematem i umiejętności doprowadzenia rzeczy do końca.</p>
<ul>
<li><strong>Praktyki i staże</strong>, także te krótkie i obowiązkowe. Liczy się to, co tam robiłeś, nie długość.</li>
<li><strong>Projekty studenckie i zaliczeniowe</strong>, zwłaszcza zespołowe i takie z konkretnym efektem: aplikacja, analiza, raport, kampania.</li>
<li><strong>Koła naukowe i organizacje studenckie</strong>, w szczególności role, w których za coś odpowiadałeś.</li>
<li><strong>Wolontariat</strong>, w tym jednorazowy przy dużych wydarzeniach, jeśli miałeś tam wyodrębnione zadanie.</li>
<li><strong>Prace dorywcze i sezonowe</strong>, nawet niezwiązane z kierunkiem. Pokazują, że umiesz pracować w zespole i wywiązywać się z grafiku.</li>
<li><strong>Własne projekty</strong>: strona internetowa, kanał, sklep, tłumaczenia, prowadzenie profilu organizacji.</li>
<li><strong>Kursy zakończone projektem</strong>, gdzie efektem jest coś, co da się pokazać, a nie tylko certyfikat.</li>
</ul>
<p>Zasada jest jedna: jeśli poświęciłeś czemuś czas, wykonałeś konkretne zadanie i możesz o tym opowiedzieć dwie minuty, to nadaje się do CV.</p>

<h2>Jak ułożyć sekcje, gdy doświadczenia brak</h2>
<p>Standardowe CV zaczyna się doświadczeniem, bo tam jest najmocniejszy materiał. Przy pierwszym CV kolejność się zmienia i to jest w porządku.</p>
<table>
<thead><tr><th>Kolejność sekcji</th><th>Dlaczego tak</th></tr></thead>
<tbody>
<tr><td>1. Dane osobowe</td><td>Zawsze na górze, bez zmian</td></tr>
<tr><td>2. Podsumowanie zawodowe</td><td>Trzy zdania, które tłumaczą, kim jesteś i czego szukasz</td></tr>
<tr><td>3. Wykształcenie</td><td>Przy braku etatu to Twój najmocniejszy formalny atut</td></tr>
<tr><td>4. Projekty i praktyki</td><td>Sekcja, która zastępuje klasyczne doświadczenie</td></tr>
<tr><td>5. Umiejętności</td><td>Narzędzia i technologie, które faktycznie znasz</td></tr>
<tr><td>6. Doświadczenie dodatkowe</td><td>Prace dorywcze, wolontariat, krótko i bez rozbudowy</td></tr>
<tr><td>7. Języki i kursy</td><td>Poziomy według skali, certyfikaty z rokiem</td></tr>
</tbody>
</table>
<p>Wykształcenie na trzecim miejscu przestaje mieć sens po dwóch, trzech latach pracy. Wtedy wraca na dół, a doświadczenie idzie do góry. Na tym etapie jednak jest tym, co masz najbardziej konkretnego.</p>

<div class="blog-cta-inline">
<p><strong>Przy pierwszym CV najtrudniejsze jest zacząć od pustej strony.</strong> Kreator w Aplikando prowadzi przez kolejne sekcje po kolei i pokazuje, czego jeszcze brakuje, żeby dokument był kompletny. Tworzenie CV i pobranie go w PDF są bezpłatne, więc możesz z niego skorzystać, zanim w ogóle pomyślisz o dopasowywaniu czegokolwiek do ofert.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Dwa układy CV zestawione obok siebie: standardowy z doświadczeniem na górze i wersja dla osoby bez doświadczenia, gdzie wyżej stoi wykształcenie i projekty.">
  <img src="/blog/obrazki/cv-bez-doswiadczenia-01.webp" alt="Porównanie układu sekcji w CV z doświadczeniem i bez niego" width="800" height="450" loading="lazy" />
  <figcaption>Przy pierwszym CV kolejność sekcji wygląda inaczej</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing two CV page wireframes side by side, flat vector illustration style, each built from stacked labelled section blocks. The left page is labelled in Polish above as "Z doświadczeniem" with blocks in order reading "Dane osobowe", "Doświadczenie", "Wykształcenie", "Umiejętności". The right page is labelled in Polish above as "Pierwsze CV" with blocks in order reading "Dane osobowe", "Wykształcenie", "Projekty", "Umiejętności", and the "Wykształcenie" and "Projekty" blocks are highlighted in a soft accent colour. All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Porównanie układu sekcji w CV z doświadczeniem i bez niego". <strong>Podpis:</strong> "Przy pierwszym CV kolejność sekcji wygląda inaczej". Plik: <code>cv-bez-doswiadczenia-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Jak opisać projekt, żeby brzmiał jak praca</h2>
<p>Projekt zaliczeniowy opisany jako „projekt na zaliczenie z baz danych” nie mówi nic. Ten sam projekt opisany jak zadanie zawodowe wygląda zupełnie inaczej, a nie wymaga to żadnej przesady.</p>
<p>Użyj tej samej konstrukcji, co przy opisie pracy: czasownik, co dokładnie, efekt albo skala. Dopisz rolę w zespole i narzędzia.</p>
<table>
<thead><tr><th>Zapis słaby</th><th>Zapis, który działa</th></tr></thead>
<tbody>
<tr><td>Projekt z baz danych</td><td>Zaprojektowałem bazę danych dla systemu wypożyczalni w zespole 4 osób, odpowiadałem za schemat i zapytania raportowe (PostgreSQL)</td></tr>
<tr><td>Wolontariat na festiwalu</td><td>Koordynowałem punkt informacyjny podczas trzydniowego festiwalu, obsługując kilkuset uczestników w zespole 6 wolontariuszy</td></tr>
<tr><td>Praktyki w biurze</td><td>Podczas miesięcznych praktyk wprowadzałem dokumenty do systemu księgowego i przygotowywałem zestawienia kosztów w Excelu</td></tr>
<tr><td>Prowadzenie fanpage koła</td><td>Prowadziłem profil koła naukowego na Instagramie, publikując 3 posty tygodniowo i zwiększając liczbę obserwujących z 200 do 900</td></tr>
</tbody>
</table>
<p>Liczby w prawej kolumnie nie są wynikami biznesowymi. To skala i ona wystarczy, żeby czytający zorientował się, o czym mowa. Więcej o samej konstrukcji punktu znajdziesz w tekście o tym, <a href="/blog/jak-opisac-doswiadczenie-w-cv">jak opisać doświadczenie w CV</a>.</p>

<h2>Czego nie robić</h2>
<p>Trzy błędy powtarzają się w pierwszych CV najczęściej i wszystkie wynikają z tego samego: z próby ukrycia, że doświadczenia jest mało.</p>
<p><strong>Zawyżanie.</strong> Wpisywanie miesięcznych praktyk jako rocznego stażu albo znajomości narzędzia po jednym szkoleniu jako umiejętności. Wychodzi przy pierwszym pytaniu o szczegóły i kosztuje więcej niż szczery brak.</p>
<p><strong>Wypełniacze.</strong> Rozciąganie CV do dwóch stron listą zainteresowań, kursów z pierwszego roku i szkolnych osiągnięć. Jedna strona z konkretem czyta się lepiej niż dwie z watą.</p>
<p><strong>Przepraszanie.</strong> Zdania w rodzaju „mimo braku doświadczenia zawodowego jestem chętny do nauki” osłabiają dokument. Rekruter wie, na jakie stanowisko rekrutuje. Nie musisz się tłumaczyć z etapu kariery, na którym jesteś.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Młoda osoba przy laptopie w domowym otoczeniu, pracująca nad dokumentem, obok notatnik z listą. Skupienie, spokojna atmosfera pierwszych przygotowań do rekrutacji.">
  <img src="/blog/obrazki/cv-bez-doswiadczenia-02.webp" alt="Absolwentka przygotowująca swoje pierwsze CV" width="800" height="450" loading="lazy" />
  <figcaption>Jedna strona z konkretem bije dwie wypełnione na siłę</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a young person working on a laptop at a home desk, an open notebook with a handwritten list beside them, soft natural daylight from a window, shallow depth of field, warm neutral tones, screen content blurred, no visible readable text or logos, calm and focused mood, shot on a 50mm lens. <strong>Alt:</strong> "Absolwentka przygotowująca swoje pierwsze CV". <strong>Podpis:</strong> "Jedna strona z konkretem bije dwie wypełnione na siłę". Plik: <code>cv-bez-doswiadczenia-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Co dać na samą górę</h2>
<p>Pierwsze piętnaście linijek decyduje o tym, czy reszta zostanie przeczytana uważnie. Przy braku doświadczenia trzeba je zaplanować świadomie.</p>
<p>Najlepiej działa krótkie podsumowanie, które nie udaje stażu, tylko mówi konkretnie: kierunek studiów, obszar, w którym już coś robiłeś, i czego szukasz. Trzy zdania wystarczą, a jak je zbudować, opisuje tekst o <a href="/blog/podsumowanie-zawodowe-cv">podsumowaniu zawodowym</a>.</p>
<p>Pod nim wykształcenie z nazwą kierunku i rokiem ukończenia, a jeśli praca dyplomowa dotyczy tematu bliskiego stanowisku, dopisz jej temat w jednej linii. To często najmocniejszy element pierwszego CV, a bywa pomijany.</p>
<p>Reszta może być krótka. Rekruter oceniający kandydata na stanowisko juniorskie i tak wie, że decyzja zapadnie na rozmowie. CV ma go do niej doprowadzić, nie zastąpić.</p>`,
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
