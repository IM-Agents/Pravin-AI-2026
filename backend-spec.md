# OMA – Backend Specification (Node.js + Express)

## Overview

The backend is the central orchestration layer: it receives Shopify webhooks, evaluates business rules, generates PDFs, manages print jobs, and communicates with both the React frontend and Electron desktop app via REST + WebSocket (Socket.IO).

---

## Technology

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 24.13.1 |
| Framework | Express.js |
| Database | MySQL 8.0 (via mysql2 / Sequelize or Knex) |
| WebSocket | Socket.IO |
| PDF Generation | PDFKit or Puppeteer |
| Webhook Validation | Shopify HMAC-SHA256 |
| Job IDs | UUID v4 |

---

## Module Architecture

```
backend/src/
├── app.js                    # Express app setup + Socket.IO init
├── server.js                 # Server entry point
├── config/
│   ├── db.js                 # MySQL connection config
│   ├── env.js                # Environment variable loader
│   └── socket.js             # Socket.IO server config
├── middleware/
│   ├── shopifyAuth.js        # HMAC-SHA256 webhook validation
│   └── errorHandler.js       # Global error handler
├── routes/
│   ├── webhookRoutes.js      # /webhooks/shopify/*
│   ├── orderRoutes.js        # /orders/*
│   ├── printerRoutes.js      # /printers/*
│   └── printJobRoutes.js     # /print-job
├── controllers/
│   ├── webhookController.js  # Handle Shopify webhooks
│   ├── orderController.js    # Order CRUD + filters
│   ├── printerController.js  # Printer sync/status/assign
│   └── printJobController.js # Print job dispatch/retry
├── services/
│   ├── ruleEngine.js         # Business rules evaluation
│   ├── pdfGenerator.js       # PDF generation per department
│   ├── printService.js       # Print job orchestration
│   └── timelineService.js    # Timeline event logging
├── models/
│   ├── Order.js
│   ├── OrderLineItem.js
│   ├── OrderDepartmentStatus.js
│   ├── OrderPdf.js
│   ├── Printer.js
│   ├── PrintJob.js
│   └── OrderTimeline.js
├── socket/
│   ├── socketHandler.js      # Socket.IO event handlers
│   └── electronBridge.js     # Electron-specific socket logic
├── migrations/
│   └── *.sql                 # Database migration files
└── pdf-templates/
    ├── standard.js           # Standard KOT template
    ├── reprint.js            # Reprint template
    └── reprint-cancellation.js # Reprint-Cancellation template
```

---

## 1. Shopify Webhook Processing

### Flow: `orders/create`
```
1. Receive POST /webhooks/shopify/orders/create
2. Validate HMAC-SHA256 signature (middleware)
3. Parse order payload
4. Store order in `orders` table
5. Store line items in `order_line_items` table
6. Run rule engine → determine departments
7. Initialize `order_department_status` record
8. Log timeline: WEBHOOK_RECEIVED
9. Log timeline: RULE_EVALUATED
10. For each required department:
    a. Generate PDF
    b. Store PDF path in `order_pdfs`
    c. Log timeline: PDF_GENERATED
    d. Validate printer (assigned, active, online)
    e. If printer valid → create print job → dispatch via Socket.IO
    f. Log timeline: PRINT_TRIGGERED
    g. If printer invalid → mark FAILED → log PRINTER_VALIDATION_FAILED
11. Respond 200 to Shopify
```

### Flow: `orders/cancelled`
```
1. Receive POST /webhooks/shopify/orders/cancelled
2. Validate HMAC-SHA256 signature
3. Find order in database
4. Cancel all QUEUED/IN-PROGRESS print jobs
5. Update order: is_cancelled = true
6. Log timeline: ORDER_CANCELLED
7. For each cancelled job → log timeline: PRINT_CANCELLED
8. Notify frontend via Socket.IO: order_cancelled event
9. Respond 200
```

### HMAC-SHA256 Validation (shopifyAuth.js)
```javascript
// Pseudocode
const crypto = require('crypto');

function verifyShopifyWebhook(req, res, next) {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    const body = req.rawBody; // Must use raw body, not parsed JSON
    const hash = crypto
        .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(body, 'utf8')
        .digest('base64');
    
    if (hash === hmacHeader) {
        next();
    } else {
        return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
}
```

---

## 2. Rule Engine (ruleEngine.js)

Evaluates order data to determine which departments need printing and initial status.

### Rules (evaluated in order)

| # | Condition | Check | Result |
|---|-----------|-------|--------|
| 1 | Super Extended Delivery | `shipping_method` contains "super extended" | All depts → PENDING |
| 2 | Additional Customization Charges | Line item title or tags contain "customization" | All depts → PENDING |
| 3 | Missing Delivery Info | `delivery_date` OR `delivery_time` is null/empty | All depts → PENDING |
| 4 | Draft Order | Order tag contains "draft" or source is draft | All depts → PENDING |
| 5 | Designer Cake | Line item title/tags contain "designer cake" | DM → PENDING, Confectionery → PENDING, Design → NA |
| 6 | Default | None of the above | All depts → PENDING (auto-print) |

### Return Format
```javascript
{
    dm: 'PENDING',          // or 'NA'
    confectionery: 'PENDING', // or 'NA'
    design: 'PENDING'       // or 'NA'
}
```

