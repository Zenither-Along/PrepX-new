"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface HeadingEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function HeadingEditor({ content, onChange }: HeadingEditorProps) {
  return (
    <div className="space-y-1">

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
        className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0 min-h-[40px] py-1 resize-none overflow-hidden"
        placeholder="Enter heading"
        rows={1}
      />
    </div>
  );
}
