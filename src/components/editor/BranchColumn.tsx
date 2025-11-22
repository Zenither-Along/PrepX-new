"use client";

import { Plus, Trash2, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BranchItem {
  id: string;
  title: string;
}

interface BranchColumnProps {
  title: string;
  items: BranchItem[];
  width: number;
  onTitleChange: (title: string) => void;
  onItemAdd: () => void;
  onItemSelect: (id: string) => void;
  onItemDelete?: (id: string) => void;
  onItemEdit?: (id: string, newTitle: string) => void;
  selectedItemId?: string;
  editingItemId?: string;
  onEditStart?: (id: string) => void;
  onEditEnd?: () => void;
  onDelete?: () => void; // Delete entire column
}

export function BranchColumn({
  title,
  items,
  width,
  onTitleChange,
  onItemAdd,
  onItemSelect,
  onItemDelete,
  onItemEdit,
  selectedItemId,
  editingItemId,
  onEditStart,
  onEditEnd,
  onDelete,
}: BranchColumnProps) {
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickedId, setLastClickedId] = useState<string | undefined>();
  const [editValue, setEditValue] = useState<string>("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItemId && editInputRef.current) {
      const item = items.find(i => i.id === editingItemId);
      if (item) {
        setEditValue(item.title);
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }
  }, [editingItemId, items]);

  const handleItemClick = (itemId: string) => {
    const now = Date.now();
    
    if (lastClickedId === itemId && now - lastClickTime < 300) {
      // Double tap detected
      onEditStart?.(itemId);
    } else {
      // Single tap
      onItemSelect(itemId);
    }
    
    setLastClickedId(itemId);
    setLastClickTime(now);
  };

  const handleEditComplete = () => {
    if (editingItemId && onItemEdit) {
      onItemEdit(editingItemId, editValue);
    }
    onEditEnd?.();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      onEditEnd?.();
    }
  };

  return (
    <div 
      className="flex h-full shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-75"
      style={{ width: `${width}px` }}
    >
      <div className="p-4 pb-2 flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="flex-1 bg-transparent text-lg font-bold placeholder-gray-300 focus:outline-none"
          placeholder="Branch Title"
        />
        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-red-600" 
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative flex items-center justify-between rounded-lg border-2 px-4 py-3 transition-all",
                selectedItemId === item.id
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              {editingItemId === item.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleEditComplete}
                  onKeyDown={handleEditKeyDown}
                  className="flex-1 bg-transparent text-sm font-medium text-black focus:outline-none"
                />
              ) : (
                <span 
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "flex-1 text-sm font-medium cursor-pointer",
                    selectedItemId === item.id ? "text-blue-900" : "text-gray-700"
                  )}
                >
                  {item.title}
                </span>
              )}
              
              {onItemDelete && editingItemId !== item.id && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemDelete(item.id);
                  }}
                  className="h-7 w-7 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {/* Add Item button */}
          <button
            onClick={onItemAdd}
            className="flex h-14 w-full items-center justify-center rounded-3xl border-2 border-gray-300/80 bg-gray-50 text-gray-500 transition-all hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
