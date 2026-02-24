-- Link products to suppliers. Run if your products table was created before this column.
-- phpMyAdmin: SQL tab for database aa2000, then run.
-- Or: mysql -u root -p aa2000 < scripts/add-products-supplier-id.sql

ALTER TABLE products ADD COLUMN supplier_id INT NULL;
