import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { Column, ColumnItem, ContentSection } from "../edit/types";

export function usePathData(pathId: string) {
  const [path, setPath] = useState<any>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [items, setItems] = useState<Map<string, ColumnItem[]>>(new Map());
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Map<string, string>>(new Map());
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  // Fetch path details
  const fetchPath = useCallback(async () => {
    try {
      const { data: pathData, error: pathError } = await db
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();

      if (pathError) throw pathError;
      setPath(pathData);
    } catch (error) {
      console.error('Error fetching path:', error);
    } finally {
      setLoading(false);
    }
  }, [pathId]);

  // Fetch items for a column
  const fetchColumnItems = useCallback(async (columnId: string) => {
    try {
      const { data: itemsData, error: itemsError } = await db
        .from("column_items")
        .select("*")
        .eq("column_id", columnId)
        .order("order_index", { ascending: true });
      if (itemsError) throw itemsError;
      setItems(prev => new Map(prev).set(columnId, itemsData || []));
    } catch (err) {
        console.error(`Error fetching items for column ${columnId}:`, err);
    }
  }, []);

  // Fetch sections for a content column
  const fetchSections = useCallback(async (columnId: string) => {
    try {
      const { data, error } = await db
        .from("content_sections")
        .select("*")
        .eq("column_id", columnId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      setSections(prev => {
          const filtered = prev.filter(s => s.column_id !== columnId);
          return [...filtered, ...(data || [])];
      });
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  }, []);

  // Fetch root column
  const fetchRootColumn = useCallback(async () => {
      try {
        const { data: rootColumn, error: branchError } = await db
            .from("columns")
            .select("*")
            .eq("path_id", pathId)
            .is("parent_item_id", null)
            .order("order_index", { ascending: true })
            .limit(1)
            .single();
        
        if (branchError && branchError.code !== "PGRST116") throw branchError;

        if (rootColumn) {
            setColumns([rootColumn]);
            await fetchColumnItems(rootColumn.id);
        }
      } catch (err) {
          console.error("Error fetching root column:", err);
      }
  }, [pathId, fetchColumnItems]);

  // Fetch child column
  const fetchChildColumn = useCallback(async (parentItemId: string): Promise<boolean> => {
    console.log('[ViewPage] Fetching child column for parent item:', parentItemId);
    try {
      const { data: childColumn, error } = await db
        .from("columns")
        .select("*")
        .eq("parent_item_id", parentItemId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (childColumn) {
          setColumns(prev => {
              if (prev.find(c => c.id === childColumn.id)) return prev;
              return [...prev, childColumn];
          });
          
          if (childColumn.type === 'branch') {
              await fetchColumnItems(childColumn.id);
          } else if (childColumn.type === 'content') {
              await fetchSections(childColumn.id);
          }
          return true;
      }
      return false;
    } catch (err) {
      console.error("Error fetching child column:", err);
      return false;
    }
  }, [fetchColumnItems, fetchSections]);

  // Handle item selection
  const onSelectItem = useCallback(async (columnId: string, itemId: string, isMobile: boolean) => {
      // Update selection
      setSelectedItems(prev => new Map(prev).set(columnId, itemId));
      
      // Truncate columns after this one
      const columnIndex = columns.findIndex(c => c.id === columnId);
      const newColumns = columns.slice(0, columnIndex + 1);
      setColumns(newColumns);
      
      // Fetch next column
      const hasChild = await fetchChildColumn(itemId);
      
      // Navigate to next column on mobile only if child exists
      if (isMobile && hasChild) {
        setActiveColumnIndex(columnIndex + 1);
      }
  }, [columns, fetchChildColumn]);

  const goBackColumn = useCallback(() => {
    setActiveColumnIndex(prev => Math.max(0, prev - 1));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (pathId) {
        fetchPath();
        fetchRootColumn();
    }
  }, [pathId, fetchPath, fetchRootColumn]);

  return {
    path,
    columns,
    items,
    sections,
    loading,
    selectedItems,
    activeColumnIndex,
    setActiveColumnIndex,
    onSelectItem,
    goBackColumn
  };
}
