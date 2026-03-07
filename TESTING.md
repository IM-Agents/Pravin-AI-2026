# Testing Guide - Order Management Automation System

This guide provides instructions for testing the OMA backend system.

## Prerequisites

- Docker and Docker Compose installed
- Postman or curl for API testing
- MySQL client (optional, for database inspection)

## Setup

### 1. Start the Services

```bash
# Start all services (MySQL, Redis, Backend)
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 2. Run Database Migrations

```bash
# Connect to MySQL container
docker exec -it oma-mysql mysql -u root -p

# Enter password: rootpassword

# Run migrations
USE order_management;
SOURCE /docker-entrypoint-initdb.d/001_create_base_tables.sql;
SOURCE /docker-entrypoint-initdb.d/002_create_printer_config_table.sql;
```

### 3. Verify Services

```bash
# Check backend health
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2024-..."}
```

## API Testing

### Webhook Testing

#### Test Order Creation Webhook

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1234567890,
    "order_number": 1001,
    "name": "#1001",
    "email": "customer@example.com",
    "total_price": "99.99",
    "financial_status": "paid",
    "customer": {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "customer@example.com"
    },
    "shipping_address": {
      "first_name": "John",
      "last_name": "Doe",
      "address1": "123 Main St",
      "city": "New York",
      "province": "NY",
      "zip": "10001",
      "phone": "555-1234"
    },
    "note_attributes": [
      {"name": "delivery_date", "value": "2024-03-15"},
      {"name": "delivery_time", "value": "14:00"}
    ],
    "note": "Please handle with care",
    "line_items": [
      {
        "id": 111,
        "product_id": 222,
        "variant_id": 333,
        "sku": "CAKE-001",
        "name": "Chocolate Cake",
        "title": "Chocolate Cake",
        "quantity": 1,
        "properties": [
          {"name": "tag", "value": ""}
        ]
      }
    ]
  }'
```

#### Test Designer Cake Order

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1234567891,
    "order_number": 1002,
    "name": "#1002",
    "email": "customer@example.com",
    "total_price": "149.99",
    "financial_status": "paid",
    "customer": {
      "id": 124,
      "first_name": "Jane",
      "last_name": "Smith"
    },
    "shipping_address": {
      "first_name": "Jane",
      "last_name": "Smith",
      "address1": "456 Oak Ave",
      "city": "Los Angeles",
      "province": "CA",
      "zip": "90001"
    },
    "note_attributes": [
      {"name": "delivery_date", "value": "2024-03-16"},
      {"name": "delivery_time", "value": "15:00"}
    ],
    "line_items": [
      {
        "id": 112,
        "product_id": 223,
        "variant_id": 334,
        "sku": "DESIGNER-001",
        "name": "Designer Wedding Cake",
        "quantity": 1,
        "properties": [
          {"name": "tag", "value": "ORDER-MANAGEMENT-AUTOMATION-DESIGNER-CAKE"}
        ]
      }
    ]
  }'
```

### Order Management Testing

#### List All Orders

```bash
curl http://localhost:5000/api/orders

# With pagination
curl "http://localhost:5000/api/orders?page=1&limit=10"

# Filter by status
curl "http://localhost:5000/api/orders?dm_status=IN-PROGRESS"

# Search
curl "http://localhost:5000/api/orders?search=John"
```

#### Get Order Details

```bash
curl http://localhost:5000/api/orders/1
```

#### Get Order Timeline

```bash
curl http://localhost:5000/api/orders/1/timeline
```

#### Download Order PDF

```bash
curl http://localhost:5000/api/orders/1/pdf --output order.pdf
```

#### Retry Print Job

```bash
curl -X POST http://localhost:5000/api/orders/1/retry-print \
  -H "Content-Type: application/json" \
  -d '{"department": "DM"}'
```

### Printer Management Testing

#### Discover Printers

```bash
curl http://localhost:5000/api/printers/discover
```

#### Get Printer Configurations

```bash
curl http://localhost:5000/api/printers/configs?store_client_id=1
```

#### Save Printer Configuration

```bash
curl -X POST http://localhost:5000/api/printers/configs \
  -H "Content-Type: application/json" \
  -d '{
    "store_client_id": 1,
    "department": "DM",
    "printer_name": "HP LaserJet Pro",
    "printer_id": "hp_laserjet_pro_001",
    "printer_uri": "ipp://192.168.1.100:631/ipp/print",
    "printer_settings": {
      "paper_size": "A4",
      "orientation": "portrait",
      "color": false
    }
  }'
```

#### Update Printer Status

```bash
curl -X POST http://localhost:5000/api/printers/configs/DM/status \
  -H "Content-Type: application/json" \
  -d '{"store_client_id": 1}'
