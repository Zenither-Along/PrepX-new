import { ArrowLeft, Sparkles, MessageSquare, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ContentRenderer } from "@/components/view/ContentRenderer";
import { ChatColumn } from "@/components/editor/ChatColumn";
import { QuizList } from "@/components/quiz/QuizList";
import { SectionCompleteCheckbox } from "@/components/assignments/SectionCompleteCheckbox";
import { Column, ColumnItem, ContentSection } from "../edit/types";

interface MobilePathViewProps {
  columns: Column[];
  activeColumnIndex: number;
  items: Map<string, ColumnItem[]>;
  sections: ContentSection[];
  selectedItems: Map<string, string>;
  activePanels: Map<string, 'chat' | 'quiz' | 'tools' | null>;
  currentAssignment: any;
  completedSections: Set<string>;
  profile: any;
  pathId: string;
  onSelectItem: (columnId: string, itemId: string) => void;
  goBackColumn: () => void;
  togglePanel: (columnId: string, panel: 'chat' | 'quiz' | 'tools') => void;
  handleToggleSection: (columnId: string, isCompleted: boolean) => Promise<void>;
}

export function MobilePathView({
  columns,
  activeColumnIndex,
  items,
  sections,
  selectedItems,
  activePanels,
  currentAssignment,
  completedSections,
  profile,
  pathId,
  onSelectItem,
  goBackColumn,
  togglePanel,
  handleToggleSection
}: MobilePathViewProps) {
  const col = columns[activeColumnIndex];
  
  if (!col) return null;

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={activePanel === 'chat' || activePanel === 'quiz' ? "default" : "ghost"} 
                size="icon" 
                className="h-8 w-8 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => togglePanel(col.id, 'chat')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePanel(col.id, 'quiz')}>
                <Brain className="h-4 w-4 mr-2" />
                Quiz Generator
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* For root content column (rare but possible), we might need the action buttons if header is hidden */}
        {activeColumnIndex === 0 && (
           <div className="p-2 border-b border-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={activePanel === 'chat' || activePanel === 'quiz' ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Tools
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => togglePanel(col.id, 'chat')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => togglePanel(col.id, 'quiz')}>
                  <Brain className="h-4 w-4 mr-2" />
                  Quiz Generator
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              pathId={pathId}
              columnId={col.id}
              contentContext={colSections.map(s => s.content).join('\n')}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
        )}
      </div>
    );
  }
  return null;
}
