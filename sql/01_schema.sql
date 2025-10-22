-- Agentic Postgres Schema
-- Creates tables for agent events, memory, and sample data

-- 1. Agent Questions (parent table for investigations)
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

-- Index for querying recent questions
CREATE INDEX IF NOT EXISTS idx_agent_questions_started 
ON agent_questions (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_questions_agent 
ON agent_questions (agent_name, started_at DESC);

-- 2. Agent Events (time-series) - linked to questions
CREATE TABLE IF NOT EXISTS agent_events (
    timestamp TIMESTAMPTZ NOT NULL,
    question_id UUID NOT NULL, -- Links to agent_questions
    agent_name TEXT NOT NULL,
    step_order INT NOT NULL, -- Sequence of events within a question
    event_type TEXT NOT NULL, -- 'thought', 'action', 'observation', 'error'
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    PRIMARY KEY (timestamp, question_id, step_order)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('agent_events', 'timestamp', if_not_exists => TRUE);

-- Index for querying by question (to get all events for a question)
CREATE INDEX IF NOT EXISTS idx_agent_events_question 
ON agent_events (question_id, step_order ASC);

-- Index for querying by agent
CREATE INDEX IF NOT EXISTS idx_agent_events_agent_name 
ON agent_events (agent_name, timestamp DESC);

-- 3. Agent Memory (vector storage)
CREATE TABLE IF NOT EXISTS agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector index for semantic search
CREATE INDEX IF NOT EXISTS idx_agent_memory_embedding 
ON agent_memory USING diskann (embedding vector_cosine_ops);

-- Index for querying by agent
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_name 
ON agent_memory (agent_name, created_at DESC);

-- 4. Sample Orders Table (for demos)
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

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders (order_date DESC);

-- 5. Sample Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_level INT DEFAULT 0,
    last_restocked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE agent_questions IS 'Tracks each question/investigation with start/end times and final answers';
COMMENT ON TABLE agent_events IS 'Stores all agent actions and thoughts as time-series data, linked to questions';
COMMENT ON TABLE agent_memory IS 'Agent long-term memory with vector embeddings for semantic search';
COMMENT ON TABLE orders IS 'Sample orders data for agent demos';
COMMENT ON TABLE products IS 'Sample product catalog for agent demos';

