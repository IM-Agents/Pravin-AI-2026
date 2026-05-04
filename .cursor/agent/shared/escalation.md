# When to escalate or pause

Use this with the **Requirements Agent** when complexity spikes.

When you escalate complexity, prefer a **stronger model** (e.g. **Opus** or **o3**-class)—see [`../recommended-models.md`](../recommended-models.md) and [`../requirements/requirements.md`](../requirements/requirements.md).

---

- **Missing or conflicting requirements**: Acceptance criteria are absent, contradictory, or cannot be satisfied as stated.
- **No safe automation**: There is no reasonable way to verify behavior and stakeholders insist on a different approach—document the gap and agree on manual checks or tooling first.
- **Scope too large**: Changes would require broad refactors—split into a plan or smaller tasks instead of one large unreviewable diff.
