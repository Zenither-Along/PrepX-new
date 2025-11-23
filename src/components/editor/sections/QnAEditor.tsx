"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QnAEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function QnAEditor({ content, onChange }: QnAEditorProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-3 p-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <span className="text-base">●</span>
          <label className="text-sm font-semibold text-foreground">Question?</label>
        </div>
        <Input
          value={content.question || ""}
          onChange={(e) => onChange({ ...content, question: e.target.value })}
          className="border-border text-sm bg-transparent text-foreground"
          placeholder="Enter question"
        />
      </div>
      
      {isOpen && (
        <div className="space-y-1 ml-6">
          <div className="flex items-center gap-2">
            <span className="text-sm">^</span>
            <label className="text-sm font-medium text-muted-foreground">Ans.</label>
          </div>
          <Textarea
            value={content.answer || ""}
            onChange={(e) => {
              onChange({ ...content, answer: e.target.value });
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onFocus={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className="resize-none border-gray-200 text-sm overflow-hidden"
            placeholder="Enter answer"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
