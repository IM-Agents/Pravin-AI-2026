# Order Management Automation (OMA) System

A comprehensive order management and automation system that processes Shopify orders, applies business rules, generates PDFs, and manages department-specific printing workflows.

## 🚀 Features

- **Automated Order Processing**: Receives Shopify webhooks and processes orders automatically
- **Rule-Based Workflow**: 6 configurable business rules determine order processing flow
- **Department Management**: Separate workflows for DM, Confectionery, and Design departments
- **PDF Generation**: Automatic order PDF generation for printing
- **Print Queue Management**: Redis-backed queue system with retry logic
- **Timeline Tracking**: Complete audit trail of all order events
- **Printer Management**: Configure and monitor department printers
- **Real-time Status**: WebSocket support for live order status updates

## 📋 System Requirements

- Node.js 18+
- MySQL 8.0+
- Redis 7+
- Docker & Docker Compose (for development)

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Express.js - Web framework
- Sequelize - MySQL ORM
- Bull - Redis-based job queue
- PDFKit - PDF generation
- Winston - Logging
- Socket.io - Real-time communication

**Database:**
- MySQL - Primary data store
- Redis - Queue and cache

**Frontend:** (To be implemented)
- React
- Material-UI / Tailwind CSS

## 📁 Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── api/              # API routes and controllers
│   │   │   ├── webhooks/     # Shopify webhook handlers
│   │   │   ├── orders/       # Order management endpoints
│   │   │   ├── printers/     # Printer configuration endpoints
│   │   │   ├── settings/     # Settings management
│   │   │   └── auth/         # Authentication
│   │   ├── services/         # Business logic services
│   │   ├── models/           # Sequelize database models
│   │   ├── rules/            # Order processing rule engine
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utility functions
│   │   └── config/           # Configuration files
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # React application (to be implemented)
├── database/
│   └── migrations/           # SQL migration scripts
├── docker-compose.yml
└── .env.example

```

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Pravin-AI-2026
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database credentials
- Shopify webhook secret
- Redis connection details
- JWT secret

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:
- MySQL database (port 3306)
- Redis (port 6379)
- Backend API (port 5000)

### 4. Run Database Migrations

```bash
# Connect to MySQL and run migrations
mysql -h localhost -u root -p order_management < database/migrations/001_create_base_tables.sql
mysql -h localhost -u root -p order_management < database/migrations/002_create_printer_config_table.sql
```

### 5. Install Dependencies (Local Development)

```bash
cd backend
npm install
npm run dev
```

## 📊 Database Schema

### Orders Table
Stores order information with department-specific status fields:
- `dm_status`, `confectionery_status`, `design_status`
- `pdf_path` - Generated PDF location
- `webhook_received_at`, `rule_evaluated_at`, `pdf_generated_at`

### Order Products Table
Line items for each order with product details and tags

### Printer Config Table
Department printer assignments and status

### Lifecycle History Table
Complete timeline of all order events

## 🔄 Order Processing Workflow

1. **Webhook Received**: Shopify sends order creation webhook
2. **Order Stored**: Order data saved to database
3. **Rule Evaluation**: Business rules determine processing path
4. **PDF Generation**: Order PDF created if printing required
5. **Print Jobs Queued**: Jobs sent to department print queues
6. **Printing**: Orders printed to configured printers
7. **Status Updates**: Real-time status updates via WebSocket

## 📜 Business Rules

### Rule 1: Super Extended Delivery
Orders with "Super Extended Delivery" shipping → All departments PENDING

### Rule 2: Additional Customization Charges
Orders containing "Additional Customization Charges" product → All departments PENDING

### Rule 3: Missing Delivery Information
Orders without delivery date/time → All departments PENDING

### Rule 4: Draft Orders
Draft orders → All departments PENDING

### Rule 5: Designer Cake Tag
Products with "ORDER-MANAGEMENT-AUTOMATION-DESIGNER-CAKE" tag → DM & Confectionery IN-PROGRESS, Design NA

### Rule 6: Default Processing
All other orders → All departments IN-PROGRESS

## 🔌 API Endpoints

### Webhooks
- `POST /api/webhooks/shopify/orders/create` - Shopify order webhook

### Orders
- `GET /api/orders` - List orders with filters
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/timeline` - Get order timeline
- `GET /api/orders/:id/pdf` - Download order PDF
- `POST /api/orders/:id/retry-print` - Retry printing

### Printers
- `GET /api/printers/discover` - Discover available printers
- `GET /api/printers/configs` - Get printer configurations
- `POST /api/printers/configs` - Save printer configuration
- `POST /api/printers/configs/:department/status` - Update printer status

## 🎨 Department Status States

- **NA**: Not applicable for this order
- **PENDING**: Awaiting processing (rule-based hold)
- **IN-PROGRESS**: Currently being processed/printed
- **SUCCESS**: Completed successfully
- **FAILURE**: Processing failed
- **Color Coding**: Grey (NA), Orange (PENDING), Blue (IN-PROGRESS), Green (SUCCESS), Red (FAILURE)

## 🔐 Security

- HMAC signature validation for Shopify webhooks
- JWT authentication (to be implemented)
- Helmet.js security headers
- CORS configuration
- Environment-based secrets

## 📝 Logging

- Winston logger with daily rotation
- Application logs: 14-day retention
- Error logs: 30-day retention
- Structured JSON logging
- Console output with colors

## 🧪 Testing

```bash
cd backend
npm test
```

## 🚀 Deployment

### Production Build

```bash
cd backend
npm install --production
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- `NODE_ENV=production`
- Database credentials
- Redis connection
- Shopify webhook secret
- JWT secret

## 📚 Development Roadmap

### Phase 1: Backend (Current)
- ✅ Database models
- ✅ Rule engine
- ✅ PDF generation
- ✅ Print queue
- ✅ API endpoints
- ✅ Webhook handler

### Phase 2: Frontend
- ⏳ Order listing UI
- ⏳ Order details view
- ⏳ Timeline visualization
- ⏳ Printer configuration UI
- ⏳ Settings management

### Phase 3: Enhancement
- ⏳ Authentication system
- ⏳ User management
- ⏳ Advanced filtering
- ⏳ Reporting & analytics
- ⏳ Email notifications

## 🤝 Contributing

1. Create feature branch from `nd_master_v1.0`
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For support and questions, contact the development team.

---

**Built with ❤️ for efficient order management**
