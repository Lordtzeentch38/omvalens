# OmvaLens — checklist di sviluppo e collaudo

Ultimo aggiornamento: 11 ottobre 2026.

Questa checklist distingue **codice da realizzare**, **controlli da eseguire** e
**distribuzione**. Le caselle si modificano con `[ ]` / `[x]`. Ogni voce ha un
identificativo stabile, utilizzabile per scegliere il prossimo lavoro.

Una casella di coding spuntata indica che la modifica è implementata e ha
superato i controlli tecnici pertinenti. Le prove aggiuntive restano nelle voci
V: una verifica aperta **non significa che la funzionalità sia assente**.
Una funzione è pronta per la distribuzione quando sono conclusi sia il coding
necessario sia i relativi controlli. Non spuntare automaticamente entrambe le
sezioni; registrare data, risultato e limiti nel registro finale.

Le procedure manuali sono in [CHECKLIST_TEST_IT.md](CHECKLIST_TEST_IT.md), le
prove dettagliate in [VALIDAZIONE_IT.md](VALIDAZIONE_IT.md). Le migliorie
facoltative non bloccano la prima versione Windows utilizzabile senza account.

## 1. Coding — implementazioni

### Implementato

- [x] **C01 — Identità OmvaLens e crediti.** Nome e logo propri; attribuzione
  Recordly, licenza AGPLv3 e identificatori compatibili conservati. Controllo V01.
- [x] **C02 — Progetti portabili.** Esportazione/importazione con media incorporati
  e controlli dell'archivio; i media importati sono copie indipendenti. Controllo V02.
- [x] **C03 — Controlli prima dell'esportazione e recupero backup.** Verifica dei
  file richiesti e recupero su una nuova copia del progetto. Controllo V03.
- [x] **C04 — Correzione cattura finestre Windows.** Cattura della finestra scelta,
  anche coperta, e gestione del ridimensionamento. Controllo V04.
- [x] **C05 — Prima fase italiana.** 567 nuove frasi nei cataloghi: guida iniziale,
  accesso, dashboard, crediti, editor, impostazioni, notifiche e finestre native.
  Corretti testi inglesi nei cataloghi italiani esistenti. Cambio lingua persistente,
  sincronizzazione tra finestre e menu nativi; dati dell'utente preservati.
  Controlli V05–V07. La localizzazione complessiva richiede ancora C07–C08 e V08.
- [x] **C06 — Strumenti di controllo delle traduzioni.** Inventario dei candidati
  (`scripts/i18n-audit.mjs`), controllo dei cataloghi, variabili di interpolazione
  e associazioni delle frasi. Controlli V05 e V08.

### Da implementare o completare

- [ ] **C07 — Traduzione dei testi residui destinati all'utente.** Dopo la
  classificazione V08, migrare i testi effettivamente mancanti: messaggi dinamici,
  errori, preset e illustrazioni. Diagnostica tecnica e nomi propri possono restare
  invariati. Criterio: chiudere l'elenco dei testi da correggere prodotto da V08.
- [ ] **C08 — Nuove frasi nelle altre otto lingue selezionabili.** Completare
  spagnolo, francese, tedesco, olandese, coreano, portoghese brasiliano e cinese
  semplificato/tradizionale. Le traduzioni esistenti sono state riutilizzate;
  le nuove frasi senza traduzione usano l'inglese. Criterio: rimuovere i ripieghi
  inglesi delle frasi funzionali; collaudo linguistico distinto in V08.
- [ ] **C09 — Aggiornamenti dell'app.** Configurare un feed del nostro progetto e
  integrare controllo, download, installazione ed errori. Gli aggiornamenti
  originali Recordly sono disabilitati. Controllo V14.
- [ ] **C10 — Pipeline Forgejo.** Configurare runner e pipeline per controllo tipi,
  cataloghi e test. Il workflow GitHub esistente non completa questa voce.
  Controllo V15.
