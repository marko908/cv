# Grafiki — Ile stron powinno mieć CV?

## Okładka — `ile-stron-cv-okladka.webp`

Format 2:1 (np. 1200×600 px) — kontener na stronie ma `aspect-[2/1]`.

**Alt:** Kandydat porównujący jedną i dwie wersje swojego CV

**Prompt:**
A realistic wide photo of two printed CV page stacks side by side on a bright desk, one stack noticeably shorter than the other, a person's hand reaching to compare them, natural window light, neutral warm tones, shallow depth of field, no readable text or logos, professional and clean mood, shot in 2:1 landscape framing

## Grafika 1 — infographic — `ile-stron-cv-01.webp`

**Alt:** Porównanie CV jednostronicowego i dwustronicowego w zależności od stażu pracy
**Podpis:** Jedna strona przy stażu do 5 lat, druga dopiero przy dłuższym dorobku

**Prompt:**
A clean flat-design infographic comparing two CV page mockups side by side, with Polish text labels rendered clearly and legibly in a modern sans-serif font. Left mockup labeled "1 strona" with a smaller caption below reading "Do 5 lat doświadczenia". Right mockup labeled "2 strony" with a smaller caption below reading "Dłuższy staż, bogaty dorobek". Minimal gray wireframe text blocks representing CV content inside each page, soft blue accent color, plenty of white space, professional vector illustration style. All visible text must be in Polish exactly as specified above, no English words anywhere in the image.

<!-- Uwaga redakcyjna: celowo BEZ liczby lat po prawej stronie (np. "ponad 10 lat")
     — artykuł ma osobną, pośrednią kategorię "5-10 lat -> 1-2 strony" (tabela
     w sekcji "Kiedy dwie strony są uzasadnione"), więc sztywna druga granica
     zostawiałaby na infografice niewyjaśnioną dziurę 5-10 lat. "Dłuższy staż,
     bogaty dorobek" pasuje do figcaption artykułu ("przy dłuższym dorobku"),
     bez sugerowania fałszywej ostrej granicy. -->

## Grafika 2 — photo — `ile-stron-cv-02.webp`

**Alt:** Kandydat skracający swoje CV, usuwając zbędne fragmenty
**Podpis:** Skracanie CV zaczyna się od usunięcia tego, co nieistotne dla oferty

**Prompt:**
A realistic photo of a person at a bright modern desk editing a document on a laptop screen, focused expression, printed pages with visible highlighter marks next to the laptop, natural window light, neutral warm tones, shallow depth of field, no readable text or logos

---

Po wygenerowaniu: zapisz jako `.webp`, wgraj przez bibliotekę obrazków w `/admin/blog`, podmień `src="/blog/obrazki/..."` w treści wpisu i usuń akapity `class="image-prompt"`.
