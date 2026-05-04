# E2E reference — `odd_node`

This reference reflects the **Express + Shopify** backend at `C:\Users\DELL\Downloads\odd_node`. It describes **what exists in that repo today**, how **browser automation** is used, and how to think about **end-to-end coverage** at multiple depths if you add a formal test runner (Playwright, Cypress, or API/webhook integration tests).

---

## What the project has today

| Area | In repo |
|------|--------|
| Playwright / Cypress / Jest / Vitest | **Not present** — no `test` script, no `*.spec.js` / `*.test.js` files |
| **Puppeteer** | **Yes** — used in application code, not as a dev E2E suite |
| Express routes | Yes — `app.js` mounts `routes` under `config.PREFIX` (from env) |
| Shopify webhooks | Yes — HMAC-verified JSON under `/node/webhook` and handlers under `APP_WEBHOOK_PREFIX` (default `/node/webhook`) |
| Bull / Redis worker | Yes — `worker.js` loads `src/include/redis_queue/processors` separately from `app.js` |
| Swagger UI | Yes — `/api-docs` behind `swaggerAuth` |

So “E2E” for this codebase is a **layered** concept: health and API contracts, webhook signatures, async workers, and optional **browser** flows. The only in-repo browser automation is **Puppeteer inside cron/admin flows**, described below.

---

## Deep levels of E2E (mapped to this architecture)

Use this as a checklist when designing tests. Lower layers run faster; higher layers cover more of the real stack.

### Level 0 — Process / config

- App boots with `NODE_ENV` and `src/config/.env_<NODE_ENV>` (see `app.js`).
- MySQL via `src/db/conn.js`, Redis/Bull for queues, Shopify API context in `app.js`.
- **E2E implication**: tests need the same env files or a test-specific env; worker tests may require a second process (`worker.js`) or a test harness that imports processors.

### Level 1 — Smoke (HTTP)

- **`GET /`** returns JSON: `{ message: 'test API successfully configured' }` (`app.js`).
- **E2E example (conceptual)**:

```http
GET http://localhost:<PORT>/
```

Assert status `200` and body shape. No auth.

### Level 2 — Admin API (authenticated)

- Routes live under **`config.PREFIX`** → `src/routes/index.js` mounts `admin.routes.js`.
- **`src/middleware/verify.js`**: JWT in header **`Authentication`** (value is **base64-encoded** JWT string) **or** header **`x-store-name`** (looks up store in DB).
- **E2E implication**: “API E2E” = HTTP client + valid token or test store row for `x-store-name`. This is **integration/E2E for the API**, not a browser.

Example shape (pseudocode — replace host, path, and token generation with your project helpers):

```js
// Pseudocode: call an admin route with JWT
const res = await fetch(`${BASE}${PREFIX}/admin_api/...`, {
  headers: {
    Authentication: Buffer.from(jwtString, 'utf8').toString('base64'),
    'Content-Type': 'application/json',
  },
});
```

Paths and verbs are defined in `src/routes/admin.routes.js` (large file; search by handler name when wiring real tests).

### Level 3 — Shopify webhooks (HMAC contract)

- First webhook mount (`app.js`): raw body verification with **`x-shopify-hmac-sha256`** vs HMAC-SHA256 of the body using `config.SHOPIFY_SECRETE_API_KEY`.
- Topics and flow: `src/webhook/index.js` and handlers under `src/webhook/`.
- **E2E implication**: build the **exact raw body** used for signing, compute HMAC in the test, send headers Shopify would send (`x-shopify-topic`, etc.). Wrong body serialization breaks the signature.

```js
// Pseudocode: HMAC matches Express raw body verification
const crypto = require('crypto');
const rawBody = Buffer.from(JSON.stringify(payload));
const hmac = crypto
  .createHmac('sha256', SHOPIFY_API_SECRET)
  .update(rawBody)
  .digest('base64');
// POST with headers['x-shopify-hmac-sha256'] = hmac, same raw bytes as body
```

This validates the **full HTTP + crypto path** for webhooks.

### Level 4 — Worker / queue (async E2E)

- **`worker.js`** runs Bull processors; **`app.js`** notes queues are **not** in the API process.
- **E2E implication**: enqueue a job (or trigger the code path that enqueues), run worker in test, assert DB side effects or mock external APIs. This is **async E2E**: two processes or a test entry that `require`s processors.

