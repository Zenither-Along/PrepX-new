"use client";

import { Plus, MoreVertical, Trash2 } from "lucide-react";
import { SectionPalette } from "./SectionPalette";
import { ContentSection } from "./ContentSection";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableContentSection } from "./SortableContentSection";

interface DynamicColumnProps {
  title: string;
  sections: any[];
  width: number;
  onTitleChange?: (title: string) => void;
  onSectionAdd: (type: string) => void;
  onSectionChange: (id: string, content: any) => void;
  onSectionDelete: (id: string) => void;
  onSectionReorder: (sections: any[]) => void;
  onDelete?: () => void; // Delete entire column
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
}: DynamicColumnProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Only activate drag if section is selected
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnRef.current && !columnRef.current.contains(event.target as Node)) {
        setSelectedSectionId(null);
        setEditingSectionId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      className="flex h-full shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-75"
      style={{ width: `${width}px` }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="flex-1 bg-transparent text-lg font-bold placeholder-gray-300 focus:outline-none"
          placeholder="Content Title"
        />
        <div className="flex items-center gap-2">
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
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
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
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
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
                  isSelected={selectedSectionId === section.id}
                  isEditing={editingSectionId === section.id}
                  onSelect={() => {
                    setSelectedSectionId(section.id);
                    setEditingSectionId(null);
                  }}
                  onEdit={() => {
                    setEditingSectionId(section.id);
                    setSelectedSectionId(null);
                  }}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>

      {/* Fixed bottom section for Add Section button */}
      <div className="flex h-16 items-center justify-end border-t border-gray-100 px-4">
        <SectionPalette onSelect={onSectionAdd}>
          <Button size="sm" className="bg-black text-white hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </SectionPalette>
      </div>
    </div>
  );
}
