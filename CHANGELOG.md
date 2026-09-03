# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and releases use [Semantic Versioning](https://semver.org/).

## [Unreleased]

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

[Unreleased]: https://github.com/BITS4/babyshop/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/BITS4/babyshop/releases/tag/v1.0.0
