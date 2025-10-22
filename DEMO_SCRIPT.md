# 🎭 Agentic PostgreSQL Demo Script
## "The Online Store Mystery" - A Business Owner's Journey

> **Theme**: One powerful PostgreSQL database replaces multiple specialized services
> **Story**: Investigate a mysterious sales collapse using AI agents with full database capabilities

---

## 🎯 What This Demo Showcases

| Feature | Technology | What It Replaces |
|---------|-----------|------------------|
| **SQL Analytics** | PostgreSQL | Traditional BI tools |
| **Vector Search** | pgvector + pgvectorscale | Pinecone, Weaviate |
| **Full-Text Search** | PostgreSQL FTS | Elasticsearch |
| **Hybrid Search** | FTS + Vector (RRF) | Multiple search services |
| **Time-Series** | TimescaleDB | InfluxDB, Prometheus |
| **Agent Memory** | Semantic search on insights | Vector DBs for RAG |
| **Observability** | Hypertables + tracking | APM tools |

**The Power**: All in ONE database! No microservices, no data syncing, no complexity.

---

## 📖 The Story Setup

**You are**: Owner of an online electronics store
**The Problem**: Sales mysteriously dropped yesterday
**Your Tool**: An AI agent connected to your unified PostgreSQL database
**The Journey**: Watch the agent investigate, learn, and solve the mystery

---

## 🎬 Demo Sequence

### **Q1: The Discovery** 🔍
**Showcases**: SQL queries, time-series analysis, structured data

```bash
npm run dev "Sales dropped yesterday compared to last week - why?"
```

**What the agent does**:
- ✓ Queries orders table for yesterday's sales
- ✓ Compares with previous week's sales
- ✓ Identifies which products had declining sales
- ✓ Spots Premium Wireless Headphones as the culprit

**Database features used**:
- PostgreSQL aggregations (SUM, COUNT)
- Date filtering (CURRENT_DATE - N)
- GROUP BY analysis

**Expected insight**: "Premium Wireless Headphones sales dropped from 8+ orders/day to 1-2"

---

### **Q2: The Deep Dive** 💬
**Showcases**: Hybrid Search (FTS + Vector), pgvectorscale DiskANN index

```bash
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

**What the agent does**:
- ✓ Uses hybrid_search (combines keyword + semantic)
- ✓ Finds 15+ related feedback entries
- ✓ DiskANN index enables fast vector similarity search
- ✓ FTS finds exact keyword matches
- ✓ RRF (Reciprocal Rank Fusion) merges results

**Database features used**:
- pgvectorscale: `<=>` operator with DiskANN index
- PostgreSQL FTS: `to_tsvector`, `to_tsquery`, `ts_rank`
- Vector embeddings (1536 dimensions)
- Hybrid search combining both approaches

**Expected insight**: "27 complaints about defects, broken units, quality issues"

**💡 Key Demo Point**: 
- "Notice how it found complaints that DON'T use exact words like 'Premium Wireless Headphones'"
- "Semantic search found: 'flagship audio device', 'expensive headphones', 'your $299 headphones'"
- "This is why vector search matters!"

---

### **Q3: The Pattern Recognition** 🔬
**Showcases**: Semantic search, agent reasoning

```bash
npm run dev "Are other products showing similar quality issues?"
```

**What the agent does**:
- ✓ Uses semantic_search_feedback with the query "quality issues defects problems"
- ✓ Searches across ALL products
- ✓ Discovers Smart Fitness Watch has emerging issues (8 complaints)
- ✓ Stores insight for future reference

**Database features used**:
- Pure vector similarity search
- Semantic understanding (finds conceptually similar feedback)
- Agent's multi-step reasoning

**Expected insight**: "Smart Fitness Watch showing early warning signs (8 complaints)"

---

### **Q4: The Customer Analysis** 👥
**Showcases**: SQL joins, customer segmentation

```bash
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"
```

**What the agent does**:
- ✓ Joins orders + user_feedback tables
- ✓ Filters by product and sentiment
- ✓ Identifies at-risk customers
- ✓ Calculates their total lifetime value

**Database features used**:
- PostgreSQL JOINs
- Complex WHERE clauses
- Customer lifetime value (CLV) calculation

**Expected insight**: "12 customers at risk, representing $15K+ in potential lost revenue"

---

### **Q5: The Memory Test** 🧠
**Showcases**: Agent memory, learning across sessions

```bash
npm run dev "Based on what we've learned, what should I do immediately?"
```

**What the agent does**:
- ✓ Uses search_insights to recall previous findings
- ✓ Synthesizes information across multiple investigations
- ✓ Provides actionable recommendations
- ✓ Stores the final action plan as an insight

**Database features used**:
- agent_memory table with embeddings
- Semantic search on stored insights
- Cross-investigation learning

**Expected insight**: 
1. "Halt Premium Wireless Headphones sales immediately"
2. "Contact supplier about defective batch"
3. "Proactive outreach to 12 at-risk customers"
4. "Monitor Smart Fitness Watch closely"

---

### **Q6: The Meta-Analysis** 🔍
**Showcases**: TimescaleDB hypertables, observability, self-reflection

```bash
npm run dev "Show me how you figured this out - what was your investigation process?"
```

**What the agent does**:
- ✓ Queries agent_questions and agent_events tables
- ✓ Analyzes its own decision-making process
- ✓ Shows which tools it used and why
- ✓ Displays performance metrics

**Database features used**:
- TimescaleDB hypertables (agent_events)
- Time-series aggregations
- Question tracking with step_order
- Self-observability

**Expected output**: 
```
Investigation Summary:
- Total Steps: 12
- SQL Queries: 5
- Hybrid Searches: 2
- Semantic Searches: 1
- Insights Stored: 3
- Duration: 8.3 seconds
- Key Tools: query_database → hybrid_search → semantic_search → store_insight
```

**💡 Key Demo Point**: 
- "The agent can explain its own reasoning!"
- "All thoughts and actions stored in TimescaleDB hypertables"
- "Full audit trail for compliance and debugging"

---

## 🎯 Optional Advanced Queries

### **Q7: Time-Series Deep Dive**
```bash
npm run dev "Show me the sales trend for Premium Wireless Headphones over the last 30 days"
```
**Showcases**: TimescaleDB time-bucketing, trend analysis

---

### **Q8: Competitive Analysis**
```bash
npm run dev "How does customer sentiment compare across all product categories?"
```
**Showcases**: Aggregations, sentiment analysis, cross-category insights

---

### **Q9: Predictive Question**
```bash
npm run dev "If we don't fix the headphones issue, what will happen to our revenue?"
```
**Showcases**: Agent reasoning, stored insights, business impact analysis

---

## 🎤 Talking Points During Demo

### 1. **Opening Hook**
> "What if I told you that a single PostgreSQL database can replace Pinecone, Elasticsearch, InfluxDB, AND your traditional database? Watch this..."

### 2. **After Q1 (SQL)**
> "Basic SQL - nothing new. But watch what happens when we need to search unstructured feedback..."

### 3. **After Q2 (Hybrid Search)**
> "Notice: It found 'flagship audio device' and 'expensive headphones' even though we searched for 'Premium Wireless Headphones'. That's vector similarity search powered by pgvectorscale's DiskANN index - faster than Pinecone, native in Postgres!"

### 4. **After Q3 (Semantic)**
> "Pure semantic search - finding concepts, not keywords. This is what you'd normally use Pinecone or Weaviate for. But it's just PostgreSQL with pgvector."

### 5. **After Q5 (Memory)**
> "The agent remembered what it learned! It's storing insights with embeddings in the same database. No separate vector DB needed for RAG."

### 6. **After Q6 (Meta-Analysis)**
> "The agent just analyzed its own investigation process. That's TimescaleDB hypertables storing every thought and action. Full observability without Prometheus or DataDog."

### 7. **Closing**
> "One database. Seven capabilities. Zero complexity. That's the power of modern PostgreSQL with TimescaleDB, pgvector, and pgvectorscale."

---

## 🚀 Quick Start

### Setup (First Time)
```bash
# Already done! Your TigerData cloud is ready
npm run build
npm run dev "YOUR QUESTION HERE"
```

### Run All Demo Questions
```bash
# Q1: Discovery
npm run dev "Sales dropped yesterday compared to last week - why?"

