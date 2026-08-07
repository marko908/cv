# Wzory zgód (checkboxy)

Gotowe treści do podpięcia pod formularze w Aplikandzie. Uzupełnione danymi
Markonn Marko Nowak i aktywnymi linkami do dokumentów.

## Zasady wspólne — dotyczą KAŻDEJ zgody poniżej

Wynikają wprost z instrukcji prawnika (plik „2 Instrukcja", Krok IV) i checklisty
wdrożeniowej:

1. **Checkbox musi być domyślnie ODZNACZONY.** Użytkownik zaznacza go sam.
   W kodzie: `defaultChecked` nigdy, `checked={stan}` ze stanem początkowym `false`.
2. **Linki w treści zgody muszą być aktywne** i otwierać dokument bez utraty
   wypełnionego formularza — czyli `target="_blank" rel="noopener noreferrer"`.
3. **Nie łącz zgód, które da się rozdzielić.** Zgoda na regulamin i zgoda
   marketingowa to dwa osobne checkboxy. Jeden wspólny checkbox = zgoda
   nieświadoma i niedobrowolna, czyli nieważna.
4. **Zapisuj fakt udzielenia zgody**: treść zgody (albo jej wersję), datę, godzinę
   i identyfikator użytkownika. Bez tego nie wykażesz zgody przed UODO —
   art. 7 ust. 1 RODO nakłada ciężar dowodu na administratora.
5. **Zgoda nie może być warunkiem korzystania z usługi**, jeżeli nie jest do niej
   niezbędna. Odmowa zgody marketingowej nie może blokować rejestracji.

---

## 1. Zgoda na regulamin i politykę prywatności

**Gdzie:** formularz rejestracji konta, formularz zakupu Subskrypcji, formularz
Odblokowania Jednorazowego.

**Treść:**

> Oświadczam, że zapoznałem/-am się z [Regulaminem](/regulamin)
> i [Polityką prywatności](/polityka-prywatnosci) oraz akceptuję ich postanowienia.

**Wymagana:** tak (bez niej nie da się zawrzeć umowy — checkbox blokuje przycisk).

---

## 2. Zgoda na dostarczanie usługi cyfrowej przed upływem terminu na odstąpienie

**Gdzie:** formularz zakupu Subskrypcji **oraz** formularz Odblokowania
Jednorazowego — tuż pod zgodą nr 1.

**Treść:**

> Wyrażam zgodę na rozpoczęcie dostarczania usługi cyfrowej przed upływem terminu
> na odstąpienie od umowy. Przyjmuję do wiadomości, że po pełnym wykonaniu usługi
> przez Usługodawcę utracę prawo odstąpienia od umowy.

**Wymagana:** tak — bez niej dostęp musiałby czekać 14 dni.

**Dlaczego to ważne:** to jedyna rzecz, która chroni Cię przed scenariuszem
„kupuję za 12 zł, pobieram raport i przerobione CV, po czym odstępuję od umowy
i żądam zwrotu". Bez tej zgody taki zwrot jest w pełni skuteczny.

**Konsekwencje po stronie kodu:**

- Checkbox musi być osobny od zgody nr 1 (dwie różne zgody, dwa różne skutki).
- Fakt jej udzielenia **musi zostać utrwalony** — zapisz go przy rekordzie zakupu
  (kolumna w tabeli `zakup` / `subskrypcja` albo metadane sesji Stripe).
- W potwierdzeniu zamówienia wysyłanym mailem musi znaleźć się informacja
  o udzieleniu tej zgody (art. 15 ust. 1 ustawy o prawach konsumenta wymaga
  potwierdzenia na trwałym nośniku — i ono dopiero domyka utratę prawa odstąpienia).

---

## 3. Zgoda marketingowa (newsletter)

**Gdzie:** **niewymagany** checkbox przy rejestracji konta — i tylko tam.
Formularza „podaj maila" na stronie nie ma i nie będzie (decyzja Marka
2026-08-07). Regulamin newslettera § 5 ust. 2 na to pozwala: złożenie
oświadczeń „może nastąpić w jakikolwiek sposób, w szczególności poprzez
wypełnienie elektronicznego formularza" — formularz jest przykładem, nie
warunkiem zawarcia Umowy o dostarczanie Newslettera.

**Treść:**

> Wyrażam zgodę na otrzymywanie informacji handlowych o nowościach i promocjach
> w aplikacji „Aplikando", przesyłanych przez Markonn Marko Nowak pod podany
> przeze mnie adres poczty elektronicznej. Ponadto oświadczam, że zapoznałem/-am
> się z [Regulaminem newslettera](/regulamin-newslettera)
> i [Polityką prywatności](/polityka-prywatnosci) oraz akceptuję ich postanowienia.

**Wymagana:** nie — nigdy. Odmowa nie może blokować rejestracji ani zakupu.

**Konsekwencje po stronie kodu — stan na 2026-08-07:**

- [x] Zaznaczenie ustawia `profil.zgoda_marketing = true` i dopisuje wiersz
      `marketing` do dziennika `zgoda` (`ustawZgodeMarketingowa`).
- [x] Mail potwierdzający **z regulaminem newslettera w PDF w załączniku**
      (checklista prawnika, poz. 42) — to mail powitalny, bo zapis następuje
      w tej samej chwili co rejestracja.
- [x] Rezygnacja ustawia `zgoda_marketing = false`, dopisuje wiersz
      `marketing_wycofanie` i nie rusza konta. Przełącznik w `/app/ustawienia`.
- [ ] **Każdy wysłany newsletter musi zawierać działający link rezygnacji**
      (regulamin newslettera § 5 ust. 7 pkt 1) — NIE ZROBIONE, bloker wysyłki,
      patrz `WDROZENIE.md` sekcja D.

---

## 4. Zgoda do formularza kontaktowego

**Gdzie:** formularz kontaktowy / formularz zgłoszenia błędu (`/api/zglos-blad`),
jeżeli zbiera adres e-mail lub inne dane osobowe.

**Treść:**

> Oświadczam, że zapoznałem/-am się z [Polityką prywatności](/polityka-prywatnosci).

**Wymagana:** tak, jeżeli formularz zbiera dane osobowe.

> **Uwaga.** Jeżeli zgłoszenie błędu wysyła wyłącznie zalogowany użytkownik,
> który zaakceptował już Politykę przy rejestracji, ten checkbox jest zbędny —
> mnożenie zgód szkodzi. Dodaj go tylko wtedy, gdy formularz jest dostępny
> także dla osób niezalogowanych.

---

## 5. Cookies — to NIE jest checkbox w formularzu

Zgody na pliki cookies zbiera osobny mechanizm (baner), opisany
w `specyfikacja-baner-cookies.md`. Nie mieszaj ich ze zgodami powyżej:

- inna podstawa prawna (art. 398 Prawa komunikacji elektronicznej + art. 6 ust. 1
  lit. a RODO),
- inny moment (przed jakąkolwiek instalacją plików, a nie przy rejestracji),
- inny sposób wycofania (stały panel w stopce).
