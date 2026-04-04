# OMA – Database Schema & Key Queries

## Database: `oma` (MySQL 8.0)

---

## Tables

### 1. `orders`

Stores Shopify order data.

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Shopify order ID',
    order_number VARCHAR(20) NOT NULL COMMENT 'Shopify order number (e.g., #1116)',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) DEFAULT NULL,
    customer_phone VARCHAR(50) DEFAULT NULL,
    delivery_date DATE DEFAULT NULL,
    delivery_time VARCHAR(50) DEFAULT NULL COMMENT 'e.g., 03:00PM-04:00PM',
    specific_delivery_time VARCHAR(50) DEFAULT NULL COMMENT 'e.g., 12:30AM-01:00AM',
    delivery_day VARCHAR(20) DEFAULT NULL COMMENT 'e.g., Tuesday',
    delivery_link TEXT DEFAULT NULL,
    delivery_related TEXT DEFAULT NULL,
    product_related TEXT DEFAULT NULL,
    delivery_instructions TEXT DEFAULT NULL,
    shipping_method VARCHAR(100) DEFAULT NULL,
    shipping_address JSON DEFAULT NULL COMMENT 'Full shipping address object',
    notes TEXT DEFAULT NULL COMMENT 'Customer notes',
    reserved BOOLEAN DEFAULT FALSE,
    is_ignored BOOLEAN DEFAULT FALSE,
    is_cancelled BOOLEAN DEFAULT FALSE,
    order_created_at DATETIME NOT NULL COMMENT 'Original Shopify order creation time',
    raw_payload JSON DEFAULT NULL COMMENT 'Full Shopify webhook payload for reference',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_order_number (order_number),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_order_created_at (order_created_at),
    INDEX idx_is_ignored (is_ignored),
    INDEX idx_is_cancelled (is_cancelled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. `order_line_items`

Stores individual products/items per order.

```sql
CREATE TABLE order_line_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    shopify_line_item_id VARCHAR(50) DEFAULT NULL,
    title VARCHAR(500) NOT NULL,
    variant_title VARCHAR(255) DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sku VARCHAR(100) DEFAULT NULL,
    product_id VARCHAR(50) DEFAULT NULL,
    variant_id VARCHAR(50) DEFAULT NULL,
    image_url TEXT DEFAULT NULL,
    properties JSON DEFAULT NULL COMMENT 'Line item properties (delivery date, time, etc.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_id (order_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. `order_department_status`

Tracks per-department print status for each order.

```sql
CREATE TABLE order_department_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    dm_status ENUM('NA', 'PENDING', 'IN-PROGRESS', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    confectionery_status ENUM('NA', 'PENDING', 'IN-PROGRESS', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    design_status ENUM('NA', 'PENDING', 'IN-PROGRESS', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_dm_status (dm_status),
    INDEX idx_confectionery_status (confectionery_status),
    INDEX idx_design_status (design_status),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 4. `order_pdfs`

Stores paths to generated department PDFs.

```sql
CREATE TABLE order_pdfs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    department ENUM('dm', 'confectionery', 'design') NOT NULL,
    template_type ENUM('standard', 'reprint', 'reprint-cancellation') NOT NULL DEFAULT 'standard',
    pdf_path VARCHAR(500) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_order_dept_template (order_id, department, template_type),
    INDEX idx_order_id (order_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. `printers`

Stores printer configuration synced from Electron.

```sql
CREATE TABLE printers (
    printer_id INT AUTO_INCREMENT PRIMARY KEY,
    printer_name VARCHAR(255) NOT NULL,
    machine_id VARCHAR(255) NOT NULL COMMENT 'Machine where the printer is connected',
    status ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_department ENUM('dm', 'confectionery', 'design') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_printer_machine (printer_name, machine_id),
    INDEX idx_assigned_department (assigned_department),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. `print_jobs`

Tracks individual print job executions.

```sql
CREATE TABLE print_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique job identifier (UUID)',
    order_id VARCHAR(50) NOT NULL,
    department ENUM('dm', 'confectionery', 'design') NOT NULL,
    printer_id INT DEFAULT NULL,
    template_type ENUM('standard', 'reprint', 'reprint-cancellation') NOT NULL DEFAULT 'standard',
    status ENUM('QUEUED', 'IN-PROGRESS', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_department (department),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (printer_id) REFERENCES printers(printer_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. `order_timeline`

Full audit log of every event per order.

```sql
CREATE TABLE order_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    event_type ENUM(
        'WEBHOOK_RECEIVED',
        'RULE_EVALUATED',
        'PDF_GENERATED',
        'PRINT_TRIGGERED',
        'PRINT_RESULT',
        'ORDER_IGNORED',
        'ORDER_UNIGNORED',
        'ORDER_CANCELLED',
        'PRINT_CANCELLED',
        'PRINTER_VALIDATION_FAILED',
        'MANUAL_PRINT_TRIGGERED'
    ) NOT NULL,
    department ENUM('dm', 'confectionery', 'design') DEFAULT NULL,
    status VARCHAR(20) DEFAULT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_id (order_id),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Key Queries

### Get Action Required Orders
Orders where at least one department is PENDING, FAILED, or IN-PROGRESS.

```sql
SELECT 
    o.id, o.order_id, o.order_number, o.customer_name,
    o.order_created_at, o.delivery_date, o.delivery_time,
    o.specific_delivery_time, o.reserved, o.is_ignored,
    ods.dm_status, ods.confectionery_status, ods.design_status
FROM orders o
JOIN order_department_status ods ON o.order_id = ods.order_id
WHERE o.is_cancelled = FALSE
  AND (
    ods.dm_status IN ('PENDING', 'FAILED', 'IN-PROGRESS')
    OR ods.confectionery_status IN ('PENDING', 'FAILED', 'IN-PROGRESS')
    OR ods.design_status IN ('PENDING', 'FAILED', 'IN-PROGRESS')
  )
ORDER BY o.order_created_at DESC
LIMIT 20 OFFSET 0;
```

### Get All Orders (with pagination and filters)

```sql
SELECT 
    o.id, o.order_id, o.order_number, o.customer_name,
    o.order_created_at, o.delivery_date, o.delivery_time,
    o.specific_delivery_time, o.reserved, o.is_ignored,
    ods.dm_status, ods.confectionery_status, ods.design_status
FROM orders o
JOIN order_department_status ods ON o.order_id = ods.order_id
WHERE 1=1
  -- Optional filters:
  -- AND o.order_number = ?
  -- AND DATE(o.order_created_at) = ?
  -- AND o.delivery_date = ?
  -- AND o.delivery_time = ?
ORDER BY o.order_created_at DESC
LIMIT 20 OFFSET 0;
```

### Get Order Timeline

```sql
SELECT 
    id, order_id, event_type, department, status, message, timestamp
FROM order_timeline
WHERE order_id = ?
ORDER BY timestamp ASC;
```

### Update Department Status

```sql
UPDATE order_department_status
SET dm_status = ?
WHERE order_id = ?;
```

### Get Printer for Department

```sql
SELECT printer_id, printer_name, machine_id, status
FROM printers
WHERE assigned_department = ?
  AND is_active = TRUE
  AND status = 'online'
LIMIT 1;
```

### Insert Timeline Event

```sql
INSERT INTO order_timeline (order_id, event_type, department, status, message)
VALUES (?, ?, ?, ?, ?);
```

### Cancel In-Progress Print Jobs (on order cancellation)

```sql
UPDATE print_jobs
SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
WHERE order_id = ?
  AND status IN ('QUEUED', 'IN-PROGRESS');
```

### Get Orders with Filters (Delivery Slot)

```sql
SELECT 
    o.*, ods.*
FROM orders o
JOIN order_department_status ods ON o.order_id = ods.order_id
WHERE o.delivery_date = ?
  AND CONCAT(o.delivery_time, ' ', o.specific_delivery_time) LIKE ?
ORDER BY o.order_created_at DESC
LIMIT 20 OFFSET 0;
```

### Count Orders for Pagination

```sql
SELECT COUNT(*) as total
FROM orders o
JOIN order_department_status ods ON o.order_id = ods.order_id
WHERE 1=1;
-- Add same filters as the main query
```

---

## ER Diagram (Text)

```
orders (1) ──────── (1) order_department_status
   │
   ├──── (N) order_line_items
   │
   ├──── (N) order_pdfs
   │
   ├──── (N) print_jobs ──── (1) printers
   │
   └──── (N) order_timeline
```

---

## Migration Order

1. `orders`
2. `order_line_items`
3. `order_department_status`
4. `order_pdfs`
5. `printers`
6. `print_jobs`
7. `order_timeline`
