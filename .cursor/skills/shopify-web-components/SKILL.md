---
name: shopify-web-components
description: Shopify Polaris Web Components for App Home — building UI with native web components, layout, forms, overlays, and actions in Shopify embedded apps.
origin: https://shopify.dev/docs/api/app-home/web-components
---

# Shopify Polaris Web Components

Use when building UI for a Shopify embedded app using native web components (no React required).
All components use the **`s-`** prefix (e.g. `<s-button>`, `<s-section>`, `<s-stack>`).

## When to Activate

- Building or modifying Shopify App Home UI
- Using Polaris components as HTML custom elements (`<s-button>`, `<s-modal>`, etc.)
- Implementing forms, layouts, overlays, or actions in a Shopify embedded app
- Using `commandFor` / `--show` / `--hide` patterns for component interaction

---

## Installation

### CDN (HTML/plain JS)
```html
<head>
  <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
</head>
```

### Remix (`app/root.tsx`)
```tsx
<script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
```

---

## Component Reference

### Actions

#### `<s-button>`
Triggers actions, form submits, dialogs, or navigation.

```html
<!-- Primary action -->
<s-button variant="primary">Save</s-button>

<!-- Destructive action -->
<s-button variant="primary" tone="critical">Delete</s-button>

<!-- Icon-only (accessibility label required) -->
<s-button icon="duplicate" variant="tertiary" accessibilityLabel="Duplicate item"></s-button>

<!-- Loading state -->
<s-button loading variant="primary">Saving...</s-button>

<!-- Link button -->
<s-button href="/admin/products" target="_blank">View Products</s-button>

<!-- Trigger another component -->
<s-button commandFor="my-modal" command="--show">Open Modal</s-button>
```

**Key attributes:**
| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `"primary"` `"secondary"` `"tertiary"` `"auto"` | `"auto"` |
| `tone` | `"critical"` `"neutral"` `"auto"` | `"auto"` |
| `icon` | icon name string | — |
| `disabled` | boolean | false |
| `loading` | boolean | false |
| `type` | `"button"` `"submit"` `"reset"` | `"button"` |
| `href` | URL string | — |
| `target` | `"_blank"` `"_self"` `"_parent"` `"_top"` `"auto"` | `"auto"` |
| `download` | string (filename) | — |
| `commandFor` | element ID | — |
| `command` | `"--show"` `"--hide"` `"--toggle"` `"--auto"` | `"--auto"` |
| `accessibilityLabel` | string | — |

**Events:** `click`, `focus`, `blur`

#### `<s-menu>`
Display a list of actions on a resource.

```html
<s-button id="menu-trigger" commandFor="actions-menu" command="--show">
  Actions
</s-button>

<s-menu id="actions-menu">
  <s-button>Edit</s-button>
  <s-button tone="critical">Delete</s-button>
</s-menu>
```

#### `<s-link>`
```html
<s-link href="/admin/products">View all products</s-link>
<s-link href="https://example.com" target="_blank">External link</s-link>
```

---

### Layout & Structure

#### `<s-page>`
Top-level page container with built-in heading, breadcrumbs, and action slots.

```html
<s-page heading="Products" inline-size="base">
  <!-- Breadcrumb -->
  <s-link slot="breadcrumb-actions" href="/products">Products</s-link>

  <!-- Primary action -->
  <s-button slot="primary-action" variant="primary">Save</s-button>

  <!-- Secondary actions -->
  <s-button slot="secondary-actions">Preview</s-button>

  <!-- Main content -->
  <s-section heading="Product details">
    <!-- content -->
  </s-section>

  <!-- Aside (only with inline-size="base") -->
  <s-box slot="aside">
    <s-section heading="Status">...</s-section>
  </s-box>
</s-page>
```

**Key attributes:**
| Attribute | Values | Default |
|-----------|--------|---------|
| `heading` | string | — |
| `inline-size` | `"small"` `"base"` `"large"` | `"base"` |

**Slots:** `breadcrumb-actions`, `primary-action`, `secondary-actions`, `aside`, default (content)

#### `<s-section>`
Groups related content within a page. Heading level auto-increments based on nesting depth.

```html
<s-section heading="Product details">
  <s-stack>
    <!-- content -->
  </s-stack>
</s-section>

<!-- No padding (e.g. for full-width tables) -->
<s-section heading="Orders" padding="none">
  <s-table>...</s-table>
</s-section>
```

**Key attributes:**
| Attribute | Values | Default |
|-----------|--------|---------|
| `heading` | string | — |
| `padding` | `"base"` `"none"` | `"base"` |
| `accessibilityLabel` | string | — |

