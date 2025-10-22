// Migration script - adds question tracking to database
import { db } from './db.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log('🔄 Running migration: Add Question Tracking\n');
  
  try {
    // Read and execute migration
    console.log('📋 Updating schema...');
    const migration = await readFile(join(__dirname, '../sql/04_migration_add_questions.sql'), 'utf-8');
    await db.executeQuery(migration);
    console.log('✓ Schema updated\n');
    
    console.log('✅ Migration complete!\n');
    console.log('🎯 New features:');
    console.log('   ✓ agent_questions table - tracks each investigation');
    console.log('   ✓ agent_events updated - linked to questions with step ordering');
    console.log('   ✓ Full traceability - see all queries for each question\n');
    
    console.log('📚 Documentation:');
    console.log('   See QUESTION_TRACKING_GUIDE.md for usage examples\n');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 This is normal if tables already exist or schema is already updated.');
    console.error('   Check the error details above.\n');
    process.exit(1);
  }
}

migrate();

