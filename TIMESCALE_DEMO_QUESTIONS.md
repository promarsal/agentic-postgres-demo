# TimescaleDB Demo Questions

Questions that showcase TigerData's TimescaleDB features with `agent_events` hypertable.

## 🔥 TimescaleDB time_bucket() Function

These questions will trigger `time_bucket()` for time-series aggregation:

### Basic Time Bucketing:
- "Show me all agent actions grouped by 30-minute intervals using time_bucket"
- "Group agent events by 10-minute intervals"
- "Show agent activity by hour for the last 24 hours"
- "How many events occurred per 5-minute interval?"

### With Filters:
- "Show me agent errors grouped by hour"
- "Group agent thoughts by 15-minute intervals"
- "Show me database queries per minute"

## 🔥 TimescaleDB first() / last() Aggregates

These questions will trigger `first()` and `last()` functions:

### Basic first/last:
- "What was the agent's first and last action?"
- "Show me the first thought vs most recent thought"
- "Compare the first error to the most recent error"

### With Grouping:
- "Show the last event in each 1-hour time bucket"
- "What was the first and last event of each type?"
- "Get the most recent action in each 30-minute interval"

## 🔥 Combined TimescaleDB Queries

These questions combine multiple TimescaleDB features:

- "Analyze agent activity over time using TimescaleDB time_bucket to show patterns"
- "Show event counts per hour with the last event content for each hour"
- "Track agent performance metrics by 10-minute intervals"
- "Show first and last queries in each time bucket"

## 📊 Agent Observability Queries

These showcase agent self-analysis using its own event data:

### Performance Analysis:
- "How many queries did I execute in the last hour?"
- "What's my error rate over time?"
- "Show my query patterns by time of day"
- "Analyze my investigation efficiency"

### Debugging:
- "Show me all errors I encountered"
- "What queries failed and why?"
- "Track my thought process chronologically"
- "Show my retry attempts over time"

### Trends:
- "Am I getting faster at investigations?"
- "What types of events occur most frequently?"
- "Show my busiest time periods"
- "Compare my first investigation to my latest"

## 🎯 Example Queries Generated

When you ask these questions, the agent generates queries like:

```sql
-- Time bucketing with aggregates
SELECT 
  time_bucket('30 minutes', timestamp) as interval,
  COUNT(*) as event_count,
  last(content, timestamp) as last_event
FROM agent_events
GROUP BY interval
ORDER BY interval DESC;

-- First and last by type
SELECT 
  event_type,
  first(content, timestamp) as first_event,
  last(content, timestamp) as last_event
FROM agent_events
GROUP BY event_type;

-- Actions over time
SELECT 
  time_bucket('1 hour', timestamp) as hour,
  COUNT(*) as action_count
FROM agent_events
WHERE event_type = 'action'
GROUP BY hour
ORDER BY hour DESC;
```

## 💡 Demo Script

1. **Run an investigation** to populate data:
   ```bash
   npm run dev "Why did revenue drop yesterday?"
   ```

2. **Query the hypertable** with TimescaleDB functions:
   ```bash
   npm run dev "Show me all agent actions grouped by 30-minute intervals using time_bucket"
   ```

3. **Analyze patterns**:
   ```bash
   npm run dev "What was my first action vs my last action?"
   ```

## 🚀 Why This Showcases TigerData

- ✅ **Hypertables**: `agent_events` auto-partitioned by time
- ✅ **time_bucket()**: Time-series aggregation (not in standard PostgreSQL)
- ✅ **first()/last()**: Time-ordered aggregates (not in standard PostgreSQL)
- ✅ **Agent observability**: Agent tracks itself in the database
- ✅ **Unified platform**: Agent logic + agent data in ONE database

**No Redis for agent state. No external logging. Just PostgreSQL + TimescaleDB!**

