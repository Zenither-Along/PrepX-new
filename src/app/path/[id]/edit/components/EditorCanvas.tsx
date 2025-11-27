"use client";
import { useColumnHandlers } from "../hooks/useColumnHandlers";
import { useItemHandlers } from "../hooks/useItemHandlers";
import { useSectionHandlers } from "../hooks/useSectionHandlers";
import { BranchColumn } from "@/components/editor/BranchColumn";
import { DynamicColumn } from "@/components/editor/DynamicColumn";
import { AddColumnPlaceholder } from "@/components/editor/AddColumnPlaceholder";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, GitBranch, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";

export function EditorCanvas({
  editorData,
  editorSave,
  selectedItems,
  setSelectedItems,
  editingItemId,
  setEditingItemId,
  columnWidths,
  handleResizeStart,
  children,
  showAIColumn,
  // Mobile navigation props (optional, default to desktop behavior)
  isMobile = false,
  activeColumnIndex = 0,
  setActiveColumnIndex = () => {},
  goBackColumn = () => {},
}: any) {
  // Detect mobile viewport if not provided via props
  const [autoIsMobile, setAutoIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setAutoIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const mobile = isMobile || autoIsMobile;

  // Handlers from custom hooks
  const { handleAddColumn, handleDeleteColumn, handleUpdateBranchTitle } =
    useColumnHandlers(editorData, editorSave, selectedItems, setSelectedItems, mobile ? goBackColumn : undefined);

  const { handleAddItem, handleItemDelete, handleItemEdit, onSelectItem } =
    useItemHandlers(editorData, editorSave, selectedItems, setSelectedItems);

  const { handleAddSection, handleUpdateSection, handleDeleteSection, handleSectionReorder } =
    useSectionHandlers(editorData, editorSave);

  const columns = editorData.columns;

  // State for mobile item expansion (creation options)
  const [expandedCreationItemId, setExpandedCreationItemId] = useState<string | null>(null);

  // Mobile: render a branch column as a full‑screen view
  const renderMobileBranch = (col: any, index: number) => {
    let title = col.title;
    if (col.parent_item_id) {
      for (const [, cItems] of editorData.items.entries()) {
        const parentItem = cItems.find((i: any) => i.id === col.parent_item_id);
        if (parentItem) { title = parentItem.title; break; }
      }
    }
    const selectedItemId = selectedItems.get(col.id);
    return (
      <div className="flex flex-col h-full bg-muted/30">
        <div className="p-3 border-b border-border flex items-center gap-2">
          {activeColumnIndex > 0 && (
            <Button variant="ghost" size="icon" onClick={goBackColumn} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-xl font-bold flex-1">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {(editorData.items.get(col.id) || []).map((item: any) => {
              const isExpanded = expandedCreationItemId === item.id;
              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    onClick={async () => {
                      const childColumn = await onSelectItem(col.id, item.id);
                      if (childColumn) {
                        setActiveColumnIndex(index + 1);
                        setExpandedCreationItemId(null);
                      } else {
                        setExpandedCreationItemId(isExpanded ? null : item.id);
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-4 text-left text-base font-medium transition-colors touch-target",
                      selectedItemId === item.id
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isExpanded ? "rounded-t-lg" : "rounded-lg"
                    )}
                  >
                    {item.title}
                  </button>
                  {isExpanded && (
                    <div className="p-3 bg-background/50 border border-t-0 border-border rounded-b-lg flex gap-2 animate-in slide-in-from-top-2">
                      <Button 
                        onClick={() => {
                          handleAddColumn(item.id, 'branch');
                          setActiveColumnIndex(index + 1);
                          setExpandedCreationItemId(null);
                        }} 
                        variant="secondary"
                        className="flex-1 gap-2 h-12"
                      >
                        <GitBranch className="h-4 w-4" />
                        Branch
                      </Button>
                      <Button 
                        onClick={() => {
                          handleAddColumn(item.id, 'dynamic');
                          setActiveColumnIndex(index + 1);
                          setExpandedCreationItemId(null);
                        }} 
                        variant="secondary"
                        className="flex-1 gap-2 h-12"
                      >
                        <FileText className="h-4 w-4" />
                        Content
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            <button 
              onClick={() => handleAddItem(col.id)} 
              className="w-full flex items-center justify-center py-3 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors touch-target shadow-sm mt-4"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile: render a content column as a full‑screen view
  const renderMobileContent = (col: any, index: number) => {
    let title = col.title;
    if (col.parent_item_id) {
      for (const [, cItems] of editorData.items.entries()) {
        const found = cItems.find((i: any) => i.id === col.parent_item_id);
        if (found) { title = found.title; break; }
      }
    }
    const colSections = editorData.sections.filter((s: any) => s.column_id === col.id);
    
    return (
      <DynamicColumn
        title={title}
        sections={colSections}
        width={window.innerWidth}
        fullScreen={true}
        onTitleChange={(newTitle) => handleUpdateBranchTitle(col.id, newTitle)}
        onSectionAdd={(type) => handleAddSection(col.id, type as any)}
        onSectionChange={handleUpdateSection}
        onSectionDelete={handleDeleteSection}
        onSectionReorder={(newSections) => handleSectionReorder(col.id, newSections)}
        onDelete={() => handleDeleteColumn(col.id)}
        onBack={activeColumnIndex > 0 ? goBackColumn : undefined}
      />
    );
  };

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Mobile single‑column view */}
      {mobile && (
        <div className="flex-1 overflow-y-auto md:hidden">
          {columns[activeColumnIndex] && (() => {
            const col = columns[activeColumnIndex];
            if (col.type === "branch") return renderMobileBranch(col, activeColumnIndex);
            if (col.type === "content") return renderMobileContent(col, activeColumnIndex);
            return null;
          })()}
        </div>
      )}

      {/* Desktop horizontal layout */}
      {!mobile && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden gap-[5px] hidden md:flex">
          {columns.map((col: any, index: number) => {
            const isLast = index === editorData.columns.length - 1;
            const selectedItemId = selectedItems.get(col.id);
            if (col.type === "branch") {
              let displayTitle = col.title;
              if (col.parent_item_id) {
                for (const [, items] of editorData.items.entries()) {
                  const parentItem = items.find((i: any) => i.id === col.parent_item_id);
                  if (parentItem) { displayTitle = parentItem.title; break; }
                }
              }
              const width = columnWidths.get(col.id) || 320;
              return (
                <div key={col.id} className="relative flex shrink-0 border-x border-border" style={{ width: `${width}px` }}>
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
                  <div
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize bg-transparent hover:bg-blue-400/20 transition-colors -mr-2"
                    onMouseDown={(e) => handleResizeStart(e, col.id, width)}
                  />
                  {isLast && selectedItemId && !showAIColumn && (
                    <div className="absolute left-full top-0 ml-4 h-full">
                      <AddColumnPlaceholder onSelectType={(type) => handleAddColumn(selectedItemId, type)} />
                    </div>
                  )}
                </div>
              );
            } else if (col.type === "content") {
              let displayTitle = col.title;
              if (col.parent_item_id) {
                for (const [, items] of editorData.items.entries()) {
                  const parentItem = items.find((i: any) => i.id === col.parent_item_id);
                  if (parentItem) { displayTitle = parentItem.title; break; }
                }
              }
              const colSections = editorData.sections.filter((s: any) => s.column_id === col.id);
              const width = columnWidths.get(col.id) || 1200;
              return (
                <div key={col.id} className="relative flex shrink-0 border-x border-border" style={{ width: `${width}px` }}>
                  <DynamicColumn
                    title={displayTitle}
                    sections={colSections}
                    width={width}
                    onTitleChange={(newTitle) => handleUpdateBranchTitle(col.id, newTitle)}
                    onSectionAdd={(type) => handleAddSection(col.id, type as any)}
                    onSectionChange={handleUpdateSection}
                    onSectionDelete={handleDeleteSection}
                    onSectionReorder={(newSections) => handleSectionReorder(col.id, newSections)}
                    onDelete={() => handleDeleteColumn(col.id)}
                  />
                  <div
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-400 transition-colors"
                    onMouseDown={(e) => handleResizeStart(e, col.id, width)}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
      
      {/* AI Assistant Panel (rendered as a child) */}
      {children}
    </main>
  );
}
