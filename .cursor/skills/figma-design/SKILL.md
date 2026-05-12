---
name: figma-design
description: Translate Figma designs into production-ready React code with 1:1 visual fidelity. Use when implementing UI from Figma files, building components from designs, or extracting design tokens.
origin: custom
---

# Figma Design to Code

Workflow for implementing Figma designs as production-ready React + TypeScript components.

## When to Activate

- User shares a Figma URL (`figma.com/design/...`)
- Implementing a UI component from a design spec
- Extracting design tokens (colors, spacing, typography)
- Syncing Code Connect mappings between Figma and codebase

## MCP Tools Available (Figma Plugin)

```
mcp__plugin_figma_figma__get_design_context   → Get component code + screenshot
mcp__plugin_figma_figma__get_screenshot       → Visual snapshot of node
mcp__plugin_figma_figma__get_metadata         → File/node info
mcp__plugin_figma_figma__get_variable_defs    → Design tokens (colors, spacing)
mcp__plugin_figma_figma__search_design_system → Search components in design system
mcp__plugin_figma_figma__whoami               → Verify Figma connection
```

## URL Parsing

Extract `fileKey` and `nodeId` from Figma URLs:

```
figma.com/design/:fileKey/:fileName?node-id=:nodeId
→ convert "-" to ":" in nodeId

figma.com/design/:fileKey/branch/:branchKey/:fileName
→ use branchKey as fileKey

figma.com/board/:fileKey/:fileName
→ FigJam file, use get_figjam
```


You are a Figma pixel-perfect design converter.

When user provides:
- Figma URL
- Frame ID
- Node ID

You must:
1. Extract layout
2. Extract spacing
3. Extract typography
4. Extract colors
5. Convert to pixel perfect CSS / Tailwind / Polaris
6. Maintain exact spacing and sizes
7. Do not approximate values

Always generate:
- structured JSON spec
- pixel-perfect CSS
- React component


## Implementation Workflow

### Step 1 — Get the Design
```
mcp__plugin_figma_figma__get_design_context(fileKey, nodeId)
```
Returns: React code reference, screenshot, design hints

### Step 2 — Check Existing Components
Before writing new code:
- Search project for similar components: `Grep "component-name" src/`
- Check if design system already has it
- Reuse existing components where intent matches

### Step 3 — Adapt to Project Stack
The MCP returns React + Tailwind as a reference — adapt to this project:
- Use **Webpack + esbuild** (not Vite/Next.js imports)
- Use **TypeScript** with proper interfaces for props
- Use project's existing CSS/styling approach
- Map Figma tokens to project's design tokens/CSS variables

### Step 4 — Validate Visually
```
mcp__plugin_figma_figma__get_screenshot(fileKey, nodeId)
```
Compare screenshot to rendered component — check spacing, colors, typography.

## Component Structure

```typescript
// Standard component from Figma spec
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

export function Button({ label, variant = 'primary', size = 'md', disabled, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
```

## Design Token Extraction

```
mcp__plugin_figma_figma__get_variable_defs(fileKey)
```

Map Figma variables to CSS custom properties:

```css
/* From Figma variables */
:root {
  --color-primary: #6366f1;
  --color-text: #111827;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --radius-md: 8px;
}
```

## Checklist

- [ ] Fetched design context with `get_design_context`
- [ ] Checked project for existing matching components
- [ ] Props typed with TypeScript interface
- [ ] Design tokens mapped to CSS variables
- [ ] Visual comparison done with `get_screenshot`
- [ ] Responsive behavior matches design
- [ ] Accessibility: aria labels, keyboard nav, focus states
- [ ] Component added to relevant index/exports

## Electron Considerations

For Electron desktop UI:
- Use `data-testid` attributes for Playwright E2E selectors
- Avoid `window.open()` — use Electron's `shell.openExternal()`
- IPC calls (`window.electronAPI.*`) stay in component, not in shared lib
- Test with Electron's DevTools for pixel-accurate comparison
