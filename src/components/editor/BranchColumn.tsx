"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, MoreVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BranchColumnProps {
  title: string;
  items: any[];
  width: number;
  onTitleChange: (newTitle: string) => void;
  onItemAdd: () => void;
  onItemSelect: (itemId: string) => void;
  onItemDelete?: (itemId: string) => void;
  onItemEdit?: (itemId: string, newTitle: string) => void;
  selectedItemId?: string;
  editingItemId?: string;
  onEditStart?: (itemId: string) => void;
  onEditEnd?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
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
  onClose
}: BranchColumnProps) {
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Double click detection
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  useEffect(() => {
    if (editingItemId) {
      const item = items.find(i => i.id === editingItemId);
      if (item) setEditValue(item.title);
      setTimeout(() => editInputRef.current?.focus(), 0);
    }
  }, [editingItemId, items]);

  const handleItemClick = (itemId: string) => {
    const now = Date.now();
    if (lastClickedId === itemId && now - lastClickTime < 300) {
      // Double click
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
      className="flex h-full shrink-0 flex-col rounded-xl border border-border bg-card shadow-sm transition-all duration-75"
      style={{ width: `${width}px` }}
    >
      <div className="p-4 pb-2 flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="flex-1 bg-transparent text-lg font-bold placeholder-muted-foreground focus:outline-none"
          placeholder="Branch Title"
        />
        <div className="flex items-center gap-2">
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 cursor-pointer">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer" 
                  onClick={onDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onClose && (
             <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 cursor-pointer" onClick={onClose}>
               <X className="h-4 w-4" />
             </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative flex items-center justify-between rounded-lg border-2 px-4 py-3 transition-all",
                selectedItemId === item.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
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
                  className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none"
                />
              ) : (
                <span 
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "flex-1 text-sm font-medium cursor-pointer",
                    selectedItemId === item.id ? "text-primary" : "text-foreground"
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
            className="flex h-14 w-full items-center justify-center rounded-3xl border-2 border-border bg-muted/50 text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
