"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BranchColumn } from "@/components/editor/BranchColumn";
import { DynamicColumn } from "@/components/editor/DynamicColumn";
import { AddColumnPlaceholder } from "@/components/editor/AddColumnPlaceholder";
import { useEditorData } from "./hooks/useEditorData";
import { useEditorSave } from "./hooks/useEditorSave";
import { Column, ColumnItem } from "./types";

export default function EditorPage() {
  const { id } = useParams();
  const { user } = useUser();

  // Use custom hooks
  const editorData = useEditorData(id);
  
  const editorSave = useEditorSave(
    id,
    editorData.path,
    editorData.columns,
    editorData.items,
    editorData.sections,
  );

  const [selectedItems, setSelectedItems] = useState<Map<string, string>>(new Map()); // columnId -> itemId
  const [editingItemId, setEditingItemId] = useState<string | undefined>();

  // Resize state
  const [columnWidths, setColumnWidths] = useState<Map<string, number>>(new Map());
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleAddItem = (columnId: string) => {
      const newItem: ColumnItem = {
          id: `temp-${Date.now()}`,
          column_id: columnId,
          title: "New Item",
          order_index: (editorData.items.get(columnId)?.length || 0)
      };
      
      editorData.setItems(prev => {
          const newMap = new Map(prev);
          const list = newMap.get(columnId) || [];
          newMap.set(columnId, [...list, newItem]);
          return newMap;
      });
      
      editorSave.setNewItems(prev => new Set(prev).add(newItem.id));
      editorSave.setHasUnsavedChanges(true);
  };

  const handleItemDelete = (columnId: string, itemId: string) => {
      editorData.setItems(prev => {
          const newMap = new Map(prev);
          const list = newMap.get(columnId) || [];
          newMap.set(columnId, list.filter(i => i.id !== itemId));
          return newMap;
      });
      
      editorSave.setDeletedItems(prev => new Set(prev).add(itemId));
      editorSave.setHasUnsavedChanges(true);
      
      // If this item was selected, clear selection and truncate columns
      if (selectedItems.get(columnId) === itemId) {
          const newSelected = new Map(selectedItems);
          newSelected.delete(columnId);
          setSelectedItems(newSelected);
          
          const columnIndex = editorData.columns.findIndex(c => c.id === columnId);
          const newColumns = editorData.columns.slice(0, columnIndex + 1);
          editorData.setColumns(newColumns);
      }
  };

  const handleItemEdit = (columnId: string, itemId: string, newTitle: string) => {
      editorData.setItems(prev => {
          const newMap = new Map(prev);
          const list = newMap.get(columnId) || [];
          const idx = list.findIndex(i => i.id === itemId);
          if (idx !== -1) {
              const newList = [...list];
              newList[idx] = { ...newList[idx], title: newTitle };
              newMap.set(columnId, newList);
          }
          return newMap;
      });
      editorSave.setHasUnsavedChanges(true);
  };

  const onSelectItem = async (columnId: string, itemId: string) => {
      setSelectedItems(prev => new Map(prev).set(columnId, itemId));
      
      // Truncate columns after this one
      const columnIndex = editorData.columns.findIndex(c => c.id === columnId);
      const newColumns = editorData.columns.slice(0, columnIndex + 1);
      editorData.setColumns(newColumns);
      
      // Try to fetch child column
      await editorData.fetchChildColumn(itemId);
  };

  const handleAddColumn = (parentItemId: string | null, type: 'branch' | 'dynamic') => {
      // Create a temporary column
      const newColumn: Column = {
          id: `temp-col-${Date.now()}`,
          path_id: editorData.path!.id,
          parent_item_id: parentItemId,
          type: type === 'dynamic' ? 'content' : 'branch', // Map dynamic -> content
          title: type === 'dynamic' ? 'Content' : 'New Branch',
          order_index: 0
      };
      
      editorData.setColumns(prev => [...prev, newColumn]);
      editorSave.setNewColumns(prev => new Set(prev).add(newColumn.id));
      editorSave.setHasUnsavedChanges(true);
      
      // If it's a branch, initialize empty items
      if (newColumn.type === 'branch') {
          editorData.setItems(prev => new Map(prev).set(newColumn.id, []));
      }
  };

  // Initialize root column if missing
  useEffect(() => {
      if (!editorData.loadingData && editorData.columns.length === 0 && editorData.path) {
          handleAddColumn(null, 'branch');
      }
  }, [editorData.loadingData, editorData.columns.length, editorData.path]);

  const handleUpdateBranchTitle = (columnId: string, newTitle: string) =>{
      // Find the column
      const column = editorData.columns.find(c => c.id === columnId);
      if (!column) return;
      
      // If this column has a parent item, update the item's title
      if (column.parent_item_id) {
          // Find which column contains this item
          for (const [colId, items] of editorData.items.entries()) {
              const itemIndex = items.findIndex(item => item.id === column.parent_item_id);
              if (itemIndex !== -1) {
                  const updatedItems = [...items];
                  updatedItems[itemIndex] = { ...updatedItems[itemIndex], title: newTitle };
                  editorData.setItems(prev => new Map(prev).set(colId, updatedItems));
                  break;
              }
          }
      }
      
      // Also update the column title
      const index = editorData.columns.findIndex(c => c.id === columnId);
      if (index !== -1) {
          const newCols = [...editorData.columns];
          newCols[index] = { ...newCols[index], title: newTitle };
          editorData.setColumns(newCols);
      }
      
      editorSave.setHasUnsavedChanges(true);
  };

  // Section Handlers
  const handleAddSection = (columnId: string, type: 'heading' | 'paragraph' | 'image' | 'video' | 'code') => {
      const newSection = {
          id: `temp-${Date.now()}`,
          column_id: columnId,
          type,
          content: type === 'heading' || type === 'paragraph' ? { text: '' } : { url: '' },
          order_index: editorData.sections.filter(s => s.column_id === columnId).length
      };
      
      editorData.setSections(prev => [...prev, newSection]);
      editorSave.setNewSections(prev => new Set(prev).add(newSection.id));
      editorSave.setHasUnsavedChanges(true);
  };

  const handleUpdateSection = (sectionId: string, content: any) => {
      editorData.setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));
      editorSave.setHasUnsavedChanges(true);
  };

  const handleDeleteSection = (sectionId: string) => {
      editorData.setSections(prev => prev.filter(s => s.id !== sectionId));
      editorSave.setDeletedSections(prev => new Set(prev).add(sectionId));
      editorSave.setHasUnsavedChanges(true);
  };

  const handleDeleteColumn = (columnId: string) => {
      // Remove from columns
      editorData.setColumns(prev => prev.filter(c => c.id !== columnId));
      
      // Track for database deletion
      editorSave.setDeletedColumns(prev => new Set(prev).add(columnId));
      editorSave.setHasUnsavedChanges(true);
  };

  const handleSectionReorder = (columnId: string, newSections: any[]) => {
      // Filter out sections not in this column
      const otherSections = editorData.sections.filter(s => s.column_id !== columnId);
      
      // Update order_index for new sections
      const reordered = newSections.map((s, idx) => ({ ...s, order_index: idx }));
      
      editorData.setSections([...otherSections, ...reordered]);
      editorSave.setHasUnsavedChanges(true);
  };


  // Prevent accidental navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editorSave.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editorSave.hasUnsavedChanges]);

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault();
    setResizing({ columnId, startX: e.clientX, startWidth: currentWidth });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = resizing.startWidth + delta;
      
      // Find column to get type for constraints
      const column = editorData.columns.find(c => c.id === resizing.columnId);
      if (!column) return;
      
      // Apply constraints based on column type
      const minWidth = 200;
      const maxWidth = column.type === 'branch' ? 600 : 1200;
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      setColumnWidths(prev => new Map(prev).set(resizing.columnId, constrainedWidth));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, editorData.columns]);


  if (editorData.loading) return <div className="flex h-screen items-center justify-center">Loading Editor...</div>;
  if (!editorData.path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-screen flex-col bg-white text-black">
      {/* Editor Navigation Bar */}
      <header className="flex h-20 flex-col justify-center border-b border-gray-100 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 shrink-0">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-200 shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <input
                type="text"
                value={editorData.path.title}
                onChange={(e) => {
                  editorData.setPath({ ...editorData.path!, title: e.target.value });
                  editorSave.setHasUnsavedChanges(true);
                }}
                className="text-lg font-bold truncate bg-transparent focus:outline-none"
                placeholder="Path Title"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              className="bg-black text-white hover:bg-gray-800"
              onClick={editorSave.handleSave}
              disabled={editorSave.saving}
            >
              {editorSave.saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50">
        <div className="flex h-full gap-4 px-2">
          {/* Render all active columns */}
          {editorData.columns.map((col, index) => {
              const isLast = index === editorData.columns.length - 1;
              const selectedItemId = selectedItems.get(col.id);
              
              if (col.type === 'branch') {
                  // Get the title from parent item if it exists
                  let displayTitle = col.title;
                  if (col.parent_item_id) {
                      for (const [_, items] of editorData.items.entries()) {
                          const parentItem = items.find(item => item.id === col.parent_item_id);
                          if (parentItem) {
                              displayTitle = parentItem.title;
                              break;
                          }
                      }
                  }
                  
                  const width = columnWidths.get(col.id) || 320;

                  return (
                    <div key={col.id} className="relative flex h-full shrink-0" style={{ width: `${width}px` }}>
                        <BranchColumn 
                            title={displayTitle}
                            items={editorData.items.get(col.id) || []}
                            width={width}
                            onTitleChange={(newTitle) => handleUpdateBranchTitle(col.id, newTitle)}
                            onItemAdd={() => handleAddItem(col.id)}
                            onItemSelect={(itemId) => onSelectItem(col.id, itemId)}
                            onItemDelete={(itemId) => handleItemDelete(col.id, itemId)}
                            onItemEdit={(itemId, newTitle) => handleItemEdit(col.id, itemId, newTitle)}
                            selectedItemId={selectedItemId}
                            editingItemId={editingItemId}
                            onEditStart={setEditingItemId}
                            onEditEnd={() => setEditingItemId(undefined)}
                            onDelete={col.parent_item_id ? () => handleDeleteColumn(col.id) : undefined}
                        />
                        {/* Resize handle */}
                        <div
                          className="absolute right-0 top-0 z-10 h-full w-4 cursor-col-resize bg-transparent hover:bg-blue-400/20 transition-colors -mr-2"
                          onMouseDown={(e) => handleResizeStart(e, col.id, width)}
                        />
                        
                        {/* If this is the last column AND an item is selected, show placeholder */}
                        {isLast && selectedItemId && (
                            <div className="absolute left-full top-0 ml-4 h-full">
                                <AddColumnPlaceholder 
                                    onSelectType={(type) => handleAddColumn(selectedItemId, type)}
                                />
                            </div>
                        )}
                    </div>
                  );
              } else if (col.type === 'content') {
                  // Get the title from parent item if it exists
                  let displayTitle = col.title;
                  if (col.parent_item_id) {
                      for (const [_, items] of editorData.items.entries()) {
                          const parentItem = items.find(item => item.id === col.parent_item_id);
                          if (parentItem) {
                              displayTitle = parentItem.title;
                              break;
                          }
                      }
                  }
                  
                  const width = columnWidths.get(col.id) || 1200;

                  return (
                      <div key={col.id} className="relative flex h-full shrink-0" style={{ width: `${width}px` }}>
                          <DynamicColumn 
                              title={displayTitle}
                              sections={editorData.sections.filter(s => s.column_id === col.id)}
                              width={width}
                              onTitleChange={(newTitle) => handleUpdateBranchTitle(col.id, newTitle)}
                              onSectionAdd={(type) => handleAddSection(col.id, type as 'heading' | 'paragraph' | 'image' | 'video' | 'code' | 'subheading')}
                              onSectionChange={handleUpdateSection}
                              onSectionDelete={handleDeleteSection}
                              onSectionReorder={(newSections) => handleSectionReorder(col.id, newSections)}
                              onDelete={() => handleDeleteColumn(col.id)}
                          />
                          {/* Resize handle */}
                          <div
                            className="absolute right-0 top-0 z-10 h-full w-4 cursor-col-resize bg-transparent hover:bg-blue-400/20 transition-colors -mr-2"
                            onMouseDown={(e) => handleResizeStart(e, col.id, width)}
                          />
                      </div>
                  );
              }
              return null;
          })}
        </div>
      </main>
    </div>
  );
}
