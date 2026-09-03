# Security policy

## Supported versions

Security fixes are provided for the latest tagged release on `main`.

## Reporting

Do not disclose vulnerabilities in a public issue. Use GitHub private vulnerability reporting for `BITS4/babyshop` and include affected routes, reproduction steps, impact, and a suggested mitigation if known. Do not include live customer data or credentials.

## Response targets

- Critical: acknowledge within 24 hours and prioritize an emergency fix
- High: acknowledge within 3 business days
- Medium/low: assess in the next maintenance cycle

## Controls

The project uses deny-by-default Firebase rules, verified identity tokens, server-authoritative pricing, Stripe webhook signatures, request limits, upload restrictions, structured redacted logs, optional Sentry reporting, weekly CodeQL, Dependabot, and a blocking production audit.
