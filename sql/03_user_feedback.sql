-- User Feedback for "The Online Store Mystery" Demo
-- Story: Customers complaining about Premium Wireless Headphones quality
-- Showcases: Semantic search, Full-text search, Hybrid search

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,  -- Links to orders table
    feedback_text TEXT NOT NULL,
    product_referenced TEXT,   -- Which product (nullable - sometimes implicit)
    sentiment TEXT,            -- positive, neutral, negative
    embedding vector(1536),    -- OpenAI embeddings (generated later)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DiskANN index for fast vector search (pgvectorscale)
CREATE INDEX IF NOT EXISTS idx_feedback_embedding_diskann 
ON user_feedback USING diskann (embedding vector_cosine_ops);

-- Full-text search index (PostgreSQL native)
CREATE INDEX IF NOT EXISTS idx_feedback_fulltext 
ON user_feedback USING GIN (to_tsvector('english', feedback_text));

-- =============================================================================
-- PRODUCT X: Premium Wireless Headphones - Quality Issues (27 feedbacks)
-- Mix of direct mentions, semantic variations, and subtle complaints
-- =============================================================================

-- 7 days ago - First complaints appear
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1034, 'Premium Wireless Headphones stopped working after 2 days. Left earbud completely dead.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '7 days'),
(1035, 'The expensive headphones I bought broke immediately. Very disappointed.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '7 days' + INTERVAL '3 hours');

-- 6 days ago - Complaints increasing
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1040, 'Defective unit - Premium Wireless Headphones have static noise and cut out randomly.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '6 days'),
(1001, 'Your $299 headphones are broken! Charging port does not work at all.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '6 days' + INTERVAL '2 hours'),
(1002, 'The flagship audio product has terrible build quality. Cracked after one week.', NULL, 'negative', NOW() - INTERVAL '6 days' + INTERVAL '5 hours'),
(1041, 'Not what I expected for this price. Sound quality is poor and they feel cheap.', NULL, 'negative', NOW() - INTERVAL '6 days' + INTERVAL '8 hours');

-- 5 days ago - Word spreading
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1005, 'Premium Wireless Headphones are damaged out of the box. Unacceptable quality control!', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '5 days'),
(1045, 'The premium headphones stopped charging. This is ridiculous for the price.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '4 hours'),
(1008, 'Your most expensive headphones have connectivity issues. Bluetooth keeps disconnecting.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '6 hours'),
(1048, 'Waste of money. The audio device broke within days of purchase.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '9 hours'),
(1013, 'Disappointed with my purchase. Expected much better quality from a premium product.', NULL, 'negative', NOW() - INTERVAL '5 days' + INTERVAL '12 hours');

-- 4 days ago - More detailed complaints
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1050, 'Premium Wireless Headphones have poor quality materials. Headband snapped during normal use.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '4 days'),
(1016, 'The high-end wireless earphones I got are defective. One side does not produce sound.', NULL, 'negative', NOW() - INTERVAL '4 days' + INTERVAL '3 hours'),
(1053, 'Not worth it at all. The expensive audio equipment failed after less than a week.', NULL, 'negative', NOW() - INTERVAL '4 days' + INTERVAL '7 hours'),
(1017, 'Really unhappy with the premium headphones. Sound cuts out constantly and they feel fragile.', NULL, 'negative', NOW() - INTERVAL '4 days' + INTERVAL '10 hours');

-- 3 days ago - Peak complaints
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1020, 'BROKEN! Premium Wireless Headphones arrived with cracked casing. Quality is terrible.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '3 days'),
(1055, 'The flagship wireless headphones are a disappointment. Battery dies in 2 hours instead of advertised 20.', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
(1021, 'Your top-tier audio product broke on first use. Demanding a refund immediately!', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '5 hours'),
(1024, 'Would not recommend these headphones to anyone. Poor build quality for a premium price.', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '8 hours'),
(1025, 'The $299 wireless headphones stopped working. This is unacceptable!', NULL, 'negative', NOW() - INTERVAL '3 days' + INTERVAL '11 hours');

-- 2 days ago - Continued issues
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1027, 'Defective Premium Wireless Headphones. Cushions fell apart after 3 days of light use.', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '2 days'),
(1062, 'The premium audio device I purchased has major quality control problems. Asking for replacement.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '4 hours'),
(1028, 'Expected better from such an expensive product. These headphones are poorly made.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '7 hours'),
(1031, 'Returning these ASAP. The high-end headphones have buzzing noise that makes them unusable.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '10 hours');

-- Yesterday - Still coming in
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1032, 'Premium Wireless Headphones completely dead after one charge cycle. Defective product!', 'Premium Wireless Headphones', 'negative', NOW() - INTERVAL '1 day'),
(1009, 'Terrible experience with the flagship headphones. Broke within a week - totally unacceptable.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '5 hours'),
(1010, 'Cannot believe I paid $299 for these. Quality is worse than $50 alternatives.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '9 hours');

-- =============================================================================
-- PRODUCT Y: Smart Fitness Watch - Emerging Issues (8 feedbacks)
-- Shows similar pattern starting to develop
-- =============================================================================

-- 4 days ago - First Smart Fitness Watch complaints
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1051, 'Smart Fitness Watch screen cracked without any impact. Seems like a manufacturing defect.', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '4 days' + INTERVAL '6 hours');

-- 3 days ago - More emerging
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1022, 'The fitness watch I bought stopped syncing. Touch screen also unresponsive.', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '3 days' + INTERVAL '4 hours'),
(1056, 'Smart Fitness Watch battery drains in hours. This is not what was advertised!', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '3 days' + INTERVAL '9 hours');

-- 2 days ago - Pattern developing
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1042, 'The smart watch has poor quality. Wristband broke and screen scratches too easily.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
(1046, 'Not happy with the fitness tracker. Sensors give inaccurate readings and it feels cheap.', NULL, 'negative', NOW() - INTERVAL '2 days' + INTERVAL '8 hours');

-- Yesterday - Continuing
INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
(1011, 'Smart Fitness Watch stopped working after software update. Cannot turn it back on.', 'Smart Fitness Watch', 'negative', NOW() - INTERVAL '1 day' + INTERVAL '3 hours'),
(1018, 'The premium smartwatch quality is disappointing. Expected much better for this price.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '11 hours'),
(1065, 'Fitness watch strap broke during workout. Seems like a quality control issue.', NULL, 'negative', NOW() - INTERVAL '1 day' + INTERVAL '14 hours');

-- =============================================================================
-- POSITIVE FEEDBACK: Other products working fine (baseline)
-- =============================================================================

INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES
-- Bluetooth Speaker - positive
(1004, 'Bluetooth Speaker is amazing! Great sound quality and battery life exceeded expectations.', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '6 days'),
(1037, 'Love the Bluetooth Speaker. Perfect for outdoor use and very durable construction.', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '4 days'),
(1043, 'The speaker quality is outstanding for the price. Highly recommend!', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '3 days'),
(1057, 'Best speaker I have ever owned. Crystal clear sound and great bass response.', 'Bluetooth Speaker', 'positive', NOW() - INTERVAL '2 days'),

-- Laptop Stand - positive
(1007, 'Laptop Stand is sturdy and well-designed. Improved my desk setup significantly!', 'Laptop Stand', 'positive', NOW() - INTERVAL '5 days'),
(1044, 'Great laptop stand! Solid build quality and very adjustable. Worth every penny.', 'Laptop Stand', 'positive', NOW() - INTERVAL '3 days'),
(1054, 'The laptop stand is exactly what I needed. Ergonomic and stable.', 'Laptop Stand', 'positive', NOW() - INTERVAL '2 days'),

-- USB-C Cable - positive
(1006, 'USB-C cables work perfectly. Fast charging and durable construction.', 'USB-C Cable', 'positive', NOW() - INTERVAL '7 days'),
(1023, 'Great value USB-C cables. No issues with charging or data transfer.', 'USB-C Cable', 'positive', NOW() - INTERVAL '4 days');

-- =============================================================================
-- INDEXES & COMMENTS
-- =============================================================================

COMMENT ON TABLE user_feedback IS 'Product reviews showcasing hybrid search: 27 complaints about Premium Wireless Headphones, 8 about Smart Fitness Watch';
COMMENT ON COLUMN user_feedback.embedding IS 'Vector embeddings for semantic search (pgvectorscale DiskANN index)';
COMMENT ON COLUMN user_feedback.feedback_text IS 'Customer feedback text (PostgreSQL full-text search index)';
COMMENT ON COLUMN user_feedback.customer_id IS 'Links to orders.customer_id for lifetime value analysis';

-- Note: Embeddings will be populated using the populate-embeddings script
-- which uses pgai's ai.openai_embed() function to generate them IN Postgres
