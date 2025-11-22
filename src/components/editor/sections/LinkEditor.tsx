"use client";

import { Input } from "@/components/ui/input";

interface LinkEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function LinkEditor({ content, onChange }: LinkEditorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">Link Text</label>
      <div className="space-y-2">
        <Input
          placeholder="Link Title"
          value={content.title || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="border-gray-200"
        />
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://example.com"
            value={content.url || ""}
            onChange={(e) => onChange({ ...content, url: e.target.value })}
            className="border-gray-200 font-mono text-sm text-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
