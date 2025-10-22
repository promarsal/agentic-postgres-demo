// Schema Introspection - Dynamically fetch database schema
import { db } from './db.js';

export interface TableSchema {
  table_name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
  }>;
}

/**
 * Fetch all tables and their columns from the database
 * Uses PostgreSQL's information_schema
 */
export async function getSchemaDescription(): Promise<string> {
  // Get all tables in public schema (excluding system tables)
  const tablesQuery = `
    SELECT 
      table_name,
      obj_description((table_schema||'.'||table_name)::regclass, 'pg_class') as table_comment
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  const columnsQuery = `
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type != 'USER-DEFINED'  -- Exclude vector embeddings (huge!)
    ORDER BY table_name, ordinal_position;
  `;

  try {
    const tables = await db.executeQuery(tablesQuery);
    const columns = await db.executeQuery(columnsQuery);

    // Build schema description
    let schemaDesc = 'Database Schema:\n\n';

    // Group columns by table
    const tableColumns = new Map<string, any[]>();
    for (const col of columns.rows) {
      const tableName = col[0];
      if (!tableColumns.has(tableName)) {
        tableColumns.set(tableName, []);
      }
      tableColumns.get(tableName)!.push({
        name: col[1],
        type: col[2],
        nullable: col[3],
      });
    }

    // Format each table
    for (const table of tables.rows) {
      const tableName = table[0];
      const tableComment = table[1];
      
      schemaDesc += `Table: ${tableName}\n`;
      if (tableComment) {
        schemaDesc += `Description: ${tableComment}\n`;
      }
      
      const cols = tableColumns.get(tableName) || [];
      schemaDesc += 'Columns:\n';
      for (const col of cols) {
        schemaDesc += `  - ${col.name} (${col.type})${col.nullable === 'NO' ? ' NOT NULL' : ''}\n`;
      }
      schemaDesc += '\n';
    }

    return schemaDesc;
  } catch (error: any) {
    console.error('Failed to fetch schema:', error.message);
    // Fallback to hardcoded schema
    return getFallbackSchema();
  }
}

/**
 * Fallback schema if introspection fails
 */
function getFallbackSchema(): string {
  return `Database Schema (fallback):

Table: orders
Columns:
  - order_date (DATE) NOT NULL
  - product_id (INT) NOT NULL
  - product_name (TEXT) NOT NULL
  - amount (DECIMAL) NOT NULL
  - customer_id (INT) NOT NULL

Table: products
Columns:
  - id (INT) NOT NULL
  - name (TEXT) NOT NULL
  - stock_level (INT)
  - price (DECIMAL)
`;
}

/**
 * Get example queries for common patterns
 */
export function getQueryExamples(): string {
  return `
Common Query Patterns:
- Date filtering: WHERE order_date = CURRENT_DATE - 1
- Aggregations: SELECT product_id, SUM(amount) FROM orders GROUP BY product_id
- Joins: SELECT o.*, p.name FROM orders o JOIN products p ON o.product_id = p.id
- Time ranges: WHERE order_date >= CURRENT_DATE - INTERVAL '7 days'
`;
}

