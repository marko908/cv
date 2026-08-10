-- DARMOWA OFERTA (decyzja Marka 2026-08-10): jedno w pełni odblokowane
-- dopasowanie miesięcznie, dla KAŻDEGO konta — nie tylko subskrybentów.
-- Odnawia się co miesiąc, jak limity planów Start/Pro (limitKonta w
-- subscription.ts), ale NIE jest subskrypcją: konto bez planu nie ma dostępu
-- do WSZYSTKICH dopasowań (tak jak subskrybent), tylko do JEDNEGO wybranego —
-- stąd osobny mechanizm, a nie trzeci wpis w tabeli `subskrypcja`.
--
-- Celowo BEZ klucza obcego na `dopasowanie_id` (inaczej niż `zakup`) — wołane
-- z klienta od razu po utworzeniu rekordu w Zustand, zanim debounce (900 ms
-- w synchronizacja-konta.tsx) zdąży zapisać go do bazy. Referencja „na słowo"
-- jest tu akceptowalna: to darmowa, marketingowa zachęta, nie płatność.

alter table public.zuzycie_miesieczne
  add column darmowy_dopasowanie_id uuid;

comment on column public.zuzycie_miesieczne.darmowy_dopasowanie_id is
  'Id dopasowania (rekord w chwili przyznania), które w tym miesiącu skorzystało z darmowego, w pełni odblokowanego dopasowania — jedno na miesiąc na konto, przyznawane funkcją zuzyj_darmowe_dopasowanie.';

-- ATOMOWE przyznanie darmowego odblokowania. Ten sam wzorzec co
-- zuzyj_dopasowanie: insert/update z warunkiem w jednej instrukcji, żeby dwa
-- równoległe żądania nie przyznały dwóch darmowych odblokowań w tym samym
-- miesiącu.
create or replace function public.zuzyj_darmowe_dopasowanie(p_dopasowanie uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_miesiac text := public.klucz_miesiaca();
  v_zmienione integer;
begin
  if v_user is null or p_dopasowanie is null then
    return false;
  end if;

  insert into public.zuzycie_miesieczne (user_id, miesiac, darmowy_dopasowanie_id)
  values (v_user, v_miesiac, p_dopasowanie)
  on conflict (user_id, miesiac) do update
     set darmowy_dopasowanie_id = p_dopasowanie
   where public.zuzycie_miesieczne.darmowy_dopasowanie_id is null;

  get diagnostics v_zmienione = row_count;
  return v_zmienione > 0;
end;
$$;

revoke execute on function public.zuzyj_darmowe_dopasowanie(uuid) from public, anon;
grant execute on function public.zuzyj_darmowe_dopasowanie(uuid) to authenticated;

-- ma_dostep_do rozszerzone o trzecią drogę dostępu — dla spójności z
-- odblokowaneDopasowania w store.ts, choć ta funkcja nie jest dziś jeszcze
-- wołana z kodu aplikacji (patrz komentarz przy jej definicji).
create or replace function public.ma_dostep_do(p_dopasowanie uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_korzen uuid;
begin
  if v_user is null or p_dopasowanie is null then
    return false;
  end if;

  if public.ma_aktywna_subskrypcje() then
    return true;
  end if;

  select coalesce(d.korzen_id, d.id)
    into v_korzen
    from public.dopasowanie d
   where d.id = p_dopasowanie
     and d.user_id = v_user;

  if v_korzen is null then
    return false;
  end if;

  return exists (
    select 1
    from public.zakup z
    join public.dopasowanie d on d.id = z.dopasowanie_id
    where z.user_id = v_user
      and z.status = 'oplacony'
      and coalesce(d.korzen_id, d.id) = v_korzen
  ) or exists (
    select 1
    from public.zuzycie_miesieczne u
    where u.user_id = v_user
      and u.miesiac = public.klucz_miesiaca()
      and u.darmowy_dopasowanie_id = p_dopasowanie
  );
end;
$$;
