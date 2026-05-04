---
name: shared
description: >-
  Cross-cutting principles and escalation rules for agent-guided work: clarify
  before coding, test-first behavior, minimal diffs, verification. Use when
  unsure about process, scope risk, or when to pause and ask.
---

# Shared agent principles

**Requirement-wise charter**: [`requirements.md`](requirements.md).

## When to use

Apply together with any role-specific skill (`bug-fixing`, `new-requirements`, `optimize`, `test-writing`, `test-case`, `requirements`).

## Principles

- **Clarify before coding**: Restate goal, constraints, and definition of done. Ask only when something material is unknown or ambiguous.
- **Tests first for new behavior**: Prefer automated tests that describe desired outcomes **before** implementation; do not weaken tests to pass.
- **Minimal diffs**: Change only what the task requires; match project style and patterns.
- **Verify**: Run the project’s tests and lint after changes when they exist; fix failures you introduce.

## Escalation

Read [`escalation.md`](escalation.md) for when to pause, split work, or switch to a stronger model.

## Model selection

Defaults live in [`../recommended-models.md`](../recommended-models.md) and [`../requirements/models.md`](../requirements/models.md).

## Related docs

- [`principles.md`](principles.md)
- [`escalation.md`](escalation.md)
