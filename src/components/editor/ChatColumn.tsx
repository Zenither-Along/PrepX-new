"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User, Loader2, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatColumnProps {
  columnId: string;
  contextData: any;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatColumn({ columnId, contextData, onClose }: ChatColumnProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`; // Max height approx 4 lines
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          columnId,
          context: contextData,
          webSearch: isWebSearchEnabled
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
      }

      console.log("Response received, reading stream...");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        const assistantId = (Date.now() + 1).toString();
        console.log("Starting to read chunks...");
        
        while (true) {
          const { done, value } = await reader.read();
          console.log("Chunk received:", { done, valueLength: value?.length });
          
          if (done) {
            console.log("Stream complete. Total message:", assistantMessage);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log("Decoded chunk:", chunk);
          
          // Now it's plain text, just append it
          assistantMessage += chunk;

          // Update the assistant message in real-time
          setMessages(prev => {
            const existing = prev.find(m => m.id === assistantId);
            if (existing) {
              return prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantMessage } : m
              );
            } else {
              return [...prev, { id: assistantId, role: "assistant" as const, content: assistantMessage }];
            }
          });
        }
      } else {
        console.error("No reader available");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full w-[350px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 cursor-pointer">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bot className="mb-4 h-12 w-12 opacity-20" />
              <p className="text-sm">Ask me anything about this column!</p>
            </div>
          )}
          
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex w-full gap-2",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted border-border"
                )}
              >
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex w-full gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted border-border">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2">
        <div className="relative flex flex-col rounded-xl border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] w-full resize-none border-0 bg-transparent px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-scrollbar]:hidden"
            style={{ 
              maxHeight: "96px", 
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
            rows={1}
          />
          
          <div className="flex items-center justify-between border-t border-border/50 p-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 cursor-pointer transition-all duration-300 ease-in-out",
                isWebSearchEnabled 
                  ? "bg-primary text-primary-foreground shadow-md scale-105 hover:bg-primary/90 ring-2 ring-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
              title={isWebSearchEnabled ? "Web Search: ON" : "Web Search: OFF"}
            >
              <Globe className={cn("h-4 w-4 transition-transform duration-500", isWebSearchEnabled && "rotate-360")} />
            </Button>
            
            <Button 
              onClick={() => handleSubmit()} 
              size="icon" 
              disabled={isLoading || !input.trim()} 
              className="h-8 w-8 cursor-pointer rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-1 text-center">
           <span className="text-[10px] text-muted-foreground">AI can make mistakes. Check important info.</span>
        </div>
      </div>
    </div>
  );
}
