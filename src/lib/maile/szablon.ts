import { ADRES, APLIKACJA, FIRMA, SCIEZKI } from "@/lib/prawne/dane";

/**
 * WSPÓLNA OPRAWA MAILI APLIKACJI — żeby wszystkie wyglądały jak od jednej firmy.
 *
 * Wołający dostarcza sam środek (`tresc`); nagłówek z logo, typografia i stopka
 * z danymi firmy są jedne dla wszystkich. Treści poszczególnych maili siedzą
 * w `tresci.ts`, transport w `lib/mail.ts` — trzy osobne rzeczy, bo zmienia się
 * je z trzech różnych powodów.
 *
 * DWIE RZECZY SĄ TU ODWROTNIE NIŻ W APLIKACJI i tak ma zostać:
 *
 * 1. JASNE TŁO, mimo że aplikacja jest dark-only. Ciemny motyw w mailu renderuje
 *    się źle — Outlook i Gmail potrafią wymusić własne tło albo przekolorować
 *    tekst, dając czarny na czarnym.
 * 2. UKŁAD NA TABELACH ZE STYLAMI INLINE. Klienty pocztowe wycinają `<style>`
 *    z `<head>` (Gmail w widoku webowym) i nie znają flexboksa. To jedyne
 *    miejsce w repo, gdzie tak się pisze — nie przenoś tego wzorca do UI.
 *
 * KAŻDY mail ma też wersję tekstową (`Mail.text`) — bez niej filtry antyspamowe
 * patrzą na wiadomość gorzej, a część ludzi czyta pocztę w kliencie bez HTML-a.
 * Buduje się ją równolegle w `tresci.ts`, nie strippingiem tego HTML-a.
 */

const KOLOR_TEKST = "#3f3f46";
const KOLOR_MOCNY = "#18181b";
const KOLOR_CICHY = "#71717a";
const KOLOR_LINIA = "#e4e4e7";

/** Akapit treści. Marginesy inline, bo `<style>` w mailu bywa wycinany. */
export function akapit(tresc: string, ostatni = false): string {
  return `<p style="margin:0 0 ${ostatni ? 0 : 14}px 0;">${tresc}</p>`;
}

/** Link w treści — musi mieć JAWNY kolor, inaczej klient da własny niebieski. */
export function link(tekst: string, href: string): string {
  return `<a href="${href}" style="color:${KOLOR_MOCNY};">${tekst}</a>`;
}

/**
 * Główne wezwanie do działania. Zwykły `<a>` ze stylem tła, nie `<button>` —
 * przyciski formularzy w mailu nie działają, a obrazek-przycisk znika u ludzi
 * z zablokowanymi grafikami.
 */
export function przycisk(tekst: string, href: string): string {
  return `<p style="margin:0;"><a href="${href}" style="display:inline-block;padding:11px 22px;background:${KOLOR_MOCNY};color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;">${tekst}</a></p>`;
}

/**
 * Podsumowanie zamówienia — para etykieta/wartość w wierszu.
 *
 * Istnieje, bo Regulamin § 4 ust. 10 wymaga przesłania „potwierdzenia zawarcia
 * Umowy WRAZ Z JEJ TREŚCIĄ": co kupiono, za ile i kiedy. Zdanie opisowe tego
 * nie załatwia — kwota i data muszą być czytelne na pierwszy rzut oka.
 */
export function podsumowanie(wiersze: [string, string][]): string {
  const tresc = wiersze
    .map(
      ([etykieta, wartosc]) =>
        `<tr>
<td style="padding:7px 0;font-size:14px;color:${KOLOR_CICHY};vertical-align:top;">${etykieta}</td>
<td style="padding:7px 0;font-size:14px;color:${KOLOR_MOCNY};font-weight:600;text-align:right;vertical-align:top;">${wartosc}</td>
</tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;border-top:1px solid ${KOLOR_LINIA};border-bottom:1px solid ${KOLOR_LINIA};">${tresc}</table>`;
}

/** Blok wyróżniony — na to, czego przeoczenie kosztuje użytkownika dostęp. */
export function uwaga(tresc: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;background:#fafafa;border-left:3px solid ${KOLOR_MOCNY};border-radius:0 6px 6px 0;">
<tr><td style="padding:14px 16px;font-size:14px;line-height:1.55;color:${KOLOR_TEKST};">${tresc}</td></tr>
</table>`;
}

/** Drobny druk pod treścią — podstawa prawna, odesłania do paragrafów. */
export function drobnymDrukiem(tresc: string): string {
  return `<p style="margin:18px 0 0 0;font-size:13px;line-height:1.55;color:${KOLOR_CICHY};">${tresc}</p>`;
}

export function szablonMaila(opcje: { naglowek: string; tresc: string }): string {
  const { naglowek, tresc } = opcje;
  const rok = new Date().getFullYear();

  return `<!doctype html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<tr><td style="padding:28px 32px 0 32px;">
<img src="${APLIKACJA.adresWww}/aplikando-icon.png" width="36" height="36" alt="${APLIKACJA.nazwa}" style="display:block;border:0;">
</td></tr>

<tr><td style="padding:20px 32px 0 32px;">
<h1 style="margin:0;font-size:20px;line-height:1.35;font-weight:700;color:${KOLOR_MOCNY};">${naglowek}</h1>
</td></tr>

<tr><td style="padding:16px 32px 28px 32px;font-size:15px;line-height:1.6;color:${KOLOR_TEKST};">
${tresc}
</td></tr>

<tr><td style="padding:20px 32px 28px 32px;border-top:1px solid ${KOLOR_LINIA};font-size:12px;line-height:1.6;color:${KOLOR_CICHY};">
<p style="margin:0 0 8px 0;">
<a href="${APLIKACJA.adresWww}${SCIEZKI.regulamin}" style="color:${KOLOR_CICHY};">Regulamin</a> ·
<a href="${APLIKACJA.adresWww}${SCIEZKI.politykaPrywatnosci}" style="color:${KOLOR_CICHY};">Polityka prywatności</a> ·
<a href="${APLIKACJA.adresWww}/app/ustawienia" style="color:${KOLOR_CICHY};">Ustawienia konta</a>
</p>
<p style="margin:0;">${FIRMA.nazwa}, ${ADRES}, NIP ${FIRMA.nip}<br>
${rok} ${APLIKACJA.nazwa} · <a href="mailto:${FIRMA.email}" style="color:${KOLOR_CICHY};">${FIRMA.email}</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
