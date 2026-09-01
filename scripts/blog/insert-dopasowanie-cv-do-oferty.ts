import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Jak dopasować CV do oferty pracy: instrukcja krok po kroku",
      slug: "dopasowanie-cv-do-oferty",
      zajawka:
        "Pełna metoda ręczna: jak czytać ogłoszenie, co zmieniać w CV, czego nie ruszać i ile to naprawdę zajmuje przy każdej kolejnej aplikacji.",
      meta_tytul: "Jak dopasować CV do oferty pracy krok po kroku",
      meta_opis:
        "Instrukcja dopasowania CV do konkretnej oferty: analiza ogłoszenia, co zmienić, czego nie ruszać i jak sprawdzić efekt przed wysłaniem.",
      kategoria: "szukanie pracy",
      tagi: ["cv", "dopasowanie", "rekrutacja"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Ogłoszenie o pracę i CV zestawione obok siebie na biurku",
      faq: [
        {
          pytanie: "Czy naprawdę trzeba zmieniać CV pod każdą ofertę?",
          odpowiedz:
            "Nie całe CV, tylko jego górną część i akcenty: podsumowanie, kolejność umiejętności i to, które punkty doświadczenia opisujesz najszerzej. Historia zatrudnienia zostaje bez zmian.",
        },
        {
          pytanie: "Ile czasu zajmuje dopasowanie CV do jednej oferty?",
          odpowiedz:
            "Za pierwszym razem od 30 do 60 minut, bo trzeba przeanalizować ogłoszenie i przepisać podsumowanie. Przy kolejnych ofertach z tej samej rodziny stanowisk schodzi to do kilkunastu minut.",
        },
        {
          pytanie: "Czy przepisywać do CV zwroty z ogłoszenia?",
          odpowiedz:
            "Nazewnictwo tak, treść nie. Jeśli nazywasz to samo inaczej niż pracodawca, użyj jego nazwy. Nie przepisuj natomiast obowiązków, których nie wykonywałeś, bo CV przestanie opisywać Twoją pracę.",
        },
        {
          pytanie: "Co zrobić, gdy nie spełniam wszystkich wymagań?",
          odpowiedz:
            "Aplikuj, jeśli spełniasz większość obowiązkowych. Wymagania mile widziane są listą życzeń, a nie progiem wejścia. Pokaż wyraźnie to, co masz, zamiast maskować to, czego brakuje.",
        },
      ],
      tresc: `<p class="image-prompt">📷 <strong>OKŁADKA</strong> - prompt: A realistic wide photo of two printed documents lying side by side on a light wooden desk, a highlighter and pen resting between them, a laptop softly blurred in the background, soft natural daylight, shallow depth of field, warm professional tones, no visible readable text or logos, focused analytical mood, shot in 2:1 landscape framing. <strong>Alt:</strong> "Ogłoszenie o pracę i CV zestawione obok siebie na biurku". Plik: <code>dopasowanie-cv-do-oferty-okladka.webp</code>, format 2:1 (np. 1200×600 px). <strong>Po wgraniu okładki w polu „Okładka" usuń ten akapit.</strong></p>

<p>Dopasowanie CV do oferty nie polega na pisaniu dokumentu od nowa przy każdej aplikacji. Zmieniasz jego górną część i akcenty, a historia zatrudnienia zostaje ta sama. Poniżej pełna metoda ręczna: jak czytać ogłoszenie, co konkretnie zmienić, czego nie wolno ruszać i ile to zajmuje.</p>

<h2>Dlaczego jedno CV do wszystkiego nie działa</h2>
<p>Uniwersalne CV jest napisane dla nikogo konkretnego, więc przy każdym ogłoszeniu wypada przeciętnie. Rekruter szuka odpowiedzi na pytanie, czy ta osoba pasuje do tego stanowiska, a dokument, który równie dobrze pasuje do pięciu innych, tej odpowiedzi nie daje.</p>
<p>Druga rzecz jest bardziej mechaniczna. Jeśli w ogłoszeniu stoi konkretne narzędzie albo obszar, a w Twoim CV występuje pod inną nazwą albo w czwartym punkcie trzeciego stanowiska, informacja formalnie jest, ale nie działa. Ani człowiek przy szybkim przeglądzie, ani wyszukiwarka w systemie rekrutacyjnym jej nie zauważą.</p>
<p>Trzecia to kolejność. Ta sama treść przeczytana w innej kolejności zostawia inne wrażenie, bo pierwsze linijki ustawiają odbiór reszty.</p>

<h2>Jak czytać ogłoszenie</h2>
<p>Zanim ruszysz CV, rozłóż ogłoszenie na części. Zajmuje to kilka minut i decyduje o całej reszcie pracy.</p>
<ol>
<li><strong>Rozdziel wymagania obowiązkowe od mile widzianych.</strong> Zwykle są w osobnych blokach, czasem trzeba je rozpoznać po sformułowaniach: „wymagamy” i „konieczne” kontra „mile widziane”, „dodatkowym atutem będzie”.</li>
<li><strong>Wypisz nazwy własne.</strong> Narzędzia, technologie, metodyki, systemy, certyfikaty. Zapisz je dokładnie w brzmieniu z ogłoszenia.</li>
<li><strong>Znajdź powtórzenia.</strong> To, co pojawia się w opisie stanowiska, w wymaganiach i jeszcze w zakresie obowiązków, jest dla pracodawcy najważniejsze.</li>
<li><strong>Zwróć uwagę na kolejność.</strong> Pierwsze trzy wymagania z listy zwykle nie znalazły się tam przypadkiem.</li>
<li><strong>Odnotuj kontekst firmy.</strong> Wielkość, branża, model pracy. To wpływa na to, które z Twoich doświadczeń będzie brzmiało trafniej.</li>
</ol>
<p>Efektem tego kroku jest lista kilkunastu pozycji podzielona na obowiązkowe i dodatkowe. Dopiero mając ją przed sobą, ma sens otwieranie CV.</p>

<div class="blog-cta-inline">
<p><strong>To najżmudniejsza część i właśnie ją da się skrócić.</strong> Aplikando robi dokładnie ten rozbiór za Ciebie: wyciąga wymagania z ogłoszenia, zestawia je z faktami z Twojego CV i pokazuje, które są pokryte, a które nie. Dopasowanie do wymagań oferty jest w naszej rubryce najcięższym kryterium, wartym 40 ze 100 punktów, więc widzisz też, ile na tym realnie zyskujesz.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Ogłoszenie o pracę po lewej i CV po prawej, połączone liniami pokazującymi, które wymagania mają pokrycie w dokumencie, a które nie.">
  <img src="/blog/obrazki/dopasowanie-cv-do-oferty-01.webp" alt="Wymagania z ogłoszenia zestawione z treścią CV liniami pokrycia" width="800" height="450" loading="lazy" />
  <figcaption>Dopasowanie zaczyna się od zestawienia dwóch list, nie od pisania</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing two document wireframes side by side connected by thin lines between matching items, flat vector illustration style. The left document is labelled in Polish above as "Ogłoszenie" and shows a list of five short bars. The right document is labelled in Polish above as "Twoje CV". Three connecting lines are drawn in green and two requirement bars on the left are marked with a muted red dot. A short Polish label near the red dots reads "Brak pokrycia". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Wymagania z ogłoszenia zestawione z treścią CV liniami pokrycia". <strong>Podpis:</strong> "Dopasowanie zaczyna się od zestawienia dwóch list, nie od pisania". Plik: <code>dopasowanie-cv-do-oferty-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Instrukcja krok po kroku</h2>
<p>Mając rozłożone ogłoszenie, przejdź przez CV w tej kolejności. Idziesz od rzeczy, które dają największą różnicę, do drobiazgów.</p>
<ol>
<li><strong>Nazwa stanowiska w podsumowaniu.</strong> Jeśli ogłoszenie mówi o specjaliście do spraw obsługi klienta, a Ty piszesz o doradcy klienta, dostosuj nazwę do brzmienia z ogłoszenia, o ile opisuje to samo.</li>
<li><strong>Przepisz podsumowanie zawodowe.</strong> To jedyna sekcja, którą warto pisać od zera przy każdej ofercie. Wpleć w nią dwa albo trzy wymagania obowiązkowe, które faktycznie spełniasz.</li>
<li><strong>Przestaw kolejność umiejętności.</strong> Te wymienione w ogłoszeniu na górę, w brzmieniu z ogłoszenia. Zajmuje minutę, a zmienia to, co widać najpierw.</li>
<li><strong>Przejrzyj punkty przy ostatnim stanowisku.</strong> Rozbuduj te, które łączą się z ofertą, skróć albo usuń te, które z nią nie mają nic wspólnego. Nie dopisuj nowych zadań, tylko inaczej rozłóż akcenty na tym, co było.</li>
<li><strong>Sprawdź starsze stanowiska.</strong> Wszystko starsze niż dziesięć lat możesz skrócić do jednej linii, chyba że akurat tam siedzi doświadczenie najbliższe ofercie.</li>
<li><strong>Dopisz brakujący kontekst.</strong> Jeśli ogłoszenie kładzie nacisk na pracę w międzynarodowym zespole, a Ty faktycznie tak pracowałeś, ale nigdzie tego nie napisałeś, teraz jest moment.</li>
<li><strong>Przeczytaj całość od góry.</strong> Sprawdź, czy pierwsze piętnaście linijek odpowiada na pytanie, dlaczego pasujesz akurat na to stanowisko.</li>
</ol>
<p>Kroki drugi i trzeci dają najwięcej przy najmniejszym nakładzie. Jeśli masz czas tylko na dwie rzeczy, zrób właśnie te.</p>

<h2>Co zmieniać, a czego nie ruszać</h2>
<p>Granica jest prosta: dostosowujesz sposób opowiedzenia o swoim doświadczeniu, nie samo doświadczenie.</p>
<table>
<thead><tr><th>Zmieniaj przy każdej ofercie</th><th>Zostaw bez zmian</th></tr></thead>
<tbody>
<tr><td>Podsumowanie zawodowe</td><td>Nazwy firm i stanowisk</td></tr>
<tr><td>Kolejność umiejętności</td><td>Okresy zatrudnienia</td></tr>
<tr><td>Rozłożenie akcentów w punktach doświadczenia</td><td>Wykształcenie i uczelnie</td></tr>
<tr><td>Które projekty opisujesz szerzej</td><td>Poziomy języków i certyfikaty</td></tr>
<tr><td>Nazewnictwo tam, gdzie opisujesz to samo innym słowem</td><td>Liczby i wyniki, które osiągnąłeś</td></tr>
</tbody>
</table>
<p>Prawa kolumna to fakty. Ich zmiana nie jest dopasowaniem, tylko tworzeniem CV opisującego pracę, której nie było. Przy pierwszym pytaniu na rozmowie taka rozbieżność wychodzi i kosztuje więcej, niż dałoby jakiekolwiek dopasowanie.</p>
<p>Osobna pułapka to przepisywanie do CV całych fragmentów ogłoszenia. Kuszące, bo daje idealne pokrycie słów, ale tworzy dokument brzmiący jak opis stanowiska, a nie jak opis kandydata. O tym, jak pisać te punkty samodzielnie, jest osobny tekst: <a href="/blog/jak-opisac-doswiadczenie-w-cv">jak opisać doświadczenie w CV</a>.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba przy biurku z ogłoszeniem o pracę wydrukowanym obok laptopa z otwartym CV, zaznaczająca fragmenty markerem. Praca porównawcza nad dwoma dokumentami.">
  <img src="/blog/obrazki/dopasowanie-cv-do-oferty-02.webp" alt="Kandydat zaznaczający wymagania w wydrukowanym ogłoszeniu" width="800" height="450" loading="lazy" />
  <figcaption>Pierwsza aplikacja zajmuje godzinę, dziesiąta kilkanaście minut</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person at a desk with a printed job advertisement beside an open laptop, marking lines on the printed page with a highlighter, soft natural daylight from a window, shallow depth of field, warm neutral tones, screen content blurred, no visible readable text or logos, focused analytical mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat zaznaczający wymagania w wydrukowanym ogłoszeniu". <strong>Podpis:</strong> "Pierwsza aplikacja zajmuje godzinę, dziesiąta kilkanaście minut". Plik: <code>dopasowanie-cv-do-oferty-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Ile to zajmuje i co da się przyspieszyć</h2>
<p>Za pierwszym razem cała procedura zajmuje od trzydziestu do sześćdziesięciu minut. Najwięcej czasu pochłania rozbiór ogłoszenia i napisanie podsumowania od nowa.</p>
<p>Przy kolejnych aplikacjach na podobne stanowiska schodzi to do kilkunastu minut, bo pracujesz na gotowym materiale. Warto utrzymywać jedno pełne CV zawierające wszystko, co kiedykolwiek robiłeś, i traktować je jako magazyn, z którego wybierasz przy każdej ofercie.</p>
<p>Problem pojawia się przy skali. Przy dwudziestu aplikacjach miesięcznie ręczne dopasowanie zaczyna zajmować kilka godzin tygodniowo i to zwykle wtedy ludzie wracają do wysyłania jednego CV wszędzie. Wybór stoi między czasem a skutecznością, i to jest realny koszt, o którym poradniki zwykle milczą.</p>
<p>Co da się skrócić: rozbiór ogłoszenia, sprawdzenie pokrycia wymagań i przestawienie kolejności. Czego nie: decyzji o tym, co jest prawdą w Twoim CV. Jeśli chcesz wiedzieć, na czym dokładnie polega wyciąganie z ogłoszenia właściwych fraz, opisuje to tekst o <a href="/blog/umiejetnosci-w-cv">doborze umiejętności do CV</a>, a techniczną stronę odczytu dokumentu wyjaśnia artykuł o <a href="/blog/ats-cv">systemach ATS</a>.</p>`,
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
