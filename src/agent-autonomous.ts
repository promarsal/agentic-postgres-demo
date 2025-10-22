// Autonomous Agent - Actually executes queries and investigates
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { db } from './db.js';
import { config } from './config.js';
import { getSchemaDescription, getQueryExamples } from './schema.js';

// Set API key
process.env.OPENAI_API_KEY = config.openaiApiKey;

export async function runAgent(task: string, agentName: string = 'detective') {
  console.log('🤖 Agent:', agentName);
  console.log('📋 Task:', task);
  console.log('─'.repeat(70));
  console.log('');

  let stepCount = 0;
  const startTime = Date.now();
  
  // Create question record for tracking
  const questionId = await db.createQuestion(agentName, task);
  console.log('🔍 Question ID:', questionId);
  console.log('');

  // Define tools with access to questionId and stepCount
  const tools = {
    query_database: tool({
      description: 'Execute SQL queries on the database to fetch and analyze data',
      parameters: z.object({
        sql: z.string().describe('The SQL query to execute'),
        reasoning: z.string().describe('Why you are running this query')
      }),
      execute: async ({ sql, reasoning }: { sql: string; reasoning: string }) => {
        console.log('⚡ Action: query_database');
        console.log('   Reason:', reasoning);
        console.log('   SQL:');
        console.log('   ' + sql.split('\n').map(line => '   ' + line).join('\n'));
        console.log('');
        
        try {
          const result = await db.executeQuery(sql);
          console.log(`✓ Result: ${result.rows?.length || 0} rows`);
          if (result.rows && result.rows.length > 0) {
            console.log('   Sample:', JSON.stringify(result.rows.slice(0, 2)));
          }
          
          // Store agent action in TimescaleDB hypertable for observability
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'query_database',
            sql: sql.slice(0, 500), // Truncate for storage
            reasoning: reasoning,
            rowCount: result.rows?.length || 0
          }).catch(() => {}); // Silent fail if storage fails
          
          return {
            success: true,
            rows: result.rows,
            rowCount: result.rows?.length || 0
          };
        } catch (error: any) {
          console.log('✗ Error:', error.message);
          
          // Store errors too
          await db.storeEvent(questionId, agentName, stepCount, 'error', {
            tool: 'query_database',
            sql: sql.slice(0, 500),
            error: error.message
          }).catch(() => {});
          
          return {
            success: false,
            error: error.message
          };
        }
      }
    }),

    hybrid_search: tool({
      description: 'Search user feedback using BOTH keyword matching AND semantic similarity (best for comprehensive results)',
      parameters: z.object({
        query: z.string().describe('Natural language query for semantic search'),
        keywords: z.string().describe('Keywords for full-text search (use | for OR, & for AND)'),
        reasoning: z.string().describe('Why you are using hybrid search')
      }),
      execute: async ({ query, keywords, reasoning }) => {
        console.log('⚡ Action: hybrid_search');
        console.log('   Reason:', reasoning);
        console.log('   Semantic query:', query);
        console.log('   Keywords:', keywords);
        console.log('');
        
        try {
          const results = await db.hybridSearchFeedback(query, keywords, 15);
          console.log(`✓ Found: ${results.length} results (FTS + Vector search)`);
          if (results.length > 0) {
            const both = results.filter((r: any) => r.match_type === 'both').length;
            const semantic = results.filter((r: any) => r.match_type === 'semantic_only').length;
            const keyword = results.filter((r: any) => r.match_type === 'fulltext_only').length;
            console.log(`   Both matches: ${both}, Semantic only: ${semantic}, Keyword only: ${keyword}`);
          }
          console.log('');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'hybrid_search',
            query, keywords, reasoning,
            resultCount: results.length
          }).catch(() => {});
          
          return {
            success: true,
            results: results.map((r: any) => ({
              id: r.id,
              feedback: r.feedback_text,
              product: r.product_referenced,
              sentiment: r.sentiment,
              match_type: r.match_type,
              relevance: r.relevance_score,
              similarity: r.similarity,
              fts_rank: r.fts_rank
            })),
            totalResults: results.length
          };
        } catch (error: any) {
          console.log('✗ Error:', error.message);
          return { success: false, error: error.message };
        }
      }
    }),
    
    semantic_search_feedback: tool({
      description: 'Search user feedback using semantic similarity (finds related concepts, not just exact words)',
      parameters: z.object({
        query: z.string().describe('Natural language query describing what to find'),
        reasoning: z.string().describe('Why you are using semantic search')
      }),
      execute: async ({ query, reasoning }) => {
        console.log('⚡ Action: semantic_search_feedback');
        console.log('   Reason:', reasoning);
        console.log('   Query:', query);
        console.log('');
        
        try {
          const results = await db.semanticSearchFeedback(query, 10);
          console.log(`✓ Found: ${results.length} semantically similar results`);
          console.log('');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'semantic_search_feedback',
            query, reasoning,
            resultCount: results.length
          }).catch(() => {});
          
          return {
            success: true,
            results: results.map((r: any) => ({
              id: r.id,
              feedback: r.feedback_text,
              product: r.product_referenced,
              sentiment: r.sentiment,
              similarity: r.similarity
            })),
            totalResults: results.length
          };
        } catch (error: any) {
          console.log('✗ Error:', error.message);
          return { success: false, error: error.message };
        }
      }
    }),
    
    fulltext_search: tool({
      description: 'Search user feedback for exact keyword matches (best when you need specific terms)',
      parameters: z.object({
        keywords: z.string().describe('Keywords to search for (use | for OR, & for AND, ! for NOT)'),
        reasoning: z.string().describe('Why you are using fulltext search')
      }),
      execute: async ({ keywords, reasoning }) => {
        console.log('⚡ Action: fulltext_search');
        console.log('   Reason:', reasoning);
        console.log('   Keywords:', keywords);
        console.log('');
        
        try {
          const results = await db.fulltextSearchFeedback(keywords, 10);
          console.log(`✓ Found: ${results.length} exact matches`);
          console.log('');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'fulltext_search',
            keywords, reasoning,
            resultCount: results.length
          }).catch(() => {});
          
          return {
            success: true,
            results: results.map((r: any) => ({
              id: r.id,
              feedback: r.feedback_text,
              product: r.product_referenced,
              sentiment: r.sentiment,
              rank: r.rank
            })),
            totalResults: results.length
          };
        } catch (error: any) {
          console.log('✗ Error:', error.message);
          return { success: false, error: error.message };
        }
      }
    }),
    
    store_insight: tool({
      description: 'Store an important finding or insight for future reference (enables learning across investigations)',
      parameters: z.object({
        insight: z.string().describe('The key finding or insight to remember'),
        reasoning: z.string().describe('Why this insight is important')
      }),
      execute: async ({ insight, reasoning }) => {
        console.log('⚡ Action: store_insight');
        console.log('   Reason:', reasoning);
        console.log('   Insight:', insight.substring(0, 100) + '...');
        console.log('');
        
        try {
          await db.storeInsight(agentName, insight, { 
            question_id: questionId,
            reasoning 
          });
          console.log('✓ Insight stored');
          console.log('');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'store_insight',
            insight: insight.slice(0, 200),
            reasoning
          }).catch(() => {});
          
          return { success: true, message: 'Insight stored successfully' };
        } catch (error: any) {
          console.log('✗ Error:', error.message);
          return { success: false, error: error.message };
        }
      }
    }),
    
    search_insights: tool({
      description: 'Search your previous findings and learnings from past investigations',
      parameters: z.object({
        query: z.string().describe('What past learnings to search for'),
        reasoning: z.string().describe('Why you need past insights')
      }),
      execute: async ({ query, reasoning }) => {
        console.log('⚡ Action: search_insights');
        console.log('   Reason:', reasoning);
        console.log('   Query:', query);
        console.log('');
        
        try {
          const results = await db.searchInsights(agentName, query, 5);
          console.log(`✓ Found: ${results.length} relevant insights from past investigations`);
          console.log('');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'search_insights',
            query, reasoning,
            resultCount: results.length
          }).catch(() => {});
          
          return {
            success: true,
            insights: results.map((r: any) => ({
              content: r.content,
              relevance: r.relevance,
              created_at: r.created_at
            })),
            totalInsights: results.length
          };
        } catch (error: any) {
          console.log('✗ Error:', error.message);
          return { success: false, error: error.message };
        }
      }
    }),
    
    analyze_agent_performance: tool({
      description: 'Analyze your own investigation process and performance (meta-analysis)',
      parameters: z.object({
        reasoning: z.string().describe('Why you want to analyze your performance')
      }),
      execute: async ({ reasoning }) => {
        console.log('⚡ Action: analyze_agent_performance');
        console.log('   Reason:', reasoning);
        console.log('');
        
        try {
          const stats = await db.analyzeAgentPerformance(questionId);
          console.log(`✓ Performance analysis complete`);
          console.log(`   Steps: ${stats.total_steps}, Duration: ${stats.duration_ms}ms`);
          console.log('');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'analyze_agent_performance',
            reasoning
          }).catch(() => {});
          
          return {
            success: true,
            performance: {
              question: stats.question,
              status: stats.status,
              total_steps: stats.total_steps,
              duration_ms: stats.duration_ms,
              total_tool_calls: stats.total_tool_calls,
              queries_executed: stats.queries_executed,
              reasoning_steps: stats.reasoning_steps,
              errors: stats.errors,
              tools_used: stats.tools_used
            }
          };
        } catch (error: any) {
          console.log('✗ Error:', error.message);
          return { success: false, error: error.message };
        }
      }
    })
  };

  try {
    // Dynamically fetch schema from database
    const schemaDescription = await getSchemaDescription();
    const queryExamples = getQueryExamples();

    const result = await generateText({
      model: openai('gpt-4o-mini') as any,
      tools,
      system: `You are an expert database detective investigating business problems.

You have access to ONE powerful database with multiple capabilities - no separate services needed!

${schemaDescription}

═══════════════════════════════════════════════════════════════
YOUR TOOLS & WHEN TO USE THEM:
═══════════════════════════════════════════════════════════════

1. query_database - SQL queries for structured data analysis
   USE FOR: Sales trends, revenue calculations, customer counts, time-series analysis
   FEATURES: TimescaleDB time_bucket(), window functions, CTEs, JOINs

2. hybrid_search - RECOMMENDED for searching feedback (FTS + Vector)
   USE FOR: Searching customer feedback comprehensively
   FEATURES: Finds BOTH exact keywords AND semantically similar concepts
   WHY POWERFUL: Catches subtle complaints that keyword search misses
   EXAMPLE: Finds "disappointed with purchase" AND "Product X broken"

3. semantic_search_feedback - Vector similarity search
   USE FOR: Finding conceptually related feedback (not just exact words)
   FEATURES: pgvectorscale DiskANN index for fast similarity
   EXAMPLE: Query "quality issues" → finds "broke", "disappointed", "not worth it"

4. fulltext_search - PostgreSQL full-text search
   USE FOR: Finding specific keywords or terms (when exactness matters)
   FEATURES: Boolean operators (|=OR, &=AND, !=NOT), ranked results

5. store_insight - Save important findings
   USE WHEN: You discover something significant worth remembering
   ENABLES: Learning across investigations, building knowledge base

6. search_insights - Recall past learnings
   USE WHEN: Current question might relate to past investigations
   ENABLES: Don't repeat work, build on previous findings

7. analyze_agent_performance - Meta-analysis of your investigation
   USE FOR: "How did you figure this out?" questions
   SHOWS: Tools used, queries executed, time spent, investigation process

═══════════════════════════════════════════════════════════════
INVESTIGATION STRATEGY:
═══════════════════════════════════════════════════════════════

Question Type → Approach:

"Why did sales drop?" 
→ query_database (compare time periods)
→ store_insight (root cause)

"What are customers saying?"
→ hybrid_search (comprehensive feedback search)
→ store_insight (patterns found)

"Are other products affected?"
→ semantic_search_feedback (find similar patterns)
→ query_database (quantify impact)

"Which customers are we losing?"
→ query_database (customer lifetime value analysis)

"What should I do?"
→ search_insights (recall all findings)
→ Synthesize recommendations

"How did you figure this out?"
→ analyze_agent_performance (show investigation process)

═══════════════════════════════════════════════════════════════
KEY CAPABILITIES TO SHOWCASE:
═══════════════════════════════════════════════════════════════

✓ TimescaleDB - time-series queries with time_bucket()
✓ pgvectorscale - semantic search with DiskANN index  
✓ PostgreSQL FTS - full-text search with ranking
✓ Hybrid Search - RRF combining FTS + vector (UNIQUE!)
✓ Vector embeddings - understand meaning, not just keywords
✓ Self-observability - query your own investigation history

═══════════════════════════════════════════════════════════════
IMPORTANT SQL TIPS:
═══════════════════════════════════════════════════════════════

- Use CURRENT_DATE for today, CURRENT_DATE - 1 for yesterday
- Use INTERVAL '7 days' for date math
- NEVER SELECT embedding columns (they're huge 1536-dimensional vectors!)
- For customer analysis: JOIN orders with user_feedback on customer_id
- For lifetime value: SUM(amount) GROUP BY customer_id

═══════════════════════════════════════════════════════════════
INVESTIGATION FLOW:
═══════════════════════════════════════════════════════════════

1. Understand the question
2. Choose the RIGHT tool for each step
3. Execute multiple queries if needed (be thorough!)
4. Analyze results and connect dots
5. Store important insights (use store_insight)
6. State conclusion: "INVESTIGATION COMPLETE: [answer]"

Remember: You have ONE database with ALL these capabilities.
That's the power of Tim scalable Postgres!`,
      prompt: task,
      maxToolRoundtrips: 5,
      onStepFinish: ({ text }) => {
        stepCount++;
        if (text) {
          console.log(`\n[STEP ${stepCount}]`);
          console.log('💭', text);
          
          // Store agent thoughts in TimescaleDB hypertable
          db.storeEvent(questionId, agentName, stepCount, 'thought', {
            text: text.slice(0, 500) // Truncate long thoughts
          }).catch(() => {}); // Silent fail
        }
      }
    });

    console.log('\n' + '─'.repeat(70));
    console.log('✅ Investigation Complete');
    console.log(result.text);
    
    const durationMs = Date.now() - startTime;
    
    // Mark question as completed
    await db.completeQuestion(questionId, result.text, stepCount, durationMs, 'completed').catch(() => {});
    
    return {
      success: true,
      answer: result.text,
      steps: stepCount,
      duration: durationMs,
      questionId
    };

  } catch (error: any) {
    console.log('\n' + '─'.repeat(70));
    console.error('❌ Agent failed:', error.message);
    
    const durationMs = Date.now() - startTime;
    
    // Mark question as failed
    await db.completeQuestion(questionId, `Agent failed: ${error.message}`, stepCount, durationMs, 'failed').catch(() => {});
    
    return {
      success: false,
      answer: `Agent failed: ${error.message}`,
      steps: stepCount,
      duration: durationMs,
      questionId
    };
  }
}

