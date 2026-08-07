-- Aplikando — zgoda marketingowa (informacje handlowe pocztą elektroniczną)
-- w dzienniku zgód.
--
-- Punktem wejścia jest checkbox przy rejestracji, nie osobny formularz zapisu
-- na stronie (decyzja Marka 2026-08-07). Regulamin dostarczania newslettera
-- § 5 ust. 2 dopuszcza to wprost: złożenie oświadczenia „może nastąpić
-- w jakikolwiek sposób, w szczególności poprzez wypełnienie elektronicznego
-- formularza" — formularz jest przykładem, nie warunkiem.
--
-- DWIE WARTOŚCI, NIE JEDNA. Dziennik `zgoda` jest niezmienny (brak UPDATE
-- i DELETE nawet dla właściciela wiersza), więc wycofania zgody nie da się
-- zapisać jako zmiany istniejącego wiersza — musi być osobnym zdarzeniem.
-- Bez tego umielibyśmy udowodnić wyłącznie udzielenie zgody, a przy sporze
-- o wysyłkę po wycofaniu to właśnie MOMENT WYCOFANIA jest faktem spornym
-- (art. 7 ust. 3 RODO). Stan bieżący mieszka w `profil.zgoda_marketing`;
-- ta tabela jest historią zmian tego stanu.

alter type public.rodzaj_zgody add value 'marketing';
alter type public.rodzaj_zgody add value 'marketing_wycofanie';