### Level 5 — Swagger UI (session + browser)

- Routes: `/api-docs/login`, `/api-docs/logout`, protected `/api-docs` (`swaggerAuth`).
- **E2E implication**: Playwright/Cypress can log in through the login page and assert Swagger loads — only if you enable this in a test environment.

### Level 6 — Browser automation already in the repo (Puppeteer)

This is **not** a Playwright test suite; it is **production/cron** behavior that uses a real browser.

#### A) Cron: storefront visit, screenshot, DOM inspection

**File**: `src/cron/cron.js` — `updateCompitatorAppValue`.

- Launches Chromium via **`puppeteer.launch`** (headless in non-local env; local may use `headless: false`).
- For each DB row: **`page.goto(`https://${store_name}/`)`**, screenshot to `screenshot/<store>.jpg`, reads **`page.content()`**, runs **`page.evaluate`** to collect script URLs from Shopify CDN extension scripts, detects competitor app markers from Google Sheet–driven id/class keys.
- Updates MySQL (`compitator_app`, etc.).

**Testing angle**: if you need to guard this flow, use **staging stores**, **controlled sheet data**, and assert **DB updates** after a trigger — or extract the pure parsing logic into a unit-tested function and keep one **smoke** Puppeteer test in CI (expensive).

#### B) Admin: HTML → PDF

**File**: `src/controllers/admin.js` — packing slip PDF (search for `printPackingSlip` / `page.pdf`).

- **`page.setContent(htmlContent, { waitUntil: 'networkidle0' })`** then **`page.pdf(...)`**.
- No navigation to external URLs; **headless rendering** of HTML string.

**Testing angle**: snapshot PDF bytes or hash in a controlled test, or assert HTTP `200` + `Content-Type: application/pdf` for a fixed HTML input.

---

## Example: future Playwright project layout (aligned with this backend)

If you add Playwright **next to** `odd_node` (or in a `tests/e2e` folder), typical layout:

```
odd_node/
  tests/
    e2e/
      smoke.spec.ts          # GET /
      admin-api.spec.ts      # fetch + JWT or x-store-name
      webhook-order.spec.ts  # HMAC POST
  playwright.config.ts
```

- **Base URL**: tunnel or local `HOST_url` / `PORT` from env.
- **Secrets**: never commit `.env_*`; CI injects `SHOPIFY_API_SECRET`, DB, etc.
- **Data**: use a dedicated Shopify dev store and test DB rows for `x-store-name` flows.

---

## Anti-patterns for this stack

- Relying on **UI-only** checks for Shopify app security (server must enforce auth — see `verify.js`).
- Webhook tests that send **parsed JSON** without matching the **raw body** used for HMAC.
- Running **Puppeteer cron logic** in CI against **production** storefronts (rate limits, ToS, flakiness).
- **Sleep**-based waits instead of Playwright **`expect.poll`** / **`waitForResponse`** / webhook completion.

---

## Related files in `odd_node` (quick map)

| Concern | Location |
|---------|----------|
| App entry, CORS, session, Shopify init | `app.js` |
| Route prefix | `src/config/config.js` → `PREFIX` |
| Admin routes | `src/routes/admin.routes.js` |
| JWT / store header auth | `src/middleware/verify.js` |
| Webhook HMAC + handlers | `app.js`, `src/webhook/` |
| Worker | `worker.js`, `src/include/redis_queue/` |
| Puppeteer cron (storefront) | `src/cron/cron.js` |
| Puppeteer PDF | `src/controllers/admin.js` |

---

## How this ties to the `e2e-testing` skill

Use the **principles** in `../SKILL.md` (selectors, isolation, flakes). Use **this README** when working on **Shopify + Express + Redis** backends like `odd_node`: prioritize **API + webhook + worker** E2E before heavy browser suites, and treat in-repo **Puppeteer** as **operational browser automation** with optional targeted automated checks—not as a substitute for a structured Playwright/Cypress test folder unless you add one.

---

## Maintenance

Update this file when `odd_node` gains a real test runner (npm `test` script, `tests/e2e`, etc.) or when webhook routes or auth middleware change.
