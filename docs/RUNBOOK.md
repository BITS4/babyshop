# Operations runbook

## Health

`GET /api/health` must return HTTP 200 with `status: ok`. Container orchestrators should use this endpoint for liveness. `GET /api/metrics` exposes uptime and domain counters in Prometheus text format.

## Payment failures

1. Correlate the structured log message with the Stripe payment-intent ID; logs intentionally redact secrets.
2. Confirm Firebase token verification and service-account access.
3. Compare the live catalog price with the Stripe amount and metadata user ID.
4. Inspect the Stripe event delivery and signature status.
5. Never mark an order paid based only on a browser report.

## Webhook retries

Stripe event IDs are stored in `stripeEvents`. A repeated ID returns success without repeating order updates. A signature failure returns HTTP 400 and increments the rejected-webhook counter.

## Rollback

Deploy the prior semantic-version container image. Database documents are backward-compatible within a minor release. Do not delete webhook event records during rollback because they are the idempotency ledger.

## Secret response

Rotate the affected Stripe or Firebase credential, update the deployment secret store, redeploy, and invalidate exposed sessions where appropriate. Do not place replacement credentials in an issue, commit, CI log, or support message.
