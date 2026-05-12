# Backend patterns reference — `reactnativeHub/node`

This document maps **server-side structure and data-access patterns** to the Express + MySQL app at `C:\Users\DELL\Downloads\reactnativeHub\node` (activity booking). Use it when extending this codebase or comparing it to layered service architectures.

---

## Process and entrypoints

| Entry | Role |
|-------|------|
| **`index.js`** | Single **HTTP** process: Express, CORS, body parsing, `morgan`, `responseHandler`, global error handler, static uploads, mounts **`routes`** under **`config.ADMIN_APP_PREFIX`**. |
| **`src/db/conn.js`** | Creates **two** `mysql` pools: **`mysqlPool`** (app data) and **`logMysqlPool`** (logging DB). |

**Pattern**: **One Node process** serves the API; `package.json` scripts use **pm2** / **nodemon** for the same entry. There is **no** separate worker file and **no** Bull/Redis queue dependency in this project (unlike some larger Express apps).

---

## Configuration

- **Environment**: `dotenv` loads **`src/config/.env_${process.env.NODE_ENV}`** from `index.js`.
- **Central module**: **`src/config/config.js`** — `PORT`, `secret`, **`db_config`** / **`db_log_config`**, table name constants (`CUSTOMER_TABLE`, `BOOKING_TABLE`, `FINANCE_TABLE`, …), payment/SMS/bucket/FCM settings.

**Pattern**: Feature code should read **`config`** and table aliases from **`config`** rather than hard-coding table names in many places (controllers already import `config` for table names).

---

## Layering (actual shape)

| Layer | Location | Notes |
|-------|----------|--------|
| **HTTP routes** | `src/routes/*.js` | Thin: map paths to **`usersController`** methods; **`admin_verify`** applied mid-file for “protected” routes. |
| **Controllers** | `src/controller/usersController.js` | **Very large** — orchestrates validation, SQL (via helpers + raw strings), payments, email, uploads, OAuth helpers in **`common.js`**. |
| **“Services”** | Not a separate `services/` tree | Heavy logic lives in **`usersController.js`** and **`src/utils/common.js`** (email HTML, Puppeteer, external HTTP, token helpers). |
| **Data access** | `src/db/functions.js` | Shared **`query`**, **`selectedRows`**, **`insert`**, **`update`**, **`selectResults`**, **`getTotalData`**, etc. |
| **Validation** | `src/utils/validateRequest.js` + `src/utils/validation/*.js` | Joi schemas; controllers call **`validateParamsWithJoi`** before business logic. |

**Pattern**: **Fat controller + thin routes + shared DB helpers** — not a classic 3-layer “controller → service → repository” split. New complex flows tend to grow **`usersController.js`** unless you deliberately extract modules.

---

## Database access

- **Driver**: **`mysql`** package with **connection pools** (`conn.js`).
- **Primary API**: **`query(sql)`** — Promise wrapper around `mysqlPool.query`; on failure, logs via **`create_log_db`** and rejects.
- **Helpers**:
  - **`selectedRows`**: single row or `false`; builds SQL with **`getWhereCondition`**.
  - **`selectResults`**: list queries with optional `ORDER BY`, `GROUP BY`, `LIMIT`/`OFFSET`.
  - **`insert` / `update`**: build SQL from objects; **`htmlSpecialCharacterEncode`** on string values in helpers.
  - **`insertOnDuplicateUpdate`**, **`deleteData`**, **`check_exists`**, **`getTotalData`** for counts.

**String SQL in controllers**: Many handlers pass **WHERE clauses and fragments as template strings** built from `req` data (alongside parameterized **`query(..., [values])`** in some paths). That is a **backend pattern** this repo uses heavily; tightening it would mean **parameterized queries** everywhere.

---

## Transactions

- **`queryTransaction(query, connection, value)`** in **`functions.js`** runs a query on a **passed-in `connection`** (for use inside a transaction).
- There is **no** `beginTransaction` / `commit` / `rollback` wrapper in the scanned tree; **`queryTransaction` is exported** but multi-step atomic flows are **not** the dominant pattern—most operations use **autocommit** **`query()`** calls.

