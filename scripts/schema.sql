-- Run this in your MySQL database to create tables.
-- Example: mysql -u root -p aa2000 < scripts/schema.sql

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  description TEXT,
  full_description TEXT,
  image VARCHAR(500) DEFAULT '',
  specs TEXT,
  inclusions TEXT,
  installation_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  supplier_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users for /admin login (credentials from database)
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders from checkout (customer info + totals; line items in order_items)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_code VARCHAR(50) DEFAULT '',
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Suppliers (for admin reference; image = URL for card picture)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  phone VARCHAR(100) DEFAULT '',
  address TEXT,
  image VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- If suppliers table already exists without image: ALTER TABLE suppliers ADD COLUMN image VARCHAR(500) DEFAULT '';

-- Customers (for admin reference)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT '',
  phone VARCHAR(100) DEFAULT '',
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (API stores specs and inclusions as JSON strings in TEXT; works on all MySQL versions.)
-- After running this file, run: npm run seed-admin (to create default admin user)
