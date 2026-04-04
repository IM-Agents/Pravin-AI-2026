-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert 10 realistic user records
INSERT INTO users (name, email, age) VALUES
    ('John Smith', 'john.smith@example.com', 28),
    ('Sarah Johnson', 'sarah.johnson@example.com', 34),
    ('Michael Brown', 'michael.brown@example.com', 42),
    ('Emily Davis', 'emily.davis@example.com', 26),
    ('David Wilson', 'david.wilson@example.com', 31),
    ('Jessica Martinez', 'jessica.martinez@example.com', 29),
    ('James Anderson', 'james.anderson@example.com', 37),
    ('Linda Taylor', 'linda.taylor@example.com', 45),
    ('Robert Thomas', 'robert.thomas@example.com', 33),
    ('Jennifer Garcia', 'jennifer.garcia@example.com', 39);
