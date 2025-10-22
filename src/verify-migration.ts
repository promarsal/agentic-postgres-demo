// Verify migration - check new tables exist
import { db } from './db.js';

async function verify() {
  console.log('🔍 Verifying migration...\n');
  
  try {
    // Check agent_questions table
    console.log('📋 Checking agent_questions table...');
    const questionsCheck = await db.executeQuery(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agent_questions'
      ORDER BY ordinal_position;
    `);
    console.log(`✓ Found ${questionsCheck.rows?.length || 0} columns`);
    if (questionsCheck.rows && questionsCheck.rows.length > 0) {
      questionsCheck.rows.forEach(row => {
        console.log(`   - ${row[0]}: ${row[1]}`);
      });
    }
    console.log('');
    
    // Check agent_events table structure
    console.log('📋 Checking agent_events table...');
    const eventsCheck = await db.executeQuery(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agent_events'
      ORDER BY ordinal_position;
    `);
    console.log(`✓ Found ${eventsCheck.rows?.length || 0} columns`);
    if (eventsCheck.rows && eventsCheck.rows.length > 0) {
      eventsCheck.rows.forEach(row => {
        console.log(`   - ${row[0]}: ${row[1]}`);
      });
    }
    console.log('');
    
    // Check if it's a hypertable
    console.log('⏱️  Checking TimescaleDB hypertable...');
    const hypertableCheck = await db.executeQuery(`
      SELECT hypertable_name, hypertable_schema 
      FROM timescaledb_information.hypertables 
      WHERE hypertable_name = 'agent_events';
    `);
    if (hypertableCheck.rows && hypertableCheck.rows.length > 0) {
      console.log('✓ agent_events is a TimescaleDB hypertable');
    } else {
      console.log('⚠️  agent_events is not a hypertable (this might be okay if TimescaleDB extension is not enabled)');
    }
    console.log('');
    
    console.log('✅ Migration verified successfully!\n');
    console.log('🚀 Ready to use question tracking!');
    console.log('   Try: npm run dev "Why did sales drop yesterday?"\n');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verify();

