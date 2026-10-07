# Piano: toolbox web bilingue e unione PDF

## Contesto
Trasformare lo starter Vue in un'app solo frontend con strumenti utili, interfaccia in italiano e inglese e selettore lingua. Primo strumento: unire file PDF. Stile minimale in bianco e nero con Tailwind CSS.

## Approccio
- Creare una home/toolbox estendibile e una pagina per il merge PDF; solo il merge sarà operativo nel primo rilascio.
- Mantenere ogni strumento isolato in una propria cartella sotto `src/tools/<tool-slug>/`; shell, componenti condivisi e localizzazione restano separati dai singoli tool.
- Usare una preferenza lingua IT/EN centralizzata e persistita in `localStorage`; all'avvio usare italiano se non esiste una scelta salvata e aggiornare anche `document.documentElement.lang`.
- Usare un dizionario di stringhe tipizzato, senza aggiungere una libreria i18n per questa piccola UI.
- Elaborare i PDF interamente nel browser con `pdf-lib`; non inviare file a server o servizi esterni. Richiedere almeno due PDF, supportare file picker e drag-and-drop, riordino, rimozione e download.
- Integrare Tailwind CSS v4 tramite plugin Vite; UI minimale bianco/nero, responsive e accessibile.
- Usare `createWebHashHistory` per le pagine Vue Router, così i link profondi funzionano su GitHub Pages statico senza fallback server.

## File da modificare
- `package.json`, `bun.lock` — aggiungere Tailwind CSS v4, `@tailwindcss/vite` e `pdf-lib`.
- `vite.config.ts`, `src/main.ts`, nuovo `src/style.css` — plugin Tailwind e CSS globale.
- `index.html` — titolo e lingua iniziale significativi.
- `src/App.vue`, `src/router/index.ts` — shell, navigazione e rotte compatibili con GitHub Pages.
- `src/stores/preferences.ts`, `src/i18n/messages.ts` — lingua persistente e dizionario IT/EN.
- `src/views/HomeView.vue`, `src/components/AppHeader.vue`, `src/components/ToolCard.vue` — shell, home e componenti condivisi.
- `src/tools/pdf-merge/PdfMergeView.vue`, `src/tools/pdf-merge/PdfFileList.vue`, `src/tools/pdf-merge/merge-pdfs.ts` — UI e logica del tool in una cartella dedicata, senza accoppiarla agli altri tool.
- `src/stores/counter.ts` — rimuovere lo store starter non più usato.
- `src/__tests__/App.spec.ts`, `src/tools/pdf-merge/merge-pdfs.spec.ts`, `e2e/vue.spec.ts` — sostituire gli assert starter e coprire flussi reali.

## Riutilizzo e stato attuale
- App Vue 3 + TypeScript, Vite, Vue Router, Pinia, Vitest e Playwright già presenti; `src/main.ts` installa Pinia e router.
- `src/router/index.ts` al momento ha `routes: []` e `createWebHistory(import.meta.env.BASE_URL)`; `vite.config.ts` imposta `base: '/tools/'`. Per GitHub Pages si propone hash history.
- `src/App.vue` e `src/__tests__/App.spec.ts` sono ancora starter; `e2e/vue.spec.ts` si aspetta ancora il titolo `You did it!`.
- `index.html` ha `lang` vuoto e titolo `Vite App`; non c'è CSS globale importato da `src/main.ts`.
- Ricerca nel progetto: nessuna implementazione o dipendenza esistente per Tailwind, PDF o i18n. Pinia è già disponibile e si può riusare per la preferenza lingua.

## Passi
- [x] Aggiungere Tailwind CSS v4 con `@tailwindcss/vite` e `pdf-lib` con Bun, aggiornando lockfile.
- [x] Creare CSS globale, shell e navigazione home/tool; configurare rotte hash compatibili con GitHub Pages.
- [x] Implementare dizionario IT/EN, selettore lingua persistente e attributo `lang` aggiornato.
- [x] Implementare il merge client-side: drag-and-drop/file picker, elenco ordinabile (drag e controlli accessibili su/giù), rimozione, validazione di almeno due PDF, messaggi localizzati e download.
- [ ] Sostituire test starter con test unitari di locale/merge e test E2E del cambio lingua e flusso PDF.
- [ ] Eseguire build, type-check e suite unit/E2E; verificare anteprima production al percorso `/tools/`.

## Verifica
- Build e type-check, compatibili con il workflow esistente `.github/workflows/deploy.yml` (`bun install --frozen-lockfile`, `bun run build`, deploy di `dist` su push a `main`).
- Test unitari per preferenza lingua e merge PDF (ordine delle pagine, rifiuto di meno di due file, input corrotto/protetto, output valido e nome personalizzato/default).
- Test E2E per cambio lingua, selezione/riordino/rimozione, validazione minima e download.
- Verifica manuale responsive, accessibilità da tastiera, assenza di upload di rete e asset/rotte funzionanti sotto `/tools/` su GitHub Pages.

## Decisioni confermate
- Lingua iniziale: italiano; l'utente può scegliere inglese e la preferenza va salvata nel browser.
- I PDF sono elaborati esclusivamente nel browser per privacy; nessun upload.
- Supportare riordino e rimozione dei file e drag-and-drop.
- Prima versione: toolbox estendibile, con il tool PDF come unico strumento funzionante.
- Richiedere almeno due PDF prima di abilitare l'unione.

## Decisioni confermate
- PDF corrotti o protetti/password: mostrare errore localizzato e non generare output; nessun limite artificiale di dimensione iniziale, ma gestire errori di memoria in modo chiaro.
- Nome del PDF scaricato modificabile dall'utente, con `merged.pdf` come valore predefinito.
- Nome mostrato agli utenti: `tools`.
- Durante il merge mostrare uno stato di caricamento/processing e impedire doppi avvii; mantenere tutti i controlli utilizzabili da tastiera oltre al drag-and-drop.
