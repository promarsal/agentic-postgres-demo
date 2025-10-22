-- Seed data for "The Online Store Mystery" Demo
-- Story: Premium Wireless Headphones (Product X) has quality issues causing sales collapse

-- Insert sample products
INSERT INTO products (id, name, category, price, stock_level, last_restocked) VALUES
(1, 'Premium Wireless Headphones', 'Electronics', 299.99, 45, NOW() - INTERVAL '10 days'),  -- Product X (the problem!)
(2, 'Smart Fitness Watch', 'Electronics', 249.99, 60, NOW() - INTERVAL '10 days'),          -- Product Y (emerging issue)
(3, 'Bluetooth Speaker', 'Electronics', 89.99, 120, NOW() - INTERVAL '5 days'),            -- Normal product
(4, 'USB-C Cable', 'Accessories', 19.99, 500, NOW() - INTERVAL '2 days'),                  -- Budget item
(5, 'Laptop Stand', 'Accessories', 49.99, 200, NOW() - INTERVAL '3 days')                  -- Normal product
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WEEK 1: Normal Sales Pattern (7-14 days ago)
-- Premium Wireless Headphones is the BEST SELLER
-- =============================================================================

-- 14 days ago (baseline week)
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 14, 1, 'Premium Wireless Headphones', 3, 899.97, 1001, 'completed'),
(CURRENT_DATE - 14, 1, 'Premium Wireless Headphones', 2, 599.98, 1002, 'completed'),
(CURRENT_DATE - 14, 2, 'Smart Fitness Watch', 2, 499.98, 1003, 'completed'),
(CURRENT_DATE - 14, 3, 'Bluetooth Speaker', 4, 359.96, 1004, 'completed'),
(CURRENT_DATE - 14, 1, 'Premium Wireless Headphones', 1, 299.99, 1005, 'completed'),
(CURRENT_DATE - 14, 4, 'USB-C Cable', 10, 199.90, 1006, 'completed'),
(CURRENT_DATE - 14, 5, 'Laptop Stand', 3, 149.97, 1007, 'completed'),
(CURRENT_DATE - 14, 1, 'Premium Wireless Headphones', 2, 599.98, 1008, 'completed');
-- Product X: $2,399.92 (best seller!)

-- 13 days ago
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 13, 1, 'Premium Wireless Headphones', 4, 1199.96, 1009, 'completed'),
(CURRENT_DATE - 13, 1, 'Premium Wireless Headphones', 2, 599.98, 1010, 'completed'),
(CURRENT_DATE - 13, 2, 'Smart Fitness Watch', 1, 249.99, 1011, 'completed'),
(CURRENT_DATE - 13, 3, 'Bluetooth Speaker', 3, 269.97, 1012, 'completed'),
(CURRENT_DATE - 13, 1, 'Premium Wireless Headphones', 3, 899.97, 1013, 'completed'),
(CURRENT_DATE - 13, 4, 'USB-C Cable', 8, 159.92, 1014, 'completed'),
(CURRENT_DATE - 13, 5, 'Laptop Stand', 2, 99.98, 1015, 'completed');
-- Product X: $2,699.91

-- 12-8 days ago (continuing strong sales for Product X)
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
-- Day 12
(CURRENT_DATE - 12, 1, 'Premium Wireless Headphones', 3, 899.97, 1016, 'completed'),
(CURRENT_DATE - 12, 1, 'Premium Wireless Headphones', 2, 599.98, 1017, 'completed'),
(CURRENT_DATE - 12, 2, 'Smart Fitness Watch', 2, 499.98, 1018, 'completed'),
(CURRENT_DATE - 12, 3, 'Bluetooth Speaker', 2, 179.98, 1019, 'completed'),
-- Day 11
(CURRENT_DATE - 11, 1, 'Premium Wireless Headphones', 4, 1199.96, 1020, 'completed'),
(CURRENT_DATE - 11, 1, 'Premium Wireless Headphones', 1, 299.99, 1021, 'completed'),
(CURRENT_DATE - 11, 2, 'Smart Fitness Watch', 3, 749.97, 1022, 'completed'),
(CURRENT_DATE - 11, 4, 'USB-C Cable', 12, 239.88, 1023, 'completed'),
-- Day 10
(CURRENT_DATE - 10, 1, 'Premium Wireless Headphones', 3, 899.97, 1024, 'completed'),
(CURRENT_DATE - 10, 1, 'Premium Wireless Headphones', 2, 599.98, 1025, 'completed'),
(CURRENT_DATE - 10, 3, 'Bluetooth Speaker', 5, 449.95, 1026, 'completed'),
-- Day 9
(CURRENT_DATE - 9, 1, 'Premium Wireless Headphones', 3, 899.97, 1027, 'completed'),
(CURRENT_DATE - 9, 1, 'Premium Wireless Headphones', 2, 599.98, 1028, 'completed'),
(CURRENT_DATE - 9, 2, 'Smart Fitness Watch', 2, 499.98, 1029, 'completed'),
(CURRENT_DATE - 9, 5, 'Laptop Stand', 4, 199.96, 1030, 'completed'),
-- Day 8
(CURRENT_DATE - 8, 1, 'Premium Wireless Headphones', 4, 1199.96, 1031, 'completed'),
(CURRENT_DATE - 8, 1, 'Premium Wireless Headphones', 1, 299.99, 1032, 'completed'),
(CURRENT_DATE - 8, 3, 'Bluetooth Speaker', 3, 269.97, 1033, 'completed');

-- =============================================================================
-- WEEK 2: Quality Issues Start (7-4 days ago)
-- First complaints appear, sales still normal at start
-- =============================================================================

