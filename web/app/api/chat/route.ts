import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Get the last user message as the question
  const question = messages[messages.length - 1]?.content || '';
  
  // Create question tracking
  const questionId = await db.createQuestion('detective', question);
  const startTime = Date.now();
  let stepCount = 0;

  // Define tools with closure over questionId and stepCount
  const tools = {
    query_database: {
      description: 'Execute SQL queries to analyze structured data (orders, products, etc.)',
      inputSchema: z.object({
        sql: z.string().describe('The SQL query to execute'),
        reasoning: z.string().describe('Why this query is needed for the investigation')
      }),
      execute: async ({ sql, reasoning }: { sql: string; reasoning: string }) => {
        stepCount++;
        try {
          await db.storeEvent(questionId, 'detective', stepCount, 'action', {
            tool: 'query_database',
            reasoning,
            sql
          });
          
          const result = await db.executeQuery(sql);
          return {
            success: true,
            rows: result.rows?.length || 0,
            data: result.rows?.slice(0, 5) || [], // Return first 5 rows
            reasoning
          };
        } catch (error: any) {
          await db.storeEvent(questionId, 'detective', stepCount, 'error', {
            tool: 'query_database',
            error: error.message
          });
          throw error;
        }
      }
    },

    hybrid_search: {
      description: 'Search user feedback using BOTH keyword matching AND semantic similarity (best for comprehensive results)',
      inputSchema: z.object({
        query: z.string().describe('Semantic search query'),
        keywords: z.string().describe('Keywords for full-text search'),
        reasoning: z.string().describe('Why hybrid search is needed')
      }),
      execute: async ({ query, keywords, reasoning }: { query: string; keywords: string; reasoning: string }) => {
        stepCount++;
        try {
          await db.storeEvent(questionId, 'detective', stepCount, 'action', {
            tool: 'hybrid_search',
            reasoning,
            query,
            keywords
          });
          
          const results = await db.hybridSearchFeedback(query, keywords);
          return {
            success: true,
            count: results.length,
            results: results.slice(0, 10),
            reasoning
          };
        } catch (error: any) {
          await db.storeEvent(questionId, 'detective', stepCount, 'error', {
            tool: 'hybrid_search',
            error: error.message
          });
          throw error;
        }
      }
    },

    semantic_search_feedback: {
      description: 'Search user feedback using semantic similarity (finds related concepts, not just exact words)',
      inputSchema: z.object({
        query: z.string().describe('What to search for semantically'),
        reasoning: z.string().describe('Why semantic search is appropriate here')
      }),
      execute: async ({ query, reasoning }: { query: string; reasoning: string }) => {
        stepCount++;
        try {
          await db.storeEvent(questionId, 'detective', stepCount, 'action', {
            tool: 'semantic_search_feedback',
            reasoning,
            query
          });
          
          const results = await db.semanticSearchFeedback(query);
          return {
            success: true,
            count: results.length,
            results: results.slice(0, 10),
            reasoning
          };
        } catch (error: any) {
          await db.storeEvent(questionId, 'detective', stepCount, 'error', {
            tool: 'semantic_search_feedback',
            error: error.message
          });
          throw error;
        }
      }
    },

    store_insight: {
      description: 'Store an important finding or insight for future reference',
      inputSchema: z.object({
        insight: z.string().describe('The insight to store'),
        reasoning: z.string().describe('Why this insight is important')
      }),
      execute: async ({ insight, reasoning }: { insight: string; reasoning: string }) => {
        stepCount++;
        try {
          await db.storeEvent(questionId, 'detective', stepCount, 'action', {
            tool: 'store_insight',
            reasoning,
            insight
          });
          
          await db.storeInsight('detective', insight, { reasoning });
          return {
            success: true,
            message: 'Insight stored successfully',
            reasoning
          };
        } catch (error: any) {
          await db.storeEvent(questionId, 'detective', stepCount, 'error', {
            tool: 'store_insight',
            error: error.message
          });
          throw error;
        }
      }
    },

    search_insights: {
      description: 'Search your previous findings and learnings from past investigations',
      inputSchema: z.object({
        query: z.string().describe('What past insights to search for'),
        reasoning: z.string().describe('Why you need past insights')
      }),
      execute: async ({ query, reasoning }: { query: string; reasoning: string }) => {
        stepCount++;
        try {
          await db.storeEvent(questionId, 'detective', stepCount, 'action', {
            tool: 'search_insights',
            reasoning,
            query
          });
          
          const results = await db.searchInsights('detective', query);
          return {
            success: true,
            count: results.length,
            insights: results,
            reasoning
          };
        } catch (error: any) {
          await db.storeEvent(questionId, 'detective', stepCount, 'error', {
            tool: 'search_insights',
            error: error.message
          });
          throw error;
        }
      }
    }
  };

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools,
    system: `You are an expert database detective investigating business problems.
You have access to ONE powerful PostgreSQL database with multiple capabilities.

Your investigation tools:
1. query_database - SQL queries for structured data
2. hybrid_search - Combines FTS + Vector search (best for feedback)
3. semantic_search_feedback - Pure vector similarity
4. store_insight - Save important findings
5. search_insights - Recall past learnings

Investigation strategy:
- Start with SQL to understand the data
- Use hybrid_search for comprehensive feedback analysis
- Use semantic_search for pattern discovery
- Store key insights as you find them
- Search past insights to build on previous knowledge

Be thorough but concise. Show your reasoning for each step.`,
    onFinish: async ({ text }) => {
      const duration = Date.now() - startTime;
      await db.completeQuestion(
        questionId,
        text,
        stepCount,
        duration,
        'completed'
      );
    }
  });

  return result.toTextStreamResponse();
}

