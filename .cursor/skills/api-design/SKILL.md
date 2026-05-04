---
name: api-design
description: >-
  REST and HTTP API design — versioning, resources, errors, pagination, idempotency,
  and OpenAPI-style contracts. Use when designing or reviewing APIs, defining routes,
  or documenting request/response shapes.
---

# API design

## When to activate

- Designing new HTTP APIs or extending existing ones
- Reviewing API consistency (naming, status codes, error format)
- Writing or updating OpenAPI/Swagger specs
- Choosing between REST conventions, webhooks, or RPC-style endpoints

## Principles

1. **Resources**: Prefer noun-based paths (`/users`, `/users/{id}`); use HTTP verbs for actions on resources.
2. **Versioning**: Put version in the URL prefix (`/v1/...`) or header—match the project’s existing pattern.
3. **Errors**: Return stable, machine-readable bodies (`code`, `message`, optional `details`); use correct 4xx/5xx codes.
4. **Pagination**: Use cursor or offset/limit consistently; document limits and defaults.
5. **Idempotency**: Use `Idempotency-Key` (or project equivalent) for unsafe retries where duplicates are costly.
6. **Security**: Authenticate and authorize on the server; never rely on obscurity; validate all inputs.

## Deliverables

- Clear route list and method semantics
- Request/response schemas (JSON Schema or OpenAPI)
- Example success and error payloads
- Deprecation policy if replacing endpoints

## Project-specific reference

For **`odd_node`**: **`/node/admin_api`** prefix, OpenAPI 3 + JSDoc, **`status`/`message`/`data`** JSON envelope, webhook vs admin auth, redirects and non-JSON responses — see **`reference/README.md`**.
