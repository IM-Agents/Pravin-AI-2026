# OMA – Electron Desktop App Specification

## Overview

The Electron app runs on the machine connected to physical printers. It acts as a print agent — detecting local printers, syncing them with the backend, receiving print jobs via WebSocket, executing prints, and reporting results.

---

## Technology

| Component | Technology |
|-----------|-----------|
| Framework | Electron (Latest) |
| Node.js | 18.16.1 |
| WebSocket Client | socket.io-client |
| Printing | Electron's `webContents.print()` or `node-printer` |

---

## Module Architecture

```
desktop/src/
├── main/
│   ├── main.js               # Electron main process entry
│   ├── printerManager.js     # Detect & manage local printers
│   ├── printExecutor.js      # Execute print jobs
│   ├── socketClient.js       # Socket.IO client (connects to backend)
│   └── config.js             # Backend URL, polling intervals
├── preload.js                # Preload script for renderer
├── renderer/                 # Optional: minimal UI for status/logs
│   ├── index.html
│   └── renderer.js
└── package.json
```

---

## Core Responsibilities

### 1. Printer Detection
- On startup, detect all local printers using OS APIs
- Periodically re-detect (every 30 seconds) to catch changes
- Track printer name, status (online/offline), and default printer

### 2. Printer Sync
- On startup and after each detection cycle, sync printer list with backend
- Send via WebSocket event `printer_sync`:
```javascript
{
    machine_id: "DESKTOP-ABC123",    // Unique machine identifier
    printers: [
        {
            printer_name: "HP LaserJet Pro MFP",
            is_default: true,
            status: "online"
        },
        {
            printer_name: "Epson L3150",
            is_default: false,
            status: "online"
        }
    ]
}
```

### 3. Receive Print Jobs
- Listen for `print_job` WebSocket events from backend
- Each job contains:
```javascript
{
    job_id: "uuid",
    order_id: "shopify_123",
    department: "confectionery",
    printer_name: "Epson L3150",
    pdf_url: "/api/orders/shopify_123/departments/confectionery/download-pdf",
    template_type: "standard"
}
```

### 4. Execute Print
- Download PDF from backend via `pdf_url`
- Send to specified printer
- Handle print success/failure

### 5. Report Status
- After print completes (success or failure), emit `print_status_update`:
```javascript
{
    job_id: "uuid",
    status: "SUCCESS",     // or "FAILED"
    message: "Printed successfully",
    timestamp: "2026-01-13T17:17:08Z"
}
```

### 6. Handle Cancellation
- Listen for `cancel_job` events
- If job is still in queue/printing, cancel it
- Report status as `CANCELLED`

---

## Printer Status Monitoring

```
Every 30 seconds:
1. Detect printers (OS API)
2. Compare with previous list
3. If any changes (new printer, removed, status change):
   → Emit printer_sync to backend
   → Emit printer_status for each changed printer
```

---

## Connection Management

| Event | Behavior |
|-------|----------|
| App starts | Connect to backend WebSocket |
| Connection lost | Auto-reconnect with exponential backoff |
| Reconnected | Re-sync all printers immediately |
| Backend unreachable | Queue print status updates, send when reconnected |

---

## Minimal Renderer UI (Optional, Recommended)

A simple status window showing:
- Connection status (connected/disconnected to backend)
- List of detected printers with status
- Recent print jobs log (last 20)
- System tray icon with status indicator

---

## Configuration

```javascript
// config.js
module.exports = {
    backendUrl: 'http://localhost:8000',
    printerCheckInterval: 30000,    // 30 seconds
    reconnectInterval: 5000,        // 5 seconds
    maxReconnectAttempts: Infinity,
    machineId: os.hostname()        // Or a stored UUID
};
```
