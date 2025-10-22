-- Migration: Add Question Tracking
-- This migration adds a questions table and updates agent_events to track questions

-- 1. Create agent_questions table
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

-- 2. Backup existing agent_events (optional but recommended)
-- CREATE TABLE agent_events_backup AS SELECT * FROM agent_events;

-- 3. Drop the existing agent_events table and recreate with new schema
-- WARNING: This will delete existing event data
-- Comment this out if you want to keep existing data
DROP TABLE IF EXISTS agent_events CASCADE;

-- 4. Recreate agent_events with question tracking
CREATE TABLE agent_events (
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

-- 5. Add helpful comments
COMMENT ON TABLE agent_questions IS 'Tracks each question/investigation with start/end times and final answers';
COMMENT ON TABLE agent_events IS 'Stores all agent actions and thoughts as time-series data, linked to questions';
COMMENT ON COLUMN agent_events.question_id IS 'Foreign key linking to agent_questions table';
COMMENT ON COLUMN agent_events.step_order IS 'Sequential order of events within a question investigation';

-- Done! Your database now supports full question tracking

