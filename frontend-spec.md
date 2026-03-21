# OMA – Frontend Specification (React 17)

## General Requirements

- **Framework:** React 18
- **Responsive Design:** All pages and components MUST be fully responsive (mobile, tablet, desktop)
- **Real-time Updates:** WebSocket (Socket.IO client) for live status updates
- **Pagination:** 20 orders per page
- **No Authentication:** No login required (V1)

---

## Page Structure

```
App
├── Order Management Automation (Tab)
│   ├── Action Required (Subtab) — default
│   └── All Orders (Subtab)
│
└── Settings (Separate top-level page)
    └── Printer Configuration
```

---

## 1. Action Required Tab

### Purpose
Shows orders that need attention — any order where at least one department status is **PENDING**, **FAILED**, or **IN-PROGRESS**.

### Default Behavior (No Filters Applied)
- Show ONLY orders with at least one department in: `PENDING`, `FAILED`, `IN-PROGRESS`
- Exclude orders where ALL departments are `SUCCESS` or `NA`
- Sort: newest first

### Columns

| # | Column | Type | Notes |
|---|--------|------|-------|
| 1 | Order No | Text | Shopify order number |
| 2 | Order Creation Date & Time | DateTime | Shopify order timestamp |
| 3 | Customer Name | Text | |
| 4 | Delivery Date | Date | |
| 5 | Delivery Time | Text | Time range (e.g., 03:00PM-04:00PM) |
| 6 | Specific Delivery Time | Text | Time range |
| 7 | Reserved | Boolean | Yes/No badge |
| 8 | DM Print Status | Button | Department status button |
| 9 | CONFECTIONERY Print Status | Button | Department status button |
| 10 | DESIGN Print Status | Button | Department status button |
| 11 | Timeline | Button/Link | Expandable timeline view |
| 12 | IGNORE | Button | Ignore/Remove Ignore toggle |

---

## 2. All Orders Tab

### Purpose
Shows ALL orders regardless of status.

### Columns
Same as Action Required tab **except**: no IGNORE column.

### Default Sort
Newest first (by order creation date).

---

## 3. Department Status Buttons

Each department column (DM, CONFECTIONERY, DESIGN) renders as an **interactive button** reflecting the current status.

### Button States

