"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormularzAuth, TEKSTY_AUTH, type EkranAuth } from "./formularz-auth";

/**
 * Pełna STRONA konta — druga droga obok okienka (`auth-dialog.tsx`).
 *
 * Formularz jest ten sam komponent; różni się tylko oprawa. Trasy są potrzebne
 * niezależnie od modalu: wchodzi się na nie linkiem, wraca z logowania Google,
 * a menedżery haseł radzą sobie z pełną stroną lepiej niż z okienkiem.
 *
 * `?wroc=/app/kreator/edytor` pozwala wrócić tam, skąd użytkownik przyszedł.
 * Ograniczamy to do adresów WEWNĘTRZNYCH — parametr z adresu URL jest daną od
 * użytkownika, a przekierowanie na dowolny adres z parametru to klasyczny
 * otwarty redirect (podstawiony link do podrobionej strony logowania).
 */
export function StronaAuth({ ekranPoczatkowy }: { ekranPoczatkowy: EkranAuth }) {
  const router = useRouter();
  const params = useSearchParams();
  // Tytuł i opis idą za formularzem — przełączenie na logowanie nie może
  // zostawić nagłówka „Załóż konto" nad formularzem logowania.
  const [ekran, setEkran] = useState<EkranAuth>(ekranPoczatkowy);
  const { tytul, opis } = TEKSTY_AUTH[ekran];

  const zadany = params.get("wroc") ?? "";
  const wroc = zadany.startsWith("/") && !zadany.startsWith("//") ? zadany : "/app";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        {/* `size-8` musi być razem z width/height — globalny reset zmienia jeden
            wymiar, a next/image ostrzega wtedy o rozjeżdżonych proporcjach. */}
        <Image
          src="/aplikando-icon.png"
          alt=""
          width={32}
          height={32}
          className="size-8"
          priority
        />
        <span className="text-lg font-bold tracking-tight">Aplikando</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-dialog sm:p-8">
        <h1 className="text-xl font-bold tracking-tight">{tytul}</h1>
        <p className="mt-1.5 mb-6 text-sm text-muted-foreground">{opis}</p>

        <FormularzAuth
          ekranPoczatkowy={ekranPoczatkowy}
          onEkran={setEkran}
          onSukces={() => {
            router.push(wroc);
            // Odświeżenie serwerowego renderu — bez tego strona docelowa
            // pokazałaby stan sprzed zalogowania.
            router.refresh();
          }}
        />
      </div>
    </main>
  );
}
