"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";

interface CodeEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function CodeEditor({ content, onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize on mount and when code changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content.code]);

  return (
    <div className="rounded-lg bg-gray-900 p-4">
      <div className="mb-2 flex justify-between">
        <Input
          value={content.language || ""}
          onChange={(e) => onChange({ ...content, language: e.target.value })}
          className="w-32 border-none bg-transparent text-xs text-gray-400 focus-visible:ring-0"
          placeholder="javascript"
        />
      </div>
      <Textarea
        ref={textareaRef}
        value={content.code || ""}
        onChange={(e) => {
          onChange({ ...content, code: e.target.value });
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onFocus={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        className="font-mono text-sm text-gray-100 bg-transparent border-none focus-visible:ring-0 p-0 min-h-[100px] overflow-hidden resize-none"
        placeholder="// Type your code here..."
        rows={1}
      />
    </div>
  );
}
