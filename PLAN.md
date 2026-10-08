# Piano: conversione DOCX in PDF

## Contesto
Aggiungere alla toolbox un nuovo strumento per convertire più documenti Word in PDF. Confermato dall'utente: accettare solo `.docx`; conversione nel browser; più file per volta; nome PDF predefinito derivato dal documento e modificabile; consegna di tutti i PDF in un unico ZIP; evitare richieste esterne durante la conversione.

## Approccio
- Aggiungere un tool isolato in `src/tools/docx-to-pdf/`, route dedicata e card nella home.
- Usare `reamkit` come candidata per la conversione locale: JavaScript/TypeScript puro, output PDF e API dichiarata che non esegue I/O quando i font sono forniti. Passare esplicitamente i font sostitutivi locali, non attivare provider remoti, non inviare mai i DOCX a un server e verificare il traffico di rete in E2E. Font e codice richiesti dal tool devono essere inclusi negli asset statici serviti dall'app; selezionare font open-license adatti ai documenti supportati.
- Generare un PDF per ogni DOCX, nome output individualmente modificabile e inizializzato con il basename sorgente; impacchettare tutti i PDF riusciti in un solo ZIP. Rendere chiari eventuali errori per singolo file e gestire nomi duplicati nello ZIP aggiungendo suffissi.
- Riutilizzare i pattern UI del tool di merge PDF per selezione multipla, drag-and-drop, elenco file, stato di elaborazione, messaggi localizzati e download Blob.
- La resa non può essere garantita pixel-identica a Microsoft Word: testare documenti rappresentativi e segnalare in UI eventuali limiti noti.

## File da modificare
- `src/router/index.ts` — route lazy `/docx-to-pdf`.
- `src/views/HomeView.vue` — card del nuovo strumento.
- `src/i18n/messages.ts` — testi IT/EN per selezione, nomi, conversione, ZIP, progresso ed errori.
- `src/__tests__/App.spec.ts` — verifica card/link.
- Nuovi file in `src/tools/docx-to-pdf/` — vista, logica converter, gestione batch/nomi e test unitari.
- `e2e/` — test multi-file, archivio scaricato e assenza di richieste esterne durante la conversione.
- `package.json`, `bun.lock` — `reamkit`, dipendenza ZIP (es. `fflate` come dipendenza diretta se riusata, o una libreria ZIP dedicata) e font statici con licenza open.

## Riutilizzo
- `src/tools/pdf-merge/PdfMergeView.vue` — pattern file picker/dropzone, lista, stato/errori e download Blob con URL temporanei.
- `src/tools/pdf-merge/PdfFileList.vue` — pattern lista accessibile e rimozione; adattare per nomi PDF editabili.
- `src/views/HomeView.vue` e `src/components/ToolCard.vue` — card esistente.
- `src/router/index.ts` — lazy loading e hash history.
- `src/i18n/messages.ts` — dizionario tipizzato italiano/inglese.
- `.github/workflows/deploy.yml` — deployment statico GitHub Pages; il tool non deve dipendere da backend o header configurabili sul server.

## Passi
- [x] Integrare il converter con font forniti localmente e provider remoti disabilitati; confermare che non partano richieste di rete durante la conversione.
- [x] Implementare accettazione/validazione `.docx`, selezione multipla, lista e modifica del nome di ciascun PDF.
- [x] Convertire i file in modo sequenziale o controllato per contenere la memoria; raccogliere output ed errori per file, creare un singolo ZIP e risolvere collisioni nei nomi.
- [x] Aggiungere route, card e localizzazione IT/EN.
- [x] Aggiungere test unitari e E2E; verificare sicurezza locale dei file e contenuto PDF/ZIP.
- [x] Eseguire build, type-check, test unitari ed E2E; controllare bundle/dimensione degli asset/font inclusi.

## Verifica
- DOCX validi con testo, tabelle e immagini; DOCX danneggiato e file non DOCX.
- Verificare ogni output PDF, nome basename predefinito/modificato, collisioni nel ZIP e comportamento se alcuni file falliscono.
- E2E: selezione multipla, conversione e singolo download ZIP; controllare che la conversione non contatti domini esterni e che nessun contenuto venga inviato fuori dal browser.
- Build, type-check e suite test esistenti; prova manuale su GitHub Pages/static preview.
