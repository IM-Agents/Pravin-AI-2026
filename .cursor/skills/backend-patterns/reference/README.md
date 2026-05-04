# Backend patterns reference — `odd_node`

This document maps **layered backend patterns** to the Express + Shopify app at `C:\Users\DELL\Downloads\odd_node`. Use it when refactoring or extending that codebase (or similar Node stacks).

---

## Process and entrypoints

| Entry | Role |
|-------|------|
| **`app.js`** | HTTP API: Express, middleware, Shopify API context, admin routes, raw webhook HMAC mount, JSON webhook router, health route, Swagger UI. |
| **`worker.js`** | **Separate process**: loads env (`src/config/.env_<NODE_ENV>`), DB pool, then **`src/include/redis_queue/processors`** only. No Express. |

**Pattern**: **API and queue consumers are split** so API restarts do not kill in-flight Bull jobs (`app.js` comment). Any change to job processing must be deployed with **both** processes in mind.

---

## Configuration

- **Environment**: `dotenv` loads **`src/config/.env_${process.env.NODE_ENV}`** (see `app.js`). `worker.js` also resolves `NODE_ENV` / `SERVER`.
- **Central config**: **`src/config/config.js`** — `PREFIX`, DB pools, Shopify keys, table names, `APP_WEBHOOK_PREFIX` (default `/node/webhook`), message strings, etc.

**Pattern**: Single config module; feature code reads **`config`** instead of scattering `process.env` (with exceptions in queue Redis env in `connect_queue.js`).

---

## HTTP middleware stack (order matters)

Rough order in **`app.js`**:

1. `cors`, `cookieParser`, `express-session` (Swagger login).
2. **`helmet`**, **`bodyParser.json/urlencoded`** (large limits).
3. **`express-xss-sanitizer`** with `allowedKeys: ['html','body']`.
4. **`responseHandler`** — attaches **`res.ok`**, **`res.badRequest`**, **`res.unAuthorizedRequest`**, etc., each ending DB pool via **`endPool()`** (see below).
5. Custom CORS headers middleware.
6. JSON **`SyntaxError`** → `badRequest`.
7. **`routes`** → `PREFIX` + admin router.
8. **`/node/webhook`** — raw body + HMAC verification **before** parsed handler chain.
9. **`APP_WEBHOOK_PREFIX`** + optional gatekeeper logging + **`src/webhook/index`** router.
10. **`GET /`** health.
11. **`/api-docs`** Swagger (session auth middleware).

**Pattern**: Security and parsing **before** business routes; webhooks get **dedicated** body verification for HMAC.

---

## Response and database pool coupling

**`src/utils/responseHandler.js`** attaches helpers that call **`endPool()`** from **`src/db/conn.js`** on every response path.

**Pattern**: Request-scoped lifecycle ties **HTTP response** to **pool teardown** — unusual vs “pool stays open”; important when debugging connection behavior or adding middleware that responds without going through these helpers.

---

## Routing layout

- **`src/routes/index.js`**: `router.use(config.PREFIX, admin)` — all admin API lives under env **`PREFIX`** (e.g. `/node`).
- **`src/routes/admin.routes.js`**: Large **`express.Router()`** — mixes Swagger comments, **`verifyToken`** on protected routes, and public routes (e.g. some exports, `shop_info` install).

**Pattern**: **Fat route file** + **controller require from `../controllers/index`** — new routes should stay consistent (middleware order: `verifyToken` before handler).

---

## Authentication

**`src/middleware/verify.js`**:

- **`Authentication` header**: base64-encoded JWT; verified with **`config.secret`**; sets **`res.locals`** (`store_client_id`, `store_name`, `shop_token`, etc.).
- Else **`x-store-name`**: DB lookup for store row, then same locals.

**Pattern**: **Two auth paths** for admin API; handlers assume **`res.locals`** is populated when `verifyToken` runs.

---

## Controllers and services

- **`src/controllers/index.js`** re-exports: `admin`, `generate_token`, `install`, `partner`, `featureRequest`, `googleCalendar`, `integration`, `cron`, etc.
- **`src/controllers/admin.js`**: Very large — mixes HTTP handlers, Shopify calls, PDF (Puppeteer), and DB.
- **`src/services/*.js`**: Domain-heavy modules (e.g. **`order_create_service.js`**) — long scripts with helpers, **`db.query`**, **`create_log_db`**, external HTTP.

**Pattern**: **Service modules** hold bulk business logic; **controllers** orchestrate and respond. In practice, boundaries blur in large controller files — prefer **new** code in small modules + thin handlers when you touch this repo.

---

## Validation

- **`src/utils/validateRequest.js`**: **Joi** via **`validateParamsWithJoi(payload, schemaKeys)`** — returns `{ isValid, message | value }`.
- Additional validation may live in **`src/utils/validation/`** (e.g. admin/user schemas).

**Pattern**: Validate at the edge of HTTP handlers; keep Joi schemas next to domain or under `validation/`.

---

## Data access

- **`src/db/conn.js`**: Two **mysql** pools — **`mysqlPool`** (app data) and **`logMysqlPool`** (logging DB). **`connectPool()`** / **`endPool()`** exported.
- **`src/db/functions.js`**: Large helper surface — **`query`** (promisified), **`insert`**, **`update`**, **`selectedRows`**, **`getApiList`** (Shopify Admin API), **`create_log_db`**, **`addJobToQueue`**, encryption helpers, etc.

