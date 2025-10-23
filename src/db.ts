// Database Client - Direct TigerData Connection
// Uses postgres.js for direct PostgreSQL connection
import postgres from 'postgres';
import { config } from './config.js';

interface QueryResult {
  columns: Array<{ name: string; type: string }>;
  rows: any[][];
  rows_affected: number;
  execution_time: string;
}

// Direct connection to TigerData PostgreSQL
const sql = postgres(config.databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Database client - direct access to TigerData features
export const db = {
  async executeQuery(query: string, parameters?: any[]): Promise<QueryResult> {
    try {
      const startTime = Date.now();
      const result = await sql.unsafe(query, parameters || []);
      const executionTime = `${Date.now() - startTime}ms`;
      
      // Convert to our QueryResult format
      return {
        columns: result.columns?.map(c => ({ 
          name: c.name, 
          type: c.type?.toString() || 'unknown'
        })) || [],
        rows: result.map(row => Object.values(row)),
        rows_affected: result.count || 0,
        execution_time: executionTime
      };
    } catch (error: any) {
      throw new Error(`Query failed: ${error.message}`);
    }
  },
  
  // Create a new question/investigation
  async createQuestion(agentName: string, question: string): Promise<string> {
    const result = await sql`
      INSERT INTO agent_questions (question, agent_name, status, started_at)
      VALUES (${question}, ${agentName}, 'in_progress', NOW())
      RETURNING id
    `;
    return result[0].id;
  },
  
  // Update question when completed
  async completeQuestion(questionId: string, finalAnswer: string, totalSteps: number, durationMs: number, status: 'completed' | 'failed'): Promise<void> {
    await sql`
      UPDATE agent_questions
      SET status = ${status},
          final_answer = ${finalAnswer},
          total_steps = ${totalSteps},
          completed_at = NOW(),
          duration_ms = ${durationMs}
      WHERE id = ${questionId}
    `;
  },
  
  // Store event with question tracking and step order
  async storeEvent(questionId: string, agentName: string, stepOrder: number, eventType: string, content: any): Promise<void> {
    await sql`
      INSERT INTO agent_events (timestamp, question_id, agent_name, step_order, event_type, content)
      VALUES (NOW(), ${questionId}, ${agentName}, ${stepOrder}, ${eventType}, ${sql.json(content)})
    `;
  },
  
  // Get all events for a specific question in order
  async getQuestionEvents(questionId: string): Promise<any[]> {
    const result = await sql`
      SELECT timestamp, step_order, event_type, content, metadata
      FROM agent_events
      WHERE question_id = ${questionId}
      ORDER BY step_order ASC
    `;
    return result;
  },
  
  // Get question details with summary
  async getQuestion(questionId: string): Promise<any> {
    const result = await sql`
      SELECT 
        q.*,
        (SELECT COUNT(*) FROM agent_events WHERE question_id = q.id) as total_events,
        (SELECT COUNT(*) FROM agent_events WHERE question_id = q.id AND event_type = 'error') as error_count
      FROM agent_questions q
      WHERE q.id = ${questionId}
    `;
    return result[0];
  },
  
  // Search recent questions by text
  async searchRecentQuestions(agentName: string, searchText: string, limit: number = 5): Promise<any[]> {
    const result = await sql`
      SELECT id, question, status, started_at, completed_at, total_steps
      FROM agent_questions
      WHERE agent_name = ${agentName}
        AND question ILIKE ${'%' + searchText + '%'}
        AND status = 'completed'
      ORDER BY started_at DESC
      LIMIT ${limit}
    `;
    return result;
  },
  
  // Semantic search using TigerData's vector search (pgvectorscale)  
  async searchMemory(agentName: string, query: string, limit: number = 5): Promise<any[]> {
    // Showcase: TigerData runs embeddings INSIDE Postgres using ai.openai_embed()
    const result = await sql`
      SELECT content, metadata,
             1 - (embedding <=> ai.openai_embed('text-embedding-3-small', ${query})::vector) as similarity
      FROM agent_memory
      WHERE agent_name = ${agentName}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
    return result;
  },
  
  // Store memories with embeddings generated IN THE DATABASE
  async storeMemory(agentName: string, content: string, metadata: any = {}): Promise<void> {
    // Showcase: TigerData generates embeddings IN Postgres, no external API calls needed
    await sql`
      INSERT INTO agent_memory (agent_name, content, embedding, metadata)
      VALUES (
        ${agentName}, 
        ${content},
        ai.openai_embed('text-embedding-3-small', ${content})::vector,
        ${sql.json(metadata)}
      )
    `;
  },
  
  // === NEW SEARCH FUNCTIONS FOR DEMO ===
  
  // Semantic search on user feedback (pgvectorscale)
  async semanticSearchFeedback(query: string, limit: number = 10): Promise<any[]> {
    // Note: Using client-side embeddings since pgai.openai_embed requires configuration
    // In production with pgai: ai.openai_embed('text-embedding-3-small', ${query})::vector
    const { embed } = await import('ai');
    const { openai } = await import('@ai-sdk/openai');
    
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query
    });
    
    const vectorStr = `[${embedding.join(',')}]`;
    
    const result = await sql`
      SELECT 
        id,
        customer_id,
        feedback_text,
        product_referenced,
        sentiment,
        created_at,
        1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM user_feedback
      WHERE embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
    return result;
  },
  
  // Full-text search on user feedback (PostgreSQL FTS)
  async fulltextSearchFeedback(searchTerms: string, limit: number = 10): Promise<any[]> {
    // Use websearch_to_tsquery for natural language handling (handles phrases and operators)
    // This automatically handles spaces, quotes, and operators properly
    const result = await sql`
      SELECT 
        id,
        customer_id,
        feedback_text,
        product_referenced,
        sentiment,
        created_at,
        ts_rank(
          to_tsvector('english', feedback_text),
          websearch_to_tsquery('english', ${searchTerms})
        ) as rank
      FROM user_feedback
      WHERE to_tsvector('english', feedback_text) @@ websearch_to_tsquery('english', ${searchTerms})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;
    return result;
  },
  
  // Hybrid search: Combine FTS + semantic (Reciprocal Rank Fusion)
  async hybridSearchFeedback(query: string, keywords: string, limit: number = 15): Promise<any[]> {
    // Generate embedding for semantic search
    const { embed } = await import('ai');
    const { openai } = await import('@ai-sdk/openai');
    
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query
    });
    
    const vectorStr = `[${embedding.join(',')}]`;
    
    // RRF (Reciprocal Rank Fusion) hybrid search
    // Use websearch_to_tsquery for natural language handling
    const result = await sql`
      WITH semantic_search AS (
        SELECT 
          id,
          customer_id,
          feedback_text,
          product_referenced,
          sentiment,
          created_at,
          1 - (embedding <=> ${vectorStr}::vector) as similarity,
          ROW_NUMBER() OVER (ORDER BY embedding <=> ${vectorStr}::vector) as rank
        FROM user_feedback
        WHERE embedding IS NOT NULL
      ),
      fulltext_search AS (
        SELECT 
          id,
          ts_rank(
            to_tsvector('english', feedback_text),
            websearch_to_tsquery('english', ${keywords})
          ) as fts_rank,
          ROW_NUMBER() OVER (ORDER BY ts_rank(
            to_tsvector('english', feedback_text),
            websearch_to_tsquery('english', ${keywords})
          ) DESC) as rank
        FROM user_feedback
        WHERE to_tsvector('english', feedback_text) @@ websearch_to_tsquery('english', ${keywords})
      ),
      combined AS (
        SELECT 
          COALESCE(s.id, f.id) as id,
          s.customer_id,
          s.feedback_text,
          s.product_referenced,
          s.sentiment,
          s.created_at,
          s.similarity,
          f.fts_rank,
          -- RRF score: sum of 1/(rank+60) for each search type
          (COALESCE(1.0 / (s.rank + 60), 0) + COALESCE(1.0 / (f.rank + 60), 0)) as rrf_score,
          CASE 
            WHEN s.id IS NOT NULL AND f.id IS NOT NULL THEN 'both'
            WHEN s.id IS NOT NULL THEN 'semantic_only'
            ELSE 'fulltext_only'
          END as match_type
        FROM semantic_search s
        FULL OUTER JOIN fulltext_search f ON s.id = f.id
      )
      SELECT 
        id,
        customer_id,
        feedback_text,
        product_referenced,
        sentiment,
        created_at,
        ROUND(COALESCE(similarity, 0)::numeric, 3) as similarity,
        ROUND(COALESCE(fts_rank, 0)::numeric, 3) as fts_rank,
        ROUND(rrf_score::numeric, 4) as relevance_score,
        match_type
      FROM combined
      ORDER BY rrf_score DESC
      LIMIT ${limit}
    `;
    return result;
  },
  
  // Search agent insights/memory
  async searchInsights(agentName: string, query: string, limit: number = 5): Promise<any[]> {
    // Same as searchMemory but returns more structured data
    const { embed } = await import('ai');
    const { openai } = await import('@ai-sdk/openai');
    
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query
    });
    
    const vectorStr = `[${embedding.join(',')}]`;
    
    const result = await sql`
      SELECT 
        content,
        metadata,
        created_at,
        1 - (embedding <=> ${vectorStr}::vector) as relevance
      FROM agent_memory
      WHERE agent_name = ${agentName}
        AND embedding IS NOT NULL
      ORDER BY relevance DESC, created_at DESC
      LIMIT ${limit}
    `;
    return result;
  },
  
  // Store insight with embedding (for agent learning)
  async storeInsight(agentName: string, insight: string, metadata: any = {}): Promise<void> {
    // Generate embedding client-side (in production, use pgai)
    const { embed } = await import('ai');
    const { openai } = await import('@ai-sdk/openai');
    
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: insight
    });
    
    const vectorStr = `[${embedding.join(',')}]`;
    
    await sql`
      INSERT INTO agent_memory (agent_name, content, embedding, metadata)
      VALUES (
        ${agentName},
        ${insight},
        ${vectorStr}::vector,
        ${sql.json(metadata)}
      )
    `;
  },
  
  // Analyze agent performance (observability)
  async analyzeAgentPerformance(questionId?: string, hours: number = 24): Promise<any> {
    if (questionId) {
      // Get stats for specific question
      const result = await sql`
        SELECT 
          q.question,
          q.status,
          q.total_steps,
          q.duration_ms,
          COUNT(e.*) as total_events,
          COUNT(e.*) FILTER (WHERE e.event_type = 'action') as actions_executed,
          COUNT(e.*) FILTER (WHERE e.event_type = 'thought') as reasoning_steps,
          COUNT(e.*) FILTER (WHERE e.event_type = 'error') as errors,
          json_agg(DISTINCT e.content->>'tool') FILTER (WHERE e.content->>'tool' IS NOT NULL) as tools_used
        FROM agent_questions q
        LEFT JOIN agent_events e ON e.question_id = q.id
        WHERE q.id = ${questionId}
        GROUP BY q.id, q.question, q.status, q.total_steps, q.duration_ms
      `;
      
      // Get tool usage counts separately
      const toolStats = await sql`
        SELECT 
          e.content->>'tool' as tool_name,
          COUNT(*) as usage_count
        FROM agent_events e
        WHERE e.question_id = ${questionId}
          AND e.content->>'tool' IS NOT NULL
        GROUP BY e.content->>'tool'
        ORDER BY usage_count DESC
      `;
      
      const mainResult = result[0];
      if (mainResult) {
        mainResult.tool_usage = toolStats;
      }
      return mainResult;
    } else {
      // Get overall stats for time period
      const result = await sql`
        SELECT 
          COUNT(DISTINCT q.id) as total_questions,
          AVG(q.duration_ms)::int as avg_duration_ms,
          AVG(q.total_steps)::int as avg_steps,
          COUNT(*) FILTER (WHERE q.status = 'completed') as completed,
          COUNT(*) FILTER (WHERE q.status = 'failed') as failed
        FROM agent_questions q
        WHERE q.started_at > NOW() - INTERVAL '1 day' * ${hours / 24}
      `;
      
      // Get error count separately
      const errorResult = await sql`
        SELECT COUNT(*) as total_errors
        FROM agent_events e
        JOIN agent_questions q ON e.question_id = q.id
        WHERE e.event_type = 'error'
          AND q.started_at > NOW() - INTERVAL '1 day' * ${hours / 24}
      `;
      
      const mainResult = result[0];
      if (mainResult && errorResult[0]) {
        mainResult.total_errors = errorResult[0].total_errors;
      }
      return mainResult;
    }
  }
};

