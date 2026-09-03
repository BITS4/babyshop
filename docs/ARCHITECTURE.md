# Architecture

## System shape

BabyShop is a Next.js full-stack application. React client components own presentation and ephemeral form state. Typed modules under `lib/` own business rules. Route handlers own privileged Firebase Admin and Stripe operations.

## Trust boundaries

1. Browser data is untrusted, including local storage, Firestore documents, prices, user profile fields, and HTTP bodies.
2. Zod schemas decode data before it enters domain logic.
3. Firebase ID tokens identify callers at payment and order endpoints.
4. A payment amount is computed from current Firestore catalog prices; a browser-provided total is rejected by the strict schema.
5. Card orders are stored only after Stripe confirms status, amount, currency, and the bound Firebase user ID.
6. Webhooks use the raw request body and Stripe signature, and event IDs are stored before side effects.
7. Firestore and Storage rules default to denial. Firebase Admin operations bypass rules only inside trusted server routes.

## Modules

- `app/`: routes, layouts, and page composition
- `components/`: reusable user-interface components
- `context/`: Firebase subscriptions and local UI state adapters
- `lib/auth/`: credential schemas
- `lib/catalog/`: product decoding, filtering, sorting, and image URL normalization
- `lib/cart/`: immutable cart operations and guarded persistence
- `lib/checkout/`: customer validation, payment-intent hook, and authenticated order client
- `lib/profile/`: profile schema and Firestore repository boundary
- `lib/admin/`: validated browser image processing
- `lib/orders/`: receipt parsing and trusted order orchestration
- `lib/payments/`: payment schemas, catalog pricing, idempotency, and webhook mapping
- `lib/security/`: safe errors, upload validation, rate limits, and request parsing
- `lib/observability/`: Pino, Sentry adapters, and Prometheus metrics
- `lib/server/`: privileged SDK adapters that must not be imported into browser code

The profile, checkout, and admin route files are composition layers. Reusable UI lives in feature-named component folders; persistence and network calls live behind typed `lib/` boundaries. Page-level integration tests replace Firebase and Stripe with deterministic fixtures from `test/mocks`.

## Failure behavior

Expected input failures return stable public codes without internal messages. Unexpected failures are logged as structured objects and captured by Sentry when configured. Browser failures are reported through the client Sentry adapter. Payment and order operations fail closed.

## Deployment

`next.config.ts` produces standalone server output because API routes cannot run from a static export. The Docker runtime is non-root and health checked. Firebase hosts identity/data/storage, not the Next.js server artifact.
