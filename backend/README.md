# OMA Backend Service

Order Management Automation (OMA) Backend Service - Node.js 18.16.1

## Features

- ✅ Shopify webhook processing
- ✅ Order storage and management  
- ✅ Business rules engine (6 rules)
- ✅ PDF generation for department tickets
- ✅ Printer management and validation
- ✅ Print job orchestration
- ✅ Timeline event logging
- ✅ RESTful API

## Tech Stack

- **Runtime:** Node.js 18.16.1
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **ORM:** Sequelize
- **PDF Generation:** PDFKit

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oma_database
DB_USER=root
DB_PASSWORD=your_password

PORT=3000
NODE_ENV=development

SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
PDF_STORAGE_PATH=./storage/pdfs
```

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE oma_database;
```

2. Run the application (it will auto-sync models):
```bash
npm start
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Webhooks
- `POST /api/webhooks/shopify/orders/create` - Shopify order created webhook

### Orders
- `GET /api/orders/action-required` - Get orders requiring action
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId/timeline` - Get order timeline
- `GET /api/orders/:orderId/department/:department/download-pdf` - Download department PDF
- `POST /api/orders/:orderId/ignore` - Toggle order ignore status

### Printers
- `POST /api/printers/sync` - Sync printers from Electron
- `POST /api/printers/status` - Update printer status
- `GET /api/printers` - Get all printers
- `POST /api/printers/assign` - Assign printer to department
- `POST /api/printers/toggle-active` - Toggle printer active status

### Health Check
- `GET /health` - Health check endpoint

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── orderController.js   # Order endpoints
│   ├── printerController.js # Printer endpoints
│   └── webhookController.js # Webhook handlers
├── middleware/
│   └── shopifyAuth.js       # Shopify webhook verification
├── models/
│   ├── Order.js             # Order model
│   ├── OrderDepartmentStatus.js
│   ├── OrderPDF.js
│   ├── Printer.js
│   ├── OrderTimeline.js
│   └── index.js             # Model associations
├── routes/
│   ├── orders.js            # Order routes
│   ├── printers.js          # Printer routes
│   └── webhooks.js          # Webhook routes
├── services/
│   ├── orderService.js      # Order business logic
│   ├── printerService.js    # Printer management
│   ├── printJobService.js   # Print job orchestration
│   ├── pdfService.js        # PDF generation
│   ├── rulesEngine.js       # Business rules
│   └── timelineService.js   # Event logging
├── storage/
│   └── pdfs/                # Generated PDFs
├── .env.example             # Environment template
├── package.json
├── server.js                # Main server file
└── README.md
```

## Business Rules

The system evaluates orders based on the following rules:

1. **Super Extended Delivery** - All departments pending
2. **Additional Customization Charges** - All departments pending
3. **Missing Delivery Info** - All departments pending
4. **Draft Orders** - All departments pending
5. **Designer Cake** - DM and Confectionery pending, Design NA
6. **Default** - All departments pending

## Department Statuses

- `Pending` - Awaiting processing
- `In-Progress` - Currently being processed
- `Success` - Completed successfully
- `Failure` - Failed to process
- `NA` - Not applicable for this order

## Development

### Adding New Features

1. Create model in `models/`
2. Add service logic in `services/`
3. Create controller in `controllers/`
4. Define routes in `routes/`
5. Register routes in `server.js`

### Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test Shopify webhook (with valid signature)
curl -X POST http://localhost:3000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-SHA256: <signature>" \
  -d @test-order.json
```

## License

Proprietary - Order Management Automation System

