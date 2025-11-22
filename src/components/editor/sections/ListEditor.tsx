"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ListEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function ListEditor({ content, onChange }: ListEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">List</label>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => onChange({ ...content, listType: 'unordered' })}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              (!content.listType || content.listType === 'unordered') 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            Bullet
          </button>
          <button
            onClick={() => onChange({ ...content, listType: 'ordered' })}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              content.listType === 'ordered' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            Numbered
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {(content.items || []).map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            {content.listType === 'ordered' ? (
              <span className="text-sm font-medium text-gray-500 w-5 text-right shrink-0">
                {index + 1}.
              </span>
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0 mx-1.5" />
            )}
            <Input
              value={item}
              onChange={(e) => {
                const newItems = [...(content.items || [])];
                newItems[index] = e.target.value;
                onChange({ ...content, items: newItems });
              }}
              className="border-none shadow-none px-0 focus-visible:ring-0 h-auto py-1 text-sm"
              placeholder="List item"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => {
                const newItems = content.items.filter((_: any, i: number) => i !== index);
                onChange({ ...content, items: newItems });
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <button
          className="text-sm text-gray-500 hover:text-gray-700 pl-4"
          onClick={() => onChange({ ...content, items: [...(content.items || []), ""] })}
        >
          + Add item
        </button>
      </div>
    </div>
  );
}
