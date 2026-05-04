# API design reference — `odd_node`

This document describes **HTTP API shape and conventions** in the Express app at `C:\Users\DELL\Downloads\odd_node`: URL layout, OpenAPI, response envelopes, webhooks, and how they differ from textbook REST. Use it when adding routes or aligning clients (e.g. the embedded admin UI).

---

## URL topology

| Surface | Base path | Notes |
|---------|-----------|--------|
| **Admin JSON API** | **`PREFIX`** from env — typically **`/node/admin_api`** (see `src/config/.env_*`) | Mounted in `src/routes/index.js` as `router.use(config.PREFIX, admin)`. |
| **Shopify webhooks** | Raw **HMAC** verify: **`/node/webhook`**; handlers: **`APP_WEBHOOK_PREFIX`** (default **`/node/webhook`**) + topic paths in `src/webhook/index.js` | See `app.js`. |
| **Health** | **`GET /`** | Simple JSON smoke response. |
| **OpenAPI UI** | **`/api-docs`** (session-protected outside local) | `swagger-ui-express` + `src/config/swagger.js`. |

There is **no `/v1` URL version segment**; evolution is by **adding fields** or **new paths** under the same prefix.

---

## OpenAPI (Swagger)

- **`swagger-jsdoc`** builds **OpenAPI 3.0** from JSDoc blocks on **`admin.routes.js`** (and related files).
- **`src/config/swagger.js`** sets **`info`**, **`servers`** (local, dev, stage, prod URLs), **`components.securitySchemes.apiKeyAuth`** — header **`Authentication`**, described as base64 JWT from **`POST …/shop_info`**.
- Schemas (e.g. **`Error`**, **`Success`**, filter objects) live under **`components.schemas`**.

**Pattern**: New routes should get **matching JSDoc** so Swagger stays the **contract** for internal and partner consumers.

---

## Authentication model (HTTP)

- **Primary**: Header **`Authentication`** — value is **base64-encoded JWT** (`verify.js`, Swagger).
- **Alternate**: **`x-store-name`** for selected flows (same middleware file) — must stay aligned with **validation** and **authorization** in controllers.
- **Webhooks**: **Not** JWT — **HMAC** over **raw body** with Shopify shared secret (`app.js`).

**Pattern**: Document **two families**: **admin API** (JWT / store header) vs **Shopify webhook** (HMAC + topic headers).

---

## Response envelope (JSON)

**`src/utils/messages.js`** + **`responseHandler`** attach **`res.ok`**, **`res.badRequest`**, etc. Core JSON shape:

```text
{ "status": "<STRING>", "message": "<string>", "data": <object|array> }
```

- **`status`** values include **`SUCCESS`**, **`BAD_REQUEST`**, **`UNAUTHORIZED`**, **`ACCESS_FORBIDEN`** (spelling as in code), **`FAILURE`**.
- HTTP status from **`src/utils/responseCode.js`** (200, 204, 400, 401, 403, 404, 422, 500 — not all may be wired through helpers).

**Pattern**: Clients should key off **`status`** + HTTP code; **`data`** may be **`[]`** when empty (check `messages.js` empty-data logic).

---

## Methods and naming (pragmatic, not strict REST)

- Paths are often **kebab-case** segments (`/google-calendar/settings`, `/order-listing`) or **action-oriented** (`/order-update`, `/delete-order`).
- **Verbs** mix **GET** reads, **POST** creates/updates, **PUT**/`DELETE` where used — **not** a uniform resource-only model.
- **Shop install / token**: **`POST /shop_info`** (naming reflects legacy behavior).

**Pattern**: New endpoints should **mirror** existing **segment style** and **verb** usage in the same file to avoid client confusion.

---

## Non-JSON responses

- **Billing**: e.g. **`/charge_create`** may **302** to Shopify — clients must follow redirects.
- **CSV export**: e.g. **`GET …/order-export`** — `text/csv` / download semantics (see Swagger on that route).
- **PDF**: e.g. **`print-packing-slip`** — `application/pdf` stream from Puppeteer output.

**Pattern**: Do not assume **JSON** for every path; document **Content-Type** and **status 302** in OpenAPI where applicable.

---

## GraphQL

- **`POST /graphql`** (or path per `admin.routes.js` / Swagger) proxies Admin API GraphQL — treat as **opaque query** surface with same **auth** expectations as other admin routes.

---

## Webhook API design

- **Ingress**: **`POST`** paths such as **`/orders_create`**, **`/shop_update`**, **`/app_uninstalled`** (see `src/webhook/index.js`).
- **Response**: Often **`200`** with body **`OK`** after enqueue (`order_create.js` pattern) or handler result — **Shopify** expects timely **2xx**.
- **Payload**: Shopify JSON; **idempotency** handled in workers, not always at HTTP layer.

**Pattern**: Webhook handlers should **fail fast** with correct status if HMAC invalid; **business failures** after accept may use **queues + retries** (`addJobToQueue`).

---

## Pagination and filters (typical patterns)

- List endpoints (e.g. **order listing**) usually take **query parameters** for filters, sort, and page — exact names are defined per handler and **Swagger** blocks.
- **Review action**: When adding lists, **reuse** parameter naming style already used on **order** and **dashboard** routes (avoid one-off names).

---

## Validation

- **Joi** via **`src/utils/validateRequest.js`** (`validateParamsWithJoi`) and schemas under **`src/utils/validation/`**.
- **Pattern**: Request bodies for new **POST/PUT** should have **Joi** schemas and **clear error messages** mapped to **`res.badRequest`**.

---

## Deep levels — API design checklist for this repo

| Level | Focus |
|-------|--------|
| **L0** | **Prefix** (`/node/admin_api`) vs **webhook** vs **root** — never confuse three mounts. |
| **L1** | **OpenAPI** — keep JSDoc + `swagger.js` **servers** accurate per environment. |
| **L2** | **Auth** — document **Authentication** vs webhook **HMAC** in specs and runbooks. |
| **L3** | **Envelope** — preserve **`status` / `message` / `data`** for JSON APIs. |
| **L4** | **HTTP semantics** — use **401/403/400/500** consistently via helpers. |
| **L5** | **Redirects & binary** — charge and export flows are **not** JSON-only. |
| **L6** | **Idempotency** — webhooks and **queue** retries; design handlers to tolerate duplicates. |
| **L7** | **Backward compatibility** — additive JSON fields preferred over breaking path changes without version bump strategy. |
| **L8** | **Errors** — stable **`message`** strings for UI mapping; avoid leaking stack traces in responses (log server-side). |

---

## Anti-patterns when extending this API

- Introducing a **second** JSON envelope shape alongside **`messages.js`** without a migration plan.
- New **admin** routes **without** Swagger JSDoc when other routes in the file are documented.
- **GET** endpoints with **side effects** (cache refresh, mutations) — conflicts with HTTP semantics and caches.
- Webhook routes that **200** before **persisting** a durable idempotency key when duplicates are costly.

---

## Relation to the `api-design` skill

Use **`../SKILL.md`** for generic REST/OpenAPI guidance; use **this README** for **concrete `odd_node` conventions** (prefix, envelope, Swagger auth, webhooks).

---

## Maintenance

Update when **`PREFIX`**, **`APP_WEBHOOK_PREFIX`**, **`messages.js`** envelope, or **Swagger `servers`** / security scheme changes.
