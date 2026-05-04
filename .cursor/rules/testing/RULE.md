---
description: Testing — pyramid, isolation, and meaningful assertions.
alwaysApply: true
---

# Testing

Applies to all languages. For **`.js` / `.ts` / `.tsx` test files** (`*.test.*`, `*.spec.*`), the **`javascript-testing`** rule adds runner- and DOM-specific guidance.

- **Pyramid**: Prefer fast unit tests for pure logic; integration tests for boundaries; fewer, stable E2E tests for critical paths.
- **Isolation**: Tests should not depend on order; reset state between runs; mock external systems at boundaries when needed.
- **Assertions**: Assert on observable outcomes; one logical scenario per test when possible; clear failure messages.
- **Flakes**: Fix or quarantine flaky tests; do not increase retries without addressing root cause.
- **Coverage**: Aim for meaningful coverage of branches and errors, not arbitrary percentage targets alone.
