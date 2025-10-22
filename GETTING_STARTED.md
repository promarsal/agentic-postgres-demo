# 🚀 Getting Started

## For Someone Cloning This Repo

### What You Need

1. **TigerData Account** (free tier available)
   - Sign up: https://console.tigerdata.cloud
   - Create a new service (TimescaleDB)
   - Get your connection string from "Connection Info"

2. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - You'll use this for the agent and embeddings

3. **Node.js 18+**
   - Check: `node --version`

---

## Setup (takes ~5 minutes)

### Step 1: Clone and install
```bash
git clone <your-repo-url>
cd agentic-postgres-demo
npm install
```

### Step 2: Configure environment
Create `.env` file in project root:
```
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://tsdbadmin:PASSWORD@xxx.tsdb.cloud.timescale.com:34416/tsdb?sslmode=require
```

**Important:**
- Replace `sk-proj-...` with your actual OpenAI API key
- Replace `PASSWORD` and `xxx` with your TigerData connection details
- Get DATABASE_URL from TigerData Console → Your Service → "Connection Info"

### Step 3: Setup database
```bash
npm run build
npm run setup
```

This will:
- **Enable Extensions**: TimescaleDB, pgvector, pgvectorscale
- **Create Tables**: 6 tables (agent_questions, agent_events, agent_memory, products, orders, user_feedback)
- **Create Indexes**:
  - **DiskANN** (pgvectorscale): Fast vector similarity search (graph-based ANN)
  - **GIN/FTS** (PostgreSQL): Full-text search with TF-IDF ranking (BM25-like)
  - **TimescaleDB**: Time-series hypertable on agent_events
  - **Standard**: B-tree indexes on dates, IDs, foreign keys
- **Load Seed Data**:
  - 5 products (Premium Wireless Headphones, Smart Fitness Watch, etc.)
  - 71 orders (14-day history with declining sales pattern)
  - 88 feedback entries (27 complaints about Product X, 8 about Product Y)

### Step 4: Generate embeddings
```bash
npm run populate-embeddings
```

This generates vector embeddings for semantic search (~30 seconds).

**For production:** Enable pgai extension in TigerData Console and configure OpenAI API key there. Then embeddings generate automatically in the database!

### Step 5: Test it!
```bash
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

You should see the agent investigate using hybrid search (vector + full-text)!

---

## 🧪 Try The Full Demo (6 Questions)

### Q1: SQL Analytics - Sales Investigation
```bash
npm run dev "Sales dropped yesterday compared to last week - why?"
```
✅ **Shows**: SQL queries, date filtering, finds sales drop pattern  
⏱️ **Takes**: ~20-30 seconds

### Q2: Hybrid Search - Customer Feedback 🌟
```bash
npm run dev "What are customers saying about Premium Wireless Headphones?"
```
✅ **Shows**: Vector + FTS combined, finds 15 complaints  
🎯 **Key**: Finds "flagship wireless headphones" (semantic match!)  
⏱️ **Takes**: ~15 seconds

### Q3: Semantic Search - Pattern Discovery
```bash
npm run dev "Are other products showing similar quality issues?"
```
✅ **Shows**: Pure vector similarity, discovers Smart Fitness Watch issues  
⏱️ **Takes**: ~15 seconds

### Q4: SQL Joins - Customer Risk Analysis
```bash
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"
```
✅ **Shows**: JOIN operations, identifies 28 at-risk customers  
⏱️ **Takes**: ~20 seconds

### Q5: Agent Memory - RAG in Action 🧠
```bash
npm run dev "Based on what we've learned, what should I do immediately?"
```
✅ **Shows**: Recalls insights from Q1, synthesizes recommendations  
🎯 **Key**: Agent remembered what it learned earlier!  
⏱️ **Takes**: ~15 seconds

### Q6: Meta-Analysis - Observability
```bash
npm run dev "Show me how you figured this out - what was your investigation process?"
```
✅ **Shows**: TimescaleDB queries, self-reflection  
⏱️ **Takes**: ~10 seconds

---

### 📊 What You Just Saw

Each question demonstrated a different capability:

| Question | Feature | Database Tech |
|----------|---------|---------------|
| Q1 | SQL Analytics | PostgreSQL |
| Q2 | Hybrid Search | pgvectorscale + PostgreSQL FTS |
| Q3 | Semantic Search | pgvectorscale (DiskANN) |
| Q4 | SQL Joins | PostgreSQL |
| Q5 | Agent Memory (RAG) | pgvector + semantic search |
| Q6 | Observability | TimescaleDB hypertables |

**Total time**: ~2 minutes to run all 6 questions  
**Database**: Just PostgreSQL with extensions!

---

## What Extensions Need Configuration?

### ✅ Auto-configured (no action needed):
- **TimescaleDB** - Enabled automatically
- **pgvector** - Enabled automatically
- **pgvectorscale** - Enabled automatically

### ⚙️ Optional (production only):
- **pgai** - Requires OpenAI API key in TigerData Console
  - Go to: Console → Your Service → Extensions → pgai
  - Add your OpenAI API key
  - Now embeddings generate automatically in SQL!
  
  ```sql
  UPDATE user_feedback 
  SET embedding = ai.openai_embed('text-embedding-3-small', feedback_text)
  WHERE embedding IS NULL;
  ```

---

## Common Issues

### ❌ "OPENAI_API_KEY not set"
**Fix:** Make sure `.env` file exists with `OPENAI_API_KEY=sk-...`

### ❌ "DATABASE_URL not set"
**Fix:** Add `DATABASE_URL` to `.env` (get from TigerData Console)

### ❌ "relation 'products' does not exist"
**Fix:** Run `npm run setup` to create tables

### ❌ "embedding column is null"
**Fix:** Run `npm run populate-embeddings`

### ❌ "Query failed: syntax error"
**Fix:** Make sure you ran `npm run build` after cloning

---

## Project Structure

```
agentic-postgres-demo/
├── src/
│   ├── agent-autonomous.ts  # Main agent logic (AI SDK + tools)
│   ├── db.ts                # Database functions
│   ├── cli.ts               # CLI interface
│   ├── setup.ts             # Setup script
│   └── populate-embeddings.ts
├── sql/
│   ├── 01_schema.sql        # All tables, indexes, extensions
│   ├── 02_seed_data.sql     # Products and orders
│   └── 03_user_feedback.sql # User feedback with variations
├── .env                     # Your config (create this!)
├── package.json
└── README.md                # Full documentation
```

---

## What Each Script Does

| Script | What It Does |
|--------|-------------|
| `npm run setup` | Creates tables, loads demo data |
| `npm run populate-embeddings` | Generates vectors for semantic search |
| `npm run dev "query"` | Runs the agent with your question |
| `npm run reset-data` | Drops all tables (clean slate) |
| `npm run build` | Compiles TypeScript |

---

## Next Steps

- **Read README.md** - Full documentation
- **Read DEMO_SCRIPT.md** - Presentation guide with talking points
- **Read DEMO_QUERIES.md** - Quick reference for demo queries
- **Read FULL_DEMO_RUN_RESULTS.md** - Complete test results

---

## Questions?

Check the troubleshooting section in README.md or review the demo documentation files.

**Key Features Demonstrated:**
- ✅ Vector search (pgvectorscale DiskANN)
- ✅ Full-text search (PostgreSQL FTS)
- ✅ Hybrid search (RRF combining both)
- ✅ Time-series (TimescaleDB hypertables)
- ✅ Agent memory (RAG with pgvector)
- ✅ SQL analytics (PostgreSQL)
- ✅ Observability (question tracking)

**One database. Seven capabilities. Zero external services.** 🚀

