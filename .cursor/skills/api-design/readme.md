# API design reference — `reactnativeHub/node`

This document describes **HTTP API shape and conventions** in the Express app at `C:\Users\DELL\Downloads\reactnativeHub\node`: base URL, routing layers, auth, JSON envelopes, validation, and pragmatic naming. Use it when adding routes or aligning mobile/web clients.

---

## URL topology

| Surface | Base path | Notes |
|---------|-----------|--------|
| **App JSON API** | **`ADMIN_APP_PREFIX`** from env (see `src/config/.env_*` and `config.ADMIN_APP_PREFIX`) | Mounted in `index.js` as `app.use(config.ADMIN_APP_PREFIX, routes)`. All feature routes in `src/routes/user.routes.js` are relative to this prefix. |
| **Static uploads** | **`/node/uploads`** | `express.static` for uploaded assets (`index.js`). |
| **Dev/test** | **`POST /test`** | Outside the prefixed router; echoes body via `res.ok` (`index.js`). |

There is **no `/v1` URL version segment** in code; evolution is by **new paths** or **additive JSON fields** under the same env-driven prefix.

---

## Route map (from `src/routes/user.routes.js`)

Paths below are **suffixes**; full paths are **`{ADMIN_APP_PREFIX}{suffix}`**.

**Authentication & onboarding (no JWT)**

| Method | Path |
|--------|------|
| GET | `/dyaminc_onboarding`, `/dynamic_home`, `/valid_user_exists` |
| POST | `/login`, `/register`, `/resend_otp`, `/verify_otp`, `/account_setup`, `/forgot_password`, `/reset_password`, `/social_login`, `/twitter_oauth_exchange`, `/payment_authorized`, `/payment_charges`, `/vendor_settlement`, `/payment_tdr`, `/signup_mail`, `/verify_phone`, `/verify_phone_otp`, `/process_webhook` |

**Public reads & writes (no `verifyToken` in file order)**

| Method | Path (examples) |
|--------|-----------------|
| GET | `/category_list`, `/city_list`, `/state_list`, `/single_activity`, `/working_days`, `/check_availability`, `/get_remaining_use_of_coupon`, `/get_mobile_first_discount`, `/activity_search`, `/top_attraction_place`, `/top_activity`, `/terms_and_conditions`, `/get_faq`, `/travel_experience`, `/check_coupon_code`, `/list_of_coupons`, `/blogs_list`, `/get_single_blog` |
| POST | `/contact_message`, `/vendor_registration`, `/promotional_top_activity`, `/promotional_top_attractions`, `/send_discount_sms` |

**Protected (after `user.use(authMiddleware.verifyToken)`)**

| Method | Path (examples) |
|--------|-----------------|
| GET | `/profile`, `/notification_setting`, `/wishlist`, `/wishlist_module`, `/booking_list`, `/city_history`, `/notifications`, `/download-ticket/:bookingHashId` |
| PUT | `/update_profile`, `/notification_setting_update`, `/password_update`, `/notifications/mark_read` |
| POST | `/upload_profile_image`, `/update_fcm_token`, `/add_wishlist`, `/cancel_booking`, `/rating_submit`, `/add_city_history`, `/payment_link`, `/ticket_view` |
| DELETE | `/delete_account` |

---

## Authentication model (HTTP)

- **Header name**: **`authentication`** (see `admin_verify.js` and CORS `allowedHeaders` in `index.js`).
- **Value**: **base64-encoded JWT** string. The server decodes with `Buffer.from(token, 'base64').toString('utf8')`, then **`jwt.verify`** with `config.secret`.
- **User context**: On success, **`res.locals.id`** is set from the JWT payload’s `id`.
- **Errors**: Missing/invalid token uses **`res.badRequest`** (400) for “token not found” / bad decode path, and **`res.unAuthorizedRequest`** (401) for invalid JWT — see `admin_verify.js`.

**Pattern for specs**: Document **`authentication: <base64(JWT)>`** for protected routes; do not assume standard `Authorization: Bearer` unless the client is updated to match.

---

## Response envelope (JSON)

**`src/utils/messages.js`** with **`responseHandler`** adds **`res.ok`**, **`res.badRequest`**, **`res.failureResponse`**, **`res.unAuthorizedRequest`**, **`res.insufficientParameters`**, **`res.accessForbidden`**, **`res.noContent`**.

Core JSON shape:

```json
{
  "status": "SUCCESS | BAD_REQUEST | UNAUTHORIZED | ACCESS_FORBIDEN | FAILURE",
  "message": "string",
  "data": [] 
}
```

- **`data`**: If the handler passes **`data.data`** and it is non-empty, that object is returned; otherwise the helper often returns **`[]`** for “empty” payloads (`messages.js` uses `Object.keys(data.data).length`).
- **HTTP status**: Driven by **`src/utils/responseCode.js`** (200, 204, 400, 401, 403, 404, 422, 500). Not every code has a dedicated `res.*` helper in `messages.js` (e.g. **422** is defined but success/error flows mostly use **400** + **`BAD_REQUEST`** for validation).

**Example success (login)**

