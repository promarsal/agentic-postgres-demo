# 🔧 Adding Custom Tools

It's super easy to add new capabilities to your agents. Here's how:

## Example 1: Add a "Notify" Tool

Let agents send notifications when they find issues:

```typescript
// In src/agent.ts, add to agentTools:

notify_team: {
  description: 'Send notification to the team about important findings',
  parameters: z.object({
    severity: z.enum(['info', 'warning', 'critical']),
    message: z.string(),
    details: z.string().optional()
  }),
  execute: async ({ severity, message, details }) => {
    console.log(`🔔 Notification [${severity}]:`, message);
    
    // Could integrate with:
    // - Slack API
    // - Email
    // - PagerDuty
    // - etc.
    
    // For now, just store in database
    await mcp.executeQuery(
      `INSERT INTO notifications (severity, message, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [severity, message, details || null]
    );
    
    return { success: true, notified: true };
  }
}
```

Now agents can notify you:

```bash
npm run dev "Check for critical errors and notify team if found"
```

## Example 2: Add a "Forecast" Tool

Let agents predict trends using TimescaleDB:

```typescript
forecast_metric: {
  description: 'Forecast future values of a metric using time-series analysis',
  parameters: z.object({
    table: z.string(),
    metric: z.string(),
    periods: z.number().describe('Number of periods to forecast')
  }),
  execute: async ({ table, metric, periods }) => {
    const sql = `
      SELECT 
        toolkit_experimental.predict_linear(
          time_bucket('1 day', timestamp),
          ${metric}
        ) as forecast
      FROM ${table}
      WHERE timestamp > NOW() - INTERVAL '30 days'
      GROUP BY time_bucket('1 day', timestamp)
      LIMIT ${periods}
    `;
    
    const result = await mcp.executeQuery(sql);
    return { 
      success: true, 
      forecast: result.rows 
    };
  }
}
```

Usage:

```bash
npm run dev "Forecast revenue for next 7 days"
```

## Example 3: Add an "Analyze Schema" Tool

Let agents understand your database structure:

```typescript
analyze_schema: {
  description: 'Get information about database tables and columns',
  parameters: z.object({
    table: z.string().optional()
  }),
  execute: async ({ table }) => {
    let sql;
    
    if (table) {
      // Get columns for specific table
      sql = `
        SELECT 
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `;
    } else {
      // List all tables
      sql = `
        SELECT 
          table_name,
          table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
    }
    
    const result = await mcp.executeQuery(sql, table ? [table] : []);
    return { 
      success: true, 
      schema: result.rows 
    };
  }
}
```

Usage:

```bash
npm run dev "What tables exist in the database?"
npm run dev "Show me the schema for the orders table"
```

## Example 4: Add a "Compare Timeframes" Tool

```typescript
compare_timeframes: {
  description: 'Compare metrics between two time periods',
  parameters: z.object({
    metric: z.string(),
    table: z.string(),
    period1_start: z.string(),
    period1_end: z.string(),
    period2_start: z.string(),
    period2_end: z.string()
  }),
  execute: async (params) => {
    const sql = `
      WITH period1 AS (
        SELECT SUM(${params.metric}) as value
        FROM ${params.table}
        WHERE timestamp BETWEEN $1 AND $2
      ),
      period2 AS (
        SELECT SUM(${params.metric}) as value
        FROM ${params.table}
        WHERE timestamp BETWEEN $3 AND $4
      )
      SELECT 
        p1.value as period1_value,
        p2.value as period2_value,
        ((p2.value - p1.value) / p1.value * 100) as change_percent
      FROM period1 p1, period2 p2
    `;
    
    const result = await mcp.executeQuery(sql, [
      params.period1_start,
      params.period1_end,
      params.period2_start,
      params.period2_end
    ]);
    
    return { 
      success: true, 
      comparison: result.rows[0] 
    };
  }
}
```

## Example 5: Add Vector Similarity Search

```typescript
find_similar_records: {
  description: 'Find records similar to a given text query',
  parameters: z.object({
    query: z.string(),
    table: z.string(),
    column: z.string(),
    limit: z.number().default(10)
  }),
  execute: async ({ query, table, column, limit }) => {
    const sql = `
      SELECT *,
        1 - (${column} <=> ai.openai_embed('text-embedding-3-small', $1)::vector) as similarity
      FROM ${table}
      WHERE ${column} IS NOT NULL
      ORDER BY similarity DESC
      LIMIT $2
    `;
    
    const result = await mcp.executeQuery(sql, [query, limit]);
    return { 
      success: true, 
      similar: result.rows 
    };
  }
}
```

Usage:

```bash
npm run dev "Find products similar to 'high-performance electronics'"
```

## Pattern: Every Tool is Just a Function

```typescript
my_tool: {
  description: 'What the tool does (shown to AI)',
  parameters: z.object({
    // Define inputs with Zod
  }),
  execute: async (params) => {
    // Do whatever you want:
    // - Query database (via MCP)
    // - Call external APIs
    // - Run calculations
    // - Send messages
    // - etc.
    
    return { 
      success: true, 
      data: result 
    };
  }
}
```

## Best Practices

1. **Clear descriptions** - AI needs to understand when to use the tool
2. **Type-safe parameters** - Use Zod schemas
3. **Error handling** - Return `{ success: false, error: message }`
4. **Meaningful names** - `query_database` not `qdb`
5. **Return structured data** - JSON objects, not strings

## Advanced: Tool That Creates Tools

```typescript
create_aggregation: {
  description: 'Create a custom aggregation query',
  parameters: z.object({
    table: z.string(),
    groupBy: z.string(),
    metrics: z.array(z.string())
  }),
  execute: async ({ table, groupBy, metrics }) => {
    const metricsSql = metrics.map(m => `SUM(${m}) as total_${m}`).join(', ');
    
    const sql = `
      SELECT 
        ${groupBy},
        ${metricsSql}
      FROM ${table}
      GROUP BY ${groupBy}
      ORDER BY total_${metrics[0]} DESC
    `;
    
    const result = await mcp.executeQuery(sql);
    return { 
      success: true, 
      aggregation: result.rows 
    };
  }
}
```

The agent can now create custom aggregations on the fly!

## Next Steps

1. Add a tool to `src/agent.ts`
2. Run `npm run build`
3. Test it: `npm run dev "use the new tool"`
4. Agent will automatically discover and use it!

That's it! 🚀

