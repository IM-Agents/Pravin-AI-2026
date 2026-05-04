# Recommended models (per agent)

Pick models in **Cursor Settings → Models** and the Chat / Agent dropdown. Exact IDs change between releases—match **role** (reasoning vs balanced vs fast) to what you have enabled. Tier reference: [`requirements/models.md`](requirements/models.md).

Each agent’s full charter is in **`requirements.md`** inside its folder.

---

## Requirements Agent — [`requirements/requirements.md`](requirements/requirements.md)

| Priority | Suggestion | Notes |
|----------|------------|-------|
| **Primary** | **Sonnet**-class | Planning, tests, implementation in one flow |
| **Alternate** | **Opus**-class (or **o3** / **o1**-class) | Large scope, heavy refactor, ambiguous domain |
| **Fast** | **Haiku**, **GPT-4o-mini** | Small, crisp acceptance criteria |

---

## Bug Fixing Agent — [`bug-fixing/requirements.md`](bug-fixing/requirements.md)

| Priority | Suggestion | Notes |
|----------|------------|-------|
| **Primary** | **Opus**-class, **o3** / **o1**-class | Deep debugging, cross-module, subtle bugs |
| **Alternate** | **Sonnet**-class | Localized bugs, clear repro |
| **Fast** | **Haiku**, **GPT-4o-mini** | Tiny fix when cause is certain |

---

## New Requirements Agent — [`new-requirements/requirements.md`](new-requirements/requirements.md)

| Priority | Suggestion | Notes |
|----------|------------|-------|
| **Primary** | **Sonnet**-class | Scope, design, test-first implementation |
| **Alternate** | **Opus**-class | Large features, cross-cutting work |
| **Fast** | **Haiku**, **GPT-4o-mini** | Small additive changes with crisp criteria |

---

## Optimize Agent — [`optimize/requirements.md`](optimize/requirements.md)

| Priority | Suggestion | Notes |
|----------|------------|-------|
| **Primary** | **Sonnet**-class | Profile, patch, re-measure |
| **Alternate** | **Opus** / **o3**-class | Hard bottlenecks, concurrency, large refactors |
| **Fast** | **Haiku**, **GPT-4o-mini** | Obvious small wins when hotspot is known |

---

## Shared Principles Agent — [`shared/requirements.md`](shared/requirements.md)

Use the **same tier as the role you are assisting**; this table is a default when no other agent is selected.

| Priority | Suggestion | Notes |
|----------|------------|-------|
| **Primary** | **Sonnet**-class | Balanced process guidance |
| **Alternate** | **Opus**-class | High-stakes process or risk calls |
| **Fast** | **Haiku**, **GPT-4o-mini** | Lightweight reminders |

---

## Test Case Agent — [`test-case/requirements.md`](test-case/requirements.md)

| Priority | Suggestion | Notes |
|----------|------------|-------|
| **Primary** | **Sonnet**-class | Scenarios, matrices, traceability |
| **Alternate** | **Opus**-class | Complex domains, compliance-heavy acceptance |
| **Fast** | **Haiku**, **GPT-4o-mini** | Bulk rows from a fixed template |

---

## Test Writing Agent — [`test-writing/requirements.md`](test-writing/requirements.md)

| Priority | Suggestion | Notes |
|----------|------------|-------|
| **Primary** | **Sonnet**-class | Match repo patterns and structure |
| **Alternate** | **GPT-4o** / **GPT-4.1** class | Many parametrized or similar cases |
| **Fast** | **Haiku**, **GPT-4o-mini** | Boilerplate once patterns exist |
