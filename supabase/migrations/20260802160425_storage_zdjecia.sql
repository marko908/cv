-- Aplikando — Storage na zdjęcia do CV.
-- Zdjęcie kandydata to dana osobowa i element wizerunku, więc bucket jest
-- PRYWATNY: podgląd idzie przez signed URL, nie przez publiczny link, który
-- można komuś przesłać dalej.
--
-- Konwencja ścieżki: {user_id}/{cv_id}.{ext} — pierwszy segment to id
-- właściciela i na nim opiera się cała polityka dostępu.
--
-- Limit 2 MB: aplikacja i tak pomniejsza oryginał do 640 px przed wysłaniem
-- (photo-input.tsx), więc realny plik ma kilkadziesiąt kB. Limit jest po to,
-- żeby ktoś nie wrzucił 40-megowego RAW-a prosto do API.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'zdjecia',
  'zdjecia',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "zdjecia: czyta swoje"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'zdjecia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "zdjecia: wgrywa swoje"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'zdjecia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "zdjecia: podmienia swoje"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'zdjecia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'zdjecia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "zdjecia: kasuje swoje"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'zdjecia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
