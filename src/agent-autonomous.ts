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
        stepCount++;
        console.log(`\n${'━'.repeat(70)}`);
        console.log(`📊 STEP ${stepCount}: SQL Query`);
        console.log('━'.repeat(70));
        console.log(`\n💡 Reason: ${reasoning}\n`);
        console.log('📝 SQL:');
        console.log('─'.repeat(70));
        const sqlLines = sql.trim().split('\n');
        sqlLines.forEach(line => {
          console.log('  ' + line);
        });
        console.log('─'.repeat(70));
        
        try {
          const result = await db.executeQuery(sql);
          console.log(`\n✅ Result: ${result.rows?.length || 0} rows returned\n`);
          
          if (result.rows && result.rows.length > 0 && result.rows.length <= 5) {
            console.log('📊 Results:');
            result.rows.forEach((row, idx) => {
              const formatted = Array.isArray(row) ? row.join(' | ') : JSON.stringify(row);
              console.log(`   ${idx + 1}. ${formatted}`);
            });
          } else if (result.rows && result.rows.length > 5) {
            console.log('📊 Top 3 Results:');
            result.rows.slice(0, 3).forEach((row, idx) => {
              const formatted = Array.isArray(row) ? row.join(' | ') : JSON.stringify(row);
              console.log(`   ${idx + 1}. ${formatted}`);
            });
            console.log(`   ... and ${result.rows.length - 3} more rows`);
          }
          console.log('');
          
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
          console.log('\n❌ Error:', error.message);
          console.log('');
          
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
        stepCount++;
        console.log(`\n${'━'.repeat(70)}`);
        console.log(`🔍 STEP ${stepCount}: Hybrid Search (BM25 + Vector)`);
        console.log('━'.repeat(70));
        console.log(`\n💡 Reason: ${reasoning}\n`);
        console.log(`🔍 Semantic Query: ${query}`);
        console.log(`🔑 Keywords: ${keywords}\n`);
        
        // Show the hybrid search SQL (simplified for display)
        console.log('📝 SQL: Hybrid Search with Reciprocal Rank Fusion (RRF)');
        console.log('─'.repeat(70));
        console.log('  WITH semantic_search AS (');
        console.log('    -- Vector similarity using pgvectorscale');
        console.log('    SELECT id, feedback_text, sentiment,');
        console.log('           1 - (embedding <=> query_vector) as similarity,');
        console.log('           ROW_NUMBER() OVER (ORDER BY embedding <=> query_vector) as rank');
        console.log('    FROM user_feedback WHERE embedding IS NOT NULL');
        console.log('  ),');
        console.log('  fulltext_search AS (');
        console.log('    -- BM25 keyword search using PostgreSQL FTS');
        console.log('    SELECT id, ts_rank(...) as fts_rank,');
        console.log('           ROW_NUMBER() OVER (ORDER BY ts_rank(...) DESC) as rank');
        console.log('    FROM user_feedback');
        console.log('    WHERE to_tsvector(feedback_text) @@ websearch_to_tsquery(keywords)');
        console.log('  ),');
        console.log('  combined AS (');
        console.log('    -- RRF: Combine rankings with 1/(rank+60) formula');
        console.log('    SELECT *, (1.0/(s.rank+60) + 1.0/(f.rank+60)) as rrf_score');
        console.log('    FROM semantic_search s FULL OUTER JOIN fulltext_search f USING (id)');
        console.log('  )');
        console.log('  SELECT * FROM combined ORDER BY rrf_score DESC LIMIT 15;');
        console.log('─'.repeat(70));
        console.log('');
        
        try {
          const results = await db.hybridSearchFeedback(query, keywords, 15);
          const both = results.filter((r: any) => r.match_type === 'both').length;
          const semantic = results.filter((r: any) => r.match_type === 'semantic_only').length;
          const keyword = results.filter((r: any) => r.match_type === 'fulltext_only').length;
          
          console.log(`✅ Found: ${results.length} results\n`);
          console.log('📊 Match Breakdown:');
          console.log(`   • Both (BM25 + Vector): ${both}`);
          console.log(`   • Semantic only: ${semantic}`);
          console.log(`   • Keyword only: ${keyword}\n`);
          
          if (results.length > 0) {
            console.log('💬 Sample Feedback:');
            results.slice(0, 3).forEach((r: any, idx: number) => {
              const preview = r.feedback_text.substring(0, 65) + (r.feedback_text.length > 65 ? '...' : '');
              console.log(`   ${idx + 1}. "${preview}" [${r.sentiment}]`);
            });
            if (results.length > 3) {
              console.log(`   ... and ${results.length - 3} more feedback items`);
            }
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
          console.log('\n❌ Error:', error.message);
          console.log('');
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
        stepCount++;
        console.log(`\n${'━'.repeat(70)}`);
        console.log(`🧠 STEP ${stepCount}: Semantic Search (Vector)`);
        console.log('━'.repeat(70));
        console.log(`\n💡 Reason: ${reasoning}\n`);
        console.log(`🔍 Query: ${query}\n`);
        
        try {
          const results = await db.semanticSearchFeedback(query, 10);
          console.log(`✅ Found: ${results.length} semantically similar results\n`);
          
          if (results.length > 0) {
            console.log('💬 Sample Matches:');
            results.slice(0, 3).forEach((r: any, idx: number) => {
              const preview = r.feedback_text.substring(0, 65) + (r.feedback_text.length > 65 ? '...' : '');
              console.log(`   ${idx + 1}. "${preview}" [${r.sentiment}]`);
            });
            if (results.length > 3) {
              console.log(`   ... and ${results.length - 3} more results`);
            }
          }
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
          console.log('│');
          console.log('│ ❌ Error:', error.message);
          console.log('└────────────────────────────────────────────────────────────────');
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
        stepCount++;
        console.log(`\n${'━'.repeat(70)}`);
        console.log(`💾 STEP ${stepCount}: Store Insight`);
        console.log('━'.repeat(70));
        console.log(`\n💡 Reason: ${reasoning}\n`);
        console.log('💾 Insight:', insight.substring(0, 100) + (insight.length > 100 ? '...' : ''));
        
        try {
          await db.storeInsight(agentName, insight, { 
            question_id: questionId,
            reasoning 
          });
          console.log('\n✅ Insight stored in agent memory\n');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'store_insight',
            insight: insight.slice(0, 200),
            reasoning
          }).catch(() => {});
          
          return { success: true, message: 'Insight stored successfully' };
        } catch (error: any) {
          console.log('│');
          console.log('│ ❌ Error:', error.message);
          console.log('└────────────────────────────────────────────────────────────────');
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
      description: 'Analyze investigation process and performance - either current or a recent past investigation',
      parameters: z.object({
        search_query: z.string().optional().describe('Optional: search keywords to find a specific past investigation (e.g., "sales drop")'),
        reasoning: z.string().optional().describe('Why you want to analyze this investigation')
      }),
      execute: async ({ search_query, reasoning }) => {
        stepCount++;
        console.log(`\n${'━'.repeat(70)}`);
        console.log(`📈 STEP ${stepCount}: Analyze Investigation Process`);
        console.log('━'.repeat(70));
        if (reasoning) {
          console.log(`\n💡 Reason: ${reasoning}\n`);
        }
        if (search_query) {
          console.log(`🔍 Searching for investigation: "${search_query}"\n`);
        }
        
        try {
          let targetQuestionId = questionId;
          
          // If search query provided, find the most recent matching question
          if (search_query) {
            const recentQuestions = await db.searchRecentQuestions(agentName, search_query, 1);
            if (recentQuestions.length > 0) {
              targetQuestionId = recentQuestions[0].id;
              console.log(`✅ Found: "${recentQuestions[0].question}"\n`);
            } else {
              console.log(`⚠️  No past investigation found matching "${search_query}"\n`);
            }
          }
          
          const stats = await db.analyzeAgentPerformance(targetQuestionId);
          
          console.log('📊 Investigation Details:');
          console.log(`   Question: ${stats.question || 'Current investigation'}`);
          console.log(`   Status: ${stats.status || 'in_progress'}`);
          console.log(`   Total Steps: ${stats.total_steps || 0}`);
          console.log(`   Duration: ${stats.duration_ms || 0}ms`);
          
          if (stats.tools_used && stats.tools_used.length > 0) {
            console.log(`\n🔧 Tools Used:`);
            stats.tools_used.forEach((tool: string) => {
              if (tool) console.log(`   • ${tool}`);
            });
          }
          
          if (stats.tool_usage && stats.tool_usage.length > 0) {
            console.log(`\n📈 Tool Usage:`);
            stats.tool_usage.forEach((item: any) => {
              console.log(`   • ${item.tool_name}: ${item.usage_count}x`);
            });
          }
          console.log('');
          
          await db.storeEvent(questionId, agentName, stepCount, 'action', {
            tool: 'analyze_agent_performance',
            reasoning,
            analyzed_question_id: targetQuestionId
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
              tools_used: stats.tools_used,
              tool_usage_breakdown: stats.tool_usage
            }
          };
        } catch (error: any) {
          console.log('\n❌ Error:', error.message);
          console.log('');
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
      model: openai('gpt-4o') as any,
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
   KEYWORD FORMAT: Use | for OR, & for AND (e.g., "broken|defective|damaged")

3. semantic_search_feedback - Vector similarity search
   USE FOR: Finding conceptually related feedback (not just exact words)
   FEATURES: pgvectorscale DiskANN index for fast similarity
   EXAMPLE: Query "quality issues" → finds "broke", "disappointed", "not worth it"

4. fulltext_search - PostgreSQL full-text search
   USE FOR: Finding specific keywords or terms (when exactness matters)
   FEATURES: Boolean operators (|=OR, &=AND, !=NOT), ranked results
   KEYWORD FORMAT: Use | for OR, & for AND (e.g., "quality&issues" or "broken|damaged")

5. store_insight - Save important findings
   USE WHEN: You discover something significant worth remembering
   ENABLES: Learning across investigations, building knowledge base

6. search_insights - Recall past learnings
   USE WHEN: Current question might relate to past investigations
   ENABLES: Don't repeat work, build on previous findings

7. analyze_agent_performance - Meta-analysis of your investigation
   USE FOR: "How did you figure this out?" questions
   SHOWS: Tools used, queries executed, time spent, investigation process
   IMPORTANT: For meta-analysis questions, ALWAYS provide a search_query to find a recent completed investigation

═══════════════════════════════════════════════════════════════
INVESTIGATION STRATEGY:
═══════════════════════════════════════════════════════════════

Question Type → Approach:

"Why did sales drop?" 
→ 1. Compare meaningful time periods:
     - Yesterday vs day before: CURRENT_DATE-1 vs CURRENT_DATE-2
     - Yesterday vs same day last week: CURRENT_DATE-1 vs CURRENT_DATE-8
     - This week vs last week: CURRENT_DATE-6 to CURRENT_DATE vs CURRENT_DATE-13 to CURRENT_DATE-7
     - NEVER compare 1 day to a whole week! Not meaningful!
→ 2. ALWAYS break down by product: GROUP BY product_name to find culprit
→ 3. Check user feedback for declining products: hybrid_search
→ 4. store_insight (root cause with product details)

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

"How did you figure this out?" / "Show me your investigation process"
→ analyze_agent_performance with search_query for a recent completed investigation
→ Show step-by-step process, tools used, execution flow

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
SQL QUERY CONSTRUCTION - REASON FROM THE SCHEMA:
═══════════════════════════════════════════════════════════════

STEP 1: Analyze the question and identify what data you need
STEP 2: Look at the schema above - what tables and columns are relevant?
STEP 3: Construct SQL queries based on the schema and question

KEY SQL PATTERNS FOR TIME-SERIES ANALYSIS:

1. Comparing Time Periods:
   - Use CASE WHEN to pivot time periods into columns for side-by-side comparison
   - Example pattern: SUM(CASE WHEN date = period1 THEN amount ELSE 0 END) as period1_value
   - ALWAYS use CURRENT_DATE - N for relative dates (today=CURRENT_DATE, yesterday=CURRENT_DATE-1)
   - Compare apples to apples: day-to-day OR week-to-week (not 1 day vs 7 days!)

2. Finding Root Causes:
   - ALWAYS group by product/category to identify which specific items are affected
   - Use ORDER BY to highlight biggest changes first
   - Join with feedback tables to correlate issues

3. Date Math:
   - Yesterday: CURRENT_DATE - 1
   - Same day last week: CURRENT_DATE - 8 (7 days + 1 for yesterday)
   - Last week range: CURRENT_DATE - 13 to CURRENT_DATE - 7
   - Use INTERVAL '7 days' for more complex date ranges

4. Important Rules:
   - NEVER SELECT embedding columns (they're 1536-dimensional vectors!)
   - Group by product/item to identify specifics, not just totals
   - Use descriptive column aliases (yesterday_sales, last_week_sales, change_amount)

═══════════════════════════════════════════════════════════════
RESPONSE STYLE - BE CONCISE AND DIRECT:
═══════════════════════════════════════════════════════════════

✓ Answer questions directly with key facts first
✓ Use bullet points only when listing multiple items
✓ Keep explanations SHORT (2-3 sentences max)
✓ NO unnecessary markdown formatting (###, **, etc.)
✓ NO verbose introductions like "Based on the analysis..." 
✓ NO repeated conclusions or summaries
✓ State findings clearly: "Product X had defects. Sales dropped 87%."

WRONG (too verbose):
"### Analysis Results
Based on my investigation of the database, I discovered that **Premium Wireless Headphones** experienced a significant decline...
### Key Findings:
1. Sales decreased...
### Conclusion:
The investigation revealed..."

RIGHT (concise):
"Premium Wireless Headphones: Sales dropped 87% ($12,959 → $1,730). 
Root cause: 27 customers reported defects (broken, poor quality, static noise).
Action: Address quality control immediately."

═══════════════════════════════════════════════════════════════
INVESTIGATION FLOW:
═══════════════════════════════════════════════════════════════

1. Understand the question
2. Choose the RIGHT tool for each step
3. Execute multiple queries if needed (be thorough!)
4. Analyze results and connect dots
5. Store important insights (use store_insight)
6. State conclusion clearly and concisely

Remember: You have ONE database with ALL these capabilities.
That's the power of Timescale Postgres!`,
      prompt: task,
      maxToolRoundtrips: 5,
      onStepFinish: ({ text }) => {
        if (text) {
          console.log(`\n${'━'.repeat(70)}`);
          console.log('🧠 Agent Thinking');
          console.log('━'.repeat(70));
          console.log('');
          
          // Wrap text to fit nicely with proper word wrapping
          const maxWidth = 68;
          const words = text.split(' ');
          let currentLine = '';
          
          words.forEach(word => {
            if (currentLine.length === 0) {
              currentLine = word;
            } else if ((currentLine + ' ' + word).length <= maxWidth) {
              currentLine += ' ' + word;
            } else {
              console.log(currentLine);
              currentLine = word;
            }
          });
          if (currentLine.length > 0) {
            console.log(currentLine);
          }
          console.log('');
          
          // Store agent thoughts in TimescaleDB hypertable
          db.storeEvent(questionId, agentName, stepCount, 'thought', {
            text: text.slice(0, 500) // Truncate long thoughts
          }).catch(() => {}); // Silent fail
        }
      }
    });

    console.log('\n' + '═'.repeat(70));
    console.log('✅  INVESTIGATION COMPLETE');
    console.log('═'.repeat(70));
    console.log('');
    console.log(result.text);
    console.log('');
    
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

