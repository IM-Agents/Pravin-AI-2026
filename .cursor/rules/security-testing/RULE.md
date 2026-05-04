---
description: Security testing — automated checks, DAST/SAST hooks, authz probes, dependency and secret scanning in CI.
globs: "**/*security*.{test,spec,js,mjs,cjs,ts,tsx,jsx,yml,yaml}"
alwaysApply: false
---

# Security testing

Use when writing or reviewing **security-focused tests**, **audit automation**, **DAST/SAST configs**, or **CI security gates**. This complements **`security/RULE.md`** (secure coding) and general **`testing/RULE.md`**.

If your repo stores these under **`security-tests/`** or uses filenames without “security” in the name, extend the **`globs`** in this rule’s frontmatter to match.

---

## 1. Scope: what “security testing” means here

- **Automated checks** that fail CI when risk thresholds are crossed (dependencies, secrets, known patterns).
- **Targeted tests** that assert **security behavior**: authn/authz, input rejection, signature verification, headers.
- **Dynamic** scanning (DAST) and **interactive** proxies — configs and runbooks, not manual exploitation write-ups.

Security testing **does not replace** code review, threat modeling, or a professional penetration test when required.

---

## 2. Safe environments

- Run **invasive** probes (SQLi fuzz strings, path traversal payloads) only against **non-production**, **disposable**, or **explicitly approved** environments.
- **Isolate** data: no real customer PII; use synthetic accounts and **scoped** credentials.
- **Rate-limit** and **coordinate** so scans are not mistaken for attacks on shared infrastructure.

---

## 3. Dependency and supply chain

- Run **`npm audit` / `pnpm audit` / `yarn audit`** (or OSV) in **CI**; **fail** or **warn** on criticals per policy.
- **Pin** versions where practical; review **transitive** upgrades for high-risk packages.
- For lockfile integrity, prefer **verified** CI checkout and **immutable** installs.

---

## 4. Secrets and configuration

- **Scan** repos for tokens (git hooks, CI jobs, **trufflehog** / **gitleaks**-class tools).
- Tests that need secrets should read from **CI secrets** or **ephemeral** env, never hardcoded strings.
- Assert **.env.example** documents required keys **without** real values.

---

## 5. Authentication and authorization tests

- **Negative cases**: missing token, expired token, wrong signature, wrong **`aud`/`iss`** if applicable.
- **AuthZ**: user A must **not** access user B’s resource IDs (**horizontal**); low role must **not** hit admin routes (**vertical**).
- **Webhooks**: reject when **HMAC** or timestamp/nonce policy fails; accept only **valid** canonical payloads.

---

## 6. Input validation and injection

- **Boundary** tests: oversize payloads, deeply nested JSON, unexpected types.
- **Injection** probes in **test env** for SQL, command, path, SSRF (only with approval)—map findings to **parameterized** queries and **allowlists**.
- **File uploads**: wrong MIME, polyglots, oversize — expect **400** and no execution.

---

## 7. Web and API specifics

- **CORS**: tests or checks that **`Origin`** cannot escalate privileges incorrectly.
- **Cookies**: **`HttpOnly`**, **`Secure`**, **`SameSite`** where applicable — assert in integration tests or config snapshots.
- **Headers**: presence of **security headers** (CSP, HSTS, etc.) when the stack defines them as required.
- **Rate limiting**: optional smoke that **abuse** returns **429** or equivalent when implemented.

---

## 8. DAST / scanner configs

- Tools such as **OWASP ZAP**, **Burp**, **nuclei** — store **contexts**, **scopes**, and **exclusions** in repo; **never** point default profiles at production without scope rules.
- Version-control **baseline** reports and **diff** new findings in PRs.

---

## 9. Anti-patterns

- **Passing** tests that only assert **200 OK** without checking **authorization**.
- **Shared** “admin” credentials across all CI jobs.
- Running **destructive** fuzzing against **shared** staging without **notification**.
- **Ignoring** scanner false positives forever — track as **accepted risk** with **owner** and **expiry**.

---

## Related rules

- **`security/RULE.md`** — secure design and implementation (`alwaysApply`).
- **`testing/RULE.md`** — pyramid, isolation, meaningful assertions.
- **`javascript-testing/RULE.md`** — JS/TS test style when tests are in `*.test.*` / `*.spec.*`.