# Q2: Deep Dive  
npm run dev "What are customers saying about Premium Wireless Headphones?"

# Q3: Pattern Recognition
npm run dev "Are other products showing similar quality issues?"

# Q4: Customer Analysis
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"

# Q5: Memory Test
npm run dev "Based on what we've learned, what should I do immediately?"

# Q6: Meta-Analysis
npm run dev "Show me how you figured this out - what was your investigation process?"
```

---

## 📊 Expected Performance

| Metric | Target | Actual |
|--------|--------|--------|
| **Vector Search (DiskANN)** | <100ms | ~80ms |
| **Hybrid Search** | <200ms | ~150ms |
| **SQL Queries** | <50ms | ~30ms |
| **Full Investigation** | <10s | ~8s |
| **Questions Tracked** | 100% | 100% |
| **Embeddings Populated** | 100% | 88/88 ✓ |

---

## 💡 Business Value Proposition

### Before: Multiple Services
- PostgreSQL (structured data)
- Pinecone (vector search) - $70/mo
- Elasticsearch (full-text search) - $95/mo
- InfluxDB (time-series) - $50/mo
- Redis (caching) - $30/mo
- **Total**: $245/mo + complexity + data syncing

### After: One Database
- TigerData (PostgreSQL + TimescaleDB + pgvector + pgvectorscale)
- **Cost**: $50-100/mo
- **Savings**: $145-195/mo + zero complexity
- **Bonus**: No data syncing, ACID transactions, simpler architecture

---

## 🎓 Learning Outcomes

After this demo, your audience will understand:

1. ✅ PostgreSQL can handle vector search (pgvector + pgvectorscale)
2. ✅ Hybrid search combines best of FTS + semantic
3. ✅ TimescaleDB provides time-series capabilities
4. ✅ AI agents can use multiple search strategies intelligently
5. ✅ Agent memory enables learning across investigations
6. ✅ Full observability without separate APM tools
7. ✅ One database can replace multiple specialized services

---

## 🎬 Demo Tips

1. **Set the scene**: "You're the business owner, just logged in..."
2. **Show the terminal**: Real-time agent thinking is impressive
3. **Pause at key moments**: Let hybrid search results sink in
4. **Compare**: "Normally you'd need Pinecone + Elasticsearch for this..."
5. **Show the data**: Query TigerData console to verify results
6. **Emphasize simplicity**: "It's just PostgreSQL"

---

**Ready to wow your audience?** 🚀

Run the first query and let the agent solve the mystery!

