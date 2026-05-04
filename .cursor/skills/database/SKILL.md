---
name: database
description: >-
  Designs and reviews relational database schema, migrations, SQL, indexing, and transactional
  behavior. Use when modeling tables, writing or editing migrations, tuning queries, debugging
  slow queries, choosing isolation levels, or when the user mentions SQL, Postgres, MySQL, SQLite,
  ORMs (Prisma, Drizzle, TypeORM, Sequelize), or database operations.
---

# Database

## When to activate

- New or changed **tables**, **columns**, **constraints**, or **indexes**
- **Migrations** (up/down, zero-downtime, data backfills)
- **SQL** or ORM queries that may be wrong, slow, or unsafe
- **Concurrency**: deadlocks, race conditions, isolation, locks
- **Operational** concerns: pooling, connections, backups, restores

For **service layering**, **handlers**, and **queue/cache** integration around the database, use **`backend-patterns`** first; this skill focuses on the data layer itself.

## Workflow

1. **Discover**: Identify the engine (Postgres, MySQL, SQLite, etc.) and the project’s migration tool and naming conventions. Follow existing patterns in the repo.
2. **Model**: Define keys, constraints, and nullability so invalid states are impossible or rare. Prefer explicit FKs and checks over app-only validation.
3. **Migrate**: One logical change per migration when feasible. Plan **expand → backfill → switch → contract** for production-safe rollouts.
4. **Query**: Use bound parameters; avoid string-built SQL with user input. Add indexes that match real filter/join/sort columns; verify with `EXPLAIN` (or equivalent) when performance matters.
5. **Transact**: Keep transactions short; use the minimum isolation level that stays correct; retry bounded deadlocks only where the stack allows.

## Schema checklist

- **Primary keys**: Clear PK strategy (often surrogate `bigint`/`uuid`; document if natural keys).
- **Foreign keys**: `ON DELETE` / `ON UPDATE` behavior is explicit and intentional.
- **Uniqueness**: Business uniqueness in DB (`UNIQUE`) when duplicates would corrupt data.
- **Types**: Correct domain types; **money** and **time** handled per engine best practices (e.g. `timestamptz` in Postgres).
- **Defaults**: Sensible server-side defaults; avoid silent `NULL` where a value should exist.
- **Soft delete / audit**: If used, index and query patterns account for `deleted_at` / `updated_by` consistently.

## Migrations checklist

- **Reversible** when the tool supports it; otherwise document manual rollback.
- **Backfills**: Batch large updates; avoid locking tables longer than necessary.
- **Destructive steps**: Separate drops/renames from reads switching over; coordinate deploy order with application code.

## Query and index checklist

- **No SQL injection**: Parameters or ORM bindings only for dynamic values.
- **N+1**: Batch, join, or dataload; measure with logging or ORM tooling.
- **Pagination**: Keyset/cursor where offsets hurt; cap page sizes.
- **Indexes**: Match predicates and sort order; watch write amplification; drop unused indexes when safe.

## Transactions checklist

- **Scope**: One coherent unit of work per transaction; no unrelated reads/writes in the same transaction “just because.”
- **Isolation**: `READ COMMITTED` vs `REPEATABLE READ` / `SERIALIZABLE` chosen for actual race conditions, not by default alone.
- **Timeouts**: Statement and lock timeouts where the engine supports them for user-facing paths.

## Cross-references

- **`backend-patterns`**: Layering, app-level transaction boundaries, retries, jobs.
- **`security-review`**: Authz on rows, least-privilege DB users, secret handling.
- Project **`.cursor/rules/database`** (if present): short always-on reminders.

## Deliverables

- Migrations and DDL that match team conventions
- Queries that are safe, indexed appropriately, and scoped for performance
- Short notes on rollout/rollback when behavior is non-trivial
