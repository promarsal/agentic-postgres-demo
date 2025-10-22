# 🚀 START HERE - Complete Setup Guide

## ✅ What's Been Done

Your project is set up and ready to run! Here's what you have:

```
✓ Dependencies installed
✓ Code built successfully  
✓ Database schema ready (SQL files)
✓ Sample data ready
```

## 📝 Step 1: Add Your API Keys

You need to manually create a `.env` file with your keys:

```bash
cd /Users/rajaraodv/apps/agentic-postgres-demo

# Create .env file (copy and paste this):
cat > .env << 'EOF'
# OpenAI API Key (required)
OPENAI_API_KEY=sk-your-key-here

# TigerData Connection (required)  
DATABASE_URL=postgresql://tsdbadmin:YOUR_PASSWORD@ldee944uux.hles2ca4w9.tsdb.cloud.timescale.com:31691/tsdb?sslmode=require

# Service ID
TIGERDATA_SERVICE_ID=ldee944uux
EOF
```

**Now edit the `.env` file and replace:**

1. **`sk-your-key-here`** → Your OpenAI API key
   - Get one at: https://platform.openai.com/api-keys
   
2. **`YOUR_PASSWORD`** → Your TigerData password
   - This is the password for your `ldee944uux` service

## 🗄️ Step 2: Setup Database

Run this to create tables and load sample data:

```bash
npm run setup
```

You should see:
```
🚀 Setting up Agentic Postgres...
📋 Creating schema...
✓ Schema created

📊 Loading sample data...
✓ Sample data loaded

✅ Setup complete!
```

## 🎯 Step 3: Run Your First Agent

```bash
npm run dev "Why did revenue drop yesterday?"
```

You should see the agent:
1. Think about the problem
2. Generate analysis
3. Provide conclusions

## 📊 What the Demo Does

The sample data includes:
- **Oct 19** (2 days ago): Normal sales ~$3,000
- **Oct 20** (yesterday): Sales dropped to ~$700 (30% drop!)
- **Reason**: Product #42 "Super Device" went out of stock

The agent should discover this pattern when investigating!

## 🔧 Troubleshooting

### "OPENAI_API_KEY not set"
- Make sure you created `.env` file
- Make sure you added your actual OpenAI key (starts with `sk-`)
- Run: `cat .env` to verify

### "DATABASE_URL not set"
- Make sure `.env` has the DATABASE_URL
- Make sure you replaced `YOUR_PASSWORD` with actual password
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Setup Fails
If `npm run setup` fails:
1. Check database connection is correct
2. Make sure TigerData service is running
3. Check you have the password right

### Build Errors
Already built! But if you modify code:
```bash
npm run build
```

## 🎪 Try These Examples

```bash
# Revenue investigation
npm run dev "investigate revenue drop"

# Product analysis  
npm run dev "what are our top selling products?"

# General query
npm run dev "show me sales trends this week"
```

## 🔍 Explore the Data

Connect to your database:
```bash
# Set environment variable
export DATABASE_URL="postgresql://tsdbadmin:PASSWORD@ldee944uux.hles2ca4w9.tsdb.cloud.timescale.com:31691/tsdb?sslmode=require"

# Connect with psql
psql $DATABASE_URL

# Try queries:
SELECT * FROM orders ORDER BY order_date DESC LIMIT 10;
SELECT * FROM products;
SELECT order_date, SUM(amount) as revenue FROM orders GROUP BY order_date;
```

## 📖 Next Steps

Once it's working:

1. **Understand the code**
   - `src/agent-simple.ts` - Agent logic
   - `src/mcp-client.ts` - Database connection
   - `sql/` - Database schema and sample data

2. **Add features**
   - See `ADDING_TOOLS.md` for how to add custom capabilities
   - See `agent.ts.backup` for advanced agent with tools (needs AI SDK fixes)

3. **Build a UI** 
   - Add Next.js frontend
   - Visualize agent thoughts
   - Make it interactive

## 💡 How It Works

```
Your Question
     ↓
AI SDK (GPT-4)
     ↓
Analysis & Recommendations
     ↓
Stored in Database
```

Currently simplified - the agent generates text analysis.

The full version (in `agent.ts.backup`) would:
- Execute SQL queries automatically
- Search vector memory
- Track all decisions  
- Learn over time

But that needs AI SDK version compatibility fixes.

## ✅ You're Ready!

Try running:
```bash
npm run dev "investigate revenue drop yesterday"
```

If you see output from the agent, you're all set! 🎉

---

**Need help?** Check:
- `README.md` - Full documentation
- `QUICK_START.md` - Quick reference
- `CONNECTING_MCP.md` - Database connection options
- `ADDING_TOOLS.md` - Extending capabilities

