# Cursor rules (this folder)

Each subfolder is one rule. Cursor loads **`RULE.md`** (some setups use **`RULE.mdc`**—mirror content if your Cursor version expects `.mdc`).

## Index

| Folder | Scope | `alwaysApply` | Summary |
|--------|--------|---------------|---------|
| **`coding-style`** | All files | yes | Formatter alignment, naming, comments, dead code; **JS/TS basics** inline. |
| **`database`** | All files | yes | Schema, migrations, queries, transactions, naming, pooling, and ops hygiene. |
| **`git-workflow`** | All files | yes | Branches, commits, PRs, reviews, main branch health. |
| **`patterns`** | All files | yes | Layering, errors, dependencies, immutability, idempotency (language-agnostic). |
| **`performance`** | All files | yes | Measure first, algorithms, I/O, assets, concurrency. |
| **`security`** | All files | yes | Secrets, auth, input/output, dependencies. |
| **`testing`** | All files | yes | Pyramid, isolation, assertions, flakes, coverage. |
| **`javascript`** | `**/*.{js,mjs,cjs,ts,tsx,jsx,vue}` | no | JS/TS language rules: modules, async, TS, errors, platform. |
| **`javascript-patterns`** | Same globs as above | no | Pattern standards: structure, async flow, React-oriented habits, anti-patterns. |
| **`javascript-testing`** | `**/*.{test,spec}.{js,mjs,cjs,ts,tsx,jsx}` | no | JS/TS tests: AAA layout, mocks at boundaries, async/timers, RTL/DOM, snapshots, coverage. |
| **`patterns-testing`** | `**/*.{test,spec}.{js,mjs,cjs,ts,tsx,jsx}` | no | **Test code** patterns: describe layout, factories, doubles, isolation, table-driven tests, POs. |
| **`performance-testing`** | `**/*.{bench,benchmark,load,perf}.{js,mjs,cjs,ts,tsx,jsx,yml,yaml}` | no | Load/stress/soak/benchmarks, metrics, env safety, CI budgets (k6/Artillery-style). |
| **`security-testing`** | `**/*security*.{test,spec,js,mjs,cjs,ts,tsx,jsx,yml,yaml}` | no | Security tests & audit automation: authz, injection probes, secrets/deps CI, DAST config. |

## How rules stack

1. **`alwaysApply: true`** rules run for every chat (style, git, database, patterns, performance, security, testing).
2. **Glob rules** add detail when you open or edit matching files (`javascript*`, etc.).
3. **`coding-style`** already includes short JS/TS basics; **`javascript`** and **`javascript-patterns`** add depth without replacing ESLint/Prettier.

## Cross-references

- **JS/TS implementation details** → `javascript/RULE.md`
- **JS/TS architecture / composition** → `javascript-patterns/RULE.md`
- **JS/TS test files** → `javascript-testing/RULE.md` and **`patterns-testing/RULE.md`** (plus general `testing/RULE.md`)
- **Generic layering & boundaries** → `patterns/RULE.md`
- **SQL, migrations, persistence** → `database/RULE.md`
- **Load / benchmark scripts & perf CI** → `performance-testing/RULE.md` (plus general `performance/RULE.md`)
- **Security tests, audit scripts & scanner CI** → `security-testing/RULE.md` (plus general `security/RULE.md`)
