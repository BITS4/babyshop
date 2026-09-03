# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and releases use [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-09-03

### Added

- Page-level profile, checkout, and admin integration tests with reusable Firebase and Stripe fixtures
- Browser bundle budgets and pull-request dependency vulnerability review
- Profile validation/repository modules, payment-intent hook, typed order client, and guarded image processor

### Changed

- Refreshed Stripe, Tailwind, PostCSS, TypeScript, and React/Node type dependencies after full test and build verification
- Split profile, checkout, and admin screens into typed UI, persistence, and network boundaries with page-level integration tests
- Made lint, typecheck, test, build, audit, dependency review, and bundle budget gates explicit in CI

## [1.0.0] - 2026-09-03

### Added

- Typed, schema-validated catalog, cart, checkout, order, and payment domains
- Authenticated server-side Stripe pricing and order verification
- Signed and idempotent Stripe webhook handling
- Pino structured logging, optional Sentry integration, health, and Prometheus metrics
- Firestore and Storage authorization rules
- Vitest suite with explicit 90/85 coverage gates
- Blocking CI, CodeQL, dependency automation, Docker, and operational documentation

### Changed

- Promoted the Next.js application to the repository root
- Upgraded to patched Next.js 16 and current Firebase SDKs
- Replaced static Firebase Hosting export with standalone server deployment

### Removed

- Vendored `node_modules`, duplicate configuration, stale static pages, and an unused archive

[Unreleased]: https://github.com/BITS4/babyshop/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/BITS4/babyshop/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/BITS4/babyshop/releases/tag/v1.0.0
