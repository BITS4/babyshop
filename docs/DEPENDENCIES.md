# Dependency policy

`package.json` is the direct dependency manifest and `package-lock.json` is the reproducible dependency graph. `npm ci` is the only supported CI installation path.

## Ownership

- Next.js and React: application runtime
- Firebase client SDK: browser authentication, reads, profile updates, and avatar storage
- Firebase Admin SDK: verified server identity and trusted data writes
- Stripe SDKs: payment UI, intent creation, verification, and signed webhooks
- Zod: input and persisted-data validation
- Pino and Sentry: logs and error tracking
- Vitest and Testing Library: tests and coverage
- ESLint and Prettier: static quality gates

Dependabot checks production, development, GitHub Actions, and Docker dependencies weekly. Updates must pass CI and should remain grouped by ecosystem and dependency type. Major upgrades require a focused commit with migration notes and tests.

Production audit policy blocks high and critical findings. The `uuid` override exists to force Firebase Admin's legacy HTTP subtree onto the first patched CommonJS-compatible major; remove it when upstream packages adopt that version directly.

## Reviewed major versions

The 2026-09-03 `npm outdated --long` review reports only three deliberately deferred development-tool majors:

| Package       | Selected | New major | Reason                                                                                           |
| ------------- | -------- | --------- | ------------------------------------------------------------------------------------------------ |
| `@types/node` | 24       | 26        | Types match the pinned Node 24 runtime; using future runtime types can hide compatibility errors |
| `eslint`      | 9        | 10        | Plugins bundled by `eslint-config-next` still declare ESLint 9 as their maximum peer             |
| `typescript`  | 5.9      | 7         | A compiler-major migration requires separate framework and lint-plugin compatibility testing     |

All production dependencies are on their current direct majors, all compatible direct minors are current, and `npm audit` reports zero vulnerabilities.
