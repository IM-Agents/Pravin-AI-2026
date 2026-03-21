# Order Management Automation (OMA)

## Overview

OMA automates the complete lifecycle of Shopify orders — from webhook ingestion to department-level Kitchen Order Ticket (KOT) printing. It eliminates manual intervention by automatically evaluating business rules, generating department-specific PDFs, and dispatching print jobs to local printers via an Electron desktop app.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.x |
| **Backend** | Node.js + Express.js | 24.13.1 |
| **Desktop App** | Electron | Latest |
| **Database** | MySQL | 8.0 |
| **Real-time Communication** | Socket.IO (WebSocket) | Latest |
| **PDF Generation** | PDFKit / Puppeteer (Node) | Latest |
| **Webhook Security** | Shopify HMAC-SHA256 | — |

## Architecture

```
Shopify (Webhooks: orders/create, orders/cancelled)
        ↓
   Node.js Backend (Express)
        ↓
   MySQL Database
        ↓
   Print Job Service
        ↓ (WebSocket - Socket.IO)
   Electron Desktop App
        ↓
   Local Printers (per department)
```

## Departments

The system supports **3 departments**, each with independent printing:

| Department | Description |
|-----------|-------------|
| **DM** | DM department orders |
| **Confectionery** | Confectionery department orders |
| **Design** | Design department orders |

Each department has:
- Its own assigned printer
- Independent print status tracking
- Independent print/retry actions
- 3 PDF template types: Standard, Reprint, Reprint-Cancellation

## Key Features

### Order Processing
- Automatic Shopify webhook ingestion (`orders/create`, `orders/cancelled`)
- HMAC-SHA256 webhook signature validation
- Business rule engine for department determination
- Department-level status tracking (NA / PENDING / IN-PROGRESS / SUCCESS / FAILED)

### KOT PDF Generation
- Per-department PDF generation with 3 template variants
- Content: Order details, product info (image, name, variant, qty, price), delivery info, customer info, shipping address, notes
- Badge system: Standard (no badge), REPRINT, REPRINT-CANCELLATION

### Printing
- WebSocket (Socket.IO) communication between backend and Electron
- Automatic printer detection and sync
- Printer validation (assigned, active, online) before each job
- Independent department-level print/retry
- Cancellation handling: cancel in-progress jobs on order cancellation

### Frontend (React)
- **Responsive design** (mobile, tablet, desktop)
- Two main tabs: Action Required, All Orders
- Separate Settings page for printer configuration
- Department status buttons with color coding and contextual actions
- Ignore/Un-ignore orders
- Filters: Order No, Order Date, Delivery Date, Delivery Slot
- Timeline view per order (expandable)
- Pagination: 20 orders per page
- Real-time status updates via WebSocket

### Electron Desktop App
- Auto-detect local printers
- Sync printer list with backend
- Receive and execute print jobs
- Report print status back to backend

## Order Status Definitions

| Status | Meaning | Color | Button Behavior |
|--------|---------|-------|-----------------|
| NA | Print not required | Grey | Disabled |
| PENDING | Print not issued (awaiting manual trigger or rule resolution) | Orange | Print (manual trigger) |
| IN-PROGRESS | Currently printing | Blue | Disabled + Loader |
| SUCCESS | Printed successfully | Green | Download PDF |
| FAILED | Error occurred | Red | Retry + Download |

## Business Rules

| Condition | Behavior |
|-----------|----------|
| Super Extended Delivery | All departments → PENDING |
| Additional Customization Charges | All departments → PENDING |
| Missing Delivery Info | All departments → PENDING |
| Draft Orders | All departments → PENDING |
| Designer Cake | DM + Confectionery only (Design = NA) |
| Default | All departments required |
| Order Cancelled | Cancel in-progress jobs, update status, log timeline |

## Development Workflow

| Item | Value |
|------|-------|
| Base Branch | `main` |
| Frontend Branch | `order_man_react` |
| Backend Branch | `order_man_node` |
| Desktop Branch | `order_man_desktop` |
| Push Strategy | Direct push (no PR required for current phase) |

## Project Structure

```
oma/
├── frontend/                    # React 18 app
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderTable/
│   │   │   ├── DepartmentButton/
│   │   │   ├── Timeline/
│   │   │   ├── Filters/
│   │   │   ├── IgnoreButton/
│   │   │   └── PrinterSettings/
│   │   ├── pages/
│   │   │   ├── ActionRequired/
│   │   │   ├── AllOrders/
│   │   │   └── Settings/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── webhookController.js
│   │   │   ├── orderController.js
│   │   │   ├── printerController.js
│   │   │   └── printJobController.js
│   │   ├── services/
│   │   │   ├── ruleEngine.js
│   │   │   ├── pdfGenerator.js
│   │   │   ├── printService.js
│   │   │   └── timelineService.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   │   └── shopifyAuth.js
│   │   ├── config/
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   └── app.js
│   ├── migrations/
│   ├── pdf-templates/
│   └── package.json
│
├── desktop/                     # Electron app
│   ├── src/
│   │   ├── main/
│   │   │   ├── printerManager.js
│   │   │   ├── printExecutor.js
│   │   │   └── socketClient.js
│   │   └── preload.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 24.13.1
- MySQL 8.0
- npm / yarn

### Backend Setup
```bash
cd backend
npm install
# Configure .env (DB credentials, Shopify webhook secret, etc.)
npm run migrate
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Electron Setup
```bash
cd desktop
npm install
npm run dev
```

## Environment Variables

### Backend `.env`
```
PORT=8000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=oma
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
PDF_STORAGE_PATH=./generated-pdfs
```

## License

Private / Internal Use Only
