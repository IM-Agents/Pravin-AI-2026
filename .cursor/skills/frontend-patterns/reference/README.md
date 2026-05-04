# Frontend patterns reference — `odd_react` (+ API backend)

This document maps **frontend patterns** to the Shopify embedded admin app at `C:\Users\DELL\Downloads\odd_react` (package name `my-react-app` in `package.json`). It also notes how that UI talks to the **Node API** (sibling project often named `odd_node`).

Avoid treating **route path strings** in this file as product marketing copy—they are **code identifiers** only.

---

## Stack (from `package.json`)

| Layer | Choice |
|-------|--------|
| UI | React 18 |
| Bundler | Webpack 5 (`webpack serve`, `html-webpack-plugin`) |
| Routing | `react-router-dom` v6 |
| Global state | Redux Toolkit (`@reduxjs/toolkit`) + `react-redux` |
| Forms | Formik + Yup |
| Drag-and-drop | `@dnd-kit/*` |
| Rich text | CKEditor 5, Quill (deps present) |
| Docs / UI dev | Storybook 8 (`src/ui/*.stories.jsx`) |

Scripts inject **`base_path`** / **`NODE_BASE_PATH`** via webpack `--env` for stage/dev/production builds.

---

## Repository layout (mental map)

| Area | Role |
|------|------|
| **`src/index.js`** | `Provider`, `BrowserRouter`, `ToastProvider`, `dispatch(fetchShopInfo())`, mount `App`. |
| **`src/App.jsx`** | If no `shop` in config → **`ShopInput`**; else **`SaveBarProvider`** → spinner until shop info loads → **`Router`**. |
| **`src/router/Router.jsx`** | **`lazy()`** every page; **`Routes`** under **`ShopifyAppProvider`**; route table for dashboard, onboarding, orders, settings, pricing, integration, etc. |
| **`src/components/ShopifyAppBridge/`** | Embedded shell: **`ShopifyAppProvider`**, shop capture, product modal, etc. |
| **`src/pages/`** | Feature screens (large settings subtree). |
| **`src/ui/`** | Reusable primitives (Table, Modal, DateField, …) + Storybook. |
| **`src/services/`** | HTTP wrappers (`shopService`, `productService`, `orderService`, …). |
| **`src/redux/`** | `store`, `rootReducer`, feature **slices** (`shopinfoSlice`, …). |
| **`src/utils/common.js`** | **`ODD_fetchData`**, toasts, i18n helpers, shared formatting. |
| **`src/utils/config.js`** | Runtime: **`SHOP`**, **`SHOPIFY`**, **`NODE_BASE_PATH`**, **`ROUTER_PATH`**, **`COMMON_SEARCH_PARAMS`**, extension env keys. |
| **`src/context/SaveBarContext.jsx`** | Tracks dirty/save-bar visibility for navigation guard patterns. |

---

## Deep levels — how the app is structured

### L0 — Build and environment

- Webpack builds with high **Node heap** (`NODE_OPTIONS=--max-old-space-size=8192`) for large bundles.
- **`process.env.ROUTER_PATH`**, **`NODE_BASE_PATH`**, **`MODE`**, image CDN base, API version, extension UUIDs come from **env** at build time; **`config.js`** also reads **`window.location.search`** and **`window.shopify`** / **`sessionStorage['app-bridge-config']`**.

**Pattern**: Embedded Shopify apps must keep **base path** and **asset URLs** aligned with where the admin script is hosted.

### L1 — Bootstrap sequence

1. **`store.dispatch(fetchShopInfo())`** runs before render (or in parallel) so token and shop payload are loading early.
2. **`ToastProvider`** wraps the tree for global feedback.
3. **`BrowserRouter`** wraps **`App`**.

**Pattern**: **Shop info first** drives gating, token availability, and Redux hydration for the rest of the session.

### L2 — Shop gate

- **`config.SHOP`** from query string or App Bridge config.
- If missing → **`ShopInput`** (manual shop entry flow).
- If present → main app with **`SaveBarProvider`**.

### L3 — Loading gate

- **`App`** reads **`state.shopinfo.shopInfo.isLoading`**; shows **`Spinner`** until ready, then **`Router`**.

**Pattern**: Avoid rendering lazy routes until **token + shop** resolution has settled to reduce flicker and failed API calls.

### L4 — Routing

- **`Router`** uses **`React.lazy`** for **all** pages and **`React.memo`** on the router component.
- Parent route **`path={config.ROUTER_PATH || '/'}`** with element **`ShopifyAppProvider`** (layout + **`Outlet`**).
- Child routes: **`index`** → Dashboard; nested paths like **`settings/general`**, **`order-listing/:id`**, **`pricing-plan`**, etc.

**Pattern**: **Route-based code splitting** at page granularity; add new routes by extending the **`routes`** array and importing a new lazy page.

### L5 — Embedded shell (`ShopifyAppProvider`)

