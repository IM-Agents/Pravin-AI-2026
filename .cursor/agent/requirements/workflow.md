# Requirements — workflow

**Charter**: [`requirements.md`](requirements.md).

## Recommended models (short)

| Priority | Suggestion |
|----------|------------|
| Primary | **Sonnet**-class (balanced planning + implementation) |
| Alternate | **Opus**-class (large or high-risk scope, deep investigation) |
| Fast | **Haiku** / **GPT-4o-mini** (small, well-specified changes) |

Full table: [`../recommended-models.md`](../recommended-models.md).

---

1. **Requirement**: Capture user-visible behavior, edge cases, errors, and out-of-scope items. Tie work to acceptance criteria when provided.
2. **Design sketch**: Note affected modules, data flow, and any API or schema impact. Flag risks (performance, security, compatibility).
3. **Test plan (automated first)**: Write tests that encode acceptance criteria and edge cases **before** implementation (unit, integration, or e2e—use what the repo already uses).
4. **Implement**: Make tests pass with clear, maintainable code. Refactor only when tests stay green.
5. **Review**: Re-read diffs for unrelated edits; keep tests and docs consistent with what the task changed.

For deeper detail on framing scope and requirements, see [`scope-and-requirements.md`](scope-and-requirements.md).
