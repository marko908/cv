"use client";

import { ClipboardList, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCvStore } from "@/lib/store";

/**
 * Ile wpisów dziennika zmian widać bez opłaty — tyle samo, co w szczegółach
 * dopasowania (`/app/dopasowania/[id]`). Panel edytora pokazywał wcześniej
 * WSZYSTKIE wpisy bez blokady, więc pełne „co zmieniliśmy i dlaczego" — czyli
 * to, za co ma się płacić — dawało się przeczytać za darmo tuż po analizie.
 */
const DARMOWE_ZMIANY = 1;

/**
 * Wyniki analizy AI: Match Score przed/po, dodane słowa kluczowe,
 * dziennik zmian. Renderuje się dopiero, gdy analiza została wykonana.
 */
export function MatchResults() {
  const aiMeta = useCvStore((s) => s.aiMeta);

  if (aiMeta.matchScoreAfter === undefined) return null;

  const unlocked = aiMeta.unlocked ?? false;

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-secondary p-4">
      <div>
        <p className="eyebrow text-muted-foreground">Dopasowanie do oferty</p>
        {aiMeta.matchScoreBefore !== undefined && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Przed</span>
              <span>{aiMeta.matchScoreBefore}%</span>
            </div>
            <Progress value={aiMeta.matchScoreBefore} />
          </div>
        )}
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Po optymalizacji</span>
            <span className="font-bold text-primary">
              {aiMeta.matchScoreAfter}%
            </span>
          </div>
          <Progress value={aiMeta.matchScoreAfter} />
        </div>
      </div>

      {aiMeta.addedKeywords.length > 0 && (
        <div>
          <p className="eyebrow text-muted-foreground">Dodane słowa kluczowe</p>
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
            Dziennik zmian
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