#### `<s-stack>`
Flexible layout container (flex-based).

```html
<!-- Vertical stack (default) -->
<s-stack gap="base">
  <s-text>Item 1</s-text>
  <s-text>Item 2</s-text>
</s-stack>

<!-- Horizontal stack -->
<s-stack direction="inline" gap="base" justifyContent="space-between" alignItems="center">
  <s-button>Cancel</s-button>
  <s-button variant="primary">Save</s-button>
</s-stack>

<!-- Responsive layout -->
<s-query-container>
  <s-stack
    direction="@container (inline-size > 500px) inline, block"
    gap="@container (inline-size > 500px) base, large-200"
  >
    <!-- content -->
  </s-stack>
</s-query-container>
```

**Key attributes:**
| Attribute | Values | Default |
|-----------|--------|---------|
| `direction` | `"block"` `"inline"` (or responsive query) | `"block"` |
| `gap` | token string e.g. `"base"` `"large-100"` `"none"` | — |
| `justifyContent` | `"space-between"` `"center"` `"start"` `"end"` etc. | — |
| `alignItems` | `"center"` `"start"` `"end"` `"stretch"` etc. | — |

> ⚠️ Use `direction="inline"` for horizontal — NOT `"horizontal"`. Use `direction="block"` for vertical — NOT `"vertical"`.

#### `<s-grid>` + `<s-grid-item>`
CSS grid-based layout.

```html
<s-grid gridTemplateColumns="repeat(2, 1fr)" gap="base">
  <s-grid-item gridColumn="span 1">Column 1</s-grid-item>
  <s-grid-item gridColumn="span 1">Column 2</s-grid-item>
</s-grid>

<!-- 3-column grid -->
<s-grid gridTemplateColumns="repeat(3, 1fr)" gap="base">
  <s-grid-item>Card 1</s-grid-item>
  <s-grid-item>Card 2</s-grid-item>
  <s-grid-item>Card 3</s-grid-item>
</s-grid>
```

**Key attributes (`s-grid`):**
| Attribute | Values |
|-----------|--------|
| `gridTemplateColumns` | CSS track sizing e.g. `"repeat(2, 1fr)"` `"1fr auto"` |
| `gridTemplateRows` | CSS track sizing |
| `gap` | token string |
| `alignItems` | alignment keyword |
| `justifyContent` | alignment keyword |

**Key attributes (`s-grid-item`):**
| Attribute | Values | Default |
|-----------|--------|---------|
| `gridColumn` | `"span N"` or CSS grid value | `"auto"` |
| `gridRow` | `"span N"` or CSS grid value | `"auto"` |

#### `<s-box>`
Generic container with spacing/styling props.

```html
<s-box padding="base" background="subdued" border="base" borderRadius="base">
  Content
</s-box>
```

**Key attributes:**
| Attribute | Values | Default |
|-----------|--------|---------|
| `padding` | token or responsive | `"none"` |
| `background` | `"transparent"` `"subdued"` `"base"` `"strong"` | `"transparent"` |
| `border` | `"none"` `"base"` | `"none"` |
| `borderRadius` | token | `"none"` |
| `overflow` | `"visible"` `"hidden"` | `"visible"` |
| `inlineSize` | size unit | `"auto"` |
| `blockSize` | size unit | `"auto"` |

#### `<s-divider>`
```html
<s-divider></s-divider>
```

---

### Data

#### `<s-table>` + sub-components

`<s-table>` uses its **own child elements** — never wrap a native `<table>` inside it.

```html
<s-section heading="Orders" padding="none">
  <s-table variant="auto">
    <s-table-header-row>
      <s-table-header listSlot="primary">Day</s-table-header>
      <s-table-header listSlot="labeled">Order limit</s-table-header>
    </s-table-header-row>
    <s-table-body>
      <s-table-row>
        <s-table-cell>Monday</s-table-cell>
        <s-table-cell>25</s-table-cell>
      </s-table-row>
    </s-table-body>
  </s-table>
</s-section>
```

**`<s-table>` key attributes:**
| Attribute | Values | Description |
|-----------|--------|-------------|
| `variant` | `"auto"` `"table"` `"list"` | `"auto"` = table on wide, list on mobile |
| `loading` | boolean | Shows loading overlay |
| `paginate` | boolean | Enable pagination controls |

**`<s-table-header>` key attributes:**
| Attribute | Values | Description |
|-----------|--------|-------------|
| `listSlot` | `"primary"` `"secondary"` `"kicker"` `"inline"` `"labeled"` | Controls mobile list display |
| `format` | `"numeric"` `"currency"` | Right-aligns numeric/currency columns |
| `width` | CSS size | Fixed column width |

