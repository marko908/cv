"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Download,
  Link2,
  Loader2,
  Lock,
  RefreshCw,
  Target,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useCvStore, type Tailoring } from "@/lib/store";
import { buildTailoring, REVIEW_SPECIALISTS } from "@/lib/mock-review";
import type { TailoredCv } from "@/lib/cv-schema";
import {
  zastosujOdpowiedzi,
  type OdpowiedzWywiadu,
  type PytanieWywiadu,
} from "@/lib/ai/interview";
import type { ParsedOferta } from "@/lib/ai/job-offer";
import { czyPoprawnyLink } from "@/lib/ai/fetch-oferta";
import { PaywallDialog } from "./paywall-dialog";
import { ScoreBreakdown } from "./score-breakdown";
import { cn, pluralize } from "@/lib/utils";

type Step = "config" | "running" | "interview" | "result";

/** Wynik produkcji dopasowania: rekord + pytania wywiadu (nieutrwalane). */
type Produkt = {
  tailoring: Tailoring;
  pytania: PytanieWywiadu[];
  /** Sparsowana oferta — do odesłania przy re-runie (cache, brak drgania). */
  oferta?: ParsedOferta;
};

/**
 * Wynik produkcji: gotowe dopasowanie albo błąd wymagający reakcji użytkownika
 * (np. nie udało się pobrać oferty z linku — trzeba wkleić treść ręcznie).
 * Takiego błędu NIE zastępujemy demo-mockiem, bo użytkownik musi go zobaczyć.
 */
type WynikProdukcji = Produkt | { blad: string };