```json
{
  "status": "SUCCESS",
  "message": "Successfully Login",
  "data": {
    "token": "<base64-encoded-jwt>",
    "user": {
      "id": 1,
      "profile_picture": null,
      "name": "Jane",
      "birth_date": null,
      "email": "jane@example.com",
      "phone_number": null,
      "city": null,
      "pin_code": null
    }
  }
}
```

**Example client error (validation)**

```json
{
  "status": "BAD_REQUEST",
  "message": "\"email\" must be a valid email\n\"password\" is required",
  "data": []
}
```

(Joi **`abortEarly: false`** in `validateRequest.js` — multiple issues joined with **newlines**.)

**Example unauthorized**

```json
{
  "status": "UNAUTHORIZED",
  "message": "Not valid token data.",
  "data": []
}
```

**Note**: **`ACCESS_FORBIDEN`** is the spelling in **`messages.js`** (typo vs “FORBIDDEN”).

---

## CORS and errors

- **Origin**: Only **`config.ALLOW_ORIGIN`** or requests **without** an `Origin` header pass; others get **403** with `{ "message": "CORS Error: Origin not allowed." }` (not the standard `status/message/data` envelope).
- **Invalid JSON body**: Global error handler uses **`badRequest`** from **`messages`** with message like **`Invalid Json Formate...!`**.

---

## Validation

- **Library**: **Joi** schemas in **`src/utils/validation/userValidation.js`**.
- **Runner**: **`validateParamsWithJoi(payload, schema)`** in **`src/utils/validateRequest.js`** — returns **`{ isValid, message, value }`**; failures map to **`res.badRequest({ message })`** in controllers.
- **Patterns**: **`.or('email','phone')`**, **`.unknown(true)`** on several objects, custom **`.custom()`** for business rules (e.g. vendor GSTIN/PAN), pagination **`limit` / `offset`**, optional **`col_filter`** as JSON string on some GETs (parsed in controller).

---

## Methods and naming (pragmatic RPC style)

- Paths are **snake_case** “actions” (`/check_availability`, `/forgot_password`) rather than nested resource IDs everywhere.
- **GET** is used heavily for reads; some list/search endpoints accept **query** parameters (`platform`, `limit`, `offset`, `search_val`, `col_filter`, etc.).
- **POST** is used for creates, OTP flows, payments, webhooks, and several non-REST actions.
- One **path param**: **`GET /download-ticket/:bookingHashId`**.

**Pattern**: New endpoints should **match** existing **snake_case** and **verb + noun** style in **`user.routes.js`** so mobile apps stay consistent.

---

## Pagination and list inputs

- Common pattern: **`limit`** and **`offset`** as query params (defaults sometimes applied in controller, e.g. offset `0`, limit `10`).
- Some Joi schemas require **`page` + `limit`** (`pagination` in `userValidation.js`) — align handler and client with the same names per endpoint.

---

## Webhooks and payment callbacks

- Routes such as **`/payment_authorized`**, **`/payment_charges`**, **`/vendor_settlement`**, **`/payment_tdr`**, **`/process_webhook`** accept **POST** bodies from providers; design assumes **server-to-server** calls. Document **payload shape** per integration and **idempotency** expectations in the worker/DB layer (not always visible at the HTTP boundary).

---

## Deep levels — API design checklist for this repo

| Level | Focus |
|-------|--------|
| **L0** | **Env prefix** (`ADMIN_APP_PREFIX`) vs **root** routes (`/test`, static `/node/uploads`) — clients must concatenate the correct base URL. |
| **L1** | **CORS** — only configured origin; failures are **403** with a **different** body shape than `messages.js`. |
| **L2** | **Auth** — header is **`authentication`** (not `Authorization`); value is **base64(JWT)**. |
| **L3** | **Envelope** — preserve **`status` / `message` / `data`** for JSON APIs; expect **`data: []`** when empty. |
| **L4** | **HTTP codes** — **401** for invalid token, **400** for missing token in middleware, **500** for **`failureResponse`**. |
| **L5** | **Validation** — Joi + newline-joined errors; keep **field names** stable for app parsing. |
| **L6** | **Query vs body** — many GETs use **query**; POSTs use **body**; document each route explicitly. |
| **L7** | **Backward compatibility** — prefer **additive** `data` fields; avoid renaming snake_case paths without a client migration. |
| **L8** | **Security** — never expose stack traces in JSON; **server-side** logging via `create_log_db` patterns in controllers. |

---

## Anti-patterns when extending this API

- Adding a **second** JSON envelope without a migration plan.
- Documenting **`Authorization: Bearer`** while the server only reads **`authentication`**.
- **GET** endpoints that **mutate** state (breaks caching and HTTP semantics).
- Returning **inconsistent** error shapes (always go through **`responseHandler`** helpers for app JSON routes).

---

## Relation to the `api-design` skill

Use the parent **`SKILL.md`** for generic REST/OpenAPI guidance; use **this README** for **concrete `reactnativeHub/node` conventions** (prefix, header name, envelope, routes).

---

## Maintenance

Update this file when **`ADMIN_APP_PREFIX`**, **`messages.js`** envelope, CORS rules, or **`user.routes.js`** surface area changes.
