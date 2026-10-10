# ScreenRecorder — prima versione del nostro fork

**ScreenRecorder è un nome provvisorio.** Questo progetto deriva da
[Recordly](https://github.com/webadderallorg/Recordly), commit `535d1cf`.
Rimane open source con licenza [AGPLv3](LICENSE.md). I crediti originali sono
conservati; [FORK_CHANGES.md](FORK_CHANGES.md) distingue la base dalle nostre aggiunte.

## Migliorie disponibili

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

## Stato della versione

È una versione di sviluppo del codice, non ancora un installer pronto alla
distribuzione. Sono passati il controllo TypeScript e 1.489 test automatici;
7 test sono esclusi per condizioni di piattaforma. Sono state provate anche
l’interfaccia del nuovo pulsante e la gestione dell’annullamento, con un ambiente
desktop simulato. La compilazione delle parti web ed Electron è riuscita.

Restano da verificare una registrazione reale su Windows, l’esportazione con
hardware e codec effettivi e la creazione dell’installer. La scansione delle
dipendenze segnala 36 problemi, da valutare e correggere prima della pubblicazione.

## Avvio per lo sviluppo

La base usa Electron e TypeScript. Per i componenti nativi Windows servono
Visual Studio Build Tools e CMake, come descritto nel README originale.

```sh
npm install
npm run dev
```

L’installazione normale costruisce anche i componenti nativi. Nell’ambiente
di verifica sono state installate le dipendenze senza eseguire automaticamente
tutte queste compilazioni: il solo completamento dei test non garantisce quindi
che i componenti di cattura nativi siano già disponibili.

## Passi successivi

1. Completare le prove su Windows e preparare un installer del fork.
2. Aggiornare le dipendenze e configurare servizi e aggiornamenti propri.
3. Aggiungere più revisioni recuperabili, capitoli e montaggio dalla trascrizione.

Il recupero attuale usa l’ultimo backup disponibile; non è ancora una cronologia
di versioni. Prima di distribuire l’app, accompagnarla con il codice sorgente
corrispondente e mantenere gli avvisi richiesti dalla licenza.
