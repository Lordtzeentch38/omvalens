# OmvaLens — traduzioni e avanzamento

Aggiornamento: 11 ottobre 2026. La lingua si sceglie nelle impostazioni dell'app.
Il progetto aveva già cataloghi multilingua, ma numerosi testi erano ancora
scritti direttamente nei componenti o usavano un ripiego inglese.

## Prima fase italiana completata

Sono state aggiunte 567 frasi ai cataloghi: guida iniziale e accesso, dashboard,
cartelle, crediti, impostazioni, comandi dell'editor, notifiche, etichette accessibili,
menu e finestre native. Corretti anche testi inglesi nei cataloghi italiani
esistenti. Il cambio lingua si conserva al riavvio, si propaga tra finestre e
aggiorna i menu del processo nativo. Le date delle schede seguono la lingua scelta.

Nomi di progetti e file, percorsi e testi inseriti dall'utente non vengono
tradotti. Le chiavi storiche del profilo e i formati dei progetti rimangono
compatibili. I riferimenti a Recordly rimangono nei crediti e nelle licenze.

## Lavoro ancora aperto

L'app offre dieci lingue: inglese, italiano, spagnolo, francese, tedesco,
olandese, coreano, portoghese brasiliano, cinese semplificato e tradizionale.
Il catalogo russo presente nei sorgenti non è una lingua selezionabile.

Per le nuove frasi nelle altre lingue sono state riutilizzate traduzioni già
disponibili; dove mancavano viene mostrato il testo inglese. La verifica tecnica
dei cataloghi non certifica la qualità o la completezza di quelle traduzioni.
Restano la revisione linguistica e l'esame dei testi residui: errori dinamici,
diagnostica, nomi dei preset e scritte nelle illustrazioni. Lo stato da spuntare
è in [CHECKLIST_SVILUPPO_IT.md](CHECKLIST_SVILUPPO_IT.md).

## Manutenzione

Le traduzioni sono in `src/i18n/locales/<lingua>/`, divise in cataloghi JSON.
I testi migrati usano `common.ui` con chiavi elencate in
`src/i18n/uiTextKeys.json`. I componenti usano `useUiText`, i menu nativi
`nativeText`, le notifiche esterne ai componenti `currentUiText`.
Per una nuova frase aggiungere l'associazione e la voce nei cataloghi, con
variabili `{{nome}}` identiche e dati dell'utente passati come valori separati.
I nuovi sviluppi possono usare anche le normali chiavi dei cataloghi esistenti.

- `npm run i18n:check`: chiavi, valori non vuoti, variabili e associazioni.
- `node scripts/i18n-audit.mjs`: inventario dei candidati; `--json` per esportarlo.
- `npm run typecheck` e `npm test`: verifica delle modifiche.
- `npm exec -- playwright test tests/ui/i18n.spec.ts`: cambio lingua e percorsi italiani.

Le prove dell'11 ottobre sono riportate in [VALIDAZIONE_IT.md](VALIDAZIONE_IT.md).
