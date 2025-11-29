import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import type { PathData, Column, ColumnItem, ContentSection } from '../types';

/**
 * Hook for fetching and managing editor data (paths, columns, items, sections).
 * Supports the new `columns` / `column_items` schema and gracefully skips
 * temporary client‑side IDs.
 */
export function useEditorData(id: string | string[] | undefined) {
  const router = useRouter();
  const [path, setPath] = useState<PathData | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [items, setItems] = useState<Map<string, ColumnItem[]>>(new Map()); // column_id → items
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [activeColumnIds, setActiveColumnIds] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // Fetch the learning path record
  // ---------------------------------------------------------------------------
  const fetchPath = async () => {
    try {
      const pathId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
      if (!pathId) {
        router.push('/');
        return;
      }
      const { data, error } = await db
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();
      if (error) throw error;
      setPath(data);
    } catch (e) {
      console.error('Error fetching path:', e);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch the root column (parent_item_id = null) and its items/sections
  // ---------------------------------------------------------------------------
  const [columnCache, setColumnCache] = useState<Map<string, Column>>(new Map()); // parent_item_id -> Column

  // ---------------------------------------------------------------------------
  // Fetch the root column (parent_item_id = null) and its items/sections
  // ---------------------------------------------------------------------------
  const fetchData = async () => {
    try {
      const { data: rootColumn, error: columnError } = await db
        .from('columns')
        .select('*')
        .eq('path_id', path?.id)
        .is('parent_item_id', null)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();
      if (columnError && columnError.code !== 'PGRST116') throw columnError;

      if (rootColumn) {
        setColumns([rootColumn]);
        setActiveColumnIds([rootColumn.id]);
        // Cache root column (key: 'root')
        setColumnCache(prev => new Map(prev).set('root', rootColumn));
        await fetchColumnItems(rootColumn.id);
      }
    } catch (e) {
      console.error('Error fetching editor data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch items for a column and also its content sections
  // ---------------------------------------------------------------------------
  const fetchColumnItems = async (columnId: string) => {
    try {
      const { data: itemsData, error: itemsError } = await db
        .from('column_items')
        .select('*')
        .eq('column_id', columnId)
        .order('order_index', { ascending: true });
      if (itemsError) throw itemsError;
      setItems(prev => new Map(prev).set(columnId, itemsData || []));
    } catch (e) {
      console.error(`Error fetching items for column ${columnId}:`, e);
    }

    // Sections belong to the column (not to an item)
    try {
      const { data, error } = await db
        .from('content_sections')
        .select('*')
        .eq('column_id', columnId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      
      setSections(prev => {
        // Remove existing sections for this column and append new ones
        const others = prev.filter(s => s.column_id !== columnId);
        return [...others, ...(data || [])];
      });
    } catch (e) {
      console.error(`Error fetching sections for column ${columnId}:`, e);
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch a child column when an item is selected (breadcrumb navigation)
  // ---------------------------------------------------------------------------
  const fetchChildColumn = async (parentItemId: string) => {
    // 1. Check Cache First
    const cachedColumn = columnCache.get(parentItemId);
    if (cachedColumn) {
      setColumns(prev => {
        if (prev.find(c => c.id === cachedColumn.id)) return prev;
        return [...prev, cachedColumn];
      });
      // We assume items/sections are already in state if it's in cache, 
      // but we can re-fetch if needed (unless it's a temp column)
      if (!cachedColumn.id.startsWith('temp-')) {
         // Optional: re-fetch to ensure freshness, but for now trust local state for speed
         // await fetchColumnItems(cachedColumn.id);
      }
      return cachedColumn;
    }

    // Temporary client‑side IDs and AI-generated IDs have no persisted column yet.
    if (parentItemId.startsWith('temp-') || parentItemId.startsWith('ai-item-')) return null;
    
    try {
      const { data: childColumn, error } = await db
        .from('columns')
        .select('*')
        .eq('parent_item_id', parentItemId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;

      if (childColumn) {
        setColumns(prev => {
          if (prev.find(c => c.id === childColumn.id)) return prev;
          return [...prev, childColumn];
        });
        
        // Add to cache
        setColumnCache(prev => new Map(prev).set(parentItemId, childColumn));

        // Load its items/sections based on type
        if (childColumn.type === 'branch') {
          await fetchColumnItems(childColumn.id);
        } else if (childColumn.type === 'content') {
          await fetchColumnItems(childColumn.id);
        }
        return childColumn;
      }
      return null;
    } catch (e) {
      console.error(`Error fetching child column for item ${parentItemId}:`, e);
      return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Effects – run on mount and when path loads
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const pathId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
    if (pathId) fetchPath();
  }, [id]);

  useEffect(() => {
    if (path?.id) fetchData();
  }, [path?.id]);

  // ---------------------------------------------------------------------------
  // Return all state and helpers needed by the editor page
  // ---------------------------------------------------------------------------
  return {
    path,
    setPath,
    columns,
    setColumns,
    items,
    setItems,
    sections,
    setSections,
    loading,
    loadingData,
    activeColumnIds,
    setActiveColumnIds,
    fetchChildColumn,
    fetchColumnItems,
    setColumnCache, // Expose for handlers to update cache
  };
}
