---
description: JavaScript and TypeScript testing — structure, runners, mocks, async, React/DOM, and quality.
globs: "**/*.{test,spec}.{js,mjs,cjs,ts,tsx,jsx}"
alwaysApply: false
---

# JavaScript & TypeScript testing

Stack with the general **`testing`** rule (pyramid, isolation, assertions, flakes). This file applies only to **test files** matching the globs above.

Follow the repo’s **Jest**, **Vitest**, **Node test runner**, or **Mocha** config first; these rules fill gaps when the project is silent.

---

## 1. Alignment with the project

- Use the **same** language variant as source (`.ts` / `.tsx` tests for TS projects).
- Respect **`eslint`** / **`vitest` globals** / **`jest`** env already in the repo.
- Match **file naming** the codebase uses (`*.test.ts` vs `*.spec.tsx`); do not introduce a second convention in the same folder.

---

## 2. Test layout and naming

- **`describe`** blocks group by **unit under test** (module, function, or component), not by file path only.
- **`it` / `test`** names read as **behavior**: `it('returns empty list when filter has no matches', ...)`.
- Prefer **one logical scenario per test**; split large tests instead of asserting everything in one `it`.
- Use **`beforeEach`** / **`afterEach`** for **repeatable** setup (mocks, timers, DOM cleanup), not for one-off data that obscures what each test does.

---

## 3. Structure (Arrange–Act–Assert)

1. **Arrange**: minimal data, mocks, and renders needed for this assertion.
2. **Act**: single user action or function call.
3. **Assert**: explicit expectations on **observable** outcomes (return value, DOM, calls), not internal state unless necessary.

---

## 4. Unit vs integration

- **Unit**: pure functions, reducers, small hooks — fast, no real network.
- **Integration**: several modules together, in-memory DB, MSW/fetch mock, or router + provider — still **no** production URLs unless the project uses a dedicated test env.
- **E2E** (Playwright/Cypress) lives outside this glob; keep **browser E2E** rules in project docs or **`e2e-testing`** skill if present.

---

## 5. Mocking

- Mock at **boundaries**: HTTP (`fetch` / `axios`), `localStorage`, timers, environment modules.
- **Do not** mock every internal function — prefer real code with controlled inputs.
- Reset mocks between tests (`mockClear`, `mockRestore` or Vitest **`vi.resetModules`** when isolating modules).
- When mocking modules, keep the mock **small** and **similar** to real behavior (shape of resolved promises, error paths).

---

## 6. Async and time

- Prefer **`async`/`await`** in tests; **`return`** the promise so the runner waits.
- Use framework helpers: **`waitFor`**, **`findBy*`**, **`waitForElementToBeRemoved`** instead of **`setTimeout`** sleeps.
- Use **fake timers** (`useFakeTimers`) for `debounce`/`setInterval` logic; **advance** timers explicitly.
- Reject floating assertions: every async path should **`await`** or **return** the expectation chain.

---

## 7. React and DOM (when tests use React Testing Library or similar)

- Query by **role**, **label**, or **placeholder** — closest to how users interact.
- Avoid **`container.querySelector`** for stable tests unless documenting a known limitation.
- Wrap updates in **`act`** when the testing library does not do it (follow RTL + React 18 guidance).
- Prefer **`userEvent`** over **`fireEvent`** when the project already uses **`@testing-library/user-event`**.
- **Avoid** testing implementation details (internal state variable names, private hooks) unless refactoring safety requires it.

---

## 8. TypeScript in tests

- Prefer **typed** fixtures; use **`as const`** or **`satisfies`** for mock data when it catches drift.
- **`any`** in tests is acceptable **only** for narrow escape hatches (e.g. partial mocks); prefer **`unknown`** + narrowing when feasible.

---

## 9. Snapshots

- Use **snapshots** for **small, stable** outputs (error messages, serialized config), not for large component trees unless the team standardizes on it.
- Review snapshot diffs in PRs like production code.

---

## 10. Coverage and quality

- Aim for **meaningful** branch and error-path coverage, not a fixed percentage alone.
- Add tests when fixing **bugs** (regression test first or with the fix).
- Do not **skip** tests (`it.skip`) in main branch without a ticket or comment explaining why.

---

## 11. Anti-patterns

- **Order-dependent** tests relying on global mutable state without `beforeEach` cleanup.
- **Real API keys** or production URLs in tests.
- **Random** data without **seed** or **fixed inputs** when assertions depend on values.
- **Copy-paste** huge setup blocks — extract **`setupUser()`** or factory helpers.

---

## Related rules in this repo

- **`testing/RULE.md`** — language-agnostic testing principles (`alwaysApply`).
- **`patterns-testing/RULE.md`** — test **code** patterns (factories, doubles, suite structure).
- **`javascript/RULE.md`** — language rules for implementation files.
- **`javascript-patterns/RULE.md`** — app structure patterns that affect testability.
- **`coding-style/RULE.md`** — general style when `alwaysApply` is on.
