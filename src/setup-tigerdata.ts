// Setup TigerData cloud database with complete demo data
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// TigerData connection from config
const sql = postgres(config.databaseUrl);

async function setup() {
  console.log('🚀 Setting up TigerData Cloud Database...\n');
  
  try {
    // Read the complete setup SQL
    console.log('📋 Reading setup SQL...');
    const setupSQL = await readFile(join(__dirname, '../sql/00_complete_setup.sql'), 'utf-8');
    
    // Split into individual statements
    const statements = setupSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !==  '==');
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    let executed = 0;
    let errors = 0;
    
    for (const statement of statements) {
      // Skip comment lines
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }
      
      try {
        await sql.unsafe(statement + ';');
        executed++;
        if (executed % 10 === 0) {
          process.stdout.write(`\rProgress: ${executed}/${statements.length}`);
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists') || 
            error.message.includes('if_not_exists') ||
            error.message.includes('IF NOT EXISTS')) {
          executed++;
        } else {
          errors++;
          if (errors < 5) {  // Only show first few errors
            console.log(`\n⚠️  Error: ${error.message.substring(0, 100)}`);
          }
        }
      }
    }
    
    console.log(`\n\n✅ Setup complete!`);
    console.log(`   Executed: ${executed} statements`);
    console.log(`   Errors: ${errors}\n`);
    
    // Verify data
    console.log('🔍 Verifying data...');
    const products = await sql`SELECT COUNT(*) as count FROM products`;
    const orders = await sql`SELECT COUNT(*) as count FROM orders`;
    const feedback = await sql`SELECT COUNT(*) as count FROM user_feedback`;
    
    console.log(`   Products: ${products[0].count}`);
    console.log(`   Orders: ${orders[0].count}`);
    console.log(`   Feedback: ${feedback[0].count}\n`);
    
    console.log('🎯 Next step: Populate embeddings');
    console.log('   npm run populate-embeddings\n');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();

