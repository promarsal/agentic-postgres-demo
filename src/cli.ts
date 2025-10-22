#!/usr/bin/env node
// CLI Interface for Agentic Postgres

import { runAgent } from './agent-autonomous.js';

const args = process.argv.slice(2);

// Show help
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
🤖 Agentic Postgres - AI agents powered by TigerData

Usage:
  npm run dev <task>
  npm run dev "investigate revenue drop"

Examples:
  npm run dev "Why did revenue drop yesterday?"
  npm run dev "Find slow queries in the database"
  npm run dev "Check for data quality issues"
  npm run dev "Analyze sales trends this week"

Environment Variables:
  OPENAI_API_KEY       - Your OpenAI API key (required)
  TIGERDATA_SERVICE_ID - Your TigerData service ID (default: ldee944uux)
  `);
  process.exit(0);
}

// Get task from arguments
const task = args.join(' ');

if (!task) {
  console.error('❌ Please provide a task for the agent');
  console.error('   Example: npm run dev "investigate revenue drop"');
  process.exit(1);
}

// Run the agent
console.log('');
await runAgent(task);
console.log('');

