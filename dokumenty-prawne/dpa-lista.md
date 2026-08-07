# Umowy powierzenia (DPA) — lista dostawców

Bloker nr 3 z `WDROZENIE.md`, rozpisany na konkretne pozycje. Polityka
prywatności stwierdza: *„Z każdym z ww. podmiotów, który przetwarza dane
osobowe w imieniu Administratora, zawarta została umowa powierzenia
przetwarzania danych osobowych zgodna z art. 28 RODO."* **To zdanie musi być
prawdziwe w dniu publikacji.**

Źródło listy: tabela odbiorców w `src/lib/prawne/polityka-prywatnosci.ts`
i Załącznik nr 2 w `zalacznik-1-umowa-powierzenia.md`.

---

## A. Podmioty przetwarzające — potrzebna umowa powierzenia (art. 28 RODO)

Przetwarzają dane **w Twoim imieniu i na Twoje polecenie**. To są klasyczne
DPA — u wszystkich poniżej wystarczy zaakceptować gotowy dokument dostawcy.

**Stan na 2026-08-07: Marko potwierdził, że DPA są zaakceptowane u wszystkich
dostawców** — u większości wchodzą automatycznie wraz z regulaminem usługi.

| # | Stan | Dostawca | Co przetwarza | Gdzie sprawdzić / pobrać kopię |
|---|---|---|---|---|
| 1 | ✅ | **Vercel** | wszystko, co przechodzi przez aplikację + logi serwera | Dashboard → Team Settings → Legal → Data Processing Addendum |
| 2 | ✅ | **Supabase** | konta, treść CV, historia dopasowań, zdjęcia | Dashboard → Organization Settings → Legal Documents |
| 3 | ✅ | **Google Cloud / Gemini API** | treść CV i treść ogłoszenia w chwili dopasowania | Cloud Console → Cloud Data Processing Addendum |
| 4 | ✅ | **Resend** | adres e-mail i treść każdej wiadomości | Dashboard → Settings → Legal / DPA |
| 5 | ✅ | **Google Analytics 4** | dane o korzystaniu z aplikacji | Analytics → Administracja → Ustawienia konta → Warunki przetwarzania danych |
| 6 | ✅ | **Google Tag Manager** | sam nie zapisuje plików, ale pośredniczy | jw. |
| 7 | ✅ | **Microsoft (Clarity)** | zdarzenia interfejsu, nagrania sesji | Microsoft Products and Services DPA |
| 8 | ✅ | **Fakturownia** | e-mail, dane nabywcy, dane transakcji | panel Fakturowni → umowa powierzenia |
| 9 | ✅ | **Striptu** | e-mail, dane transakcji | panel dostawcy |
| 10 | ✅ | **Biuro rachunkowe** | dane z dokumentów księgowych | umowa na papierze — patrz niżej |

⚠️ **Dwie rzeczy warte jednorazowego sprawdzenia, mimo statusu ✅:**

1. **Poz. 5 i 6 to nie to samo, co poz. 3, mimo że wszystko to Google.**
   Warunki przetwarzania dla Analytics/Tag Managera akceptuje się w panelu
   Analytics, osobno od Cloud DPA dla Gemini API. Jeżeli akceptowałeś tylko
   jedno z nich, drugie zostaje otwarte.
2. **Poz. 10 nie może wejść „z automatu"** — biuro rachunkowe nie ma panelu
   z regulaminem do zaakceptowania. Tu musi istnieć podpisany dokument
   (papierowy albo elektroniczny). Jeżeli go nie podpisywałeś, ta pozycja
   jest otwarta mimo statusu wyżej.

**Zbierz kopie w jednym katalogu poza repo.** „Zaakceptowane" i „umiem to
pokazać kontroli" to dwie różne rzeczy — przy kontroli UODO liczy się druga.

## Czy biuro rachunkowe naprawdę tego potrzebuje

Krótko: **tak, jeżeli biuro dostaje dane osobowe** — a przy fakturach dla
konsumentów dostaje (imię, nazwisko, adres, e-mail nabywcy).

Dłużej: stanowisko UODO i praktyka rynkowa traktują biuro rachunkowe jako
**podmiot przetwarzający** — prowadzi księgi *na Twoje zlecenie i w Twoim
imieniu*, nie we własnym celu. To sytuacja z art. 28 ust. 3 RODO, który wymaga
umowy na piśmie (także elektronicznym). Odpowiedzialność za brak umowy spoczywa
na **Tobie jako administratorze**, nie na biurze.

Kiedy odpada:
- sprzedajesz wyłącznie firmom i biuro dostaje wyłącznie dane firmowe
  (NIP, nazwa) bez danych osób fizycznych — wtedy nie ma danych osobowych,
  więc nie ma czego powierzać. **U Ciebie to nie zachodzi**: Aplikando sprzedaje
  konsumentom, a faktura konsumencka to dane osobowe;
- prowadzisz księgowość sam.

W praktyce: **każde biuro rachunkowe ma gotowy wzór i poda Ci go od ręki** —
to dla nich rutyna, nie negocjacja. Jeden e-mail z pytaniem „prześlijcie umowę
powierzenia" załatwia sprawę. Nie jest to nic, nad czym trzeba siedzieć.

## B. Nie powierzenie, tylko inny dokument