**Child elements:**
| Tag | Purpose |
|-----|---------|
| `<s-table-header-row>` | Container for header cells |
| `<s-table-header>` | A single column header |
| `<s-table-body>` | Container for data rows |
| `<s-table-row>` | A single data row |
| `<s-table-cell>` | A single data cell |

> ⚠️ Register all 5 sub-tags in jsdom test setup: `s-table-header-row`, `s-table-header`, `s-table-body`, `s-table-row`, `s-table-cell`

---

### Forms

#### `<s-text-field>`
```html
<s-text-field
  label="Product name"
  value="My Product"
  placeholder="Enter name"
  details="Max 255 characters"
></s-text-field>

<!-- Number type -->
<s-text-field label="Price" type="number" value="9.99"></s-text-field>

<!-- With error -->
<s-text-field label="Email" error="Invalid email address"></s-text-field>

<!-- Disabled / read-only -->
<s-text-field label="Store URL" value="my-store.myshopify.com" readOnly></s-text-field>
```

**Key attributes:** `label`, `value`, `placeholder`, `details`, `error`, `type`, `disabled`, `readOnly`, `required`, `id`, `name`

#### `<s-select>` + `<s-option>` + `<s-option-group>`
```html
<s-select label="Status" value="active">
  <s-option value="active">Active</s-option>
  <s-option value="draft">Draft</s-option>
  <s-option-group label="Advanced">
    <s-option value="archived">Archived</s-option>
  </s-option-group>
</s-select>
```

**Key attributes (`s-select`):** `label`, `value`, `placeholder`, `disabled`, `required`, `error`, `details`, `id`, `name`
**Events:** `change`, `input`

#### `<s-checkbox>`
```html
<s-checkbox label="Enable notifications" checked></s-checkbox>
<s-checkbox label="Agree to terms" details="Required to continue" required></s-checkbox>
```

**Key attributes:** `label`, `checked`, `defaultChecked`, `indeterminate`, `disabled`, `required`, `error`, `details`, `value`, `id`, `name`
**Events:** `change`, `input`

#### `<s-switch>`
```html
<s-switch label="Enable feature" checked></s-switch>
```

#### `<s-number-field>`
```html
<s-number-field label="Quantity" value="1" min="0" max="100"></s-number-field>
```

#### `<s-date-picker>`
```html
<s-date-picker label="Start date" month="1" year="2026"></s-date-picker>
```

---

### Overlays

#### `<s-modal>`
Focused overlay for decisions or data entry.

```html
<!-- Trigger -->
<s-button commandFor="confirm-modal" command="--show">Delete product</s-button>

<!-- Modal -->
<s-modal
  id="confirm-modal"
  heading="Delete product?"
  accessibilityLabel="Confirm product deletion"
  size="small"
>
  <s-paragraph>This action cannot be undone.</s-paragraph>

  <s-button slot="primary-action" tone="critical" commandFor="confirm-modal" command="--hide">
    Delete
  </s-button>
  <s-button slot="secondary-actions" commandFor="confirm-modal" command="--hide">
    Cancel
  </s-button>
</s-modal>
```

**Key attributes:**
| Attribute | Values | Default |
|-----------|--------|---------|
| `heading` | string | — |
| `accessibilityLabel` | string | — |
| `size` | `"small"` `"small-100"` `"base"` `"large"` `"large-100"` | `"base"` |
| `padding` | `"base"` `"none"` | `"base"` |

**Slots:** `children` (content), `primary-action`, `secondary-actions`

> **Important:** Modals cannot open programmatically on page load — they require user interaction.

#### `<s-popover>`
```html
<s-button commandFor="info-popover" command="--toggle">More info</s-button>

<s-popover id="info-popover">
  <s-paragraph>This is additional context.</s-paragraph>
</s-popover>
```

---

### Feedback & Status

#### `<s-badge>`
```html
<s-badge tone="success">Active</s-badge>
<s-badge tone="warning">Pending</s-badge>
<s-badge tone="critical">Rejected</s-badge>
<s-badge tone="info">New</s-badge>
<s-badge tone="warning" icon="clock">Scheduled</s-badge>
```

**Key attributes:** `tone` (`"info"` `"success"` `"warning"` `"critical"`), `progress` (`"incomplete"` `"partiallyComplete"` `"complete"`), `size` (`"base"` `"large"`), `icon`

#### `<s-banner>`
```html
<s-banner heading="Order archived" tone="info" dismissible>
  This order was archived on March 7, 2017.
</s-banner>

<s-banner heading="Products missing weights" tone="warning">
  Products without weights may show inaccurate shipping rates.
  <s-button slot="secondary-actions" variant="secondary" href="/admin/products">
    Review products
  </s-button>
</s-banner>
```

