"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentSection } from "./ContentSection";

interface SortableContentSectionProps {
  id: string;
  type: string;
  content: any;
  onChange: (content: any) => void;
  onDelete: () => void;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
}

export function SortableContentSection({ 
  id, 
  isSelected = false,
  isEditing = false,
  onSelect,
  onEdit,
  ...props 
}: SortableContentSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: !isSelected, // Only enable drag when selected
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...(isSelected ? { ...attributes, ...listeners } : {})}
    >
      <ContentSection 
        id={id} 
        {...props} 
        isSelected={isSelected}
        isEditing={isEditing}
        onSelect={onSelect}
        onEdit={onEdit}
      />
    </div>
  );
}
