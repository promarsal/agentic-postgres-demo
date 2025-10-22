# Replicating the Agentic Postgres Blog Demo

This guide shows how to replicate the user feedback hybrid search demo from the [Agentic Postgres blog post](https://www.tigerdata.com/blog/postgres-for-agents).

## The Original Demo Query

```
> Using service qilk2gqjuz, analyze user feedback with hybrid search 
  (combining text search and semantic search). Group similar feedback 
  by theme and show counts for each theme, using an ascii bar chart. 
  First, look at the pg_textsearch (BM25) and pgvectorscale documentation 
  in the Tiger docs to get the proper syntax, and then use those extensions.
```

## What This Requires

### ✅ Available Now:
- `vector` extension - Basic vector storage
- `timescaledb` - Time-series features
- `pgai` - AI helper functions (needs configuration)

### 🔜 Coming Soon (Agentic Postgres):
- **`pg_textsearch`** - BM25-based full-text search (early access)
- **`pgvectorscale`** - Advanced DiskANN indexing for vectors
- **Tiger MCP Server** - Built-in prompts and doc search
- **Fluid Storage** - Instant forking capabilities

## Current Setup (What We Have)

We've created a **proof-of-concept** using standard Postgres features:

### 1. User Feedback Table
```sql
CREATE TABLE user_feedback (
    id SERIAL PRIMARY KEY,
    user_id INT,
    feedback_text TEXT,
    sentiment TEXT,
    embedding vector(1536),  -- OpenAI embeddings
    created_at TIMESTAMPTZ
);
```

### 2. Standard Indexes
```sql
-- Full-text search (standard Postgres)
CREATE INDEX idx_feedback_fts 
ON user_feedback USING gin(to_tsvector('english', feedback_text));

-- Vector search (HNSW index)
CREATE INDEX idx_feedback_embedding 
ON user_feedback USING hnsw (embedding vector_cosine_ops);
```

### 3. Sample Data
30+ realistic user feedback entries across themes:
- Performance Issues
- UI/UX
- Feature Requests
- Customer Support
- Pricing
- Bug Reports
- Integrations

## Upgrading to Full Agentic Postgres

Once `pg_textsearch` and `pgvectorscale` are available on your service:

### 1. Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_textsearch;
```

### 2. Upgrade Vector Index
```sql
-- Drop old HNSW index
DROP INDEX idx_feedback_embedding;

-- Create pgvectorscale DiskANN index
CREATE INDEX idx_feedback_embedding_diskann 
ON user_feedback 
USING diskann (embedding vector_cosine_ops);
```

### 3. Use BM25 for Text Search
```sql
-- Create BM25 index (pg_textsearch)
SELECT bm25.create_index(
    'user_feedback',
    'feedback_text',
    'idx_feedback_bm25'
);
```

### 4. Hybrid Search Query
```sql
WITH text_search AS (
    -- BM25 keyword search
    SELECT id, feedback_text,
           bm25_score(feedback_text, 'performance slow') as text_score
    FROM user_feedback
    WHERE feedback_text @@ to_tsquery('performance | slow')
),
semantic_search AS (
    -- Vector similarity search
    SELECT id, feedback_text,
           1 - (embedding <=> query_embedding) as semantic_score
    FROM user_feedback
    CROSS JOIN (SELECT embedding FROM ...) query
    ORDER BY embedding <=> query_embedding
    LIMIT 20
)
-- Combine scores (hybrid search)
SELECT 
    COALESCE(t.id, s.id) as id,
    COALESCE(t.feedback_text, s.feedback_text) as feedback,
    COALESCE(t.text_score, 0) * 0.5 + 
    COALESCE(s.semantic_score, 0) * 0.5 as combined_score
FROM text_search t
FULL OUTER JOIN semantic_search s ON t.id = s.id
ORDER BY combined_score DESC;
```

## Running the Demo Now

### Load Sample Data
```bash
npm run build
npm run setup  # Load schema
psql $DATABASE_URL -f sql/03_user_feedback.sql
```

### Ask the Agent
```bash
# Analyze themes (using what's available now)
npm run dev "Analyze user feedback and group by themes. Show counts for each theme."

# Sentiment analysis
npm run dev "Show feedback sentiment distribution by theme"

# Vector search (when embeddings are populated)
npm run dev "Find similar feedback to: 'app is too slow and crashes'"
```

## Full Demo (With Agentic Postgres)

Once extensions are available:

```bash
# The exact query from the blog
npm run dev "Analyze user feedback with hybrid search (combining text search and semantic search). Group similar feedback by theme and show counts for each theme, using an ascii bar chart. First, look at the pg_textsearch and pgvectorscale documentation in the Tiger docs to get the proper syntax, and then use those extensions."
```

## Checking Extension Availability

```sql
-- Check what's installed
SELECT * FROM pg_extension;

-- Check what's available
SELECT name, default_version, comment 
FROM pg_available_extensions 
WHERE name IN ('pg_textsearch', 'vectorscale', 'pgai');
```

## Next Steps

1. ✅ Sample data is ready
2. ⏳ Wait for `pg_textsearch` and `pgvectorscale` on service
3. ✅ Agent knows about hybrid search concepts
4. ⏳ Need to populate embeddings (using `ai.openai_embed()`)
5. ✅ Can demo themes and sentiment now

## Resources

- [Agentic Postgres Announcement](https://www.tigerdata.com/blog/postgres-for-agents)
- [pg_textsearch Docs](https://docs.tigerdata.com/use-timescale/latest/extensions/pg-textsearch/)
- [pgvectorscale Docs](https://docs.tigerdata.com/ai/latest/sql-interface-for-pgvector-and-timescale-vector/)
- [Tiger CLI Docs](https://docs.tigerdata.com/getting-started/latest/)

## Status

**Current**: Can demo theme analysis, sentiment, and basic vector search  
**Full Demo**: Available once `pg_textsearch` + `pgvectorscale` are enabled on service  

The infrastructure is ready - just waiting for the extensions! 🚀