**Pattern**: If you need **ACID** multi-statement flows, introduce an explicit **`getConnection` → beginTransaction → commit/rollback`** helper and use **`queryTransaction`** for each step, or use a small transaction module—**not** yet established here.

---

## Logging and observability

| Mechanism | Where | Role |
|-----------|--------|------|
| **`create_log_db(table, payload)`** | `functions.js` | Inserts into **`logMysqlPool`** (or **local** file logs when `config.MODE === 'local'` via **`create_log`**). |
| **`create_log` (filesystem)** | `functions.js` | Dated files under **`logs/<directory>/`**. |
| **`morgan('dev')`** | `index.js` | HTTP access logging to stdout. |
| **`console.log`** | e.g. `selectedRows` | SQL echo in some paths — noisy in production. |
| **Controller catch blocks** | `usersController.js` | Often **`create_log_db(config.GENERAL_LOG_TABLE, { type, message/log })`** plus **`res.failureResponse`**. |

**Pattern**: **Dual sink** — structured rows in **log DB** + optional **file** logs locally; correlation IDs across requests are **not** standardized in the snippets reviewed.

---

## Authentication helpers (backend)

- **`common.generateToken`** (`src/utils/common.js`): **`jwt.sign`** with **`process.env.secret`**, **`expiresIn: '30d'`** — returns `{ token }`.
- **Passwords**: **`getEncryptDecryptData`** / **`encryptDecrypt`** in **`functions.js`** and **`bcrypt`** in **`common.js`** (`hashPassword`) — mixed approaches may exist by flow.
- **Middleware**: **`admin_verify.js`** decodes **`authentication`** header and verifies JWT; sets **`res.locals.id`**.

---

## External I/O (integrations)

- **HTTP**: **`axios`** used from controllers / **`common.js`** (payment, OAuth, etc.).
- **Email**: **`nodemailer`** in **`common.js`**.
- **Files / cloud**: **`aws-sdk`** + **`uploadimg.js`** for uploads; config exposes bucket fields.
- **PDF / screenshots**: **`puppeteer`** referenced from **`common.js`**.
- **Google**: **`google-auth-library`**.

**Pattern**: Side effects (email, payment provider, S3) are **invoked from controller/common** paths—plan retries and **idempotency** at the **handler** level for webhooks (e.g. payment callbacks) since there is **no** queue abstraction in-repo.

---

## Dead / legacy helpers

- **`getStoreData` / `prepareData`** in **`functions.js`** reference **Shopify-style** store tables (e.g. **`CLIENT_STORES_TABLE`**); they are **not** referenced elsewhere in this project’s `src` tree. Treat as **carryover** unless you wire them intentionally.

---

## Deep levels — backend checklist for this repo

| Level | Focus |
|-------|--------|
| **L0** | **Single process** — scaling is horizontal replicas of **`index.js`**, not separate worker roles. |
| **L1** | **Two MySQL pools** — app vs log; **`MODE=local`** switches log behavior to **files**. |
| **L2** | **Fat `usersController`** — new domain logic risks file size; consider extracting **modules per domain** when adding features. |
| **L3** | **DB helpers** — prefer extending **`functions.js`** for reusable queries vs duplicating SQL strings. |
| **L4** | **Transactions** — rare in practice; add explicit transaction boundaries for money/booking invariants. |
| **L5** | **SQL construction** — mix of helpers and **inline string SQL**; long-term, push toward **parameters** to reduce injection and quoting bugs. |
| **L6** | **Secrets** — `config.secret`, DB passwords, API keys from **env**; avoid logging **`req.body`** for payment routes in production. |
| **L7** | **No queue** — retries for external APIs must be **coded** (or add a queue library later). |
| **L8** | **Observability** — **`create_log_db`** + **morgan**; add request IDs if you need cross-service tracing. |

---

## Anti-patterns when extending this backend

- Growing **`usersController.js`** without splitting when a feature has clear boundaries (bookings vs auth vs CMS).
- Assuming **multi-query** operations are atomic without **`BEGIN`/`COMMIT`**.
- Adding **Redis/Bull** without documenting deployment (second process, env) — this repo currently does **not** depend on them.

---

## Relation to the `backend-patterns` skill

Use **`../SKILL.md`** for generic guidance (layers, transactions, queues, caching). Use **this README** for **how this project actually behaves** (monolith controller, dual DB pools, logging, absence of a job worker).

---

## Maintenance

Update when **`conn.js`** pool strategy, **`create_log_db`** behavior, major **`functions.js`** helpers, or deployment model (e.g. adding a worker) changes.