- [ ] **C11 — Accelerazione GPU.** Implementare quanto necessario per anteprima,
  composizione, Whisper, codifica ed esportazione, con rilevamento GPU e ripiego
  CPU. Controllo V16. **In attesa del comando esplicito: non avviare questa voce
  né V16 sulla base del solo promemoria.**

### Coding facoltativo dopo la prima versione

- [ ] **C12 — Servizi online e condivisione.** Servizi nostri, autenticazione,
  pubblicazione/revoca dei link, limiti e gestione dei dati; uso locale senza account.
- [ ] **C13 — Cronologia dei progetti.** Salvare e ripristinare revisioni con i media;
  il recupero di `.bak` non equivale a cronologia.
- [ ] **C14 — Capitoli e modifica della trascrizione.** Aggiungere quanto manca per
  modificare testo e tempi e navigare per capitoli. Controlli di C12–C14 in V17.

## 2. Controlli — verifiche e collaudo

### Controlli già superati

- [x] **V01 — Identità e crediti (C01).** Avvio, logo e finestra crediti verificati;
  attribuzione Recordly e AGPLv3 conservate. Esito: riuscito, 10/10/2026.
- [x] **V02 — Trasferimento portabile (C02).** Test automatici ed esportazione/
  reimportazione nell'app confezionata, media indipendenti. Esito: riuscito,
  10/10/2026; ripetuto dopo C05 l'11/10/2026.
- [x] **V03 — Preflight e backup (C03).** Test automatici dei file richiesti e del
  recupero senza sovrascrivere l'originale. Esito: riuscito, 10/10/2026.
- [x] **V04 — Cattura finestra sintetica (C04).** Finestra coperta e ridimensionata,
  pausa/ripresa e conversione video. Esito: riuscito, 10/10/2026. La prova non
  sostituisce il collaudo con dispositivi reali V09.
- [x] **V05 — Controlli tecnici dopo la traduzione (C05–C06).** Tipi e cataloghi
  coerenti; 1.495 test unitari riusciti, 7 esclusi; lint senza errori e con un
  avviso preesistente. Esito: riuscito, 11/10/2026.
- [x] **V06 — Interfaccia italiana (C05).** 11 scenari riusciti: cambio lingua,
  persistenza, sincronizzazione tra finestre, guida/accesso e crediti. Controllo
  visivo di accesso/guida, crediti e impostazioni; esito riuscito, 11/10/2026.
  Immagini locali in `.tmp/localization-ui/`.
- [x] **V07 — App Windows confezionata dopo C05.** Avvio ed editor italiano, menu
  nativi e trasferimento portabile; nessun errore del renderer. Binari inclusi
  verificati. Esito: riuscito, 11/10/2026; prove in `.tmp/packaged-brand-smoke/`.

### Controlli ancora da eseguire

- [ ] **V08 — Copertura e qualità delle traduzioni (C05–C08).** Classificare i
  candidati residui dell'inventario, assegnando a C07 solo i testi da correggere.
  Verificare visivamente le dieci lingue selezionabili e rivedere i cataloghi,
  preferibilmente con madrelingua. Coerenza tecnica non equivale a traduzione
  completa. Il catalogo russo nei sorgenti non è selezionabile.
- [ ] **V09 — Microfono, audio di sistema e webcam reali.** Provare combinazioni,
  sincronizzazione, permessi, cambio/disconnessione e riapertura dei dispositivi.
  Criterio: documentare dispositivi, scenari ed esiti.
- [ ] **V10 — Montaggio ed esportazione MP4/GIF completa.** Progetto con tagli, zoom,
  cursore, testi, sfondo, webcam e audio; controllare durata, immagini e sincronia,
  annullamento e ripetizione. La conversione della clip sintetica non basta.