export function TailorFlow({
  trigger,
  defaultOpen = false,
}: {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [step, setStep] = useState<Step>("config");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [tailoringId, setTailoringId] = useState<string | null>(null);
  const [pytania, setPytania] = useState<PytanieWywiadu[]>([]);
  // Wzbogacone CV z wywiadu — baza kolejnego przebiegu (null = CV ze store'u).
  const [pendingCv, setPendingCv] = useState<TailoredCv | null>(null);
  // Komunikat, gdy nie dało się pobrać oferty z linku (prośba o wklejenie treści).
  const [bladOferty, setBladOferty] = useState<string | null>(null);

  const {
    cv,
    template,
    jobPosting,
    setJobPosting,
    aiMeta,
    setAiMeta,
    resetReview,
    addTailoring,
    removeTailoring,
  } = useCvStore();

  // Rekord do zastąpienia po przeliczeniu z wywiadu (żeby nie mnożyć historii).
  const zastapRef = useRef<string | null>(null);
  // Id pytań już obsłużonych w tej sesji (potwierdzone / „nie mam" / pominięte).
  // Kumulowane między rundami i przekazywane do pipeline, żeby te same pytania
  // nie wracały w nieskończoność. Czyszczone przy nowej analizie.
  const obsluzoneRef = useRef<Set<string>>(new Set());
  // Sparsowana oferta z pierwszego przebiegu — odsyłana przy re-runach, żeby
  // pipeline nie parsował oferty od nowa (koniec drgania wyniku + niższy koszt).
  const ofertaRef = useRef<ParsedOferta | null>(null);

  // Otwórz, gdy sygnał z zewnątrz (np. ?oferta=1) się pojawi.
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  // Edytor dotyczy konkretnego (aktywnego) CV, więc od razu konfiguracja
  // — bez wyboru CV. Jeśli wynik już jest, pokazujemy go.
  useEffect(() => {
    if (!open) return;
    setStep(aiMeta.matchScoreAfter !== undefined ? "result" : "config");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /**
   * Produkuje dopasowanie: najpierw prawdziwy pipeline AI (trasa /api/dopasuj),
   * a gdy się nie uda (brak klucza, błąd, offline) — mock, żeby demo działało
   * bez konfiguracji. Klient nigdy nie widzi klucza; cała praca z modelem jest
   * po stronie serwera.
   */
  const produce = async (bazaCv: TailoredCv): Promise<WynikProdukcji> => {
    try {
      const res = await fetch("/api/dopasuj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: bazaCv,
          // Oryginał (aktywne CV ze store'u) jako odniesienie wyniku „przed" i
          // diffu — na re-runie po wywiadzie `bazaCv` jest już wzbogacone.
          oryginalCv: cv,
          obsluzonePytania: [...obsluzoneRef.current],
          // Sparsowana oferta z pierwszego przebiegu (null = pipeline sparsuje).
          oferta: ofertaRef.current ?? undefined,
          template,
          jobText: jobPosting.text,
          jobUrl: jobPosting.url,
        }),
      });
      const data = await res.json().catch(() => null);
      // Link nie dał treści — użytkownik musi wkleić ogłoszenie ręcznie.
      if (res.status === 422 && data?.kod === "link-nieudany") {
        return { blad: data.error as string };
      }
      if (res.ok) {
        if (data?.ok && data.tailoring) {
          return {
            tailoring: data.tailoring as Tailoring,
            pytania: (data.pytania ?? []) as PytanieWywiadu[],
            oferta: (data.oferta ?? undefined) as ParsedOferta | undefined,
          };
        }
      }
    } catch {
      // sieć/serwer padł — spadamy na mock poniżej (bez wywiadu)
    }
    return { tailoring: buildTailoring(bazaCv, jobPosting, template), pytania: [] };
  };

  const zapiszWynik = (res: WynikProdukcji) => {
    // Błąd pobrania oferty: wracamy do konfiguracji z prośbą o wklejenie treści.
    if ("blad" in res) {
      setBladOferty(res.blad);
      setStep("config");
      return;
    }
    const { tailoring: t, pytania: p, oferta: o } = res;
    addTailoring(t);
    // Przeliczenie z wywiadu zastępuje poprzedni rekord, nie mnoży historii.
    if (zastapRef.current && zastapRef.current !== t.id) {
      removeTailoring(zastapRef.current);
    }
    zastapRef.current = null;
    // Zapamiętaj sparsowaną ofertę — re-run ją odeśle, więc nie parsujemy od nowa.
    if (o) ofertaRef.current = o;
    setAiMeta(t.aiMeta);
    setTailoringId(t.id);
    setPytania(p);
    setStep("result");
  };

  // Wywiad: nakładamy potwierdzone odpowiedzi na CV i uruchamiamy ponownie.
  const wzmocnij = (odpowiedzi: OdpowiedzWywiadu[]) => {
    const baza = pendingCv ?? cv;
    // Wszystkie pokazane pytania są teraz obsłużone (potwierdzone lub nie) —
    // nie zadawaj ich w kolejnych rundach. To domyka pętlę wywiadu.
    pytania.forEach((p) => obsluzoneRef.current.add(p.id));
    zastapRef.current = tailoringId; // ten rekord skasujemy po przeliczeniu
    setPendingCv(zastosujOdpowiedzi(baza, pytania, odpowiedzi));
    setStep("running");
  };

  // Świeża analiza od zera — czyścimy stan pętli wywiadu i cache oferty.
  const nowaAnaliza = () => {
    obsluzoneRef.current = new Set();
    ofertaRef.current = null;
    zastapRef.current = null;
    setPendingCv(null);
    setStep("running");
  };

  const resetFlow = () => {
    resetReview();
    setPytania([]);
    setPendingCv(null);
    obsluzoneRef.current = new Set();
    ofertaRef.current = null;
    zastapRef.current = null;
    setStep("config");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-h-[88dvh] overflow-y-auto shadow-dialog sm:max-w-xl">
          {step === "config" && (
            <ConfigStep
              jobPosting={jobPosting}
              setJobPosting={setJobPosting}
              blad={bladOferty}
              onRun={() => {
                setBladOferty(null);
                nowaAnaliza();
              }}
            />
          )}
          {step === "running" && (
            <RunningStep
              produce={() => produce(pendingCv ?? cv)}
              onDone={zapiszWynik}
              onCancel={() => setStep("config")}
            />
          )}
          {step === "interview" && (
            <InterviewStep
              pytania={pytania}
              onSubmit={wzmocnij}
              onSkip={() => setStep("result")}
            />
          )}
          {step === "result" && (
            <ResultStep
              tailoringId={tailoringId}
              pytania={pytania}
              onWzmocnij={() => setStep("interview")}
              onClose={() => setOpen(false)}
              onRerun={resetFlow}
              onUnlock={() => setPaywallOpen(true)}
            />
          )}
        </DialogContent>
      </Dialog>

      <PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  );
}

