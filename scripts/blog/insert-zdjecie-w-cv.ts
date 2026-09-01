import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Zdjęcie w CV: czy dodawać? Realia polskiego rynku",
      slug: "zdjecie-w-cv",
      zajawka:
        "Zdjęcie w CV dzieli rekruterów. Jak wygląda praktyka na polskim rynku, co mówi RODO i czy zdjęcie faktycznie psuje odczyt CV w systemie ATS.",
      meta_tytul: "Zdjęcie w CV: czy dodawać? Realia rynku w Polsce",
      meta_opis:
        "Czy dodawać zdjęcie do CV w Polsce? Praktyka rekruterów, wymogi RODO, wpływ na odczyt w ATS i jakie zdjęcie wybrać, jeśli się zdecydujesz.",
      kategoria: "pisanie CV",
      tagi: ["cv", "zdjęcie", "rodo"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Kandydat porównujący dwie wersje CV na biurku",
      faq: [
        {
          pytanie: "Czy zdjęcie w CV jest obowiązkowe?",
          odpowiedz:
            "Nie. Żaden przepis nie nakazuje dołączania zdjęcia do CV, a pracodawca nie może go od Ciebie wymagać. To Twoja decyzja i brak zdjęcia nie jest brakiem formalnym.",
        },
        {
          pytanie: "Czy zdjęcie w CV przeszkadza systemom ATS?",
          odpowiedz:
            "Samo zdjęcie nie blokuje odczytu. Problemem bywa układ, w którym tekst siedzi w grafice albo w tabeli - system nie ma wtedy czego wyciągnąć. Zdjęcie obok normalnego tekstu jest po prostu pomijane.",
        },
        {
          pytanie: "Jakie zdjęcie wybrać do CV?",
          odpowiedz:
            "Aktualne, zrobione na jednolitym tle, kadr od klatki piersiowej w górę, twarz zwrócona do obiektywu. Strój taki, w jakim przyszedłbyś na rozmowę w tej branży. Selfie i zdjęcia wakacyjne odpadają.",
        },
        {
          pytanie: "Czy dodawać zdjęcie, aplikując za granicę?",
          odpowiedz:
            "W Wielkiej Brytanii, USA i Kanadzie zdjęcia się nie dodaje, bo rekruterzy unikają nawet pozoru dyskryminacji. W Niemczech i Austrii bywa oczekiwane. Sprawdź zwyczaj kraju, do którego wysyłasz zgłoszenie.",
        },
      ],
      tresc: `<p class="image-prompt">📷 <strong>OKŁADKA</strong> - prompt: A realistic wide photo of two printed CV documents lying side by side on a light wooden desk, one page has a small blank portrait photo placeholder in its top corner and the other has none, a pen and a cup of coffee nearby, soft natural daylight, shallow depth of field, warm professional tones, no visible readable text or logos, calm and thoughtful mood, shot in 2:1 landscape framing. <strong>Alt:</strong> "Kandydat porównujący dwie wersje CV na biurku". Plik: <code>zdjecie-w-cv-okladka.webp</code>, format 2:1 (np. 1200×600 px). <strong>Po wgraniu okładki w polu „Okładka" usuń ten akapit.</strong></p>

<p>Zdjęcie w CV nie jest obowiązkowe i jego brak niczego nie przekreśla. Na polskim rynku jest jednak na tyle powszechne, że jego nieobecność bywa zauważana - inaczej niż w krajach anglosaskich, gdzie zdjęcie w CV to raczej błąd. Poniżej to, co realnie wpływa na decyzję: praktyka rekruterów, RODO i odczyt w systemach rekrutacyjnych.</p>

<h2>Praktyka w Polsce a zwyczaje zagraniczne</h2>
<p>W Polsce zdjęcie w CV jest normą utrwaloną przez lata, a nie wymogiem prawnym. Duża część szablonów krążących w sieci ma na nie miejsce, kandydaci je wstawiają, a rekruterzy przywykli je widzieć. Nikt jednak nie odrzuci zgłoszenia dlatego, że zdjęcia zabrakło.</p>
<p>Zupełnie inaczej wygląda to w Wielkiej Brytanii, USA i Kanadzie. Tam zdjęcie w CV jest odradzane wprost, bo pracodawca, który je zobaczy, naraża się na zarzut podejmowania decyzji na podstawie wyglądu, wieku czy pochodzenia. Część firm ma nawet wewnętrzne procedury nakazujące odrzucanie zgłoszeń ze zdjęciem, żeby uniknąć takiego ryzyka.</p>
<p>Trzecia grupa to rynek niemiecki i austriacki, gdzie zdjęcie bywa nadal oczekiwane, choć i tam zwyczaj słabnie. Jeśli wysyłasz zgłoszenie za granicę, kieruj się praktyką kraju odbiorcy, nie polską.</p>

<h2>Argumenty za i przeciw</h2>
<p>Decyzja rzadko jest oczywista, bo obie strony mają realne uzasadnienie. Zestawienie poniżej pomaga rozstrzygnąć ją świadomie, zamiast kopiować cudzy szablon.</p>
<table>
<thead><tr><th>Argument za zdjęciem</th><th>Argument przeciw</th></tr></thead>
<tbody>
<tr><td>Rekruter łatwiej zapamiętuje kandydata przy dużej liczbie zgłoszeń</td><td>Otwiera drogę do oceny po wyglądzie, zanim ktokolwiek przeczyta doświadczenie</td></tr>
<tr><td>Buduje wrażenie otwartości, szczególnie na stanowiskach z kontaktem z klientem</td><td>Słabe technicznie zdjęcie działa gorzej niż jego brak</td></tr>
<tr><td>Zgodne z oczekiwaniami większości polskich pracodawców</td><td>Zajmuje miejsce, którego przy jednostronicowym CV bywa mało</td></tr>
<tr><td>Wyróżnia w branżach, gdzie standardem jest CV bez grafiki</td><td>Bezużyteczne w rekrutacjach prowadzonych anonimowo</td></tr>
</tbody>
</table>
<p>Krótka zasada praktyczna: jeśli masz dobre, aktualne zdjęcie portretowe, dodaj je. Jeśli musiałbyś użyć kadru wyciętego ze zdjęcia grupowego sprzed pięciu lat, zostaw CV bez zdjęcia. Gorsze od braku zdjęcia jest zdjęcie, które podważa profesjonalizm reszty dokumentu.</p>

<div class="blog-cta-inline">
<p><strong>To decyzja wizualna, nie techniczne ryzyko.</strong> W Aplikando masz szablony w obu wariantach, ze zdjęciem i bez, a każdy z nich jest zbudowany tak, żeby systemy rekrutacyjne poprawnie odczytały treść. Możesz przełączyć układ i zobaczyć tę samą treść w obu wersjach.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="photo" data-image-brief="Osoba przy biurku porównująca dwie wydrukowane wersje CV, jedna ze zdjęciem portretowym w rogu, druga bez. Naturalne światło, spokojna atmosfera podejmowania decyzji.">
  <img src="/blog/obrazki/zdjecie-w-cv-01.webp" alt="Kandydat porównujący dwie wersje CV na biurku" width="800" height="450" loading="lazy" />
  <figcaption>Ten sam dokument w dwóch wariantach, wybór należy do Ciebie</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (photo)</strong> - prompt: A realistic photo of a person at a wooden desk comparing two printed CV documents side by side, one page has a small portrait photo placeholder in the corner and the other has none, soft natural daylight from a side window, shallow depth of field, warm neutral tones, hands resting on the papers, no visible readable text or logos, calm decision-making mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat porównujący dwie wersje CV na biurku". <strong>Podpis:</strong> "Ten sam dokument w dwóch wariantach, wybór należy do Ciebie". Plik: <code>zdjecie-w-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Co na to RODO</h2>
<p>Wizerunek jest daną osobową, więc jego przetwarzanie wymaga podstawy prawnej. W praktyce wygląda to prosto: jeśli sam wstawiasz zdjęcie do CV i wysyłasz je pracodawcy, robisz to dobrowolnie i to Twoja decyzja stanowi podstawę.</p>
<p>Ważniejsze jest to, czego pracodawca zrobić nie może. Nie ma prawa wymagać zdjęcia ani traktować jego braku jako uchybienia formalnego. Ogłoszenie z zapisem o CV ze zdjęciem nie jest wymogiem, który musisz spełnić, tylko prośbą.</p>
<p>Ponieważ zdjęcie wykracza poza katalog danych, których pracodawca może żądać na etapie rekrutacji, zadbaj, żeby w CV znalazła się <a href="/blog/klauzula-rodo-w-cv">aktualna klauzula RODO</a>. Przy zdjęciu ma ona realne znaczenie, nie tylko zwyczajowe.</p>

<h2>Jakie zdjęcie, jeśli już się decydujesz</h2>
<p>Zdjęcie do CV rządzi się podobnymi zasadami co zdjęcie do dokumentów, tylko mniej sztywno. Cel jest jeden: ma wyglądać jak osoba, która za tydzień przyjdzie na rozmowę.</p>
<ul>
<li><strong>Kadr</strong> od klatki piersiowej w górę, twarz zwrócona do obiektywu, cała mieści się w kadrze.</li>
<li><strong>Tło</strong> jednolite i spokojne: ściana, jasne tło studyjne, ewentualnie mocno rozmyte wnętrze.</li>
<li><strong>Strój</strong> taki, w jakim poszedłbyś na rozmowę w tej konkretnej branży. Koszula w banku, zwykły sweter w firmie technologicznej.</li>
<li><strong>Aktualność</strong>, czyli zdjęcie pokazujące, jak wyglądasz teraz, nie pięć lat temu.</li>
<li><strong>Jakość</strong>: ostre, dobrze doświetlone, bez filtrów i bez widocznego przycięcia z większej fotografii.</li>
</ul>
<p>Odpadają selfie, zdjęcia z imprez i wakacji, fotografie z widocznymi innymi osobami oraz ujęcia w okularach przeciwsłonecznych. Sesja biznesowa nie jest konieczna, telefon w dobrym świetle i jednolite tło wystarczą.</p>

<figure data-image-id="2" data-image-type="infographic" data-image-brief="Zestawienie czterech miniatur zdjęć do CV z oznaczeniem, które jest poprawne, a które nie. Po lewej dobry portret na jednolitym tle, dalej odrzucone warianty: selfie, zdjęcie grupowe, zdjęcie nieaktualne.">
  <img src="/blog/obrazki/zdjecie-w-cv-02.webp" alt="Porównanie poprawnego i błędnych zdjęć do CV" width="800" height="450" loading="lazy" />
  <figcaption>Różnicę robi tło, kadr i aktualność, nie profesjonalna sesja</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (infographic)</strong> - prompt: A clean minimal infographic comparing CV photo options, arranged as four simple illustrated portrait thumbnails in a row, flat vector illustration style, no real faces, simple abstract avatar shapes. The first thumbnail is highlighted in green with a Polish label below reading "Dobre zdjęcie". The remaining three are marked in muted red with Polish labels below reading "Selfie", "Zdjęcie grupowe" and "Nieaktualne". A short Polish heading at the top reads "Zdjęcie do CV". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white color scheme, plenty of white space. <strong>Alt:</strong> "Porównanie poprawnego i błędnych zdjęć do CV". <strong>Podpis:</strong> "Różnicę robi tło, kadr i aktualność, nie profesjonalna sesja". Plik: <code>zdjecie-w-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Gdzie umieścić zdjęcie w dokumencie</h2>
<p>Standardowe miejsce to prawy lub lewy górny róg, na wysokości danych osobowych. Zdjęcie nie powinno być większe niż mniej więcej jedna szósta szerokości strony, bo zaczyna wtedy konkurować z treścią, dla której CV powstało.</p>
<p>Unikaj umieszczania go na środku nad nagłówkiem, bo spycha nazwisko i dane kontaktowe w dół, oraz wstawiania go jako tła strony. To drugie psuje kontrast tekstu i bywa problemem przy wydruku.</p>

<h2>Czy zdjęcie psuje odczyt CV w ATS</h2>
<p>To najczęstszy argument przeciw zdjęciom i w większości przypadków nietrafiony. Systemy rekrutacyjne wyciągają z pliku tekst. Zdjęcie tekstem nie jest, więc zostaje po prostu pominięte i niczego nie obniża.</p>
<p>Problem pojawia się gdzie indziej, w układzie dokumentu. CV, w którym dane kontaktowe albo nazwy stanowisk siedzą wewnątrz grafiki, zostanie odczytane wybiórczo, bo z obrazka nie ma czego wyciągnąć. Podobnie działają rozbudowane tabele i tekst wrzucony do nagłówka strony.</p>
<p>Ryzykiem nie jest więc zdjęcie, tylko sposób zbudowania całego układu. Dobrze przygotowany szablon ze zdjęciem odczyta się poprawnie, a źle zbudowany szablon bez zdjęcia potrafi zgubić połowę treści. Przy planowaniu miejsca na pierwszej stronie zdjęcie też trzeba wliczyć w budżet, o czym więcej w tekście o tym, <a href="/blog/ile-stron-cv">ile stron powinno mieć CV</a>.</p>`,
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
