"use client";

import { Plus, GitBranch, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddColumnPlaceholderProps {
  onSelectType: (type: 'branch' | 'dynamic') => void;
}

export function AddColumnPlaceholder({ onSelectType }: AddColumnPlaceholderProps) {
  return (
    <div className="flex h-full w-[120px] shrink-0 flex-col items-center justify-center border-x border-gray-200">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-300 bg-white text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 cursor-pointer">
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-2" align="center">
          <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">
            Add a new column
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectType('branch')}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer"
            >
              <GitBranch className="h-4 w-4" />
              <span className="font-medium">Branch</span>
            </button>
            <button
              onClick={() => onSelectType('dynamic')}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Content</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

