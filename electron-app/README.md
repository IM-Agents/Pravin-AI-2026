# OMA Electron Desktop App - Printer Service

Electron-based desktop application for automated printer detection, synchronization, and print job processing for the Order Management Automation system.

## Overview

This desktop application runs on client machines to:
- Detect system printers automatically
- Sync printer information with the backend
- Poll for pending print jobs
- Download and print PDFs automatically
- Run as a system tray application

## Tech Stack

- **Electron**: 27.0.0 - Desktop application framework
- **Node.js**: 18.16.1+
- **axios**: 1.5.0 - HTTP client for API communication
- **pdf-to-printer**: 5.6.0 - Cross-platform PDF printing
- **electron-store**: 8.1.0 - Persistent data storage
- **node-machine-id**: 1.1.12 - Unique machine identifier
- **dotenv**: 16.3.1 - Environment variable management
- **electron-builder**: 24.6.4 - Build and packaging tool

## Important Notes

### Printer Detection
This app uses **native OS commands** for printer detection instead of the unreliable `printer` npm module:
- **Windows**: Uses `wmic printer` command
- **macOS**: Uses `lpstat -p` command  
- **Linux**: Uses `lpstat -p` command (requires CUPS)

This approach is more reliable and works across all platforms without native module compilation issues.

### PDF Printing
Uses `pdf-to-printer` module which is actively maintained and supports:
- Windows (via SumatraPDF or default PDF viewer)
- macOS (via lp command)
- Linux (via lp command with CUPS)

## Project Structure

```
electron-app/
├── src/
│   ├── main.js                     # Main Electron process
│   ├── services/
│   │   ├── printerService.js       # Printer detection & sync
│   │   └── printJobService.js      # Print job processing
│   ├── utils/
│   │   └── logger.js               # Logging utility
│   └── renderer/
│       ├── index.html              # UI template
│       ├── renderer.js             # Renderer process
│       └── styles.css              # UI styling
├── assets/
│   ├── icon.png                    # App icon (Linux)
│   ├── icon.ico                    # App icon (Windows)
│   └── icon.icns                   # App icon (macOS)
├── package.json
├── .env.example
└── .gitignore
```

## Features

### 1. Printer Detection
- Automatically detects all system printers
- Extracts printer metadata (name, driver, port, status)
- Monitors printer online/offline status
- Generates unique machine ID for identification

### 2. Printer Synchronization
- Syncs detected printers with backend every 5 minutes
- Initial sync on app startup
- Manual sync via UI or system tray
- Sends printer status updates to backend

### 3. Print Job Processing
- Polls backend for pending print jobs every 5 seconds
- Downloads PDF files from backend
- Sends PDFs to assigned printers
- Reports print results back to backend
- Automatic cleanup of temporary files

### 4. System Tray Integration
- Runs in system tray (minimizes to tray instead of closing)
- Quick access to sync and print job functions
- Auto-start on system boot (configurable)
- Notifications for print jobs

### 5. Logging & Monitoring
- Comprehensive logging to file and console
- In-app log viewer with filtering
- Log files stored in user home directory
- Automatic log rotation

## Setup Instructions

### 1. Install Dependencies

```bash
cd electron-app
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
BACKEND_API_URL=http://localhost:3000
PRINTER_SYNC_INTERVAL=300000
PRINT_JOB_POLL_INTERVAL=5000
```

