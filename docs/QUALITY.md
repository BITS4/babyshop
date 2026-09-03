# Quality policy

## Required gates

The following checks are blocking in `.github/workflows/ci.yml`:

1. `npm ci` from the committed lockfile
2. Prettier check
3. ESLint with zero warnings
4. strict TypeScript typecheck
5. Vitest through the standard `npm test` entrypoint with numeric coverage thresholds
6. Next.js production build
7. production dependency audit at high severity

Each gate has its own plainly named CI job so GitHub branch protection can require it directly. The production build depends on format, lint, typecheck, and test success. CodeQL runs separately on pushes, pull requests, and a weekly schedule; dependency review blocks vulnerable lockfile changes in pull requests.

## Coverage scope

The coverage gate includes business and security modules plus the profile, checkout, and admin page/component layers. Thresholds are 95% for statements and lines, 91% for functions, and 88% for branches. Tests cover success, malformed input, boundary values, route guards, profile persistence, payment failures, missing catalog records, authentication failure, payment mismatch, idempotency, rate limiting, storage corruption, and safe error mapping. Firebase and Stripe are replaced with deterministic fixtures from `test/mocks`; no cloud account or network access is required.

Every behavior change should update its closest `*.spec.ts` or `*.test.tsx` in the same commit. Do not lower a threshold to merge a change. Add a test or explain and review a deliberate exclusion.

## File discipline

ESLint rejects production files above 450 nonblank, noncomment lines. New modules should generally remain below 250 lines and have one responsibility. Formatting-only changes belong in their own commit.

## Manual release check

- Run the complete `npm run check` command from a clean clone.
- Start the Docker Compose service and verify `/api/health` returns HTTP 200.
- Exercise sign-in, catalog loading, cart persistence, COD checkout, Stripe test checkout, and an admin status update.
- Confirm no credentials or `.env` files are staged.
- Review production dependency and CodeQL results before tagging.
