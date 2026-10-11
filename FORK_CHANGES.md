> **Nuova identità: OmvaLens** (10 ottobre 2026). Nome e logo originali;
> attribuzione a Recordly conservata nei crediti. Vedi [BRANDING_IT.md](BRANDING_IT.md).
> Gli indirizzi dei repository e i formati dei progetti restano compatibili.

# OmvaLens — development fork

Product name: **OmvaLens**, formerly ScreenRecorder. This is an independent, open-source derivative of
[Recordly](https://github.com/webadderallorg/Recordly), based on commit `535d1cf`
(7 October 2026). It is not an official Recordly release.

Original copyright and attribution notices are retained. This fork and its
integrated modifications are licensed under [AGPLv3](LICENSE.md). Existing
third-party notices remain in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Changes introduced in this fork — 11 October 2026

- **Shared progress tracking:** checkable development checklist with completion
  criteria, dated evidence and pending manual validation. Project instructions
  require updating it after each completed task.
- **Italian UI migration:** 567 additional catalog-backed phrases covering the
  onboarding, authentication, dashboard, editor tools, accessible labels,
  notifications and native menus/dialogs. Existing Italian catalog omissions
  corrected. Language selection persists, synchronizes between windows and
  updates native menus. User content and compatibility identifiers are retained.
- **Translation validation:** nonempty catalog values, interpolation parity,
  English source mappings, candidate audit and locale-switching UI tests.
  Existing translations reused for other locales; untranslated additions retain
  English fallback. Full multilingual completion remains tracked separately in
  [CHECKLIST_SVILUPPO_IT.md](CHECKLIST_SVILUPPO_IT.md).

## Changes introduced in this fork — 10 October 2026

- **Hosting preparation**: project owner/account references and hosting guidance,
  an independent README introduction, local environment-file exclusions, and
  disabled upstream distribution/automatic-translation workflows. The complete
  upstream commit history is retained; upstream release tags are not published
  as ScreenRecorder releases.
- **Independent app identity**: ScreenRecorder name and original geometric icon,
  separate development/production data directories, upstream credits in the
  dashboard and About dialog. Upstream updates and default authentication
  protocol registration are disabled until explicitly configured for this fork.
- **Portable projects**: the editor's **Portable project** button, or
  **File → Export Portable Project**, produces a `.screenrecorder` ZIP archive.
  It includes the current editor state, screen video, webcam, extra audio,
  local backgrounds and matching recording sidecars (cursor telemetry,
  microphone/system audio and session metadata). Media from separate folders
  retains distinct names. The original project and media are not moved.
- **Import**: use **Home → Import** or the existing project file picker. A
  portable archive is extracted into a unique folder inside the recording
  workspace, and a new `.recordly` project is added to the project library.
  Media references are rewritten for that computer and a new project ID is
  assigned. Repeated imports do not overwrite previous projects.
- **Archive integrity**: streamed reads/writes, CRC verification, size limits,
  rejection of links, unsafe paths and case-insensitive filename collisions,
  and cleanup of incomplete imports. Limits: 10,000 media files, 100 GiB
  uncompressed data, 8 MiB project metadata. Media is stored without compression
  to avoid wasting CPU on already compressed video.
- **Export preflight**: validate preview dimensions/duration and the existence,
  readability and nonzero size of the source video, enabled webcam, discovered
  source audio, additional audio and local background before rendering.
  Existing upstream export engines and fallback policies remain in use.
- **Backup recovery**: when opening an unreadable/invalid project, offer its
  valid `.bak` file as a separate recovered project. The original and backup
  remain untouched. This builds on upstream atomic saving and autosave.

## Existing functionality inherited from Recordly

Capture backends, timeline editing, cursor effects, zooms, webcam composition,
annotations, captions/Whisper, audio routing, preview/export renderers, autosave
and atomic project saving, extension support and the existing test suite.

## Development and validation

Install dependencies with `npm install`, then use `npm run dev`. Windows native
helpers require Visual Studio Build Tools and CMake as described in the upstream
README. Use `npm run typecheck` and `npm test` for source validation.

Focused transfer/recovery tests:

```sh
npm test -- electron/ipc/project/portable.test.ts electron/ipc/project/recovery.test.ts electron/ipc/project/atomicSave.test.ts
```

The portable archive carries documented project media fields and matching
recording sidecars. Remote assets and third-party extension installations are
not bundled. Built-in wallpapers remain asset references supplied by the app;
custom local backgrounds are included. Imported media stays in its portable folder even after deleting a
project from the library; this prevents unintended deletion of shared media.
Preflight is a file/readiness check, not proof that a codec or GPU can export a
particular recording. Recovery depends on an existing valid backup and does not
repair damaged video files.

Validation on Windows, 10 October 2026: TypeScript checks pass; the complete
unit/integration suite passes 1,489 tests with 7 platform-specific skips. The two
new browser interface tests cover portable export, its busy state and cancellation
using a simulated desktop bridge. Production renderer and Electron bundles compile.
A subsequent Windows preparation pass is documented in VALIDAZIONE_IT.md.

The 15 selected browser scenarios for the editor and dashboard also passed
across the final verification runs. One dashboard scenario was repeated after a
development-server reload interrupted it. An existing autosave scenario now waits
for video metadata and persisted initial state before checking idle behavior.
Existing caption-generation and trash-path test fixtures were normalized for Windows.

The modified package manifests/lockfile, locale JSON files and README carry this
fork's identity, dependencies, portable-project labels or introductory notices;
their changes are dated 10 October 2026. Modified source files carry a matching
notice. Icons are generated from this fork's own geometric design.

Windows preparation, 10 October 2026: dependencies were updated and the lockfile
regenerated. Vite moved to the maintained 6.4 branch and Vitest to version 5;
the supported Node minimum is now 22.12. A global-agent 4 override removes the
vulnerable legacy logging dependency used by the packaging downloader. The final
npm audit reports zero known vulnerabilities. Regression checks were repeated.

Windows packaging now uses Node-API prebuilds instead of forcing a source rebuild
of uiohook in paths with spaces, and reuses the installed Electron distribution
to avoid extraction/rename failures on this workspace drive. Native capture,
cursor and GPU-export binaries and their manifests were rebuilt from source.
The inherited specialized CUDA compositor is excluded from the package because
its binary does not match its source fingerprint; it is no longer part of the
default helper build. Its manual build refuses an unverifiable fallback binary.
Other upstream export routes remain available.

Real window-capture inspection also exposed an upstream defect: the HWND route
captured a cropped monitor region, so another window covering that region could
appear in the recording. It now uses WGC CreateForWindow directly. The encoded
canvas remains fixed during resize, with black padding when the window shrinks.
The native smoke deliberately overlays a separate magenta window and verifies
that the recorded target still shows its blue generated content.

Added repeatable real Windows capture/conversion and packaged startup smoke
scripts, including an isolated data profile through SCREENRECORDER_USER_DATA_DIR.
The capture fixture records only its own generated window, with pause/resume,
changing-frame checks, FFprobe inspection and FFmpeg decode validation.
The real packaged transfer check exposed and fixed direct opening of portable
archives: the open-at-path handler now imports them before loading the project,
matching the existing file-picker behavior. The smoke script can optionally open
the captured clip in the editor, export a portable project and import its own
media copy through real IPC without mocking the desktop bridge.
Device audio, webcam, long sessions, the entire editor export flow and a clean
machine installation still need the manual checks in CHECKLIST_TEST_IT.md.

## Next development stages

1. Real Windows recording → editing → export and native installer verification.
2. Additional saved revisions and session recovery beyond the latest backup.
3. Export sample/diagnostics, timeline chapters and transcript-based editing.

Before publishing a release, configure this fork's own hosting, update feed and
service endpoints, complete branding and distribute corresponding source.