**Key attributes:** `heading`, `tone` (`"info"` `"success"` `"warning"` `"critical"` `"auto"`), `dismissible`, `hidden`
**Slots:** `children` (content), `secondary-actions`
**Events:** `dismiss`, `afterhide`

#### `<s-spinner>`
```html
<s-spinner size="small"></s-spinner>
<s-spinner size="large"></s-spinner>
```

---

### Typography

#### `<s-heading>`
Auto-assigns h2/h3/h4 level based on nesting depth inside `<s-section>`.

```html
<s-heading>Section title</s-heading>
<s-heading lineClamp="2">Truncated at 2 lines</s-heading>
```

**Key attributes:** `accessibilityRole` (`"heading"` `"none"` `"presentation"`), `lineClamp` (number)

#### `<s-paragraph>`
```html
<s-paragraph>Body copy with <s-link href="#">a link</s-link>.</s-paragraph>
```

#### `<s-text>`
Inline text with semantic tone and color.

```html
<s-text color="subdued">Secondary text</s-text>
<s-text tone="success">Order fulfilled</s-text>
<s-text tone="critical">Payment failed</s-text>
<s-text type="strong">Bold label</s-text>
```

**Key attributes:**
| Attribute | Values | Default |
|-----------|--------|---------|
| `color` | `"base"` `"subdued"` | `"base"` |
| `tone` | `"info"` `"success"` `"warning"` `"critical"` `"neutral"` `"caution"` `"auto"` | `"auto"` |
| `type` | `"strong"` `"generic"` `"address"` `"redundant"` | `"generic"` |

> ⚠️ Use `color="subdued"` for muted text — NOT `tone="subdued"`.

#### `<s-tooltip>`
```html
<s-tooltip id="tip1">More information about this field</s-tooltip>
<s-text interestFor="tip1">What is a product SKU?</s-text>
```

---

### Media & Visuals

#### `<s-icon>`
```html
<s-icon source="ProductIcon"></s-icon>
<s-icon source="DeleteIcon" tone="critical"></s-icon>
```

#### `<s-avatar>`
```html
<s-avatar initials="JD" name="John Doe"></s-avatar>
<s-avatar src="https://example.com/avatar.jpg" name="Jane Smith"></s-avatar>
```

#### `<s-thumbnail>`
```html
<s-thumbnail src="https://example.com/product.jpg" alt="Product image" size="small"></s-thumbnail>
```

---

## Common Patterns

### Page with Save Bar (App Bridge)
```html
<s-page heading="Edit product">
  <s-button slot="primary-action" variant="primary" id="save-btn">Save</s-button>

  <s-section heading="Product">
    <s-text-field id="product-name" label="Name" value="My Product"></s-text-field>
  </s-section>
</s-page>

<script>
  document.getElementById('product-name').addEventListener('change', () => {
    shopify.saveBar.show('my-save-bar')
  })
  document.getElementById('save-btn').addEventListener('click', () => {
    shopify.saveBar.hide('my-save-bar')
  })
</script>
```

### Confirmation Dialog
```html
<s-button commandFor="delete-dialog" command="--show" tone="critical">Delete</s-button>

<s-modal id="delete-dialog" heading="Confirm deletion" size="small" accessibilityLabel="Confirm delete">
  <s-paragraph>Are you sure? This cannot be undone.</s-paragraph>
  <s-button slot="primary-action" tone="critical" id="confirm-delete">Yes, delete</s-button>
  <s-button slot="secondary-actions" commandFor="delete-dialog" command="--hide">Cancel</s-button>
</s-modal>
```

### Data Table
```html
<s-section heading="Orders" padding="none">
  <s-table variant="auto">
    <s-table-header-row>
      <s-table-header listSlot="primary">Product</s-table-header>
      <s-table-header listSlot="labeled">Price</s-table-header>
      <s-table-header listSlot="labeled">Status</s-table-header>
    </s-table-header-row>
    <s-table-body>
      <s-table-row>
        <s-table-cell>Product A</s-table-cell>
        <s-table-cell>$9.99</s-table-cell>
        <s-table-cell><s-badge tone="success">Active</s-badge></s-table-cell>
      </s-table-row>
    </s-table-body>
  </s-table>
</s-section>
```

> ⚠️ **NEVER** put a native `<table>/<thead>/<tbody>/<tr>/<td>` inside `<s-table>`. The component has its own child elements.

