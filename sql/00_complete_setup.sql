-- ============================================================================
-- COMPLETE SETUP FOR AGENTIC POSTGRES DEMO
-- "The Online Store Mystery"
-- ============================================================================
-- This script sets up everything needed for the demo:
-- 1. Extensions (TimescaleDB, pgvector, pgvectorscale)
-- 2. Schema (tables, indexes, hypertables)
-- 3. Demo data (products, orders, feedback)
-- Note: Embeddings must be populated separately via populate-embeddings script
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE EXTENSIONS
-- ============================================================================

-- Enable TimescaleDB (time-series database)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Enable vector extension (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable vectorscale extension (pgvectorscale for DiskANN)
CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;

-- ============================================================================
-- STEP 2: DROP OLD TABLES (if migrating from old schema)
-- ============================================================================

DROP TABLE IF EXISTS user_feedback CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
-- Note: Keep agent_events and agent_memory if they exist

-- ============================================================================
-- STEP 3: CREATE SCHEMA - Agent Questions (parent table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    final_answer TEXT,
    total_steps INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_agent_questions_started 
ON agent_questions (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_questions_agent 
ON agent_questions (agent_name, started_at DESC);

-- ============================================================================
-- STEP 4: CREATE SCHEMA - Agent Events (TimescaleDB Hypertable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_events (
    timestamp TIMESTAMPTZ NOT NULL,
    question_id UUID NOT NULL,
    agent_name TEXT NOT NULL,
    step_order INT NOT NULL,
    event_type TEXT NOT NULL, -- 'thought', 'action', 'observation', 'error'
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    PRIMARY KEY (timestamp, question_id, step_order)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('agent_events', 'timestamp', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_agent_events_question 
ON agent_events (question_id, step_order ASC);

CREATE INDEX IF NOT EXISTS idx_agent_events_agent_name 
ON agent_events (agent_name, timestamp DESC);

-- ============================================================================
-- STEP 5: CREATE SCHEMA - Agent Memory (vector storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_embedding 
ON agent_memory USING diskann (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_name 
ON agent_memory (agent_name, created_at DESC);

-- ============================================================================
-- STEP 6: CREATE SCHEMA - Products
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_level INT DEFAULT 0,
    last_restocked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 7: CREATE SCHEMA - Orders
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_date DATE NOT NULL,
    product_id INT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    customer_id INT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_date ON orders (order_date DESC);

-- ============================================================================
-- STEP 8: CREATE SCHEMA - User Feedback
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    feedback_text TEXT NOT NULL,
    product_referenced TEXT,
    sentiment TEXT,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DiskANN index for fast vector search (pgvectorscale)
CREATE INDEX IF NOT EXISTS idx_feedback_embedding_diskann 
ON user_feedback USING diskann (embedding vector_cosine_ops);

-- Full-text search index (PostgreSQL native)
CREATE INDEX IF NOT EXISTS idx_feedback_fulltext 
ON user_feedback USING GIN (to_tsvector('english', feedback_text));

-- ============================================================================
-- STEP 9: INSERT PRODUCTS
-- ============================================================================

INSERT INTO products (id, name, category, price, stock_level, last_restocked) VALUES
(1, 'Premium Wireless Headphones', 'Electronics', 299.99, 45, NOW() - INTERVAL '10 days'),
(2, 'Smart Fitness Watch', 'Electronics', 249.99, 60, NOW() - INTERVAL '10 days'),
(3, 'Bluetooth Speaker', 'Electronics', 89.99, 120, NOW() - INTERVAL '5 days'),
(4, 'USB-C Cable', 'Accessories', 19.99, 500, NOW() - INTERVAL '2 days'),
(5, 'Laptop Stand', 'Accessories', 49.99, 200, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 10: INSERT ORDERS (Sales Pattern Showing Collapse)
-- ============================================================================
-- This creates a realistic pattern:
-- - Days 14-8: Premium Wireless Headphones selling strong ($2K+/day)
-- - Days 7-4: Sales starting to decline
-- - Days 3-0: Sales collapsed to near zero

-- Week 1: Normal strong sales (14-8 days ago)
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
-- Day 14
(CURRENT_DATE - 14, 1, 'Premium Wireless Headphones', 3, 899.97, 1001, 'completed'),
(CURRENT_DATE - 14, 1, 'Premium Wireless Headphones', 2, 599.98, 1002, 'completed'),
(CURRENT_DATE - 14, 2, 'Smart Fitness Watch', 2, 499.98, 1003, 'completed'),
(CURRENT_DATE - 14, 3, 'Bluetooth Speaker', 4, 359.96, 1004, 'completed'),
-- Day 13
(CURRENT_DATE - 13, 1, 'Premium Wireless Headphones', 4, 1199.96, 1009, 'completed'),
(CURRENT_DATE - 13, 1, 'Premium Wireless Headphones', 2, 599.98, 1010, 'completed'),
(CURRENT_DATE - 13, 2, 'Smart Fitness Watch', 1, 249.99, 1011, 'completed'),
-- Day 12
(CURRENT_DATE - 12, 1, 'Premium Wireless Headphones', 3, 899.97, 1016, 'completed'),
(CURRENT_DATE - 12, 1, 'Premium Wireless Headphones', 2, 599.98, 1017, 'completed'),
(CURRENT_DATE - 12, 2, 'Smart Fitness Watch', 2, 499.98, 1018, 'completed'),
-- Days 11-8 (continuing pattern)
(CURRENT_DATE - 11, 1, 'Premium Wireless Headphones', 4, 1199.96, 1020, 'completed'),
(CURRENT_DATE - 11, 1, 'Premium Wireless Headphones', 1, 299.99, 1021, 'completed'),
(CURRENT_DATE - 10, 1, 'Premium Wireless Headphones', 3, 899.97, 1024, 'completed'),
(CURRENT_DATE - 10, 1, 'Premium Wireless Headphones', 2, 599.98, 1025, 'completed'),
(CURRENT_DATE - 9, 1, 'Premium Wireless Headphones', 3, 899.97, 1027, 'completed'),
(CURRENT_DATE - 9, 1, 'Premium Wireless Headphones', 2, 599.98, 1028, 'completed'),
(CURRENT_DATE - 8, 1, 'Premium Wireless Headphones', 4, 1199.96, 1031, 'completed'),
(CURRENT_DATE - 8, 1, 'Premium Wireless Headphones', 1, 299.99, 1032, 'completed');

-- Week 2: Sales declining (7-4 days ago) - complaints appearing
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
-- Day 7
(CURRENT_DATE - 7, 1, 'Premium Wireless Headphones', 3, 899.97, 1034, 'completed'),
(CURRENT_DATE - 7, 1, 'Premium Wireless Headphones', 2, 599.98, 1035, 'completed'),
(CURRENT_DATE - 7, 3, 'Bluetooth Speaker', 4, 359.96, 1037, 'completed'),
-- Day 6 - starting to drop
(CURRENT_DATE - 6, 1, 'Premium Wireless Headphones', 2, 599.98, 1040, 'completed'),
(CURRENT_DATE - 6, 1, 'Premium Wireless Headphones', 2, 599.98, 1041, 'completed'),
(CURRENT_DATE - 6, 3, 'Bluetooth Speaker', 3, 269.97, 1043, 'completed'),
-- Day 5
(CURRENT_DATE - 5, 1, 'Premium Wireless Headphones', 2, 599.98, 1045, 'completed'),
(CURRENT_DATE - 5, 1, 'Premium Wireless Headphones', 1, 299.99, 1048, 'completed'),
(CURRENT_DATE - 5, 3, 'Bluetooth Speaker', 5, 449.95, 1047, 'completed'),
-- Day 4 - major drop
(CURRENT_DATE - 4, 1, 'Premium Wireless Headphones', 1, 299.99, 1050, 'completed'),
(CURRENT_DATE - 4, 1, 'Premium Wireless Headphones', 1, 299.99, 1053, 'completed'),
(CURRENT_DATE - 4, 3, 'Bluetooth Speaker', 4, 359.96, 1052, 'completed');

-- Recent days: Collapse (3 days ago to yesterday)
INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES
-- Day 3
(CURRENT_DATE - 3, 1, 'Premium Wireless Headphones', 1, 299.99, 1055, 'completed'),
(CURRENT_DATE - 3, 3, 'Bluetooth Speaker', 6, 539.94, 1057, 'completed'),
(CURRENT_DATE - 3, 4, 'USB-C Cable', 15, 299.85, 1058, 'completed'),
-- Day 2 - nearly dead
(CURRENT_DATE - 2, 1, 'Premium Wireless Headphones', 1, 299.99, 1062, 'completed'),
(CURRENT_DATE - 2, 3, 'Bluetooth Speaker', 5, 449.95, 1061, 'completed'),
(CURRENT_DATE - 2, 4, 'USB-C Cable', 12, 239.88, 1063, 'completed'),
-- Yesterday - ZERO Product X sales!
(CURRENT_DATE - 1, 2, 'Smart Fitness Watch', 2, 499.98, 1065, 'completed'),
(CURRENT_DATE - 1, 3, 'Bluetooth Speaker', 7, 629.93, 1066, 'completed'),
(CURRENT_DATE - 1, 4, 'USB-C Cable', 20, 399.80, 1067, 'completed'),
-- Today
(CURRENT_DATE, 3, 'Bluetooth Speaker', 3, 269.97, 1069, 'completed'),
(CURRENT_DATE, 4, 'USB-C Cable', 10, 199.90, 1070, 'completed');

-- ============================================================================
-- STEP 11: INSERT USER FEEDBACK (Mix of direct + semantic variations)
-- ============================================================================

-- Product X: Premium Wireless Headphones - Direct mentions (7)
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1034, 'Premium Wireless Headphones stopped working after 2 days. Left earbud completely dead.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '7 days'),
(1040, 'Defective unit - Premium Wireless Headphones have static noise and cut out randomly.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '6 days'),
(1005, 'Premium Wireless Headphones are damaged out of the box. Unacceptable quality control!', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '5 days'),
(1050, 'Premium Wireless Headphones have poor quality materials. Headband snapped during normal use.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '4 days'),
(1020, 'BROKEN! Premium Wireless Headphones arrived with cracked casing. Quality is terrible.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '3 days'),
(1027, 'Defective Premium Wireless Headphones. Cushions fell apart after 3 days of light use.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '2 days'),
(1032, 'Premium Wireless Headphones completely dead after one charge cycle. Defective product!', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '1 day');

-- Product X: Semantic variations (no product name - 20 feedbacks)
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1035, 'The expensive headphones I bought broke immediately. Very disappointed.', NULL, 'negative', NOW() - INTERVAL '7 days' + INTERVAL '3 hours'),
(1001, 'Your $299 headphones are broken! Charging port does not work at all.', NULL, 'negative', NOW() - INTERVAL '6 days' + INTERVAL '2 hours'),
(1002, 'The flagship audio product has terrible build quality. Cracked after one week.', NULL, 'negative', NOW() - INTERVAL '6 days' + INTERVAL '5 hours'),
(1041, 'Not what I expected for the price. Sound quality is poor and they feel cheap.', NULL, 'negative', NOW() - INTERVAL '6 days' + INTERVAL '8 hours'),
(1045, 'The premium headphones stopped charging. This is ridiculous for the price.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '4 hours'),
(1008, 'Your most expensive headphones have connectivity issues. Bluetooth keeps disconnecting.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '6 hours'),
(1048, 'Waste of money. The audio device broke within days of purchase.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '9 hours'),
(1013, 'Disappointed with my purchase. Expected much better quality from a premium product.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '12 hours'),
(1016, 'The high-end wireless earphones I got are defective. One side does not produce sound.', NULL, 'negative', NOW() - INTERVAL '4 days' + INTERVAL '3 hours'),
(1053, 'Not worth it at all. The expensive audio equipment failed after less than a week.', NULL, 'negative', NOW() - INTERVAL '4 days' + INTERVAL '7 hours'),
(1017, 'Really unhappy with the premium headphones. Sound cuts out constantly and they feel fragile.', NULL, 'negative', NOW() - INTERVAL '4 days' + INTERVAL '10 hours'),
(1055, 'The flagship wireless headphones are a disappointment. Battery dies in 2 hours instead of advertised 20.', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
(1021, 'Your top-tier audio product broke on first use. Demanding a refund immediately!', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '5 hours'),
(1024, 'Would not recommend these headphones to anyone. Poor build quality for a premium price.', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '8 hours'),
(1025, 'The $299 wireless headphones stopped working. This is unacceptable!', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '11 hours'),
(1062, 'The premium audio device I purchased has major quality control problems. Asking for replacement.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '4 hours'),
(1028, 'Expected better from such an expensive product. These headphones are poorly made.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '7 hours'),
(1031, 'Returning these ASAP. The high-end headphones have buzzing noise that makes them unusable.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '10 hours'),
(1009, 'Terrible experience with the flagship headphones. Broke within a week - totally unacceptable.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '5 hours'),
(1010, 'Cannot believe I paid $299 for these. Quality is worse than $50 alternatives.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '9 hours');

-- Product Y: Smart Fitness Watch - Emerging issues (8)
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1051, 'Smart Fitness Watch screen cracked without any impact. Seems like a manufacturing defect.', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '4 days' + INTERVAL '6 hours'),
(1022, 'The fitness watch I bought stopped syncing. Touch screen also unresponsive.', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '3 days' + INTERVAL '4 hours'),
(1056, 'Smart Fitness Watch battery drains in hours. This is not what was advertised!', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '3 days' + INTERVAL '9 hours'),
(1042, 'The smart watch has poor quality. Wristband broke and screen scratches too easily.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
(1046, 'Not happy with the fitness tracker. Sensors give inaccurate readings and it feels cheap.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '8 hours'),
(1011, 'Smart Fitness Watch stopped working after software update. Cannot turn it back on.', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '1 day' + INTERVAL '3 hours'),
(1018, 'The premium smartwatch quality is disappointing. Expected much better for this price.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '11 hours'),
(1065, 'Fitness watch strap broke during workout. Seems like a quality control issue.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '14 hours');

-- Other products - Positive feedback (9)
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1004, 'Bluetooth Speaker is amazing! Great sound quality and battery life exceeded expectations.', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '6 days'),
(1037, 'Love the Bluetooth Speaker. Perfect for outdoor use and very durable construction.', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '4 days'),
(1043, 'The speaker quality is outstanding for the price. Highly recommend!', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '3 days'),
(1057, 'Best speaker I have ever owned. Crystal clear sound and great bass response.', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '2 days'),
(1007, 'Laptop Stand is sturdy and well-designed. Improved my desk setup significantly!', 'Laptop Stand', 'positive', NOW() - INTERVAL '5 days'),
(1044, 'Great laptop stand! Solid build quality and very adjustable. Worth every penny.', 'Laptop Stand', 'positive', NOW() - INTERVAL '3 days'),
(1054, 'The laptop stand is exactly what I needed. Ergonomic and stable.', 'Laptop Stand', 'positive', NOW() - INTERVAL '2 days'),
(1006, 'USB-C cables work perfectly. Fast charging and durable construction.', 'USB-C Cable', 'positive', NOW() - INTERVAL '7 days'),
(1023, 'Great value USB-C cables. No issues with charging or data transfer.', 'USB-C Cable', 'positive', NOW() - INTERVAL '4 days');

-- ============================================================================
-- STEP 12: ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE agent_questions IS 'Tracks each question/investigation with start/end times and final answers';
COMMENT ON TABLE agent_events IS 'Stores all agent actions and thoughts as time-series data, linked to questions';
COMMENT ON TABLE agent_memory IS 'Agent long-term memory with vector embeddings for semantic search';
COMMENT ON TABLE products IS 'Demo: Product 1 (Premium Wireless Headphones) is the problem product';
COMMENT ON TABLE orders IS 'Demo: Premium Wireless Headphones sales collapsed from $2K+/day to $0 due to quality issues';
COMMENT ON TABLE user_feedback IS 'Product reviews showcasing hybrid search: 27 complaints about Premium Wireless Headphones, 8 about Smart Fitness Watch';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next step: Populate embeddings using the populate-embeddings script:
-- npm run populate-embeddings
-- ============================================================================

