/**
 * Test NA ŻYWO: czy wysyłka maili przez Resend działa.
 * Uruchom: npm run test:mail
 *
 * Wymaga RESEND_API_KEY i MAIL_ZGLOSZENIA w .env.local.
 * Skrypt NIGDY nie wypisuje klucza — tylko adresy i wynik.
 *
 * Uwaga na etapie bez własnej domeny: nadawca `onboarding@resend.dev` wysyła
 * WYŁĄCZNIE na adres właściciela konta Resend. Wysyłka na dowolny inny adres
 * skończy się błędem — i to jest zachowanie oczekiwane, nie usterka.
 */
import { MAIL_OD, MAIL_ZGLOSZENIA, czyMailDostepny, wyslijMail } from "../src/lib/mail";

async function main() {
  if (!czyMailDostepny()) {
    console.error("✗ Brak RESEND_API_KEY w .env.local — nie ma czym wysłać.");
    process.exit(1);
  }
  if (!MAIL_ZGLOSZENIA) {
    console.error("✗ Brak MAIL_ZGLOSZENIA w .env.local — nie ma na co wysłać.");
    process.exit(1);
  }

  console.log(`Nadawca:  ${MAIL_OD}`);
  console.log(`Adresat:  ${MAIL_ZGLOSZENIA}`);
  console.log("Wysyłam…");

  const start = Date.now();
  const wynik = await wyslijMail({
    adresat: MAIL_ZGLOSZENIA,
    temat: "Aplikando — test wysyłki",
    html: "<p>Jeśli to czytasz, <strong>wysyłka działa</strong>. Możemy podpinać zgłoszenia błędów i onboarding.</p>",
    text: "Jeśli to czytasz, wysyłka działa.",
  });

  if (wynik.ok) {
    console.log(`✓ Wysłane w ${Date.now() - start} ms. Id: ${wynik.id ?? "(brak)"}`);
  } else {
    console.error(`✗ Nieudane: ${wynik.blad}`);
    process.exit(1);
  }
}

main();
