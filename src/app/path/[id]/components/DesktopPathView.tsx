import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContentRenderer } from "@/components/view/ContentRenderer";
import { ChatColumn } from "@/components/editor/ChatColumn";
import { QuizList } from "@/components/quiz/QuizList";
import { AIToolsPanel } from "@/components/view/AIToolsPanel";
import { SectionCompleteCheckbox } from "@/components/assignments/SectionCompleteCheckbox";
import { Column, ColumnItem, ContentSection } from "../edit/types";

interface DesktopPathViewProps {
  columns: Column[];
  items: Map<string, ColumnItem[]>;
  sections: ContentSection[];
  selectedItems: Map<string, string>;
  activePanels: Map<string, 'chat' | 'quiz' | 'tools' | null>;
  columnWidths: Map<string, number>;
  currentAssignment: any;
  completedSections: Set<string>;
  profile: any;
  pathId: string;
  onSelectItem: (columnId: string, itemId: string) => void;
  togglePanel: (columnId: string, panel: 'chat' | 'quiz' | 'tools') => void;
  handleToggleSection: (columnId: string, isCompleted: boolean) => Promise<void>;
  handleResizeStart: (e: React.MouseEvent, columnId: string, currentWidth: number) => void;
}

export function DesktopPathView({
  columns,
  items,
  sections,
  selectedItems,
  activePanels,
  columnWidths,
  currentAssignment,
  completedSections,
  profile,
  pathId,
  onSelectItem,
  togglePanel,
  handleToggleSection,
  handleResizeStart
}: DesktopPathViewProps) {
  return (
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
                      <div className="p-3 border-b border-border flex items-center justify-between">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <Button 
                          variant={activePanel === 'tools' || activePanel === 'chat' || activePanel === 'quiz' ? "default" : "ghost"} 
                          size="icon" 
                          className="h-8 w-8 shrink-0 cursor-pointer"
                          onClick={() => togglePanel(col.id, 'tools')}
                          title="AI Tools"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Content area */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
                        {colSections.length === 0 ? (
                          <p className="text-muted-foreground italic">No content in this section.</p>
                        ) : (
                          <>
                            {colSections.map(section => (
                              <ContentRenderer key={section.id} type={section.type} content={section.content} />
                            ))}
                            
                            {/* Section completion checkbox for assignments */}
                            {currentAssignment && profile?.role === 'student' && (
                              <SectionCompleteCheckbox
                                columnId={col.id}
                                isCompleted={completedSections.has(col.id)}
                                onToggle={handleToggleSection}
                              />
                            )}
                          </>
                        )}
                      </div>
                  </section>
                  
                  {/* Side Panels */}
                  {activePanel === 'tools' && (
                    <AIToolsPanel 
                      onClose={() => togglePanel(col.id, 'tools')}
                      onSelectTool={(tool) => togglePanel(col.id, tool)}
                    />
                  )}

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
                          pathId={pathId}
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
  );
}
