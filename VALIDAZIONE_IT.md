# Verifiche della versione di sviluppo

## C11 — accelerazione hardware, 12 ottobre 2026

- Suite: 1.503 test riusciti, 7 esclusi; successivamente 4 nuovi test del
  riepilogo hardware e della dimensione del probe riusciti. Tipi e cataloghi coerenti; lint senza errori,
  un avviso preesistente in ProjectThumbnail.
- Interfaccia: quattro scenari lingua e una prova hardware riusciti. Preferenza
  CPU persistente e avviso di riapertura verificati tramite tastiera.
- App Windows: avvio/editor, menu italiani e trasferimento portabile riusciti.
  Anteprima reale ANGLE/D3D11 su RTX 3060 in automatico; Microsoft Basic Render
  Driver in CPU, senza errori del renderer. CPU seleziona libx264 e Whisper CPU.
  Rilevamento effettuato dopo le informazioni GPU, con supporto WebGL distinto
  dalla composizione delle finestre. Al primo avvio Chromium può ancora segnalare
  software prima del canvas; ripetendo il controllo nell'editor segnala GPU.
  Trascrizione del campione inglese riuscita anche tramite IPC dell'app, in
  automatico e CPU. Probe encoder portato a 256×256: 64×64 viene rifiutato da
  NVENC su questo PC per dimensioni inferiori al minimo, non per GPU assente.
  Dopo la correzione, il pacchetto seleziona realmente `h264_nvenc` in automatico.
- Pacchetto: binari inclusi verificati, CUDA e licenze originali incluse.
- Benchmark: NVENC/libx264 producono 150 fotogrammi 720p/5 s; Whisper CUDA/CPU
  trascrive il campione JFK inglese con testo uguale. Il log conferma CUDA0.
  Tempi e limiti in [ACCELERAZIONE_HARDWARE_IT.md](ACCELERAZIONE_HARDWARE_IT.md).
- Artefatti locali: `.tmp/gpu-validation/benchmark.json`, log/SRT e
  `.tmp/gpu-validation/packaged/` con report e immagini; profili isolati.
  Queste prove non completano V16, V10, V11, V13 o V18.

## Checklist e prima fase italiana — 11 ottobre 2026

- Checklist condivisa con caselle, criteri di completamento e registro:
  [CHECKLIST_SVILUPPO_IT.md](CHECKLIST_SVILUPPO_IT.md). Obbligo di aggiornarla
  dopo ogni attività inserito nelle istruzioni del progetto.
- 567 frasi aggiuntive nei cataloghi e in italiano; corretti testi inglesi
  nei cataloghi italiani preesistenti. Menu nativi e notifiche seguono la lingua.
- Controllo tipi e cataloghi superati. Lint: zero errori, un avviso preesistente
  relativo alla dipendenza `revision` di ProjectThumbnail.
- Suite completa: 1.495 test riusciti, 7 esclusi; 171 file di test riusciti e uno
  escluso. Inclusi test nuovi per ripiego della lingua, variabili, preservazione
  dei percorsi e lettura della preferenza nel processo nativo.
- Interfaccia: 11 scenari riusciti, comprendenti italiano, cambio a inglese,
  persistenza dopo riavvio, propagazione tra finestre, onboarding/accesso e crediti.
- Controllo visivo di guida/accesso, crediti e impostazioni. Immagini locali
  conservate in `.tmp/localization-ui/`.
- Renderer, processo principale e preload compilati; verifica CJS riuscita.
  Installer locale `release/OmvaLens-windows-x64.exe` ricreato; checksum aggiornati.
- Verifica dei binari inclusi riuscita. App Windows avviata con profilo isolato:
  editor in italiano, menu `File / Modifica / Visualizza / Finestra / Aiuto`,
  esportazione/reimportazione portabile con media indipendenti, zero errori del
  renderer. Risultato e immagini in `.tmp/packaged-brand-smoke/`; editor
  ispezionato visivamente. Il filmato sintetico e il nome di un progetto già
  salvato contengono testo inglese: sono contenuti dell'utente e restano invariati.
- Le altre lingue riutilizzano traduzioni disponibili o il ripiego inglese per
  nuove frasi. Revisione linguistica e candidati residui restano aperti, come
  descritto in [TRADUZIONI_IT.md](TRADUZIONI_IT.md). Nessuna certificazione di
  localizzazione completa per tutte le lingue.
