"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Znaki LinkedIn i Facebooka jako wklejone SVG.
 *
 * Ta wersja `lucide-react` nie eksportuje już ikon marek (zostały usunięte
 * z biblioteki z powodów licencyjnych), a i tak nie chcielibyśmy ich stamtąd
 * brać — ten sam powód, dla którego logo Google w `formularz-auth.tsx` jest
 * wklejone, a nie pobierane: zewnętrzny obrazek to żądanie do obcego serwera
 * przy każdym wejściu, także od kogoś, kto odmówił zgód na cookies.
 */
function IkonaLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function IkonaFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

/**
 * Udostępnianie artykułu. LinkedIn i Facebook, bo tam siedzi grupa docelowa
 * (osoby szukające pracy w Polsce) - nie dokładamy sieci, których ten czytelnik
 * nie używa do treści o rekrutacji.
 *
 * Adres bierzemy z `window.location.href` przy kliknięciu, a NIE z propsa: to
 * komponent kliencki na stronie statycznej (ISR), więc w chwili renderu nie
 * znamy ewentualnych parametrów kampanii, z którymi ktoś wszedł.
 */
export function Udostepnij({ tytul }: { tytul: string }) {
  const [skopiowano, setSkopiowano] = useState(false);

  const kopiuj = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSkopiowano(true);
      setTimeout(() => setSkopiowano(false), 2000);
    } catch {
      // Brak uprawnień do schowka (albo kontekst bez HTTPS) - nie ma tu nic
      // do naprawienia po naszej stronie, a komunikat o błędzie przy
      // udostępnianiu byłby głośniejszy niż sam problem.
    }
  };

  const otworz = (adres: string) =>
    window.open(adres, "_blank", "noopener,noreferrer,width=600,height=600");

  const klasa =
    "inline-flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow mr-1 text-muted-foreground">Udostępnij</span>

      <button type="button" onClick={kopiuj} className={klasa} aria-label="Kopiuj link">
        {skopiowano ? (
          <Check className={cn("size-4 text-primary")} />
        ) : (
          <Link2 className="size-4" />
        )}
      </button>

      <button
        type="button"
        aria-label="Udostępnij na LinkedIn"
        className={klasa}
        onClick={() =>
          otworz(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
          )
        }
      >
        <IkonaLinkedIn />
      </button>

      <button
        type="button"
        aria-label="Udostępnij na Facebooku"
        className={klasa}
        onClick={() =>
          otworz(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(tytul)}`
          )
        }
      >
        <IkonaFacebook />
      </button>
    </div>
  );
}
