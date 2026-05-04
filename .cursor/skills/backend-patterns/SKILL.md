---
name: backend-patterns
description: >-
  Server-side patterns — layering, transactions, jobs/queues, caching, and data access.
  Use when implementing or refactoring backend services, workers, or database code.
---

# Backend patterns

## When to activate

- Structuring services, repositories, or handlers
- Database transactions, retries, and concurrency
- Background jobs, queues, and scheduled work
- Caching layers and invalidation
- Observability (logging, metrics, tracing) for server code

## Principles

1. **Layers**: Keep HTTP/handlers thin; put domain logic in testable modules; isolate I/O (DB, queues, external APIs).
2. **Transactions**: Scope transactions to a single use case; avoid long-held locks; handle deadlocks with bounded retries when appropriate.
3. **Errors**: Map domain errors to HTTP or message responses; log with correlation IDs; preserve `cause` when wrapping.
4. **Queues**: Make consumers idempotent; use explicit retry/backoff policies; dead-letter poison messages.
5. **Caching**: Key naming, TTLs, and invalidation must be explicit; beware stale reads on writes.
6. **Secrets**: Load from env or secret managers; never log secrets.

## Deliverables

- Clear module boundaries and dependency direction
- Documented failure modes and retry behavior
- Tests at domain and integration boundaries (with project test stack)

## Project-specific reference

For a **layered walkthrough** (Express middleware, admin routes + JWT, MySQL helpers, Shopify webhooks, Bull enqueue + worker processors, logging) mapped to the **`odd_node`** codebase, see **`reference/README.md`**.
