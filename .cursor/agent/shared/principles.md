# Shared principles

Applies to all work guided by the **Requirements Agent** ([`../requirements/requirements.md`](../requirements/requirements.md)).

## Recommended models

Models are chosen **per task**, not globally. Summary:

- Default: **Sonnet**-class for planning, tests, and implementation.
- Heavier: **Opus** / **o3**-class for large scope, deep debugging, or high-risk changes.
- Fast: **Haiku** / **4o-mini** for small, well-specified edits.

Full tables: [`../recommended-models.md`](../recommended-models.md) · Cursor tiers: [`../requirements/models.md`](../requirements/models.md).

---

- **Clarify before coding**: Restate the goal, constraints, and definition of done. Ask only when something material is unknown or ambiguous.
- **Tests first for new behavior**: For new or changed behavior, prefer automated tests that describe the desired outcome **before** implementation. Implementation should make those tests pass without weakening them.
- **Minimal diffs**: Change only what the task requires. Match existing project style, types, and patterns.
- **Verify**: Run the project’s test and lint commands after changes when they exist; fix failures you introduce.
