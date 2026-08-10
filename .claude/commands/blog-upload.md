---
description: Wgraj wygenerowany artykuł bloga do bazy jako szkic.
---

# Aplikando — wgranie artykułu bloga

Uruchamiasz gotowy skrypt insertujący artykuł do tabeli `wpis_bloga` jako
szkic.

## Argument
`$ARGUMENTS` to slug albo fragment tytułu. Skrypt powinien już istnieć
w `scripts/blog/insert-[slug].ts` (tworzy go `/blog-post`).

## Kroki

1. Znajdź skrypt w `scripts/blog/` — po slugu albo przez `Glob
   scripts/blog/insert-*.ts` dopasowany do fragmentu. Wiele trafień → pokaż
   listę i zapytaj. Brak → poinformuj, że najpierw trzeba wygenerować artykuł
   przez `/blog-post`.
2. Uruchom:
   `npx tsx --env-file=.env.local scripts/blog/insert-[slug].ts`
3. Zinterpretuj wynik:
   - sukces → podaj id i link `/admin/blog/[id]/edytuj`,
   - błąd `23505` (duplikat slugu) → artykuł już istnieje; zapytaj, czy
     zaktualizować zamiast wstawiać,
   - inny błąd → pokaż treść i zasugeruj diagnostykę.
4. Przypomnij, czego jeszcze brakuje: okładki, podmiany grafik w treści na
   adresy z biblioteki obrazków, usunięcia akapitów `class="image-prompt"`.
5. **Nie publikuj automatycznie.** Status zostaje `szkic`; publikację włącza
   człowiek w `/admin/blog`.

## Uwagi
- ZAWSZE `--env-file=.env.local` — skrypt czyta `SUPABASE_SERVICE_ROLE_KEY`.
- Nie uruchamiaj insertu dwa razy dla tego samego slugu.
