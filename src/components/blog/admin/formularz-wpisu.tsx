"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import type { Json } from "@/lib/supabase/typy-bazy";
import { czasCzytania, zrobSlug } from "@/lib/blog/utils";
import { KATEGORIE_BLOGA, type PozycjaFaq, type StatusWpisu, type WpisBloga } from "@/lib/blog/typy";
import { EdytorTresci } from "./edytor";
import { EdytorFaq } from "./edytor-faq";
import { PodgladSeo } from "./podglad-seo";
import { WyborObrazka } from "./wybor-obrazka";

/** Limity, przy których Google ucina tekst w wynikach. */
const LIMIT = { zajawka: 160, metaTytul: 60, metaOpis: 155 } as const;

function Licznik({ ile, limit }: { ile: number; limit: number }) {
  return (
    <span
      className={ile > limit ? "text-destructive" : "text-muted-foreground"}
    >
      {ile}/{limit}
    </span>
  );
}

export function FormularzWpisu({ wpis }: { wpis?: WpisBloga }) {
  const router = useRouter();
  const supabase = klientPrzegladarka();
  const nowy = !wpis;

  const [tytul, setTytul] = useState(wpis?.tytul ?? "");
  const [slug, setSlug] = useState(wpis?.slug ?? "");
  /*
   * Dopóki redaktor nie tknie pola adresu, slug podąża za tytułem. Po ręcznej
   * zmianie przestaje — inaczej poprawka literówki w tytule opublikowanego
   * artykułu po cichu zmieniłaby jego URL, kasując pozycję w Google
   * i unieważniając wszystkie linki zewnętrzne.
   */
  const [slugRecznie, setSlugRecznie] = useState(!nowy);
  const [tresc, setTresc] = useState(wpis?.tresc ?? "");
  const [zajawka, setZajawka] = useState(wpis?.zajawka ?? "");
  const [metaTytul, setMetaTytul] = useState(wpis?.meta_tytul ?? "");
  const [metaOpis, setMetaOpis] = useState(wpis?.meta_opis ?? "");
  const [kategoria, setKategoria] = useState(wpis?.kategoria ?? KATEGORIE_BLOGA[0]);
  const [tagi, setTagi] = useState((wpis?.tagi ?? []).join(", "));
  const [okladka, setOkladka] = useState(wpis?.okladka_url ?? "");
  const [okladkaAlt, setOkladkaAlt] = useState(wpis?.okladka_alt ?? "");
  const [status, setStatus] = useState<StatusWpisu>(wpis?.status ?? "szkic");
  const [faq, setFaq] = useState<PozycjaFaq[]>(wpis?.faq ?? []);
  const [token, setToken] = useState(wpis?.token_podgladu ?? "");

  const [zapisuje, setZapisuje] = useState(false);
  const [blad, setBlad] = useState("");

  const zmienTytul = (v: string) => {
    setTytul(v);
    if (!slugRecznie) setSlug(zrobSlug(v));
  };

  const zapisz = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlad("");

    if (!tytul.trim() || !slug.trim() || !tresc.trim()) {
      setBlad("Tytuł, adres i treść są wymagane.");
      return;
    }
    setZapisuje(true);

    const dane = {
      tytul: tytul.trim(),
      slug: slug.trim(),
      zajawka: zajawka.trim() || null,
      tresc,
      okladka_url: okladka || null,
      okladka_alt: okladkaAlt.trim() || null,
      meta_tytul: metaTytul.trim() || null,
      meta_opis: metaOpis.trim() || null,
      kategoria,
      tagi: tagi.split(",").map((t) => t.trim()).filter(Boolean),
      // Liczony z treści przy KAŻDYM zapisie, nigdy wpisywany ręcznie —
      // rozjazd z rzeczywistą długością tekstu to obietnica złamana wobec
      // czytelnika w pierwszej linijce artykułu.
      czas_czytania_min: czasCzytania(tresc),
      status,
      // Kolumna jest typu JSONB, więc generator zna ją jako `Json`, a nasz
      // `PozycjaFaq` nie ma sygnatury indeksowej. Rzutujemy w JEDNYM miejscu —
      // ta sama decyzja, co przy `tresc`/`ai_meta` w `supabase/repo.ts`.
      faq: faq as unknown as Json,
      token_podgladu: token || null,
      /*
       * `opublikowano_o` ustawiamy tylko przy PIERWSZEJ publikacji. Nadpisanie
       * go przy każdej edycji przestawiałoby artykuł na górę listy po zwykłej
       * poprawce literówki i fałszowało datę publikacji w schemacie Article.
       */
      opublikowano_o:
        status === "opublikowany"
          ? (wpis?.opublikowano_o ?? new Date().toISOString())
          : (wpis?.opublikowano_o ?? null),
    };

    const { data, error } = nowy
      ? await supabase.from("wpis_bloga").insert(dane).select("id").single()
      : await supabase.from("wpis_bloga").update(dane).eq("id", wpis.id).select("id").single();

    setZapisuje(false);

    if (error) {
      setBlad(
        error.code === "23505"
          ? "Artykuł o tym adresie (slug) już istnieje. Zmień adres."
          : `Nie udało się zapisać: ${error.message}`
      );
      return;
    }

    router.push("/admin/blog");
    // Lista jest renderowana serwerowo — bez odświeżenia pokazałaby stan
    // sprzed zapisu.
    router.refresh();
    void data;
  };

  const generujToken = () =>
    setToken(crypto.randomUUID().replace(/-/g, "").slice(0, 20));

  return (
    <form onSubmit={zapisz} className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {nowy ? "Nowy artykuł" : "Edycja artykułu"}
        </h1>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/blog")}>
            Anuluj
          </Button>
          <Button type="submit" disabled={zapisuje} className="font-bold">
            {zapisuje && <Loader2 className="size-4 animate-spin" />}
            {zapisuje ? "Zapisuję…" : "Zapisz"}
          </Button>
        </div>
      </div>

      {blad && <p className="mt-4 text-sm text-destructive">{blad}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* ---- kolumna główna ---- */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="grid gap-1.5">
            <Label htmlFor="tytul">Tytuł</Label>
            <Input
              id="tytul"
              value={tytul}
              onChange={(e) => zmienTytul(e.target.value)}
              placeholder="Jak napisać CV bez doświadczenia"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="slug">Adres (slug)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugRecznie(true);
                setSlug(zrobSlug(e.target.value));
              }}
              placeholder="jak-napisac-cv-bez-doswiadczenia"
            />
            {!nowy && (
              <p className="text-xs text-muted-foreground">
                Zmiana adresu opublikowanego artykułu kasuje jego pozycję
                w Google i psuje istniejące linki.
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label>Treść</Label>
            <EdytorTresci wartosc={tresc} onZmiana={setTresc} />
          </div>

          <div className="grid gap-1.5">
            <Label>FAQ (schemat FAQPage)</Label>
            <EdytorFaq wartosc={faq} onZmiana={setFaq} />
          </div>
        </div>

        {/* ---- pasek boczny ---- */}
        <div className="flex flex-col gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusWpisu)}
              className="h-10 rounded-lg bg-field px-3 text-sm md:h-8"
            >
              <option value="szkic">Szkic</option>
              <option value="opublikowany">Opublikowany</option>
              <option value="zarchiwizowany">Zarchiwizowany</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="kategoria">Kategoria</Label>
            <select
              id="kategoria"
              value={kategoria}
              onChange={(e) => setKategoria(e.target.value)}
              className="h-10 rounded-lg bg-field px-3 text-sm md:h-8"
            >
              {KATEGORIE_BLOGA.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="tagi">Tagi (po przecinku)</Label>
            <Input
              id="tagi"
              value={tagi}
              onChange={(e) => setTagi(e.target.value)}
              placeholder="cv, ats, rekrutacja"
            />
          </div>

          <PoleOkladki
            url={okladka}
            alt={okladkaAlt}
            onUrl={setOkladka}
            onAlt={setOkladkaAlt}
          />

          <div className="grid gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="zajawka">Zajawka</Label>
              <Licznik ile={zajawka.length} limit={LIMIT.zajawka} />
            </div>
            <Textarea
              id="zajawka"
              rows={3}
              value={zajawka}
              onChange={(e) => setZajawka(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="meta-tytul">Meta tytuł</Label>
              <Licznik ile={metaTytul.length} limit={LIMIT.metaTytul} />
            </div>
            <Input
              id="meta-tytul"
              value={metaTytul}
              onChange={(e) => setMetaTytul(e.target.value)}
              placeholder="Pusty = użyjemy tytułu"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="meta-opis">Meta opis</Label>
              <Licznik ile={metaOpis.length} limit={LIMIT.metaOpis} />
            </div>
            <Textarea
              id="meta-opis"
              rows={3}
              value={metaOpis}
              onChange={(e) => setMetaOpis(e.target.value)}
              placeholder="Pusty = użyjemy zajawki"
            />
          </div>

          <PodgladSeo
            tytul={tytul}
            metaTytul={metaTytul}
            slug={slug}
            zajawka={zajawka}
            metaOpis={metaOpis}
          />

          <div className="grid gap-2">
            <Label>Link podglądu</Label>
            {token ? (
              <a
                href={`/blog/podglad/${token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 break-all text-xs text-primary hover:underline"
              >
                /blog/podglad/{token}
                <ExternalLink className="size-3 shrink-0" />
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">
                Brak. Wygeneruj, żeby pokazać szkic komuś bez konta.
              </p>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={generujToken}>
              {token ? "Wygeneruj nowy" : "Wygeneruj link"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function PoleOkladki({
  url,
  alt,
  onUrl,
  onAlt,
}: {
  url: string;
  alt: string;
  onUrl: (v: string) => void;
  onAlt: (v: string) => void;
}) {
  const [otwarte, setOtwarte] = useState(false);

  return (
    <div className="grid gap-1.5">
      <Label>Okładka</Label>
      {url ? (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
          <Image src={url} alt="" fill sizes="320px" className="object-cover" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOtwarte(true)}
          className="flex aspect-video items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground transition-colors hover:bg-accent"
        >
          Wybierz z biblioteki lub dodaj nowy
        </button>
      )}

      {url && (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setOtwarte(true)}>
            Zmień
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => onUrl("")}>
            Usuń
          </Button>
        </div>
      )}

      <Input
        value={alt}
        onChange={(e) => onAlt(e.target.value)}
        placeholder="Tekst alternatywny okładki"
        className="mt-1"
      />

      <WyborObrazka otwarty={otwarte} onOpenChange={setOtwarte} onWybierz={onUrl} />
    </div>
  );
}
