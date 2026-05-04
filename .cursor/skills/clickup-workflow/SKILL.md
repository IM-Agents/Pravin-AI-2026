---
name: clickup-workflow
description: >-
  ClickUp task hygiene — IDs, statuses, linking PRs, and comment conventions. Use when
  the team tracks work in ClickUp and you need to align tasks, branches, and reviews.
---

# ClickUp workflow

## When to activate

- Creating or updating ClickUp tasks from engineering work
- Linking branches, PRs, or commits to ClickUp items
- Moving tasks through team-defined statuses
- Writing acceptance criteria or handoff notes in ClickUp

## Principles

1. **Single source of truth**: One primary task per feature/fix when possible; split spikes or subtasks explicitly.
2. **IDs in commits/PRs**: Include the ClickUp task ID in branch names or PR titles if the team requires it (e.g. `CU-1234-short-description`).
3. **Status**: Update status only when work actually reaches that stage; avoid noisy back-and-forth.
4. **Links**: Paste PR URLs and deployment notes in the task for reviewers and QA.
5. **Closure**: Close or verify tasks only after definition of done (tests, review, deploy) per team policy.

## Deliverables

- Task title and description that match the actual scope
- Clear acceptance criteria or checklist
- Links to PR and any relevant docs or designs

**Note:** Space/list IDs, custom fields, and automation differ per workspace—follow the project’s written ClickUp policy when it conflicts with generic advice.
