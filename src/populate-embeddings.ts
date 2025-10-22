// Populate embeddings for user feedback
// NOTE: This uses client-side embedding generation as a workaround
// In production with pgai configured, embeddings would be generated IN the database
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { db } from './db.js';
import { config } from './config.js';

async function populateEmbeddings() {
  console.log('🔄 Populating embeddings for user feedback...\n');
  
  try {
    // Get all feedback without embeddings
    const result = await db.executeQuery(`
      SELECT id, feedback_text 
      FROM user_feedback 
      WHERE embedding IS NULL
    `);
    
    if (result.rows.length === 0) {
      console.log('✅ All feedback already has embeddings!');
      return;
    }
    
    console.log(`📝 Found ${result.rows.length} feedback entries without embeddings`);
    console.log('⚡ Generating embeddings...\n');
    
    let count = 0;
    for (const row of result.rows) {
      const [id, feedbackText] = row;
      
      // Generate embedding using OpenAI (client-side for now)
      const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: feedbackText as string
      });
      
      // Convert to PostgreSQL vector format
      const vectorStr = `[${embedding.join(',')}]`;
      
      // Update the database
      await db.executeQuery(`
        UPDATE user_feedback 
        SET embedding = $1::vector 
        WHERE id = $2
      `, [vectorStr, id]);
      
      count++;
      process.stdout.write(`\rProgress: ${count}/${result.rows.length}`);
    }
    
    console.log('\n\n✅ Embeddings populated!');
    console.log('\n💡 Note: In production, use pgai to generate embeddings IN the database:');
    console.log('   UPDATE user_feedback SET embedding = ai.openai_embed(...);');
    console.log('   This requires configuring OPENAI_API_KEY in Tiger Console.\n');
    
  } catch (error: any) {
    console.error('❌ Failed to populate embeddings:', error.message);
    process.exit(1);
  }
}

populateEmbeddings();

