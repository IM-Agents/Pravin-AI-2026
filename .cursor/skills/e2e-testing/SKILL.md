---
name: e2e-testing
description: >-
  End-to-end testing with Playwright, Cypress, or similar — stable selectors, fixtures,
  environments, and flake control. Use when adding or fixing E2E tests or debugging CI failures.
---

# E2E testing

## When to activate

- Writing or updating browser E2E tests
- Flaky tests in CI, timeouts, or race conditions
- Choosing selectors and page-object patterns
- Seeding data or auth for test environments

## Principles

1. **Pyramid**: E2E covers critical user journeys; push detailed logic coverage to unit/integration tests.
2. **Selectors**: Prefer roles, labels, and test IDs over brittle CSS/XPath; avoid implementation-detail selectors.
3. **Determinism**: Control time (clocks), network, and data; avoid arbitrary `sleep`—use framework waits.
4. **Isolation**: Tests must not depend on order; reset app state or use disposable accounts/data per run.
5. **Environments**: Use dedicated staging or ephemeral envs; document required env vars and feature flags.
6. **Artifacts**: On failure, capture screenshots, traces, and videos per CI config.

## Deliverables

- One scenario per test with a clear Arrange–Act–Assert flow
- Stable setup/teardown documented in code or README
- CI-friendly retries only when root cause is understood

## Project-specific reference

For a **worked mapping** of E2E layers (smoke, JWT admin API, Shopify HMAC webhooks, Bull worker, Puppeteer cron/PDF) against the **`odd_node`** Express app, see **`reference/README.md`**.
