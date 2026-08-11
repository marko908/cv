import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "Klauzula RODO w CV 2026: aktualna treść i wzór",
      slug: "klauzula-rodo-w-cv",
      zajawka:
        "Jaką klauzulę RODO wstawić do CV w 2026 roku? Gotowa treść do skopiowania, gdzie ją umieścić i błąd, przez który wygląda na nieaktualną.",
      meta_tytul: "Klauzula RODO w CV 2026: aktualna treść i wzór",
      meta_opis:
        "Aktualna klauzula RODO do CV w 2026 roku - gotowa treść do skopiowania, miejsce w dokumencie i najczęstszy błąd, którego unikać.",
      kategoria: "pisanie CV",
      tagi: ["cv", "rodo", "dane osobowe"],
      czas_czytania_min: 6,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Kandydat finalizujący CV przed wysłaniem zgłoszenia",
      faq: [
        {
          pytanie: "Czy klauzula RODO w CV jest obowiązkowa?",
          odpowiedz:
            "Nie ma przepisu, który wprost nakazuje kandydatowi jej dopisanie, ale w praktyce większość polskich pracodawców jej oczekuje i bez niej może nie zapoznać się ze zgłoszeniem.",
        },
        {
          pytanie: "Czy stara klauzula RODO unieważnia CV?",
          odpowiedz:
            "Nie, to nie unieważnia zgłoszenia, ale sugeruje nieaktualny szablon - lepiej zaktualizować podstawę prawną do RODO 2016/679 i ustawy z 10 maja 2018 r.",
        },
        {
          pytanie: "Gdzie w CV wstawić klauzulę RODO?",
          odpowiedz:
            "W stopce dokumentu, czcionką mniejszą niż reszta treści, najlepiej 8-9 punktów. Nie trzeba jej umieszczać przy każdej sekcji.",
        },
        {
          pytanie: "Czy klauzula RODO jest potrzebna, jeśli aplikuję za granicę?",
          odpowiedz:
            "W krajach UE ma prawne uzasadnienie, choć rzadko jest praktykowana poza Polską. Poza UE obowiązują inne przepisy i klauzula zwykle nie jest oczekiwana.",
        },
      ],
      tresc: `<p>Klauzula RODO w CV to zgoda na przetwarzanie Twoich danych osobowych przez pracodawcę na czas rekrutacji. Formalnie żaden przepis nie każe kandydatowi jej dopisywać, ale w praktyce jej brak bywa powodem, dla którego rekruter w ogóle nie otwiera zgłoszenia. Poniżej aktualna treść do skopiowania i miejsce, w którym powinna się znaleźć.</p>

<h2>Czym jest klauzula RODO w CV i czy trzeba ją dodawać</h2>
<p>RODO, czyli Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679, reguluje przetwarzanie danych osobowych w całej Unii Europejskiej od maja 2018 roku. Samo wysłanie CV z imieniem, nazwiskiem, numerem telefonu czy adresem e-mail oznacza przekazanie danych osobowych - a do ich przetwarzania potrzebna jest podstawa prawna.</p>
<p>Dla danych, które sam podajesz w standardowym CV - dane kontaktowe, przebieg zatrudnienia, wykształcenie - podstawą jest zazwyczaj sam fakt, że to Ty inicjujesz kontakt w celu rekrutacji. Klauzula formalnie ma znaczenie głównie wtedy, gdy w CV znajdują się dane wykraczające poza to minimum, albo gdy chcesz, żeby firma zatrzymała Twoje CV na potrzeby przyszłych, jeszcze nieogłoszonych rekrutacji.</p>
<p>W praktyce polscy pracodawcy oczekują klauzuli niezależnie od tego rozróżnienia - to utrwalony zwyczaj rynkowy, nie zawsze ścisły wymóg prawny. Dlatego bezpieczniej jest ją dodać zawsze, niż ryzykować, że rekruter odłoży zgłoszenie bez zgody na bok.</p>

<h2>Aktualna treść klauzuli RODO do CV</h2>
<p>Poniższa wersja odnosi się do obowiązującej podstawy prawnej i pasuje do pojedynczej, konkretnej rekrutacji:</p>
<blockquote><p>Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w CV przez [nazwa firmy] w celu przeprowadzenia obecnego procesu rekrutacji, zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych.</p></blockquote>
<h3>Wersja rozszerzona - na przyszłe rekrutacje</h3>
<p>Jeśli zależy Ci na tym, żeby firma mogła wrócić do Twojego CV przy kolejnej rekrutacji bez ponownego wysyłania zgłoszenia, użyj wersji z dopiskiem o przyszłych procesach:</p>
<blockquote><p>Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w CV przez [nazwa firmy] w celu prowadzenia obecnej oraz przyszłych rekrutacji, zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych.</p></blockquote>
<p>Wersja rozszerzona ma sens przy aplikacji do dużych firm, które rekrutują falami - jeśli akurat nie przejdziesz tego naboru, dział HR może wrócić do Twojego CV przy następnym bez pytania Cię ponownie.</p>

<div class="blog-cta-inline">
<p><strong>Skopiowałeś klauzulę - teraz zadbaj, żeby została aktualna.</strong> W kreatorze Aplikando ta sama klauzula RODO wstawia się automatycznie i jest na bieżąco aktualizowana, więc nie musisz do niej wracać przy każdej zmianie CV.</p>
<a href="/rejestracja">Załóż darmowe konto</a>
</div>

<figure data-image-id="1" data-image-type="photo" data-image-brief="Osoba przy laptopie, w trakcie finalizowania CV przed wysłaniem zgłoszenia rekrutacyjnego, spokojne domowe biuro, naturalne światło dzienne.">
  <img src="/blog/obrazki/klauzula-rodo-w-cv-01.webp" alt="Kandydat finalizujący CV przed wysłaniem zgłoszenia" width="800" height="450" loading="lazy" />
  <figcaption>Klauzulę RODO dodaj na końcu, tuż przed wysłaniem CV</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (photo)</strong> - prompt: A realistic photo of a young professional sitting at a wooden desk in a bright home office, reviewing a printed CV and typing on a laptop, soft natural daylight from a window, shallow depth of field, warm neutral color palette, no visible text or logos, candid and calm mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat finalizujący CV przed wysłaniem zgłoszenia". <strong>Podpis:</strong> "Klauzulę RODO dodaj na końcu, tuż przed wysłaniem CV". Plik: <code>klauzula-rodo-w-cv-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Gdzie umieścić klauzulę w CV</h2>
<p>Klauzula nie jest treścią merytoryczną CV, więc nie powinna konkurować o uwagę z doświadczeniem czy umiejętnościami. Standardowe miejsce to stopka dokumentu - sam dół strony, czcionką wyraźnie mniejszą niż reszta tekstu, zwykle 8-9 punktów.</p>
<p>Jeśli CV zajmuje więcej niż jedną stronę, klauzula wystarczy raz, na ostatniej stronie. Nie trzeba jej powtarzać przy każdej sekcji ani wplatać w treść podsumowania zawodowego. Jeśli zastanawiasz się też, <a href="/blog/ile-stron-cv">ile w ogóle powinno mieć stron Twoje CV</a>, to osobny temat, który wpływa na to, gdzie ta stopka w praktyce wyląduje.</p>

<figure data-image-id="2" data-image-type="infographic" data-image-brief="Prosty diagram jednej strony CV z wyraźnie oznaczoną strefą stopki, w której mniejszą czcionką umieszczona jest klauzula RODO, reszta strony pokazana schematycznie jako bloki tekstu.">
  <img src="/blog/obrazki/klauzula-rodo-w-cv-02.webp" alt="Diagram strony CV z zaznaczonym miejscem na klauzulę RODO w stopce" width="800" height="450" loading="lazy" />
  <figcaption>Klauzula RODO trafia do stopki, mniejszą czcionką niż reszta CV</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (infographic)</strong> - prompt: A clean minimal infographic showing a single page CV layout as a wireframe, with Polish text labels rendered clearly and legibly in a modern sans-serif font: the top block labeled "Dane osobowe", a middle block labeled "Doświadczenie zawodowe", another block labeled "Umiejętności", and the bottom footer area highlighted in a soft accent color with a small text label reading "Klauzula RODO". Flat design, plenty of white space, professional blue and white color scheme, vector illustration style. All visible text must be in Polish exactly as specified above, no English words anywhere in the image. <strong>Alt:</strong> "Diagram strony CV z zaznaczonym miejscem na klauzulę RODO w stopce". <strong>Podpis:</strong> "Klauzula RODO trafia do stopki, mniejszą czcionką niż reszta CV". Plik: <code>klauzula-rodo-w-cv-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Najczęstszy błąd: nieaktualna podstawa prawna</h2>
<p>Wiele gotowych szablonów CV krążących w sieci wciąż zawiera starą wersję klauzuli, odwołującą się do ustawy z 29 sierpnia 1997 r. o ochronie danych osobowych. Ten przepis od maja 2018 roku nie obowiązuje w tym zakresie - zastąpiło go RODO razem z nową ustawą krajową.</p>
<table>
<thead><tr><th>Element</th><th>Nieaktualna klauzula</th><th>Aktualna klauzula</th></tr></thead>
<tbody>
<tr><td>Podstawa prawna</td><td>Ustawa z 29 sierpnia 1997 r.</td><td>RODO 2016/679 + ustawa z 10 maja 2018 r.</td></tr>
<tr><td>Obowiązuje od</td><td>Do maja 2018 r.</td><td>Od maja 2018 r., nadal aktualna</td></tr>
<tr><td>Co sugeruje rekruterowi</td><td>CV nie było aktualizowane od lat</td><td>Kandydat zna obowiązujący stan prawny</td></tr>
</tbody>
</table>
<p>Sama nieaktualna klauzula rzadko przekreśla aplikację - to drobiazg. Ale w zestawieniu z innymi (stare formaty daty, nieaktualne nazwy stanowisk) buduje wrażenie CV odgrzewanego sprzed lat.</p>

<h2>Co zrobić, gdy pracodawca poda własną klauzulę</h2>
<p>Część większych firm i korporacji publikuje własną, rozszerzoną treść zgody - często w samym ogłoszeniu albo w regulaminie rekrutacji na swojej stronie. W takiej sytuacji nie modyfikuj jej i nie wracaj do wersji ogólnej - skopiuj dokładnie to, co podał pracodawca, i wklej w miejsce własnej klauzuli.</p>
<p>Firmowe wersje bywają dłuższe, bo doprecyzowują na przykład okres przechowywania danych albo dane administratora - to nie błąd, tylko standardowa praktyka dużych działów HR.</p>

<h2>Czy klauzula RODO jest potrzebna przy aplikacji za granicą</h2>
<p>RODO obowiązuje w całej Unii Europejskiej i Europejskim Obszarze Gospodarczym, więc aplikując do firmy z siedzibą w UE, klauzula ma prawne uzasadnienie niezależnie od kraju. W praktyce jednak zwyczaj jej dopisywania jest silnie polski - w większości innych krajów UE kandydaci jej nie dodają, mimo że przepis obowiązuje wszystkich tak samo.</p>
<p>Poza UE - w Wielkiej Brytanii, USA czy Kanadzie - obowiązują inne przepisy o ochronie danych, a CV pisane po angielsku pod te rynki zwykle w ogóle nie zawiera takiej klauzuli. Dodanie jej nie zaszkodzi, ale nie jest tam oczekiwane.</p>`,
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
