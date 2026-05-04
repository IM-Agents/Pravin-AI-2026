---
description: Database work — schema, migrations, queries, transactions, and operations.
alwaysApply: true
---

# Database

Language- and engine-agnostic defaults. Prefer the project’s **ORM**, **query builder**, or **SQL style guide** when they exist; these rules apply when those are silent or incomplete.

- **Schema**: Prefer explicit **constraints** (PK, FK, unique, check, not null) over “convention only.” Use **sensible types** and **time zones** (`timestamptz` where supported). Add **indexes** for real query paths; avoid redundant indexes.
- **Migrations**: Make changes **reversible** or documented when not. Prefer **expand/contract** for zero-downtime: add new columns/tables first, backfill, then switch reads/writes, then drop old pieces. Never edit applied migration history in shared environments.
- **Queries**: Use **parameterized** statements or the ORM’s bound parameters; never build SQL by concatenating untrusted input. Return only **needed columns**; paginate large lists. Watch **N+1** access patterns and fix with joins, batching, or dataloaders as appropriate.
- **Transactions**: Keep **transaction scope** minimal; hold locks for as short as possible. Pick **isolation** deliberately when concurrency bugs are a risk. Avoid nesting transactions unless the stack defines clear semantics.
- **Naming**: Be **consistent** with the repo (often `snake_case` in SQL). Singular vs plural table names—**pick one** and stick to it. Name **indexes** and **constraints** so failures are diagnosable in logs.
- **Operations**: Use **connection pooling**; avoid opening a new connection per request in server apps. Protect **credentials** via env or secret stores (see **`security`**). Plan **backups**, **restore drills**, and **retention** for production data.

For **security-sensitive** persistence (authz on rows, injection testing), align with **`security`** and **`security-testing`** when those rules are present.
