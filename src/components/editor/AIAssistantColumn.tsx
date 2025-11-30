"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantColumnProps {
  width: number;
  onClose: () => void;
  onExecutePlan: (plan: any) => void;
  context: {
    pathTitle: string;
    activeColumn?: {
      id: string;
      title: string;
      type: 'branch' | 'content';
      items?: any[];
      sections?: any[];
    };
  };
  isMobile?: boolean;
  editingSection?: any;
  onSectionEdit?: (newContent: any) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  plan?: any;
}

export function AIAssistantColumn({
  width,
  onClose,
  onExecutePlan,
  context,
  isMobile = false,
  editingSection,
 onSectionEdit
}: AIAssistantColumnProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: editingSection 
        ? `I'm ready to help you edit this **${editingSection.type}** section. Please tell me what you'd like to change or improve.`
        : `Hi! I'm your AI assistant. I can help you create learning paths and content.
      
Currently viewing: **${context.activeColumn ? context.activeColumn.title : context.pathTitle}**

What would you like to create?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Filter out the initial welcome message - Gemini requires first message to be from user
      const conversationMessages = [...messages, { role: 'user', content: userMessage }].filter((msg, idx, arr) => {
        // Keep all user messages
        if (msg.role === 'user') return true;
        // Keep assistant messages only if they're not the first message
        return idx > 0;
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          context: context,
          jsonMode: !editingSection, // Only use JSON mode for creating new content, not editing
          editingSection: editingSection || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      // Handle section editing mode - expects plain text response
      if (editingSection) {
        const editedContent = await response.text();

        // Call the onSectionEdit callback with edited content
        if (onSectionEdit) {
          // Format the content based on section type
          let formattedContent;
          if (editingSection.type === 'rich-text') {
            formattedContent = { html: editedContent };
          } else if (editingSection.type === 'code') {
            formattedContent = { code: editedContent, language: editingSection.content.language || 'javascript' };
          } else if (editingSection.type === 'table') {
            // Expect JSON with a 'data' field (2D array)
            try {
              const parsed = JSON.parse(editedContent);
              formattedContent = { data: parsed.data };
            } catch (e) {
              // Fallback: treat as raw data string (unlikely)
              formattedContent = { data: [] };
            }
          } else if (editingSection.type === 'list') {
            // Expect JSON array of strings
            try {
              const parsed = JSON.parse(editedContent);
              formattedContent = { items: Array.isArray(parsed) ? parsed : [] };
            } catch (e) {
              formattedContent = { items: [] };
            }
          } else {
            // Try to parse as JSON for other types (image, video, link, etc.)
            try {
              formattedContent = JSON.parse(editedContent);
            } catch (e) {
              formattedContent = editedContent;
            }
          }
          onSectionEdit(formattedContent);
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I've updated the section content. The changes have been applied."
        }]);
        return;
      }

      // Normal mode - expects JSON response
      const data = await response.json();
      
      // Parse the response if it's a string (sometimes Gemini returns stringified JSON)
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse JSON string:", e);
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: parsedData.message || "Here is the plan you requested.",
        plan: parsedData.plan
      }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col border-r border-border bg-card shadow-sm transition-all",
        isMobile ? "fixed inset-0 z-50 w-full h-[100dvh]" : "h-full shrink-0"
      )}
      style={!isMobile ? { width: `${width}px` } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-primary/5">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col gap-2 max-w-[90%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className={cn(
                  "rounded-lg px-4 py-2 text-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Plan Review Card */}
                {msg.plan && (
                  <div className="w-full rounded-lg border border-border bg-background p-3 text-sm">
                    <div className="mb-2 font-semibold">Proposed Plan:</div>
                    <ul className="mb-3 list-disc pl-4 space-y-1 text-muted-foreground">
                      {msg.plan.actions.map((action: any, idx: number) => (
                        <li key={idx}>
                          {action.type === 'create_item' && `Create item: "${action.title}"`}
                          {action.type === 'create_section' && `Create section: ${action.sectionType}`}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => onExecutePlan(msg.plan)}
                      >
                        <Check className="h-3 w-3" />
                        Approve & Execute
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 pb-safe">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI to create content..."
            className="min-h-[80px] resize-none pr-12"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
