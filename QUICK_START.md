# ⚡ Quick Start Guide

## Step 1: Add Your Keys

Create `.env` file:

```bash
# In terminal:
cat > .env << 'EOF'
OPENAI_API_KEY=sk-your-actual-openai-key-here
DATABASE_URL=postgresql://tsdbadmin:PASSWORD@ldee944uux.hles2ca4w9.tsdb.cloud.timescale.com:31691/tsdb?sslmode=require
TIGERDATA_SERVICE_ID=ldee944uux
EOF
```

**Replace:**
1. `sk-your-actual-openai-key-here` with your OpenAI API key from https://platform.openai.com/api-keys
2. `PASSWORD` with your TigerData password

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Setup Database

```bash
npm run build
npm run setup
```

This creates the tables and loads sample data.

## Step 4: Run Demo

```bash
npm run dev "investigate revenue drop yesterday"
```

## What Happens

The agent will:
1. Query revenue for past days
2. Identify Product #42 had no sales
3. Check inventory - find it's out of stock
4. Search memory for similar cases
5. Provide root cause + recommendations

All autonomously!

##  Troubleshooting

### "OPENAI_API_KEY not set"
- Add your OpenAI API key to `.env` file
- Get one at: https://platform.openai.com/api-keys

### "DATABASE_URL not set"
- Add your TigerData connection string to `.env`
- Include the password!

### TypeScript Errors
If you see compile errors, try:
```bash
npm install --legacy-peer-deps
```

### Still Not Working?

Check:
1. `.env` file exists and has correct values
2. Database connection works: `psql $DATABASE_URL -c "SELECT 1"`
3. OpenAI API key is valid

##  Next Steps

Once it works:
- Try different tasks
- Add custom tools (see ADDING_TOOLS.md)
- Check agent memory and events in database
- Build a UI!