- Reads **`shopinfo`** from Redux: onboarding status **`spld_onboarding_status`**, **`charge_approve`**.
- **Redirect priority**: if **`charge_approve === '0'`** → force **`usage-based-pricing`**; else if onboarding incomplete → force **`onboarding`**; uses **`navigate(..., { replace: true })** and **`lastRedirectRef`** to avoid loops.
- Navigation uses **`<s-app-nav>`** (Shopify UI) with **`Link`** targets built as **`${config.ROUTER_PATH}<route>${config.COMMON_SEARCH_PARAMS}`** so **`shop`** and **`embedded=1`** stay on every admin link.
- **`partnerTabs=1`** hides some nav items (e.g. “Others apps”).
- **`Suspense`** + **`Spinner`** around **`Outlet`**; **`Footer`** shown when nav visible or on onboarding.

**Pattern**: **Centralize** subscription/pricing/onboarding gating in one layout component; keep **`COMMON_SEARCH_PARAMS`** consistent on every internal link.

### L6 — Runtime config (`config.js`)

- **`IS_EMBEDDED`** from App Bridge environment.
- **`COMMON_SEARCH_PARAMS`**: preserves **`shop`** and optional **`embedded=1`** for links.
- **`API_VERSION`**, **`EXTENSION_UUID`**, **`EXTENSION_BLOCK_NAME`**, **`EXTENSION_BLOCK_KEY`**: theme extension / app block integration.

**Pattern**: Any new deep link or OAuth return URL should preserve **`shop`** (and **`host`** when required by backend) the same way.

### L7 — Redux architecture

- **`configureStore`** with RTK; **`serializableCheck`** ignores some paths (e.g. **`items.dates`**).
- **`rootReducer`** intercepts **`RESET_ALL_REDUX_STATE`** to **wipe all slices** when placement/plan changes require a full client reset.
- **`shopinfoSlice`** is large: many **`createAsyncThunk`** handlers calling **`@services/shopService`** / **`productService`**; uses **`lodash-es`**, **`safeJsonParse`** for string columns that may contain malformed JSON.

**Pattern**: **Feature slices** per domain; async logic in **thunks**; components subscribe with **`useSelector`** / dispatch with **`useDispatch`**.

### L8 — HTTP layer (`ODD_fetchData` in `utils/common.js`)

- Prefixes paths with **`NODE_BASE_PATH`** (API mount).
- Appends **`odd_ref=1`** query flag on every request.
- Sends header **`authentication`**: Redux **`shopinfo.shopInfo.token`**, or **`await config.SHOPIFY.idToken()`** when available (matches backend **`verify.js`** expecting base64 JWT in **`Authentication`**).
- Supports **JSON**, **urlencoded**, and **FormData** bodies.
- On failure returns **`{ _fail: true, error }`** instead of throwing (call sites check **`response._fail`**).
- Logs client errors via **`create_logs`** (console in development).

**Pattern**: **Single fetch wrapper** keeps auth and URL construction consistent; services stay thin.

### L9 — Services

- **`shopService.js`**, **`productService.js`**, etc., call **`ODD_fetchData`** / **`graphqlCall`** with specific paths (e.g. **`/shipping-price`**, settings endpoints).
- Some calls hit **third-party** promotion/marketing URLs—treat as **integration boundaries** and keep credentials out of source where possible.

**Pattern**: One service module per aggregate (shop, product, order, onboarding).

### L10 — Forms and validation

- **Formik** (`useFormik`, **`FormikProvider`**) in settings pages (e.g. **`TextSettings.jsx`**).
- **Yup** available for schema validation (project dependency).
- **`SaveBarContext`** coordinates “dirty” state with navigation.

**Pattern**: **Large settings screens** pair Redux-fetched data with Formik **`initialValues`** reset after fetch (see comments in **`shopinfoSlice`** / widget settings).

### L11 — UI kit

- **`src/ui`**: composable components (Table, Modal, Banner, Toast, DateField, DragAndDrop, FullEventCalendar pieces, …).
- **Storybook** stories colocated (`*.stories.jsx`).

**Pattern**: Prefer **`src/ui`** for new controls; document variants in Storybook.

### L12 — Advanced UI

- **`@dnd-kit`** for sortable lists (see **`DragAndDrop`**).
- **Google Maps** scripting appears in route-related settings (dynamic script load, map overlays)—isolate script loading and teardown in hooks/callbacks.

---

## Example: adding a new settings page (checklist)

1. Create **`src/pages/Settings/MyPage/MyPage.jsx`**.
2. Register **`lazy(() => import(...))`** and **`{ path: 'settings/my-page', component: MyPage }`** in **`Router.jsx`**.
3. Add **`Link`** in **`ShopifyAppProvider`** if it should appear in **`s-app-nav`** (with **`ROUTER_PATH` + `COMMON_SEARCH_PARAMS`**).
4. Add API functions in **`services/`** using **`ODD_fetchData`**.
5. Add thunks/reducers in a slice or extend **`shopinfoSlice`** if global shop state is affected.
6. Use **Formik** + existing **`ui`** inputs for consistent UX.

---

## Backend contract (sibling `odd_node` API)

The React app does **not** implement auth server-side; it relies on the Express app:

- Header **`authentication`** (lowercase) matches the backend middleware pattern.
- **`zip`** vs legacy postal field names and stringified JSON settings are validated server-side—keep payloads aligned with **`adminValidation`** / API docs on the Node project.

For a **backend-only** view (queues, webhooks, no React source), see the **`backend-patterns`** skill reference if present.

---

## Anti-patterns observed to avoid worsening

- Duplicating URL building without **`COMMON_SEARCH_PARAMS`** (breaks embedded context).
- Dispatching fetches before **`token`** exists in Redux (race with **`fetchShopInfo`**).
- Adding routes **without** `lazy` for heavy pages (increases initial bundle).
- Bypassing **`ODD_fetchData`** and reimplementing auth/query string rules ad hoc.

---

## Maintenance

Revisit this document when **`Router.jsx`** route table, **`ShopifyAppProvider`** gating rules, **`ODD_fetchData`** signature, or **`config.js`** env surface changes.
