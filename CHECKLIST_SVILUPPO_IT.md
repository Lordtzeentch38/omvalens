# OmvaLens — stato delle implementazioni

Ultimo aggiornamento: 11 ottobre 2026.

Questa è la checklist condivisa per decidere il prossimo lavoro e registrare ciò
che è stato completato. Le caselle Markdown sono modificabili: `[ ]` significa
da completare, `[x]` significa completato e verificato. Non spuntare una voce
solo perché esiste il codice. Registrare data, verifica e limiti nella voce o nel
documento di validazione collegato. Una voce con sottoattività è conclusa solo
quando tutti i suoi criteri sono soddisfatti. Le attività facoltative non bloccano
la prima versione Windows utilizzabile senza servizi online.

Le prove manuali passo per passo sono in [CHECKLIST_TEST_IT.md](CHECKLIST_TEST_IT.md);
le evidenze già raccolte e i limiti sono in [VALIDAZIONE_IT.md](VALIDAZIONE_IT.md).
Questa checklist registra avanzamento e criteri, non sostituisce quelle prove.

## Base già completata

- [x] **Identità OmvaLens e crediti originali.** Nome e logo nell'applicazione,
  repository rinominati, crediti Recordly e licenza AGPLv3 conservati.
  Verifica: test dell'avvio, del logo e della finestra dei crediti; 10/10/2026.
- [x] **Repository e destinazioni.** Forgejo primario, GitHub solo su richiesta
  esplicita per ogni caricamento. Indirizzi in [HOSTING.md](HOSTING.md).
  Verifica: entrambi i repository al commit `708dbb3e`; 10/10/2026.
- [x] **Progetti portabili.** Esportazione/importazione con media incorporati,
  controlli sull'archivio e copia indipendente dei file importati.
  Verifica: test automatici e prova nell'app impacchettata; 10/10/2026.
- [x] **Controlli prima dell'esportazione e recupero backup.** File necessari
  verificati prima dell'esportazione; recupero su una nuova copia del progetto.
  Verifica: test automatici; vedere VALIDAZIONE_IT.md; 10/10/2026.
- [x] **Cattura delle finestre Windows.** Correzione della cattura della finestra
  scelta, anche se coperta, e gestione del ridimensionamento.
  Verifica: registrazione di una finestra sintetica e conversione video; 10/10/2026.

## Completamento della versione Windows

- [ ] **Localizzazione completa e revisione delle lingue.** Le fasi concluse e
  quelle ancora da fare sono distinte di seguito; la presenza di tutte le chiavi
  nei cataloghi non significa che tutte le lingue siano tradotte.
  - [x] Inventario iniziale dei testi: disponibile `node scripts/i18n-audit.mjs`.
    Il rapporto segnala candidati da esaminare, inclusi nomi propri, definizioni
    tradotte al momento dell'uso e messaggi tecnici; non è un elenco di soli bug.
  - [x] **Prima fase italiana: migrazione dei testi inventariati.** 567 nuove frasi
    catalogate e tradotte: guida iniziale, accesso, dashboard, crediti, strumenti
    dell'editor, impostazioni, notifiche e finestre native. Corretti anche testi
    inglesi nei cataloghi italiani esistenti. Nomi e file dell'utente preservati.
  - [x] Cambio lingua, persistenza al riavvio, sincronizzazione tra finestre,
    variabili di interpolazione e coerenza dei cataloghi verificati.
    Prove: 11 test dell'interfaccia riusciti, 1.495 test unitari riusciti
    (7 esclusi), controllo tipi e cataloghi riusciti; 11/10/2026.
  - [x] Controllo visivo italiano di accesso/guida, crediti e impostazioni.
    Immagini di prova locali in `.tmp/localization-ui/`; 11/10/2026.
  - [x] App Windows confezionata: editor italiano, menu nativi nella lingua
    scelta e trasferimento portabile riusciti, nessun errore del renderer.
    Installer locale ricreato e checksum aggiornati; 11/10/2026.
  - [ ] Revisione dei candidati residui: messaggi dinamici e diagnostica di errore,
    nomi dei preset, contenuti delle illustrazioni ed eventuali testi non rilevati
    dall'inventario. Separare messaggi destinati all'utente da diagnostica tecnica.
  - [ ] Completare le nuove frasi nelle altre otto lingue selezionabili oltre
    inglese e italiano e verificarle visivamente. Sono state riutilizzate le
    traduzioni già esistenti; le nuove frasi senza traduzione usano l'inglese.
  - [ ] Revisione linguistica dei cataloghi, preferibilmente con madrelingua.
  Criterio finale: tutti i testi funzionali seguono la lingua scelta nelle dieci
  lingue selezionabili. Nomi propri, identificatori dei formati e diagnostica
  tecnica possono restare invariati. Vedi [TRADUZIONI_IT.md](TRADUZIONI_IT.md).