- Le prove su dispositivi reali, installazione pulita e GPU rimangono separate;
  nessun intervento sull'accelerazione hardware è stato avviato.

## Cambio di identità: OmvaLens — 10 ottobre 2026

- Nome e logo originali in avvio, onboarding, libreria, finestre, icone,
  traduzioni, messaggi di errore e aggiornamento e confezionamento Windows.
- Informazioni e crediti: origine da Recordly, autori, licenza AGPLv3 e nostre
  aggiunte, con collegamenti al progetto originale e al nostro Forgejo.
- Dopo il cambio: 1.490 test superati, 7 esclusi; TypeScript superato;
  lint senza errori (un avviso preesistente); coerenza delle traduzioni superata.
- Sei scenari di onboarding/accesso superati, più uno scenario dedicato che
  verifica nome, caricamento dell'icona e apertura/chiusura dei crediti.
- Le immagini del logo e dei crediti sono state ispezionate visivamente.
- Installer `OmvaLens-windows-x64.exe` creato; avvio del programma confezionato
  superato con nome verificato, profilo isolato, nuova icona nell'onboarding,
  editor e trasferimento tramite progetto portabile. Nessun errore del renderer.
- I dati esistenti rimangono nella cartella ScreenRecorder; chiavi e formati dei
  progetti sono mantenuti per compatibilità. Vedi `BRANDING_IT.md`.

Ambiente: Windows x64, Node.js 22.14.0, Electron 43.7.9, Visual Studio Build Tools
2022 e CMake. Questa è una versione da collaudare, non una certificazione di
compatibilità con tutti i dispositivi.

## Risultati

| Verifica | Esito |
| --- | --- |
| TypeScript | Superato |
| Test unitari e integrazione | 1.490 superati, 7 esclusi per piattaforma |
| Interfaccia: progetto portabile e libreria | 15 scenari superati |
| Lint | Nessun errore, un avviso ereditato |
| Audit delle dipendenze npm | Zero vulnerabilità note alla data del controllo |
| Compilazione renderer e processo Electron | Superata |
| Componenti Windows cattura/cursore/conversione | Compilati dai sorgenti |
| Cattura nativa di una finestra di prova | Superata, circa 5 secondi H.264 |
| Pausa e ripresa | Superate nella prova nativa |
| Finestra coperta da un’altra finestra | Continua a registrare il solo contenuto selezionato |
| Ridimensionamento durante la registrazione | Mantiene il formato; il vuoto viene riempito di nero |
| Immagini in movimento | 10 fotogrammi campionati, 10 distinti |
| Conversione FFmpeg e decodifica completa | Superate, uscita 640×480 |
| Modulo uiohook nel vero runtime Electron | Caricamento superato |
| Runtime Whisper | Avvio del comando di aiuto superato; trascrizione da provare |
| Pacchetto NSIS Windows x64 | Creato; controllo dei binari inclusi superato |
| Avvio dell’app confezionata | HUD, preload e comunicazione con la libreria superati |
| Progetto portabile nell’app reale | Esportazione e importazione superate, media copiati in una nuova cartella |

La prova nativa registra soltanto una finestra generata dallo script. Non prova
microfono, audio di sistema, webcam o un montaggio completo attraverso l’editor.
Il test più lungo della libreria ha un limite di 90 secondi: attraversa diversi
pannelli e può superare il precedente limite generale di 30 secondi. Tutti i
15 scenari passano nel successivo giro completo senza modifiche concorrenti.

## Correzioni applicate

- Aggiornate dipendenze compatibili, Vite 6.4, Vitest 5 ed Electron; rigenerato il
  lockfile. Sostituita la vecchia catena di logging del downloader con global-agent 4.
- Evitata la compilazione forzata di uiohook nei percorsi con spazi: si usa il
  modulo Node-API precompilato, verificato nel runtime Electron reale.
- Il pacchetto Windows usa Electron già installato, evitando l’errore di rinomina
  durante l’estrazione sul disco del progetto.
- Aggiunte prove native e di avvio dell’app, con profilo dati isolato.
- Corretta l’apertura diretta degli archivi `.screenrecorder`: il percorso usa
  l’importazione portabile anziché provare a leggerli come progetti JSON.
