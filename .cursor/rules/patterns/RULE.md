---
description: Common software patterns — layering, errors, and boundaries.
alwaysApply: true
---

# Patterns

Language-agnostic defaults. For **JavaScript / TypeScript** structure and composition (modules, async orchestration, React-friendly habits), see the **`javascript-patterns`** rule in `.cursor/rules/javascript-patterns/`.

- **Separation of concerns**: Keep I/O (HTTP, DB, filesystem) at the edges; core logic should be testable without real network or disk when feasible.
- **Errors**: Use typed or structured errors where the stack supports it; propagate with context; avoid empty `catch` blocks.
- **Dependencies**: Prefer explicit constructor injection or factory boundaries over hidden globals; avoid circular module graphs.
- **Immutability**: Prefer immutable updates where it reduces bugs (especially in concurrent or React state flows); follow language idioms.
- **Idempotency**: Design writes that may retry (APIs, queues) to be safe or keyed idempotently when duplicates are costly.
