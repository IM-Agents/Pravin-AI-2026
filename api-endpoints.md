# OMA – API Endpoints Documentation

## Base URL
```
http://localhost:8000/api
```

---

## 1. Shopify Webhooks

### 1.1 Order Created Webhook
```
POST /webhooks/shopify/orders/create
```
**Description:** Receives new order from Shopify. Validates HMAC-SHA256 signature, stores order, evaluates rules, determines departments, generates PDFs, and triggers print jobs.

**Headers:**
| Header | Description |
|--------|-------------|
| `X-Shopify-Hmac-Sha256` | HMAC signature for validation |
| `X-Shopify-Topic` | `orders/create` |
| `X-Shopify-Shop-Domain` | Shop domain |

**Body:** Raw Shopify order JSON payload

**Response:**
```json
{
  "success": true,
  "message": "Order received and processing started",
  "data": {
    "order_id": 123456,
    "order_number": "#1116"
  }
}
```

**Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Order received and queued |
| 401 | Invalid HMAC signature |
| 422 | Invalid payload / missing required fields |
| 500 | Internal server error |

---

### 1.2 Order Cancelled Webhook
```
POST /webhooks/shopify/orders/cancelled
```
**Description:** Receives order cancellation from Shopify. Cancels any in-progress print jobs, updates department statuses, and logs timeline events.

**Headers:** Same as 1.1

**Body:** Raw Shopify order cancellation JSON payload

**Response:**
```json
{
  "success": true,
  "message": "Order cancellation processed",
  "data": {
    "order_id": 123456,
    "cancelled_jobs": 2
  }
}
```

---

## 2. Orders

### 2.1 Get Orders – Action Required
```
GET /orders/action-required
```
**Description:** Returns orders where at least one department status is PENDING, FAILED, or IN-PROGRESS. Excludes orders where all departments are SUCCESS or NA.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `order_no` | string | No | Filter by order number |
| `order_date` | string | No | Filter by order date (YYYY-MM-DD) |
| `delivery_date` | string | No | Filter by delivery date (YYYY-MM-DD) |
| `delivery_slot` | string | No | Filter by delivery slot (time range) |

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_id": "shopify_123",
        "order_number": "#1116",
        "customer_name": "John Doe",
        "order_created_at": "2026-01-13T17:17:00Z",
        "delivery_date": "2026-01-20",
        "delivery_time": "03:00PM-04:00PM",
        "specific_delivery_time": "12:30AM-01:00AM",
        "delivery_slot": "03:00PM-04:00PM",
        "reserved": true,
        "is_ignored": false,
        "dm_status": "SUCCESS",
        "confectionery_status": "FAILED",
        "design_status": "PENDING"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 54,
      "totalPages": 3
    }
  }
}
```

---

### 2.2 Get Orders – All Orders
```
GET /orders
```
**Description:** Returns all orders regardless of status. Sorted by newest first.

**Query Parameters:** Same as 2.1

**Response:** Same structure as 2.1

---

### 2.3 Get Order Detail
```
GET /orders/:order_id
```
**Description:** Returns full order detail including department statuses and timeline.

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "order_id": "shopify_123",
      "order_number": "#1116",
      "customer_name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "order_created_at": "2026-01-13T17:17:00Z",
      "delivery_date": "2026-01-20",
      "delivery_time": "03:00PM-04:00PM",
      "specific_delivery_time": "12:30AM-01:00AM",
      "delivery_day": "Tuesday",
      "delivery_link": "https://maps.app.goo.gl/...",
      "delivery_related": "",
      "product_related": "",
      "delivery_instructions": "",
      "shipping_address": {
        "name": "John Doe",
        "address1": "183 18th Main Road",
        "address2": "Stage 2 BTM Layout 1st floor",
        "city": "Bengaluru",
        "province": "KA",
        "zip": "560076",
        "country": "India"
      },
      "reserved": true,
      "is_ignored": false,
      "shipping_method": "Standard",
      "dm_status": "SUCCESS",
      "confectionery_status": "FAILED",
      "design_status": "NA",
      "line_items": [
        {
          "title": "Burn Bright T-Shirt",
          "variant_title": "Small",
          "quantity": 1,
          "price": "20.00",
          "image_url": "https://cdn.shopify.com/..."
        }
      ],
      "notes": "No notes from customer"
    },
    "pdfs": {
      "dm_pdf_path": "/pdfs/order_123_dm.pdf",
      "confectionery_pdf_path": null,
      "design_pdf_path": null
    },
    "timeline": [
      {
        "id": 1,
        "event_type": "WEBHOOK_RECEIVED",
        "status": null,
        "message": "Shopify webhook orders/create received",
        "timestamp": "2026-01-13T17:17:01Z"
      }
    ]
  }
}
```

---

