---
description: JavaScript and TypeScript — language rules, safety, modules, async, types, and platform.
globs: "**/*.{js,mjs,cjs,ts,tsx,jsx,vue}"
alwaysApply: false
---

# JavaScript & TypeScript rules

**`coding-style`** (`alwaysApply`) already states JS/TS basics for every chat; this rule **adds file-scoped** detail when you work under the globs below. Follow the project’s **ESLint** / **Prettier** / **tsconfig** first; these rules fill gaps when the repo is silent.

---

## 1. Language core

- **Modules**: Prefer **ESM** (`import` / `export`) in new files. Use `"use strict"` in non-ESM scripts. **CJS** (`require`) only where the toolchain requires it.
- **Variables**: **`const`** by default; **`let`** when rebinding; avoid **`var`** in new code.
- **Equality**: Use **`===`** and **`!==`**. Use **`==`** only with a comment explaining intentional coercion.
- **Semicolons & quotes**: Match **Prettier** and the existing file—never mix styles in one file.
- **Blocks**: Always use braces for `if` / `for` / `while` when the body is more than one line or when omitting braces would invite bugs.

---

## 2. Functions

- Prefer **arrow functions** for short callbacks; use **function** declarations when hoisting or `this` binding matters.
- Prefer **default parameters** and **rest** (`...args`) over `arguments` object.
- Avoid **excessive nesting**; extract named helpers.
- Return **early** when it reduces indentation and duplication.

---

## 3. Objects & arrays

- Prefer **object spread** and **array spread** for shallow copies when the project already uses them.
- Prefer **`Array.prototype` methods** (`map`, `filter`, `find`) over manual loops when readability wins; use **`for...of`** for async iteration or when performance is proven critical.
- Avoid **mutating** shared objects passed in; return new references when the API is immutable-friendly (e.g. React state).

---

## 4. Async

- Prefer **`async` / `await`** over long `.then()` chains when it clarifies flow.
- **Handle rejections**: `try` / `catch` around `await`, or `.catch()` on promises; avoid **floating promises** (unhandled top-level async).
- Use **`Promise.all`** for independent parallel work; **`Promise.allSettled`** when partial failure is acceptable.

---

## 5. Modules (organization)

- **Named exports** for multiple public symbols; **default export** only for single-entry modules if the codebase uses that pattern.
- **Import order**: external packages first, then internal aliases (`@/`, `@utils/`), then relative—follow ESLint `import/order` if configured.
- **Side effects**: Avoid `import` that runs heavy side effects; prefer explicit `init()` functions.

---

## 6. TypeScript (`.ts` / `.tsx`)

- Enable **`strict`** (or match the repo’s `tsconfig`).
- Avoid **`any`**. Use **`unknown`** and narrow with type guards. Prefer **`interface`** or **`type`** for object shapes.
- Use **`readonly`** for data that must not change.
- **Narrow at boundaries**: API responses, `JSON.parse`, `req.body`—validate or assert with schemas (Zod, io-ts, etc.) when the project uses them.
- Prefer **`?.`** optional chaining and **`??`** nullish coalescing over `||` when **falsy** values (`0`, `""`) are valid.

---

## 7. Errors

- **`throw`** instances of **`Error`** (or subclasses) with a **clear message**.
- When rethrowing, use **`cause`** in `Error` options where supported to preserve the original stack.
- Do not **`throw`** strings or arbitrary objects.

---

## 8. Security

- Never use **`eval`**, **`new Function`** with user input, or **`innerHTML`** with unsanitized strings.
- **Sanitize** or **encode** any user-controlled string before DOM or HTML insertion.
- **Secrets**: Do not embed API keys or passwords in source; use env vars or build-time injection per project policy.

---

## 9. Platform: Node vs browser

- **Node**: use **`import`**/`require` consistently with the project; prefer **`fs/promises`** over sync FS in async code; avoid blocking the event loop on hot paths.
- **Browser**: guard **`window`**, **`document`**, **`localStorage`** with `typeof` checks or feature detection when code is shared or SSR-safe.
- Do not assume **global** APIs exist in Node (e.g. `fetch` on older Node without polyfill).

---

## 10. Comments & dead code

- Comment **why**, not what; keep comments in sync with behavior.
- Remove **unused imports**, **unused variables**, **commented-out blocks**, and **`console.log`** before merge unless logging is intentional and gated.

---

## Related rules in this repo

- **`.cursor/rules/README.md`**: Index of rules and stacking order.
- **`javascript-patterns`**: React/state/immutability patterns.
- **`javascript-testing`**: Test style for JS/TS tests.
- **`coding-style`**: Cross-language style including JS basics when `alwaysApply` is on.
