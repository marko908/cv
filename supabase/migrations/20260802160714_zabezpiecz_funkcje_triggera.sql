-- Funkcja triggera nie ma prawa być wystawiona jako endpoint RPC
-- (/rest/v1/rpc/obsluz_nowego_uzytkownika). Wywołanie z zewnątrz i tak by padło
-- („trigger functions can only be called as triggers"), ale nie ma powodu, żeby
-- w ogóle była w publicznym API. Trigger działa dalej — uprawnienia EXECUTE
-- nie dotyczą wywołania triggerowego.
revoke execute on function public.obsluz_nowego_uzytkownika() from public, anon, authenticated;

-- To samo dla pomocnika updated_at.
revoke execute on function public.ustaw_updated_at() from public, anon, authenticated;
