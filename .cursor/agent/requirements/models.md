# Model selection (Cursor)

Summary: [`../recommended-models.md`](../recommended-models.md).

Cursor’s **exact model IDs** change over time. Confirm names under **Cursor Settings → Models** and the **model dropdown**. Each **agent** folder has a **`requirements.md`** with primary/alternate/fast picks; this file maps **tiers** (reasoning vs balanced vs fast) to typical model families. Start from the role charter, then match tiers here.

## Roles

| Role | Typical use | Examples you may see |
|------|-------------|----------------------|
| **Reasoning / heavy** | Deep debugging, multi-file analysis, large refactors | Claude **Opus**; OpenAI **o3** / **o1** class; “MAX” context |
| **Balanced** | Design, implementation, tests | Claude **Sonnet**; **GPT-4o** / **GPT-4.1** |
| **Fast / economical** | Boilerplate, many similar items | Claude **Haiku**; **GPT-4o-mini**; **Gemini Flash** class |

If a named model is not in your build, choose the same **tier** from your enabled list.
