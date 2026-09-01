import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Co to jest ATS i jak naprawdę czyta Twoje CV",
      slug: "ats-cv",
      zajawka:
        "ATS nie ocenia CV i nikogo nie odrzuca. Sprawdź, co system faktycznie wyciąga z pliku, jakie mity krążą na jego temat i co naprawdę psuje odczyt.",
      meta_tytul: "Co to jest ATS i jak naprawdę czyta Twoje CV",
      meta_opis:
        "Czym jest system ATS w rekrutacji, co realnie wyciąga z Twojego CV i co psuje odczyt pliku. Bez mitów o automatycznym odrzucaniu zgłoszeń.",
      kategoria: "ATS i rekrutacja",
      tagi: ["ats", "cv", "rekrutacja"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Rekruter przeglądający zgłoszenia w systemie rekrutacyjnym",
      faq: [
        {
          pytanie: "Czy ATS odrzuca CV automatycznie?",
          odpowiedz:
            "Nie. ATS to baza zgłoszeń, nie sędzia. Sortuje i filtruje wyniki, ale decyzję o odrzuceniu podejmuje rekruter. Ryzykiem nie jest automatyczne odrzucenie, tylko to, że źle odczytane CV nie pojawi się na liście wyników.",
        },
        {
          pytanie: "Jaki format pliku jest najlepszy dla ATS?",
          odpowiedz:
            "PDF z prawdziwym tekstem, czyli taki, w którym da się zaznaczyć i skopiować treść. PDF będący zdjęciem strony jest dla systemu pusty. DOCX też działa, ale częściej rozjeżdża się wizualnie u odbiorcy.",
        },
        {
          pytanie: "Czy CV z dwiema kolumnami przechodzi przez ATS?",
          odpowiedz:
            "Tak, jeśli jest dobrze zbudowane. Liczy się kolejność tekstu w pliku, a nie to, co widzi oko. Dane osobowe i doświadczenie muszą trafić do strumienia tekstu przed treścią panelu bocznego.",
        },
        {
          pytanie: "Jak sprawdzić, czy moje CV jest czytelne dla ATS?",
          odpowiedz:
            "Otwórz plik PDF, zaznacz całą treść, skopiuj i wklej do pustego dokumentu tekstowego. To, co zobaczysz, jest mniej więcej tym, co dostaje system. Jeśli kolejność jest pomieszana albo czegoś brakuje, masz problem.",
        },
      ],
      tresc: `<p class="image-prompt">📷 <strong>OKŁADKA</strong> - prompt: A realistic wide photo of a recruiter working at a desktop computer in a bright modern office, a list of entries visible but blurred on the screen, notebook and pen on the desk, soft daylight from a window, shallow depth of field, neutral professional tones, no visible readable text or logos, calm and organised mood, shot in 2:1 landscape framing. <strong>Alt:</strong> "Rekruter przeglądający zgłoszenia w systemie rekrutacyjnym". Plik: <code>ats-cv-okladka.webp</code>, format 2:1 (np. 1200×600 px). <strong>Po wgraniu okładki w polu „Okładka" usuń ten akapit.</strong></p>

<p>ATS to system, w którym pracodawca zbiera i porządkuje zgłoszenia od kandydatów. Nie ocenia CV i nie odrzuca nikogo samodzielnie, choć taka opowieść krąży po internecie od lat. Realne ryzyko jest inne: jeśli system źle odczyta Twój plik, Twoje zgłoszenie po prostu nie pojawi się tam, gdzie rekruter go szuka. Poniżej co ATS faktycznie robi i co psuje odczyt.</p>

<h2>Czym jest ATS i kto go używa w Polsce</h2>
<p>Skrót pochodzi od Applicant Tracking System, czyli systemu śledzenia kandydatów. W praktyce to baza danych z wyszukiwarką: zbiera zgłoszenia z ogłoszeń, przechowuje pliki CV, wyciąga z nich dane do pól formularza i pozwala rekruterowi filtrować listę.</p>
<p>W Polsce korzystają z nich przede wszystkim duże firmy i agencje rekrutacyjne, a także większość korporacji z zagranicznym właścicielem. W mniejszych firmach zgłoszenia wciąż często trafiają na skrzynkę mailową i nie przechodzą przez żaden system. Jeśli aplikujesz przez formularz na stronie firmy albo przez portal pracy, prawdopodobnie po drugiej stronie stoi jakiś ATS.</p>
<p>Kluczowa różnica wobec popularnego wyobrażenia: system nie zastępuje rekrutera. Porządkuje mu pracę, a decyzje zostają po stronie człowieka.</p>

<h2>Co system faktycznie wyciąga z pliku</h2>
<p>Przy wgraniu CV system uruchamia parsowanie, czyli próbę zamiany dokumentu na uporządkowane dane. Szuka w tekście typowych elementów i wpisuje je do pól: imię i nazwisko, dane kontaktowe, nazwy stanowisk, nazwy firm, okresy zatrudnienia, wykształcenie, umiejętności.</p>
<p>Robi to na podstawie samego tekstu i jego kolejności w pliku. Nie widzi Twojego układu tak jak Ty. Nie wie, że pole po lewej to panel boczny, a większa czcionka oznacza nagłówek sekcji. Dostaje ciąg znaków w takiej kolejności, w jakiej zapisał je program generujący PDF.</p>
<p>Dlatego dwa CV wyglądające identycznie na ekranie mogą zostać odczytane zupełnie inaczej. Decyduje to, czego nie widać: kolejność tekstu w strumieniu pliku.</p>

<div class="blog-cta-inline">
<p><strong>To właśnie ta kolejność, a nie brak zdjęcia czy jednej kolumny, decyduje o poprawnym odczycie.</strong> W szablonach Aplikando dane osobowe, podsumowanie i doświadczenie trafiają do pliku przed treścią panelu bocznego, nawet w układach dwukolumnowych, gdzie panel widać po lewej. Sprawdzamy to ekstrakcją tekstu z gotowego pliku PDF, nie na oko.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Dwa widoki tego samego CV: po lewej układ dwukolumnowy tak, jak widzi go człowiek, po prawej ten sam dokument jako liniowy ciąg tekstu, w kolejności odczytywanej przez system. Strzałka pokazuje przejście z jednego widoku w drugi.">
  <img src="/blog/obrazki/ats-cv-01.webp" alt="Układ CV widziany przez człowieka zestawiony z kolejnością tekstu w pliku" width="800" height="450" loading="lazy" />
  <figcaption>System nie widzi kolumn, dostaje tekst w kolejności zapisu</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic split into two halves with an arrow pointing from left to right, flat vector illustration style. The left half shows a two column CV page wireframe with a narrow sidebar and a wider main column, labelled in Polish above as "Co widzi człowiek". The right half shows the same content flattened into a single vertical list of stacked text lines, labelled in Polish above as "Co dostaje system". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "Układ CV widziany przez człowieka zestawiony z kolejnością tekstu w pliku". <strong>Podpis:</strong> "System nie widzi kolumn, dostaje tekst w kolejności zapisu". Plik: <code>ats-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Trzy mity, które warto odłożyć</h2>
<p>Wokół systemów rekrutacyjnych narosło sporo strachu, często podsycanego przez firmy sprzedające „optymalizację pod ATS”. Poniżej trzy twierdzenia, które powtarzają się najczęściej, i to, jak wygląda rzeczywistość.</p>
<table>
<thead><tr><th>Mit</th><th>Jak jest naprawdę</th></tr></thead>
<tbody>
<tr><td>ATS ocenia CV i wystawia mu punkty</td><td>System indeksuje i filtruje. Ocena jest po stronie rekrutera, który przegląda wyniki</td></tr>
<tr><td>Każda grafika oznacza odrzucenie</td><td>Grafika jest pomijana. Problem pojawia się dopiero, gdy tekst siedzi wewnątrz grafiki</td></tr>
<tr><td>CV musi być jednokolumnowe i bez formatowania</td><td>Liczy się kolejność tekstu, nie liczba kolumn. Dobrze zbudowany układ dwukolumnowy odczyta się poprawnie</td></tr>
</tbody>
</table>
<p>Krążą też konkretne liczby, na przykład o odsetku CV odrzucanych przez systemy jeszcze przed kontaktem z człowiekiem. Nie podajemy ich tutaj, bo nie mają wiarygodnego źródła, a powtarzane bez niego służą głównie sprzedaży strachu.</p>

<h2>Co realnie psuje odczyt</h2>
<p>Lista rzeczy, które faktycznie sprawiają kłopot, jest krótsza i bardziej techniczna, niż sugerują poradniki.</p>
<ul>
<li><strong>Tekst zapisany jako obrazek.</strong> Skan CV albo eksport do PDF w postaci grafiki jest dla systemu pustą stroną. To najpoważniejszy z tych błędów.</li>
<li><strong>Dane kontaktowe w nagłówku lub stopce strony.</strong> Część parserów pomija te obszary, więc numer telefonu potrafi zniknąć.</li>
<li><strong>Rozbudowane tabele.</strong> Treść z komórek bywa sklejana w przypadkowej kolejności, zwłaszcza przy tabelach zagnieżdżonych.</li>
<li><strong>Nietypowe nazwy sekcji.</strong> „Moja droga zawodowa” zamiast „Doświadczenie” utrudnia przypisanie treści do właściwego pola.</li>
<li><strong>Egzotyczne czcionki i znaki ozdobne.</strong> Symbole zamiast myślników czy ikony zamiast etykiet potrafią wyjść jako znaki zapytania.</li>
<li><strong>Panel boczny zapisany w pliku przed treścią główną.</strong> Rekruter zobaczy poprawny układ, a system dostanie najpierw listę umiejętności, a dopiero potem nazwisko.</li>
</ul>
<p>Dwie rzeczy, które w tej liście nie występują, to zdjęcie i paski poziomu przy umiejętnościach. Oba bywają odradzane właśnie „ze względu na ATS”, choć system po prostu je pomija. Powody, żeby ich unikać, są inne i opisaliśmy je osobno: przy <a href="/blog/zdjecie-w-cv">zdjęciu w CV</a> chodzi o zwyczaj rynkowy, a przy <a href="/blog/paski-umiejetnosci-cv">paskach umiejętności</a> o to, że nic nie znaczą dla czytającego człowieka.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Rekruter przy komputerze przeglądający listę zgłoszeń w systemie rekrutacyjnym, ekran z listą wpisów, biuro w naturalnym świetle.">
  <img src="/blog/obrazki/ats-cv-02.webp" alt="Rekruter filtrujący listę zgłoszeń w systemie rekrutacyjnym" width="800" height="450" loading="lazy" />
  <figcaption>Decyzję podejmuje człowiek, system tylko układa mu listę</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a recruiter working at a desktop computer in a bright modern office, reviewing a list of entries on the screen, the screen content blurred and unreadable, soft daylight, shallow depth of field, neutral professional tones, no visible readable text or logos, calm focused mood, shot on a 50mm lens. <strong>Alt:</strong> "Rekruter filtrujący listę zgłoszeń w systemie rekrutacyjnym". <strong>Podpis:</strong> "Decyzję podejmuje człowiek, system tylko układa mu listę". Plik: <code>ats-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Jak sprawdzić własne CV w dwie minuty</h2>
<p>Nie potrzebujesz do tego żadnego narzędzia. Otwórz swój plik PDF, zaznacz całą treść skrótem klawiszowym, skopiuj ją i wklej do pustego dokumentu tekstowego albo do notatnika.</p>
<p>To, co zobaczysz, jest bardzo bliskie temu, co dostaje system rekrutacyjny. Sprawdź trzy rzeczy:</p>
<ol>
<li>Czy w ogóle udało się cokolwiek zaznaczyć. Jeśli nie, Twoje CV jest obrazkiem i to jest problem do naprawienia w pierwszej kolejności.</li>
<li>Czy imię, nazwisko i dane kontaktowe są na początku, a nie gdzieś w środku.</li>
<li>Czy nazwy stanowisk i firm dają się odczytać w logicznej kolejności, bez wplatania w nie treści z panelu bocznego.</li>
</ol>
<p>Jeśli tekst wygląda sensownie, Twoje CV jest czytelne dla systemu i nie musisz z niego usuwać kolumn, kolorów ani zdjęcia. Jeśli kolejność jest pomieszana, zmień szablon, a nie treść. To wada układu, nie tego, co napisałeś.</p>`,
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
