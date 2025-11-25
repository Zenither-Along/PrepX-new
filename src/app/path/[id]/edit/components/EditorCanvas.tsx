"use client";
import { useColumnHandlers } from "../hooks/useColumnHandlers";
import { useItemHandlers } from "../hooks/useItemHandlers";
import { useSectionHandlers } from "../hooks/useSectionHandlers";
import { BranchColumn } from "@/components/editor/BranchColumn";
import { DynamicColumn } from "@/components/editor/DynamicColumn";
import { AddColumnPlaceholder } from "@/components/editor/AddColumnPlaceholder";

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
  showAIColumn
}: any) {

  const {
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateBranchTitle,
  } = useColumnHandlers(editorData, editorSave, selectedItems, setSelectedItems);
  
  const {
    handleAddItem,
    handleItemDelete,
    handleItemEdit,
    onSelectItem,
  } = useItemHandlers(editorData, editorSave, selectedItems, setSelectedItems);

  const { handleAddSection, handleUpdateSection, handleDeleteSection, handleSectionReorder } =
    useSectionHandlers(editorData, editorSave);

  return (
    <main className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/30">
      <div className="flex h-full gap-4 px-2">
        {editorData.columns.map((col: any, index: number) => {
          const isLast = index === editorData.columns.length - 1;
          const selectedItemId = selectedItems.get(col.id);
          if (col.type === "branch") {
            let displayTitle = col.title;
            if (col.parent_item_id) {
              for (const [, items] of editorData.items.entries()) {
                const parentItem = items.find((i: any) => i.id === col.parent_item_id);
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
                <div
                  className="absolute right-0 top-0 z-10 h-full w-4 cursor-col-resize bg-transparent hover:bg-blue-400/20 transition-colors -mr-2"
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
                  sections={editorData.sections.filter((s: any) => s.column_id === col.id)}
                  width={width}
                  onTitleChange={(newTitle) => handleUpdateBranchTitle(col.id, newTitle)}
                  onSectionAdd={(type) => handleAddSection(col.id, type as any)}
                  onSectionChange={handleUpdateSection}
                  onSectionDelete={handleDeleteSection}
                  onSectionReorder={(newSections) => handleSectionReorder(col.id, newSections)}
                  onDelete={() => handleDeleteColumn(col.id)}
                />
                <div
                  className="absolute right-0 top-0 z-10 h-full w-4 cursor-col-resize bg-transparent hover:bg-blue-400/20 transition-colors -mr-2"
                  onMouseDown={(e) => handleResizeStart(e, col.id, width)}
                />
              </div>
            );
          }
          return null;
        })}
        {children}
      </div>
    </main>
  );
}

