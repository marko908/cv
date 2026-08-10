"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Search, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { klientPrzegladarka } from "@/lib/supabase/klient-przegladarka";
import { skompresujDoWebp } from "@/lib/blog/kompresja-obrazka";
import { cn } from "@/lib/utils";

const BUCKET = "blog-obrazki";

/**
 * Biblioteka obrazków bloga — wybór z bucketu albo wgranie nowego.
 *
 * Jedno okno obsługuje oba zastosowania (okładka wpisu i obrazek wstawiany
 * w treść), bo to ten sam zbiór plików; różni się tylko to, co wywołujący
 * zrobi z wybranym adresem.
 *
 * Uprawnień NIE sprawdzamy tutaj — pisze o nich polityka Storage
 * („blog-obrazki: zapis tylko admin"). Ten komponent i tak renderuje się
 * wyłącznie wewnątrz `/admin`, ale to RLS jest gwarancją, nie routing.
 */
export function WyborObrazka({
  otwarty,
  onOpenChange,
  onWybierz,
}: {
  otwarty: boolean;
  onOpenChange: (v: boolean) => void;
  onWybierz: (url: string) => void;
}) {
  return (
    <Dialog open={otwarty} onOpenChange={onOpenChange}>
      {/* dvh + przewijany wyłącznie środek — ten sam wzorzec, co w modalach
          edytora CV (na telefonie `vh` chowa dolne przyciski pod paskiem). */}
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Biblioteka obrazków</DialogTitle>
        </DialogHeader>
        {/*
          Zawartość montowana DOPIERO po otwarciu — ten sam wzorzec, co
          `TrescPanelu` w `cookies/panel-cookies.tsx`. Dzięki temu lista plików
          wczytuje się od nowa przy każdym otwarciu (redaktor mógł w międzyczasie
          wgrać coś w innej karcie), a stan startuje czysty BEZ efektu
          synchronizującego, którego i tak wytknąłby
          `react-hooks/set-state-in-effect`.
        */}
        {otwarty && <TrescBiblioteki onWybierz={onWybierz} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function TrescBiblioteki({
  onWybierz,
  onOpenChange,
}: {
  onWybierz: (url: string) => void;
  onOpenChange: (v: boolean) => void;
}) {
  const [pliki, setPliki] = useState<string[]>([]);
  const [szukaj, setSzukaj] = useState("");
  // Startujemy od `true`: pobieranie rusza natychmiast po zamontowaniu, więc
  // ustawianie tego w efekcie byłoby zbędnym, synchronicznym `setState`.
  const [ladowanie, setLadowanie] = useState(true);
  const [wysylanie, setWysylanie] = useState(false);
  const [blad, setBlad] = useState("");

  const supabase = klientPrzegladarka();

  const publicznyUrl = useCallback(
    (nazwa: string) =>
      supabase.storage.from(BUCKET).getPublicUrl(nazwa).data.publicUrl,
    [supabase]
  );

  /**
   * SAMO pobranie listy — bez dotykania stanu. Rozdział jest celowy: funkcja
   * zapisująca stan, wołana z efektu, jest dla `react-hooks/set-state-in-effect`
   * nie do odróżnienia od synchronicznego `setState` w ciele efektu (analiza
   * nie widzi, że zapis dzieje się po `await`). Dzięki temu podziałowi stan
   * ustawiamy wyłącznie w callbackach — tak samo jak `useUzytkownik`.
   */
  const pobierzListe = useCallback(async () => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { sortBy: { column: "created_at", order: "desc" }, limit: 100 });
    if (error) throw error;
    // `list()` zwraca też wpisy katalogowe (bez `id`) — odsiewamy je, żeby
    // w siatce nie pojawiły się kafelki bez obrazka.
    return (data ?? []).filter((p) => p.id).map((p) => p.name);
  }, [supabase]);

  useEffect(() => {
    let aktualne = true;
    pobierzListe()
      .then((lista) => {
        if (!aktualne) return;
        setPliki(lista);
        setLadowanie(false);
      })
      .catch(() => {
        if (!aktualne) return;
        setBlad("Nie udało się wczytać biblioteki obrazków.");
        setLadowanie(false);
      });
    return () => {
      aktualne = false;
    };
  }, [pobierzListe]);

  const wyslij = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const plik = e.target.files?.[0];
    if (!plik) return;
    setWysylanie(true);
    setBlad("");

    const gotowy = await skompresujDoWebp(plik);
    // Nazwa z sygnaturą czasu + losowym sufiksem: dwa pliki o tej samej nazwie
    // wgrane z różnych urządzeń nie mogą się nadpisać.
    const nazwa = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${gotowy.name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(nazwa, gotowy, { contentType: gotowy.type });

    setWysylanie(false);
    e.target.value = "";
    if (error) {
      setBlad(`Nie udało się wgrać pliku: ${error.message}`);
      return;
    }
    // Odświeżenie z procedury obsługi zdarzenia, nie z efektu — tutaj zapis
    // stanu po `await` jest w porządku.
    setPliki(await pobierzListe().catch(() => pliki));
    onWybierz(publicznyUrl(nazwa));
    onOpenChange(false);
  };

  const usun = async (nazwa: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([nazwa]);
    if (error) {
      setBlad(`Nie udało się usunąć pliku: ${error.message}`);
      return;
    }
    setPliki((p) => p.filter((n) => n !== nazwa));
  };

  const widoczne = pliki.filter((n) =>
    n.toLowerCase().includes(szukaj.toLowerCase())
  );

  return (
    <>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={szukaj}
              onChange={(e) => setSzukaj(e.target.value)}
              placeholder="Szukaj po nazwie pliku"
              className="pl-9"
            />
          </div>
          <Button asChild variant="secondary" disabled={wysylanie}>
            <label className="cursor-pointer">
              {wysylanie ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {wysylanie ? "Wgrywam…" : "Wgraj nowy"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={wyslij}
              />
            </label>
          </Button>
        </div>

        {blad && <p className="shrink-0 text-sm text-destructive">{blad}</p>}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {ladowanie ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : widoczne.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {pliki.length === 0
                ? "Biblioteka jest pusta. Wgraj pierwszy obrazek."
                : "Nic nie pasuje do wyszukiwania."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {widoczne.map((nazwa) => (
                <div key={nazwa} className="group relative">
                  <button
                    type="button"
                    onClick={() => {
                      onWybierz(publicznyUrl(nazwa));
                      onOpenChange(false);
                    }}
                    className={cn(
                      "relative block aspect-video w-full overflow-hidden rounded-lg bg-secondary",
                      "ring-offset-background transition hover:ring-2 hover:ring-primary"
                    )}
                  >
                    <Image
                      src={publicznyUrl(nazwa)}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => usun(nazwa)}
                    aria-label={`Usuń ${nazwa}`}
                    className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {nazwa}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}
