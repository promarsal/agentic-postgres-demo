# ⚡ Quick Start (5 minutes)

## What You Need

1. [TigerData account](https://console.tigerdata.cloud) (free)
2. [OpenAI API key](https://platform.openai.com/api-keys)
3. Node.js 18+

## Setup

```bash
# 1. Install
npm install

# 2. Configure (create .env file)
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "DATABASE_URL=postgresql://user:pass@host:port/db" >> .env

# 3. Setup database
npm run build && npm run setup

# 4. Generate embeddings
npm run populate-embeddings

# 5. Try it!
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

## Get Your DATABASE_URL

1. Go to [TigerData Console](https://console.tigerdata.cloud)
2. Click your service → "Connection Info"
3. Copy the connection string (includes password)

## 🧪 Test It! Run These 6 Questions

Copy and run each question to see the full demo:

### Q1: SQL Analytics (Sales Investigation)
```bash
npm run dev "Sales dropped yesterday compared to last week - why?"
```
**What it does**: SQL queries, finds sales drop, identifies Premium Wireless Headphones as culprit

---

### Q2: Hybrid Search (Vector + Full-Text) 🌟
```bash
npm run dev "What are customers saying about Premium Wireless Headphones?"
```
**What it does**: Combines keyword + semantic search, finds 15 complaints including "flagship wireless headphones" (semantic match!)

---

### Q3: Semantic Search (Pattern Recognition)
```bash
npm run dev "Are other products showing similar quality issues?"
```
**What it does**: Pure vector search discovers Smart Fitness Watch also has 8 complaints

---

### Q4: SQL Joins (Customer Risk)
```bash
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"
```
**What it does**: Joins orders + feedback, identifies 28 at-risk customers

---

### Q5: Agent Memory (RAG) 🧠
```bash
npm run dev "Based on what we've learned, what should I do immediately?"
```
**What it does**: Recalls insights from Q1, synthesizes recommendations

---

### Q6: Meta-Analysis (Observability)
```bash
npm run dev "Show me how you figured this out - what was your investigation process?"
```
**What it does**: Analyzes its own investigation steps from TimescaleDB

---

## ✅ What You'll See

Each question demonstrates different capabilities:
- ✅ PostgreSQL SQL queries
- ✅ Vector similarity search (pgvectorscale)
- ✅ Full-text search (PostgreSQL FTS)
- ✅ Hybrid search (RRF combining both)
- ✅ Agent memory (RAG)
- ✅ Time-series tracking (TimescaleDB)

**Key Moment**: Q2 finds "flagship wireless headphones" when searching for "Premium Wireless Headphones" - that's semantic search!

## 🎉 That's It!

See `README.md` for full docs or `DEMO_QUERIES.md` for presentation guide.

