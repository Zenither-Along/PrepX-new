import { Column } from "../types";

export function useColumnHandlers(
  editorData: any,
  editorSave: any,
  selectedItems: Map<string, string>,
  setSelectedItems: (items: Map<string, string>) => void,
  onNavigateBack?: () => void // Optional callback for mobile navigation
) {
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
    
    editorData.setColumns((prev: Column[]) => [...prev, newColumn]);
    
    // Add to cache so it persists when switching items
    if (parentItemId) {
      editorData.setColumnCache((prev: Map<string, Column>) => new Map(prev).set(parentItemId, newColumn));
    }

    editorSave.setNewColumns((prev: Set<string>) => new Set(prev).add(newColumn.id));
    editorSave.setHasUnsavedChanges(true);
    
    // If it's a branch, initialize empty items
    if (newColumn.type === 'branch') {
      editorData.setItems((prev: Map<string, any[]>) => new Map(prev).set(newColumn.id, []));
    }
  };

  const handleUpdateBranchTitle = (columnId: string, newTitle: string) => {
    // Find the column
    const column = editorData.columns.find((c: Column) => c.id === columnId);
    if (!column) return;
    
    // If this column has a parent item, update the item's title
    if (column.parent_item_id) {
      // Find which column contains this item
      for (const [colId, items] of editorData.items.entries()) {
        const itemIndex = items.findIndex((item: any) => item.id === column.parent_item_id);
        if (itemIndex !== -1) {
          const updatedItems = [...items];
          updatedItems[itemIndex] = { ...updatedItems[itemIndex], title: newTitle };
          editorData.setItems((prev: Map<string, any[]>) => new Map(prev).set(colId, updatedItems));
          break;
        }
      }
    }
    
    // Also update the column title
    const index = editorData.columns.findIndex((c: Column) => c.id === columnId);
    if (index !== -1) {
      const newCols = [...editorData.columns];
      newCols[index] = { ...newCols[index], title: newTitle };
      editorData.setColumns(newCols);
      
      // Update cache if applicable
      if (column.parent_item_id) {
        editorData.setColumnCache((prev: Map<string, Column>) => {
           const newCache = new Map(prev);
           newCache.set(column.parent_item_id!, { ...column, title: newTitle });
           return newCache;
        });
      }
    }
    
    editorSave.setHasUnsavedChanges(true);
  };

  const handleDeleteColumn = (columnId: string) => {
    // Check if column has content
    const hasItems = (editorData.items.get(columnId) || []).length > 0;
    const hasSections = editorData.sections.some((s: any) => s.column_id === columnId);
    
    if (hasItems || hasSections) {
      if (!window.confirm("This column has content. Are you sure you want to delete it? This action cannot be undone.")) {
        return;
      }
    }

    // Remove from columns
    editorData.setColumns((prev: Column[]) => prev.filter((c: Column) => c.id !== columnId));
    
    // Remove from cache
    const column = editorData.columns.find((c: Column) => c.id === columnId);
    if (column && column.parent_item_id) {
      editorData.setColumnCache((prev: Map<string, Column>) => {
        const newCache = new Map(prev);
        newCache.delete(column.parent_item_id!);
        return newCache;
      });
    }
    
    // Track for database deletion
    editorSave.setDeletedColumns((prev: Set<string>) => new Set(prev).add(columnId));
    editorSave.setHasUnsavedChanges(true);
    
    // Navigate back on mobile if callback is provided
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const handleCloseColumn = (columnId: string) => {
    // Find the column index
    const columnIndex = editorData.columns.findIndex((c: Column) => c.id === columnId);
    if (columnIndex === -1) return;

    // Remove this column and all subsequent columns
    const newColumns = editorData.columns.slice(0, columnIndex);
    editorData.setColumns(newColumns);

    // If this column had a parent item, deselect it
    const column = editorData.columns[columnIndex];
    if (column && column.parent_item_id) {
       // Find the parent column of this item
       const parentColumn = editorData.columns.find((c: Column) => {
         const items = editorData.items.get(c.id) || [];
         return items.some((i: any) => i.id === column.parent_item_id);
       });
       
       if (parentColumn) {
         const newSelected = new Map(selectedItems);
         newSelected.delete(parentColumn.id);
         setSelectedItems(newSelected);
       }
    }
  };

  return {
    handleAddColumn,
    handleUpdateBranchTitle,
    handleDeleteColumn,
    handleCloseColumn
  };
}
