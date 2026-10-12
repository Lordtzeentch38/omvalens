# OmvaLens — accelerazione hardware

Implementazione C11, 12 ottobre 2026. Il collaudo esteso resta nella voce V16
della [checklist](CHECKLIST_SVILUPPO_IT.md).

## Uso nell'app

In **Impostazioni → Generali → Accelerazione hardware**, lascia attivo
l'interruttore per la selezione automatica. **Controlla hardware** mostra le
schede rilevate, la disponibilità grafica, un encoder provato realmente e il
runtime Whisper disponibile. Questa schermata verifica disponibilità, non
misura l'utilizzo della GPU durante ogni operazione.
All'avvio, prima che l'editor inizializzi il canvas, Chromium può ancora
segnalare rendering software: ripeti **Controlla hardware** dopo aver aperto
l'editor. Nella prova confezionata il riepilogo passa a GPU e il canvas conferma
la RTX 3060; l'indicazione iniziale non dimostra assenza della scheda.

Disattiva l'interruttore per scegliere la CPU; chiudi e riapri OmvaLens per
applicare il cambiamento. La sessione conserva una sola modalità, anche se
l'impostazione viene modificata durante un'esportazione. I progetti e i profili
esistenti restano compatibili. Non occorre installare driver o toolkit dall'app.

| Operazione | Modalità automatica | Modalità CPU / limiti |
| --- | --- | --- |
| Anteprima e composizione | Renderer Pixi WebGL/WebGPU e accelerazione Chromium, secondo supporto del driver | Rendering software Chromium; compatibilità da verificare sul PC destinatario |
| Codifica MP4 nativa | Probe effettivo NVENC, QSV, AMF o VideoToolbox; ripiego libx264 | libx264 |
| Codifica MP4 nel browser | WebCodecs: richiesta hardware, configurazione software se non supportata | Richiesta software; WebCodecs tratta le preferenze come indicazioni |
| Decodifica dei fotogrammi | Selezione del browser secondo codec/supporto; AV1 conserva il percorso software compatibile | Richiesta software |
| Whisper Windows x64 | Runtime CUDA separato; errore GPU provoca un tentativo col runtime CPU indipendente | Runtime CPU con GPU disabilitata (`-ng`) |
| Whisper macOS/Linux | Runtime della piattaforma o eseguibile personalizzato; nessun nuovo pacchetto CUDA incluso per questi sistemi | `-ng`; collaudo dei sistemi distinto in V18 |
| GIF, audio, file e alcuni effetti | Restano operazioni CPU | CPU |
| Cattura Windows | API di cattura del sistema operativo | Può richiedere comunque Direct3D; la modalità CPU non disabilita la GPU dell'intero sistema |

Un eseguibile Whisper scelto esplicitamente dall'utente viene rispettato. Il
percorso al vecchio runtime CPU incluso viene invece riconosciuto come scelta
automatica e può passare a CUDA. I ripieghi sono registrati nei log. Il
compositore Windows sperimentale per scene statiche resta opzionale e non viene
abilitato automaticamente da questa modifica.

## Prove e limiti

PC di prova: due NVIDIA RTX 3060 da 12 GB, driver 616.92. Clip sintetica di
5 secondi, 1280×720, 30 fps: NVENC 0,43 s; libx264 0,28 s. Entrambi producono
150 fotogrammi e durata/dimensioni attese. Le impostazioni dei codec non sono
equivalenti per qualità: questi tempi non dimostrano una superiorità generale.

Whisper `tiny.en`, campione JFK ufficiale: CUDA 0,70 s; CPU 0,79 s. Il log
conferma `using CUDA0 backend`; parole uguali, tempi finali dei sottotitoli
10,44 s e 10,36 s. Un modello piccolo e un audio breve risentono dei costi di
avvio. Questa prova inglese non completa V13, dedicata all'audio italiano.

I test automatici coprono la selezione GPU/CPU, il ripiego Whisper indipendente,
le preferenze WebCodecs e gli errori dei processi di probe. La trascrizione
inglese è riuscita anche tramite l'app confezionata nelle due modalità. Il probe
video usa 256×256: un fotogramma 64×64 viene rifiutato da NVENC su questo PC e
causava un falso negativo nella selezione automatica. Restano da verificare
montaggi complessi, qualità visiva, sincronia audio, sessioni lunghe e altri
driver/schede. V16 rimane aperta per queste prove.

## Build riproducibile

La build Windows x64 prepara sia il runtime CPU sia quello CUDA. È possibile
preparare solo CUDA con `npm run build:whisper-gpu`. Il download opzionale CUDA
non viene eseguito dalla sola installazione delle dipendenze.

Il pacchetto ufficiale [Whisper v1.8.4](https://github.com/ggml-org/whisper.cpp/releases/tag/v1.8.4)
`whisper-cublas-12.4.0-bin-x64.zip` è verificato con SHA-256
`b07cff4e59831b227896018facbb6334907bf324a342c84597c44f087823d252`.
Il manifest registra anche gli hash dei file estratti. I binari sono ignorati
da Git e inclusi nel pacchetto locale, con le licenze originali accanto.

`WHISPER_RUNTIME_GPU=0` evita il download CUDA: su un checkout pulito consente
una distribuzione CPU. Se CUDA è già stato preparato, la variabile non rimuove
i file esistenti e non li esclude automaticamente dal pacchetto.

Whisper/ggml, SDL e librerie NVIDIA mantengono le rispettive licenze;
vedi [avvisi di terze parti](THIRD_PARTY_NOTICES.md). Le librerie NVIDIA non
diventano AGPL e il loro codice non è pubblicato nei nostri sorgenti.

Prove ripetibili:

```sh
node scripts/benchmark-hardware.mjs
node scripts/smoke-hardware-app.mjs release/win-unpacked/OmvaLens.exe .tmp/windows-smoke/capture.mp4
```

Gli esiti locali sono in `.tmp/gpu-validation/`; i profili di prova sono isolati.
