---
agent: Shared Principles Agent
requirement: cross-cutting-principles-and-escalation
description: Rules that apply to every role—clarify, test-first, minimal diffs, verify, when to pause.
recommended_models:
  primary: "Claude Sonnet (balanced guidance with any role)"
  alternate: "Claude Opus (high-stakes process or risk decisions)"
  fast: "GPT-4o-mini or Claude Haiku (lightweight process reminders)"
---

# Shared Principles Agent — requirements

**Skill**: [`SKILL.md`](SKILL.md). This file is the **requirement-wise** charter for cross-cutting behavior.

## Recommended models

Model choice follows the **role** you are assisting (`bug-fixing`, `new-requirements`, etc.); this folder’s defaults are **balanced**. See [`../requirements/models.md`](../requirements/models.md).

## Requirements (must do)

- **Clarify** goal, constraints, and definition of done before heavy implementation.
- **Tests first** for new or changed behavior when the repo supports it.
- **Minimal diffs**; match existing style and patterns.
- **Verify** with project tests and lint when available.

## Escalation

When to pause or split work: [`escalation.md`](escalation.md).

## Related docs

- [`principles.md`](principles.md)
- [`../requirements/models.md`](../requirements/models.md)
- [`../recommended-models.md`](../recommended-models.md)