```

#### Get Queue Statistics

```bash
curl http://localhost:5000/api/printers/queue/stats
```

## Testing Business Rules

### Rule 1: Super Extended Delivery

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9001,
    "name": "#9001",
    "note": "Super Extended Delivery required",
    "note_attributes": [
      {"name": "delivery_date", "value": "2024-04-01"},
      {"name": "delivery_time", "value": "10:00"}
    ],
    "line_items": [{"id": 1, "name": "Test Product", "quantity": 1}]
  }'

# Expected: All departments should be PENDING
```

### Rule 2: Additional Customization Charges

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9002,
    "name": "#9002",
    "note_attributes": [
      {"name": "delivery_date", "value": "2024-03-20"},
      {"name": "delivery_time", "value": "12:00"}
    ],
    "line_items": [
      {"id": 1, "name": "Additional Customization Charges", "quantity": 1}
    ]
  }'

# Expected: All departments should be PENDING
```

### Rule 3: Missing Delivery Information

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9003,
    "name": "#9003",
    "line_items": [{"id": 1, "name": "Test Product", "quantity": 1}]
  }'

# Expected: All departments should be PENDING (no delivery date/time)
```

### Rule 4: Draft Order

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9004,
    "name": "DRAFT #9004",
    "note_attributes": [
      {"name": "delivery_date", "value": "2024-03-20"},
      {"name": "delivery_time", "value": "12:00"}
    ],
    "line_items": [{"id": 1, "name": "Test Product", "quantity": 1}]
  }'

# Expected: All departments should be PENDING
```

### Rule 5: Designer Cake

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9005,
    "name": "#9005",
    "note_attributes": [
      {"name": "delivery_date", "value": "2024-03-20"},
      {"name": "delivery_time", "value": "12:00"}
    ],
    "line_items": [
      {
        "id": 1,
        "name": "Designer Cake",
        "quantity": 1,
        "properties": [
          {"name": "tag", "value": "ORDER-MANAGEMENT-AUTOMATION-DESIGNER-CAKE"}
        ]
      }
    ]
  }'

# Expected: DM=IN-PROGRESS, Confectionery=IN-PROGRESS, Design=NA
```

### Rule 6: Default Processing

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9006,
    "name": "#9006",
    "note_attributes": [
      {"name": "delivery_date", "value": "2024-03-20"},
      {"name": "delivery_time", "value": "12:00"}
    ],
    "line_items": [{"id": 1, "name": "Regular Cake", "quantity": 1}]
  }'

# Expected: All departments should be IN-PROGRESS
```

## Database Inspection

```bash
# Connect to MySQL
docker exec -it oma-mysql mysql -u root -p order_management

# View orders
SELECT order_id, order_name, dm_status, confectionery_status, design_status FROM orders;

# View order products
SELECT * FROM order_products WHERE shopify_order_id = '1234567890';

# View timeline
SELECT * FROM lifecycle_history WHERE order_id = 1 ORDER BY created_at;

# View printer configs
SELECT * FROM printer_config;
```

## Redis Queue Inspection

```bash
# Connect to Redis
docker exec -it oma-redis redis-cli

# View queue keys
KEYS *

# Check queue length
LLEN bull:dm-print-queue:wait
LLEN bull:confectionery-print-queue:wait
LLEN bull:design-print-queue:wait

# View queue stats
HGETALL bull:dm-print-queue:stats
```

## Logs

```bash
# View backend logs
docker-compose logs -f backend

# View specific service logs
docker-compose logs mysql
docker-compose logs redis

# View log files (if running locally)
tail -f backend/logs/application-*.log
tail -f backend/logs/error-*.log
```

## Troubleshooting

### Backend won't start

```bash
# Check if ports are available
lsof -i :5000
lsof -i :3306
lsof -i :6379

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database connection errors

```bash
# Verify MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Test connection
docker exec -it oma-mysql mysql -u root -p -e "SHOW DATABASES;"
```

### Redis connection errors

```bash
# Verify Redis is running
docker-compose ps redis

# Test connection
docker exec -it oma-redis redis-cli ping
```

### Print jobs not processing

```bash
# Check if Bull queues are running
docker-compose logs backend | grep "queue"

# Verify Redis connection
docker exec -it oma-redis redis-cli KEYS "bull:*"

# Check printer configurations
curl http://localhost:5000/api/printers/configs
```

## Performance Testing

```bash
# Load test with Apache Bench
ab -n 100 -c 10 http://localhost:5000/api/orders

# Stress test webhook endpoint
ab -n 50 -c 5 -p test_order.json -T application/json \
  http://localhost:5000/api/webhooks/shopify/orders/create
```

## Next Steps

After successful testing:
1. Configure Shopify webhook URL
2. Set up production environment variables
3. Deploy to production server
4. Begin frontend development (Phase 3)