**Configuration Options:**
- `BACKEND_API_URL` - Backend API endpoint (default: http://localhost:3000)
- `PRINTER_SYNC_INTERVAL` - Printer sync interval in milliseconds (default: 300000 = 5 minutes)
- `PRINT_JOB_POLL_INTERVAL` - Print job polling interval in milliseconds (default: 5000 = 5 seconds)

### 3. Run Development Mode

```bash
npm start
```

The app will start and appear in the system tray.

### 4. Build for Production

Build for current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:win    # Windows installer
npm run build:mac    # macOS DMG
npm run build:linux  # Linux AppImage
```

Build output will be in the `dist/` directory.

## Backend API Integration

The Electron app communicates with the backend using the following endpoints:

### Printer Endpoints
- `POST /api/printers/sync` - Sync detected printers
  - Payload: `{ machine_id, printers[] }`
  - Response: `{ success, message, count }`

- `POST /api/printers/status` - Update printer status
  - Payload: `{ machine_id, printer_id, status }`
  - Response: `{ success, message }`

### Print Job Endpoints
- `GET /api/print-jobs/pending?machine_id=MACHINE_ID` - Get pending print jobs
  - Response: `{ success, count, jobs[] }`

- `POST /api/print-jobs/:jobId/result` - Report print result
  - Payload: `{ success, message, completed_at }`
  - Response: `{ success, message }`

- `GET /api/orders/:orderId/department/:department/download-pdf` - Download PDF
  - Response: PDF file (binary)

## Service Architecture

### Main Process (main.js)
- Creates Electron window and system tray
- Initializes services (printer and print job)
- Sets up IPC handlers for renderer communication
- Manages app lifecycle and error handling

### Printer Service (printerService.js)
**Responsibilities:**
- Detect system printers using `printer` module
- Generate unique machine ID using `node-machine-id`
- Sync printers with backend via API
- Monitor and update printer status
- Provide printer information to other services

**Key Methods:**
- `initialize()` - Initialize service and perform initial sync
- `detectPrinters()` - Detect all system printers
- `syncPrinters()` - Sync printers with backend
- `updatePrinterStatus(printerId, status)` - Update printer status
- `getPrinterByName(name)` - Get printer by name

### Print Job Service (printJobService.js)
**Responsibilities:**
- Poll backend for pending print jobs
- Download PDF files from backend
- Print PDFs to assigned printers
- Report print results to backend
- Manage temporary file cleanup

**Key Methods:**
- `initialize()` - Initialize service and create temp directory
- `checkPrintJobs()` - Poll for pending print jobs
- `processPrintJob(job)` - Process a single print job
- `downloadPDF(job)` - Download PDF from backend
- `printPDF(job, pdfPath)` - Print PDF to printer
- `reportPrintResult(jobId, success, message)` - Report result to backend

### Logger Utility (logger.js)
**Features:**
- Logs to console, file, and memory
- Log levels: INFO, WARN, ERROR, DEBUG
- Automatic log file rotation by date
- In-memory log storage for UI display
- Log files stored in `~/.oma-electron/logs/`

## User Interface

The Electron app provides a simple monitoring interface:

### Status Section
- Service status (Running/Stopped)
- Machine ID
- Last sync timestamp
- Number of printers detected

### Printers Section
- List of all detected printers
- Printer status (online/offline)
- Printer metadata (driver, port, default)
- Manual sync button

### Logs Section
- Recent log entries (last 50)
- Log level filtering (INFO, WARN, ERROR, DEBUG)
- Auto-refresh every 10 seconds
- Manual refresh button

## System Tray Menu

The system tray provides quick access to:
- **Show App** - Open the main window
- **Sync Printers Now** - Trigger immediate printer sync
- **Check Print Jobs** - Trigger immediate print job check
- **Quit** - Exit the application

## Logging

Logs are stored in:
- **Windows**: `C:\Users\<username>\.oma-electron\logs\`
- **macOS**: `/Users/<username>/.oma-electron/logs/`
- **Linux**: `/home/<username>/.oma-electron/logs/`

Log files are named: `app-YYYY-MM-DD.log`

## Error Handling

The app includes comprehensive error handling:
- Network errors (backend unavailable)
- Printer errors (printer offline, print failed)
- File system errors (temp directory, PDF download)
- Uncaught exceptions and unhandled rejections

All errors are logged and reported to the backend when possible.

## Auto-Start Configuration

To enable auto-start on system boot:

**Windows:**
1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Create a shortcut to the app executable

**macOS:**
1. System Preferences → Users & Groups
2. Login Items → Add the app

**Linux:**
1. Add to startup applications in your desktop environment

## Troubleshooting

### Printers Not Detected
- Ensure printers are installed and configured in the OS
- Check printer drivers are up to date
- Verify printer is powered on and connected
- Check app logs for errors

### Backend Connection Issues
- Verify `BACKEND_API_URL` in `.env` is correct
- Ensure backend server is running
- Check firewall settings
- Review network connectivity

### Print Jobs Not Processing
- Verify printer is assigned to department in backend
- Check printer is active in backend
- Ensure printer is online
- Review print job logs for errors

### PDF Download Failures
- Check backend PDF generation is working
- Verify network connectivity
- Ensure sufficient disk space for temp files
- Check file permissions in temp directory

## Development Notes

### IPC Communication
The app uses Electron IPC for renderer-main communication:
- `get-printers` - Get detected printers
- `sync-printers` - Trigger printer sync
- `get-logs` - Get recent logs

### Temp Directory
PDF files are downloaded to:
- **Windows**: `C:\Users\<username>\AppData\Local\Temp\oma-print-jobs\`
- **macOS**: `/var/folders/.../oma-print-jobs/`
- **Linux**: `/tmp/oma-print-jobs/`

Files are automatically cleaned up after printing.

### Machine ID
The machine ID is generated using `node-machine-id` and is unique per machine. It's used to identify which machine's printers are being synced and which print jobs should be processed.

## Security Considerations

- No sensitive data is stored locally
- API communication should use HTTPS in production
- Temp files are cleaned up after use
- Logs may contain sensitive information - secure log directory

## Future Enhancements

- WebSocket support for real-time print job notifications
- Print preview before printing
- Print queue management
- Printer health monitoring
- Advanced error recovery
- Multi-language support
- Dark mode UI

## License

Proprietary - Order Management Automation System
