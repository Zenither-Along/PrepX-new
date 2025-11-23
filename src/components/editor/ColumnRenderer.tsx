"use client";

import { BranchColumn } from "./BranchColumn";
import { DynamicColumn } from "./DynamicColumn";
import { AddColumnPlaceholder } from "./AddColumnPlaceholder";

export interface ColumnNode {
  id: string;
  type: 'branch' | 'dynamic';
  title: string;
  items: any[];
  sections?: any[]; // For dynamic columns
  children: Map<string, ColumnNode>; // itemId -> child column
}

interface ColumnRendererProps {
  node: ColumnNode;
  selectedPath: string[];
  onItemSelect: (itemId: string) => void;
  onItemAdd: () => void;
  onItemEdit: (itemId: string, newTitle: string) => void;
  onItemDelete: (itemId: string) => void;
  onSectionAdd?: () => void;
  onSectionChange?: (id: string, content: any) => void;
  onSectionDelete?: (id: string) => void;
  onSectionReorder?: (sections: any[]) => void;
  onTitleChange?: (title: string) => void;
  onColumnCreate?: (itemId: string, type: 'branch' | 'dynamic') => void;
  onColumnDelete?: () => void;
  editingItemId?: string;
  onEditStart?: (itemId: string) => void;
  onEditEnd?: () => void;
  isRoot?: boolean;
  width?: number;
}

export function ColumnRenderer({
  node,
  selectedPath,
  onItemSelect,
  onItemAdd,
  onItemEdit,
  onItemDelete,
  onSectionAdd,
  onSectionChange,
  onSectionDelete,
  onSectionReorder,
  onTitleChange,
  onColumnCreate,
  onColumnDelete,
  editingItemId,
  onEditStart,
  onEditEnd,
  isRoot = false,
  width = 320, // Default width
}: ColumnRendererProps) {
  const selectedItemId = selectedPath[0];
  const childNode = selectedItemId ? node.children.get(selectedItemId) : null;
  const remainingPath = selectedPath.slice(1);

  return (
    <>
      {/* Render current column */}
      {node.type === 'branch' && (
        <BranchColumn
          title={node.title}
          items={node.items}
          width={width}
          onTitleChange={onTitleChange || (() => {})}
          onItemAdd={onItemAdd}
          onItemSelect={onItemSelect}
          onItemDelete={onItemDelete}
          onItemEdit={onItemEdit}
          selectedItemId={selectedItemId}
          editingItemId={editingItemId}
          onEditStart={onEditStart}
          onEditEnd={onEditEnd}
          onDelete={isRoot ? undefined : onColumnDelete}
        />
      )}

      {node.type === 'dynamic' && onSectionAdd && onSectionChange && onSectionDelete && onSectionReorder && (
        <DynamicColumn
          title={node.title}
          sections={node.sections || []}
          width={width} // Use the passed width or default
          onSectionAdd={onSectionAdd}
          onSectionChange={onSectionChange}
          onSectionDelete={onSectionDelete}
          onSectionReorder={onSectionReorder}
        />
      )}

      {/* Recursively render child column if it exists */}
      {childNode && remainingPath.length >= 0 && (
        <ColumnRenderer
          node={childNode}
          selectedPath={remainingPath}
          onItemSelect={(id) => {
            // Propagate selection up with full path
            onItemSelect(id);
          }}
          onItemAdd={() => {
            // Handle add item in child column
            // This will be passed from parent
          }}
          onItemEdit={(id, title) => {
            // Handle edit in child
          }}
          onItemDelete={(id) => {
            // Handle delete in child
          }}
          onSectionAdd={onSectionAdd}
          onSectionChange={onSectionChange}
          onSectionDelete={onSectionDelete}
          onSectionReorder={onSectionReorder}
          onColumnCreate={onColumnCreate}
          onColumnDelete={() => {
            // Delete this child column
            if (onColumnDelete) onColumnDelete();
          }}
          editingItemId={editingItemId}
          onEditStart={onEditStart}
          onEditEnd={onEditEnd}
        />
      )}

      {/* Show placeholder if item selected but no child column (and current is branch, not dynamic) */}
      {selectedItemId && !childNode && node.type === 'branch' && onColumnCreate && (
        <AddColumnPlaceholder
          onSelectType={(type) => onColumnCreate(selectedItemId, type)}
        />
      )}
    </>
  );
}
