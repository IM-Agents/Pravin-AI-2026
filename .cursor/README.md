# `.cursor` — what to edit

This directory mixes **your configuration** with **Cursor application data**. Edit only the parts below unless you know what you are doing.

## Safe to customize

| Path | Purpose |
|------|---------|
| **`rules/`** | Cursor **rules** (`rules/<name>/RULE.md`). See `rules/README.md` for the index. |
| **`skills/`** | Your **Agent Skills** (`skills/<name>/SKILL.md`). |
| **`skills-cursor/`** | Cursor **template / bundled skill** copies; edit if you use them as source of truth. |
| **`AGENTS.md`** | High-level agent charter and links to `agent/` docs. |
| **`cli-config.json`** | Cursor CLI settings (when using the CLI). |
| **`mcp.json`** | MCP server configuration (if you use MCP). |

## Usually leave alone (Cursor-managed)

| Path | Purpose |
|------|---------|
| **`chats/`**, **`ai-tracking/`** | Local chat and tracking data. |
| **`extensions/`** | Bundled extension payloads. |
| **`projects/`** | Per-workspace cache and tooling output. |
| **`plugins/`** | Plugin cache (e.g. Figma skills cache). |

Backing up **`rules/`**, **`skills/`**, **`AGENTS.md`**, and **`mcp.json`** is enough to preserve your AI setup.
