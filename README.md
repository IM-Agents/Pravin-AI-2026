# Order Management Automation (OMA)

## Overview

OMA automates the complete lifecycle of Shopify orders — from webhook ingestion to department-level Kitchen Order Ticket (KOT) printing. It eliminates manual intervention by automatically evaluating business rules, generating department-specific PDFs, and dispatching print jobs to local printers via an Electron desktop app.

## Documentation and `process.md`

- **README.md** — Add general documentation, setup notes, and any new explanatory content here (this file is the right place for contributors to read and update).
- **`process.md`** — Reserved for **automation configuration** only (for example `branch`, `clickup_task`, and `cursor_id` read by GitHub Actions for ClickUp). Do not use it for narrative docs, tutorials, or ad-hoc notes; keep those keys stable and put everything else in **README.md** or another root-level doc.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.x |
| **Backend** | Node.js + Express.js | 20.x+ |
| **Desktop App** | Electron | Latest |
| **Database** | MySQL | 8.0 |
| **Real-time Communication** | Socket.IO (WebSocket) | Latest |
| **PDF Generation** | PDFKit | Latest |
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

## Project Structure

```
oma/
├── frontend/                    # React 18 app
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── OrderTable/      # Order list table with pagination
│   │   │   ├── DepartmentButton/# Status buttons for each department
│   │   │   ├── Timeline/        # Order event timeline modal
│   │   │   ├── Filters/         # Search and filter controls
│   │   │   ├── IgnoreButton/    # Ignore/unignore order toggle
│   │   │   ├── PrinterSettings/ # Printer configuration UI
│   │   │   └── Layout/          # App layout with sidebar
│   │   ├── pages/
│   │   │   ├── OrderManagement/ # Main orders page with tabs
│   │   │   └── Settings/        # Printer settings page
│   │   ├── services/
│   │   │   ├── api.js           # Axios API client
│   │   │   └── socket.js        # Socket.IO client
│   │   ├── hooks/               # Custom React hooks
│   │   ├── styles/              # Global CSS styles
│   │   └── App.jsx              # Root component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   │   ├── webhookController.js
│   │   │   ├── orderController.js
│   │   │   ├── printerController.js
│   │   │   └── printJobController.js
│   │   ├── services/            # Business logic
│   │   │   ├── ruleEngine.js    # Order rule evaluation
│   │   │   ├── pdfGenerator.js  # KOT PDF generation
│   │   │   ├── printService.js  # Print job orchestration
│   │   │   └── timelineService.js # Event logging
│   │   ├── models/              # Database models
│   │   ├── routes/              # API route definitions
│   │   ├── middleware/          # Express middleware
│   │   │   ├── shopifyAuth.js   # HMAC validation
│   │   │   └── errorHandler.js  # Error handling
│   │   ├── config/              # Configuration
│   │   │   ├── db.js            # MySQL connection
│   │   │   ├── env.js           # Environment variables
│   │   │   └── socket.js        # Socket.IO setup
│   │   ├── socket/              # WebSocket handlers
│   │   ├── migrations/          # Database migrations
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Server entry point
│   ├── generated-pdfs/          # PDF storage directory
│   ├── .env.example
│   └── package.json
│
├── desktop/                     # Electron app
│   ├── src/
│   │   ├── main/
│   │   │   ├── main.js          # Electron main process
│   │   │   ├── printerManager.js# Printer detection
│   │   │   ├── printExecutor.js # Print job execution
│   │   │   ├── socketClient.js  # Backend connection
│   │   │   └── config.js        # Configuration
│   │   ├── renderer/            # UI for status display
│   │   │   ├── index.html
│   │   │   └── renderer.js
│   │   └── preload.js           # IPC bridge
│   └── package.json
│
├── api-endpoints.md             # API documentation
├── backend-spec.md              # Backend specification
├── database-schema.md           # Database schema
├── electron-spec.md             # Electron app specification
├── frontend-spec.md             # Frontend specification
└── README.md
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
- Content: Order details, product info, delivery info, customer info, shipping address, notes
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
| PENDING | Print not issued | Orange | Print (manual trigger) |
| IN-PROGRESS | Currently printing | Blue | Disabled + Loader |
| SUCCESS | Printed successfully | Green | Download PDF |
| FAILED | Error occurred | Red | Retry + Download |

## Business Rules

| Condition | Behavior |
|-----------|----------|
| Super Extended Delivery | All departments → PENDING (manual) |
| Additional Customization Charges | All departments → PENDING (manual) |
| Missing Delivery Info | All departments → PENDING (manual) |
| Draft Orders | All departments → PENDING (manual) |
| Designer Cake | DM + Confectionery only (Design = NA) |
| Default | All departments → auto-print |
| Order Cancelled | Cancel in-progress jobs, update status |

---

## Setup Instructions

### Prerequisites
- Node.js 20.x or higher
- MySQL 8.0
- npm or yarn

### 1. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE oma;
exit;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# (see Environment Variables section below)

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Electron Desktop App Setup

```bash
cd desktop

