# Quality policy

## Required gates

The following checks are blocking in `.github/workflows/ci.yml`:

1. `npm ci` from the committed lockfile
2. Prettier check
3. ESLint with zero warnings
4. strict TypeScript typecheck
5. Vitest with numeric coverage thresholds
6. Next.js production build
7. production dependency audit at high severity

CodeQL runs separately on pushes, pull requests, and a weekly schedule.

## Coverage scope

The coverage gate targets business and security modules rather than generated files or declarative UI styling. Thresholds are 90% for statements, functions, and lines and 85% for branches. Tests cover success, malformed input, boundary values, missing catalog records, authentication failure, payment mismatch, idempotency, rate limiting, storage corruption, and safe error mapping.

Every behavior change should update its closest `*.spec.ts` in the same commit. Do not lower a threshold to merge a change. Add a test or explain and review a deliberate exclusion.

## File discipline

ESLint rejects production files above 450 nonblank, noncomment lines. New modules should generally remain below 250 lines and have one responsibility. Formatting-only changes belong in their own commit.

## Manual release check

- Run the complete `npm run check` command from a clean clone.
- Start the Docker Compose service and verify `/api/health` returns HTTP 200.
- Exercise sign-in, catalog loading, cart persistence, COD checkout, Stripe test checkout, and an admin status update.
- Confirm no credentials or `.env` files are staged.
- Review production dependency and CodeQL results before tagging.
