// Load just the orders and feedback data (schema already exists)
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = postgres(config.databaseUrl);

async function loadData() {
  console.log('📦 Loading demo data to TigerData...\n');
  
  try {
    // Load orders
    console.log('📊 Loading orders...');
    const ordersSQL = await readFile(join(__dirname, '../sql/02_seed_data.sql'), 'utf-8');
    
    // Extract only INSERT statements
    const orderInserts = ordersSQL
      .split('\n')
      .filter(line => line.trim().startsWith('(CURRENT_DATE'))
      .join('\n');
    
    // Build full INSERT statement
    const orderSQL = `INSERT INTO orders (order_date, product_id, product_name, quantity, amount, customer_id, status) VALUES\n${orderInserts};`;
    
    await sql.unsafe(orderSQL);
    const orderCount = await sql`SELECT COUNT(*) as count FROM orders`;
    console.log(`✅ Loaded ${orderCount[0].count} orders\n`);
    
    // Load feedback
    console.log('💬 Loading user feedback...');
    const feedbackSQL = await readFile(join(__dirname, '../sql/03_user_feedback.sql'), 'utf-8');
    
    // Extract only INSERT statements for feedback
    const feedbackInserts = feedbackSQL
      .split('\n')
      .filter(line => line.trim().startsWith('('))
      .filter(line => !line.includes('CREATE') && !line.includes('INSERT INTO') && !line.includes('--'))
      .join('\n');
    
    const fullFeedbackSQL = `INSERT INTO user_feedback (customer_id, feedback_text, product_referenced, sentiment, created_at) VALUES\n${feedbackInserts};`;
    
    await sql.unsafe(fullFeedbackSQL);
    const feedbackCount = await sql`SELECT COUNT(*) as count FROM user_feedback`;
    console.log(`✅ Loaded ${feedbackCount[0].count} feedback entries\n`);
    
    console.log('🎯 Next: Populate embeddings');
    console.log('   npm run populate-embeddings\n');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

loadData();