- [ ] **V11 — Stabilità nelle sessioni lunghe.** Registrare e montare per 30–60
  minuti; documentare memoria, spazio, recupero dopo errore e cicli successivi.
  Criterio: nessun crash o perdita del progetto nelle prove documentate.
- [ ] **V12 — Windows pulito.** Su altro PC o VM: installazione, primo avvio,
  registrazione, esportazione, aggiornamento e disinstallazione; conservazione
  dei progetti. La disinstallazione richiede autorizzazione.
- [ ] **V13 — Whisper con audio reale.** Scaricare un modello, trascrivere una clip
  italiana e verificare tempi, sottotitoli/esportazione, annullamento e modello
  mancante. Il runtime parte; la trascrizione reale non è ancora verificata.
- [ ] **V14 — Aggiornamenti (C09).** Provare aggiornamento disponibile/assente,
  download, installazione e gestione degli errori con il nostro feed.
- [ ] **V15 — Pipeline (C10).** Registrare un'esecuzione riuscita su Forgejo.
- [ ] **V16 — GPU (C11).** Misurare supporto, qualità e tempi per ogni operazione,
  confrontare CPU/GPU e verificare i ripieghi. Non è attualmente garantita per
  tutte le operazioni. **In attesa del comando esplicito.**
- [ ] **V17 — Migliorie facoltative (C12–C14).** Dopo il coding: verificare accesso,
  link/revoca e funzionamento senza account; integrità del ripristino; testo,
  tempi, capitoli ed esportazione. Suddividere in prove specifiche quando avviate.
- [ ] **V18 — macOS e Linux.** Build, permessi, cattura, dispositivi, montaggio ed
  esportazione sui rispettivi sistemi. Eventuali adattamenti da sviluppare
  saranno aggiunti al coding dopo aver identificato le incompatibilità.
- [ ] **V19 — Firma dell'installer (D04, facoltativa).** Verificare firma,
  editore e catena del certificato sui PC destinatari.

Le anomalie emerse in V09–V18 diventano nuove voci di coding, con riferimento alla
prova fallita. Non considerare una funzionalità mancante prima del collaudo.

## 3. Distribuzione e repository

- [x] **D01 — Hosting e nome dei repository.** Forgejo primario; repository
  `omvalens`. GitHub secondario, caricamenti solo su richiesta esplicita per ogni
  operazione. Indirizzi e compatibilità in [HOSTING.md](HOSTING.md).
- [x] **D02 — Installer locale della prima fase italiana.** Installer Windows
  ricreato e checksum aggiornati; controlli V07 superati, 11/10/2026.
- [ ] **D03 — Release pubblica su Forgejo.** Pubblicare installer, checksum,
  sorgenti, istruzioni e problemi noti della versione collaudata. Un push dei
  sorgenti non completa la release. GitHub richiede richiesta esplicita separata.
- [ ] **D04 — Firma dell'installer (facoltativa).** Ottenere un certificato e
  configurare la firma dei pacchetti. Richiede decisione sul costo; controllo V19.
- [ ] **D05 — Distribuzione macOS/Linux (facoltativa).** Preparare e pubblicare i
  pacchetti dopo V18 e dopo gli eventuali adattamenti necessari.

## 4. Registro delle attività

| Data | Voci | Risultato | Evidenza / limite |
| --- | --- | --- | --- |
| 10/10/2026 | C01–C04, V01–V04, D01 | Completate | Identità, progetti portabili, preflight/backup e cattura sintetica; dettagli in VALIDAZIONE_IT.md. |
| 11/10/2026 | C05–C06, V05–V07, D02 | Completate | 567 frasi, 1.495 test unitari, 11 prove UI e app Windows riusciti. Residui e altre lingue restano C07–C08 / V08. |
| 11/10/2026 | Checklist | Riorganizzata | Coding, controlli e distribuzione separati; esiti precedenti conservati. |

Ulteriori dettagli sulle traduzioni: [TRADUZIONI_IT.md](TRADUZIONI_IT.md).
