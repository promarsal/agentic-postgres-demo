# 🚀 Quick Setup Guide

## Prerequisites

1. **TigerData account** - [console.tigerdata.cloud](https://console.tigerdata.cloud)
2. **OpenAI API key** - [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. **Node.js 18+**

## Setup Steps (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
# Create file
cat > .env << EOF
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://tsdbadmin:password@your-service.tsdb.cloud.timescale.com:34416/tsdb?sslmode=require
EOF
```

**Get DATABASE_URL from TigerData:**
- Console → Your Service → "Connection Info"
- Copy full connection string with password

### 3. Setup database
```bash
npm run build
npm run setup
```

**This creates:**
- **Extensions**: TimescaleDB, pgvector, pgvectorscale
- **Tables**: agent_questions, agent_events, agent_memory, products, orders, user_feedback
- **Indexes**:
  - DiskANN (vector similarity) - Fast ANN search on embeddings
  - GIN/FTS (full-text) - PostgreSQL text search with TF-IDF ranking
  - TimescaleDB hypertable indexes
- **Seed Data**: 5 products, 71 orders, 88 feedback entries with story

### 4. Generate embeddings
```bash
npm run populate-embeddings
```

This generates vector embeddings for semantic search (~30 seconds).

### 5. Test it!
```bash
npm run dev "What are customers saying about Premium Wireless Headphones?"
```

## ✅ You're Done!

Try the full demo sequence:
```bash
npm run dev "Sales dropped yesterday compared to last week - why?"
npm run dev "What are customers saying about Premium Wireless Headphones?"
npm run dev "Are other products showing similar quality issues?"
npm run dev "Based on what we've learned, what should I do immediately?"
```

## 🔧 Common Issues

**"OPENAI_API_KEY not set"** → Check `.env` file exists and has correct key

**"DATABASE_URL not set"** → Get from TigerData Console → Connection Info

**"relation does not exist"** → Run `npm run setup`

**No embeddings** → Run `npm run populate-embeddings`

## 🎓 Production Setup

For production, enable **pgai** extension in TigerData Console:
1. Go to Extensions → Enable pgai
2. Add your OpenAI API key
3. Embeddings will generate automatically in the database!

## 📚 Next Steps

- See `README.md` for full documentation
- See `DEMO_SCRIPT.md` for presentation guide
- See `DEMO_QUERIES.md` for query reference

