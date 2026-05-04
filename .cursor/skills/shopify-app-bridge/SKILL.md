---
name: shopify-app-bridge
description: Shopify App Bridge APIs and useAppBridge React hook — toast, navigation, resource picker, save bar, modals, and all App Bridge APIs for Shopify embedded apps.
origin: https://shopify.dev/docs/api/app-home/apis/react-hooks/useappbridge
---

# Shopify App Bridge — `useAppBridge` & APIs

Use when building Shopify embedded apps that need to interact with the Shopify admin shell: toasts, navigation, resource pickers, save bars, modals, ID tokens, and more.

## When to Activate

- Using `useAppBridge` hook in React components
- Showing toast notifications in Shopify admin
- Opening resource pickers (products, variants, collections, etc.)
- Implementing save bars for unsaved changes
- Navigating within the Shopify admin
- Fetching authenticated requests to the Admin API
- Getting merchant user info, app config, or ID tokens
- Showing confirmation modals or loading indicators

---

## Setup

### Requirements
- `@shopify/app-bridge-react` v4+
- `app-bridge.js` script tag in your app's HTML

### Installation
```bash
npm install @shopify/app-bridge-react
```

### Script tag (Remix `app/root.tsx`)
```tsx
export default function App() {
  return (
    <html>
      <head>
        {/* App Bridge script — must be loaded before using shopify global */}
        <script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          data-api-key={process.env.SHOPIFY_API_KEY}
        />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  )
}
```

---

## `useAppBridge` Hook

### Description
Returns the `shopify` global variable in browser environments, or a safe SSR proxy on the server.

### Import
```tsx
import { useAppBridge } from '@shopify/app-bridge-react'
```

### Signature
```tsx
function useAppBridge(): ShopifyGlobal
```

### Return Value
The `shopify` object — same as `window.shopify` — with access to all App Bridge APIs.

### Basic Usage
```tsx
import { useAppBridge } from '@shopify/app-bridge-react'

export function SaveButton() {
  const shopify = useAppBridge()

  async function handleSave() {
    await saveData()
    shopify.toast.show('Saved successfully')
  }

  return <button onClick={handleSave}>Save</button>
}
```

### SSR Safety
The hook returns a proxy object during server-side rendering, so all API calls are no-ops on the server — safe to call without environment guards.

```tsx
// ✅ Safe — useAppBridge handles SSR automatically
const shopify = useAppBridge()
shopify.toast.show('Hello') // no-op on server, works in browser

// ❌ Avoid direct window access
window.shopify.toast.show('Hello') // crashes on server
```

---

## Available APIs

All APIs are accessed via the `shopify` object returned by `useAppBridge()`.

---

### Toast API — `shopify.toast`

Show brief feedback messages to merchants.

```tsx
const shopify = useAppBridge()

// Success toast
shopify.toast.show('Product saved')

// Error toast
shopify.toast.show('Failed to save', { isError: true })

// Custom duration (ms, default: 5000)
shopify.toast.show('Processing...', { duration: 10000 })

// With dismiss callback
shopify.toast.show('Item removed', {
  onDismiss: () => console.log('Toast dismissed'),
})

// Hide programmatically
const toastId = shopify.toast.show('Loading...')
shopify.toast.hide(toastId)
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `isError` | boolean | `false` | Show as error (red) |
| `duration` | number | `5000` | Display time in ms |
| `onDismiss` | function | — | Callback when dismissed |

---

### Navigation API — `shopify.navigate`

Navigate within the Shopify admin.

```tsx
const shopify = useAppBridge()

// Navigate to a path in your app
shopify.navigate('/products')

// Navigate to a Shopify admin page
shopify.navigate('shopify://admin/products')

// Navigate to orders
shopify.navigate('shopify://admin/orders')

// Open in new tab
shopify.navigate('https://example.com', { target: '_blank' })
```

---

### Resource Picker API — `shopify.resourcePicker`

Let merchants search and select Shopify resources.

```tsx
const shopify = useAppBridge()

// Pick products
async function pickProducts() {
  const selection = await shopify.resourcePicker({
    type: 'product',
    action: 'select',
    multiple: true,
    selectionIds: [{ id: 'gid://shopify/Product/123' }], // pre-selected
  })

  if (selection) {
    console.log('Selected products:', selection)
  }
}

// Pick variants
async function pickVariants() {
  const selection = await shopify.resourcePicker({
    type: 'variant',
    multiple: true,
  })
}

