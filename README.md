# BabyShop

[![CI](https://github.com/BITS4/babyshop/actions/workflows/ci.yml/badge.svg)](https://github.com/BITS4/babyshop/actions/workflows/ci.yml)
[![CodeQL](https://github.com/BITS4/babyshop/actions/workflows/codeql.yml/badge.svg)](https://github.com/BITS4/babyshop/actions/workflows/codeql.yml)

BabyShop is a full-stack e-commerce application for baby clothing. It uses Next.js and React for the storefront, Firebase Authentication and Firestore for identity and data, Stripe for card payments, and server-side route handlers for trusted pricing and order creation.

This is a **full-stack web application**, not a static template or infrastructure project. Payment and order APIs require a Next.js server runtime; Firebase Hosting static export is intentionally unsupported.

## Highlights

- Searchable and sortable product catalog with guarded Firestore decoding
- Persistent cart with schema-validated browser storage and quantity limits
- Email/password and Google authentication with email verification
- Admin access based on Firebase custom claims—not a client-side email allowlist
- Server-authoritative Stripe pricing, authenticated order creation, and signed webhooks
- Firestore and Storage rules with deny-by-default authorization
- Pino structured logging, optional Sentry reporting, `/api/health`, and Prometheus metrics
- Enforced ESLint, Prettier, TypeScript, tests, numeric coverage, build, audit, and CodeQL gates
- Reproducible npm lockfile and pinned Docker base image

## Architecture

```text
Browser / React screens
  ├── Firebase Auth and read-only catalog subscription
  ├── typed contexts (auth, cart, products)
  └── authenticated HTTPS requests
        ↓
Next.js route handlers
  ├── Zod request schemas and rate limits
  ├── Firebase Admin token verification
  ├── trusted Firestore catalog pricing
  ├── Stripe payment verification
  └── structured logs, metrics, and Sentry
        ↓
Firebase / Stripe
```

Domain code lives under `lib/`; external SDK setup is isolated under `lib/server/`; screens do not calculate trusted payment totals. See [Architecture](docs/ARCHITECTURE.md) for boundaries and data flows.

## Requirements

- Node.js 24 or newer
- npm 10 or newer
- A Firebase project for live authentication and data
- A Stripe test account for card payments
- Docker 24+ only if using the container workflow

The quality suite and production build run without external credentials. Live authentication, catalog data, orders, and card payments require the integration variables below.

## Fresh-clone setup

```bash
git clone https://github.com/BITS4/babyshop.git
cd babyshop
cp .env.example .env.local
npm ci
npm run check
npm run dev
```

Open <http://localhost:3000>. Replace the demo values in `.env.local` to use live integrations.

## Environment

| Variable                                   | Required for       | Description                                                                        |
| ------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Live app           | Firebase web API identifier                                                        |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Live app           | Firebase Auth domain                                                               |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Live app           | Firebase project ID                                                                |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Avatars            | Firebase Storage bucket                                                            |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Live app           | Firebase sender ID                                                                 |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Live app           | Firebase web app ID                                                                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`       | Card UI            | Stripe publishable test/live key                                                   |
| `STRIPE_SECRET_KEY`                        | Payment APIs       | Stripe secret key; server only                                                     |
| `STRIPE_WEBHOOK_SECRET`                    | Webhooks           | Stripe endpoint signing secret                                                     |
| `FIREBASE_SERVICE_ACCOUNT_JSON`            | Payment/order APIs | JSON service-account object; Application Default Credentials are used when omitted |
| `LOG_LEVEL`                                | Optional           | Pino level; defaults to `info`                                                     |
| `SENTRY_DSN`                               | Optional           | Server/edge Sentry DSN                                                             |
| `NEXT_PUBLIC_SENTRY_DSN`                   | Optional           | Browser Sentry DSN                                                                 |
| `SENTRY_TRACES_SAMPLE_RATE`                | Optional           | Server trace sample rate, `0` to `1`                                               |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`    | Optional           | Browser trace sample rate, `0` to `1`                                              |

Never commit `.env.local` or service-account JSON. `.gitignore` excludes environment files while preserving `.env.example`.

## Commands

| Command                 | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Start the development server                        |
| `npm run build`         | Create the standalone production build              |
| `npm start`             | Run a previously built application                  |
| `npm run format:check`  | Verify Prettier formatting                          |
| `npm run lint`          | Run ESLint with zero warnings allowed               |
| `npm run typecheck`     | Run strict TypeScript checks without emitting files |
| `npm test`              | Run all Vitest specs once                           |
| `npm run test:coverage` | Run tests and enforce numeric coverage thresholds   |
| `npm run audit`         | Fail on high or critical production advisories      |
| `npm run check`         | Run the complete local quality pipeline             |

Coverage thresholds are explicit in `vitest.config.mts`: 90% statements, lines, and functions plus 85% branches across auth, catalog, cart, checkout, order, payment, security, and metrics domains.

## API

| Route                        | Method | Purpose                                    | Authentication                                   |
| ---------------------------- | ------ | ------------------------------------------ | ------------------------------------------------ |
| `/api/health`                | `GET`  | Liveness and build version                 | None                                             |
| `/api/metrics`               | `GET`  | Prometheus process/domain counters         | None; restrict at the network edge in production |
| `/api/create-payment-intent` | `POST` | Reprice a cart and create a Stripe intent  | Firebase bearer token + idempotency key          |
| `/api/orders`                | `POST` | Verify payment and create an order         | Firebase bearer token                            |
| `/api/stripe-webhook`        | `POST` | Process signed, deduplicated Stripe events | Stripe signature                                 |

The client submits product IDs and quantities, never a trusted amount. The server reloads current catalog prices and binds Stripe intents to the authenticated user.

## Firebase authorization

Deploy `firestore.rules`, `firestore.indexes.json`, and `storage.rules` with the Firebase CLI. Administrative users need an `admin: true` Firebase custom claim. UI visibility is only a convenience; the rules and server token checks remain the security boundary.

## Stripe webhook

Configure Stripe to send `payment_intent.succeeded` and `payment_intent.payment_failed` to `/api/stripe-webhook`. Set its signing secret as `STRIPE_WEBHOOK_SECRET`. Events are recorded by ID before order mutation, making retries idempotent.

## Docker

```bash
docker compose up --build
curl --fail http://localhost:3000/api/health
```

The container runs as a non-root user, uses Next.js standalone output, and includes a healthcheck. Demo environment defaults let the process and health endpoint start without cloud credentials; integration operations remain unavailable until configured.

## CI and security

Every push and pull request runs independent, blocking jobs for formatting/lint/typecheck, tests with coverage, production build, and production dependency audit. CodeQL scans pushes, pull requests, and weekly. Dependabot covers npm, GitHub Actions, and Docker.

See [Quality](docs/QUALITY.md), [Security policy](SECURITY.md), and [Contribution guide](CONTRIBUTING.md) before making changes.

## Production operations

- Deploy the standalone Node server or the included container; do not use static export.
- Keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and service credentials server-side.
- Restrict `/api/metrics` to your monitoring network or gateway.
- Use Firebase Emulator Suite for local integration work where live data is not appropriate.
- Review the [runbook](docs/RUNBOOK.md) before a release or incident.

## Release history

See [CHANGELOG.md](CHANGELOG.md). Releases use semantic version tags and must pass the complete CI pipeline.
