# 🔌 Connecting to Tiger MCP Server

The demo is currently using a **mocked MCP client**. Here's how to connect it to the real Tiger MCP server.

## Current Status

In `src/mcp-client.ts`, we have:

```typescript
export const mcp = {
  async executeQuery(sql: string, parameters?: any[]): Promise<QueryResult> {
    // TODO: Connect to real MCP Tiger server
    throw new Error('MCP connection not implemented');
  }
}
```

## Option 1: Using MCP Protocol (Recommended)

If you're running this inside an environment that has access to MCP tools (like Cursor with MCP configured):

```typescript
// src/mcp-client.ts
import { config } from './config.js';

// These functions should be provided by your MCP runtime
declare global {
  function mcp_tiger_db_execute_query(params: {
    service_id: string;
    query: string;
    parameters?: any[];
  }): Promise<any>;
}

export const mcp = {
  async executeQuery(sql: string, parameters?: any[]): Promise<QueryResult> {
    const result = await mcp_tiger_db_execute_query({
      service_id: config.serviceId,
      query: sql,
      parameters: parameters
    });
    
    return {
      columns: result.columns || [],
      rows: result.rows || [],
      rows_affected: result.rows_affected || 0,
      execution_time: result.execution_time || '0ms'
    };
  },
  
  // ... other methods using same pattern
};
```

## Option 2: Direct PostgreSQL Connection

If MCP is not available, connect directly to Postgres:

```bash
npm install postgres
```

```typescript
// src/mcp-client.ts
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
});

export const mcp = {
  async executeQuery(query: string, parameters?: any[]): Promise<QueryResult> {
    try {
      const result = await sql.unsafe(query, parameters || []);
      
      return {
        columns: result.columns?.map(c => ({ 
          name: c.name, 
          type: c.type 
        })) || [],
        rows: result.map(row => Object.values(row)),
        rows_affected: result.count || 0,
        execution_time: '0ms'
      };
    } catch (error: any) {
      throw new Error(`Query failed: ${error.message}`);
    }
  },
  
  async storeEvent(agentName: string, eventType: string, content: any) {
    await sql`
      INSERT INTO agent_events (timestamp, agent_name, event_type, content)
      VALUES (NOW(), ${agentName}, ${eventType}, ${sql.json(content)})
    `;
  },
  
  async searchMemory(agentName: string, query: string, limit: number = 5) {
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
  
  async storeMemory(agentName: string, content: string, metadata: any = {}) {
    await sql`
      INSERT INTO agent_memory (agent_name, content, embedding, metadata)
      VALUES (
        ${agentName}, 
        ${content},
        ai.openai_embed('text-embedding-3-small', ${content})::vector,
        ${sql.json(metadata)}
      )
    `;
  }
};
```

## Option 3: HTTP API to MCP Server

If the MCP server is exposed via HTTP:

```bash
npm install node-fetch
```

```typescript
// src/mcp-client.ts
import fetch from 'node-fetch';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000';

export const mcp = {
  async executeQuery(sql: string, parameters?: any[]): Promise<QueryResult> {
    const response = await fetch(`${MCP_SERVER_URL}/mcp/tiger/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: config.serviceId,
        query: sql,
        parameters
      })
    });
    
    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  // ... other methods
};
```

## Testing the Connection

Once you've implemented one of the options above, test it:

```bash
# Run setup
npm run build
npm run setup

# Should create tables and load data
# If successful, you'll see:
# ✓ Schema created
# ✓ Sample data loaded
```

## Recommended Approach

For development:
1. **Option 2 (Direct Postgres)** - Simplest, most reliable
2. Add environment variable: `DATABASE_URL`
3. Works immediately, no MCP setup needed

For production:
1. **Option 1 (MCP Protocol)** - If you're building an MCP-integrated system
2. Keeps abstraction layer
3. Can switch databases without changing agent code

## Next Steps

1. Choose an option above
2. Update `src/mcp-client.ts`
3. Add necessary environment variables
4. Run `npm install` for any new dependencies
5. Test with `npm run setup`
6. Run demo with `npm run dev "test query"`

## Need Help?

The code is simple and well-documented. If you get stuck:
1. Check TypeScript errors: `npm run build`
2. Check environment variables in `.env`
3. Test database connection directly with `psql $DATABASE_URL`
4. Look at the query that's failing in the error message

## What's Next?

Once connected:
- ✅ Agents can query your database
- ✅ Store events in time-series
- ✅ Build vector memory
- ✅ Learn from experience

All in Postgres! 🎉

