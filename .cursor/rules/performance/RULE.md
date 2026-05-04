---
description: Performance — measure first, then optimize hot paths and I/O.
alwaysApply: true
---

# Performance

- **Measure**: Profile or use metrics before micro-optimizing; verify impact after changes.
- **Algorithms**: Prefer appropriate data structures and asymptotics for large inputs; avoid accidental O(n²) in hot loops.
- **I/O**: Batch network and DB round-trips; use pagination; cache with clear invalidation; avoid N+1 queries.
- **Assets**: Size and compress images; lazy-load heavy UI or routes when the stack supports it.
- **Concurrency**: Use async correctly; avoid blocking the main thread in UI code; watch for race conditions when parallelizing.

For **load tests, benchmarks, and performance budgets** (scripts and CI), see **`performance-testing/RULE.md`** when that rule is present.