### 2.4 Ignore Order
```
PATCH /orders/:order_id/ignore
```
**Description:** Marks an order as ignored. Blocks all department printing. Logs timeline event.

**Body:**
```json
{
  "ignored": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order marked as ignored",
  "data": {
    "order_id": "shopify_123",
    "is_ignored": true
  }
}
```

---

### 2.5 Remove Ignore
```
PATCH /orders/:order_id/ignore
```
**Description:** Removes ignore flag. Order returns to normal flow. Logs timeline event.

**Body:**
```json
{
  "ignored": false
}
```

---

## 3. Department Printing

### 3.1 Trigger Department Print
```
POST /orders/:order_id/departments/:department/print
```
**Description:** Manually triggers print for a specific department. Generates PDF (if not exists), validates printer, dispatches print job via WebSocket to Electron.

**Path Parameters:**
| Parameter | Type | Values |
|-----------|------|--------|
| `order_id` | string | Shopify order ID |
| `department` | string | `dm`, `confectionery`, `design` |

**Body:**
```json
{
  "type": "standard"
}
```
`type` can be: `standard`, `reprint`, `reprint-cancellation`

**Response:**
```json
{
  "success": true,
  "message": "Print job dispatched",
  "data": {
    "job_id": "job_abc123",
    "order_id": "shopify_123",
    "department": "confectionery",
    "printer": "HP_LaserJet_2",
    "status": "IN-PROGRESS"
  }
}
```

**Error (printer offline):**
```json
{
  "success": false,
  "message": "Printer validation failed: printer is offline",
  "data": {
    "order_id": "shopify_123",
    "department": "confectionery",
    "status": "FAILED"
  }
}
```

---

### 3.2 Retry Department Print
```
POST /orders/:order_id/departments/:department/retry
```
**Description:** Retries a failed print job for a specific department. Re-validates printer and dispatches new job.

**Response:** Same as 3.1

---

### 3.3 Download Department PDF
```
GET /orders/:order_id/departments/:department/download-pdf
```
**Description:** Downloads the generated PDF for a specific department.

**Response:** PDF file (Content-Type: `application/pdf`)

**Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | PDF file returned |
| 404 | PDF not generated yet |

---

## 4. Timeline

