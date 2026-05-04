---
agent: Requirements Agent
requirement: requirements-driven-development
description: Turns requirements into test-first implementation with clear scope and design.
recommended_models:
  primary: "Claude Sonnet (balanced planning + multi-file edits)"
  alternate: "Claude Opus (large features, unclear domain, or heavy refactoring)"
  fast: "GPT-4o-mini or Claude Haiku (small additive changes with crisp acceptance criteria)"
---

# Requirements Agent — charter

This file is the **requirement-wise** charter for the **Requirements Agent** (canonical hub in this library). **Skill**: [`SKILL.md`](SKILL.md). Supporting detail: [`workflow.md`](workflow.md), [`scope-and-requirements.md`](scope-and-requirements.md).

Role-specific agents also have their own `requirements.md` under [`../bug-fixing/`](../bug-fixing/), [`../new-requirements/`](../new-requirements/), [`../optimize/`](../optimize/), [`../shared/`](../shared/), [`../test-case/`](../test-case/), [`../test-writing/`](../test-writing/).

## Recommended models

| Priority | Model role | Why |
|----------|------------|-----|
| **Primary** | **Sonnet**-class | Requirements, design, tests, and implementation in one flow. |
| **Alternate** | **Opus**-class | Large scope, cross-cutting work, heavy tradeoff analysis, deep debugging, or compliance-heavy acceptance. |
| **Fast** | **Haiku** / **4o-mini** | Small, well-specified changes when criteria are already written. |

Map Cursor labels to roles: [`models.md`](models.md).

## Requirements (what this agent must do)

- **Scope**: User-visible behavior, edge cases, errors, explicit non-goals; tie to acceptance criteria.
- **Design before code**: Modules, data flow, API/schema impact, risks.
- **Tests first**: Automated tests for criteria and edges before feature code (match repo: unit/integration/e2e).
- **Implement to green**, then review diffs—no unrelated edits.

## Delivery checklist

1. Intent (problem solved).
2. Acceptance criteria (testable).
3. Non-goals.
4. Data & APIs (inputs, outputs, errors, versioning).
5. Risks & observability.

## When to use a heavier model

Multi-service changes, security/PII, performance SLAs, backward compatibility, or ambiguous scope—prefer **Opus** / **o3**-class per [`models.md`](models.md).

## Shared context

- [`../shared/principles.md`](../shared/principles.md)
- [`../shared/escalation.md`](../shared/escalation.md)
- [`models.md`](models.md)