- Corretta la cattura finestra Windows ereditata: catturava un ritaglio del monitor
  e poteva includere altre finestre sovrapposte. Ora cattura direttamente la
  finestra selezionata; la prova copre appositamente il bersaglio con un’altra
  finestra e controlla il contenuto del filmato.
- Escluso il compositore CUDA specializzato ereditato: il binario non corrisponde
  alla versione corrente dei sorgenti. La compilazione manuale rifiuta questo
  ripiego invece di accettarlo con un semplice avviso.

## Limiti riscontrati e prove da fare

Un tentativo diretto del motore Windows GPU sperimentale su un breve filmato
è rimasto bloccato senza produrre video ed è stato interrotto. Questa via non è
quindi validata su questo computer. Nell’app è facoltativa e dispone di un
controllo dei blocchi; per il collaudo iniziale lascia disattivata l’esportazione
nativa sperimentale. La conversione FFmpeg della prova nativa è riuscita.

Restano le prove su microfono, audio del computer, webcam, montaggio completo,
sessioni lunghe, altri codec/GPU e installazione/disinstallazione su un altro PC.
Il runtime Whisper parte, ma il riconoscimento vocale richiede anche modello e
audio di prova. Segui [CHECKLIST_TEST_IT.md](CHECKLIST_TEST_IT.md).

L’installer è privo di certificato di firma dell’editore e non attiva aggiornamenti
automatici di Recordly. Gli installer e i media di prova sono locali e ignorati da
Git; i repository contengono sorgenti, script e documentazione.

## Traduzioni residue C07 — 12 ottobre 2026

- Suite completa: **1.516 test riusciti, 7 esclusi** (176 file riusciti,
  uno escluso). Nove nuovi test verificano messaggi dinamici, conservazione dei
  percorsi/dati, righe multiple, diagnostica sconosciuta e traduzione/escaping SVG.
- Tipi e cataloghi coerenti; lint senza errori, con l'avviso preesistente in
  `ProjectThumbnail.tsx`. Inventario statico: **514 punti**, 339 catalogati,
  175 esclusioni motivate, **zero in attesa**. Ogni esclusione ha data e motivo;
  nuove frasi non classificate fanno fallire `--check-reviewed`.
- **Nove scenari UI distinti riusciti**: quattro di lingua/dashboard/guida,
  due di progetti portabili e tre nuovi C07 (preset GIF italiani, errore portabile
  con nome file contenente parentesi graffe, errore IPC della libreria originale).
  I tre nuovi scenari sono stati rieseguiti insieme con esito riuscito. Il primo
  tentativo GIF ha evidenziato una funzione mancante nel collegamento simulato
  dei test, aggiunta alla prova; non era un difetto del collegamento Electron.
- Compilazione renderer/Electron verificata. Le altre otto lingue selezionabili
  conservano ripieghi inglesi per le nuove frasi: C08/V08 restano aperti.
- Installer locale `release/OmvaLens-windows-x64.exe` ricreato: 519.801.334 byte.
  Checksum aggiornati in `release/SHA256SUMS.txt`; binari inclusi verificati.
  Prova dell'app confezionata riuscita con profilo isolato: avvio, editor
  italiano, menu nativi e trasferimento portabile. Nessuna release pubblica
  creata; l'installer mantiene il limite della firma editore indicato sopra.

## Ripetere i controlli

```sh
npm run typecheck
npm test
npm run lint
npm audit
npm exec -- playwright test tests/ui/portable-project.spec.ts tests/ui/project-dashboard.spec.ts --workers=1
npm run smoke:windows-recording
npm run build:win
npm run smoke:packaged-binaries -- release/win-unpacked
npm run smoke:packaged-app -- release/win-unpacked/OmvaLens.exe
# Dopo la prova nativa, verifica anche editor e trasferimento portabile:
npm run smoke:packaged-app -- release/win-unpacked/OmvaLens.exe .tmp/windows-smoke/capture.mp4
```

La prova di cattura produce i risultati in `.tmp/windows-smoke`; quella di avvio
in `.tmp/packaged-brand-smoke`. Il profilo di quest’ultima non tocca i progetti
dell’utente. Forgejo resta il repository primario; GitHub viene aggiornato solo
su richiesta esplicita per ciascuna operazione.
