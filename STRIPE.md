# STRIPE — konfiguracja płatności (sandbox i live)

> **Po co ten plik:** konfiguracja Stripe'a żyje POZA repo (panel Stripe'a + zmienne
> środowiskowe na Vercelu), więc nic w kodzie jej nie wymusza i nic o niej nie
> krzyczy, gdy jest niepełna. Dwie awarie już z tego wyszły (2026-08-04 brak
> `STRIPE_WEBHOOK_SECRET` na Vercelu, 2026-08-13 zmienne tylko w scope Preview).
> To jest lista, wobec której da się to odtworzyć i zweryfikować.
>
> Stan sandboxa niżej został **sprawdzony przez API 2026-08-13**, nie przepisany
> z pamięci. Sekcja live jest planem do wykonania.

## Zasady, z których wynika cała reszta

1. **Tryb wynika WYŁĄCZNIE z użytego klucza.** Nie ma flagi środowiska i nie ma
   jej mieć — `sk_test_…` to sandbox, `sk_live_…` to produkcja. Do zapisów w bazie
   bierzemy `livemode` prosto ze zdarzenia Stripe'a (kolumna `tryb_testowy`), bo
   to jedyne źródło prawdy o tym, czy pieniądze były prawdziwe.
2. **Kwoty NIE są duplikowane w Stripie jako źródło prawdy.** Ceny mieszkają
   w `src/lib/subscription.ts`; w Stripie i w env trzymamy wyłącznie
   IDENTYFIKATORY cen, bo tylko one różnią się między trybami. Kwota w dwóch
   miejscach prędzej czy później znaczy, że cennik pokazuje co innego niż kasa.
3. **Cennik live zakłada SKRYPT, nie ręka i nie agent.**
   `npm run stripe:produkty -- --produkcja` czyta kwoty z `subscription.ts`,
   jest idempotentny (rozpoznaje swoje wpisy po `metadata.aplikando`) i nigdy nie
   wypisuje klucza. Tworzenie cen ręcznie robi z człowieka/agenta drugie źródło
   prawdy — dokładnie to, czego zakazuje punkt 2.
4. **Dostęp nadaje wyłącznie webhook.** Powrót z płatności (`success_url`) to
   zwykłe przekierowanie, które da się wpisać w pasku adresu — nie jest dowodem
   zapłaty. `subskrypcja` i `zakup` zapisuje tylko webhook rolą `service_role`.
5. **Klucze tajne nie trafiają do repo ani do rozmowy.** Wpisuje je człowiek
   wprost w panelu Vercela. Dotyczy `STRIPE_SECRET_KEY` i `STRIPE_WEBHOOK_SECRET`.

## Zmienne środowiskowe — siedem, w każdym środowisku osobno

Vercel trzyma osobne zestawy dla **Production**, **Preview** i **Development**.
Ustawienie tylko dla Production nie działa na preview — i odwrotnie. Po każdej
zmianie potrzebny jest **redeploy**: istniejące wdrożenia nie widzą nowych
zmiennych.

| Zmienna | Skąd wartość |
|---|---|
| `STRIPE_SECRET_KEY` | panel Stripe'a, klucz właściwego trybu |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` z KONKRETNEGO endpointu webhooka |
| `STRIPE_CENA_START_MIES` | wyjście `stripe:produkty` |
| `STRIPE_CENA_START_ROK` | wyjście `stripe:produkty` |
| `STRIPE_CENA_PRO_MIES` | wyjście `stripe:produkty` |
| `STRIPE_CENA_PRO_ROK` | wyjście `stripe:produkty` |
| `STRIPE_CENA_JEDNORAZOWA` | wyjście `stripe:produkty` |

Nazwy zmiennych cen są zapisane w DWÓCH miejscach i muszą się zgadzać:
`KLUCZE_CEN` w `src/lib/stripe.ts` oraz `ZMIENNE` w `scripts/stripe-produkty.ts`.

**Objawy braków — po nich rozpoznasz, czego zabrakło:**

