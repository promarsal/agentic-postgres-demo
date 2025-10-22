# Agentic Postgres - Web Interface

Beautiful ChatGPT-like interface for the Agentic PostgreSQL detective.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env.local` file:
```
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=postgresql://tsdbadmin:password@your-service.tsdb.cloud.timescale.com:34416/tsdb?sslmode=require
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Features

- **Real-time streaming** - See the agent think in real-time
- **Tool call visualization** - Watch the agent use different tools:
  - 🔵 SQL queries
  - 🟣 Hybrid search (Vector + FTS)
  - 🔴 Semantic search
  - 🟢 Store insights
  - 🟡 Search insights
- **ChatGPT-like UI** - Beautiful, responsive interface
- **Dark mode** - Eye-friendly design

## 📦 Deploy to Vercel

### Option 1: Via Vercel Dashboard
1. Import your GitHub repo
2. Set **Root Directory** to `web`
3. Add environment variables
4. Deploy!

### Option 2: Via CLI
```bash
cd web
vercel
```

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **Vercel AI SDK** - Streaming AI responses
- **shadcn/ui** - Beautiful components
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 📁 Structure

```
web/
├── app/
│   ├── api/chat/route.ts  # Streaming chat endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── Chat.tsx          # Main chat component
│   ├── ToolCallCard.tsx  # Tool visualization
│   └── ui/              # shadcn/ui components
└── lib/
    ├── config.ts        # Configuration
    ├── db.ts           # Database functions
    └── utils.ts        # Utilities
```
