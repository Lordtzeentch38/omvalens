# Verifiche della versione di sviluppo — 10 ottobre 2026

## Cambio di identità: OmvaLens

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
npm run smoke:packaged-app -- release/win-unpacked/ScreenRecorder.exe
# Dopo la prova nativa, verifica anche editor e trasferimento portabile:
npm run smoke:packaged-app -- release/win-unpacked/ScreenRecorder.exe .tmp/windows-smoke/capture.mp4
```

La prova di cattura produce i risultati in `.tmp/windows-smoke`; quella di avvio
in `.tmp/packaged-app-smoke`. Il profilo di quest’ultima non tocca i progetti
dell’utente. Forgejo resta il repository primario; GitHub viene aggiornato per
questa operazione su richiesta esplicita del proprietario.
