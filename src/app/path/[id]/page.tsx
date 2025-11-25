"use client";

import { ArrowLeft, Pencil, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { ContentRenderer } from "@/components/view/ContentRenderer";
import { ChatColumn } from "@/components/editor/ChatColumn";
import { cn } from "@/lib/utils";
import { Column, ColumnItem, ContentSection } from "./edit/types";

export default function ViewPathPage() {
  const { id } = useParams();
  const router = useRouter();

  // Core data
  const [path, setPath] = useState<any>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [items, setItems] = useState<Map<string, ColumnItem[]>>(new Map());
  const [sections, setSections] = useState<ContentSection[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Track selected item for each column
  const [selectedItems, setSelectedItems] = useState<Map<string, string>>(new Map());
  
  // Track column widths (column_id -> width in pixels)
  const [columnWidths, setColumnWidths] = useState<Map<string, number>>(new Map());
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);
  
  // Track chat state for each content column
  const [openChats, setOpenChats] = useState<Set<string>>(new Set());

  // ---------------------------------------------------
  // Data fetching
  // ---------------------------------------------------
  useEffect(() => {
    if (id) {
        fetchPath();
        fetchRootColumn();
    }
  }, [id]);

  const fetchPath = async () => {
    try {
      const { data: pathData, error: pathError } = await db
        .from("learning_paths")
        .select("*")
        .eq("id", id)
        .single();
      if (pathError) throw pathError;
      setPath(pathData);
    } catch (err) {
      console.error("Error fetching path data:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchRootColumn = async () => {
      try {
        const { data: rootColumn, error: branchError } = await db
            .from("columns")
            .select("*")
            .eq("path_id", id)
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
  };

  const fetchColumnItems = async (columnId: string) => {
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
  };

  const fetchChildColumn = async (parentItemId: string) => {
    console.log('[ViewPage] Fetching child column for parent item:', parentItemId);
    try {
      const { data: childColumn, error } = await db
        .from("columns")
        .select("*")
        .eq("parent_item_id", parentItemId)
        .single();
      
      console.log('[ViewPage] Child column query result:', { childColumn, error });
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (childColumn) {
          console.log('[ViewPage] Found child column:', childColumn);
          setColumns(prev => {
              if (prev.find(c => c.id === childColumn.id)) return prev;
              return [...prev, childColumn];
          });
          
          if (childColumn.type === 'branch') {
              await fetchColumnItems(childColumn.id);
          } else if (childColumn.type === 'content') {
              await fetchSections(childColumn.id);
          }
      } else {
          console.log('[ViewPage] No child column found for item:', parentItemId);
      }
    } catch (err) {
      console.error("Error fetching child column:", err);
    }
  };

  const fetchSections = async (columnId: string) => {
    try {
      const { data, error } = await db
        .from("content_sections")
        .select("*")
        .eq("column_id", columnId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      // We append sections, or replace if we want to support multiple content columns visible?
      // For now, let's just append to a single list and filter by column_id in render
      setSections(prev => {
          const filtered = prev.filter(s => s.column_id !== columnId);
          return [...filtered, ...(data || [])];
      });
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

  const onSelectItem = async (columnId: string, itemId: string) => {
      // Update selection
      setSelectedItems(prev => new Map(prev).set(columnId, itemId));
      
      // Truncate columns after this one
      const columnIndex = columns.findIndex(c => c.id === columnId);
      const newColumns = columns.slice(0, columnIndex + 1);
      setColumns(newColumns);
      
      // Fetch next column
      await fetchChildColumn(itemId);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault();
    setResizing({ columnId, startX: e.clientX, startWidth: currentWidth });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = resizing.startWidth + delta;
      
      // Find column to get type for constraints
      const column = columns.find(c => c.id === resizing.columnId);
      if (!column) return;
      
      // Apply constraints based on column type
      const minWidth = column.type === 'branch' ? 80 : 400;
      const maxWidth = column.type === 'branch' ? 300 : 1500;
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      setColumnWidths(prev => new Map(prev).set(resizing.columnId, constrainedWidth));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, columns]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Path…</div>;
  if (!path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent hover:text-accent-foreground">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-bold flex items-center gap-2">
            {path.is_major && <Star className="h-5 w-5 text-yellow-500" />}
            {path.title}
          </h1>
        </div>
        <Button size="sm" asChild className="bg-black text-white hover:bg-gray-800">
          <Link href={`/path/${id}/edit`} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit Path
          </Link>
        </Button>
      </header>

      {/* Main layout */}
      <main className="flex flex-1 overflow-x-auto overflow-y-hidden gap-[5px]">
        {columns.map((col, index) => {
            const selectedItemId = selectedItems.get(col.id);
            
            if (col.type === 'branch') {
                const width = columnWidths.get(col.id) || 320;
                return (
                    <div key={col.id} className="relative flex shrink-0 border-x border-border" style={{ width: `${width}px` }}>
                      <aside className="flex-1 flex flex-col overflow-hidden bg-muted/30">
                        {/* Header section */}
                        <div className="p-3 border-b border-border">
                          <h2 className="text-xl font-bold">{col.title}</h2>
                        </div>
                        {/* Items area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                          {(items.get(col.id) || []).map(item => (
                            <button
                              key={item.id}
                              onClick={() => onSelectItem(col.id, item.id)}
                              className={cn(
                                "w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                                selectedItemId === item.id ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      </aside>
                      {/* Resize handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-400 transition-colors"
                        onMouseDown={(e) => handleResizeStart(e, col.id, width)}
                      />
                    </div>
                );
            } else if (col.type === 'content') {
                // Find the item that spawned this content column to get the title
                // The parent item is in the previous column
                // Actually, the column has a parent_item_id. We can find the item title from that.
                // But we don't have easy access to all items in a flat list.
                // We can iterate columns to find the item.
                // Or just use the column title (which we set to 'Content' or the item title in the editor).
                
                // Let's try to find the parent item title if possible, or fallback to column title.
                // We can search in the `items` map.
                let title = col.title;
                if (col.parent_item_id) {
                    for (const [cId, cItems] of items.entries()) {
                        const found = cItems.find(i => i.id === col.parent_item_id);
                        if (found) {
                            title = found.title;
                            break;
                        }
                    }
                }

                const colSections = sections.filter(s => s.column_id === col.id);
                const isChatOpen = openChats.has(col.id);
                
                const width = columnWidths.get(col.id) || 1200;
                return (
                    <div key={col.id} className="relative flex shrink-0 gap-4 border-x border-border" style={{ width: isChatOpen ? `${width + 400}px` : `${width}px` }}>
                      <section className="flex-1 flex flex-col overflow-hidden bg-muted/30">
                          {/* Header section */}
                          <div className="p-3 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">{title}</h2>
                            <Button 
                              variant={isChatOpen ? "default" : "ghost"} 
                              size="icon" 
                              className="h-8 w-8 shrink-0 cursor-pointer"
                              onClick={() => {
                                setOpenChats(prev => {
                                  const next = new Set(prev);
                                  if (next.has(col.id)) {
                                    next.delete(col.id);
                                  } else {
                                    next.add(col.id);
                                  }
                                  return next;
                                });
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                          {/* Content area */}
                          <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
                            {colSections.length === 0 ? (
                              <p className="text-muted-foreground italic">No content in this section.</p>
                            ) : (
                              colSections.map(section => (
                                <ContentRenderer key={section.id} type={section.type} content={section.content} />
                              ))
                            )}
                          </div>
                      </section>
                      
                      {/* Chat Column */}
                      {isChatOpen && (
                        <ChatColumn 
                          columnId={col.id}
                          contextData={colSections}
                          onClose={() => {
                            setOpenChats(prev => {
                              const next = new Set(prev);
                              next.delete(col.id);
                              return next;
                            });
                          }}
                        />
                      )}
                      
                      {/* Resize handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-400 transition-colors"
                        onMouseDown={(e) => handleResizeStart(e, col.id, width)}
                      />
                    </div>
                );
            }
            return null;
        })}
      </main>
    </div>
  );
}