**Pattern**: **Shared DB helpers** rather than a strict repository per aggregate; **`getWhereCondition`** builds SQL `WHERE` from objects (watch for SQL injection — project uses string concatenation in places; new code should use parameterized queries consistently).

---

## Shopify integration

- **`@shopify/shopify-api`**: **`Shopify.Context.initialize`** in **`app.js`** (embedded app, memory session storage).
- **`getApiList`** and helpers in **`db/functions.js`** / services call Admin API with shop tokens from DB.

**Pattern**: Store-scoped tokens in DB; resolve store context via helpers like **`resolveStoreContext`** in services.

---

## Webhooks: verify → enqueue → process

### 1. Signature verification

**`app.js`** mounts **`/node/webhook`** with **`express.json({ verify })`** so the **raw buffer** is HMAC-SHA256’d with **`SHOPIFY_SECRETE_API_KEY`** and compared to **`x-shopify-hmac-sha256`**.

### 2. Gatekeeper middleware

Under **`APP_WEBHOOK_PREFIX`**, optional logging to **`create_log_db`** for specific dev stores (see `app.js`) — then **`webhook_path`** router.

### 3. HTTP handler (example: orders)

**`src/webhook/order_create.js`**:

- Builds **`data`** `{ body, query, headers, webhook_topic }`.
- **`db.addJobToQueue(order_create_queue, data)`** — Bull **`queue.add`** with retries/backoff (`src/db/functions.js`).
- If enqueue returns a job id → **`200` + `'OK'`**.
- Else **fallback**: run **`order_create`** handler **inline** (direct execution path).

**Pattern**: **Resilience**: Redis down → synchronous fallback so Shopify still gets a response; idempotency and duplicate handling must be correct in the handler.

### 4. Worker processing

**`src/include/redis_queue/processors/index.js`**:

- **`queueHandlerMap`**: queue name → **`webhook_functions`** handler (e.g. `order_create`).
- **`setupProcessor`**: **`queue.process`** → **`handler({ data: job.data }, () => true)`**; logs **`completed`**, **`failed`**, **`error`**, **`stalled`**.

**Pattern**: **One processor map** registers all webhook queues; logging uses **`GENERAL_LOG_TABLE`** with structured JSON.

### 5. Queue configuration

**`src/include/redis_queue/connect_queue.js`**: **`bull`** + Redis; **attempts**, **exponential backoff**, **lockDuration** (long for order work), **stalledInterval**, **maxStalledCount**.

---

## Cross-cutting: logging

- **`create_log_db(table, payload)`** in **`db/functions`**: inserts into log DB (or file log in `local` mode).
- Webhooks log enqueue errors, queue lifecycle, and handler errors with **`type`** / **`source`** fields.

**Pattern**: Use **structured JSON strings** in `log` column for grep/debug; correlate with **`x-shopify-webhook-id`** where available.

---

## Cron and scheduled-style endpoints

- **`src/cron/cron.js`**: Google Sheets, **Puppeteer** for storefront automation, DB batch updates — invoked from controllers/routes (e.g. **`admin_router.get('/cron/shop-info-remove', ...)`** in **`admin.routes.js`**).
- **`src/controllers/cron.js`**: HTTP entry for at least one cron-style operation.

**Pattern**: **Operational** endpoints — protect with auth or secret query/header in production; long-running work may need timeouts and monitoring separate from normal API SLAs.

---

## External systems (representative)

- **AWS S3 / SES** (deps in `package.json`).
- **Google APIs** (Calendar, Sheets — see `cron` / `googleCalendar`).
- **Bull + Redis** for async webhooks.
- **Puppeteer** for PDF and cron browser tasks (not the HTTP server core).

---

## Deep “levels” summary

| Level | What it is in `odd_node` |
|-------|---------------------------|
| **L0** | Process model: **`app.js`** vs **`worker.js`**. |
| **L1** | Global middleware: security, body size, XSS sanitizer, response helpers. |
| **L2** | Routing: **`PREFIX`**, admin router, Swagger. |
| **L3** | Auth: **`verifyToken`**, JWT / `x-store-name`. |
| **L4** | Controllers + services: HTTP vs domain modules. |
| **L5** | Data: MySQL pools, **`db/functions`**, Shopify API helpers. |
| **L6** | Webhooks: HMAC → router → enqueue or fallback → worker processors. |
| **L7** | Queues: Bull config, retries, stalled job handling, logs. |
| **L8** | Observability: **`create_log_db`**, queue events. |
| **L9** | Integrations: AWS, Google, Puppeteer, etc. |

---

## Example: mental model for a new admin endpoint

1. Add route under **`admin.routes.js`** with **`verifyToken`** if authenticated.
2. Implement handler in a **small controller function** or **service** module; use **`res.ok` / `res.badRequest`** from **`responseHandler`**.
3. Use **`db.query`** / helpers with **bound parameters** for new SQL.
4. If calling Shopify, follow existing **`getApiList`** / token resolution patterns.
5. If enqueueing work, use **`addJobToQueue`** + register processor if new queue (requires **`queue/index`**, **`webhook_functions`**, **`processors/index`** map).

---

## Anti-patterns to avoid when extending this repo

- Adding **business logic** only inside **`admin.routes.js`** (keep routes declarative).
- **New webhooks** without **HMAC raw body** path or without **idempotent** handler behavior.
- **Logging secrets** (tokens, keys) inside **`create_log_db`** payloads.
- Assuming **one process** handles both HTTP and Bull — **worker must run** for queued jobs.

---

## Maintenance

Refresh this document when **`app.js` middleware order**, **webhook paths**, **queue names**, or **worker entry** change.
