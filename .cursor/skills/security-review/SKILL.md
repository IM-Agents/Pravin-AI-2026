---
name: security-review
description: >-
  Security-focused review — authn/z, injection, secrets, headers, and dependency risks.
  Use when reviewing changes for vulnerabilities, threat modeling a feature, or hardening code.
---

# Security review

## When to activate

- Reviewing PRs that touch auth, sessions, cookies, or permissions
- Handling user input, file uploads, HTML rendering, or SQL
- Adding dependencies or changing deployment/secrets
- Investigating suspected XSS, CSRF, SSRF, or injection issues

## Checklist (adapt to stack)

1. **AuthZ**: Every sensitive action checked on the server; no “hidden UI” as security.
2. **Secrets**: No keys in source; rotate if exposed; least-privilege tokens.
3. **Injection**: Parameterized queries; sanitize/encode output for HTML/JS/URL context.
4. **Headers & cookies**: `HttpOnly`, `Secure`, `SameSite` where applicable; CSP when feasible.
5. **Files**: Validate type/size; store outside web root or via signed URLs; scan if required.
6. **Dependencies**: Review changelog for high-risk libs; run audit tools in CI when available.

## Deliverables

- List of findings by severity with file/line references
- Concrete fix suggestions or patches
- Residual risks and follow-up tasks when full mitigation is out of scope

## Project-specific reference

For **`odd_node`** (Express + Shopify): JWT/`x-store-name` auth, webhook HMAC, CORS/session/XSS middleware, upload limits, Swagger exposure, config secrets, SQL concatenation risks, Puppeteer/cron — see **`reference/README.md`**.