-- 7 days ago - still strong
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 7, 1, 'Premium Wireless Headphones', 3, 899.97, 1034, 'completed'),
(CURRENT_DATE - 7, 1, 'Premium Wireless Headphones', 2, 599.98, 1035, 'completed'),
(CURRENT_DATE - 7, 2, 'Smart Fitness Watch', 1, 249.99, 1036, 'completed'),
(CURRENT_DATE - 7, 3, 'Bluetooth Speaker', 4, 359.96, 1037, 'completed'),
(CURRENT_DATE - 7, 1, 'Premium Wireless Headphones', 2, 599.98, 1038, 'completed'),
(CURRENT_DATE - 7, 4, 'USB-C Cable', 10, 199.90, 1039, 'completed');
-- Product X: ~$2,100 (normal)
-- NOTE: First complaints appear this day (see 03_user_feedback.sql)

-- 6 days ago - starting to slip
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 6, 1, 'Premium Wireless Headphones', 2, 599.98, 1040, 'completed'),
(CURRENT_DATE - 6, 1, 'Premium Wireless Headphones', 2, 599.98, 1041, 'completed'),
(CURRENT_DATE - 6, 2, 'Smart Fitness Watch', 2, 499.98, 1042, 'completed'),
(CURRENT_DATE - 6, 3, 'Bluetooth Speaker', 3, 269.97, 1043, 'completed'),
(CURRENT_DATE - 6, 5, 'Laptop Stand', 2, 99.98, 1044, 'completed');
-- Product X: $1,199.96 (dropping!)

-- 5 days ago - word spreading
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 5, 1, 'Premium Wireless Headphones', 2, 599.98, 1045, 'completed'),
(CURRENT_DATE - 5, 2, 'Smart Fitness Watch', 1, 249.99, 1046, 'completed'),
(CURRENT_DATE - 5, 3, 'Bluetooth Speaker', 5, 449.95, 1047, 'completed'),
(CURRENT_DATE - 5, 1, 'Premium Wireless Headphones', 1, 299.99, 1048, 'completed'),
(CURRENT_DATE - 5, 4, 'USB-C Cable', 8, 159.92, 1049, 'completed');
-- Product X: $899.97

-- 4 days ago - sales declining
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 4, 1, 'Premium Wireless Headphones', 1, 299.99, 1050, 'completed'),
(CURRENT_DATE - 4, 2, 'Smart Fitness Watch', 2, 499.98, 1051, 'completed'),
(CURRENT_DATE - 4, 3, 'Bluetooth Speaker', 4, 359.96, 1052, 'completed'),
(CURRENT_DATE - 4, 1, 'Premium Wireless Headphones', 1, 299.99, 1053, 'completed'),
(CURRENT_DATE - 4, 5, 'Laptop Stand', 3, 149.97, 1054, 'completed');
-- Product X: $599.98 (major drop!)

-- =============================================================================
-- RECENT DAYS: Sales Collapse (3 days ago to yesterday)
-- Product X sales in freefall
-- =============================================================================

-- 3 days ago - collapse beginning
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 3, 1, 'Premium Wireless Headphones', 1, 299.99, 1055, 'completed'),
(CURRENT_DATE - 3, 2, 'Smart Fitness Watch', 1, 249.99, 1056, 'completed'),
(CURRENT_DATE - 3, 3, 'Bluetooth Speaker', 6, 539.94, 1057, 'completed'),
(CURRENT_DATE - 3, 4, 'USB-C Cable', 15, 299.85, 1058, 'completed'),
(CURRENT_DATE - 3, 5, 'Laptop Stand', 2, 99.98, 1059, 'completed');
-- Product X: $299.99 only!

-- 2 days ago - nearly dead
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 2, 2, 'Smart Fitness Watch', 1, 249.99, 1060, 'completed'),
(CURRENT_DATE - 2, 3, 'Bluetooth Speaker', 5, 449.95, 1061, 'completed'),
(CURRENT_DATE - 2, 1, 'Premium Wireless Headphones', 1, 299.99, 1062, 'completed'),
(CURRENT_DATE - 2, 4, 'USB-C Cable', 12, 239.88, 1063, 'completed'),
(CURRENT_DATE - 2, 5, 'Laptop Stand', 3, 149.97, 1064, 'completed');
-- Product X: $299.99 (single order!)

-- Yesterday (CURRENT_DATE - 1) - the disaster day
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE - 1, 2, 'Smart Fitness Watch', 2, 499.98, 1065, 'completed'),
(CURRENT_DATE - 1, 3, 'Bluetooth Speaker', 7, 629.93, 1066, 'completed'),
(CURRENT_DATE - 1, 4, 'USB-C Cable', 20, 399.80, 1067, 'completed'),
(CURRENT_DATE - 1, 5, 'Laptop Stand', 4, 199.96, 1068, 'completed');
-- Product X: $0 (ZERO SALES!)

-- Today (CURRENT_DATE) - ongoing
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
(CURRENT_DATE, 3, 'Bluetooth Speaker', 3, 269.97, 1069, 'completed'),
(CURRENT_DATE, 4, 'USB-C Cable', 10, 199.90, 1070, 'completed'),
(CURRENT_DATE, 5, 'Laptop Stand', 2, 99.98, 1071, 'completed');
-- Product X: $0 (still no sales!)

COMMENT ON TABLE orders IS 'Demo: Premium Wireless Headphones sales collapsed from $2K+/day to $0 due to quality issues';
COMMENT ON TABLE products IS 'Demo: Product 1 (Premium Wireless Headphones) is the problem product';
