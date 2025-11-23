"use client";

import { Textarea } from "@/components/ui/textarea";

interface ParagraphEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function ParagraphEditor({ content, onChange }: ParagraphEditorProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Paragraph</label>
      <Textarea
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
