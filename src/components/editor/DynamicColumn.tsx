"use client";

import { Plus, MoreVertical, Trash2 } from "lucide-react";
import { SectionPalette } from "./SectionPalette";
import { ContentSection } from "./ContentSection";
import { Button } from "@/components/ui/button";
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
  onSectionAdd: (type: string) => void;
  onSectionChange: (id: string, content: any) => void;
  onSectionDelete: (id: string) => void;
  onSectionReorder: (sections: any[]) => void;
  onDelete?: () => void; // Delete entire column
}

export function DynamicColumn({
  title,
  sections,
  onSectionAdd,
  onSectionChange,
  onSectionDelete,
  onSectionReorder,
  onDelete,
}: DynamicColumnProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
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
    <div className="flex h-full w-[520px] shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-lg font-bold text-black">{title}</h2>
        <div className="flex items-center gap-2">
          <SectionPalette onSelect={onSectionAdd}>
            <Button size="sm" className="bg-black text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </SectionPalette>
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

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
