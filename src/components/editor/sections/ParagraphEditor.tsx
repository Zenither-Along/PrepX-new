"use client";

import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";

interface ParagraphEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function ParagraphEditor({ content, onChange }: ParagraphEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize on mount and when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content.text]);

  return (
    <div className="space-y-1">

      <Textarea
        ref={textareaRef}
        value={content.text || ""}
        onChange={(e) => {
          onChange({ ...content, text: e.target.value });
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onFocus={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        className="min-h-[80px] resize-none border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary text-base leading-relaxed p-3 overflow-hidden bg-transparent text-foreground"
        placeholder="Type your paragraph here..."
        rows={1}
      />
    </div>
  );
}
