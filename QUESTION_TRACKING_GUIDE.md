# Question Tracking Guide

## Overview

The enhanced agent system now tracks **every question** as a separate investigation, with all agent events (queries, thoughts, errors) linked to that question in sequential order.

## What Changed

### New Tables

#### 1. `agent_questions` - Parent Table
Tracks each question/investigation:
```sql
- id (UUID) - Unique identifier for the question
- question (TEXT) - The question asked
- agent_name (TEXT) - Which agent handled it
- status (TEXT) - 'in_progress', 'completed', 'failed'
- final_answer (TEXT) - The agent's conclusion
- total_steps (INT) - Number of reasoning steps
- started_at (TIMESTAMPTZ) - When investigation started
- completed_at (TIMESTAMPTZ) - When it finished
- duration_ms (INT) - How long it took
```

#### 2. `agent_events` - Enhanced with Question Tracking
Now links to questions with sequential ordering:
```sql
- timestamp (TIMESTAMPTZ)
- question_id (UUID) - Links to agent_questions ✨ NEW
- agent_name (TEXT)
- step_order (INT) - Sequential order (1, 2, 3...) ✨ NEW
- event_type (TEXT) - 'thought', 'action', 'error'
- content (JSONB)
```

## Migration

To update your existing database:

```bash
# Run the migration
psql $DATABASE_URL -f sql/04_migration_add_questions.sql
```

⚠️ **Warning**: This will drop and recreate `agent_events`, deleting existing data. Backup first if needed!

## Usage

The agent automatically tracks questions. When you run a query:

```typescript
const result = await runAgent("Why did sales drop last week?");
console.log(result.questionId); // UUID of the question
```

## Querying Question History

### 1. Get All Recent Questions
```sql
SELECT 
  id,
  question,
  agent_name,
  status,
  total_steps,
  duration_ms,
  started_at
FROM agent_questions
ORDER BY started_at DESC
LIMIT 10;
```

### 2. Get Full Investigation for a Question
```sql
-- Replace with actual question_id
SELECT 
  step_order,
  event_type,
  content->>'text' as thought_text,
  content->>'sql' as sql_query,
  content->>'reasoning' as reasoning,
  timestamp
FROM agent_events
WHERE question_id = 'YOUR-QUESTION-ID-HERE'
ORDER BY step_order ASC;
```

### 3. Get Question with All Events (Full Trace)
```sql
WITH question_summary AS (
  SELECT 
    id,
    question,
    agent_name,
    final_answer,
    total_steps,
    duration_ms,
    started_at,
    completed_at
  FROM agent_questions
  WHERE id = 'YOUR-QUESTION-ID-HERE'
)
SELECT 
  qs.*,
  ae.step_order,
  ae.event_type,
  ae.content,
  ae.timestamp
FROM question_summary qs
LEFT JOIN agent_events ae ON ae.question_id = qs.id
ORDER BY ae.step_order ASC;
```

### 4. Find Questions That Had Errors
```sql
SELECT DISTINCT
  q.id,
  q.question,
  q.agent_name,
  COUNT(ae.*) FILTER (WHERE ae.event_type = 'error') as error_count,
  q.started_at
FROM agent_questions q
LEFT JOIN agent_events ae ON ae.question_id = q.id
GROUP BY q.id, q.question, q.agent_name, q.started_at
HAVING COUNT(ae.*) FILTER (WHERE ae.event_type = 'error') > 0
ORDER BY error_count DESC, q.started_at DESC;
```

### 5. Agent Performance Over Time
```sql
SELECT 
  time_bucket('1 hour', started_at) as hour,
  COUNT(*) as questions_answered,
  AVG(duration_ms)::INT as avg_duration_ms,
  AVG(total_steps)::INT as avg_steps,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM agent_questions
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### 6. Most Complex Investigations
```sql
SELECT 
  question,
  total_steps,
  duration_ms,
  started_at,
  LEFT(final_answer, 100) as answer_preview
FROM agent_questions
WHERE status = 'completed'
ORDER BY total_steps DESC
LIMIT 10;
```

### 7. Trace a Specific Investigation (Human-Readable)
```sql
SELECT 
  ae.step_order as "#",
  ae.event_type as "Type",
  CASE 
    WHEN ae.event_type = 'thought' THEN ae.content->>'text'
    WHEN ae.event_type = 'action' THEN 'SQL: ' || LEFT(ae.content->>'sql', 50) || '...'
    WHEN ae.event_type = 'error' THEN 'ERROR: ' || (ae.content->>'error')
    ELSE ae.content::text
  END as "Details",
  TO_CHAR(ae.timestamp, 'HH24:MI:SS') as "Time"
FROM agent_events ae
WHERE ae.question_id = 'YOUR-QUESTION-ID-HERE'
ORDER BY ae.step_order ASC;
```

## Database Functions

The `db` client now includes these new methods:

### Create Question
```typescript
const questionId = await db.createQuestion('detective', 'Why did sales drop?');
```

### Store Event
```typescript
await db.storeEvent(
  questionId,      // UUID of question
  'detective',     // Agent name
  1,               // Step order
  'action',        // Event type
  { sql: '...' }   // Content
);
```

### Complete Question
```typescript
await db.completeQuestion(
  questionId,
  'Sales dropped due to...',  // Final answer
  5,                           // Total steps
  2500,                        // Duration in ms
  'completed'                  // Status
);
```

### Get Question Details
```typescript
const question = await db.getQuestion(questionId);
// Returns: question data + total_events + error_count
```

### Get All Events for a Question
```typescript
const events = await db.getQuestionEvents(questionId);
// Returns: All events in step_order
```

## Example Output

When you run the agent now, you'll see:

```
🤖 Agent: detective
📋 Task: Why did sales drop last week?
🔍 Question ID: 550e8400-e29b-41d4-a716-446655440000
──────────────────────────────────────────────────────

⚡ Action: query_database
   Reason: Get total sales for last week vs previous week
   SQL: SELECT ...

[STEP 1]
💭 I can see sales dropped by 30%. Let me investigate which products...

⚡ Action: query_database
   Reason: Find products with biggest drops
   SQL: SELECT ...

[STEP 2]
💭 Product X had the biggest drop. Let me check if it was out of stock...

──────────────────────────────────────────────────────
✅ Investigation Complete
Sales dropped because Product X went out of stock on Monday...
```

Then query the database:
```sql
-- Get the investigation
SELECT * FROM agent_questions 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Get all steps in order
SELECT step_order, event_type, content 
FROM agent_events 
WHERE question_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY step_order;
```

## Benefits

1. **Full Traceability** - Track every query the agent makes for each question
2. **Debugging** - See exactly what went wrong and when
3. **Performance Analysis** - Identify slow or inefficient investigations
4. **Audit Trail** - Know what data the agent accessed
5. **Learning** - Analyze successful vs failed investigations
6. **Time-Series Analytics** - Use TimescaleDB to analyze patterns over time

## TimescaleDB Features

Since `agent_events` is a hypertable, you get:
- **Automatic partitioning** by time
- **Fast time-range queries**
- **Compression** for old data
- **Continuous aggregates** for real-time dashboards
- **Data retention policies** to auto-delete old events

Example - Set up automatic data retention:
```sql
-- Keep only last 30 days of events
SELECT add_retention_policy('agent_events', INTERVAL '30 days');
```

## Next Steps

Consider adding:
- A dashboard to visualize question trends
- Alerts for failed investigations
- Automatic rerun of failed questions
- Cost tracking (OpenAI tokens used per question)
- User feedback on answer quality

