# ScreenRecorder — development fork

Working name: **ScreenRecorder**. This is an independent, open-source derivative of
[Recordly](https://github.com/webadderallorg/Recordly), based on commit `535d1cf`
(7 October 2026). It is not an official Recordly release.

Original copyright and attribution notices are retained. This fork and its
integrated modifications are licensed under [AGPLv3](LICENSE.md). Existing
third-party notices remain in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

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
An installer and a real capture/export session have not yet been verified.

The 15 selected browser scenarios for the editor and dashboard also passed
across the final verification runs. One dashboard scenario was repeated after a
development-server reload interrupted it. An existing autosave scenario now waits
for video metadata and persisted initial state before checking idle behavior.
Existing caption-generation and trash-path test fixtures were normalized for Windows.

The modified package manifests/lockfile, locale JSON files and README carry this
fork's identity, dependencies, portable-project labels or introductory notices;
their changes are dated 10 October 2026. Modified source files carry a matching
notice. Icons are generated from this fork's own geometric design.

Dependency audit currently reports 36 findings (1 low, 8 moderate, 25 high,
2 critical), including inherited Vitest/Tinypool development dependencies.
These require a separate dependency update and regression check before release;
no blanket major-version upgrade has been applied. The added ZIP libraries have
no findings in that audit.

## Next development stages

1. Real Windows recording → editing → export and native installer verification.
2. Additional saved revisions and session recovery beyond the latest backup.
3. Export sample/diagnostics, timeline chapters and transcript-based editing.

Before publishing a release, configure this fork's own hosting, update feed and
service endpoints, complete branding and distribute corresponding source.
