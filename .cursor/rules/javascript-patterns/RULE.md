---
description: JavaScript and TypeScript pattern standards — structure, modules, async flow, data, UI, and anti-patterns.
globs: "**/*.{js,mjs,cjs,ts,tsx,jsx,vue}"
alwaysApply: false
---

Core **language** rules (syntax, safety, platform) live in **`javascript/RULE.md`**. This file defines **pattern standards**: how to structure and compose code consistently.

---

## 1. Module and file organization

- **One primary concern per file** when the file grows past ~200–300 lines; split by feature or layer (`api/`, `components/`, `hooks/`, `utils/`).
- **Barrel files** (`index.ts` re-exports): use when they improve imports and do not create circular dependencies; avoid deep barrel chains that hide real dependencies.
- **Named exports** for libraries and shared utilities so imports are searchable and tree-shakable; **default export** only when the module has a single obvious entry (e.g. one React component file exporting that component as default—if that matches the repo).
- **Co-locate** tests, stories, and styles with the feature when the project uses that layout; do not invent a new layout without aligning with existing folders.

---

## 2. Data and control flow

- Prefer **pure functions** for transforms (same inputs → same output, no hidden I/O). Put I/O at the edges (HTTP, DB, DOM).
- **Guard clauses** at the top of functions: validate inputs and return early (`if (!x) return …`) instead of deep nesting.
- **Pipeline style**: small steps (`parse → validate → map → persist`) as separate functions or explicit steps, not one mega-function.
- **Avoid shared mutable singletons** unless the framework requires them; prefer explicit dependency injection or module-scoped state with a clear API.

---

## 3. Async patterns

- **One `async` function = one logical operation**; split orchestration (`loadUserAndOrders`) from low-level calls (`fetchUser`).
- **Parallelism**: `Promise.all` for independent tasks; **sequential** `await` only when order or data dependency requires it.
- **Timeouts and cancellation**: use `AbortController` for fetch when the codebase supports it; document fire-and-forget only when truly intentional (e.g. analytics).
- **Retries**: centralize retry/backoff in a helper or library—do not copy-paste retry loops across files.

---

## 4. Error-handling pattern

- **Boundary pattern**: catch at **module boundaries** (route handlers, job runners, UI error boundaries), not necessarily every inner helper.
- **Preserve context**: wrap with `new Error('…', { cause: err })` when rethrowing (see **`javascript/RULE.md`**).
- **User-facing vs developer-facing**: map technical errors to safe messages in UI/API responses; log details server-side or behind a flag.

---

## 5. TypeScript pattern standards

- **`interface` vs `type`**: use **`interface`** for object shapes that may extend; **`type`** for unions, tuples, and mapped types—follow existing project bias if consistent.
- **Discriminated unions** for state machines and variant results (`{ status: 'ok', data } | { status: 'error', error }`).
- **Branded types** or validation at boundaries for IDs and external payloads when misuse is costly.
- **`satisfies`** when you need inference plus constraint checking (when TS version and style allow).

---

## 6. React and UI-oriented patterns (when applicable)

- **Immutability**: update state with new references (`setState` with spread, reducers returning new objects). Use **Immer** only if the project already does.
- **Lifting state** only as high as needed; prefer **composition** over prop drilling when the repo uses context or composition patterns.
- **Effects**: `useEffect` for synchronization with the outside world, not for deriving values from props/state (compute during render instead).
- **Event handlers**: prefix with `handle` (`handleSubmit`) or `on` (`onClick`) consistently with the codebase; avoid inline huge lambdas in JSX when they obscure readability—extract a named handler.
- **Lists**: stable **`key`** from stable IDs, not array index, unless the list is static and order never changes.

---

## 7. Testing-oriented patterns

- **Arrange–Act–Assert** (or Given–When–Then) structure in tests; one main behavior per test when possible.
- **Prefer real modules** over excessive mocking; mock **boundaries** (HTTP, clock), not every internal function.
- Details: see **`javascript-testing/RULE.md`** if present.

---

## 8. Anti-patterns to avoid

- **God modules** importing everything and exporting a flat bag of unrelated functions.
- **Callback pyramids**; replace with `async`/`await` or named intermediate steps.
- **Boolean blindness** (`doThing(true, false, true)`); use an options object or named constants.
- **Implicit global state** for app logic (hidden `let` mutations) without tests or documentation.

---

## Related rules

- **`README.md`** in `.cursor/rules/` — index of all rules and how they stack.
- **`javascript/RULE.md`** — syntax, strictness, security, Node vs browser.
- **`javascript-testing/RULE.md`** — test conventions.
- **`coding-style/RULE.md`** — cross-language style when enabled globally.
