# 🎯 Quick Demo Queries Reference

Copy-paste these queries during your demo. Each showcases different capabilities.

---

## 📋 The 6-Question Journey

### **Q1: SQL Analytics + Time-Series** ⏱️
**Feature**: PostgreSQL queries, date filtering, aggregations

```bash
npm run dev "Sales dropped yesterday compared to last week - why?"
```

**Showcases**: Basic SQL, GROUP BY, date comparisons, product analysis

---

### **Q2: Hybrid Search (FTS + Vector)** 🔍
**Feature**: pgvectorscale DiskANN, PostgreSQL FTS, Reciprocal Rank Fusion

```bash
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

**Showcases**: 
- Vector similarity search with DiskANN index
- PostgreSQL full-text search
- Hybrid RRF combining both
- Finds semantic matches ("flagship audio device" = "Premium Wireless Headphones")

**💡 Key Point**: "Notice it finds complaints that don't use the exact product name!"

---

### **Q3: Semantic Search** 🧠
**Feature**: Pure vector similarity, concept matching

```bash
npm run dev "Are other products showing similar quality issues?"
```

**Showcases**:
- Vector embeddings for semantic understanding
- Cross-product analysis
- Pattern recognition

**💡 Key Point**: "It's finding CONCEPTS, not keywords - detects emerging patterns"

---

### **Q4: SQL Joins + Customer Analysis** 👥
**Feature**: Complex queries, table joins

```bash
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"
```

**Showcases**:
- JOIN operations
- Customer segmentation
- Risk analysis

**💡 Key Point**: "Structured + unstructured data in one query!"

---

### **Q5: Agent Memory + Learning** 🎓
**Feature**: RAG with agent_memory, cross-session learning

```bash
npm run dev "Based on what we've learned, what should I do immediately?"
```

**Showcases**:
- Agent recalls previous insights
- Semantic search on stored knowledge
- Synthesizes recommendations
- Learning across investigations

**💡 Key Point**: "The agent remembered everything from earlier questions!"

---

### **Q6: Meta-Analysis + Observability** 📊
**Feature**: TimescaleDB hypertables, self-reflection

```bash
npm run dev "Show me how you figured this out - what was your investigation process?"
```

**Showcases**:
- TimescaleDB for time-series events
- Question tracking with step order
- Performance metrics
- Full audit trail

**💡 Key Point**: "Complete observability - the agent explains its own reasoning!"

---

## 🎯 Alternative/Bonus Questions

### **Sales Trend Analysis**
```bash
npm run dev "Show me the daily sales trend for Premium Wireless Headphones over the last 2 weeks"
```

### **Sentiment Comparison**
```bash
npm run dev "Compare customer sentiment across all our products"
```

### **Root Cause Analysis**
```bash
npm run dev "Why are customers complaining about Premium Wireless Headphones?"
```

### **Predictive Question**
```bash
npm run dev "What will happen to our revenue if we don't fix the headphones issue?"
```

### **Emerging Issues**
```bash
npm run dev "Are there any other products we should be worried about?"
```

### **Specific Customer**
```bash
npm run dev "What issues did customer 1015 report?"
```

---

## 🎤 One-Liner for Each Feature

| Query | Feature | One-Liner |
|-------|---------|-----------|
| Q1 | SQL | "Traditional analytics - sales drops detected" |
| Q2 | Hybrid Search | "FTS + Vector = Comprehensive search, no Pinecone needed" |
| Q3 | Semantic | "Finding concepts, not keywords - pure vector magic" |
| Q4 | Joins | "Structured meets unstructured - one database" |
| Q5 | Memory | "Agent learns and remembers - RAG without separate vector DB" |
| Q6 | Observability | "TimescaleDB tracks everything - full audit trail" |

---

## 🚀 Demo Flow Cheat Sheet

1. **Start**: "Let me show you something cool..."
2. **Q1**: Run → Point out SQL queries in output
3. **Q2**: Run → Highlight semantic matches → "See these don't match exactly!"
4. **Q3**: Run → "Now it's predicting issues..."
5. **Q4**: Run → "Customer risk analysis in real-time"
6. **Q5**: Run → "Watch it remember everything from before"
7. **Q6**: Run → "And it can explain how it thought through the problem"
8. **Close**: "One database. Seven capabilities. Questions?"

---

## 📊 Feature Matrix

| Database Capability | Technology | What It Replaces | Query |
|-------------------|-----------|------------------|-------|
| Structured Data | PostgreSQL | MySQL, traditional DBs | Q1, Q4 |
| Vector Search | pgvectorscale | Pinecone, Weaviate | Q2, Q3 |
| Full-Text Search | PostgreSQL FTS | Elasticsearch | Q2 |
| Hybrid Search | RRF | Multiple services | Q2 |
| Time-Series | TimescaleDB | InfluxDB, Prometheus | Q6 |
| Agent Memory | pgvector + tables | Vector DB for RAG | Q5 |
| Observability | Hypertables | APM tools | Q6 |

---

## 💡 Key Demo Moments

### Moment 1: After Q2 Hybrid Search
**Show**: The results that matched semantically but not literally
**Say**: "See 'flagship audio device' and 'expensive headphones'? Those are semantic matches. Pinecone costs $70/mo for this. We're doing it in PostgreSQL."

### Moment 2: After Q5 Memory
**Show**: How agent recalled previous insights
**Say**: "It remembered! This is RAG - Retrieval Augmented Generation - usually needs a separate vector database. We're doing it all in Postgres."

### Moment 3: After Q6 Meta-Analysis
**Show**: The step-by-step investigation breakdown
**Say**: "Full observability. Every thought, every action, stored in TimescaleDB hypertables. No DataDog needed."

---

## 🎯 Timing (Total: 10-15 min)

- **Intro**: 1 min - "What if one DB could replace 5 services?"
- **Q1**: 1 min - SQL basics
- **Q2**: 2 min - Hybrid search (slow down here!)
- **Q3**: 1 min - Semantic magic
- **Q4**: 1 min - Customer analysis
- **Q5**: 2 min - Memory reveal (another wow moment!)
- **Q6**: 2 min - Meta-analysis
- **Wrap**: 1 min - Value prop
- **Q&A**: 5 min

---

## 🔥 Audience Reactions to Expect

- Q2: "Wait, it found THAT? How?"
- Q3: "So it's predicting issues now?"
- Q5: "It remembered from earlier?!"
- Q6: "The agent can analyze itself?"

---

Ready to run the demo? Start with Q1! 🚀

