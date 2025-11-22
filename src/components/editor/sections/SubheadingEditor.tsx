"use client";

import { Textarea } from "@/components/ui/textarea";

interface SubheadingEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function SubheadingEditor({ content, onChange }: SubheadingEditorProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500">Sub-heading</label>
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
        className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 min-h-[40px] py-2 resize-none overflow-hidden"
        placeholder="Enter sub-heading"
        rows={1}
      />
    </div>
  );
}
