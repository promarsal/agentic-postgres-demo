# 🎯 TigerData Demo Story: The Online Store Mystery

This demo tells a story where one question leads to another, showcasing how different TigerData/Timescale technologies work together to solve real business problems.

## 📖 The Story

Your online store's flagship product (Premium Wireless Headphones) suddenly stopped selling. As a data detective, you'll investigate using SQL analytics, semantic search, and AI-powered insights to uncover what happened and what to do about it.

---

## 🎬 Demo Script

Run these questions in order to tell the complete story:

### Q1: SQL Analytics 📊
**Question:** "Sales dropped yesterday compared to last week - why?"

**Technologies Showcased:**
- ✅ **PostgreSQL** - Complex SQL queries with CASE statements
- ✅ **TimescaleDB** - Time-series comparisons (day-over-day, week-over-week)
- ✅ **SQL Analytics** - Product-level breakdown with GROUP BY

**What it finds:**
- Premium Wireless Headphones: $0 yesterday vs $2,099 last week (-$2,099 drop!)
- Smart Fitness Watch: Also dropped to $0
- Other products relatively stable

**Key Insight:** Two products completely stopped selling!

```bash
npm run dev "Sales dropped yesterday compared to last week - why?"
```

---

### Q2: Hybrid Search 🔍✨
**Question:** "What are customers saying about Premium Wireless Headphones?"

**Technologies Showcased:**
- ✅ **pgvector** - Semantic vector similarity search
- ✅ **PostgreSQL FTS** - Full-text search with ranking
- ✅ **Hybrid Search** - RRF (Reciprocal Rank Fusion) combining both
- ✅ **pgvectorscale** - DiskANN index for fast vector search

**What it finds:**
- 15 customer complaints found
- 14 matches from BOTH semantic AND keyword search
- 1 semantic-only match (found "flagship wireless headphones" = Premium Wireless Headphones)
- Quality issues: damaged out of box, defective units, poor materials

**Key Insight:** Widespread quality control failures causing customer dissatisfaction!

