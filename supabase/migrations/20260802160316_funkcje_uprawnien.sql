-- Aplikando — uprawnienia, limity, RODO.
-- ZASADA (1:1 z subscription.ts): kod NIGDY nie pyta „czy rekord ma flagę
-- unlocked". Pyta ma_dostep_do(id) — subskrypcja ALBO jednorazowy zakup.
-- Żadna funkcja nie przyjmuje user_id z zewnątrz (auth.uid()), inaczej dałoby
-- się podbijać komuś licznik albo podglądać cudze uprawnienia.

create or replace function public.ma_aktywna_subskrypcje()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.subskrypcja s
    where s.user_id = (select auth.uid())
      and (
        s.status = 'aktywna'
        or (s.status in ('zalega', 'anulowana') and s.koniec_okresu > now())
      )
  );
$$;

-- Dwie drogi dostępu. Zakup dotyczy KORZENIA łańcucha (coalesce(korzen_id, id)),
-- więc przeliczenie po wywiadzie nie odbiera opłaconego dostępu.
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
  );
end;
$$;

-- Strefa Europe/Warsaw, nie UTC i nie strefa przeglądarki — inaczej limit
-- resetowałby się o różnych porach zależnie od tego, skąd ktoś się łączy.
create or replace function public.klucz_miesiaca()
returns text
language sql
stable
set search_path = ''
as $$
  select to_char(now() at time zone 'Europe/Warsaw', 'YYYY-MM');
$$;

create or replace function public.zuzyto_w_tym_miesiacu()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select u.dopasowania
      from public.zuzycie_miesieczne u
      where u.user_id = (select auth.uid())
        and u.miesiac = public.klucz_miesiaca()
    ),
    0
  );
$$;

-- ATOMOWE zużycie jednego dopasowania. Limit wchodzi PARAMETREM, bo progi
-- planów żyją w subscription.ts (PLANY) i to jest ich jedyne źródło prawdy.
-- Inkrementacja i sprawdzenie limitu muszą być jedną instrukcją — dwa
-- równoległe żądania inaczej przepchnęłyby oba dopasowania ponad limit.
create or replace function public.zuzyj_dopasowanie(p_limit integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_miesiac text := public.klucz_miesiaca();
  v_po integer;
begin
  if v_user is null then
    raise exception 'BRAK_UZYTKOWNIKA';
  end if;

  if p_limit is null or p_limit < 1 then
    raise exception 'LIMIT_WYCZERPANY';
  end if;

  insert into public.zuzycie_miesieczne (user_id, miesiac, dopasowania)
  values (v_user, v_miesiac, 1)
  on conflict (user_id, miesiac) do update
     set dopasowania = public.zuzycie_miesieczne.dopasowania + 1,
         updated_at = now()
   where public.zuzycie_miesieczne.dopasowania < p_limit
  returning dopasowania into v_po;

  -- Brak zwróconego wiersza = warunek `dopasowania < p_limit` nie przeszedł.
  if v_po is null then
    raise exception 'LIMIT_WYCZERPANY';
  end if;

  return v_po;
end;
$$;

-- RODO art. 20 — przenoszenie danych. zuzycie_ai i zdarzenie_stripe pominięte:
-- to nasze dane operacyjne, nie dane osobowe kandydata.
create or replace function public.eksportuj_moje_dane()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'profil', (
      select to_jsonb(p) - 'stripe_customer_id'
      from public.profil p where p.id = (select auth.uid())
    ),
    'cv', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.utworzono)
      from public.cv c where c.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'dopasowania', coalesce((
      select jsonb_agg(to_jsonb(d) order by d.utworzono)
      from public.dopasowanie d where d.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'subskrypcje', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.utworzono)
      from public.subskrypcja s where s.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'zakupy', coalesce((
      select jsonb_agg(to_jsonb(z) order by z.utworzono)
      from public.zakup z where z.user_id = (select auth.uid())
    ), '[]'::jsonb),
    'wyeksportowano', now()
  );
$$;

-- RODO art. 17. Kaskada z profil sprząta CV, dopasowania, zakupy i liczniki.
-- NIE kasuje klienta w Stripe (faktury trzeba trzymać 5 lat) ani plików ze
-- Storage — to robi trasa API przed wywołaniem tej funkcji.
create or replace function public.usun_moje_konto()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'BRAK_UZYTKOWNIKA';
  end if;
  delete from auth.users where id = v_user;
end;
$$;

-- Postgres domyślnie daje EXECUTE roli PUBLIC — przy SECURITY DEFINER trzeba
-- to cofnąć ręcznie i nadać wąsko.
revoke execute on function public.ma_aktywna_subskrypcje() from public, anon;
revoke execute on function public.ma_dostep_do(uuid) from public, anon;
revoke execute on function public.zuzyto_w_tym_miesiacu() from public, anon;
revoke execute on function public.zuzyj_dopasowanie(integer) from public, anon;
revoke execute on function public.eksportuj_moje_dane() from public, anon;
revoke execute on function public.usun_moje_konto() from public, anon;

grant execute on function public.ma_aktywna_subskrypcje() to authenticated;
grant execute on function public.ma_dostep_do(uuid) to authenticated;
grant execute on function public.klucz_miesiaca() to authenticated;
grant execute on function public.zuzyto_w_tym_miesiacu() to authenticated;
grant execute on function public.zuzyj_dopasowanie(integer) to authenticated;
grant execute on function public.eksportuj_moje_dane() to authenticated;
grant execute on function public.usun_moje_konto() to authenticated;
