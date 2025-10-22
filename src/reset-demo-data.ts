// Reset demo data - drops old tables and recreates fresh
import { db } from './db.js';

async function reset() {
  console.log('🔄 Resetting demo data...\n');
  
  try {
    console.log('1️⃣  Dropping old tables...');
    await db.executeQuery('DROP TABLE IF EXISTS user_feedback CASCADE;');
    await db.executeQuery('DROP TABLE IF EXISTS orders CASCADE;');
    await db.executeQuery('DROP TABLE IF EXISTS products CASCADE;');
    console.log('   ✓ Old tables dropped\n');
    
    console.log('✅ Reset complete! Now run:');
    console.log('   npm run setup\n');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

reset();