```bash
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

---

### Q3: Semantic Search 🧠
**Question:** "Are other products showing similar quality issues?"

**Technologies Showcased:**
- ✅ **pgvector** - Semantic similarity finds conceptually related issues
- ✅ **Vector embeddings** - Understands meaning, not just keywords
- ✅ **SQL + Vectors** - Combines vector search with structured data

**What it finds:**
- Smart Fitness Watch ALSO has quality issues (strap breaking)
- Semantic search found complaints without needing exact keywords
- Sales data confirms Smart Fitness Watch declining too

**Key Insight:** Quality control is a systemic issue affecting multiple products!

```bash
npm run dev "Are other products showing similar quality issues?"
```

---

### Q4: SQL Joins 🔗
**Question:** "Which customers bought Premium Wireless Headphones and left negative feedback?"

**Technologies Showcased:**
- ✅ **PostgreSQL JOINs** - Combining orders + feedback tables
- ✅ **Customer Risk Analysis** - Identifying at-risk customers
- ✅ **Sentiment Analysis** - Filtering by negative sentiment

**What it finds:**
- 27 customers bought Premium Wireless Headphones AND left negative feedback
- These are high-risk customers likely to churn
- Need immediate outreach for retention

**Key Insight:** Identified specific at-risk customers requiring immediate action!

```bash
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"
```

---

### Q5: Agent Memory 🧠💾
**Question:** "Based on what we've learned, what should I do immediately?"

**Technologies Showcased:**
- ✅ **Agent Memory** - Recalls insights from previous investigations
- ✅ **Vector Search on Insights** - Semantic search across learnings
- ✅ **Learning Across Sessions** - Builds on past findings
- ✅ **Synthesis** - Combines multiple findings into actionable recommendations

**What it finds:**
- Recalls: Sales dropped $12,958 → $1,729 (86% decline!)
- Recalls: Quality issues across Premium Wireless Headphones
- Synthesizes: 4 immediate action items with priorities

**Key Recommendations:**
1. Address quality issues - recall or QA measures
2. Contact 27 at-risk customers - refunds/replacements
3. Monitor sales trends daily
4. Review product listings and quality messaging

**Key Insight:** Agent learns and builds knowledge across investigations!

```bash
npm run dev "Based on what we've learned, what should I do immediately?"
```

---

### Q6: Meta-Analysis 🔬
**Question:** "Show me how you figured out the sales drop - what was your investigation process?"

**Technologies Showcased:**
- ✅ **TimescaleDB Hypertable** - Stores all agent events as time-series data
- ✅ **Self-Observability** - Agent queries its own investigation history
- ✅ **Process Mining** - Analyzes tools used, duration, success/failure
- ✅ **Meta-Learning** - Understands how it solves problems

**What it shows:**
- Investigation steps breakdown
- Tools used: query_database, hybrid_search, semantic_search, etc.
- Duration and performance metrics
- Success/error analysis

**Key Insight:** Full transparency into AI decision-making process!

```bash
npm run dev "Show me how you figured out the sales drop - what was your investigation process?"
```

---

## 🏆 Technologies Demonstrated

| Technology | What It Does | Questions Using It |
|-----------|-------------|-------------------|
| **PostgreSQL** | Unified database for everything | All |
| **TimescaleDB** | Time-series analysis, hypertables for events | Q1, Q6 |
| **pgvector** | Vector embeddings for semantic search | Q2, Q3, Q5 |
| **pgvectorscale** | DiskANN index for fast vector queries | Q2, Q3 |
| **PostgreSQL FTS** | Full-text search with ranking | Q2 |
| **Hybrid Search (RRF)** | Combines FTS + vectors for best results | Q2 |
| **SQL JOINs** | Complex relationships across tables | Q4 |
| **Agent Memory** | Learning across investigations | Q5 |
| **Self-Observability** | Agent analyzes its own process | Q6 |

---

## 💡 Key Differentiators

### 1. **ONE Database, Multiple Capabilities**
- No separate vector database needed
- No separate time-series database needed
- No separate full-text search service needed
- Everything in PostgreSQL with extensions!

### 2. **Hybrid Search = Better Results**
- RRF (Reciprocal Rank Fusion) combines FTS + vectors
- Finds both exact matches AND semantically similar content
- Example: Finds "flagship wireless headphones" when searching for "Premium Wireless Headphones"

### 3. **Agent Memory & Learning**
- Stores insights from investigations
- Recalls relevant past learnings
- Builds knowledge over time
- No external RAG pipeline needed!

### 4. **Full Observability**
- Every agent action stored in TimescaleDB hypertable
- Query your own investigation process
- Performance analysis and optimization
- Complete transparency into AI decisions

---

## 🚀 Running the Complete Demo

### Option 1: Run Each Question Individually
```bash
npm run dev "Sales dropped yesterday compared to last week - why?"
npm run dev "What are customers saying about Premium Wireless Headphones?"
npm run dev "Are other products showing similar quality issues?"
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"
npm run dev "Based on what we've learned, what should I do immediately?"
npm run dev "Show me how you figured out the sales drop - what was your investigation process?"
```

### Option 2: All-in-One Demo Script
```bash
./run-demo-story.sh
```

---

## 📊 Expected Results

After running all 6 questions, you'll have discovered:

1. **Root Cause**: Quality control failures in Premium Wireless Headphones
2. **Impact**: $2,099 daily revenue loss, 27 at-risk customers
3. **Spread**: Smart Fitness Watch also affected
4. **Evidence**: 15+ customer complaints with specific defect details
5. **Action Plan**: 4 immediate steps to address the crisis
6. **Process**: Complete visibility into how the agent investigated

---

## 🎓 Key Takeaways

### For Product Managers:
- See how TigerData unifies multiple database workloads
- Understand the power of hybrid search for customer feedback
- Appreciate agent memory for continuous improvement

### For Developers:
- One database connection, multiple capabilities
- No complex microservices architecture needed
- Simple SQL + vector operations in same queries

### For Data Scientists:
- Combine structured + unstructured data seamlessly
- Hybrid search outperforms pure vector or pure keyword search
- Agent observability enables debugging and optimization

---

## 🔧 Technical Details

### Database Schema:
- `orders` - Sales transactions (time-series)
- `products` - Product catalog
- `user_feedback` - Customer feedback with embeddings
- `agent_questions` - Investigation tracking
- `agent_events` - Hypertable for agent actions (TimescaleDB)
- `agent_memory` - Agent insights with vectors

### Key SQL Patterns:
```sql
-- Time-series comparison with CASE
SELECT product_name,
  SUM(CASE WHEN order_date = CURRENT_DATE-1 THEN amount ELSE 0 END) as yesterday,
  SUM(CASE WHEN order_date = CURRENT_DATE-8 THEN amount ELSE 0 END) as last_week
FROM orders
GROUP BY product_name;

-- Hybrid search with RRF
WITH semantic AS (...),
     fulltext AS (...)
SELECT *,
  (1.0/(semantic.rank+60) + 1.0/(fulltext.rank+60)) as rrf_score
FROM semantic FULL OUTER JOIN fulltext
ORDER BY rrf_score DESC;

-- Vector similarity
SELECT *,
  1 - (embedding <=> query_embedding) as similarity
FROM user_feedback
ORDER BY similarity DESC;
```

---

## 📝 Notes

- All embeddings are generated using OpenAI's text-embedding-3-small
- Hybrid search uses websearch_to_tsquery for natural language queries
- Agent events stored in TimescaleDB hypertable with time_bucket() support
- DiskANN index on vectors for sub-millisecond similarity search

---

**Built with TigerData Cloud - PostgreSQL + TimescaleDB + pgvector + pgvectorscale in ONE database! 🐯**