### Two-column form layout
```html
<s-grid gridTemplateColumns="repeat(2, 1fr)" gap="base">
  <s-grid-item gridColumn="span 1">
    <s-text-field label="First name"></s-text-field>
  </s-grid-item>
  <s-grid-item gridColumn="span 1">
    <s-text-field label="Last name"></s-text-field>
  </s-grid-item>
</s-grid>
```

---

## Best Practices

- Use `variant="primary"` for one main CTA per page/section — avoid multiple primaries
- Always provide `accessibilityLabel` for icon-only buttons
- Use `tone="critical"` exclusively for destructive actions (delete, remove)
- Prefer `<s-stack>` over raw CSS for consistent spacing
- Use `direction="inline"` for horizontal stacks — NOT `"horizontal"`
- Use `color="subdued"` on `<s-text>` for muted text — NOT `tone="subdued"`
- Use `<s-grid gridTemplateColumns="repeat(N, 1fr)">` + `<s-grid-item>` for grid layouts — NOT a `columns` shorthand
- Never open modals on page load — always require user interaction
- Use `commandFor` + `command` attributes before reaching for JavaScript
- Gap values use design tokens (`"base"`, `"large-100"`, `"none"`) — NOT numeric strings like `"400"`

---

## React Event Bridge Pattern

`<s-checkbox>`, `<s-select>`, `<s-number-field>`, and `<s-switch>` fire **native DOM `change` events**, not React synthetic events. Use `useRef` + `useWebComponentEvent` to bridge them:

```jsx
// hooks/useWebComponentEvent.js
import { useEffect } from 'react';
export default function useWebComponentEvent(ref, eventName, handler) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !handler) return;
    el.addEventListener(eventName, handler);
    return () => el.removeEventListener(eventName, handler);
  }, [ref, eventName, handler]);
}
```

**Wrapper pattern (e.g. SSelect):**
```jsx
import { useRef } from 'react';
import useWebComponentEvent from '../../hooks/useWebComponentEvent.js';

export default function SSelect({ label, value, options, defaultOptionLabel, onChange }) {
  const ref = useRef(null);
  useWebComponentEvent(ref, 'change', (e) => {
    onChange?.(e.detail?.value ?? e.target?.value ?? '');
  });
  return (
    <s-select ref={ref} label={label} value={value || undefined}>
      {defaultOptionLabel && <s-option value="">{defaultOptionLabel}</s-option>}
      {options.map((opt) => (
        <s-option key={opt.value} value={opt.value}>{opt.label}</s-option>
      ))}
    </s-select>
  );
}
```

**Change event value extraction:**
| Component | How to get value |
|-----------|-----------------|
| `<s-checkbox>` | No value needed — just call `onChange()` |
| `<s-switch>` | No value needed — just call `onChange()` |
| `<s-select>` | `e.detail?.value ?? e.target?.value` |
| `<s-number-field>` | `Number(e.detail?.value ?? e.target?.value)` |

**Testing wrappers with jsdom:**
- Fire `new CustomEvent('change', { bubbles: true, detail: { value: '09:00' } })` for select/number
- Fire `new Event('change', { bubbles: true })` for checkbox/switch
- Query by attribute: `container.querySelector('s-select[label="Order cut-off time"]')`
- Register all `s-*` tags as `HTMLElement` stubs in `src/test/setup.js`

> ⚠️ `<s-button>` is the exception — React 19 handles `onClick` directly on custom elements, no wrapper needed.

---

## Full Component List

| Category | Tag Names |
|----------|-----------|
| Actions | `s-button`, `s-link`, `s-menu`, `s-button-group`, `s-clickable`, `s-clickable-chip` |
| Layout | `s-page`, `s-section`, `s-stack`, `s-grid`, `s-grid-item`, `s-box`, `s-divider`, `s-query-container`, `s-ordered-list`, `s-unordered-list` |
| Data | `s-table`, `s-table-header-row`, `s-table-header`, `s-table-body`, `s-table-row`, `s-table-cell` |
| Forms | `s-text-field`, `s-select`, `s-option`, `s-option-group`, `s-checkbox`, `s-switch`, `s-choice-list`, `s-number-field`, `s-money-field`, `s-color-field`, `s-color-picker`, `s-date-field`, `s-date-picker`, `s-email-field`, `s-password-field`, `s-search-field`, `s-text-area`, `s-url-field`, `s-drop-zone` |
| Overlays | `s-modal`, `s-popover` |
| Feedback | `s-badge`, `s-banner`, `s-spinner` |
| Typography | `s-heading`, `s-paragraph`, `s-text`, `s-chip`, `s-tooltip` |
| Media | `s-icon`, `s-avatar`, `s-image`, `s-thumbnail` |
| App Bridge | `s-save-bar` |
