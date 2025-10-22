// Setup script - initializes database schema
import { db } from './db.js';
import { config } from './config.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function setup() {
  console.log('🚀 Setting up Agentic Postgres...\n');
  
  try {
    // Read and execute schema
    console.log('📋 Creating schema...');
    const schema = await readFile(join(__dirname, '../sql/01_schema.sql'), 'utf-8');
    await db.executeQuery(schema);
    console.log('✓ Schema created\n');
    
    // Read and execute seed data
    console.log('📊 Loading sample data...');
    const seed = await readFile(join(__dirname, '../sql/02_seed_data.sql'), 'utf-8');
    await db.executeQuery(seed);
    console.log('✓ Sample data loaded\n');
    
    // Load user feedback data for hybrid search demo
    console.log('💬 Loading user feedback data...');
    const feedback = await readFile(join(__dirname, '../sql/03_user_feedback.sql'), 'utf-8');
    await db.executeQuery(feedback);
    console.log('✓ User feedback data loaded\n');
    
    console.log('✅ Setup complete!\n');
    console.log('💡 TigerData features showcased:');
    console.log('   ✓ TimescaleDB: Hypertables for time-series agent events');
    console.log('   ✓ pgvector: Vector storage ready for hybrid search');
    console.log('   ✓ PostgreSQL: Unified database for AI agents\n');
    console.log('Demo queries:');
    console.log('  npm run dev "Why did revenue drop yesterday?"');
    console.log('  npm run dev "Analyze user feedback and group by themes"\n');
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();

