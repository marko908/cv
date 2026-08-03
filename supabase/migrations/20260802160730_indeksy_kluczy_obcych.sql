-- Klucz obcy bez indeksu boli przy KASOWANIU rodzica: Postgres musi wtedy
-- przeskanować całą tabelę dziecka, żeby sprawdzić referencje. Przy usuwaniu
-- konta (RODO) kasujemy kaskadowo wszystko naraz, więc to realny przypadek.
create index zgloszenie_bledu_user_idx on public.zgloszenie_bledu (user_id);
create index zgloszenie_bledu_dopasowanie_idx on public.zgloszenie_bledu (dopasowanie_id);
create index zuzycie_ai_dopasowanie_idx on public.zuzycie_ai (dopasowanie_id);
