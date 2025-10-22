'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolCallCard } from './ToolCallCard';
import { Send, Bot, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    maxSteps: 10,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const exampleQuestions = [
    "Sales dropped yesterday compared to last week - why?",
    "What are customers saying about Premium Wireless Headphones?",
    "Are other products showing similar quality issues?",
    "Based on what we've learned, what should I do immediately?"
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Agentic Postgres Detective</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered database investigation agent
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Ask me anything about your business data</h2>
                <p className="text-muted-foreground">
                  I can query databases, search feedback, and find patterns using semantic search
                </p>
              </div>
              
              <div className="grid gap-2 max-w-2xl mx-auto">
                <p className="text-sm font-medium text-muted-foreground">Try these examples:</p>
                {exampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const syntheticEvent = {
                        preventDefault: () => {},
                      } as React.FormEvent<HTMLFormElement>;
                      handleInputChange({ target: { value: q } } as React.ChangeEvent<HTMLInputElement>);
                      setTimeout(() => handleSubmit(syntheticEvent), 100);
                    }}
                    className="text-left p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors text-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex-1 max-w-3xl space-y-2 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                {message.role === 'user' ? (
                  <Card className="p-4 bg-primary text-primary-foreground">
                    <p className="text-sm">{message.content}</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {/* Tool Calls */}
                    {message.toolInvocations?.map((toolCall: any) => (
                      <ToolCallCard
                        key={toolCall.toolCallId}
                        toolName={toolCall.toolName}
                        args={toolCall.args}
                        result={toolCall.result}
                        isLoading={toolCall.state === 'call'}
                      />
                    ))}

                    {/* Assistant Response */}
                    {message.content && (
                      <Card className="p-4 prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </AvatarFallback>
              </Avatar>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Thinking...
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question about your business data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by PostgreSQL + TimescaleDB + pgvector + pgvectorscale
          </p>
        </div>
      </div>
    </div>
  );
}

