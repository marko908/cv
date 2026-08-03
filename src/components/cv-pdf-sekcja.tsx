import { View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

/**
 * Sekcja PDF z nagłówkiem, który NIE MOŻE zostać sam na dole strony.
 *
 * `minPresenceAhead` jest w tej wersji `@react-pdf/renderer` po prostu
 * IGNOROWANY — sprawdzone na wartościach 55/80/140 pt, z property na `<Text>`,
 * na `<View>` i na osobnym wrapperze: nagłówek „Projekty" i tak zostawał na
 * dole kartki, a wpisy szły na następną. Zamiast liczyć na podpowiedź dla
 * renderera dajemy twardą gwarancję: nagłówek i PIERWSZY wpis siedzą w jednym
 * bloku `wrap={false}`, więc albo mieszczą się razem, albo razem schodzą niżej.
 *
 * Osobny moduł (a nie eksport z `cv-pdf.tsx`), bo `cv-pdf.tsx` importuje układy
 * własne — import w drugą stronę robiłby cykl.
 */
export function SekcjaZNaglowkiem({
  styl,
  naglowek,
  wpisy,
}: {
  styl?: Style;
  naglowek: React.ReactNode;
  wpisy: React.ReactNode[];
}) {
  return (
    <View style={styl}>
      <View wrap={false}>
        {naglowek}
        {wpisy[0]}
      </View>
      {wpisy.slice(1)}
    </View>
  );
}