### Auto-Print Behavior
For rule #6 (default), after setting statuses to PENDING, the system immediately proceeds to generate PDFs and dispatch print jobs (transitioning to IN-PROGRESS). For rules #1–#5, orders remain PENDING until manual trigger.

---

## 3. PDF Generation (pdfGenerator.js)

### Templates
Each department uses the same layout with a department-specific header. Three variants:

1. **Standard** — Department name only
2. **Reprint** — Department name + `REPRINT` badge
3. **Reprint-Cancellation** — Department name + `REPRINT-CANCELLATION` badge

### PDF Content Layout
```
┌──────────────────────────────────────────────────┐
│ [Department Name]  [BADGE if reprint/cancel]      │
│ #[Order Number] • [Customer Name]                 │
│ [Order Date] at [Order Time]                      │
├──────────────────────────────────────────────────┤
│ ┌──────┐                                          │
│ │ IMG  │ [Product Title]                 x [Qty]  │
│ │      │ [Variant]                                │
│ │      │ [Price]                                  │
│ └──────┘                                          │
│ (repeat for each line item)                       │
├──────────────────────────────────────────────────┤
│ Notes                                             │
│ [Customer notes or "No notes from customer"]      │
├──────────────────────────────────────────────────┤
│ Additional details                                │
│ Delivery Date: [date]                             │
│ Delivery Day: [day]                               │
│ Delivery Time: [time range]                       │
│ Specific Delivery Time: [time range]              │
│ Delivery Link: [URL]                              │
│ Delivery Related: [text or -]                     │
│ Product Related: [text or -]                      │
│ Delivery instructions: [text]                     │
├──────────────────────────────────────────────────┤
│ Customer                                          │
│ [Customer Name]                                   │
│                                                   │
│ Contact information                               │
│ [Email]                                           │
│ [Phone or "No phone number"]                      │
│                                                   │
│ Shipping address                                  │
│ [Name]                                            │
│ [Address1]                                        │
│ [Address2]                                        │
│ [Zip] [City] [Province]                           │
│ [Country]                                         │
└──────────────────────────────────────────────────┘
```

### Storage
- PDFs stored in `PDF_STORAGE_PATH` (env variable)
- Filename convention: `{order_number}_{department}_{template_type}_{timestamp}.pdf`
- Path stored in `order_pdfs` table

---

## 4. Print Service (printService.js)

### Print Job Flow
```
1. Receive print request (auto or manual)
2. Check if order is ignored → reject if yes
3. Get department printer from `printers` table
4. Validate printer:
   - Is assigned? → if not, FAILED
   - Is active? → if not, FAILED
   - Is online? → if not, FAILED
5. Generate PDF (if not already generated for this template type)
6. Create print_job record (status: QUEUED)
7. Update department status → IN-PROGRESS
8. Emit Socket.IO event `print_job` to Electron
9. Log timeline: PRINT_TRIGGERED
10. Wait for Electron response via `print_status_update`
11. On SUCCESS → update status, log timeline
12. On FAILED → update status, log timeline, store error message
```

### Retry Logic
- Retry uses the same flow but with `template_type: 'reprint'`
- Generates a new PDF with REPRINT badge
- Creates a new print_job record

---

## 5. Timeline Service (timelineService.js)

Centralized service for logging all order events.

```javascript
async function logEvent(orderId, eventType, department, status, message) {
    await OrderTimeline.create({
        order_id: orderId,
        event_type: eventType,
        department: department || null,
        status: status || null,
        message: message
    });
}
```

---

## 6. Socket.IO Communication

### Namespaces
- `/electron` — Electron desktop app connections
- `/frontend` — React frontend connections (default namespace)

### Electron Events

**Backend → Electron:**
```javascript
// Send print job
socket.to('electron').emit('print_job', {
    job_id: 'uuid',
    order_id: 'shopify_123',
    department: 'dm',
    printer_name: 'HP LaserJet',
    pdf_url: '/api/orders/shopify_123/departments/dm/download-pdf',
    template_type: 'standard'
});

// Cancel job
socket.to('electron').emit('cancel_job', {
    job_id: 'uuid'
});
```

**Electron → Backend:**
```javascript
// Printer sync
socket.on('printer_sync', { machine_id, printers: [...] });

// Printer status
socket.on('printer_status', { machine_id, printer_name, status });

// Print result
socket.on('print_status_update', { job_id, status, message, timestamp });
```

### Frontend Events

**Backend → Frontend:**
```javascript
// Status update
io.emit('order_status_update', {
    order_id: 'shopify_123',
    department: 'dm',
    status: 'SUCCESS'
});

// New order
io.emit('new_order', { order: {...} });

// Order cancelled
io.emit('order_cancelled', { order_id: 'shopify_123' });
```

---

## 7. Error Handling

| Scenario | Response | Side Effect |
|----------|----------|-------------|
| Invalid HMAC | 401 | Reject webhook |
| Duplicate order | 200 (idempotent) | Skip processing, return existing |
| Printer not found | 200 | Mark dept FAILED, log timeline |
| Printer offline | 200 | Mark dept FAILED, log timeline |
| PDF generation error | 500 | Mark dept FAILED, log timeline |
| Electron disconnected | — | Mark jobs FAILED, log timeline |
| Database error | 500 | Log error, return error response |

---

## 8. Environment Variables

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=oma

# Shopify
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here

# PDF
PDF_STORAGE_PATH=./generated-pdfs

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:3000
```