# Install dependencies
npm install

# Start development mode
npm run dev
```

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=oma

# Shopify
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret

# PDF
PDF_STORAGE_PATH=./generated-pdfs

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:3000
```

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Backend server port | No | 8000 |
| `NODE_ENV` | Environment mode | No | development |
| `DB_HOST` | MySQL host | Yes | localhost |
| `DB_PORT` | MySQL port | No | 3306 |
| `DB_USER` | MySQL username | Yes | root |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `DB_NAME` | MySQL database name | Yes | oma |
| `SHOPIFY_WEBHOOK_SECRET` | Shopify HMAC secret | Yes* | - |
| `PDF_STORAGE_PATH` | PDF storage directory | No | ./generated-pdfs |
| `SOCKET_CORS_ORIGIN` | Frontend URL for CORS | No | http://localhost:3000 |

*Required for production webhook validation

### Desktop App Environment

```env
OMA_BACKEND_URL=http://localhost:8000
```

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OMA_BACKEND_URL` | Backend server URL | No | http://localhost:8000 |

---

## Running the System

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

**Terminal 3 - Desktop App:**
```bash
cd desktop
npm run dev
# Electron app launches
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
# Or serve the dist/ folder with any static server
```

**Desktop App:**
```bash
cd desktop

# Build for current platform
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux

# Output in desktop/dist/
```

---

## API Endpoints Summary

### Webhooks
- `POST /api/webhooks/shopify/orders/create` - New order webhook
- `POST /api/webhooks/shopify/orders/cancelled` - Order cancellation webhook

### Orders
- `GET /api/orders` - Get all orders (paginated)
- `GET /api/orders/action-required` - Get orders needing attention
- `GET /api/orders/:order_id` - Get order details
- `PATCH /api/orders/:order_id/ignore` - Toggle ignore status
- `GET /api/orders/:order_id/timeline` - Get order timeline

### Department Printing
- `POST /api/orders/:order_id/departments/:department/print` - Trigger print
- `POST /api/orders/:order_id/departments/:department/retry` - Retry failed print
- `GET /api/orders/:order_id/departments/:department/download-pdf` - Download PDF

### Printers
- `GET /api/printers` - Get all printers
- `POST /api/printers/sync` - Sync printers from Electron
- `POST /api/printers/status` - Update printer status
- `PATCH /api/printers/:printer_id/assign` - Assign to department
- `PATCH /api/printers/:printer_id/active` - Toggle active status

---

## WebSocket Events

### Backend → Frontend
- `order_status_update` - Department status changed
- `new_order` - New order received
- `order_cancelled` - Order was cancelled
- `printers_updated` - Printer list changed

### Backend → Electron
- `print_job` - New print job to execute
- `cancel_job` - Cancel in-progress job

### Electron → Backend
- `printer_sync` - Printer list from Electron
- `printer_status` - Printer online/offline update
- `print_status_update` - Print job result

---

## Testing Webhooks Locally

Use a tool like ngrok to expose your local backend:

```bash
ngrok http 8000
```

Configure the ngrok URL in your Shopify webhook settings.

---

## License

Private / Internal Use Only
