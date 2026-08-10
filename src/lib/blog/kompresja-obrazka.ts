/**
 * Kompresja obrazka do WebP W PRZEGLĄDARCE, przed wysłaniem do Storage.
 *
 * Dlaczego po stronie klienta, a nie na serwerze: zdjęcie z telefonu albo
 * z generatora AI ma często 3-6 MB, a na blogu i tak wyświetla się w ~800 px.
 * Kompresja przed uploadem oszczędza transfer w obie strony i miejsce
 * w bucketcie, a przede wszystkim NIE wymaga `sharp` ani żadnej obróbki na
 * serwerze (czyli zero nowego kodu przyjmującego pliki od użytkownika).
 *
 * Uwaga na ograniczenia: to Canvas API, więc obrazek jest przerysowywany —
 * metadane EXIF przepadają. Dla bloga to zaleta (usuwa geolokalizację ze zdjęć),
 * ale gdyby ten moduł miał kiedyś obsłużyć zdjęcia do CV, trzeba to przemyśleć
 * osobno.
 */

const MAX_SZEROKOSC = 1920;
const MAX_WYSOKOSC = 1080;
const JAKOSC = 0.9;
/** Poniżej tego progu WebP nie ma czego poprawiać — oddajemy plik bez zmian. */
const PROG_POMINIECIA = 100 * 1024;

export async function skompresujDoWebp(plik: File): Promise<File> {
  if (plik.type === "image/webp" && plik.size < PROG_POMINIECIA) return plik;

  // SVG jest wektorowy — przerysowanie go na kanwę zamieniłoby grafikę
  // skalowalną w rastrową, zwykle POWIĘKSZAJĄC plik i psując ostrość.
  if (plik.type === "image/svg+xml") return plik;

  const bitmapa = await createImageBitmap(plik).catch(() => null);
  if (!bitmapa) return plik; // nieczytelny obrazek — niech odrzuci go Storage

  const skala = Math.min(
    1,
    MAX_SZEROKOSC / bitmapa.width,
    MAX_WYSOKOSC / bitmapa.height
  );
  const szer = Math.round(bitmapa.width * skala);
  const wys = Math.round(bitmapa.height * skala);

  const kanwa = document.createElement("canvas");
  kanwa.width = szer;
  kanwa.height = wys;
  const ctx = kanwa.getContext("2d");
  if (!ctx) return plik;
  ctx.drawImage(bitmapa, 0, 0, szer, wys);
  bitmapa.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    kanwa.toBlob(resolve, "image/webp", JAKOSC)
  );
  if (!blob) return plik;

  // Gdyby „kompresja" wyszła większa niż oryginał (zdarza się przy małych
  // plikach PNG), zostawiamy oryginał.
  if (blob.size >= plik.size) return plik;

  const nazwa = plik.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], nazwa, { type: "image/webp" });
}