| # | Dostawca | Rola | Co podpisać |
|---|---|---|---|
| 9 | **Stripe** | w większości **odrębny administrator** — przetwarza dane płatnicze na własną odpowiedzialność, bo musi (przepisy AML, przeciwdziałanie oszustwom) | DPA wchodzi w skład Services Agreement; nie ma czego akceptować osobno — **pobierz i zachowaj kopię** |
| 10 | **Meta (Pixel)** | **współadministrowanie**, nie powierzenie — Meta używa danych także do własnych celów | Business Tools Terms + Controller-to-Controller / Joint Controller Addendum. To NIE jest art. 28 |

⚠️ **Zdanie w polityce mówi „z każdym z ww. podmiotów […] umowa powierzenia".
Dla Stripe i Meta to nieprecyzyjne** — z nimi łączy Cię inny typ relacji.
Jeżeli zostawiasz Meta Pixel, warto przeformułować to zdanie tak, żeby
obejmowało też współadministrowanie i odrębnych administratorów. Do
sprawdzenia u prawnika przy okazji pozostałych pytań.

## C. ✅ Fakturownia i Striptu — DOPISANE DO DOKUMENTÓW (2026-08-07)

Wcześniej nie było ich ani w tabeli odbiorców w polityce prywatności, ani
w Załączniku nr 2 — mimo że Regulamin § 5 ust. 4 opisuje przepływ
Stripe → Striptu → Fakturownia → KSeF i to Fakturownia wysyła klientowi
fakturę. Marko potwierdził 2026-08-07, że ten przepływ na pewno będzie działał,
więc obie zostały dopisane:

- [x] Tabela odbiorców w `polityka-prywatnosci.ts`.
- [x] Załącznik nr 2 w `zalacznik-1-umowa-powierzenia.md` (obie w EOG, więc
      kolumna „podstawa transferu" = nie dotyczy).
- [ ] **Umowy powierzenia — poz. 8 i 9 w tabeli wyżej.**

## D. ✅ Uwierzytelnianie kontem Google — PRZYWRÓCONE W DOKUMENTACH (2026-08-07)

Odstępstwo nr 23 usunęło logowanie Google z regulaminu i polityki, bo nie ma go
w kodzie. Marko zdecydował 2026-08-07, że **włączy tę funkcję przed startem**,
więc opisy wróciły:

- [x] Regulamin § 4 ust. 19 (tryb utworzenia Konta przez Google).
- [x] Polityka, cel nr 1 — dopisane imię, nazwisko i zdjęcie profilowe.
- [x] Polityka, tabela odbiorców — „uwierzytelnianie kontem Google" przy Google.
- [x] Załącznik nr 2 — wiersz Google już to zawierał, teraz jest spójny z resztą.

- [x] **Kod napisany tego samego dnia** — przycisk „Kontynuuj z Google",
      trasa `/auth/callback`, bramka zgody `/dokoncz-rejestracje`. Dokumenty
      nie wyprzedzają już aplikacji.

⏳ **Zostaje konfiguracja paneli.** Wbrew wcześniejszemu zapisowi w tym pliku
provider Google **nie był** skonfigurowany w Supabase — zrzut z 2026-08-07
pokazuje wyłączony przełącznik i puste Client ID/Secret. Kroki: Google Cloud
Console (ekran zgody + Client ID) i Supabase (wklejenie danych + włączenie).
Instrukcja: `supabase/README.md`, sekcja „Logowanie Google"; bloker nr 5
w `WDROZENIE.md`.

⚠️ **Zakres danych do rozstrzygnięcia.** Dokumenty mówią, że dostajemy z Google
imię, nazwisko i zdjęcie profilowe. To prawda (Supabase zapisuje je
w `auth.users.raw_user_meta_data`), ale nasza tabela `profil` ich nie kopiuje
i nigdzie ich nie używamy. Jeżeli nie zamierzasz ich używać, uczciwiej zawęzić
zakres w Google Cloud do samego adresu e-mail i skreślić resztę z dokumentów —
minimalizacja danych, art. 5 ust. 1 lit. c RODO.

---

## Co odpada, jeżeli zrezygnujesz z narzędzia

Lista nie jest stała — wynika z tego, co realnie działa:

- rezygnacja z **Meta Pixel** → odpada poz. 10, wiersz w tabeli cookies,
  wiersz w tabeli odbiorców i cała kategoria „marketingowe" w banerze;
- rezygnacja z **Microsoft Clarity** → odpada poz. 7 i jej wiersze w obu
  tabelach;
- rezygnacja z **GA4** → odpadają poz. 5 i 6.

Każde takie usunięcie to zmiana `cookies-rejestr.ts` + podniesienie
`WERSJA_ZGODY` w `lib/cookies/zgody.ts`.

## Gdzie trzymać

Zbierz PDF-y w jednym katalogu (poza repo — to dokumenty firmowe, nie kod).
Przy kontroli UODO pytają o nie zaraz po rejestrze czynności przetwarzania.
Przy okazji sprawdź na [dataprivacyframework.gov](https://www.dataprivacyframework.gov/list)
**aktywną** certyfikację DPF dla dostawców z USA — od tego zależy poprawność
sekcji „Przekazywanie danych do państwa trzeciego" w polityce i Załącznika
nr 2 (kolumna „Podstawa transferu poza EOG").
