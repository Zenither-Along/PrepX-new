"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, Bot, User, Loader2, Globe, Lightbulb, RefreshCw, BookOpen, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

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

type TeachingMode = "socratic" | "eli5" | "expert" | "quiz";

const TEACHING_MODES = [
  { value: "socratic", label: "🤔 Socratic", description: "Guiding questions" },
  { value: "eli5", label: "👶 ELI5", description: "Simple explanations" },
  { value: "expert", label: "🎓 Expert", description: "Technical depth" },
  { value: "quiz", label: "❓ Quiz Me", description: "Practice questions" },
] as const;

const TypingIndicator = () => (
  <div className="flex space-x-1 items-center p-2">
    <motion.div
      className="w-1.5 h-1.5 bg-primary/40 rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-1.5 h-1.5 bg-primary/40 rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-1.5 h-1.5 bg-primary/40 rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

const EmptyState = ({ topic, onSelect }: { topic: string; onSelect: (text: string) => void }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center px-6 h-full">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <Sparkles className="h-8 w-8 text-primary" />
    </div>
    <h3 className="font-semibold text-lg mb-2">AI Study Buddy</h3>
    <p className="text-sm text-muted-foreground mb-6">
      I'm here to help you master <strong>{topic}</strong>. Choose a teaching mode and ask me anything!
    </p>
    <div className="grid gap-2 w-full max-w-xs text-xs text-muted-foreground">
      <button 
        onClick={() => onSelect("Explain this concept simply")}
        className="bg-muted/50 p-2 rounded border border-border/50 hover:bg-muted hover:text-foreground transition-colors text-left"
      >
        "Explain this concept simply"
      </button>
      <button 
        onClick={() => onSelect("Give me a real-world example")}
        className="bg-muted/50 p-2 rounded border border-border/50 hover:bg-muted hover:text-foreground transition-colors text-left"
      >
        "Give me a real-world example"
      </button>
      <button 
        onClick={() => onSelect("Quiz me on what I just read")}
        className="bg-muted/50 p-2 rounded border border-border/50 hover:bg-muted hover:text-foreground transition-colors text-left"
      >
        "Quiz me on what I just read"
      </button>
    </div>
  </div>
);

export function ChatColumn({ columnId, contextData, onClose }: ChatColumnProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [teachingMode, setTeachingMode] = useState<TeachingMode>("socratic");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract topic from context if available
  const topic = contextData?.title || "this content";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
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
          webSearch: isWebSearchEnabled,
          teachingMode
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        const assistantId = (Date.now() + 1).toString();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

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

  const handleQuickAction = async (action: string, messageContent: string) => {
    const actionPrompts: Record<string, string> = {
      simplify: "Please explain the previous response in simpler terms, using basic language that's easier to understand.",
      example: "Can you provide a concrete, practical example to illustrate the previous explanation?",
      deeper: "Can you expand on the previous response with more technical details and depth?"
    };

    const actionMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: actionPrompts[action],
    };

    setMessages(prev => [...prev, actionMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, actionMessage].map(m => ({ role: m.role, content: m.content })),
          columnId,
          context: contextData,
          webSearch: isWebSearchEnabled,
          teachingMode
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        const assistantId = (Date.now() + 1).toString();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

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
      }
    } catch (error) {
      console.error("Quick action error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-[400px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">AI Study Buddy</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 cursor-pointer hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Teaching Mode Selector */}
        <div className="px-4 pb-3">
          <Select value={teachingMode} onValueChange={(value) => setTeachingMode(value as TeachingMode)}>
            <SelectTrigger className="w-full h-8 text-xs bg-muted/50 border-border/50 focus:ring-1 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEACHING_MODES.map(mode => (
                <SelectItem key={mode.value} value={mode.value} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{mode.label.split(' ')[0]}</span>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{mode.label.split(' ').slice(1).join(' ')}</span>
                      <span className="text-[10px] text-muted-foreground">{mode.description}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <EmptyState 
              topic={topic} 
              onSelect={(text) => {
                setInput(text);
                // We need to wait for state update, but handleSubmit uses current state
                // So we'll call a modified version or just set input and let user press enter
                // Better: create a function that takes text directly
                const userMessage: Message = {
                  id: Date.now().toString(),
                  role: "user",
                  content: text,
                };
                setMessages(prev => [...prev, userMessage]);
                setIsLoading(true);
                
                // Call API directly
                (async () => {
                  try {
                    const response = await fetch("/api/chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        messages: [userMessage].map(m => ({ role: m.role, content: m.content })),
                        columnId,
                        context: contextData,
                        webSearch: isWebSearchEnabled,
                        teachingMode
                      }),
                    });

                    if (!response.ok) throw new Error("Failed to get response");

                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();
                    let assistantMessage = "";

                    if (reader) {
                      const assistantId = (Date.now() + 1).toString();
                      while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        assistantMessage += chunk;
                        setMessages(prev => {
                          const existing = prev.find(m => m.id === assistantId);
                          if (existing) {
                            return prev.map(m => m.id === assistantId ? { ...m, content: assistantMessage } : m);
                          } else {
                            return [...prev, { id: assistantId, role: "assistant" as const, content: assistantMessage }];
                          }
                        });
                      }
                    }
                  } catch (error) {
                    console.error("Chat error:", error);
                  } finally {
                    setIsLoading(false);
                  }
                })();
              }} 
            />
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div
                  className={cn(
                    "flex w-full gap-3",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
                      m.role === "user" 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background border-border"
                    )}
                  >
                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted/50 text-foreground border border-border/50 rounded-tl-sm"
                    )}
                  >
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/50 prose-pre:border prose-pre:border-border/50">
                        <ReactMarkdown 
                          components={{
                            code({node, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || '')
                              return match ? (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="bg-muted-foreground/20 rounded px-1 py-0.5 text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              )
                            }
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Action Buttons (only for assistant messages) */}
                {m.role === "assistant" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-2 ml-11 flex-wrap"
                  >
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px] px-2 bg-background/50 hover:bg-background border-border/50"
                      onClick={() => handleQuickAction("simplify", m.content)}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5 opacity-70" />
                      Simplify
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px] px-2 bg-background/50 hover:bg-background border-border/50"
                      onClick={() => handleQuickAction("example", m.content)}
                      disabled={isLoading}
                    >
                      <Lightbulb className="h-3 w-3 mr-1.5 opacity-70" />
                      Example
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px] px-2 bg-background/50 hover:bg-background border-border/50"
                      onClick={() => handleQuickAction("deeper", m.content)}
                      disabled={isLoading}
                    >
                      <BookOpen className="h-3 w-3 mr-1.5 opacity-70" />
                      Go Deeper
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background border-border shadow-sm">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center rounded-2xl bg-muted/50 px-4 py-2 border border-border/50 rounded-tl-sm">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2 bg-card">
        <div className="relative flex flex-col rounded-xl border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="min-h-[44px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-scrollbar]:hidden"
            style={{ 
              maxHeight: "120px", 
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
            rows={1}
          />
          
          <div className="flex items-center justify-between border-t border-border/50 p-2 bg-muted/10 rounded-b-xl">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 cursor-pointer transition-all duration-300 ease-in-out rounded-lg",
                isWebSearchEnabled 
                  ? "bg-primary/10 text-primary hover:bg-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
              className={cn(
                "h-8 w-8 cursor-pointer rounded-lg transition-all duration-200",
                input.trim() ? "opacity-100 scale-100" : "opacity-50 scale-95"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2 text-center">
           <span className="text-[10px] text-muted-foreground/70">AI can make mistakes. Check important info.</span>
        </div>
      </div>
    </div>
  );
}
