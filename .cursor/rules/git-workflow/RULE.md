---
description: Git workflow — branches, commits, PRs, and reviews.
alwaysApply: true
---

# Git workflow

- **Branches**: Use short, descriptive branch names aligned with team convention (e.g. `feature/`, `fix/`, `chore/`); avoid long-lived branches without syncing main regularly.
- **Commits**: Atomic commits when practical; subject line imperative mood and ~50–72 chars; body for context when the *why* is not obvious from the diff.
- **PRs**: Describe intent, scope, and testing done; link tickets (ClickUp, Jira, etc.) when the team uses them; keep PRs reviewable in size.
- **Review**: Address feedback or explain tradeoffs; resolve conversations when fixed; avoid force-pushing in ways that lose review context unless agreed.
- **Main branch**: Keep default branch green; do not merge known broken builds unless policy explicitly allows hotfix paths.
