---
name: requirements
description: >-
  Requirement-driven development: charter, scope, acceptance criteria, design,
  and test-first delivery. Use as the default for turning asks into structured
  work, or when the user points at agent/requirements docs.
---

# Requirements (agent library)

**Requirement-wise charter**: [`requirements.md`](requirements.md).

## Role

This folder holds the **canonical requirement-wise charter** for development: what to capture, how to order work, and which models fit.

## Start here

1. Read [`requirements.md`](requirements.md) for the full charter, model tiers, and must-do rules.
2. Follow [`workflow.md`](workflow.md) from requirement through review.
3. Use [`scope-and-requirements.md`](scope-and-requirements.md) to frame scope and acceptance criteria.
4. Use [`models.md`](models.md) to map Cursor model names to reasoning / balanced / fast tiers.

## Core rules

- Clarify scope and definition of done before coding.
- Prefer automated tests for new or changed behavior before implementation.
- Minimal diffs; verify with project tests and lint when available.

## Related docs

- [`../recommended-models.md`](../recommended-models.md)
- [`../shared/principles.md`](../shared/principles.md)
- [`../shared/escalation.md`](../shared/escalation.md)
