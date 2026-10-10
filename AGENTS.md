# ScreenRecorder project context

- This is an independent AGPLv3 derivative of Recordly. Preserve upstream credits,
  the license, third-party notices and dated notices for modified source files.
- The provisional software and repository name is ScreenRecorder / screenrecorder.
- The owner's Forgejo server is **https://git.omvas.mooo.com/**, account **LordT78**.
  Use that destination for this project's primary repository.
- The owner's GitHub account is **Lordtzeentch38**. GitHub is an optional secondary
  destination: each upload, push, release or synchronization requires the user's
  explicit request naming GitHub for that operation. The initial upload does not
  authorize subsequent GitHub uploads.
- Read `HOSTING.md`, `FORK_CHANGES.md` and `LEGGIMI_IT.md` for current status.
- Git remote `upstream` is the original Recordly project. Never push fork changes there.
- Treat generic repository upload/publish requests as targeting Forgejo only.
  Do not synchronize GitHub automatically or merely to keep the copies aligned.
- Prefer Git/CLI and Forgejo APIs over browser automation when authenticated.
  Existing SSH authentication was verified on 10 October 2026. Check it before
  claiming credentials are unavailable; SSH access does not establish API-token access.
- Upstream distribution workflows remain disabled until adapted for this fork.
- Validate code with `npm run typecheck` and relevant tests. Building native helpers
  and an installer is separate from compiling the web and Electron bundles.
