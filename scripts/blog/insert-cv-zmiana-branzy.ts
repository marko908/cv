import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wstaw() {
  const { data, error } = await supabase
    .from("wpis_bloga")
    .insert({
      tytul: "CV przy zmianie branży: jak przepisać doświadczenie",
      slug: "cv-zmiana-branzy",
      zajawka:
        "Przy przebranżowieniu problemem nie jest brak doświadczenia, tylko jego nazwa. Jak przełożyć je na język nowej branży i co ustawić na górze CV.",
      meta_tytul: "CV przy zmianie branży: jak przepisać doświadczenie",
      meta_opis:
        "Jak napisać CV przy zmianie branży: kompetencje przenoszalne, co przepisać, a co usunąć, i jak zbudować podsumowanie łączące dwie ścieżki.",
      kategoria: "szukanie pracy",
      tagi: ["cv", "zmiana branży", "przebranżowienie"],
      czas_czytania_min: 5,
      status: "szkic",
      okladka_url: null,
      okladka_alt: "Osoba planująca zmianę ścieżki zawodowej przy biurku",
      faq: [
        {
          pytanie: "Czy przy zmianie branży pisać CV od nowa?",
          odpowiedz:
            "Nie od nowa, ale trzeba je przepisać. Fakty zostają te same, zmienia się to, które z nich opisujesz szerzej i jakim językiem, żeby były zrozumiałe dla nowej branży.",
        },
        {
          pytanie: "Czy usuwać z CV doświadczenie z poprzedniej branży?",
          odpowiedz:
            "Nie usuwaj, bo powstanie luka trudniejsza do wytłumaczenia niż sama zmiana. Skróć te stanowiska, które nic nie wnoszą, i rozbuduj fragmenty mające związek z nowym kierunkiem.",
        },
        {
          pytanie: "Jak wytłumaczyć zmianę branży w CV?",
          odpowiedz:
            "Jednym zdaniem w podsumowaniu zawodowym, spokojnie i bez tłumaczenia się. Wystarczy pokazać, co łączy dotychczasowe doświadczenie z nowym kierunkiem i co już w tym kierunku zrobiłeś.",
        },
        {
          pytanie: "Czy kursy wystarczą, żeby zmienić branżę?",
          odpowiedz:
            "Sam certyfikat rzadko wystarcza. Działa dopiero kurs zakończony projektem, który możesz pokazać, opisany w CV jak zadanie zawodowe, a nie jak pozycja na liście szkoleń.",
        },
      ],
      tresc: `<p>Przy zmianie branży najczęstszy problem nie polega na tym, że nie masz doświadczenia. Polega na tym, że Twoje doświadczenie nazywa się słowami, których nowa branża nie rozpoznaje. Rekruter czytający CV pełne terminów z poprzedniego zawodu nie przetłumaczy ich sam. Poniżej jak to przełożyć i co ustawić na górze dokumentu.</p>

<h2>Kompetencje przenoszalne: nazwij je językiem nowej branży</h2>
<p>Kompetencje przenoszalne to te, które działają niezależnie od tego, w jakiej firmie i branży pracujesz: organizacja pracy, analiza danych, prowadzenie zespołu, kontakt z klientem, praca w rygorze procedur.</p>
<p>Trudność polega na nazwie. To samo zadanie w dwóch branżach nazywa się inaczej, a nikt nie zrobi tego tłumaczenia za Ciebie.</p>
<table>
<thead><tr><th>Poprzednia branża</th><th>Jak to nazwać w nowej</th></tr></thead>
<tbody>
<tr><td>Nauczyciel: prowadzenie lekcji i przygotowanie materiałów</td><td>Prowadzenie szkoleń dla grup, opracowywanie materiałów dydaktycznych</td></tr>
<tr><td>Kelner: obsługa sali i rozliczanie utargu</td><td>Obsługa klienta w tempie wysokiej rotacji, odpowiedzialność za rozliczenia gotówkowe</td></tr>
<tr><td>Kierownik zmiany w produkcji: grafik i nadzór</td><td>Planowanie pracy zespołu, nadzór nad realizacją harmonogramu</td></tr>
<tr><td>Pielęgniarka: dokumentacja i praca w procedurach</td><td>Prowadzenie dokumentacji zgodnie z procedurami, praca w środowisku regulowanym</td></tr>
<tr><td>Handlowiec: raportowanie wyników</td><td>Analiza danych sprzedażowych i raportowanie do przełożonych</td></tr>
</tbody>
</table>
<p>Zwróć uwagę, że prawa kolumna niczego nie wymyśla. Opisuje te same czynności słowami, których używa ogłoszenie w nowej branży. To jest cała operacja i nie ma w niej naciągania.</p>

<h2>Co przepisać, a co usunąć</h2>
<p>Pokusa jest taka, żeby skasować całą poprzednią branżę i zacząć od czystej karty. To błąd: powstaje wtedy kilkuletnia luka, która budzi więcej pytań niż sama zmiana ścieżki.</p>
<ul>
<li><strong>Zostaw wszystkie stanowiska</strong> z nazwami firm i okresami. Ciągłość zatrudnienia jest wartością samą w sobie.</li>
<li><strong>Rozbuduj punkty</strong>, które łączą się z nowym kierunkiem, nawet jeśli były drobną częścią poprzedniej pracy.</li>
<li><strong>Skróć do jednej linii</strong> stanowiska i zadania bez żadnego związku z nowym celem.</li>
<li><strong>Usuń branżowy żargon</strong>, którego nowa branża nie zna, albo dopisz w nawiasie odpowiednik.</li>
<li><strong>Wyciągnij na wierzch</strong> kursy, projekty i praktyki związane z nowym kierunkiem, nawet jeśli są świeże i krótkie.</li>
</ul>
<p>Efektem ma być CV, w którym widać ciągłość i kierunek, a nie dwa niepowiązane życiorysy sklejone jeden pod drugim.</p>

<div class="blog-cta-inline">
<p><strong>Przy zmianie branży to samo doświadczenie trzeba opowiedzieć inaczej pod każdą ofertę.</strong> Aplikando zestawia Twoje fakty z wymaganiami konkretnego ogłoszenia i pokazuje, które z nich mają pokrycie, a które nie zostały nigdzie nazwane. Niczego nie dopisuje od siebie, więc przekładasz na nowy język to, co faktycznie robiłeś.</p>
<p><a href="/rejestracja">Załóż darmowe konto</a></p>
</div>

<figure data-image-id="1" data-image-type="infographic" data-image-brief="Schemat pokazujący przełożenie tego samego doświadczenia na dwa języki branżowe: po lewej opis w terminach starej branży, po prawej ten sam zakres w terminach nowej.">
  <img src="/blog/obrazki/cv-zmiana-branzy-01.webp" alt="To samo doświadczenie opisane w dwóch językach branżowych" width="800" height="450" loading="lazy" />
  <figcaption>Zmienia się nazwa czynności, nie sama czynność</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 1 (infographic)</strong> - prompt: A clean minimal infographic showing two vertical lists of three text blocks each, connected by horizontal double-headed arrows between matching rows, flat vector illustration style. The left column is muted grey and labelled in Polish above as "Stara branża". The right column is highlighted in a soft accent colour and labelled in Polish above as "Nowa branża". A short Polish heading spans the top reading "Te same zadania, inna nazwa". All visible text must be in Polish exactly as specified above, no English words anywhere in the image, professional blue and white colour scheme, plenty of white space. <strong>Alt:</strong> "To samo doświadczenie opisane w dwóch językach branżowych". <strong>Podpis:</strong> "Zmienia się nazwa czynności, nie sama czynność". Plik: <code>cv-zmiana-branzy-01.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Jak ułożyć CV, gdy stanowiska nie pasują</h2>
<p>Klasyczny układ chronologiczny stawia na górze ostatnie stanowisko. Przy zmianie branży to właśnie ono bywa najmniej trafne, bo pochodzi ze ścieżki, którą zostawiasz.</p>
<p>Rozwiązaniem nie jest zmiana chronologii, bo CV z pomieszaną kolejnością dat czyta się źle i budzi podejrzenia. Zamiast tego przesuwasz akcenty w obrębie tej samej struktury:</p>
<ol>
<li><strong>Podsumowanie zawodowe</strong> ustawia perspektywę i jest najważniejszym elementem takiego CV.</li>
<li><strong>Sekcja z projektami albo kursami</strong> związanymi z nowym kierunkiem idzie zaraz pod nim, przed doświadczeniem.</li>
<li><strong>Umiejętności</strong> wysoko, z narzędziami nowej branży na początku listy.</li>
<li><strong>Doświadczenie zawodowe</strong> w normalnej kolejności chronologicznej, z rozłożonymi akcentami.</li>
<li><strong>Wykształcenie</strong> na końcu, chyba że właśnie zdobyłeś dyplom w nowym kierunku.</li>
</ol>
<p>Taki układ nie ukrywa niczego, a jednocześnie sprawia, że pierwsze piętnaście linijek dotyczy tego, o co się starasz, a nie tego, co zostawiasz.</p>

<h2>Podsumowanie jako pomost</h2>
<p>To jedyne miejsce, w którym możesz wprost powiedzieć, co się dzieje. Trzy zdania, spokojnie, bez tłumaczenia się i bez opowiadania o wypaleniu.</p>
<blockquote><p>Przez siedem lat prowadziłem zespół w obsłudze klienta, ostatnie dwa lata odpowiadając za raportowanie wskaźników jakości. Równolegle ukończyłem kurs analizy danych i pracuję w SQL oraz Power BI, przygotowując raporty sprzedażowe dla obecnego zespołu. Szukam roli analityka, w której doświadczenie w rozumieniu potrzeb klienta będzie atutem, a nie balastem.</p></blockquote>
<p>Zwróć uwagę na konstrukcję: pierwsze zdanie mówi, co masz za sobą, drugie pokazuje, że nowy kierunek nie jest deklaracją, tylko czymś już robionym, trzecie łączy jedno z drugim. Więcej o budowaniu tej sekcji znajdziesz w tekście o <a href="/blog/podsumowanie-zawodowe-cv">podsumowaniu zawodowym</a>.</p>
<p>Czego w podsumowaniu nie pisać: powodów odejścia z poprzedniej branży, słów o wypaleniu, zdań zaczynających się od tego, czego nie masz. Rekruter nie ocenia Twojej decyzji, tylko dopasowanie do stanowiska.</p>

<figure data-image-id="2" data-image-type="photo" data-image-brief="Osoba przy biurku z dwoma dokumentami, wyraźnie porządkująca notatki dotyczące zmiany kierunku zawodowego. Spokojna, przemyślana praca nad dokumentem.">
  <img src="/blog/obrazki/cv-zmiana-branzy-02.webp" alt="Kandydat porządkujący CV przed zmianą ścieżki zawodowej" width="800" height="450" loading="lazy" />
  <figcaption>Fakty zostają te same, zmienia się sposób ich opowiedzenia</figcaption>
</figure>
<p class="image-prompt">📷 <strong>GRAFIKA 2 (photo)</strong> - prompt: A realistic photo of a person at a desk with two printed documents laid out side by side and a notebook with handwritten notes, one hand resting thoughtfully on the pages, soft natural daylight from a window, shallow depth of field, warm neutral tones, no visible readable text or logos, calm and deliberate mood, shot on a 50mm lens. <strong>Alt:</strong> "Kandydat porządkujący CV przed zmianą ścieżki zawodowej". <strong>Podpis:</strong> "Fakty zostają te same, zmienia się sposób ich opowiedzenia". Plik: <code>cv-zmiana-branzy-02.webp</code>. <strong>Po wgraniu obrazka usuń ten akapit.</strong></p>

<h2>Dlaczego to trzeba powtarzać przy każdej ofercie</h2>
<p>Osoba pracująca w jednej branży od lat może mieć jedno CV z drobnymi korektami. Przy zmianie kierunku tak się nie da, bo za każdym razem tłumaczysz swoje doświadczenie na inny język.</p>
<p>Oferta na analityka w firmie produkcyjnej i w agencji marketingowej wymagają podkreślenia zupełnie innych fragmentów tego samego życiorysu. Raz najmocniejszym argumentem będzie praca w rygorze procedur, innym razem kontakt z klientem, a jeszcze innym raportowanie.</p>
<p>To jest realny koszt przebranżowienia, o którym poradniki rzadko mówią: nie chodzi o napisanie jednego dobrego CV, tylko o gotowość do przepisywania go za każdym razem. Sama procedura jest ta sama, co przy każdym innym dopasowaniu i opisuje ją tekst o tym, <a href="/blog/dopasowanie-cv-do-oferty">jak dopasować CV do oferty pracy</a>. Przy przepisywaniu samych punktów przyda się też artykuł o tym, <a href="/blog/jak-opisac-doswiadczenie-w-cv">jak opisać doświadczenie</a>, bo to w nich siedzi większość pracy.</p>`,
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
