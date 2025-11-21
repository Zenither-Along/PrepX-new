"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { ArrowLeft, RotateCcw, RotateCw, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BranchColumn } from "@/components/editor/BranchColumn";
import { DynamicColumn } from "@/components/editor/DynamicColumn";
import { AddColumnPlaceholder } from "@/components/editor/AddColumnPlaceholder";
import { db } from "@/lib/db";
import { 
  addBranchItem, 
  addContentSection, 
  savePath, 
  saveBranch, 
  saveItems, 
  saveSections,
  deleteBranchItem,
  deleteContentSection,
  insertBranchItems,
  insertContentSections
} from "@/lib/actions/actions";

const MAX_NESTING_DEPTH = 5;

// We'll define more complex types later or import them
interface PathData {
  id: string;
  title: string;
  subtitle: string;
}

export default function EditorPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [path, setPath] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branch, setBranch] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [sections, setSections] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track newly added items/sections (not yet in DB)
  const [newItems, setNewItems] = useState<Set<string>>(new Set());
  const [newSections, setNewSections] = useState<Set<string>>(new Set());

  // Track items/sections marked for deletion
  const [deletedItems, setDeletedItems] = useState<Set<string>>(new Set());
  const [deletedSections, setDeletedSections] = useState<Set<string>>(new Set());

  // Track editing state
  const [editingItemId, setEditingItemId] = useState<string | undefined>();

  // Track column type for each item (persists column choice per item)
  const [itemColumnTypes, setItemColumnTypes] = useState<Map<string, 'branch' | 'dynamic'>>(new Map());

  // Track sub-items for branch columns (nested items)
  const [subItems, setSubItems] = useState<Map<string, any[]>>(new Map());
  const [selectedSubItemId, setSelectedSubItemId] = useState<string | undefined>();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (path) fetchData();
  }, [path]);

  useEffect(() => {
    if (selectedItemId) fetchSections(selectedItemId);
    else setSections([]);
  }, [selectedItemId]);

  useEffect(() => {
    if (selectedSubItemId) fetchSections(selectedSubItemId);
    else if (!selectedItemId) setSections([]);
  }, [selectedSubItemId]);

  useEffect(() => {
    if (id) fetchPath();
  }, [id]);

  // Auto-detect existing columns: if an item has sections, mark it as having a dynamic column
  useEffect(() => {
    const currentId = selectedSubItemId || selectedItemId;
    if (currentId && sections.length > 0 && !itemColumnTypes.has(currentId)) {
      const newMap = new Map(itemColumnTypes);
      newMap.set(currentId, 'dynamic');
      setItemColumnTypes(newMap);
    }
  }, [selectedItemId, selectedSubItemId, sections]);

  const fetchPath = async () => {
    try {
      const { data, error } = await db
        .from("learning_paths")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPath(data);
    } catch (error) {
      console.error("Error fetching path:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch the root branch (order_index 0)
      const { data: branchData, error: branchError } = await db
        .from("branches")
        .select("*")
        .eq("path_id", path?.id)
        .order("order_index", { ascending: true })
        .limit(1)
        .single();

      if (branchError && branchError.code !== 'PGRST116') throw branchError;

      if (branchData) {
        setBranch(branchData);
        // Fetch items for this branch
        const { data: itemsData, error: itemsError } = await db
          .from("branch_items")
          .select("*")
          .eq("branch_id", branchData.id)
          .order("order_index", { ascending: true });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      }
    } catch (error) {
      console.error("Error fetching editor data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSections = async (itemId: string) => {
    // Don't fetch sections for temporary items (not yet in DB)
    if (itemId.startsWith('temp-')) {
      setSections([]);
      return;
    }
    
    try {
      const { data, error } = await db
        .from("content_sections")
        .select("*")
        .eq("item_id", itemId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const handleSave = async () => {
    if (!path) return;
    setSaving(true);
    try {
      // PHASE 1: DELETE
      // Delete sections (exclude temporary IDs)
      for (const sectionId of deletedSections) {
        if (!sectionId.startsWith('temp-')) {
          await deleteContentSection(sectionId);
        }
      }

      // Delete items (exclude temporary IDs)
      for (const itemId of deletedItems) {
        if (!itemId.startsWith('temp-')) {
          await deleteBranchItem(itemId);
        }
      }

      // PHASE 2: INSERT NEW RECORDS
      // Prepare new items for insertion (those in newItems set)
      const itemsToInsert = items.filter(item => newItems.has(item.id)).map(item => ({
        branch_id: item.branch_id,
        title: item.title,
        order_index: item.order_index,
      }));

      let insertedItems: any[] = [];
      if (itemsToInsert.length > 0) {
        insertedItems = await insertBranchItems(itemsToInsert);
      }

      // Create a mapping from temp IDs to real IDs for items
      const itemIdMap = new Map<string, string>();
      Array.from(newItems).forEach((tempId, index) => {
        if (insertedItems[index]) {
          itemIdMap.set(tempId, insertedItems[index].id);
        }
      });

      // Update item state with real IDs
      const updatedItems = items.map(item => {
        if (itemIdMap.has(item.id)) {
          return { ...item, id: itemIdMap.get(item.id)! };
        }
        return item;
      });
      setItems(updatedItems);

      // Update selected item ID if it was a temp ID
      if (selectedItemId && itemIdMap.has(selectedItemId)) {
        setSelectedItemId(itemIdMap.get(selectedItemId)!);
      }

      // Prepare new sections for insertion (those in newSections set)
      const sectionsToInsert = sections.filter(section => newSections.has(section.id)).map(section => ({
        item_id: itemIdMap.get(section.item_id) || section.item_id, // Use real ID if item was just inserted
        type: section.type,
        content: section.content,
        order_index: section.order_index,
      }));

      let insertedSections: any[] = [];
      if (sectionsToInsert.length > 0) {
        insertedSections = await insertContentSections(sectionsToInsert);
      }

      // Create a mapping from temp IDs to real IDs for sections
      const sectionIdMap = new Map<string, string>();
      Array.from(newSections).forEach((tempId, index) => {
        if (insertedSections[index]) {
          sectionIdMap.set(tempId, insertedSections[index].id);
        }
      });

      // Update section state with real IDs
      const updatedSections = sections.map(section => {
        const newSection = { ...section };
        if (sectionIdMap.has(section.id)) {
          newSection.id = sectionIdMap.get(section.id)!;
        }
        if (itemIdMap.has(section.item_id)) {
          newSection.item_id = itemIdMap.get(section.item_id)!;
        }
        return newSection;
      });
      setSections(updatedSections);

      // PHASE 3: UPDATE EXISTING RECORDS
      // Update path title
      await savePath(id as string, path.title);

      // Update branch title
      if (branch) {
        await saveBranch(branch.id, branch.title);
      }

      // Update existing items (exclude new items and deleted items)
      const itemsToUpdate = updatedItems.filter(item => 
        !newItems.has(item.id) && !deletedItems.has(item.id)
      );
      if (itemsToUpdate.length > 0) {
        await saveItems(itemsToUpdate);
      }

      // Update existing sections (exclude new sections and deleted sections)
      const sectionsToUpdate = updatedSections.filter(section => 
        !newSections.has(section.id) && !deletedSections.has(section.id)
      );
      if (sectionsToUpdate.length > 0) {
        await saveSections(sectionsToUpdate);
      }

      // PHASE 4: CLEANUP
      setNewItems(new Set());
      setNewSections(new Set());
      setDeletedItems(new Set());
      setDeletedSections(new Set());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // ... existing fetch functions ...

  const handleAddItem = () => {
    if (!branch) return;
    
    // Generate temporary ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem = {
      id: tempId,
      branch_id: branch.id,
      title: "New Item",
      order_index: items.length,
    };
    
    setItems([...items, newItem]);
    setSelectedItemId(tempId);
    setNewItems(new Set(newItems).add(tempId));
    setHasUnsavedChanges(true);
  };

  const handleAddSection = (type: string) => {
    if (!selectedItemId) return;
    
    // Generate temporary ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const content = type === 'heading' ? { text: '' } : type === 'paragraph' ? { text: '' } : { url: '' };
    
    const newSection = {
      id: tempId,
      item_id: selectedItemId,
      type,
      content,
      order_index: sections.length,
    };
    
    setSections([...sections, newSection]);
    setNewSections(new Set(newSections).add(tempId));
    setHasUnsavedChanges(true);
  };

  const handleUpdateSection = (id: string, content: any) => {
    // Optimistic update
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
    setHasUnsavedChanges(true);
  };

  const handleDeleteSection = (id: string) => {
    // Remove from UI
    setSections(sections.filter(s => s.id !== id));
    
    // If it's a new section (not in DB yet), just remove from newSections set
    if (newSections.has(id)) {
      const updated = new Set(newSections);
      updated.delete(id);
      setNewSections(updated);
    } else {
      // It's an existing section, mark for deletion
      setDeletedSections(new Set(deletedSections).add(id));
    }
    
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = (itemId: string) => {
    // Remove item from UI
    setItems(items.filter(i => i.id !== itemId));
    
    // If the deleted item was selected, clear selection
    if (selectedItemId === itemId) {
      setSelectedItemId(undefined);
      setSections([]);
    }
    
    // Mark all sections of this item for deletion
    const itemSections = sections.filter(s => s.item_id === itemId);
    const newDeletedSections = new Set(deletedSections);
    itemSections.forEach(section => {
      if (!newSections.has(section.id)) {
        newDeletedSections.add(section.id);
      }
    });
    setDeletedSections(newDeletedSections);
    
    // Remove sections from UI
    setSections(sections.filter(s => s.item_id !== itemId));
    
    // If it's a new item (not in DB yet), just remove from newItems set
    if (newItems.has(itemId)) {
      const updated = new Set(newItems);
      updated.delete(itemId);
      setNewItems(updated);
    } else {
      // It's an existing item, mark for deletion
      setDeletedItems(new Set(deletedItems).add(itemId));
    }
    
    setHasUnsavedChanges(true);
  };

  const handleUpdateBranchTitle = (title: string) => {
    if (!branch) return;
    setBranch({ ...branch, title });
    setHasUnsavedChanges(true);
  };

  const handleItemEdit = (itemId: string, newTitle: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, title: newTitle } : item
    ));
    setHasUnsavedChanges(true);
  };

  const handleSectionReorder = (newSections: any[]) => {
    setSections(newSections);
    setHasUnsavedChanges(true);
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
    if (selectedSubItemId === subItemId) {
      setSelectedSubItemId(undefined);
    }
    setHasUnsavedChanges(true);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Editor...</div>;
  if (!path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

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
                value={path.title}
                onChange={(e) => {
                  setPath({ ...path, title: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="text-lg font-bold truncate bg-transparent focus:outline-none"
                placeholder="Path Title"
              />
              <input
                type="text"
                value={path.subtitle || ''}
                onChange={(e) => {
                  setPath({ ...path, subtitle: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="text-sm text-gray-500 truncate bg-transparent focus:outline-none"
                placeholder="Add a description"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50">
        <div className="flex h-full gap-4 p-4">
          {branch && (
            <BranchColumn 
              title={branch.title} 
              items={items} 
              onTitleChange={handleUpdateBranchTitle}
              onItemAdd={handleAddItem}
              onItemSelect={setSelectedItemId}
              onItemDelete={handleDeleteItem}
              onItemEdit={handleItemEdit}
              selectedItemId={selectedItemId}
              editingItemId={editingItemId}
              onEditStart={setEditingItemId}
              onEditEnd={() => setEditingItemId(undefined)}
            />
          )}
          
          {/* Show placeholder if item selected but no column type chosen */}
          {selectedItemId && !itemColumnTypes.has(selectedItemId) && (
            <AddColumnPlaceholder 
              onSelectType={(type) => {
                const newMap = new Map(itemColumnTypes);
                newMap.set(selectedItemId, type);
                setItemColumnTypes(newMap);
                setHasUnsavedChanges(true);
              }}
            />
          )}

          {/* Show Dynamic Column if that type is selected */}
          {selectedItemId && itemColumnTypes.get(selectedItemId) === 'dynamic' && (
            <DynamicColumn 
              title={items.find(i => i.id === selectedItemId)?.title || "Content"} 
              sections={sections} 
              onSectionAdd={handleAddSection}
              onSectionChange={handleUpdateSection}
              onSectionDelete={handleDeleteSection}
              onSectionReorder={handleSectionReorder}
              onDelete={() => {
                // Delete the dynamic column for this item
                const newMap = new Map(itemColumnTypes);
                newMap.delete(selectedItemId);
                setItemColumnTypes(newMap);
                setSections([]);
                setHasUnsavedChanges(true);
              }}
            />
          )}

          {/* Show Branch Column if that type is selected */}
          {selectedItemId && itemColumnTypes.get(selectedItemId) === 'branch' && (
            <>
              <BranchColumn 
                title="Sub-branch"
                items={subItems.get(selectedItemId) || []}
                onTitleChange={() => {}} // Sub-branch title is fixed for now
                onItemAdd={() => handleAddSubItem(selectedItemId)}
                onItemSelect={setSelectedSubItemId}
                onItemDelete={(subItemId) => handleDeleteSubItem(selectedItemId, subItemId)}
                onItemEdit={(subItemId, newTitle) => handleEditSubItem(selectedItemId, subItemId, newTitle)}
                selectedItemId={selectedSubItemId}
                onDelete={() => {
                  // Delete the sub-branch column
                  const newMap = new Map(itemColumnTypes);
                  newMap.delete(selectedItemId);
                  setItemColumnTypes(newMap);
                  // Clear sub-items for this parent
                  const newSubItems = new Map(subItems);
                  newSubItems.delete(selectedItemId);
                  setSubItems(newSubItems);
                  setSelectedSubItemId(undefined);
                  setHasUnsavedChanges(true);
                }}
              />
              
              {/* Show placeholder for sub-item if selected but no column type */}
              {selectedSubItemId && !itemColumnTypes.has(selectedSubItemId) && (
                <AddColumnPlaceholder 
                  onSelectType={(type) => {
                    const newMap = new Map(itemColumnTypes);
                    newMap.set(selectedSubItemId, type);
                    setItemColumnTypes(newMap);
                    setHasUnsavedChanges(true);
                  }}
                />
              )}
              
              {/* Show Dynamic Column for selected sub-item */}
              {selectedSubItemId && itemColumnTypes.get(selectedSubItemId) === 'dynamic' && (
                <DynamicColumn 
                  title={(subItems.get(selectedItemId) || []).find(i => i.id === selectedSubItemId)?.title || "Content"}
                  sections={sections}
                  onSectionAdd={handleAddSection}
                  onSectionChange={handleUpdateSection}
                  onSectionDelete={handleDeleteSection}
                  onSectionReorder={handleSectionReorder}
                  onDelete={() => {
                    // Delete the dynamic column for this sub-item
                    const newMap = new Map(itemColumnTypes);
                    newMap.delete(selectedSubItemId);
                    setItemColumnTypes(newMap);
                    setSections([]);
                    setHasUnsavedChanges(true);
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
