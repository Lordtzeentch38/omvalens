# Repository hosting

Hosting preferences supplied and clarified by the project owner on 10 October 2026:

| Role | Host | Account | Repository |
| --- | --- | --- | --- |
| Primary destination | Forgejo, https://git.omvas.mooo.com/ | `LordT78` | `screenrecorder` |
| Optional GitHub copy, explicit requests only | https://github.com/ | `Lordtzeentch38` | `screenrecorder` |
| Original project | https://github.com/ | `webadderallorg` | `Recordly` |

The name **ScreenRecorder** and repository name **screenrecorder** are provisional.
They can change later. A software rename should cover visible labels, icons,
installer metadata, update URLs and a migration of existing user data. Repository
renames also require updating remotes and documentation links.

Local Git remote names:

- `forgejo`: this project's primary Forgejo repository.
- `github`: this project's GitHub repository.
- `upstream`: the original Recordly repository, for fetching upstream changes.

Do not push this fork's commits to `upstream`. Synchronization between Forgejo
and GitHub is manual; no automatic synchronization job has been configured.
**Only upload to GitHub when the owner explicitly requests GitHub for that
operation.** A generic upload/publish request targets Forgejo only. The initial
GitHub upload is not continuing authorization for future uploads. The copies may
therefore intentionally diverge until the owner asks for a GitHub update.

Prefer Git/CLI and APIs when credentials are available. Existing SSH access to
Forgejo was verified on 10 October 2026. SSH authentication permits direct Git
access; an API token is a separate credential and was not located in that check.

Public repository links:

- Primary: https://git.omvas.mooo.com/LordT78/screenrecorder
- GitHub: https://github.com/Lordtzeentch38/screenrecorder

Upstream distribution and automatic translation workflows are preserved in
`.github/workflows/upstream-disabled/` and do not run. They refer to Recordly's
release tooling and must be adapted before use for this fork. Code quality CI
remains available on GitHub.

Credentials must stay in the system credential manager or hosting service.
Do not commit passwords, access tokens, private keys or local environment files.
