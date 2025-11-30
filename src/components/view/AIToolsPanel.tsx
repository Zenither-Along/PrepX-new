import { MessageSquare, Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIToolsPanelProps {
  onClose: () => void;
  onSelectTool: (tool: 'chat' | 'quiz') => void;
}

const AI_TOOLS = [
  {
    id: 'chat' as const,
    icon: MessageSquare,
    title: 'AI Chat',
    description: 'Ask questions and get explanations'
  },
  {
    id: 'quiz' as const,
    icon: Brain,
    title: 'Quiz Generator',
    description: 'Generate practice questions'
  }
];

export function AIToolsPanel({ onClose, onSelectTool }: AIToolsPanelProps) {
  return (
    <div className="w-[400px] flex flex-col border-l border-border bg-card h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">AI Tools</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tools List */}
      <div className="flex-1 p-4 space-y-3">
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="w-full p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{tool.title}</h4>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
