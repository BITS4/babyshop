# Contributing

## Workflow

Create a focused branch for one behavior change. Pair source and tests in the same commit, use a Conventional Commit message, and keep formatting-only changes separate. Pull requests should explain the user impact, trust-boundary impact, test evidence, and rollback plan.

## Local verification

Install with `npm ci`, copy `.env.example` to `.env.local` when exercising integrations, and run `npm run check` before opening a pull request. CI repeats all gates on a clean Linux runner.

## Commit examples

- `feat(cart): cap item quantities with reducer tests`
- `fix(payments): reject stale catalog prices`
- `test(orders): cover card ownership mismatch`
- `docs(runbook): document webhook replay handling`

Do not mix generated dependency updates, broad formatting, refactors, and features in one commit. Do not fabricate author identities; genuine collaborators should commit under their own accounts.

## Dependency updates

Use npm and commit both manifest and lockfile changes. Review changelogs for majors. Never bypass the audit, type, test, or coverage gates to merge an update.

## Security changes

Treat all browser and persisted data as untrusted. Validate at the boundary, authorize at the server or Firebase rules layer, avoid sensitive data in logs, and add abuse/failure-path tests.
