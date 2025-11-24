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
import { AIAssistantColumn } from "@/components/editor/AIAssistantColumn";
import { Sparkles } from "lucide-react";
import { useEditorData } from "./hooks/useEditorData";
import { useEditorSave } from "./hooks/useEditorSave";
import { useColumnHandlers } from "./hooks/useColumnHandlers";
import { useColumnResizer } from "./hooks/useColumnResizer";
import { useItemHandlers } from "./hooks/useItemHandlers";
import { useSectionHandlers } from "./hooks/useSectionHandlers";

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
  const [showAIColumn, setShowAIColumn] = useState(false);

  // Logic Hooks
  const { 
    handleAddColumn, 
    handleUpdateBranchTitle, 
    handleDeleteColumn,
    handleCloseColumn
  } = useColumnHandlers(editorData, editorSave, selectedItems, setSelectedItems);

  const { 
    columnWidths, 
    handleResizeStart 
  } = useColumnResizer(editorData.columns);

  const { 
    handleAddItem, 
    handleItemDelete, 
    handleItemEdit, 
    onSelectItem 
  } = useItemHandlers(editorData, editorSave, selectedItems, setSelectedItems);

  const { 
    handleAddSection, 
    handleUpdateSection, 
    handleDeleteSection, 
    handleSectionReorder 
  } = useSectionHandlers(editorData, editorSave);

  // Initialize root column if missing
  useEffect(() => {
      if (!editorData.loadingData && editorData.columns.length === 0 && editorData.path) {
          handleAddColumn(null, 'branch');
      }
  }, [editorData.loadingData, editorData.columns.length, editorData.path]);

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

  if (editorData.loading) return <div className="flex h-screen items-center justify-center">Loading Editor...</div>;
  if (!editorData.path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Editor Navigation Bar */}
      <header className="flex h-20 flex-col justify-center border-b border-border px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <Button variant="ghost" size="icon" asChild className="hover:bg-accent hover:text-accent-foreground shrink-0">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-border shrink-0" />
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
            <Button
              variant={showAIColumn ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowAIColumn(!showAIColumn)}
              className="ml-2"
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/30">
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
          
          {showAIColumn && (
            <AIAssistantColumn
              width={400}
              onClose={() => setShowAIColumn(false)}
              onExecutePlan={(plan) => {
                console.log("[Execute Plan] Called with:", plan);
                
                if (plan && plan.actions && Array.isArray(plan.actions)) {
                  console.log(`[Execute Plan] Processing ${plan.actions.length} actions`);
                  plan.actions.forEach((action: any, idx: number) => {
                    console.log(`[Action ${idx}] Type:`, action.type, "Data:", action);
                    
                    if (action.type === 'create_item') {
                      const activeCol = editorData.columns[editorData.columns.length - 1];
                      if (activeCol && activeCol.type === 'branch') {
                         const newItem = {
                            id: `ai-item-${Date.now()}-${Math.random()}`,
                            column_id: activeCol.id,
                            title: action.title,
                            order_index: (editorData.items.get(activeCol.id)?.length || 0)
                         };
                         
                         console.log("[Execute Plan] Creating item:", newItem);
                         editorData.setItems((prev: Map<string, any[]>) => {
                            const newMap = new Map(prev);
                            const list = newMap.get(activeCol.id) || [];
                            newMap.set(activeCol.id, [...list, newItem]);
                            return newMap;
                         });
                         editorSave.setNewItems((prev: Set<string>) => new Set(prev).add(newItem.id));
                      } else {
                        console.log("[Execute Plan] Cannot create item - active column:", activeCol);
                      }
                    } else if (action.type === 'create_section') {
                      const activeCol = editorData.columns[editorData.columns.length - 1];
                      if (activeCol && activeCol.type === 'content') {
                          console.log("[Execute Plan] Creating section:", action.sectionType);
                          handleAddSection(activeCol.id, action.sectionType);
                      } else {
                        console.log("[Execute Plan] Cannot create section - active column:", activeCol);
                      }
                    }
                  });
                  editorSave.setHasUnsavedChanges(true);
                } else {
                  console.log("[Execute Plan] Invalid plan structure:", plan);
                }
              }}
              context={{
                pathTitle: editorData.path.title,
                activeColumn: editorData.columns.length > 0 ? {
                  id: editorData.columns[editorData.columns.length - 1].id,
                  title: editorData.columns[editorData.columns.length - 1].title,
                  type: editorData.columns[editorData.columns.length - 1].type as 'branch' | 'content',
                  items: editorData.columns[editorData.columns.length - 1].type === 'branch' 
                    ? editorData.items.get(editorData.columns[editorData.columns.length - 1].id) 
                    : undefined
                } : undefined
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
