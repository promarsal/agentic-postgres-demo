# 🎬 Demo Script

## Setup (5 minutes)

### 1. Show the Problem
```bash
# Traditional approach: Multiple services
docker ps
# Shows: Redis, Pinecone, Kafka, Postgres, etc.
# Cost: $500+/month
# Complexity: 7 services to manage
```

### 2. Show Our Approach
```bash
# Just Postgres (TigerData)
psql $DATABASE_URL -c "\dx"
# Shows: ai, vector, vectorscale, timescaledb
# Cost: $50/month
# Complexity: 1 service
```

## Demo 1: Revenue Investigation (2 minutes)

### Run the Agent
```bash
npm run dev "Why did revenue drop 30% yesterday?"
```

### What Happens:
1. Agent queries revenue by date
2. Identifies Product #42 had no sales
3. Checks inventory - finds it out of stock
4. Searches memory for similar cases
5. Provides root cause + recommendations

**Key Point:** Agent figured this out autonomously. You didn't write any queries.

## Demo 2: Show It's Really Postgres (1 minute)

### View Agent Events
```sql
SELECT 
  timestamp,
  event_type,
  content->>'text' as thought
FROM agent_events
WHERE agent_name = 'detective'
  AND timestamp > NOW() - INTERVAL '5 minutes'
ORDER BY timestamp;
```

Shows: Every thought, action, observation stored as time-series data.

### View Agent Memory
```sql
SELECT 
  content,
  metadata,
  created_at
FROM agent_memory
WHERE agent_name = 'detective'
ORDER BY created_at DESC
LIMIT 5;
```

Shows: Agent stored what it learned with vector embeddings.

### Query Memory Semantically
```sql
SELECT 
  content,
  1 - (embedding <=> ai.openai_embed('text-embedding-3-small', 'stock issues')::vector) as relevance
FROM agent_memory
WHERE agent_name = 'detective'
ORDER BY relevance DESC
LIMIT 3;
```

Shows: Semantic search finds relevant past investigations.

## Demo 3: Agent Learns (1 minute)

### Run Similar Query
```bash
npm run dev "Check if we have any stock issues"
```

### What Happens:
Agent immediately searches memory:
> "I remember investigating a similar issue before..."

Uses past experience to guide investigation.

**Key Point:** It's learning. In Postgres.

## Demo 4: Time-Travel Debugging (1 minute)

### What was the agent thinking at 2:42pm?
```sql
SELECT 
  event_type,
  content,
  timestamp
FROM agent_events
WHERE agent_name = 'detective'
  AND timestamp >= '2025-10-21 14:42:00'
  AND timestamp < '2025-10-21 14:42:30'
ORDER BY timestamp;
```

Shows: Can replay agent decisions at any point in time.

**Key Point:** Perfect auditability. No distributed logs to correlate.

## The Kicker (30 seconds)

### Show the Code
```typescript
// The entire agent system
const result = await generateText({
  model: openai('gpt-4'),
  tools: {
    query: { execute: async (sql) => await mcp.executeQuery(sql) }
  },
  prompt: task
});
```

**50 lines of code. One database. Full agent system.**

## Q&A Prompts

**Q: "But can it handle production scale?"**
A: It's Postgres. Millions of queries/day. ACID. Battle-tested since 1996.

**Q: "What about vector performance?"**
A: pgvectorscale - 28x faster than Pinecone on benchmarks. StreamingDiskANN index.

**Q: "Can I add custom tools?"**
A: Yes! Just add a function that queries the database. 5 lines of code.

**Q: "Does it work with my existing Postgres?"**
A: Yes, if you have the extensions. TigerData includes them all by default.

## The Pitch

**Before:** 7 services, $500/month, debugging nightmare  
**After:** 1 database, $50/month, SQL queries for everything

**"Stop over-engineering. Start with Postgres."**

## Follow-Up Ideas

1. **Live coding:** Build a new agent tool in 5 minutes
2. **Performance test:** Show query latency (sub-10ms)
3. **Cost comparison:** Detailed breakdown vs. alternatives
4. **Architecture dive:** How it actually works (if technical audience)
5. **Multi-agent:** Show two agents coordinating

## Closing

**Give them:**
- GitHub repo link
- TigerData free trial link
- "Star the repo if this was helpful"

**Call to action:**
- "Try it yourself in 5 minutes"
- "Fork it, build on it, make it yours"
- "Stop using 7 services when 1 will do"

