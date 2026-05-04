# Requirements — scope and framing

**Charter**: [`requirements.md`](requirements.md).

## Recommended models (short)

| Priority | Suggestion |
|----------|------------|
| Primary | **Sonnet**-class |
| Alternate | **Opus**-class (ambiguous scope, many stakeholders, hard bugs) |
| Fast | **Haiku** / **GPT-4o-mini** (tight criteria, doc-only drafting) |

Full table: [`../recommended-models.md`](../recommended-models.md).

---

## What to capture

- **User-visible behavior**: What changes for end users or callers of the API?
- **Edge cases**: Empty input, limits, concurrency, timeouts, partial failure.
- **Errors**: Expected error shapes, codes, or messages; what must never happen silently.
- **Out of scope**: Explicitly note what this change does *not* do to avoid scope creep.

## Acceptance criteria

- Prefer testable, observable criteria (“when X then Y”) over vague goals (“make it better”).
- If criteria are missing, draft a short proposal and confirm before heavy implementation.

## Design notes

- **Data flow**: Where data enters, transforms, and exits.
- **Breaking changes**: Call out any contract change and migration path.
- **Risks**: Performance, security, compatibility, and operational impact in a few bullets.