| Status | Color | Label | Behavior | Icon |
|--------|-------|-------|----------|------|
| NA | Grey (#9E9E9E) | NA | Disabled, no action | — |
| PENDING | Orange (#FF9800) | PENDING | Enabled — click to trigger manual print | Print icon |
| IN-PROGRESS | Blue (#2196F3) | Printing... | Disabled + spinner/loader | Spinner |
| SUCCESS | Green (#4CAF50) | ✓ Success | Click to download PDF | Download icon |
| FAILED | Red (#F44336) | ✗ Failed | Two actions: Retry + Download | Retry + Download icons |

### Button Design (Responsive)
- **Desktop:** Full label + icon
- **Tablet:** Icon + abbreviated label
- **Mobile:** Icon only with tooltip

### FAILED State — Dual Actions
When a department is in FAILED state, the button area shows two actions:
1. **Retry** — Re-triggers the print job for that department
2. **Download** — Downloads the last generated PDF

### Independence
- Each department button operates **independently**
- Clicking DM Print does NOT affect CONFECTIONERY or DESIGN
- Each triggers its own API call: `POST /api/orders/:order_id/departments/:department/print`

---

## 4. IGNORE Button (Action Required Tab Only)

### Behavior

| Current State | Button Label | Action on Click |
|---------------|-------------|-----------------|
| Not Ignored | IGNORE | Marks order as ignored → `PATCH /api/orders/:order_id/ignore` with `{ignored: true}` |
| Ignored | REMOVE IGNORE | Removes ignore → `PATCH /api/orders/:order_id/ignore` with `{ignored: false}` |

### Visual
- **IGNORE:** Outlined/secondary button (grey/neutral)
- **REMOVE IGNORE:** Filled warning button (orange/amber)

### Impact When Ignored
- All department buttons become disabled
- Row gets a subtle visual indicator (e.g., muted/striped background)
- No print jobs can be triggered

---

## 5. Filters & Search

### Filter Bar (Both Tabs)

| Filter | Input Type | Description |
|--------|-----------|-------------|
| Order No | Text input | Search by order number |
| Order Date | Date picker | Filter by order creation date |
| Delivery Date | Date picker | Filter by delivery date |
| Delivery Slot | Dropdown / Text | Derived from delivery_time + specific_delivery_time |

### Action Buttons
- **Search** — Apply all active filters
- **Reset Filter** — Clear all filters, return to default view

### Responsive Layout
- **Desktop:** Filters in a horizontal row
- **Tablet:** 2x2 grid
- **Mobile:** Stacked vertically, collapsible filter section

---

## 6. Timeline Column

### Trigger
Clicking the Timeline cell/button opens an **expandable panel** or **modal/drawer**.

### Content
Chronological list of events for that order:

| Field | Description |
|-------|-------------|
| Timestamp | When the event occurred |
| Event Type | Badge/tag (e.g., WEBHOOK_RECEIVED, PRINT_TRIGGERED) |
| Department | Which department (if applicable) |
| Status | Status at that point |
| Message | Human-readable description |

### Example Timeline Entries
```
🔔 2026-01-13 17:17:01 — WEBHOOK_RECEIVED
   "Shopify webhook orders/create received"

📋 2026-01-13 17:17:01 — RULE_EVALUATED
   "Default rule: all departments required"

📄 2026-01-13 17:17:02 — PDF_GENERATED [DM]
   "PDF generated for DM department"

🖨️ 2026-01-13 17:17:03 — PRINT_TRIGGERED [DM]
   "Print job dispatched to printer HP_LaserJet_1"

✅ 2026-01-13 17:17:08 — PRINT_RESULT [DM]
   "Print completed successfully"
```

### Responsive
- **Desktop:** Side drawer or inline expandable row
- **Mobile:** Full-screen modal / bottom sheet

---

## 7. Settings Page (Printer Configuration)

### Purpose
Separate top-level page for managing printer-to-department assignments.

### Layout

#### Printer List
Table/cards showing all printers synced from Electron:

| Column | Description |
|--------|-------------|
| Printer Name | Name from Electron |
| Machine ID | Which computer it's on |
| Status | Online/Offline badge (green/red) |
| Active | Toggle switch |
| Assigned Department | Dropdown: DM / Confectionery / Design / Unassigned |

#### Department Summary Cards (Top of page)
Three cards showing current assignment:

```
┌─────────────┐  ┌─────────────────┐  ┌──────────────┐
│     DM       │  │  CONFECTIONERY   │  │    DESIGN    │
│ HP LaserJet  │  │   Epson L3150    │  │  Not Assigned │
│   ● Online   │  │    ● Online      │  │   ⚠ Warning  │
└─────────────┘  └─────────────────┘  └──────────────┘
```

### Actions
- Assign/reassign printer to department via dropdown
- Toggle printer active/inactive
- Status is read-only (synced from Electron)
- Refresh button to force re-sync with Electron

### Validation
- Each department can only have ONE printer assigned
- If assigning a printer already assigned to another department, show confirmation dialog
- If no printer assigned to a department, show warning

### Responsive
- **Desktop:** Table view
- **Tablet:** Compact table
- **Mobile:** Card-based layout, one printer per card

---

## 8. Real-time Updates (WebSocket)

### Socket.IO Events (Frontend listens to)

| Event | Action |
|-------|--------|
| `order_status_update` | Update department button status in table without page refresh |
| `new_order` | Prepend new order to list (if on first page) |
| `order_cancelled` | Update order row (visual cancellation indicator) |

### Behavior
- Status buttons update in real-time as Electron prints
- No manual refresh needed to see status changes
- Connection status indicator (optional): small dot showing WebSocket connection state

---

## 9. Component Hierarchy

```
App
├── Layout
│   ├── Sidebar / Navigation
│   │   ├── Order Management Automation (link)
│   │   └── Settings (link)
│   └── MainContent
│
├── OrderManagement (page)
│   ├── TabBar
│   │   ├── ActionRequiredTab
│   │   └── AllOrdersTab
│   ├── FilterBar
│   │   ├── OrderNoInput
│   │   ├── OrderDatePicker
│   │   ├── DeliveryDatePicker
│   │   ├── DeliverySlotSelect
│   │   ├── SearchButton
│   │   └── ResetButton
│   ├── OrderTable
│   │   ├── OrderRow
│   │   │   ├── DepartmentButton (×3)
│   │   │   ├── TimelineButton
│   │   │   └── IgnoreButton (Action Required only)
│   │   └── Pagination
│   └── TimelineDrawer / TimelineModal
│
└── Settings (page)
    └── PrinterConfiguration
        ├── DepartmentSummaryCards
        ├── PrinterTable
        │   └── PrinterRow
        │       ├── StatusBadge
        │       ├── ActiveToggle
        │       └── DepartmentDropdown
        └── RefreshButton
```

---

## 10. Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | Single column, stacked elements, collapsible filters |
| Tablet | 768px – 1024px | 2-column grid, compact table |
| Desktop | > 1024px | Full table, side drawer for timeline, horizontal filters |

### Table Responsiveness
- **Desktop:** Full table with all columns visible
- **Tablet:** Horizontal scroll or hide less critical columns (Specific Delivery Time, Reserved)
- **Mobile:** Card-based layout — each order as a card with expandable details

---

## 11. Color System

| Use | Color | Hex |
|-----|-------|-----|
| NA status | Grey | #9E9E9E |
| PENDING status | Orange | #FF9800 |
| IN-PROGRESS status | Blue | #2196F3 |
| SUCCESS status | Green | #4CAF50 |
| FAILED status | Red | #F44336 |
| Ignored row | Muted/Striped | #F5F5F5 with striped pattern |
| Primary action | Blue | #1976D2 |
| Warning | Amber | #FFA000 |
| Printer Online | Green | #4CAF50 |
| Printer Offline | Red | #F44336 |