| Objaw | Przyczyna |
|---|---|
| „Płatności nie są jeszcze skonfigurowane." (503 z `/api/platnosc/checkout`) | brak `STRIPE_SECRET_KEY` — to JEDYNA rzecz sprawdzana przez `czyStripeDostepny()` |
| „Brak zmiennych środowiskowych: …" (503 z webhooka) | brak `STRIPE_SECRET_KEY` lub `STRIPE_WEBHOOK_SECRET`; trasa wymienia brakujące W ODPOWIEDZI, bo webhooka diagnozuje się z panelu Stripe'a, gdzie logów Vercela nie widać |
| „Brak STRIPE_CENA_START_MIES — nie wiem, którą cenę…" | brak identyfikatora ceny dla wybranego planu i okresu |
| Płatność przeszła, dostępu nie ma | webhook nie dochodzi (zły sekret, zły URL, brak zdarzenia) — ratunek: `npm run stripe:synchronizuj` |

## Zdarzenia webhooka — PIĘĆ, nie cztery

Endpoint musi nasłuchiwać dokładnie tego, co obsługuje
`src/app/api/platnosc/webhook/route.ts`:

```
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

`invoice.payment_failed` jest w tej piątce najłatwiejsze do przeoczenia i jego
brak niczego nie psuje widocznie — po prostu **nie wychodzi mail o nieudanej
płatności**, wymagany przez Regulamin § 5 ust. 7. W sandboxie brakowało go do
2026-08-13.

Adres endpointu: `https://<host>/api/platnosc/webhook`.

⚠️ **Preview na Vercelu jest za Vercel Authentication** (`ssoProtection` =
`all_except_custom_domains`), więc Stripe dostałby ekran logowania zamiast trasy.
Dlatego endpoint sandboxowy ma w query token `x-vercel-protection-bypass`.
Produkcja stoi na domenie własnej, czyli bez ochrony — tam token jest zbędny.

## Stan SANDBOX (sprawdzony 2026-08-13)

Konto: **Aplikando sandbox**, `acct_1U01j4PjJXWcd3Iy`, `livemode: false`.

Trzy produkty (`metadata.aplikando`: `start`, `pro`, `jednorazowo`), pięć cen —
wszystkie aktywne, w PLN, kwoty zgodne z `subscription.ts`:

| Zmienna | Price ID | Kwota |
|---|---|---|
| `STRIPE_CENA_START_MIES` | `price_1U0gzNPjJXWcd3IyfRIwqPM5` | 29 zł / mies. |
| `STRIPE_CENA_START_ROK` | `price_1U0gzOPjJXWcd3Iy58KAw3RG` | 290 zł / rok |
| `STRIPE_CENA_PRO_MIES` | `price_1U0gzPPjJXWcd3IydCM3czIr` | 49 zł / mies. |
| `STRIPE_CENA_PRO_ROK` | `price_1U0gzPPjJXWcd3IycakNObpg` | 490 zł / rok |
| `STRIPE_CENA_JEDNORAZOWA` | `price_1U0gzQPjJXWcd3IybsQp2tf0` | 12 zł |

Webhook: `we_1U0i9WPjJXWcd3IyLKX7et96`, status `enabled`, celuje w preview
brancha `dev` (`cv-git-dev-markos-projects-6cd09ad9.vercel.app`) z tokenem
bypassu w query. Zdarzenia: cztery + `invoice.payment_failed` dodane przez Marka
2026-08-13.

Billing Portal: konfiguracja domyślna `bpc_1U0idOPjJXWcd3IySDp2eBSi`, aktywna.
`subscription_cancel` w trybie **`at_period_end`** — to musi tak zostać, bo
`czyAktywna` w `subscription.ts` zakłada, że anulowanie NIE odbiera dostępu od
razu, tylko z końcem opłaconego okresu. `subscription_update` wyłączone (zmianę
planu robi się u nas przez nowy zakup, nie przez portal).

## Plan dla LIVE (do wykonania)

Konto live nie było jeszcze konfigurowane. Kolejność:

