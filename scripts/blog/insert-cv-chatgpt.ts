import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Czy pisać CV przez ChatGPT? Co się przy tym psuje",
      slug: "cv-chatgpt",
      zajawka:
        "ChatGPT poprawi język Twojego CV, ale przy okazji dopisze rzeczy, których nie było. Gdzie ogólny model pomaga, gdzie szkodzi i jak używać go bezpiecznie.",
      meta_tytul: "Czy pisać CV przez ChatGPT? Co się przy tym psuje",
      meta_opis:
        "Czy warto pisać CV przez ChatGPT? Co model robi dobrze, gdzie dopisuje nieistniejące fakty i jak używać AI, żeby nie stracić wiarygodności.",
      kategoria: "pisanie CV",
      tagi: ["cv", "ai", "chatgpt"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Kandydat pracujący nad CV z pomocą narzędzia AI",
      faq: [
        {
          pytanie: "Czy rekruter pozna, że CV pisał ChatGPT?",
          odpowiedz:
            "Nie ma pewnego sposobu wykrycia, ale doświadczony rekruter wyłapuje charakterystyczny ton: gładkie, ogólne zdania bez konkretów i identyczne sformułowania powtarzające się u wielu kandydatów.",
        },
        {
          pytanie: "Czy używanie AI przy pisaniu CV jest nieuczciwe?",
          odpowiedz:
            "Nie, jeśli treść pozostaje prawdziwa. Problemem nie jest narzędzie, tylko dopisywanie faktów, których nie było. Poprawa stylu i skrócenie zdań nikogo nie wprowadza w błąd.",
        },
        {
          pytanie: "Dlaczego ChatGPT dopisuje rzeczy, których nie podałem?",
          odpowiedz:
            "Model uzupełnia luki tym, co statystycznie pasuje do kontekstu. Poproszony o mocniejszy opis stanowiska wstawi typowe dla niego obowiązki i liczby, bo tak wygląda większość tekstów, na których się uczył.",
        },
        {
          pytanie: "Jak sprawdzić CV poprawione przez AI?",
          odpowiedz:
            "Przejdź punkt po punkcie i przy każdym zadaj pytanie, czy to się wydarzyło i czy obronisz to na rozmowie. Każdą liczbę i nazwę narzędzia, której nie rozpoznajesz jako swojej, usuń.",
        },
      ],
      tresc: `<p>ChatGPT dobrze radzi sobie z językiem CV i fatalnie z faktami. Poprawi składnię, skróci rozwlekłe zdania i zaproponuje układ, ale poproszony o „mocniejszy" opis doświadczenia dopisze obowiązki i liczby, których nigdy nie było. Poniżej, gdzie ogólny model pomaga, gdzie kosztuje i jak z niego korzystać, nie tracąc wiarygodności.</p>

<h2>Co ogólny model robi dobrze</h2>
<p>Jest kilka zadań, w których pomoc modelu jest realna i bezpieczna, bo dotyczą formy, nie treści.</p>
<ul>
<li><strong>Redakcja językowa.</strong> Rozbicie zdania na dwa, usunięcie powtórzeń, ujednolicenie form czasownika.</li>
<li><strong>Skracanie.</strong> Zmieszczenie tej samej treści w krótszym punkcie bez gubienia sensu.</li>
<li><strong>Podpowiadanie czasowników.</strong> Zamiana „zajmowałem się" na czasownik opisujący konkretne działanie.</li>
<li><strong>Sprawdzenie struktury.</strong> Wskazanie, że w opisie stanowiska brakuje efektu albo skali.</li>
<li><strong>Tłumaczenie.</strong> Przygotowanie wersji angielskiej z zachowaniem terminologii branżowej.</li>
</ul>
<p>We wszystkich tych zadaniach model pracuje na materiale, który już masz. Nie musi niczego zgadywać, więc nie ma jak zmyślić.</p>

<h2>Gdzie zawodzi</h2>
<p>Problem zaczyna się przy poleceniach typu „napisz mi CV na stanowisko specjalisty do spraw marketingu" albo „popraw ten opis, żeby brzmiał lepiej". Model uzupełnia wtedy luki tym, co statystycznie pasuje do kontekstu, bo do tego został zbudowany.</p>
<table>
<thead><tr><th>Co robi model</th><th>Jak to wygląda w CV</th></tr></thead>
<tbody>
<tr><td>Dopisuje typowe obowiązki stanowiska</td><td>W opisie pojawia się raportowanie do zarządu, którego nigdy nie robiłeś</td></tr>
<tr><td>Wstawia prawdopodobnie brzmiące liczby</td><td>„Zwiększyłem sprzedaż o 25 procent" przy zerowej wiedzy o Twoich wynikach</td></tr>
<tr><td>Dokłada narzędzia typowe dla roli</td><td>Na liście umiejętności ląduje Jira i Tableau, których nie otwierałeś</td></tr>
<tr><td>Podnosi poziom języka</td><td>B2 zmienia się w C1, bo tak wygląda większość CV na to stanowisko</td></tr>
<tr><td>Wygładza wszystko do tego samego tonu</td><td>Trzy różne stanowiska opisane identycznym rytmem zdań</td></tr>
</tbody>
</table>
<p>Dwie pierwsze pozycje są groźne, bo tworzą CV, którego nie obronisz. Ostatnia jest groźna inaczej: nie kłamie, ale sprawia, że dokument przestaje brzmieć jak Twój.</p>

<div class="blog-cta-inline">
<p><strong>Aplikando jest zbudowane odwrotnie niż generator tekstu.</strong> Model dostaje wyłącznie fakty, które sam wpisałeś, i nie ma dostępu do niczego poza nimi. Dane twarde, czyli firmy, stanowiska, okresy, wykształcenie i poziomy języków, są kopiowane z oryginału w kodzie i model w ogóle ich nie zwraca. Każdy przepisany fragment przechodzi jeszcze przez walidator, który odrzuca wymyślone liczby, umiejętności i nazwy, a odrzucony fragment wraca do Twojej wersji.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Porównanie dwóch podejść: po lewej generator, który dostaje samą nazwę stanowiska i produkuje treść, po prawej narzędzie, które dostaje fakty kandydata i tylko je porządkuje.">
  <img src="/blog/obrazki/cv-chatgpt-01.webp" alt="Porównanie generatora treści z narzędziem pracującym na faktach kandydata" width="800" height="450" loading="lazy" />
  <figcaption>Różnica nie leży w modelu, tylko w tym, co dostaje na wejściu</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic comparing two workflows side by side, flat vector illustration style, each shown as a horizontal flow of three boxes connected by arrows. The upper flow has Polish labels reading "Nazwa stanowiska", "Model", "Wymyślona treść" and is tinted muted red. The lower flow has Polish labels reading "Twoje fakty", "Model", "Uporządkowana treść" and is tinted soft green. All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Porównanie generatora treści z narzędziem pracującym na faktach kandydata". <strong>Podpis:</strong> "Różnica nie leży w modelu, tylko w tym, co dostaje na wejściu". Plik: <code>cv-chatgpt-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Dlaczego rekruter to wyłapuje</h2>
<p>Nie ma narzędzia, które z pewnością wskaże tekst napisany przez model, i rekruterzy takich narzędzi zwykle nie używają. Wyłapują co innego: powtarzalność.</p>
<p>Osoba czytająca setki CV na to samo stanowisko widzi te same konstrukcje u wielu kandydatów naraz. Identyczny rytm zdań, ten sam zestaw przymiotników, ta sama struktura punktu. Pojedyncze CV nie budzi podejrzeń, ale dziesiąte z rzędu już tak.</p>
<p>Druga rzecz to rozjazd między CV a rozmową. Jeśli w dokumencie stoi wzrost sprzedaży o 25 procent, pierwsze pytanie brzmi, z czego na co i w jakim okresie. Odpowiedź „nie pamiętam dokładnie" kończy temat, ale zostawia ślad, którego nie da się cofnąć.</p>
<p>Trzecia to konkret, którego nie ma. Model produkuje zdania gładkie i puste, bo nie zna Twojej pracy. Rekruter szukający wyróżnika nie znajduje go, mimo że tekst jest poprawny.</p>

<h2>Jak używać AI bezpiecznie</h2>
<p>Kilka zasad, które pozwalają korzystać z modelu bez ryzyka:</p>
<ol>
<li><strong>Podaj materiał, nie proś o wymyślenie.</strong> Wklej swój opis stanowiska i poproś o redakcję, zamiast prosić o napisanie opisu na podstawie samej nazwy roli.</li>
<li><strong>Zabroń dopisywania.</strong> W poleceniu wpisz wprost, że model nie może dodać żadnych liczb, nazw narzędzi ani obowiązków, których nie ma w Twoim tekście.</li>
<li><strong>Pracuj punkt po punkcie.</strong> Redakcja pojedynczego zdania jest łatwiejsza do sprawdzenia niż całe CV wygenerowane za jednym razem.</li>
<li><strong>Sprawdzaj każdą liczbę.</strong> Traktuj każdą cyfrę w zwróconym tekście jako podejrzaną, dopóki nie potwierdzisz, że pochodzi od Ciebie.</li>
<li><strong>Czytaj na głos.</strong> Jeśli zdanie brzmi jak z ogłoszenia o pracę, a nie jak opis Twojej pracy, przepisz je własnymi słowami.</li>
</ol>
<p>Sensowna kolejność jest taka: najpierw sam wypisz fakty, liczby i zakres, potem oddaj to modelowi do redakcji. Odwrotna kolejność, czyli generowanie treści i doklejanie do niej prawdy, prawie zawsze kończy się CV, którego nie umiesz obronić. Pomocny na tym pierwszym etapie jest tekst o tym, <a href="/blog/liczby-w-cv">skąd wziąć liczby, gdy nikt nic nie mierzył</a>.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba przy laptopie porównująca własne notatki z tekstem na ekranie, weryfikująca poprawki. Skupiona praca redakcyjna, naturalne światło.">
  <img src="/blog/obrazki/cv-chatgpt-02.webp" alt="Kandydat weryfikujący poprawki naniesione w tekście CV" width="800" height="450" loading="lazy" />
  <figcaption>Każde zdanie wraca do Ciebie na sprawdzenie, zanim trafi do CV</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person at a desk comparing handwritten notes in an open notebook with text on a laptop screen, one hand pointing at the notebook, soft natural daylight from a window, shallow depth of field, warm neutral tones, screen content blurred, no visible readable text or logos, careful verifying mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat weryfikujący poprawki naniesione w tekście CV". <strong>Podpis:</strong> "Każde zdanie wraca do Ciebie na sprawdzenie, zanim trafi do CV". Plik: <code>cv-chatgpt-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Czego nigdy nie oddawać modelowi</h2>
<p>Poza kwestią prawdziwości treści jest jeszcze kwestia danych. CV zawiera komplet informacji o Tobie: imię i nazwisko, telefon, adres e-mail, historię zatrudnienia, wykształcenie.</p>
<p>Zanim wkleisz dokument do dowolnego narzędzia, sprawdź, co jego dostawca robi z wprowadzanymi danymi i czy używa ich do trenowania modeli. W darmowych wersjach popularnych czatów bywa to ustawienie domyślnie włączone, a wyłącza się je w ustawieniach konta.</p>
<p>Bezpieczna praktyka to usunięcie danych kontaktowych przed wklejeniem tekstu. Do redakcji opisu stanowiska model nie potrzebuje Twojego numeru telefonu ani nazwiska.</p>
<p>Ostatnia rzecz, której nie warto oddawać: decyzji, co w Twoim CV jest ważne. Model nie zna ani Twojej branży, ani konkretnej oferty, na którą aplikujesz. Wybór, co postawić na górze, a co skrócić, wymaga zestawienia Twojego doświadczenia z wymaganiami z ogłoszenia, a to jest praca na faktach, nie na stylu. Jak ją wykonać, opisuje tekst o tym, <a href="/blog/jak-opisac-doswiadczenie-w-cv">jak opisać doświadczenie w CV</a>.</p>`,
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