/* ---------- Ekran 1: konfiguracja ---------- */
function ConfigStep({
  jobPosting,
  setJobPosting,
  blad,
  onRun,
}: {
  jobPosting: { url: string; text: string };
  setJobPosting: (patch: { url?: string; text?: string }) => void;
  blad: string | null;
  onRun: () => void;
}) {
  // Wystarczy JEDNO z dwóch: wklejona treść albo link do oferty. Gdy jest sam
  // link, treść pobieramy po stronie serwera; jeśli się nie uda, poprosimy
  // o ręczne wklejenie (komunikat `blad`).
  const maTresc = jobPosting.text.trim().length >= 40;
  const maLink = czyPoprawnyLink(jobPosting.url);
  const canRun = maTresc || maLink;
  return (
    <>
      <DialogHeader>
        <p className="eyebrow flex items-center gap-1.5 text-primary">
          <Target className="size-3.5" />
          Dopasowanie do oferty
        </p>
        <DialogTitle>Dopasuj CV do oferty</DialogTitle>
        <DialogDescription>
          Panel „rekruterów" oceni Twoje CV pod kątem tej oferty i wskaże
          konkretne poprawki — po polsku, pod ATS.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="flow-url" className="flex items-center gap-1.5">
            <Link2 className="size-3.5" />
            Link do oferty
          </Label>
          <Input
            id="flow-url"
            value={jobPosting.url}
            onChange={(e) => setJobPosting({ url: e.target.value })}
            placeholder="https://www.pracuj.pl/praca/..."
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="flow-text">
            Treść ogłoszenia{maLink ? " (opcjonalnie)" : ""}
          </Label>
          <Textarea
            id="flow-text"
            rows={8}
            value={jobPosting.text}
            onChange={(e) => setJobPosting({ text: e.target.value })}
            placeholder="Wklej pełną treść — wymagania, obowiązki, mile widziane. Im więcej szczegółów, tym trafniejszy wynik."
          />
          <p className="text-xs text-muted-foreground">
            Wystarczy link albo wklejona treść — możesz podać jedno lub oba.
            Wklejone ogłoszenie daje najdokładniejszy wynik.
          </p>
        </div>

        {blad && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-xs text-foreground">{blad}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="eyebrow text-muted-foreground">
          Panel rekruterów · ~30&nbsp;s
        </span>
        <Button
          className="btn-label gap-2 font-bold"
          disabled={!canRun}
          onClick={onRun}
        >
          Uruchom analizę
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </>
  );
}

/* ---------- Ekran 2: analiza w toku ---------- */
function RunningStep({
  produce,
  onDone,
  onCancel,
}: {
  produce: () => Promise<WynikProdukcji>;
  onDone: (res: WynikProdukcji) => void;
  onCancel: () => void;
}) {
  const [doneCount, setDoneCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const produceRef = useRef(produce);
  produceRef.current = produce;
  // Trzyma jedno wywołanie pipeline'u. W trybie dev React StrictMode uruchamia
  // efekt dwa razy — bez tego pipeline (a więc płatny model) odpalałby się
  // dwukrotnie. Oba przebiegi efektu współdzielą tę samą obietnicę, więc
  // realne wywołanie modelu jest jedno. W produkcji StrictMode i tak nie dubluje.
  const produkcjaRef = useRef<Promise<WynikProdukcji> | null>(null);

  useEffect(() => {
    const total = REVIEW_SPECIALISTS.length;
    let cancelled = false;
    let finished = false;
    let wynik: WynikProdukcji | null = null;
    let minPo = false; // czy minęła minimalna animacja

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Urealniamy pasek postępu. Zamiast stałych, krótkich odstępów (przez które
    // pierwsze kroki „wyskakiwały" od razu) losujemy czas trwania każdego kroku
    // tak, by SUMA odpowiadała szacowanemu czasowi pracy AI. Każde uruchomienie
    // wygląda trochę inaczej — bardziej jak realne przetwarzanie.
    const SZACOWANY_MS = 11000; // z obserwacji: pełne dopasowanie ~10–14 s
    const wagi = REVIEW_SPECIALISTS.map(() => 0.6 + Math.random()); // 0.6–1.6
    const sumaWag = wagi.reduce((a, b) => a + b, 0);
    // Skumulowane momenty ukończenia kolejnych kroków (ostatni ≈ SZACOWANY_MS).
    const momenty: number[] = [];
    wagi.reduce((acc, w, i) => (momenty[i] = acc + (w / sumaWag) * SZACOWANY_MS), 0);

    // Kroki 1..(total-1) kończą się w wylosowanych, narastających momentach.
    // Ostatni krok („Język") czeka na wynik AI — patrz finalize niżej.
    for (let i = 0; i < total - 1; i++) {
      const spec = REVIEW_SPECIALISTS[i];
      timers.push(
        setTimeout(() => {
          setDoneCount((n) => n + 1);
          setLog((l) => [...l, `${spec.label} — ${spec.note}`]);
        }, momenty[i])
      );
    }

    const finalize = () => {
      if (cancelled || finished || !wynik) return;
      // Błąd oferty pokazujemy NATYCHMIAST — nie każemy czekać na animację
      // udawanej analizy, skoro i tak trzeba wrócić i wkleić treść.
      if ("blad" in wynik) {
        finished = true;
        doneRef.current(wynik);
        return;
      }
      if (!minPo) return;
      finished = true;
      const ostatni = REVIEW_SPECIALISTS[total - 1];
      setDoneCount(total);
      setLog((l) => [...l, `${ostatni.label} — ${ostatni.note}`]);
      doneRef.current(wynik);
    };

    // Ostatni krok nie kończy się wcześniej niż po szacowanym czasie. Jeśli AI
    // odpowie później — czekamy na nią (krok „Język" kręci się aż do wyniku).
    timers.push(
      setTimeout(() => {
        minPo = true;
        finalize();
      }, momenty[total - 1])
    );

    // Prawdziwa praca leci równolegle — ale odpalamy ją tylko RAZ.
    // Drugi przebieg efektu (StrictMode w dev) podpina się pod tę samą obietnicę.
    if (!produkcjaRef.current) {
      produkcjaRef.current = produceRef.current();
    }
    produkcjaRef.current.then((t) => {
      if (cancelled) return;
      wynik = t;
      finalize();
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const total = REVIEW_SPECIALISTS.length;

  return (
    <>
      <div className="flex items-center justify-between pr-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
          Przerwij
        </button>
        <span className="eyebrow text-primary">Analiza…</span>
      </div>

      <DialogHeader>
        <DialogTitle>Analizujemy Twoje CV</DialogTitle>
        <DialogDescription>
          Pięciu specjalistów ocenia je równolegle, potem składamy raport.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        {REVIEW_SPECIALISTS.map((spec, i) => {
          const done = i < doneCount;
          const running = i === doneCount;
          return (
            <div
              key={spec.id}
              className="flex items-center justify-between rounded-md px-1 py-1.5"
            >
              <span className="flex items-center gap-2.5 text-sm">
                {done ? (
                  <Check className="size-4 text-primary" />
                ) : running ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="size-4 rounded-full border border-muted-foreground/40" />
                )}
                <span className={done ? "text-foreground" : "text-muted-foreground"}>
                  {spec.label}
                </span>
              </span>
              <span className="eyebrow text-muted-foreground">
                {done ? "gotowe" : running ? "w toku" : "czeka"}
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-1 flex justify-between">
          <span className="eyebrow text-muted-foreground">Specjaliści</span>
          <span className="eyebrow text-muted-foreground">
            {doneCount} / {total} gotowe
          </span>
        </div>
        <Progress value={(doneCount / total) * 100} />
      </div>

      {log.length > 0 && (
        <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          {log.map((line, i) => (
            <li key={i} className="truncate">
              • {line}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------- Ekran pośredni: wywiad ---------- */
function InterviewStep({
  pytania,
  onSubmit,
  onSkip,
}: {
  pytania: PytanieWywiadu[];
  onSubmit: (odpowiedzi: OdpowiedzWywiadu[]) => void;
  onSkip: () => void;
}) {
  // Stan odpowiedzi: dla każdego pytania „mam” + opcjonalny szczegół.
  const [stan, setStan] = useState<
    Record<string, { ma: boolean; szczegol: string }>
  >(() => Object.fromEntries(pytania.map((p) => [p.id, { ma: false, szczegol: "" }])));

  const potwierdzone = pytania.filter((p) => stan[p.id]?.ma).length;

  const wyslij = () => {
    onSubmit(
      pytania.map((p) => ({
        id: p.id,
        ma: stan[p.id]?.ma ?? false,
        szczegol: stan[p.id]?.szczegol,
      }))
    );
  };

  const doswiadczenie = pytania.filter((p) => p.typ === "doswiadczenie");
  const cechy = pytania.filter((p) => p.typ === "cecha");

  // Karta pytania — framing i pola zależą od rodzaju (doświadczenie vs cecha).
  const karta = (p: PytanieWywiadu) => {
    const s = stan[p.id] ?? { ma: false, szczegol: "" };
    const tak = p.typ === "doswiadczenie" ? "Mam to" : "Wskaż w CV";
    const nie = p.typ === "doswiadczenie" ? "Nie mam" : "Pomiń";
    return (
      <div key={p.id} className="card-surface p-4">
        <p className="text-sm font-medium">{p.pytanie}</p>
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            onClick={() =>
              setStan((st) => ({ ...st, [p.id]: { ...s, ma: true } }))
            }
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold transition-colors",
              s.ma
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {tak}
          </button>
          <button
            type="button"
            onClick={() =>
              setStan((st) => ({ ...st, [p.id]: { ma: false, szczegol: "" } }))
            }
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold transition-colors",
              !s.ma
                ? "bg-accent text-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {nie}
          </button>
        </div>
        {/* Pole na konkret tylko dla doświadczenia — cechy nie opisujemy. */}
        {s.ma && p.typ === "doswiadczenie" && (
          <Textarea
            value={s.szczegol}
            onChange={(e) =>
              setStan((st) => ({
                ...st,
                [p.id]: { ...s, szczegol: e.target.value },
              }))
            }
            placeholder={p.hint}
            className="mt-2 min-h-16 text-sm"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <DialogHeader>
        <p className="eyebrow flex items-center gap-1.5 text-primary">
          <Target className="size-3.5" />
          Wzmocnij swoje CV
        </p>
        <DialogTitle>Uzupełnij to, czego brakuje</DialogTitle>
        <DialogDescription>
          Ta oferta wspomina o rzeczach, których nie ma w Twoim CV. Nie
          dopisujemy niczego za Ciebie — potwierdź tylko to, co faktycznie
          Cię dotyczy, a policzymy dopasowanie od nowa.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5">
        {doswiadczenie.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="eyebrow text-muted-foreground">Twoje doświadczenie</p>
            {doswiadczenie.map(karta)}
          </div>
        )}
        {cechy.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="eyebrow text-muted-foreground">
              Cechy — warto wskazać, jeśli Cię opisują
            </p>
            {cechy.map(karta)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Pomiń
        </button>
        <Button onClick={wyslij} disabled={potwierdzone === 0} className="gap-2 font-bold">
          <RefreshCw className="size-4" />
          Przelicz z {potwierdzone === 1 ? "1 uzupełnieniem" : `${potwierdzone} uzupełnieniami`}
        </Button>
      </div>
    </>
  );
}

/* ---------- Ekran 3: wynik ---------- */
const FREE_FINDINGS = 2; // ile poprawek widać przed opłatą

function ResultStep({
  tailoringId,
  pytania,
  onWzmocnij,
  onClose,
  onRerun,
  onUnlock,
}: {
  tailoringId: string | null;
  pytania: PytanieWywiadu[];
  onWzmocnij: () => void;
  onClose: () => void;
  onRerun: () => void;
  onUnlock: () => void;
}) {
  const aiMeta = useCvStore((s) => s.aiMeta);
  const score = aiMeta.matchScoreAfter ?? 0;
  const before = aiMeta.matchScoreBefore;
  const findings = aiMeta.findings ?? [];
  const breakdown = aiMeta.scoreBreakdown ?? [];
  const unlocked = aiMeta.unlocked ?? false;
  const fixCount = findings.length;
  const lockedCount = Math.max(0, fixCount - FREE_FINDINGS);
  const mozliwyWywiad = pytania.length > 0;

  return (
    <>
      <div className="flex items-center justify-between gap-2 pr-8">
        <p className="eyebrow flex items-center gap-1.5 text-primary">
          <Target className="size-3.5" />
          Wynik dopasowania
        </p>
        <button
          type="button"
          onClick={onRerun}
          className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-3.5" />
          Analizuj ponownie
        </button>
      </div>

      {/* Wynik ogólny */}
      <div className="rounded-lg bg-secondary p-5 text-center">
        <p className="eyebrow text-muted-foreground">Dopasowanie do oferty</p>
        <p className="mt-1 font-mono text-4xl font-bold text-primary">
          {score}
          <span className="text-lg text-muted-foreground">/100</span>
        </p>
        {before !== undefined && score > before && (
          <p className="mt-1 text-sm text-muted-foreground">
            przed dopasowaniem: {before}/100 —{" "}
            <span className="font-bold text-primary">+{score - before}</span>
          </p>
        )}
        {before !== undefined && score <= before && (
          <p className="mt-1 text-sm text-muted-foreground">
            Twoje CV już dobrze pasuje do tej oferty — dopracowaliśmy brzmienie
            pod ATS i czytelność.
          </p>
        )}
      </div>

      {/* Rozkład wyniku — użytkownik od razu widzi, z czego wynika liczba */}
      {breakdown.length > 0 && <ScoreBreakdown breakdown={breakdown} />}

      {/* Wywiad — realny sposób na podniesienie wyniku bez zmyślania */}
      {mozliwyWywiad && (
        <button
          type="button"
          onClick={onWzmocnij}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
        >
          <span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
              <Target className="size-4" />
              Możesz podnieść ten wynik
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Oferta wymaga {pluralize(pytania.length, "rzeczy", "rzeczy", "rzeczy")},
              których nie ma w Twoim CV. Jeśli faktycznie je masz — potwierdź, a
              policzymy dopasowanie od nowa. Bez zmyślania.
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-primary" />
        </button>
      )}

      {/* Poprawki */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted-foreground">Co poprawiliśmy</p>
          <span className="eyebrow text-muted-foreground">
            {pluralize(fixCount, "poprawka", "poprawki", "poprawek")}
          </span>
        </div>

        {findings.map((f, i) => {
          // Pierwsze poprawki widoczne za darmo; reszta za paywallem.
          const visible = unlocked || i < FREE_FINDINGS;
          return (
            <div key={f.id} className="rounded-lg bg-secondary p-3">
              <p className="text-sm font-bold">{f.title}</p>
              {visible ? (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {f.detail}
                </p>
              ) : (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3" />
                  Szczegóły w pełnym raporcie
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Paywall CTA */}
      {!unlocked && lockedCount > 0 && (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-center">
          <Lock className="mx-auto size-5 text-primary" />
          <p className="mt-2 text-sm font-bold">
            Zobacz wszystkie{" "}
            {pluralize(fixCount, "poprawkę", "poprawki", "poprawek")} i pobierz
            przerobione CV
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Odblokuj pełny raport z gotowymi przeróbkami oraz dopasowane CV do
            edycji i pobrania.
          </p>
          <Button className="btn-label mt-3 w-full font-bold" onClick={onUnlock}>
            Odblokuj raport i CV
          </Button>
        </div>
      )}

      {unlocked && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">
            <Check className="size-4" />
            Pełny raport i przerobione CV odblokowane
          </div>
          {tailoringId && (
            <Button asChild className="btn-label w-full gap-2 font-bold">
              <Link
                href={`/app/dopasowania/${tailoringId}`}
                onClick={onClose}
              >
                <Download className="size-4" />
                Otwórz przerobione CV
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