1. Wstaw tymczasowo live'owy `STRIPE_SECRET_KEY` do `.env.local`.
2. `npm run stripe:produkty -- --produkcja`
   Skrypt sam sprawdza, czy klucz i flaga zgadzają się co do trybu — odmówi
   działania na kluczu live bez flagi ORAZ z flagą na kluczu testowym.
   Na wyjściu dostaniesz pięć linii `STRIPE_CENA_*=price_…`.
3. Te pięć wartości → Vercel, scope **Production**.
4. `STRIPE_SECRET_KEY` (live) → Vercel, scope **Production**.
5. W Stripe live utwórz endpoint webhooka:
   `https://www.aplikando.pl/api/platnosc/webhook`
   z pięcioma zdarzeniami z sekcji wyżej. **Host z `www`** — to on jest
   kanoniczny (apex przekierowuje), a webhook nie ma się odbijać po 308.
   Skopiuj `whsec_…` → `STRIPE_WEBHOOK_SECRET`, scope **Production**.
6. Sprawdź Billing Portal w trybie live: `subscription_cancel` = `at_period_end`.
   Portal wymaga jednorazowego włączenia w ustawieniach Stripe'a.
7. Przywróć w `.env.local` klucz sandboxowy.
8. Redeploy `main`.

### ⚠️ Blokery, które muszą być zamknięte PRZED pierwszą prawdziwą płatnością

- **Fakturownia.** Oba maile zakupowe obiecują klientowi fakturę, a
  `/api/platnosc/checkout` świadomie NIE MA `invoice_creation`, bo faktury
  wystawia Striptu → Fakturownia (§ 5 ust. 4). Bez działającej integracji
  pierwszy płacący klient dostaje obietnicę, której nie dotrzymujemy.
- Pozostałe pozycje: `dokumenty-prawne/WDROZENIE.md`.

## Checklista audytu (do przejścia po podpięciu MCP live)

Do odhaczenia w KAŻDYM trybie osobno:

- [ ] Konto: `livemode` zgodne z tym, co się właśnie konfiguruje
- [ ] Pięć cen istnieje, wszystkie `active: true`, waluta `pln`
- [ ] Kwoty co do groszy równe `PLANY` i `CENA_JEDNORAZOWA` z `subscription.ts`
      (29 / 290 / 49 / 490 / 12 zł → `unit_amount` 2900 / 29000 / 4900 / 49000 / 1200)
- [ ] Okresy: `start-miesiac` i `pro-miesiac` = `recurring.interval: month`;
      `*-rok` = `year`; `jednorazowo` = `type: one_time`
- [ ] Każda cena ma `metadata.aplikando` (bez tego `stripe:produkty` przestaje
      być idempotentny i przy kolejnym uruchomieniu założy duplikaty)
- [ ] Brak duplikatów produktów o tym samym `metadata.aplikando`
- [ ] Webhook: `status: enabled`, URL wskazuje właściwy host, PIĘĆ zdarzeń
- [ ] Billing Portal: konfiguracja aktywna, `subscription_cancel.mode`
      = `at_period_end`
- [ ] Zmienne na Vercelu: siedem, w scope właściwym dla tego trybu, po zmianie
      wykonany redeploy

Czego z MCP sprawdzić NIE DA SIĘ: wartości `STRIPE_SECRET_KEY` i
`STRIPE_WEBHOOK_SECRET` (Stripe zwraca sekret webhooka tylko w chwili tworzenia)
ani zmiennych środowiskowych na Vercelu — MCP Vercela nie ma do nich narzędzia.
Te dwie rzeczy weryfikuje się objawem: udanym przebiegiem płatności testowej
i wpisem w `zdarzenie_stripe` po stronie bazy.

## Gdy webhook nie doszedł

`npm run stripe:synchronizuj` czyta subskrypcje wprost ze Stripe'a i dopisuje je
do bazy, używając TYCH SAMYCH funkcji mapujących co webhook (`statusZeStripe`,
`planZCeny`), więc nie ma drugiej interpretacji statusów. Idempotentny. Powód
istnienia: klient zapłacił, a aplikacja o tym nie wie — najgorszy rodzaj błędu,
bo dotyka ludzi, którzy właśnie dali nam pieniądze.
