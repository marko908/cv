/**
 * Pytania i odpowiedzi z landingu — JEDNO ŹRÓDŁO dla dwóch odbiorców:
 * sekcji `FaqSection` (człowiek) i schematu `FAQPage` w JSON-LD (Google
 * i asystenci AI).
 *
 * Dlaczego osobny moduł, a nie stała w komponencie: `lib/schema-strony.ts`
 * musiałby wtedy importować z `components/`, czyli w odwrotną stronę niż
 * reszta repo. Dwie kopie tych samych pytań też odpadają — rozjechany FAQ
 * w strukturalnych danych to dokładnie ten rodzaj błędu, którego nikt nie
 * zauważa, bo w przeglądarce wszystko wygląda dobrze.
 *
 * ODPOWIEDZI SĄ CZYSTYM TEKSTEM, nie JSX. `FAQPage` przyjmuje tekst, a nie
 * drzewo Reacta, więc odnośnik wewnątrz odpowiedzi opisujemy osobnym polem
 * (`odnosnik`) i podmieniamy dopiero przy renderowaniu. Inaczej albo schemat
 * dostawałby odpowiedź bez fragmentu z linkiem, albo trzeba by trzymać dwa
 * warianty tej samej treści.
 */

import { CENA_JEDNORAZOWA, LIMIT_DARMOWY, PLANY } from "@/lib/subscription";
import { SCIEZKI } from "@/lib/prawne/dane";

export interface PytanieLandingu {
  pytanie: string;
  odpowiedz: string;
  /**
   * Fraza z `odpowiedz`, która ma stać się odnośnikiem. MUSI występować
   * w treści dosłownie — inaczej renderer zostawi odpowiedź bez linku
   * (świadomie cicho: brak podlinkowania jest mniej szkodliwy niż wywalona
   * strona główna).
   */
  odnosnik?: { fraza: string; href: string };
}

export const FAQ_LANDING: readonly PytanieLandingu[] = [
  {
    pytanie: "Czy AI zmyśla informacje w moim CV?",
    odpowiedz:
      "Nie. AI dostaje wyłącznie fakty, które sam podałeś w CV, i może je tylko wybrać, uporządkować oraz przeformułować - nigdy dopisać. Każdy wygenerowany fragment przechodzi przez walidator w kodzie, który odrzuca zmyślone liczby, umiejętności, firmy czy stanowiska.",
  },
  {
    pytanie: "Czy muszę zakładać konto?",
    odpowiedz:
      "Tak - konto jest wymagane do korzystania z Aplikacji, ale założenie go zajmuje około 30 sekund i jest bezpłatne.",
  },
  {
    pytanie: "Co jest darmowe, a za co płacę?",
    odpowiedz: `Konto, kreator CV, wszystkie szablony i pobranie własnego CV w PDF są bezpłatne zawsze. Do tego co miesiąc dostajesz ${LIMIT_DARMOWY} w pełni odblokowane dopasowanie za darmo - płacisz dopiero za kolejne w tym samym miesiącu.`,
  },
  {
    pytanie: "Ile kosztuje kolejne dopasowanie CV do oferty?",
    odpowiedz: `Jednorazowo ${CENA_JEDNORAZOWA} zł, albo subskrypcja od ${PLANY.start.ceny.miesiac} zł miesięcznie za ${PLANY.start.limit} dopasowań.`,
  },
  {
    pytanie: "Czy moje CV przejdzie przez systemy rekrutacyjne (ATS)?",
    odpowiedz:
      "Tak, wszystkie szablony - także te ze zdjęciem i panelem bocznym. Pilnujemy kolejności tekstu w pliku PDF, więc systemy ATS czytają go poprawnie niezależnie od wybranego układu.",
  },
  {
    pytanie: "Co się dzieje z moimi danymi?",
    odpowiedz:
      "Przetwarzamy je zgodnie z RODO - szczegóły w Polityce prywatności. Dane zapisane na koncie widzisz i usuwasz samodzielnie w ustawieniach.",
    odnosnik: { fraza: "Polityce prywatności", href: SCIEZKI.politykaPrywatnosci },
  },
] as const;
