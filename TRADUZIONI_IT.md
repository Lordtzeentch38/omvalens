# OmvaLens — traduzioni e avanzamento

Aggiornamento: 12 ottobre 2026. La lingua si sceglie nelle impostazioni dell'app.
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

## Testi residui italiani completati — C07

243 nuove frasi catalogate, oltre alle traduzioni corrette o riutilizzate:
errori di progetti, registrazione, Whisper ed esportazione; messaggi dinamici
con percorsi e conteggi; preset GIF e cursori; etichette accessibili e scritte
nei due segnaposto SVG degli annunci. Gli annunci segnaposto restano disabilitati
come prima. Le immagini esterne e i contenuti degli annunci non sono riscritti.

La traduzione avviene al punto di visualizzazione, riconoscendo solo i modelli
espliciti in `src/i18n/messageTemplates.json`. I dati inseriti nelle variabili
restano identici, anche con parentesi graffe o righe multiple; i report conservano
gli errori originali. Diagnostica sconosciuta di driver/codec e log tecnici restano
nella lingua originaria.

Inventario statico ampliato: 514 punti, 339 catalogati e 175 esclusioni motivate,
nessun candidato in attesa. Le 163 schede di esclusione in
`src/i18n/auditReview.json` hanno identificativo stabile, motivazione e data.
Una scheda può coprire più occorrenze identiche nello stesso file. L'inventario
non certifica ogni possibile messaggio di sistema né la qualità delle altre lingue.

## Altre otto lingue completate — C08

L'app offre dieci lingue: inglese, italiano, spagnolo, francese, tedesco,
olandese, coreano, portoghese brasiliano, cinese semplificato e tradizionale.
Il catalogo russo presente nei sorgenti non è una lingua selezionabile.

Completati i cataloghi delle otto lingue oltre a inglese e italiano: 6.926 valori
aggiornati, riutilizzando le traduzioni disponibili. Ciascuna lingua selezionabile
contiene le stesse 1.463 chiavi nei sette cataloghi. Non rimangono frasi inglesi
senza una motivazione esplicita: nomi propri, formati, tasti e termini condivisi
sono conservati in `src/i18n/translationExceptions.json`, con lingua e data.
Le variabili, i nomi OmvaLens/Recordly e i dati dell'utente restano integri.
Il portoghese usa terminologia brasiliana; i due cataloghi cinesi sono distinti.

Il controllo visivo ha evidenziato anche richiami a chiavi assenti, nascosti dai
testi di ripiego: recuperate 58 chiavi nei cataloghi, comprese formato/dimensione,
qualità/codifica, sottotitoli, caricamento e annotazioni. Le frasi già tradotte
sono state riutilizzate. `scripts/i18n-references.mjs` verifica 378 richiami
letterali a `useScopedT`; i nomi di chiave costruiti dinamicamente richiedono
ancora prove specifiche. Aggiunte anche le tre opzioni di codifica dinamiche.

Le bozze mancanti sono state assistite localmente dal modello
[MADLAD-400 3B MT](https://huggingface.co/google/madlad400-3b-mt), revisione
`fa184c675da0b5c9e1c8694fccd4e12e2d422094` (licenza Apache 2.0).
Terminologia, comandi, errori, crediti, licenza e privacy sono stati corretti
durante la revisione. Il modello e gli strumenti temporanei non sono inclusi
nell'app né aggiunti alle sue dipendenze. Le traduzioni esistenti sono conservate
quando già localizzate, salvo correzioni contestuali.

La copertura tecnica non certifica la qualità linguistica di ogni frase.
La revisione completa dei cataloghi e dei percorsi meno comuni, preferibilmente
con madrelingua, resta distinta in V08. I messaggi sconosciuti di sistema/driver
continuano a mostrare la diagnostica originale. Lo stato da spuntare è in
[CHECKLIST_SVILUPPO_IT.md](CHECKLIST_SVILUPPO_IT.md).

## Manutenzione

Le traduzioni sono in `src/i18n/locales/<lingua>/`, divise in cataloghi JSON.
I testi migrati usano `common.ui` con chiavi elencate in
`src/i18n/uiTextKeys.json`. I componenti usano `useUiText`, i menu nativi
`nativeText`, le notifiche esterne ai componenti `currentUiText`.
Per errori/messaggi applicativi dinamici usare `currentAppMessage` o
`translateAppMessage`; aggiungere un modello esplicito solo per testi dell'app,
mai per tradurre contenuti dell'utente. I segnaposto SVG inclusi usano
`announcementImageSource`, che traduce ed esegue l'escaping del testo.
Per una nuova frase aggiungere l'associazione e la voce nei cataloghi, con
variabili `{{nome}}` identiche e dati dell'utente passati come valori separati.
I nuovi sviluppi possono usare anche le normali chiavi dei cataloghi esistenti.

- `npm run i18n:check`: chiavi, valori non vuoti, variabili, associazioni e copertura.
  Comprende il controllo dei richiami letterali ai cataloghi nel codice.
- `npm run i18n:coverage`: rileva frasi inglesi senza motivazione nelle lingue
  selezionabili. Non aggiungere eccezioni per aggirare una traduzione mancante.
- `node scripts/i18n-audit.mjs`: inventario dei candidati; `--json` per esportarlo,
  `--summary --check-reviewed` per rilevare nuovi testi non classificati.
- `npm run typecheck` e `npm test`: verifica delle modifiche.
- `npm exec -- playwright test tests/ui/i18n.spec.ts`: cambio lingua e percorsi italiani.
- `npm exec -- playwright test tests/ui/i18n-multilingual.spec.ts`: dashboard,
  crediti, preset GIF, errori dinamici e persistenza nelle dieci lingue.

Le prove datate sono riportate in [VALIDAZIONE_IT.md](VALIDAZIONE_IT.md).