// Pick collections
async function pickCollections() {
  const selection = await shopify.resourcePicker({
    type: 'collection',
    multiple: false,
  })
}
```

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `type` | `'product'` `'variant'` `'collection'` | Resource type |
| `action` | `'select'` `'add'` | Picker mode |
| `multiple` | boolean | Allow multiple selection |
| `selectionIds` | `{id: string}[]` | Pre-selected IDs |
| `filter` | object | Filter resources |

---

### Save Bar API — `shopify.saveBar`

Display a contextual bar prompting merchants to save or discard changes.

```tsx
const shopify = useAppBridge()

// Show save bar
shopify.saveBar.show('my-save-bar')

// Hide save bar
shopify.saveBar.hide('my-save-bar')

// Full example with HTML save bar component
```

```html
<!-- In your HTML template -->
<ui-save-bar id="my-save-bar">
  <button variant="primary" id="save-btn">Save</button>
  <button id="discard-btn">Discard</button>
</ui-save-bar>

<script>
  document.getElementById('save-btn').addEventListener('click', async () => {
    await saveChanges()
    shopify.saveBar.hide('my-save-bar')
  })

  document.getElementById('discard-btn').addEventListener('click', () => {
    resetForm()
    shopify.saveBar.hide('my-save-bar')
  })
</script>
```

**React pattern:**
```tsx
export function ProductForm() {
  const shopify = useAppBridge()
  const [isDirty, setIsDirty] = useState(false)

  function handleChange() {
    setIsDirty(true)
    shopify.saveBar.show('product-save-bar')
  }

  async function handleSave() {
    await save()
    setIsDirty(false)
    shopify.saveBar.hide('product-save-bar')
  }

  function handleDiscard() {
    reset()
    setIsDirty(false)
    shopify.saveBar.hide('product-save-bar')
  }

  return (
    <>
      <ui-save-bar id="product-save-bar">
        <button variant="primary" onClick={handleSave}>Save</button>
        <button onClick={handleDiscard}>Discard</button>
      </ui-save-bar>

      <input onChange={handleChange} />
    </>
  )
}
```

---

### Modal API — `shopify.modal`

Show a confirmation dialog or prompt.

```tsx
const shopify = useAppBridge()

// Simple confirmation
const confirmed = await shopify.modal.show({
  title: 'Delete product?',
  message: 'This action cannot be undone.',
  primaryAction: { content: 'Delete', destructive: true },
  secondaryActions: [{ content: 'Cancel' }],
})

if (confirmed) {
  await deleteProduct()
}
```

---

### Loading API — `shopify.loading`

Show/hide the full-page loading indicator.

```tsx
const shopify = useAppBridge()

shopify.loading.dispatch(true)   // show
shopify.loading.dispatch(false)  // hide

// Usage in async flow
async function fetchData() {
  shopify.loading.dispatch(true)
  try {
    const data = await loadProducts()
    return data
  } finally {
    shopify.loading.dispatch(false)
  }
}
```

---

### ID Token API — `shopify.idToken`

Generate session tokens for authenticating server requests.

```tsx
const shopify = useAppBridge()

