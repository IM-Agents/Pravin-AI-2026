---
description: Code patterns for tests — structure, data builders, doubles, isolation, and maintainability.
globs: "**/*.{test,spec}.{js,mjs,cjs,ts,tsx,jsx}"
alwaysApply: false
---

# Patterns for testing (code patterns)

Use this rule when **authoring or refactoring test code** (not production code). It complements the general **`testing`** rule and **`javascript-testing`** (runners, RTL, async).

---

## 1. File and suite structure

- **Mirror source lightly**: keep tests **near** or under predictable paths (`__tests__/`, `*.test.ts` next to source) per project convention—do not invent a second tree.
- **`describe` nesting**: outer = **unit** (module, class, or component); inner = **method** or **scenario group** (`describe('when user is unauthenticated', ...)`).
- **Order**: declare **helpers and factories** at bottom of file or in `*.test-utils.ts` if reused across files—avoid huge blocks before first `describe` unless shared module.

---

## 2. Naming and readability

- **`it`/`test` titles** are **full sentences** in natural language: *“shows validation error when email is empty”* — not *“error case 1”*.
- **Avoid** vague names: *“works”*, *“correct data”*. State **input + expected outcome**.
- **Given–When–Then** or **Arrange–Act–Assert** should be **visible** (blank lines or short comments only when the block is long).

---

## 3. Test data patterns

- **Factories / builders**: `createUser({ role: 'admin' })` instead of copying 20-field objects in every test.
- **Defaults + overrides**: spread base fixture, override only fields the test cares about—keeps tests **focused** and stable when unrelated fields change.
- **Determinism**: prefer **fixed** IDs and timestamps (`new Date('2020-01-01')` or clock mocks) over `Date.now()` in assertions unless testing time itself.
- **Minimal data**: smallest object that satisfies the type and the scenario—do not mirror entire API responses unless integration-testing.

---

## 4. Doubles and boundaries

- **Stub**: returns canned values—use for **queries** (e.g. auth service returns a user).
- **Mock**: assert **how** it was called (spies)—use for **commands** and side effects.
- **Fake**: working in-memory implementation (e.g. fake clock, in-memory repo)—use when behavior matters.
- **Rule**: replace **I/O at the edge** (HTTP, DB, filesystem); keep **domain logic** real when possible.

---

## 5. Isolation and shared state

- **No hidden coupling**: tests must not rely on **order of execution** or **global** mutable state unless `beforeEach` resets it.
- **Reset** mocks, modules, and DOM between tests in the same file.
- **Avoid** “test 2 fixes data test 1 broke”—each test should **arrange** its own preconditions.

---

## 6. Parameterized and table-driven tests

- Use **`it.each` / `test.each`** (or equivalent) when several cases share the same **logic** and differ only by **inputs and expected output**.
- Keep tables **readable**: short rows, clear column headers; extract **complex** setup into a helper.

---

## 7. Async and lifecycle patterns

- **One async concern per test** when possible; avoid sequential unrelated `await`s that mix multiple behaviors.
- **Hooks**: `beforeAll` only for **expensive** shared setup that is **read-only** for tests; prefer `beforeEach` for mutating setup.
- **Teardown**: `afterEach` for **unmount**, **clearMocks**, **restore real timers**—match what the test or mock changed.

---

## 8. UI / component test patterns (when applicable)

- **Page object** (or small **wrapper** functions): `loginAsUser(page)` to avoid duplicating 15-step flows—keep POs **thin** (no business assertions hidden inside).
- **Stable queries**: centralize **`data-testid`** only when roles/labels are insufficient—document why.
- **User-centric flows**: one **user journey** per test when testing integration of components.

---

## 9. Anti-patterns in test code

- **God test**: one `it` that asserts 15 unrelated things—split.
- **Mirror implementation**: tests that break when **refactoring** without behavior change—assert **public** behavior.
- **Production logic copy-paste** in tests—import or use the same pure helpers as prod when feasible.
- **Silent catches** in test helpers—fail loudly or rethrow.

---

## Related rules

- **`testing/RULE.md`** — pyramid, isolation, flakes (all languages).
- **`javascript-testing/RULE.md`** — JS/TS runners, RTL, mocks, snapshots.
- **`patterns/RULE.md`** — broader architecture patterns (non-test).
