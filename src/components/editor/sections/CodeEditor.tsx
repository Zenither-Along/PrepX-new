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
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Code</span>
        <Input
          value={content.language || ""}
          onChange={(e) => onChange({ ...content, language: e.target.value })}
          className="w-32 border-none bg-transparent text-xs text-gray-500 text-right focus-visible:ring-0 h-auto p-0"
          placeholder="Language"
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
