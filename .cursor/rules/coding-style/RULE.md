---
description: General coding style plus JavaScript/TypeScript basics and standards.
alwaysApply: true
---

# Coding style

## All languages

- **Consistency**: Follow the project’s formatter and linter (e.g. Prettier, ESLint, Ruff); do not fight existing conventions in a file unless migrating the whole project.
- **Naming**: Prefer clear, full words over cryptic abbreviations; use the same casing style as the codebase (camelCase, snake_case, PascalCase) per language norms.
- **Functions**: Small, single-purpose; extract helpers when logic repeats or obscures intent.
- **Comments**: Explain *why* non-obvious decisions were made, not what the code literally does; keep them updated when behavior changes.
- **Dead code**: Remove unused imports, variables, and commented-out blocks; avoid leaving debug prints in committed code.

---

## JavaScript & TypeScript — standards and basics

Use this section whenever you edit **`.js`**, **`.mjs`**, **`.cjs`**, **`.ts`**, **`.tsx`**, **`.jsx`**, or **`.vue`** script blocks.

### Syntax and safety

- **Strictness**: Prefer **ES modules** (`import` / `export`) in new code; use `"use strict"` in scripts that are not ESM. In TypeScript projects, enable **`strict`** (or match the repo’s `tsconfig`).
- **Variables**: Use **`const`** by default; use **`let`** only when the binding must change. Avoid **`var`** in new code.
- **Equality**: Prefer **`===`** and **`!==`**. Use **`==`** only when you intentionally want coercion and add a short comment why.
- **Semicolons**: Follow **Prettier / ESLint** and the existing file—do not mix styles in one file.

### Async

- Prefer **`async` / `await`** over long `.then()` chains when it improves readability.
- Always handle **rejections**: `try` / `catch` around `await`, or `.catch()` on promises; avoid **floating promises** (unhandled async calls at top level unless the runtime expects it).

### Modules

- Prefer **named exports** when the module has multiple public symbols; use **default export** only where the project already does for single-entry modules.
- **Import order**: follow ESLint `import` rules if configured (e.g. external packages first, then internal aliases).

### TypeScript (when the file is `.ts` / `.tsx`)

- Avoid **`any`**. Use **`unknown`** for values you narrow before use. Prefer **`interface`** or **`type`** for object shapes.
- Use **explicit return types** on exported functions and public APIs when it helps callers; otherwise infer if the project prefers brevity.
- Prefer **`?.`** optional chaining and **`??`** nullish coalescing over loose `||` when `0` / `""` are valid values.

### Style conventions (common defaults)

| Topic | Convention |
|--------|------------|
| Variables / functions | `camelCase` |
| Classes / components / types | `PascalCase` |
| Constants (true constants) | `UPPER_SNAKE` or project norm |
| Private intent | Leading `_` only if the codebase already uses it |

### What to avoid

- Silent **`catch`** blocks; at minimum log or rethrow.
- Mutating **function parameters** when a copy is clearer.
- **Magic numbers** and strings in logic—use named constants or enums.

For deeper JS/TS rules and patterns, see **`.cursor/rules/javascript/RULE.md`** and **`.cursor/rules/javascript-patterns/RULE.md`** (when those folders exist).
