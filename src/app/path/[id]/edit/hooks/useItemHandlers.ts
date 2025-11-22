import type { Column, ColumnItem } from '../types';

export function useItemHandlers(
  branch: Column | null,
  items: ColumnItem[],
  setItems: (items: ColumnItem[]) => void,
  subItems: Map<string, any[]>,
  setSubItems: (subItems: Map<string, any[]>) => void,
  setSelectedItemId: (id: string | undefined) => void,
  setSelectedSubItemId: (id: string | undefined) => void,
  setSections: (sections: any[]) => void,
  newItems: Set<string>,
  setNewItems: (items: Set<string>) => void,
  deletedItems: Set<string>,
  setDeletedItems: (items: Set<string>) => void,
  setHasUnsavedChanges: (value: boolean) => void
) {
  const handleAddItem = () => {
    if (!branch) return;
    
    // Generate temporary ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem = {
      id: tempId,
      branch_id: branch.id,
      title: "New Item",
      order_index: items.length,
      parent_item_id: null,
      column_type: null
    };
    
    setItems([...items, newItem]);
    setSelectedItemId(tempId);
    setNewItems(new Set(newItems).add(tempId));
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = (itemId: string) => {
    // Remove from items
    setItems(items.filter(item => item.id !== itemId));
    
    // If it was a new item (temp ID), remove from newItems set
    if (newItems.has(itemId)) {
      const updatedNewItems = new Set(newItems);
      updatedNewItems.delete(itemId);
      setNewItems(updatedNewItems);
    } else {
      // Otherwise, mark for deletion
      setDeletedItems(new Set(deletedItems).add(itemId));
    }
    
    // Also delete any sub-items
    const itemSubItems = subItems.get(itemId);
    if (itemSubItems) {
      itemSubItems.forEach(subItem => {
        if (newItems.has(subItem.id)) {
          const updatedNewItems = new Set(newItems);
          updatedNewItems.delete(subItem.id);
          setNewItems(updatedNewItems);
        } else {
          setDeletedItems(new Set(deletedItems).add(subItem.id));
        }
      });
      
      // Remove from subItems map
      const updatedSubItems = new Map(subItems);
      updatedSubItems.delete(itemId);
      setSubItems(updatedSubItems);
    }
    
    setHasUnsavedChanges(true);
  };

  const handleItemEdit = (itemId: string, newTitle: string) => {
    setItems(items.map(item => item.id === itemId ? { ...item, title: newTitle } : item));
    setHasUnsavedChanges(true);
  };

  const handleUpdateBranchTitle = (title: string) => {
    if (branch) {
      // Branch title update is handled directly in the JSX
      setHasUnsavedChanges(true);
    }
  };

  // Sub-branch handlers
  const handleAddSubItem = (parentItemId: string) => {
    const tempId = `temp-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSubItem = {
      id: tempId,
      parent_id: parentItemId,
      title: "New Sub-item",
      order_index: (subItems.get(parentItemId) || []).length,
    };
    
    const updatedSubItems = new Map(subItems);
    const currentSubItems = updatedSubItems.get(parentItemId) || [];
    updatedSubItems.set(parentItemId, [...currentSubItems, newSubItem]);
    setSubItems(updatedSubItems);
    setSelectedSubItemId(tempId);
    setNewItems(new Set(newItems).add(tempId)); // Track as new item
    setHasUnsavedChanges(true);
  };

  const handleEditSubItem = (parentItemId: string, subItemId: string, newTitle: string) => {
    const updatedSubItems = new Map(subItems);
    const currentSubItems = updatedSubItems.get(parentItemId) || [];
    updatedSubItems.set(
      parentItemId,
      currentSubItems.map(item => item.id === subItemId ? { ...item, title: newTitle } : item)
    );
    setSubItems(updatedSubItems);
    setHasUnsavedChanges(true);
  };

  const handleDeleteSubItem = (parentItemId: string, subItemId: string) => {
    const updatedSubItems = new Map(subItems);
    const currentSubItems = updatedSubItems.get(parentItemId) || [];
    updatedSubItems.set(
      parentItemId,
      currentSubItems.filter(item => item.id !== subItemId)
    );
    setSubItems(updatedSubItems);
    
    // Track deletion or remove from newItems
    if (newItems.has(subItemId)) {
      const updatedNewItems = new Set(newItems);
      updatedNewItems.delete(subItemId);
      setNewItems(updatedNewItems);
    } else {
      setDeletedItems(new Set(deletedItems).add(subItemId));
    }
    
    // Clear sections if this sub-item was selected
    setSelectedSubItemId(undefined);
    setSections([]);
    setHasUnsavedChanges(true);
  };

  return {
    handleAddItem,
    handleDeleteItem,
    handleItemEdit,
    handleUpdateBranchTitle,
    handleAddSubItem,
    handleEditSubItem,
    handleDeleteSubItem
  };
}