### 4.1 Get Order Timeline
```
GET /orders/:order_id/timeline
```
**Description:** Returns full timeline of events for an order.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event_type": "WEBHOOK_RECEIVED",
      "status": null,
      "message": "Shopify webhook orders/create received",
      "department": null,
      "timestamp": "2026-01-13T17:17:01Z"
    },
    {
      "id": 2,
      "event_type": "RULE_EVALUATED",
      "status": null,
      "message": "Default rule: all departments required",
      "department": null,
      "timestamp": "2026-01-13T17:17:01Z"
    },
    {
      "id": 3,
      "event_type": "PDF_GENERATED",
      "status": null,
      "message": "PDF generated for DM department",
      "department": "dm",
      "timestamp": "2026-01-13T17:17:02Z"
    },
    {
      "id": 4,
      "event_type": "PRINT_TRIGGERED",
      "status": "IN-PROGRESS",
      "message": "Print job dispatched to printer HP_LaserJet_1",
      "department": "dm",
      "timestamp": "2026-01-13T17:17:03Z"
    },
    {
      "id": 5,
      "event_type": "PRINT_RESULT",
      "status": "SUCCESS",
      "message": "Print completed successfully",
      "department": "dm",
      "timestamp": "2026-01-13T17:17:08Z"
    }
  ]
}
```

**Timeline Event Types:**
| Event Type | Description |
|-----------|-------------|
| `WEBHOOK_RECEIVED` | Shopify webhook received |
| `RULE_EVALUATED` | Business rule evaluated |
| `PDF_GENERATED` | Department PDF generated |
| `PRINT_TRIGGERED` | Print job dispatched |
| `PRINT_RESULT` | Print completed (success/fail) |
| `ORDER_IGNORED` | Order marked as ignored |
| `ORDER_UNIGNORED` | Ignore removed |
| `ORDER_CANCELLED` | Order cancelled via Shopify |
| `PRINT_CANCELLED` | In-progress print job cancelled |
| `PRINTER_VALIDATION_FAILED` | Printer not available |

---

## 5. Printers

### 5.1 Sync Printers
```
POST /printers/sync
```
**Description:** Electron app sends detected printer list. Backend stores/updates printer records.

**Body:**
```json
{
  "machine_id": "DESKTOP-ABC123",
  "printers": [
    {
      "printer_name": "HP LaserJet Pro MFP",
      "is_default": true,
      "status": "online"
    },
    {
      "printer_name": "Epson L3150",
      "is_default": false,
      "status": "online"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Printers synced successfully",
  "data": {
    "synced": 2,
    "new": 1,
    "updated": 1
  }
}
```

---

### 5.2 Get Printers
```
GET /printers
```
**Description:** Returns all registered printers with their department assignments.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "printer_id": 1,
      "printer_name": "HP LaserJet Pro MFP",
      "machine_id": "DESKTOP-ABC123",
      "status": "online",
      "is_active": true,
      "assigned_department": "dm"
    },
    {
      "printer_id": 2,
      "printer_name": "Epson L3150",
      "machine_id": "DESKTOP-ABC123",
      "status": "online",
      "is_active": true,
      "assigned_department": "confectionery"
    }
  ]
}
```

---

### 5.3 Update Printer Status
```
POST /printers/status
```
**Description:** Electron app reports printer status changes (online/offline).

**Body:**
```json
{
  "machine_id": "DESKTOP-ABC123",
  "printer_name": "HP LaserJet Pro MFP",
  "status": "offline"
}
```

---

### 5.4 Assign Printer to Department
```
PATCH /printers/:printer_id/assign
```
**Description:** Admin assigns a printer to a department from the Settings page.

**Body:**
```json
{
  "department": "dm"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Printer assigned to dm department",
  "data": {
    "printer_id": 1,
    "printer_name": "HP LaserJet Pro MFP",
    "assigned_department": "dm"
  }
}
```

---

## 6. Print Jobs (Electron ↔ Backend via WebSocket)

### 6.1 Send Print Job
```
POST /print-job
```
**Description:** Internal endpoint / WebSocket event. Backend sends print job to Electron.

**Body (also WebSocket payload):**
```json
{
  "job_id": "job_abc123",
  "order_id": "shopify_123",
  "department": "confectionery",
  "printer_name": "Epson L3150",
  "pdf_url": "/api/orders/shopify_123/departments/confectionery/download-pdf",
  "template_type": "standard"
}
```

### 6.2 Print Job Status Update (from Electron)
**WebSocket Event:** `print_status_update`

```json
{
  "job_id": "job_abc123",
  "status": "SUCCESS",
  "message": "Printed successfully",
  "timestamp": "2026-01-13T17:17:08Z"
}
```

---

## WebSocket Events Summary

### Backend → Electron
| Event | Description |
|-------|-------------|
| `print_job` | New print job to execute |
| `cancel_job` | Cancel an in-progress job |

### Electron → Backend
| Event | Description |
|-------|-------------|
| `printer_sync` | Printer list from Electron |
| `printer_status` | Printer online/offline update |
| `print_status_update` | Print job result |

### Backend → Frontend
| Event | Description |
|-------|-------------|
| `order_status_update` | Department status changed |
| `new_order` | New order received from Shopify |
| `order_cancelled` | Order was cancelled |

---

## Sample Shopify Webhook Payload (orders/create)

```json
{
  "id": 820982911946154508,
  "email": "testing@gmail.com",
  "created_at": "2026-01-13T17:17:00+05:30",
  "updated_at": "2026-01-13T17:17:00+05:30",
  "number": 1116,
  "order_number": 1116,
  "name": "#1116",
  "note": "No notes from customer",
  "financial_status": "paid",
  "fulfillment_status": null,
  "cancel_reason": null,
  "cancelled_at": null,
  "tags": "",
  "customer": {
    "id": 115310627314723954,
    "first_name": "Testing",
    "last_name": "",
    "email": "testing@gmail.com",
    "phone": null
  },
  "shipping_address": {
    "first_name": "Testing",
    "last_name": "",
    "address1": "183 18th Main Road",
    "address2": "Stage 2 BTM Layout 1st floor",
    "city": "Bengaluru",
    "province": "KA",
    "zip": "560076",
    "country": "India"
  },
  "line_items": [
    {
      "id": 866550311766439020,
      "title": "Burn Bright T-Shirt",
      "variant_title": "Small",
      "quantity": 1,
      "price": "20.00",
      "product_id": 788032119674292922,
      "variant_id": 457924702,
      "sku": "",
      "properties": [
        {
          "name": "Delivery Date",
          "value": "20/01/2026"
        },
        {
          "name": "Delivery Day",
          "value": "Tuesday"
        },
        {
          "name": "Delivery Time",
          "value": "03:00PM-04:00PM"
        },
        {
          "name": "Specific Delivery Time",
          "value": "12:30AM-01:00AM"
        },
        {
          "name": "Delivery Link",
          "value": "https://maps.app.goo.gl/zpuh1Hny1VLty4Cg6"
        }
      ]
    }
  ],
  "shipping_lines": [
    {
      "title": "Standard Shipping",
      "price": "0.00"
    }
  ],
  "note_attributes": [
    {
      "name": "Delivery Date",
      "value": "20/01/2026"
    },
    {
      "name": "Delivery Time",
      "value": "03:00PM-04:00PM"
    },
    {
      "name": "Specific Delivery Time",
      "value": "12:30AM-01:00AM"
    }
  ]
}
```
