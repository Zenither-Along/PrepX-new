import { ColumnItem } from '../types';

export function useItemHandlers(
  editorData: any,
  editorSave: any,
  selectedItems: Map<string, string>,
  setSelectedItems: (items: Map<string, string>) => void
) {
  const handleAddItem = (columnId: string) => {
    const newItem: ColumnItem = {
      id: `temp-${Date.now()}`,
      column_id: columnId,
      title: "New Item",
      order_index: (editorData.items.get(columnId)?.length || 0)
    };
    
    editorData.setItems((prev: Map<string, ColumnItem[]>) => {
      const newMap = new Map(prev);
      const list = newMap.get(columnId) || [];
      newMap.set(columnId, [...list, newItem]);
      return newMap;
    });
    
    editorSave.setNewItems((prev: Set<string>) => new Set(prev).add(newItem.id));
    editorSave.setHasUnsavedChanges(true);
  };

  const handleItemDelete = (columnId: string, itemId: string) => {
    // Check if item has a child column
    const hasChildColumn = editorData.columns.some((c: any) => c.parent_item_id === itemId) || 
                           (editorData.columnCache && editorData.columnCache.has(itemId));
    
    if (hasChildColumn) {
      if (!window.confirm("This item has a child column. Deleting it will also delete the child column and its content. Are you sure?")) {
        return;
      }
    }

    editorData.setItems((prev: Map<string, ColumnItem[]>) => {
      const newMap = new Map(prev);
      const list = newMap.get(columnId) || [];
      newMap.set(columnId, list.filter((i: ColumnItem) => i.id !== itemId));
      return newMap;
    });
    
    editorSave.setDeletedItems((prev: Set<string>) => new Set(prev).add(itemId));
    editorSave.setHasUnsavedChanges(true);
    
    // If this item was selected, clear selection and truncate columns
    if (selectedItems.get(columnId) === itemId) {
      const newSelected = new Map(selectedItems);
      newSelected.delete(columnId);
      setSelectedItems(newSelected);
      
      const columnIndex = editorData.columns.findIndex((c: any) => c.id === columnId);
      const newColumns = editorData.columns.slice(0, columnIndex + 1);
      editorData.setColumns(newColumns);
    }
  };

  const handleItemEdit = (columnId: string, itemId: string, newTitle: string) => {
    editorData.setItems((prev: Map<string, ColumnItem[]>) => {
      const newMap = new Map(prev);
      const list = newMap.get(columnId) || [];
      const idx = list.findIndex((i: ColumnItem) => i.id === itemId);
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
    setSelectedItems(new Map(selectedItems).set(columnId, itemId));
    
    // Truncate columns after this one
    const columnIndex = editorData.columns.findIndex((c: any) => c.id === columnId);
    const newColumns = editorData.columns.slice(0, columnIndex + 1);
    editorData.setColumns(newColumns);
    
    // Try to fetch child column
    return await editorData.fetchChildColumn(itemId);
  };

  return {
    handleAddItem,
    handleItemDelete,
    handleItemEdit,
    onSelectItem
  };
}
