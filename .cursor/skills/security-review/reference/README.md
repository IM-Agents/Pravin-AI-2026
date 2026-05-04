# Security review reference — `odd_node`

This document maps **security-relevant behavior** in the Express + Shopify backend at `C:\Users\DELL\Downloads\odd_node` for audits, threat modeling, and hardening work. It is descriptive (what the code does) and prescriptive only where a pattern is clearly risky.

---

## Scope and trust boundaries

| Boundary | Mechanism |
|----------|-----------|
| **Admin API** | `src/middleware/verify.js` — JWT in **`Authentication`** (base64) or **`x-store-name`** header. |
| **Shopify webhooks** | Raw body **HMAC-SHA256** vs `x-shopify-hmac-sha256` (`app.js` mount on `/node/webhook`). |
| **Swagger UI** | Session cookie after login (`swaggerAuth.js`); local/dev may skip auth. |
| **Public / internal** | Many routes under `PREFIX` + `admin.routes.js` — treat as **backend API surface**, not “public internet” unless fronted by a gateway. |

---

## Deep levels — security review layers

### L0 — Configuration and secrets

- **`src/config/config.js`** mixes **`process.env`** with **hardcoded literals** (JWT-related constants, encryption material, OAuth client defaults, etc.).
- **Review action**: Prefer **all secrets from env** or a secret manager; rotate anything ever committed; remove default Google OAuth client IDs/secrets from source for production builds.

**Pattern to flag**: Any cryptographic or signing key that appears as a **string literal** in the repo.

### L1 — Transport and cookies

- **`app.js`**: `express-session` uses **`config.secret`** with a **fallback string** if unset; **`cookie.secure: false`** (comment notes HTTPS).
- **`cookieParser('secret')`** uses a **fixed literal** — signing/rotation implications for signed cookies.
- **Review action**: Enforce **HTTPS** in production; set **`secure: true`**, appropriate **`sameSite`**, and **strong random** session/cookie secrets from env.

### L2 — CORS and browser-facing headers

- **`cors`** with **`origin: *`** combined with **`Access-Control-Allow-Credentials: true`** and broad methods/headers (`app.js`).
- **Review action**: Tighten **allowed origins** to known admin/embedded app origins if browsers call this API directly; validate whether credentials + `*` is intentional (often **problematic** per CORS rules and security guides).

### L3 — Request size and DoS

- **`bodyParser`** JSON/urlencoded limits **50mb**, high **parameterLimit**.
- **Review action**: Lower limits on routes that do not need large payloads; use separate routers or per-route limits for uploads vs JSON APIs.

### L4 — XSS input sanitization

- **`express-xss-sanitizer`** with **`allowedKeys: ['html','body']`** — other keys sanitized by default.
- **Review action**: Ensure any rich-text/HTML fields expected by clients are either in **allowlist** or explicitly escaped on output; re-verify when adding new “HTML” fields.

### L5 — Security headers

- **`helmet()`** is applied globally (`app.js`).
- **Review action**: Confirm **Helmet** options match deployment (CSP, HSTS if terminating TLS on this service).

### L6 — Authentication (`verify.js`)

- **JWT**: Header **`authentication`** (lowercase) — value **base64-decoded** then **`jwt.verify(..., config.secret)`**. Claims populate **`res.locals`**.
- **`x-store-name` branch**: Loads store row via **`selectedRows(..., \`store_name = '${storeName}'\`)`** — **string interpolation into SQL**.
- **Review action (high priority)**: Use **parameterized queries** / bound parameters for `storeName`; validate **shop domain format** before DB lookup; consider **dropping** header-based auth or restricting to **internal** callers only.

### L7 — Authorization

- Middleware proves **identity** (token or store row); **per-route authorization** (whether `store_client_id` may access a resource) must be enforced in **controllers**, not only by obscurity.
- **Review action**: For each sensitive handler, confirm **store_client_id** (or equivalent) is checked against the **resource** being read or mutated.

