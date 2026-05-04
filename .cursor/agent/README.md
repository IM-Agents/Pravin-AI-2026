# Agent library

Each **role folder** has:

| File | Purpose |
|------|---------|
| **`requirements.md`** | **Requirement-wise charter**: YAML frontmatter (`agent`, `requirement`, `description`, `recommended_models`), must-do rules, model table. **Start here for that role.** |
| **`SKILL.md`** | Cursor skill instructions (links to `requirements.md`). |

| Folder | Agent name (in frontmatter) | Files |
|--------|-----------------------------|--------|
| [`bug-fixing/`](bug-fixing/) | Bug Fixing Agent | [`requirements.md`](bug-fixing/requirements.md), [`SKILL.md`](bug-fixing/SKILL.md) |
| [`new-requirements/`](new-requirements/) | New Requirements Agent | [`requirements.md`](new-requirements/requirements.md), [`SKILL.md`](new-requirements/SKILL.md) |
| [`optimize/`](optimize/) | Optimize Agent | [`requirements.md`](optimize/requirements.md), [`SKILL.md`](optimize/SKILL.md) |
| [`requirements/`](requirements/) | Requirements Agent | [`requirements.md`](requirements/requirements.md), [`workflow.md`](requirements/workflow.md), [`scope-and-requirements.md`](requirements/scope-and-requirements.md), [`models.md`](requirements/models.md), [`SKILL.md`](requirements/SKILL.md) |
| [`shared/`](shared/) | Shared Principles Agent | [`requirements.md`](shared/requirements.md), [`principles.md`](shared/principles.md), [`escalation.md`](shared/escalation.md), [`SKILL.md`](shared/SKILL.md) |
| [`test-case/`](test-case/) | Test Case Agent | [`requirements.md`](test-case/requirements.md), [`SKILL.md`](test-case/SKILL.md) |
| [`test-writing/`](test-writing/) | Test Writing Agent | [`requirements.md`](test-writing/requirements.md), [`SKILL.md`](test-writing/SKILL.md) |

**Summary tables**: [`recommended-models.md`](recommended-models.md).

## Cursor discovery

Built-in skill discovery uses **`.cursor/skills/`**. To register these as skills, copy or symlink a folder (e.g. `agent/bug-fixing` → `.cursor/skills/bug-fixing`) or `@`-mention `SKILL.md` / `requirements.md` in chat.
