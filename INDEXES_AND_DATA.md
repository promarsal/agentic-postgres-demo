# 📊 Indexes & Seed Data Reference

## 🔍 Indexes Created by Setup

### 1. DiskANN Index (Vector Similarity)
**Index Name**: `idx_feedback_embedding_diskann`  
**Table**: `user_feedback`  
**Type**: pgvectorscale DiskANN

```sql
CREATE INDEX idx_feedback_embedding_diskann 
ON user_feedback USING diskann (embedding vector_cosine_ops);
```

**Purpose**: Fast approximate nearest neighbor (ANN) search on embeddings

**Features**:
- Graph-based algorithm (faster than HNSW for large datasets)
- Optimized for SSD storage
- Supports cosine similarity (`<=>` operator)
- Enables semantic search

**Used in**: `semantic_search_feedback()`, `hybrid_search()`, `search_insights()`

---

### 2. GIN Full-Text Search Index
**Index Name**: `idx_feedback_fulltext`  
**Table**: `user_feedback`  
**Type**: PostgreSQL GIN (Generalized Inverted Index)

```sql
CREATE INDEX idx_feedback_fulltext 
ON user_feedback USING GIN (to_tsvector('english', feedback_text));
```

**Purpose**: Fast keyword-based text search with relevance ranking

**Features**:
- Uses `to_tsvector()` for text preprocessing:
  - Stemming (runs, running, ran → run)
  - Stop word removal (the, a, an, etc.)
  - Tokenization
- `ts_rank()` provides TF-IDF-like relevance scoring
- Similar to BM25 ranking in Elasticsearch
- Supports phrase search, AND/OR/NOT operators

**Used in**: `fulltext_search()`, `hybrid_search()`

**Query Pattern**:
```sql
SELECT *, ts_rank(to_tsvector('english', feedback_text), to_tsquery('english', 'query')) as rank
FROM user_feedback
WHERE to_tsvector('english', feedback_text) @@ to_tsquery('english', 'query')
ORDER BY rank DESC;
```

---

### 3. TimescaleDB Hypertable Indexes
**Index Name**: Automatic time-series indexes  
**Table**: `agent_events`  
**Type**: TimescaleDB hypertable partitioning

```sql
SELECT create_hypertable('agent_events', 'timestamp', if_not_exists => TRUE);
```

**Purpose**: Efficient time-series data storage and querying

**Features**:
- Automatic partitioning by time (chunks)
- Optimized for time-range queries
- Compressed older data
- Fast aggregations

**Used in**: `analyzeAgentPerformance()`, question tracking

---

### 4. Standard B-tree Indexes

**On `agent_questions`**:
```sql
CREATE INDEX idx_agent_questions_started ON agent_questions (started_at DESC);
CREATE INDEX idx_agent_questions_agent ON agent_questions (agent_name, started_at DESC);
```

**On `agent_events`**:
```sql
CREATE INDEX idx_agent_events_question ON agent_events (question_id, step_order ASC);
CREATE INDEX idx_agent_events_agent_name ON agent_events (agent_name, timestamp DESC);
```

**On `agent_memory`**:
```sql
CREATE INDEX idx_agent_memory_agent_name ON agent_memory (agent_name, created_at DESC);
```

**On `orders`**:
```sql
CREATE INDEX idx_orders_date ON orders (order_date DESC);
```

**Purpose**: Fast lookups by date, ID, and foreign keys

---

## 📦 Seed Data Loaded by Setup

### Products (5 items)
```
1. Premium Wireless Headphones - $299.99 (The problem product)
2. Smart Fitness Watch - $249.99 (Emerging issues)
3. Bluetooth Speaker - $89.99
4. USB-C Cable - $19.99
5. Laptop Stand - $49.99
```

### Orders (71 total)
- **Time Range**: 14 days (past 2 weeks)
- **Pattern**: Declining sales for Premium Wireless Headphones
- **Peak**: 8+ orders/day (week 1)
- **Drop**: 1-2 orders/day (recent days)
- **Total Revenue**: ~$31K over 14 days

### User Feedback (88 entries)

**Breakdown by Product**:
- Premium Wireless Headphones: **27 complaints** (negative)
  - Quality issues: 10
  - Defective units: 8
  - Battery problems: 4
  - Connectivity issues: 3
  - Material quality: 2
- Smart Fitness Watch: **8 complaints** (emerging pattern)
- Other Products: **9 positive** reviews
- Unrelated: **44 other feedback** entries

**Sentiment Distribution**:
- Negative: 70 entries (~80%)
- Positive: 18 entries (~20%)

**Embedding Status**:
- After `npm run populate-embeddings`: 88/88 (100%)
- Vector dimensions: 1536 (OpenAI text-embedding-3-small)

---

## 🎯 Index Performance

### Vector Search (DiskANN)
- **Query Time**: ~50-100ms for 10 results
- **Accuracy**: 95%+ recall
- **Scalability**: Handles millions of vectors

### Full-Text Search (GIN)
- **Query Time**: ~20-50ms for typical queries
- **Index Size**: ~2x table size
- **Update Speed**: Fast (better than trigram indexes)

### Hybrid Search (RRF)
- **Query Time**: ~150-200ms (both searches + merge)
- **Result Quality**: Best comprehensive coverage
- **Trade-off**: Slightly slower but much more accurate

---

## 🔄 How Hybrid Search Works

```typescript
// 1. Vector Search
const vectorResults = await sql`
  SELECT id, 1 - (embedding <=> ${queryEmbedding}::vector) as similarity
  FROM user_feedback
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> ${queryEmbedding}::vector
  LIMIT 20
`;

// 2. Full-Text Search
const ftsResults = await sql`
  SELECT id, ts_rank(to_tsvector('english', feedback_text), to_tsquery('english', ${keywords})) as rank
  FROM user_feedback
  WHERE to_tsvector('english', feedback_text) @@ to_tsquery('english', ${keywords})
  ORDER BY rank DESC
  LIMIT 20
`;

// 3. Reciprocal Rank Fusion (RRF)
// Combine results: score = 1/(rank + k) where k=60
// Merge both result sets, sum scores, re-rank
```

**RRF Formula**: 
```
score(doc) = Σ (1 / (k + rank_in_method_i))
```
where k=60 is a constant to prevent division issues.

---

## 🎓 Learn More

**PostgreSQL FTS**:
- [PostgreSQL Text Search Docs](https://www.postgresql.org/docs/current/textsearch.html)
- Tutorial: `SELECT to_tsvector('english', 'The quick brown fox') @@ to_tsquery('english', 'fox')`

**pgvectorscale**:
- [GitHub: timescale/pgvectorscale](https://github.com/timescale/pgvectorscale)
- Paper: [DiskANN: Fast Accurate Billion-point Nearest Neighbor Search](https://arxiv.org/abs/1810.07355)

**Hybrid Search**:
- [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
- Blog: Why combine BM25 + vector search

**TimescaleDB**:
- [Hypertables Overview](https://docs.timescale.com/use-timescale/latest/hypertables/)
- [Compression](https://docs.timescale.com/use-timescale/latest/compression/)

