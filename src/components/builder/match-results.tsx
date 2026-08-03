"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, FileText, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCvStore, useMaDostepDo } from "@/lib/store";

/**
 * Ile wpisów dziennika zmian widać bez opłaty — tyle samo, co w szczegółach
 * dopasowania (`/app/dopasowania/[id]`). Panel edytora pokazywał wcześniej
 * WSZYSTKIE wpisy bez blokady, więc pełne „co zmieniliśmy i dlaczego" — czyli
 * to, za co ma się płacić — dawało się przeczytać za darmo tuż po analizie.
 */
const DARMOWE_ZMIANY = 1;

/**
 * Wynik ostatniej analizy — w edytorze, obok podglądu CV.
 *
 * KLUCZOWE ROZRÓŻNIENIE: dopasowanie tworzy OSOBNY dokument. CV otwarte
 * w edytorze (i to, co pokazuje podgląd oraz „Pobierz PDF" na górnej belce)
 * pozostaje NIETKNIĘTE — jest oryginałem, z którego robimy kolejne wersje.
 *
 * Wcześniej panel pisał „Po optymalizacji 78%", „Dodane słowa kluczowe"
 * i „Przeredagowaliśmy podsumowanie" w czasie przeszłym dokonanym, stojąc obok
 * podglądu pokazującego CV bez żadnej z tych zmian. Użytkownik miał pełne prawo
 * sądzić, że pobiera przerobioną wersję — a pobierał oryginał. Dlatego panel
 * mówi teraz wprost, czego dotyczy wynik, i daje bezpośrednie przejście do
 * przerobionego dokumentu.
 */
export function MatchResults() {
  const router = useRouter();
  const aiMeta = useCvStore((s) => s.aiMeta);
  const ostatnie = useCvStore((s) => s.tailorings[0]);
  const newCvFrom = useCvStore((s) => s.newCvFrom);
  const unlocked = useMaDostepDo(ostatnie?.id);

  if (aiMeta.matchScoreAfter === undefined) return null;

  const otworzPrzerobione = () => {
    if (!ostatnie) return;
    newCvFrom(
      ostatnie.tailoredCv,
      ostatnie.template,
      `${ostatnie.jobTitle} — dopasowane`
    );
    router.push("/app/kreator/edytor");
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-lg bg-secondary p-4">
      {/* `line-clamp-2` na tytule, NIE `truncate`: `truncate` ustawia
          `white-space: nowrap`, przez co min-content tego bloku równa się pełnej
          szerokości tytułu oferty i rozpycha całą lewą kolumnę edytora poza jej
          380 px (`min-w-0` na rodzicu tego nie cofa — blokowe dziecko i tak
          zgłasza min-content nieprzerwanego tekstu). */}
      <div className="min-w-0">
        <p className="eyebrow text-muted-foreground">Dopasowanie do oferty</p>
        {ostatnie && (
          <p className="mt-1 line-clamp-2 text-sm font-bold">{ostatnie.jobTitle}</p>
        )}
        {aiMeta.matchScoreBefore !== undefined && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">CV w edytorze</span>
              <span>{aiMeta.matchScoreBefore}/100</span>
            </div>
            <Progress value={aiMeta.matchScoreBefore} />
          </div>
        )}
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Wersja przerobiona</span>
            <span className="font-bold text-primary">
              {aiMeta.matchScoreAfter}/100
            </span>
          </div>
          <Progress value={aiMeta.matchScoreAfter} />
        </div>
      </div>

      {/* Bez tego zdania panel czyta się tak, jakby CV obok już było poprawione. */}
      <p className="rounded-md bg-accent p-3 text-xs text-muted-foreground">
        <FileText className="mr-1.5 inline size-3.5 align-[-2px]" />
        Przerobione CV to <strong className="text-foreground">osobny
        dokument</strong>. CV otwarte w edytorze — i to, które pobierzesz
        przyciskiem na górze — zostaje bez zmian.
      </p>

      {ostatnie && (
        <div className="flex flex-wrap gap-2">
          {unlocked ? (
            <Button size="sm" className="gap-2 font-bold" onClick={otworzPrzerobione}>
              Otwórz przerobione CV
              <ArrowRight className="size-4" />
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary" className="gap-2">
            <Link href={`/app/dopasowania/${ostatnie.id}`}>
              {unlocked ? "Pełny raport" : "Zobacz dopasowanie"}
            </Link>
          </Button>
        </div>
      )}

      {aiMeta.addedKeywords.length > 0 && (
        <div>
          {/* „Dodane" sugerowało, że trafiły do CV w edytorze. */}
          <p className="eyebrow text-muted-foreground">
            Słowa kluczowe w wersji przerobionej
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {aiMeta.addedKeywords.map((kw) => (
              <Badge key={kw} variant="outline" className="border-primary/40">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {aiMeta.changesLog.length > 0 && (
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
            <ClipboardList className="size-3.5" />
            Co zrobiliśmy w wersji przerobionej
          </p>
          <ol className="mt-2 flex flex-col gap-2">
            {aiMeta.changesLog.map((entry, i) => {
              const widoczne = unlocked || i < DARMOWE_ZMIANY;
              return (
                <li key={i} className="rounded-md bg-accent p-3 text-sm">
                  <span className="font-medium text-primary">
                    {entry.section}:
                  </span>{" "}
                  {widoczne ? (
                    <>
                      {entry.change}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.reason}
                      </p>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="size-3" />
                      Szczegóły w pełnym raporcie
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
