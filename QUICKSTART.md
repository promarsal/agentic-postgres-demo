# ⚡ Quick Start (5 minutes)

## What You Need

1. [OpenAI API key](https://platform.openai.com/api-keys)
2. Node.js 18+

## Step 1: Setup TigerData (via MCP)

Install and connect TigerData in 3 commands:

```bash
# Install Tiger CLI
curl -fsSL https://cli.tigerdata.com | sh

# Authenticate (opens browser)
tiger auth login

# Install MCP (connects TigerData to your environment)
tiger mcp install
```

**What this does:**
- Creates a free TigerData account (if you don't have one)
- Sets up PostgreSQL with TimescaleDB, pgvector, and pgvectorscale
- Configures MCP for database access
- Provides your `DATABASE_URL`

## Step 2: Setup the Demo

```bash
# Clone and install
git clone https://github.com/promarsal/agentic-postgres-demo.git
cd agentic-postgres-demo
npm install

# Configure
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "DATABASE_URL=postgresql://..." >> .env  # From tiger mcp install output

# Setup database
npm run build && npm run setup

# Generate embeddings
npm run populate-embeddings

# Try it!
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

## Get Your DATABASE_URL

After running `tiger mcp install`, you'll see your connection string. Or:

1. Run `tiger service list` to see your services
2. Run `tiger service get <service-id>` to get connection info
3. Or visit [TigerData Console](https://console.tigerdata.cloud) → Your Service → "Connection Info"

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