- [ ] **Microfono, audio di sistema e webcam su dispositivi reali.** Provare le
  combinazioni, sincronizzazione, permessi, cambio/disconnessione del dispositivo
  e riapertura. Conclusa dopo prove documentate con dispositivi e risultati.
- [ ] **Montaggio ed esportazione completa MP4/GIF.** Un progetto con tagli, zoom,
  cursore, testi, sfondo, webcam e audio deve produrre un file riproducibile con
  durata, immagini e sincronizzazione corrette. Provare anche annullamento e
  ripetizione dell'esportazione. Non basta la conversione della clip sintetica.
- [ ] **Stabilità nelle sessioni lunghe.** Registrare e montare per 30–60 minuti;
  controllare memoria, spazio, recupero dopo errore e cicli successivi. Documentare
  dimensioni, durata e consumo osservato senza crash o perdita di progetto.
- [ ] **Installazione su Windows pulito.** Installazione, primo avvio, registrazione,
  esportazione, aggiornamento e disinstallazione su un altro PC o VM; conservazione
  dei progetti verificata. Le azioni di disinstallazione richiedono autorizzazione.
- [ ] **Whisper: trascrizione reale.** Scaricare un modello, trascrivere una clip
  italiana, verificare intervalli temporali, sottotitoli/esportazione, annullamento
  e messaggi quando il modello manca. Il solo avvio dell'eseguibile non conclude
  questa voce.
- [ ] **Distribuzione su Forgejo.** Pubblicare installer, checksum e sorgenti della
  versione verificata; documentare installazione e problemi noti. GitHub richiede
  una richiesta esplicita per quella pubblicazione.
- [ ] **Aggiornamenti dell'app.** Configurare e verificare un feed del nostro
  progetto, controllo aggiornamenti, assenza di aggiornamenti e gestione errori.
  Gli aggiornamenti originali Recordly sono disabilitati.
- [ ] **Controlli automatici su Forgejo.** Configurare un runner e una pipeline che
  esegua controllo tipi, traduzioni e test rilevanti; registrare un'esecuzione
  riuscita. Il workflow GitHub esistente non prova questa voce.

## Accelerazione GPU — in attesa del comando esplicito

- [ ] **Verifica e implementazione dell'accelerazione hardware.** Valutare
  separatamente anteprima/composizione grafica, Whisper, codifica ed esportazione;
  rilevare GPU disponibili, offrire fallback CPU, confrontare qualità e tempi.
  Attualmente non è garantita per tutte le operazioni. Il promemoria dell'utente
  non autorizza l'avvio di questa attività.

## Migliorie facoltative dopo la prima versione

- [ ] **Servizi online e condivisione.** Configurare servizi nostri, autenticazione,
  pubblicazione/accesso/revoca dei link, limiti e gestione dei dati. L'uso locale
  deve continuare a funzionare senza account.
- [ ] **Cronologia delle versioni dei progetti.** Salvare e ripristinare revisioni
  verificando integrità e media; il recupero di `.bak` non equivale a cronologia.
- [ ] **Capitoli e modifica della trascrizione.** Modificare testo e tempi,
  navigare per capitoli e verificare esportazione/coerenza con il montaggio.
- [ ] **Firma dell'installer.** Firma e verifica della catena sui PC destinatari;
  richiede certificato e decisione sul costo.
- [ ] **macOS e Linux.** Build, permessi, cattura, dispositivi, montaggio,
  esportazione e distribuzione provati sui rispettivi sistemi.

## Registro delle attività

| Data | Attività | Stato | Verifiche e limiti |
| --- | --- | --- | --- |
| 11/10/2026 | Checklist condivisa | Creata | Base verificata distinta dalle prove ancora mancanti. |
| 11/10/2026 | Prima fase italiana | Completata | 567 frasi, controlli tipi/cataloghi, 1.495 test unitari, 11 prove dell'interfaccia e app Windows confezionata riusciti; revisione residui e altre lingue ancora aperte. |
