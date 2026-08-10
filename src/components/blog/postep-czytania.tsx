"use client";

import { useEffect, useState } from "react";

/**
 * Pasek postępu czytania na górze strony artykułu.
 *
 * Liczony względem SAMEGO ARTYKUŁU (`#artykul`), nie całego dokumentu - inaczej
 * pasek pokazywałby 60% w miejscu, w którym tekst już się skończył, a niżej
 * zostały tylko FAQ, CTA i stopka.
 *
 * Nasłuch jest pasywny i zdejmowany przy odmontowaniu; `scroll` bez
 * `{ passive: true }` potrafi blokować płynność przewijania na telefonie.
 */
export function PostepCzytania() {
  const [procent, setProcent] = useState(0);

  useEffect(() => {
    const przelicz = () => {
      const el = document.getElementById("artykul");
      if (!el) return;
      const gora = el.offsetTop;
      const wysokosc = el.offsetHeight;
      const przewinieto = window.scrollY - gora + window.innerHeight * 0.5;
      const udzial = (przewinieto / wysokosc) * 100;
      setProcent(Math.min(100, Math.max(0, udzial)));
    };

    przelicz();
    window.addEventListener("scroll", przelicz, { passive: true });
    window.addEventListener("resize", przelicz);
    return () => {
      window.removeEventListener("scroll", przelicz);
      window.removeEventListener("resize", przelicz);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${procent}%` }}
      />
    </div>
  );
}
