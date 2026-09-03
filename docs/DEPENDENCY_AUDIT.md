# Dependency audit snapshot

This snapshot documents the reproducible dependency graph represented by `package-lock.json`. It is generated from the lockfile rather than copied from a machine-specific `npm ls` tree.

| Measure                         | Count |
| ------------------------------- | ----: |
| Direct runtime dependencies     |    12 |
| Direct development dependencies |    18 |
| Locked installation entries     |   945 |
| Unique package names            |   836 |
| Duplicate installation entries  |   109 |

The larger transitive groups come primarily from the Firebase browser/Admin SDKs, Next.js build tooling, Sentry instrumentation, ESLint, and the test DOM. Each direct dependency has an owner and reason in [DEPENDENCIES.md](DEPENDENCIES.md). Production and development advisories are blocked by `npm audit`; pull requests receive GitHub dependency review; Dependabot checks npm weekly.

Dependencies are not replaced with smaller alternatives solely to reduce this number. Removal requires confirming equivalent security, browser support, tree-shaking, and maintenance characteristics. Bundle growth is independently constrained by the `bundle:size` check after every production build.
