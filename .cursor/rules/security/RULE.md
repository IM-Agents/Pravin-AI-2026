---
description: Security basics — secrets, auth, input/output, and dependencies.
alwaysApply: true
---

# Security

- **Secrets**: Never commit API keys, passwords, or tokens; use env vars or secret managers; rotate on exposure.
- **Auth**: Enforce authorization on the server for every sensitive action; never rely on UI-only checks for protection.
- **Input**: Validate and sanitize; use parameterized queries; set limits on uploads and payloads.
- **Output**: Encode for the target context (HTML, JS, URL); set safe headers and cookie flags where applicable.
- **Dependencies**: Keep packages updated; review high-risk additions; run security audits in CI when available.

For **security-focused tests**, **audit automation**, and **DAST/CI security gates**, see **`security-testing/RULE.md`** when that rule is present.
