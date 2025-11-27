"use client";

import { ArrowLeft, Pencil, MessageSquare, Star, Brain } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { ContentRenderer } from "@/components/view/ContentRenderer";
import { ChatColumn } from "@/components/editor/ChatColumn";
import { QuizList } from "@/components/quiz/QuizList";
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
  
  // Track active panel for each content column (chat or quiz)
  const [activePanels, setActivePanels] = useState<Map<string, 'chat' | 'quiz' | null>>(new Map());

  // Mobile navigation state
  const [isMobile, setIsMobile] = useState(false);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add app-page class to body for viewport control
  useEffect(() => {
    document.body.classList.add('app-page');
    return () => {
      document.body.classList.remove('app-page');
    };
  }, []);

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
      
      // Navigate to next column on mobile
      if (isMobile) {
        setActiveColumnIndex(columnIndex + 1);
      }
  };

  // Mobile back navigation
  const goBackColumn = () => {
    setActiveColumnIndex(prev => Math.max(0, prev - 1));
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

  const togglePanel = (columnId: string, panel: 'chat' | 'quiz') => {
    setActivePanels(prev => {
      const next = new Map(prev);
      if (next.get(columnId) === panel) {
        next.set(columnId, null);
      } else {
        next.set(columnId, panel);
      }
      return next;
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Path…</div>;
  if (!path) return <div className="flex h-screen items-center justify-center">Path not found</div>;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className={cn(
        "h-14 md:h-16 items-center justify-between border-b border-border px-4",
        activeColumnIndex > 0 ? "hidden md:flex" : "flex"
      )}>
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent hover:text-accent-foreground shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="h-6 w-px bg-border shrink-0" />
          <h1 className="text-base md:text-lg font-bold flex items-center gap-2 truncate">
            {path.is_major && <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 shrink-0" />}
            {path.title}
          </h1>
        </div>
        <Button size="sm" asChild className="bg-black text-white hover:bg-gray-800 shrink-0 hidden md:flex">
          <Link href={`/path/${id}/edit`} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            <span className="hidden md:inline">Edit Path</span>
          </Link>
        </Button>
      </header>


      {/* Main layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile: Single column view */}
        <div className="md:hidden flex-1 overflow-y-auto">
          {columns[activeColumnIndex] && (() => {
            const col = columns[activeColumnIndex];
            const selectedItemId = selectedItems.get(col.id);
            
            if (col.type === 'branch') {
              let title = col.title;
              if (col.parent_item_id) {
                for (const [, cItems] of items.entries()) {
                  const parentItem = cItems.find(i => i.id === col.parent_item_id);
                  if (parentItem) {
                    title = parentItem.title;
                    break;
                  }
                }
              }
              
              return (
                <div className="flex flex-col h-full bg-muted/30">
                  {/* Header with back button - Only show for child columns */}
                  {/* Header with back button - Only show for child columns */}
                  <div className="p-3 border-b border-border flex items-center gap-2">
                    {activeColumnIndex > 0 && (
                      <Button variant="ghost" size="icon" onClick={goBackColumn} className="shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <h2 className="text-xl font-bold flex-1">{title}</h2>
                  </div>
                  {/* Items area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {(items.get(col.id) || []).map(item => (
                      <button
                        key={item.id}
                        onClick={() => onSelectItem(col.id, item.id)}
                        className={cn(
                          "w-full rounded-lg px-4 py-4 text-left text-base font-medium transition-colors touch-target",
                          selectedItemId === item.id ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            } else if (col.type === 'content') {
              let title = col.title;
              if (col.parent_item_id) {
                for (const [, cItems] of items.entries()) {
                  const found = cItems.find(i => i.id === col.parent_item_id);
                  if (found) {
                    title = found.title;
                    break;
                  }
                }
              }
              
              const colSections = sections.filter(s => s.column_id === col.id);
              const activePanel = activePanels.get(col.id);
              
              return (
                <div className="flex flex-col h-full bg-muted/30">
                  {/* Header with back button */}
                  <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {activeColumnIndex > 0 && (
                        <Button variant="ghost" size="icon" onClick={goBackColumn} className="shrink-0">
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                      )}
                      <h2 className="text-xl font-bold truncate">{title}</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant={activePanel === 'quiz' ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => togglePanel(col.id, 'quiz')}
                      >
                        <Brain className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={activePanel === 'chat' ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => togglePanel(col.id, 'chat')}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* For root content column (rare but possible), we might need the action buttons if header is hidden */}
                  {activeColumnIndex === 0 && (
                     <div className="p-2 flex justify-end gap-2 border-b border-border/50">
                        <Button 
                          variant={activePanel === 'quiz' ? "default" : "ghost"} 
                          size="sm" 
                          onClick={() => togglePanel(col.id, 'quiz')}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Quiz
                        </Button>
                        <Button 
                          variant={activePanel === 'chat' ? "default" : "ghost"} 
                          size="sm" 
                          onClick={() => togglePanel(col.id, 'chat')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                     </div>
                  )}
                  {/* Content area */}
                  {activePanel === 'chat' ? (
                    <ChatColumn 
                      columnId={col.id}
                      contextData={colSections}
                      onClose={() => togglePanel(col.id, 'chat')}
                    />
                  ) : activePanel === 'quiz' ? (
                    <div className="flex-1 overflow-y-auto p-4 bg-background">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Quizzes</h3>
                        <Button variant="ghost" size="sm" onClick={() => togglePanel(col.id, 'quiz')}>Close</Button>
                      </div>
                      <QuizList 
                        pathId={id as string}
                        columnId={col.id}
                        contentContext={colSections.map(s => s.content).join('\n')}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {colSections.length === 0 ? (
                        <p className="text-muted-foreground italic">No content in this section.</p>
                      ) : (
                        colSections.map(section => (
                          <ContentRenderer key={section.id} type={section.type} content={section.content} />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Desktop: Horizontal scroll with all columns */}
        <div className="hidden md:flex flex-1 overflow-x-auto overflow-y-hidden gap-[5px]">
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
                const activePanel = activePanels.get(col.id);
                
                const width = columnWidths.get(col.id) || 1200;
                const panelWidth = 400;
                const totalWidth = activePanel ? width + panelWidth : width;

                return (
                    <div key={col.id} className="relative flex shrink-0 gap-4 border-x border-border" style={{ width: `${totalWidth}px` }}>
                      <section className="flex-1 flex flex-col overflow-hidden bg-muted/30">
                          {/* Header section */}
                          <div className="p-3 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">{title}</h2>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant={activePanel === 'quiz' ? "default" : "ghost"} 
                                size="icon" 
                                className="h-8 w-8 shrink-0 cursor-pointer"
                                onClick={() => togglePanel(col.id, 'quiz')}
                                title="Quizzes"
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant={activePanel === 'chat' ? "default" : "ghost"} 
                                size="icon" 
                                className="h-8 w-8 shrink-0 cursor-pointer"
                                onClick={() => togglePanel(col.id, 'chat')}
                                title="AI Assistant"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
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
                      
                      {/* Side Panel (Chat or Quiz) */}
                      {activePanel === 'chat' && (
                        <ChatColumn 
                          columnId={col.id}
                          contextData={colSections}
                          onClose={() => togglePanel(col.id, 'chat')}
                        />
                      )}

                      {activePanel === 'quiz' && (
                        <div className="w-[400px] flex flex-col border-l border-border bg-background h-full">
                          <div className="p-3 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold">Quizzes</h3>
                            <Button variant="ghost" size="icon" onClick={() => togglePanel(col.id, 'quiz')} className="h-8 w-8">
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4">
                            <QuizList 
                              pathId={id as string}
                              columnId={col.id}
                              contentContext={colSections.map(s => s.content).join('\n')}
                            />
                          </div>
                        </div>
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
        </div>
      </main>
    </div>
  );
}
