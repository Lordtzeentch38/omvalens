# Translation Guide

This project uses a namespace-based i18n setup so contributors can localize safely without changing app logic.

## Locale Files

All locale files live under:

`src/i18n/locales/<locale>/`: `en`, `es`, `fr`, `de`, `it`, `nl`, `ko`,
`pt-BR`, `zh-CN`, and `zh-TW` are selectable. The historical `ru` catalog is
not selectable; preserve its key structure without presenting it as supported.

Each locale has the same namespace files:

- `common.json`
- `launch.json`
- `editor.json`
- `timeline.json`
- `settings.json`
- `dialogs.json`
- `shortcuts.json`

English (`en`) is the source of truth for key structure.

## Key Rules

- Keep the same key paths across locales.
- Do not rename existing keys unless coordinated with code changes.
- Add new keys to `en` first, then mirror into all other locales.
- Prefer descriptive, stable keys. Example: `app.editorTitle`.
- Interpolation is supported with `{{name}}` style placeholders.

## How Translation Is Read

- Keys with a namespace prefix like `settings.export.title` use that namespace.
- Keys without a namespace default to `common`.
- Missing translations fall back to English, then to the provided fallback string, then to the key.

## Validate Locale Structure

Run:

```bash
npm run i18n:check
```

This checks for:

- Missing namespace files
- Missing keys compared to `en`
- Extra keys not present in `en`
- Empty values and differing interpolation variables
- UI source mappings and dated static-audit reviews
- Unexplained English phrases in selectable non-English catalogs
- Literal calls through `useScopedT` aliases whose catalog keys are missing

`npm run i18n:coverage` runs the last check separately. English names, formats
and genuinely shared terms require a locale-specific, dated reason in
`src/i18n/translationExceptions.json`. Do not exempt missing functional translations.
Preserve user content, paths, brand names and variables. Unknown system/driver
diagnostics remain original; app-owned errors use explicit message templates.
`scripts/i18n-references.mjs` checks literal scoped keys in source code, including
calls with an English fallback that would otherwise hide an absent key. Computed
keys still require focused tests; aliases reused for different namespaces in one
file are skipped rather than incorrectly resolved.

## Contributor Workflow

1. Pull latest `main`.
2. Update `en/<namespace>.json` with new keys if needed.
3. Add matching keys to other locale files.
4. Run `npm run i18n:check`.
5. Run relevant unit/UI tests and review wording and layout in the target languages.
6. Open PR with a short summary of changed namespaces.

## Scope Notes

As of 12 October 2026, all ten selectable locales cover the same 1,463 catalog
keys, with no unexplained English fallback. This is a technical coverage result,
not a native-speaker certification. Broader linguistic/layout review remains V08
in `CHECKLIST_SVILUPPO_IT.md`; keep coding, validation and distribution separate.
