# Changelog: Question Tracking Enhancement

## Summary
Enhanced the agent observability system to track **questions as first-class entities**, with all agent events linked to their parent question in sequential order.

## Problem Solved
**Before**: Agent events were stored flat in `agent_events` with no way to:
- Group events by question
- Track the sequence of steps for a specific investigation
- Know which queries belonged to which question
- Measure investigation duration and complexity

**After**: Full question lifecycle tracking with:
- ✅ Each question gets a unique ID
- ✅ All events linked to question_id
- ✅ Sequential step ordering (1, 2, 3...)
- ✅ Question status, duration, and final answer tracked
- ✅ Easy to trace complete investigations

## Files Changed

### 1. Database Schema
**File**: `sql/01_schema.sql`
- ✅ Added `agent_questions` table (parent)
- ✅ Modified `agent_events` to include `question_id` and `step_order`
- ✅ Added indexes for efficient querying

**New Migration**: `sql/04_migration_add_questions.sql`
- One-time migration script to update existing databases

### 2. Database Client
**File**: `src/db.ts`
- ✅ Added `createQuestion()` - Create investigation record
- ✅ Updated `storeEvent()` - Now requires question_id and step_order
- ✅ Added `completeQuestion()` - Mark investigation complete/failed
- ✅ Added `getQuestion()` - Get question with summary stats
- ✅ Added `getQuestionEvents()` - Get all events for a question

### 3. Agent Implementation
**File**: `src/agent-autonomous.ts`
- ✅ Creates question record at start of investigation
- ✅ Tracks step count throughout execution
- ✅ Passes question_id to all event storage
- ✅ Marks question complete/failed at end with final answer
- ✅ Returns question_id in result

## New Capabilities

### 1. Track Question Lifecycle
```typescript
const result = await runAgent("Why did sales drop?");
// result now includes: questionId
```

### 2. Query Full Investigation
```sql
-- Get all steps for a specific question
SELECT step_order, event_type, content 
FROM agent_events
WHERE question_id = 'abc-123-...'
ORDER BY step_order;
```

### 3. Performance Analytics
```sql
-- Average investigation duration
SELECT AVG(duration_ms), AVG(total_steps) 
FROM agent_questions 
WHERE status = 'completed';
```

### 4. Error Analysis
```sql
-- Find investigations with errors
SELECT q.question, COUNT(*) as errors
FROM agent_questions q
JOIN agent_events e ON e.question_id = q.id
WHERE e.event_type = 'error'
GROUP BY q.question;
```

## Database Structure

```
agent_questions (Parent)
├── id (UUID)
├── question (TEXT)
├── agent_name (TEXT)
├── status (TEXT)
├── final_answer (TEXT)
├── total_steps (INT)
├── started_at (TIMESTAMPTZ)
├── completed_at (TIMESTAMPTZ)
└── duration_ms (INT)

agent_events (Children - TimescaleDB Hypertable)
├── timestamp (TIMESTAMPTZ)
├── question_id (UUID) → agent_questions.id ✨ NEW
├── agent_name (TEXT)
├── step_order (INT) ✨ NEW
├── event_type (TEXT)
└── content (JSONB)
```

## Example Usage

### Before
```sql
-- Hard to trace which events belonged together
SELECT * FROM agent_events 
WHERE agent_name = 'detective' 
ORDER BY timestamp;
```

### After
```sql
-- Complete investigation trace
SELECT 
  q.question,
  q.duration_ms,
  q.final_answer,
  e.step_order,
  e.event_type,
  e.content
FROM agent_questions q
JOIN agent_events e ON e.question_id = q.id
WHERE q.id = 'specific-question-id'
ORDER BY e.step_order;
```

## Migration Steps

1. **Review the changes**:
   ```bash
   cat sql/04_migration_add_questions.sql
   ```

2. **Backup existing data** (optional):
   ```sql
   CREATE TABLE agent_events_backup AS SELECT * FROM agent_events;
   ```

3. **Run migration**:
   ```bash
   psql $DATABASE_URL -f sql/04_migration_add_questions.sql
   ```

4. **Rebuild and test**:
   ```bash
   npm run build
   npm run dev
   ```

## Backward Compatibility

⚠️ **Breaking Change**: The `storeEvent()` function signature changed:

**Old**:
```typescript
storeEvent(agentName: string, eventType: string, content: any)
```

**New**:
```typescript
storeEvent(questionId: string, agentName: string, stepOrder: number, eventType: string, content: any)
```

If you have custom code calling `storeEvent`, you'll need to update it.

## Benefits

1. **🔍 Full Traceability** - Follow agent's complete reasoning path
2. **📊 Better Analytics** - Measure investigation complexity and performance
3. **🐛 Easier Debugging** - See exactly what the agent did for each question
4. **📝 Audit Trail** - Complete history of questions and answers
5. **⏱️ Time-Series Analysis** - Leverage TimescaleDB for trend analysis
6. **🎯 Targeted Optimization** - Identify slow or problematic investigations

## Documentation

- **Full Guide**: See `QUESTION_TRACKING_GUIDE.md`
- **Schema**: See `sql/01_schema.sql`
- **Migration**: See `sql/04_migration_add_questions.sql`

## Future Enhancements

Consider adding:
- [ ] Cost tracking per question (OpenAI tokens)
- [ ] User feedback ratings
- [ ] Automatic retry of failed questions
- [ ] Question similarity detection
- [ ] Investigation templates/patterns
- [ ] Real-time dashboards

