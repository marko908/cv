import type { ReviewFinding } from "@/lib/store";

/**
 * Treść jednej wskazówki: akapit, opcjonalna lista i zdanie zamykające.
 *
 * WSPÓLNA dla ekranu wyniku w kreatorze (`tailor-flow`) i szczegółów
 * dopasowania (`/app/dopasowania/[id]`) - te same dane w dwóch miejscach mają
 * wyglądać tak samo, a dwie kopie renderu prędzej czy później by się
 * rozjechały (ten sam powód, co przy `score-breakdown`).
 */
export function TrescWskazowki({ finding }: { finding: ReviewFinding }) {
  return (
    <div className="mt-1.5 flex flex-col gap-1.5 text-sm text-muted-foreground">
      <p>{finding.detail}</p>
      {finding.items && finding.items.length > 0 && (
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {finding.items.map((pozycja) => (
            <li key={pozycja}>{pozycja}</li>
          ))}
        </ul>
      )}
      {finding.podsumowanie && <p>{finding.podsumowanie}</p>}
    </div>
  );
}
