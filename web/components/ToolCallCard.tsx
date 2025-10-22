'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Search, Brain, Save, BookOpen } from 'lucide-react';

interface ToolCallCardProps {
  toolName: string;
  args: any;
  result?: any;
  isLoading?: boolean;
}

const toolIcons: Record<string, any> = {
  query_database: Database,
  hybrid_search: Search,
  semantic_search_feedback: Brain,
  store_insight: Save,
  search_insights: BookOpen,
};

const toolColors: Record<string, string> = {
  query_database: 'bg-blue-100 text-blue-800 border-blue-200',
  hybrid_search: 'bg-purple-100 text-purple-800 border-purple-200',
  semantic_search_feedback: 'bg-pink-100 text-pink-800 border-pink-200',
  store_insight: 'bg-green-100 text-green-800 border-green-200',
  search_insights: 'bg-amber-100 text-amber-800 border-amber-200',
};

export function ToolCallCard({ toolName, args, result, isLoading }: ToolCallCardProps) {
  const Icon = toolIcons[toolName] || Database;
  const colorClass = toolColors[toolName] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <Card className={`p-4 my-2 border-l-4 ${colorClass.split(' ')[2]}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm capitalize">
              {toolName.replace(/_/g, ' ')}
            </span>
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                Running...
              </Badge>
            )}
          </div>

          {args.reasoning && (
            <p className="text-sm text-muted-foreground italic">
              {args.reasoning}
            </p>
          )}

          {args.sql && (
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {args.sql}
            </pre>
          )}

          {args.query && (
            <div className="text-xs">
              <span className="font-medium">Query:</span> {args.query}
            </div>
          )}

          {args.keywords && (
            <div className="text-xs">
              <span className="font-medium">Keywords:</span> {args.keywords}
            </div>
          )}

          {result && !isLoading && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              {result.success && (
                <>
                  {result.rows !== undefined && (
                    <div>✓ Found {result.rows} rows</div>
                  )}
                  {result.count !== undefined && (
                    <div>✓ Found {result.count} results</div>
                  )}
                  {result.message && (
                    <div>✓ {result.message}</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

