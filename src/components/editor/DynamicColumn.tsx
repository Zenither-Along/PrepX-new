"use client";

import { useState, useRef, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  MouseSensor,
  TouchSensor,
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, MoreVertical, Trash2, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableContentSection } from "./SortableContentSection";
import { SectionPalette } from "./SectionPalette";

interface DynamicColumnProps {
  title: string;
  sections: any[];
  width: number;
  onTitleChange?: (newTitle: string) => void;
  onSectionAdd: (type: string) => void;
  onSectionChange: (sectionId: string, content: string) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionReorder: (newSections: any[]) => void;
  onDelete?: () => void;
  onClose?: () => void;
  onBack?: () => void;
  headerActions?: React.ReactNode;
  fullScreen?: boolean; // For mobile full-screen mode
}

export function DynamicColumn({
  title,
  sections,
  width,
  onTitleChange,
  onSectionAdd,
  onSectionChange,
  onSectionDelete,
  onSectionReorder,
  onDelete,
  onClose,
  onBack,
  headerActions,
  fullScreen = false
}: DynamicColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      onSectionReorder(arrayMove(sections, oldIndex, newIndex));
    }
  }

  return (
    <div 
      ref={columnRef}
      className={cn(
        "flex h-full shrink-0 flex-col bg-card transition-all duration-75",
        fullScreen ? "w-full" : "rounded-xl border border-border shadow-sm"
      )}
      style={fullScreen ? undefined : { width: `${width}px` }}
    >
      <div className="flex items-center justify-between border-b border-border p-4 gap-2">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="flex-1 bg-transparent text-lg font-bold placeholder-muted-foreground focus:outline-none min-w-0"
          placeholder="Content Title"
        />
        <div className="flex items-center gap-2 shrink-0">
          {headerActions}
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


        <div 
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden no-scrollbar",
            fullScreen ? "p-3 space-y-2 pb-24" : "p-6 space-y-3 pb-24"
          )}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <p>No content yet.</p>
                  <p className="text-sm">Click "Add Section" to start writing.</p>
                </div>
              ) : (
                sections.map((section) => (
                  <SortableContentSection
                    key={section.id}
                    id={section.id}
                    type={section.type}
                    content={section.content}
                    onChange={(newContent) => onSectionChange(section.id, newContent)}
                    onDelete={() => onSectionDelete(section.id)}
                  />
                ))
              )}
            </SortableContext>
          </DndContext>
        </div>

        {/* Fixed bottom section for Add Section button */}
        <div className={cn(
          "flex items-center justify-end border-t border-border bg-card z-20",
          fullScreen ? "fixed bottom-0 left-0 right-0 h-14 px-3" : "sticky bottom-0 h-16 px-4 z-10"
        )}>
          <SectionPalette onSelect={onSectionAdd}>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </SectionPalette>
        </div>
    </div>
  );
}