async function authenticatedFetch(url: string) {
  const token = await shopify.idToken()

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
```

---

### Resource Fetching API — `shopify.fetch` / `fetch`

Make authenticated requests to the GraphQL Admin API. Uses the standard `fetch` API with automatic session authentication.

```tsx
// In Remix loaders/actions, use the standard fetch
// App Bridge wraps it automatically when using the script tag

// GraphQL Admin API query
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query {
        products(first: 10) {
          edges {
            node { id title }
          }
        }
      }
    `,
  }),
})
```

---

### User API — `shopify.user`

Access merchant account information.

```tsx
const shopify = useAppBridge()

const user = await shopify.user()
// { name: 'John Doe', email: 'john@example.com', locale: 'en-US' }
```

---

### Config API — `shopify.config`

Read settings from `shopify.app.toml`.

```tsx
const shopify = useAppBridge()

const config = shopify.config
// { apiKey: '...', shop: 'myshop.myshopify.com', locale: 'en' }
```

---

### Environment API — `shopify.environment`

Detect the current platform and runtime context.

```tsx
const shopify = useAppBridge()

const env = shopify.environment
// { mobile: false, pos: false, ... }

if (shopify.environment.mobile) {
  // Mobile-specific behavior
}
```

---

### Scopes API — `shopify.scopes`

Query and request OAuth permission scopes.

```tsx
const shopify = useAppBridge()

// Check current scopes
const { scopes } = await shopify.scopes.query()

// Request additional scopes
await shopify.scopes.request(['write_products'])
```

---

### Intents API — `shopify.intents`

Launch native Shopify admin workflows.

```tsx
const shopify = useAppBridge()

// Open product creation
shopify.intents.open('shopify://admin/products/new')

// Open customer detail
shopify.intents.open(`shopify://admin/customers/${customerId}`)
```

---

### Reviews API — `shopify.reviews`

Request an app review modal.

```tsx
const shopify = useAppBridge()

shopify.reviews.show()
```

---

## Complete React Component Example

```tsx
import { useAppBridge } from '@shopify/app-bridge-react'
import { useState, useCallback } from 'react'

interface Product {
  id: string
  title: string
  handle: string
}

export function ProductManager() {
  const shopify = useAppBridge()
  const [products, setProducts] = useState<Product[]>([])
  const [isDirty, setIsDirty] = useState(false)

  const handlePickProducts = useCallback(async () => {
    const selection = await shopify.resourcePicker({
      type: 'product',
      multiple: true,
    })

    if (selection?.length) {
      setProducts(selection as Product[])
      setIsDirty(true)
      shopify.saveBar.show('product-manager-save-bar')
    }
  }, [shopify])

  const handleSave = useCallback(async () => {
    shopify.loading.dispatch(true)

    try {
      const token = await shopify.idToken()

      await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products }),
      })

      shopify.toast.show('Products saved successfully')
      shopify.saveBar.hide('product-manager-save-bar')
      setIsDirty(false)
    } catch (error) {
      shopify.toast.show('Failed to save products', { isError: true })
    } finally {
      shopify.loading.dispatch(false)
    }
  }, [shopify, products])

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await shopify.modal.show({
      title: 'Remove product?',
      message: 'This will remove the product from your selection.',
      primaryAction: { content: 'Remove', destructive: true },
      secondaryActions: [{ content: 'Cancel' }],
    })

    if (confirmed) {
      setProducts(prev => prev.filter(p => p.id !== id))
      shopify.toast.show('Product removed')
    }
  }, [shopify])

  return (
    <div>
      <ui-save-bar id="product-manager-save-bar">
        <button variant="primary" onClick={handleSave}>Save</button>
        <button onClick={() => {
          setIsDirty(false)
          shopify.saveBar.hide('product-manager-save-bar')
        }}>Discard</button>
      </ui-save-bar>

      <ui-button onClick={handlePickProducts}>Add products</ui-button>

      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.title}
            <ui-button
              tone="critical"
              onClick={() => handleDelete(product.id)}
            >
              Remove
            </ui-button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## API Reference Summary

| API | Method | Description |
|-----|--------|-------------|
| Toast | `shopify.toast.show(msg, opts?)` | Show notification |
| Toast | `shopify.toast.hide(id)` | Dismiss toast |
| Navigation | `shopify.navigate(path, opts?)` | Navigate admin |
| Resource Picker | `shopify.resourcePicker(opts)` | Pick resources |
| Save Bar | `shopify.saveBar.show(id)` | Show save bar |
| Save Bar | `shopify.saveBar.hide(id)` | Hide save bar |
| Modal | `shopify.modal.show(opts)` | Confirmation dialog |
| Loading | `shopify.loading.dispatch(bool)` | Toggle loader |
| ID Token | `shopify.idToken()` | Get session token |
| User | `shopify.user()` | Get merchant info |
| Config | `shopify.config` | App config |
| Environment | `shopify.environment` | Platform info |
| Scopes | `shopify.scopes.query()` | Check permissions |
| Scopes | `shopify.scopes.request(scopes)` | Request permissions |
| Intents | `shopify.intents.open(url)` | Open admin workflow |
| Reviews | `shopify.reviews.show()` | Request app review |

---

## Best Practices

- Always use `useAppBridge()` instead of `window.shopify` — it's SSR-safe
- Call `shopify.loading.dispatch(false)` in `finally` blocks to prevent stuck loaders
- Use `shopify.idToken()` for all authenticated server requests
- Show a save bar whenever form state becomes dirty; hide it on save or discard
- Use `isError: true` for failure toasts so merchants can distinguish success/failure
- Confirm destructive actions with `shopify.modal.show()` before executing
- Check `shopify.environment.mobile` before using mobile-only APIs (Scanner, Share)