### L8 — Webhooks

- **HMAC** verification on **raw body** before JSON handlers (`app.js`) — correct pattern for Shopify.
- **`APP_WEBHOOK_PREFIX`** stack includes optional **gatekeeper** logging of **full webhook payload** for specific shop domains — **data sensitivity** and **retention** should match policy.
- **Review action**: Ensure **idempotent** processing and **no secret leakage** in logs; restrict debug logging in production.

### L9 — File uploads (`src/middleware/upload.js`)

- **Multer** **memory** storage; **2MB** limit; **MIME allowlist** (images + PDF + doc types).
- **Review action**: Trust **content** not only MIME (magic bytes) for high-risk deployments; virus scanning if PDFs/docs are user-supplied; ensure **S3/Spaces** objects are **private** with signed URLs if exposed to users.

### L10 — Swagger UI (`swaggerAuth.js`)

- **Username/password** from **`config.SWAGGER_USERNAME` / `SWAGGER_PASSWORD`** (env-backed in config).
- **`NODE_ENV` local/development**: **`swaggerAuth`** may **skip** authentication — **never** expose that build to untrusted networks.
- **Review action**: Strong passwords in env; HTTPS-only; consider **IP allowlist** or removing Swagger from production.

### L11 — Background jobs and Redis

- **`src/include/redis_queue/connect_queue.js`**: Redis password from env.
- **Queue payloads** may contain **PII** from webhooks — **log statements** in processors should avoid writing full **jobData** to persistent logs in production.

### L12 — Operational automation (Puppeteer)

- **`src/cron/cron.js`**: Launches browser and navigates to **store URLs** derived from **data**. If an attacker could influence **`store_name`**, this is an **SSRF-style** concern.
- **Review action**: **Validate** domains against an allowlist (e.g. `*.myshopify.com` or known shop list); run with **least privilege** network egress.

### L13 — Dependency and supply chain

- **`package.json`** — no built-in `npm audit` in repo.
- **Review action**: Run **`npm audit`** / SCA in CI; pin versions; review **Puppeteer**, **axios**, **mysql** drivers periodically.

### L14 — Rate limiting and abuse

- No **`express-rate-limit`** (or similar) found in the scanned tree.
- **Review action**: Add **rate limits** on auth-heavy and webhook-adjacent routes at the **reverse proxy** or app layer.

---

## Example findings (illustrative, not an exhaustive audit)

| Severity | Topic | Location / note |
|----------|--------|-----------------|
| **Critical** | Hardcoded secrets / keys in `config.js` | Rotate; move to env; never log. |
| **High** | SQL built from `x-store-name` without parameterization | `verify.js` — use bound parameters. |
| **High** | CORS `*` + credentials | Revisit allowed origins. |
| **Medium** | Session `secure: false`, default cookie parser secret | Harden for production TLS. |
| **Medium** | 50mb JSON limit | Reduce default; scope per route. |
| **Low** | Swagger auth bypass in local | Document; ensure prod config differs. |

---

## Review workflow (practical)

1. **Inventory routes** touching **auth**, **files**, **webhooks**, **admin actions**.
2. **Trace** `verifyToken` and any **bypass** paths (`x-store-name`, cron, public GETs).
3. **Grep** for **SQL string concatenation** with user input (`${`, `+ req.`).
4. **Verify** webhook **HMAC** remains on the path for every Shopify topic.
5. **Scan** config and env samples for **literals** that should be secrets.
6. **Check** logs (`create_log_db`, `console`) for **tokens** and **payloads**.

---

## Relation to the `security-review` skill

Use the **checklist** in **`../SKILL.md`** for generic coverage; use **this README** when reviewing or hardening **`odd_node`** specifically.

---

## Maintenance

Update when **`verify.js`**, **`app.js` middleware**, webhook verification, or **`config.js`** secret handling changes.
