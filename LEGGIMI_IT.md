> **Nuova identità: OmvaLens** (10 ottobre 2026). Nome e logo originali;
> attribuzione a Recordly conservata nei crediti. Vedi [BRANDING_IT.md](BRANDING_IT.md).
> Gli indirizzi dei repository e i formati dei progetti restano compatibili.

# OmvaLens — prima versione del nostro fork

**OmvaLens è il nuovo nome dell’applicazione**, prima chiamata ScreenRecorder. Questo progetto deriva da
[Recordly](https://github.com/webadderallorg/Recordly), commit `535d1cf`.
Rimane open source con licenza [AGPLv3](LICENSE.md). I crediti originali sono
conservati; [FORK_CHANGES.md](FORK_CHANGES.md) distingue la base dalle nostre aggiunte.

## Migliorie disponibili

Accelerazione GPU, modalità CPU e limiti per operazione:
[guida hardware](ACCELERAZIONE_HARDWARE_IT.md).

Avanzamento e prossime attività: [checklist condivisa](CHECKLIST_SVILUPPO_IT.md).
Le caselle vengono spuntate dopo le verifiche. La prima fase italiana dei testi
è completata; limiti e altre lingue sono in [TRADUZIONI_IT.md](TRADUZIONI_IT.md).

- **Progetto portabile**: il pulsante nell’editor salva un archivio
  `.screenrecorder` con lo stato attuale del montaggio, video, webcam, audio,
  sfondi personalizzati e dati associati della registrazione. Non serve spostare
  manualmente i singoli file. Gli sfondi inclusi nell’app restano riferimenti
  agli stessi sfondi; risorse remote ed estensioni non vengono incluse.
- **Importazione**: da **Home → Importa**, scegli l’archivio. L’app crea una
  copia autonoma nella propria libreria e aggiorna i percorsi dei file.
- **Controlli prima dell’esportazione video**: verifica che l’anteprima sia
  pronta e che i file richiesti esistano, siano leggibili e non siano vuoti.
- **Recupero dei progetti**: se un progetto non si apre e dispone di un backup
  valido, l’app propone di aprirne una nuova copia. Originale e backup vengono
  conservati. Il recupero non ripara video danneggiati.
- **Identità propria**: nome, icona e cartella dati separati da Recordly,
  con attribuzione visibile. Gli aggiornamenti di Recordly sono disabilitati.
- **Cattura finestra Windows corretta**: registra la finestra selezionata anche
  quando un’altra finestra la copre, invece di registrare un ritaglio del monitor.

## Stato della versione

È una versione di sviluppo per Windows x64. I componenti di cattura, cursore e
conversione video sono stati compilati; è stato creato un installer NSIS.
La prova automatica nativa registra una finestra con contenuto generato, verifica
pausa e ripresa, immagini in movimento e conversione H.264 con FFmpeg.
Sono disponibili anche controlli di avvio dell’app confezionata e dei suoi binari.
Il rapporto aggiornato è in [VALIDAZIONE_IT.md](VALIDAZIONE_IT.md).

Le dipendenze sono state aggiornate: la scansione del 10 ottobre 2026 segnala
zero vulnerabilità note. Questo risultato non sostituisce le prove manuali
su webcam, microfono, audio di sistema, registrazioni lunghe e altri computer.
Usa [CHECKLIST_TEST_IT.md](CHECKLIST_TEST_IT.md) per queste verifiche.

## Avvio per lo sviluppo

La base usa Electron e TypeScript. Serve Node.js 22.12 o successivo della serie
22, oppure una versione supportata indicata in `package.json`.
Per i componenti nativi Windows servono
Visual Studio Build Tools e CMake, come descritto nel README originale.

```sh
npm install
npm run dev
```

L’installazione normale prepara anche i componenti nativi. Per creare il pacchetto:

```sh
npm run build:win
npm run smoke:packaged-binaries -- release/win-unpacked
npm run smoke:packaged-app -- release/win-unpacked/OmvaLens.exe
npm run smoke:windows-recording
```

L’installer viene scritto in `release/OmvaLens-windows-x64.exe`.
La prova nativa apre e registra esclusivamente una finestra di test.
La prova dell’app usa una cartella dati separata in `.tmp/packaged-app-smoke`.
È possibile specificare un’altra cartella dati con `SCREENRECORDER_USER_DATA_DIR`.

Il compositore CUDA NVIDIA specializzato ereditato è escluso dal pacchetto:
il suo binario non corrisponde ai sorgenti attuali e richiede una nuova compilazione
con CUDA e Video Codec SDK. Restano disponibili le altre vie di esportazione.
L’installer di sviluppo non dispone di un certificato di firma dell’editore.
Per le prime prove lascia disattivata l’esportazione nativa sperimentale:
il motore Windows GPU ha mostrato un blocco in un tentativo diretto.

## Passi successivi

1. Completare le prove sui dispositivi reali e l’installazione su un altro PC.
2. Configurare servizi e aggiornamenti propri quando serviranno.
3. Aggiungere più revisioni recuperabili, capitoli e montaggio dalla trascrizione.

Il recupero attuale usa l’ultimo backup disponibile; non è ancora una cronologia
di versioni. Prima di distribuire l’app, accompagnarla con il codice sorgente
corrispondente e mantenere gli avvisi richiesti dalla licenza.
