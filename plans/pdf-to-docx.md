# Piano: conversione PDF in DOCX

## Contesto

Aggiungere un nuovo strumento alla toolbox che converta PDF in DOCX, speculare a DOCX in PDF. Il progetto usa Vue/TypeScript e lo strumento esistente converte localmente nel browser, accetta più file e scarica i risultati in uno ZIP.

## Approccio

- Mantenere l’esperienza e i comportamenti dello strumento DOCX→PDF, adattandoli a PDF→DOCX: batch, nomi modificabili, stato/errori per file e download ZIP.
- Mantenere tutte le elaborazioni nel browser: i PDF non vengono caricati o inviati a servizi esterni.
- Usare `reamkit` già dipendenza installata (`1.33.0`): `Ream.parse(bytes)` e conversione DOCX nel browser, ricostruzione del layout da glyph/page geometry e mantenimento di artwork/raster. Per PDF composti da scansioni, preservare visivamente la pagina come immagine; non eseguire OCR né generare testo da pagine immagine.
- Validare la preservazione visiva con PDF testuali, scansioni e documenti misti. Usare `convertWithReport('docx')` per esporre eventuali perdite; non dichiarare fedeltà perfetta senza test su fixture rappresentative.

## File da modificare

- `src/router/index.ts` — route lazy `/pdf-to-docx`.
- `src/views/HomeView.vue`, `src/components/AppSidebar.vue` — nuova card e voce di navigazione.
- `src/i18n/messages.ts` — testi IT/EN.
- `src/__tests__/App.spec.ts` — verifica card e route.
- Nuovi file in `src/tools/pdf-to-docx/` — vista, validazione, conversione/batch, lista file e test unitari.
- `e2e/` — test conversione PDF testuali/scansionati e download ZIP locale.

## Riutilizzo

- `src/tools/docx-to-pdf/convert-batch.ts` — flusso batch, stati per file, rinomina sicura e creazione ZIP.
- `src/tools/docx-to-pdf/DocxToPdfView.vue` e `DocxFileList.vue` — interazione dropzone, selezione, status e download.
- `src/tools/pdf-merge/merge-pdfs.ts` — `pdf-lib` già usato per leggere PDF e validare input.
- `reamkit` (`package.json`, `node_modules/reamkit/README.md`) — parsing PDF e output DOCX, senza aggiungere un convertitore.
- `src/router/index.ts`, `src/views/HomeView.vue`, `src/components/AppSidebar.vue`, `src/i18n/messages.ts` — integrazione UI e testi localizzati.
- Nota tecnica: README locale di Ream descrive conservazione di disegni e immagini raster da PDF e ricostruzione dei layout; non menziona OCR per pagine scansionate.

## Passi

- [x] Esaminare conversione e componenti esistenti: ReamKit è già installato e dichiara supporto PDF→DOCX nel browser.
- [x] Definire requisito delle scansioni: preservazione visiva locale, senza OCR; il testo delle pagine immagine non sarà modificabile/ricercabile.
- [x] Validare la conversione ReamKit di PDF immagine e misti, verificando che le scansioni siano mantenute visivamente nel DOCX.
- [x] Implementare tool batch PDF→DOCX con nomi modificabili e archivio ZIP, gestendo protezione/password e file corrotti.
- [x] Integrare route, card/sidebar e traduzioni; aggiungere test unitari/E2E, inclusi PDF testuale e scansione.

## Verifica

- Verificare PDF testuale con layout articolato, PDF immagine/scansione, documento misto, PDF non valido e PDF protetto da password.
- Ispezionare il DOCX generato e il report delle perdite; controllare preservazione visuale, nomi, ZIP ed errori parziali. Per le scansioni, verificare che la pagina resti visibile come immagine; non richiedere OCR o testo selezionabile.
- E2E: batch e download ZIP; confermare che la conversione non invii file o richieste a domini esterni.
- Eseguire build, type-check e test esistenti.

## Decisioni

- Decisione aggiornata dall’utente: **non usare OCR**. Le pagine scannerizzate senza livello testuale restano immagini: non verrà generato testo ricercabile o modificabile da esse. Eventuali livelli testuali già presenti nei PDF possono essere convertiti normalmente.
- Tutta la conversione avviene localmente nel browser. Non inviare i PDF all’esterno; non usare servizi OCR/remoti o scaricare modelli OCR.
- Priorità: preservare layout e scansioni, mantenendo il flusso batch e ZIP dello strumento DOCX→PDF.
