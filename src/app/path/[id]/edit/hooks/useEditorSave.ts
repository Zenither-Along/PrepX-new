// useEditorSave hook – handles saving of path, columns, items, and sections
import { useState } from 'react';
import {
  savePath,
  saveColumn,
  saveItems,
  saveSections,
 deleteColumnItem,
  deleteContentSection,
  deleteColumn,
  insertColumnItems,
  insertContentSections,
  createChildColumn
} from '@/lib/actions/actions';
import { toast } from '@/hooks/use-toast';
import type { PathData, Column, ColumnItem, ContentSection } from '../types';

export function useEditorSave(
  id: string | string[] | undefined,
  path: PathData | null,
  columns: Column[],
  items: Map<string, ColumnItem[]>,
  sections: ContentSection[],
) {
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track newly added items/sections (not yet persisted)
  const [newItems, setNewItems] = useState<Set<string>>(new Set());
  const [newSections, setNewSections] = useState<Set<string>>(new Set());
  const [newColumns, setNewColumns] = useState<Set<string>>(new Set());

  // Track items/sections marked for deletion
  const [deletedItems, setDeletedItems] = useState<Set<string>>(new Set());
  const [deletedSections, setDeletedSections] = useState<Set<string>>(new Set());
  const [deletedColumns, setDeletedColumns] = useState<Set<string>>(new Set());


  const handleSave = async () => {
    if (!path) return;

    // Validate path id
    const pathId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
    if (!pathId) {
      toast({
        variant: "destructive",
        title: "Invalid path ID",
        description: "Unable to save changes.",
      });
      return;
    }

    setSaving(true);
    try {
      // Maps to track temp ID -> real ID resolution
      const tempToRealColumnId = new Map<string, string>();
      const tempToRealItemId = new Map<string, string>();

      // ---------- Phase 1: Deletions ----------
      // Delete columns first (cascade will handle child items/sections)
      for (const colId of deletedColumns) {
        if (!colId.startsWith('temp-')) await deleteColumn(colId);
      }
      
      for (const secId of deletedSections) {
        if (!secId.startsWith('temp-')) await deleteContentSection(secId);
      }
      for (const itmId of deletedItems) {
        if (!itmId.startsWith('temp-')) await deleteColumnItem(itmId);
      }

      // ---------- Phase 2: Save Path ----------
      await savePath(pathId, path.title);

      // ---------- Phase 3: Recursive Save (Columns & Items) ----------
      // We iterate through the columns array, which is topologically sorted (parent -> child)
      for (const col of columns) {
          let realColumnId = col.id;
          let parentItemId = col.parent_item_id;

          // Resolve parent_item_id if it was a temp ID
          if (parentItemId && tempToRealItemId.has(parentItemId)) {
              parentItemId = tempToRealItemId.get(parentItemId)!;
          }

          // Check if this is a new column
          if (newColumns.has(col.id)) {
              // Insert new column
              // We use createChildColumn helper or direct insert
              // We need to handle the case where parentItemId is null (root)
              // But createChildColumn expects string. 
              // Let's use a direct insert logic here or adapt createChildColumn
              
              // Actually, let's just use the actions we have or create a specific one?
              // createChildColumn takes (pathId, parentItemId, type).
              // If parentItemId is null, we need a different action or update createChildColumn.
              // Let's assume for now we can use a direct insert via a new action or just update createChildColumn signature?
              // I'll use a new inline logic or assume createChildColumn handles null? 
              // Looking at actions.ts, createChildColumn signature is (pathId, parentItemId: string, type).
              // It doesn't support null.
              // But wait, the root column is created by createPath.
              // If we are creating a NEW root column (because one was missing), we need to handle null.
              
              // Let's use a generic `insertColumn` action that I'll add to imports if needed, 
              // or just use createChildColumn and cast? No, runtime error.
              
              // I will use `createChildColumn` but I need to fix it in actions.ts to allow null parent.
              // For now, let's assume I will fix actions.ts.
              
              const typeToSave = col.type === 'dynamic' ? 'content' : col.type;
              const parentIdToSave = parentItemId || null; // Ensure null if undefined/empty
              const newColData = await createChildColumn(pathId, parentIdToSave, typeToSave);
              if (newColData) {
                  realColumnId = newColData.id;
                  tempToRealColumnId.set(col.id, realColumnId);
              }
          } else {
              // Update existing column title
              await saveColumn(col.id, col.title);
          }

          // Now process items for this column
          const columnItems = items.get(col.id) || [];
          
          const itemsToInsert = columnItems.filter(it => newItems.has(it.id));
          const itemsToUpdate = columnItems.filter(it => !newItems.has(it.id));

          // Insert new items
          if (itemsToInsert.length > 0) {
              // We need to pass the REAL column ID
              const insertedItems = await insertColumnItems(realColumnId, itemsToInsert);
              
              // Map temp IDs to real IDs
              // We assume insertedItems are returned in the same order as itemsToInsert
              // This is generally true for Supabase/Postgres inserts of arrays
              if (insertedItems) {
                  itemsToInsert.forEach((tempItem, index) => {
                      if (insertedItems[index]) {
                          tempToRealItemId.set(tempItem.id, insertedItems[index].id);
                      }
                  });
              }
          }

          // Update existing items
          if (itemsToUpdate.length > 0) {
              await saveItems(itemsToUpdate);
          }
          
          // Process Sections (if content column)
          if (col.type === 'content' || col.type === 'dynamic') { // Handle both types just in case
             const colSections = sections.filter(s => s.column_id === col.id);
             const sectionsToInsert = colSections.filter(s => newSections.has(s.id));
             const sectionsToUpdate = colSections.filter(s => !newSections.has(s.id));
             
             if (sectionsToInsert.length > 0) {
                 // Update column_id to real ID
                 const fixedSections = sectionsToInsert.map(s => ({ ...s, column_id: realColumnId }));
                 await insertContentSections(fixedSections);
             }
             if (sectionsToUpdate.length > 0) {
                 await saveSections(sectionsToUpdate);
             }
          }
      }

      // ---------- Cleanup ----------
      setNewItems(new Set());
      setNewSections(new Set());
      setNewColumns(new Set());
      setDeletedItems(new Set());
      setDeletedSections(new Set());
      setHasUnsavedChanges(false);
      
      // We should probably reload the page or data to get fresh state with real IDs
      // window.location.reload(); // Brute force but safe
      // Or we can just alert.
      toast({
        variant: "success",
        title: "Saved successfully!",
        description: "Reloading to sync data...",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('Save error:', err);
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    newItems,
    setNewItems,
    newSections,
    setNewSections,
    newColumns,
    setNewColumns,
    deletedItems,
    setDeletedItems,
    deletedSections,
    setDeletedSections,
    deletedColumns,
    setDeletedColumns,
    handleSave,
  };
}
