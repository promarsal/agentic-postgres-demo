# 🤖 Agentic PostgreSQL Demo

**One database. Seven capabilities. Zero complexity.**

AI agents that investigate, learn, and remember - powered by PostgreSQL + TimescaleDB + pgvector + pgvectorscale.

## 🎯 What This Demo Shows

A single PostgreSQL database can replace:
- ❌ Pinecone (vector search) → ✅ pgvectorscale
- ❌ Elasticsearch (full-text) → ✅ PostgreSQL FTS
- ❌ InfluxDB (time-series) → ✅ TimescaleDB
- ❌ Redis (caching) → ✅ PostgreSQL
- ❌ Separate vector DB for RAG → ✅ pgvector

**The agent can:**
- Execute SQL queries
- Search feedback semantically (vector similarity)
- Search with keywords (full-text search)
- Combine both (hybrid search with RRF)
- Store and recall insights (agent memory)
- Track every decision (observability)

## ⚡ Quick Start

### Prerequisites
- [OpenAI API key](https://platform.openai.com/api-keys)
- Node.js 18+

### Get Started in 3 Commands

Install and start building with Agentic Postgres:

```bash
# Install Tiger CLI
curl -fsSL https://cli.tigerdata.com | sh

# Authenticate
tiger auth login

# Install MCP (connects TigerData to your environment)
tiger mcp install
```

### Setup the Demo

```bash
# Clone and install
git clone https://github.com/promarsal/agentic-postgres-demo.git
cd agentic-postgres-demo
npm install

# Configure
echo "OPENAI_API_KEY=sk-..." > .env
echo "DATABASE_URL=postgresql://..." >> .env  # Get from: tiger mcp install output

# Setup database
npm run build && npm run setup
npm run populate-embeddings

# Try it!
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

**👉 See [`QUICKSTART.md`](QUICKSTART.md) for detailed 5-minute setup guide.**

---

## 🧪 Test the Demo (Run These 6 Questions)

After setup, run these questions to see all features in action:

```bash
# Q1: SQL Analytics
npm run dev "Sales dropped yesterday compared to last week - why?"

# Q2: Hybrid Search 🌟 (finds "flagship wireless headphones" = semantic match!)
npm run dev "What are customers saying about Premium Wireless Headphones?"

# Q3: Semantic Search (discovers emerging issues)
npm run dev "Are other products showing similar quality issues?"

# Q4: SQL Joins (customer risk analysis)
npm run dev "Which customers bought Premium Wireless Headphones and left negative feedback?"

# Q5: Agent Memory 🧠 (recalls insights from Q1)
npm run dev "Based on what we've learned, what should I do immediately?"

# Q6: Meta-Analysis (self-reflection)
npm run dev "Show me how you figured this out - what was your investigation process?"
```

**Each question takes 10-30 seconds** and demonstrates: SQL → Vector search → FTS → Hybrid → RAG → Observability

---

## 📖 What Gets Set Up

`npm run setup` creates everything you need:

- ✅ **Extensions**: TimescaleDB, pgvector, pgvectorscale
- ✅ **Tables**: 6 tables (products, orders, feedback, agent tracking)
- ✅ **Indexes**: DiskANN (vector), GIN/FTS (text), TimescaleDB (time-series)
- ✅ **Demo Data**: 5 products, 71 orders, 88 feedback entries

<details>
<summary>📋 <b>Click for detailed breakdown</b></summary>

### Extensions
- `timescaledb` - Time-series optimization
- `vector` - Vector storage (pgvector)
- `vectorscale` - DiskANN indexes (pgvectorscale)

### Tables
- `agent_questions` - Investigation tracking
- `agent_events` - Time-series log (hypertable)
- `agent_memory` - Stored insights with embeddings
- `products`, `orders`, `user_feedback` - Demo data

### Indexes
- **DiskANN**: Fast vector similarity search (cosine)
- **GIN/FTS**: PostgreSQL full-text search (TF-IDF ranking, BM25-like)
- **TimescaleDB**: Automatic time-series partitioning
- **B-tree**: Standard indexes on dates/IDs

### Demo Data
- 5 products (Premium Wireless Headphones, Smart Fitness Watch, etc.)
- 71 orders (14-day history with sales drop pattern)
- 88 feedback entries (27 complaints about headphones, story-driven)

👉 See [`INDEXES_AND_DATA.md`](INDEXES_AND_DATA.md) for complete technical details.
</details>

## 🎯 Try the Demo

Run the 6-question investigation sequence:

```bash
npm run dev "Sales dropped yesterday - why?"
npm run dev "What are customers saying about Premium Wireless Headphones?"
npm run dev "Are other products having quality issues?"
npm run dev "Which customers are at risk?"
npm run dev "What should I do?"
npm run dev "How did you figure this out?"
```

**What you'll see**: SQL analytics → Hybrid search → Semantic search → Agent memory (RAG) → Meta-analysis

👉 See [`DEMO_QUERIES.md`](DEMO_QUERIES.md) for full demo script with talking points.

## 🎬 What You'll See

The agent shows its thinking process in real-time:

```
🤖 Agent: detective
📋 Task: What are customers saying about Premium Wireless Headphones?
──────────────────────────────────────────────────────────────────────

🔍 Question ID: 8d23a209-2dd3-4d46-8bf6-9b8606c5e6f0

⚡ Action: hybrid_search
   Reason: To gather comprehensive feedback
   Semantic query: Premium Wireless Headphones
   Keywords: complaint|issue|problem

✓ Found: 15 results (FTS + Vector search)
   Both matches: 15, Semantic only: 0, Keyword only: 0

[STEP 2]
💭 Customers have expressed significant dissatisfaction...

1. **Quality Issues**: "The flagship wireless headphones are a disappointment..."
2. **Defective Products**: "Premium Wireless Headphones completely dead..."
...

──────────────────────────────────────────────────────────────────────
✅ Investigation Complete
```

Notice: The agent found "flagship wireless headphones" even though the query was "Premium Wireless Headphones" - that's semantic search!

## 🏗️ How It Works

```
CLI → AI SDK Agent → Tools → PostgreSQL
```

**Stack:**
- **Vercel AI SDK** - Agent reasoning & tool calling
- **PostgreSQL** - Core database with extensions:
  - **TimescaleDB** - Time-series for agent_events
  - **pgvector** - Vector storage for embeddings
  - **pgvectorscale** - DiskANN index for fast similarity search
  - **pgai** - Generate embeddings in-database (production)

**Agent Tools:**
- `query_database` - Execute SQL queries
- `hybrid_search` - Combine FTS + vector search (RRF)
- `semantic_search_feedback` - Pure vector similarity
- `fulltext_search` - PostgreSQL FTS
- `store_insight` - Save learnings to agent_memory
- `search_insights` - Recall past learnings (RAG)
- `analyze_agent_performance` - Meta-analysis

## 📁 Project Structure

```
agentic-postgres-demo/
├── sql/
│   ├── 01_schema.sql      # Database schema (tables, indexes)
│   ├── 02_seed_data.sql   # Sample orders and products
│   └── 03_user_feedback.sql  # Sample feedback data
├── src/
│   ├── agent-autonomous.ts   # Core agent with AI SDK
│   ├── db.ts                 # Database functions
│   ├── config.ts             # Configuration
│   ├── cli.ts                # CLI interface
│   ├── setup.ts              # Database setup script
│   └── populate-embeddings.ts # Generate embeddings
└── README.md
```

## ⚙️ Production Setup with pgai

For production, configure **pgai** extension to generate embeddings directly in the database:

1. **In TigerData Console:**
   - Go to your service → Extensions
   - Enable `pgai` extension
   - Add your OpenAI API key

2. **Generate embeddings in SQL:**
   ```sql
   UPDATE user_feedback 
   SET embedding = ai.openai_embed(
     'text-embedding-3-small',
     feedback_text
   )
   WHERE embedding IS NULL;
   ```

This eliminates the need for client-side embedding generation!

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| "OPENAI_API_KEY not set" | Create `.env` with `OPENAI_API_KEY=sk-...` |
| "DATABASE_URL not set" | Add `DATABASE_URL` to `.env` (from TigerData Console) |
| "relation does not exist" | Run `npm run setup` |
| "embedding column is null" | Run `npm run populate-embeddings` |

**Still stuck?** See [`QUICKSTART.md`](QUICKSTART.md) or [`GETTING_STARTED.md`](GETTING_STARTED.md)

## 💡 Key Concepts

<details>
<summary><b>Hybrid Search (RRF)</b> - Best of both worlds</summary>

Combines PostgreSQL FTS (keyword) with pgvectorscale (semantic):
- **Full-Text Search**: GIN index, `to_tsvector`, TF-IDF ranking (BM25-like)
- **Vector Search**: DiskANN index, fast ANN search
- **RRF Algorithm**: Merges both for comprehensive results
- Replaces Elasticsearch + Pinecone with one database!
</details>

<details>
<summary><b>Agent Memory (RAG)</b> - Learning across sessions</summary>

Agent stores insights in `agent_memory` with embeddings:
- Semantic search recalls past learnings
- DiskANN enables fast similarity search
- No separate vector database needed
</details>

<details>
<summary><b>Observability</b> - Full audit trail</summary>

Every action in `agent_events` (TimescaleDB hypertable):
- Step-by-step tracking
- Performance metrics
- Question tracking
</details>

👉 **Technical details**: See [`INDEXES_AND_DATA.md`](INDEXES_AND_DATA.md) for SQL code, index specs, and performance metrics.

## 📚 Documentation

| Guide | Purpose | Time |
|-------|---------|------|
| **[QUICKSTART.md](QUICKSTART.md)** | Get running in 5 minutes | ⚡ 5 min |
| **[TEST_COMMANDS.md](TEST_COMMANDS.md)** | Copy-paste test commands | 🧪 Copy-paste |
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | Complete beginner guide | 📖 10 min |
| **[DEMO_QUERIES.md](DEMO_QUERIES.md)** | Demo script with talking points | 🎤 Reference |
| **[INDEXES_AND_DATA.md](INDEXES_AND_DATA.md)** | Technical deep-dive (SQL, indexes, data) | 🔧 Technical |
| **[FULL_DEMO_RUN_RESULTS.md](FULL_DEMO_RUN_RESULTS.md)** | Complete test results | ✅ Validation |

## 🎓 Learn More

- [TigerData](https://www.tigerdata.cloud) - PostgreSQL + TimescaleDB + pgvector + pgvectorscale
- [pgvectorscale](https://github.com/timescale/pgvectorscale) - DiskANN for PostgreSQL
- [TimescaleDB](https://www.timescale.com) - Time-series PostgreSQL
- [Vercel AI SDK](https://sdk.vercel.ai) - AI agent framework

## 📄 License

MIT

---

**Questions?** Check [QUICKSTART.md](QUICKSTART.md) or [GETTING_STARTED.md](GETTING_STARTED.md)  
**Presenting?** See [DEMO_QUERIES.md](DEMO_QUERIES.md) for talking points

