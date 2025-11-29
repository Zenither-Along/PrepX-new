"use client";
import { AIAssistantColumn } from "@/components/editor/AIAssistantColumn";
import { useSectionHandlers } from "../hooks/useSectionHandlers";

export function AIAssistantPanel({ 
  showAIColumn, 
  setShowAIColumn,
  editorData,
  editorSave,
  onExecutePlan,
  editingSection,
  setEditingSection
}: any) {
  // We don't need useSectionHandlers here if onExecutePlan is passed from parent
  // But wait, the original code had the logic inside the component.
  // In the new design, I moved the logic to useExecutePlan hook.
  // So this component just renders AIAssistantColumn and calls onExecutePlan.
  
  return (
    showAIColumn && (
      <AIAssistantColumn
        width={400}
        onClose={() => {
          setShowAIColumn(false);
          setEditingSection(null); // Clear editing section when closing
        }}
        onExecutePlan={onExecutePlan}
        context={{
          pathTitle: editorData.path?.title ?? "",
          activeColumn:
            editorData.columns.length > 0
              ? (() => {
                  const activeCol = editorData.columns[editorData.columns.length - 1];
                  let displayTitle = activeCol.title;
                  
                  // Resolve title from parent item if applicable
                  if (activeCol.parent_item_id) {
                    for (const [, items] of editorData.items.entries()) {
                      const parentItem = items.find((i: any) => i.id === activeCol.parent_item_id);
                      if (parentItem) {
                        displayTitle = parentItem.title;
                        break;
                      }
                    }
                  }

                  return {
                    id: activeCol.id,
                    title: displayTitle,
                    type: activeCol.type as "branch" | "content",
                    items:
                      activeCol.type === "branch"
                        ? editorData.items.get(activeCol.id)
                        : undefined,
                  };
                })()
              : undefined,
        }}
        isMobile={onExecutePlan.isMobile || (editorData as any).isMobile || (window.innerWidth < 768)}
        editingSection={editingSection}
        onSectionEdit={(newContent: any) => {
          // Update the section in editor data
          editorData.setSections((prev: any[]) => 
            prev.map((s: any) => 
              s.id === editingSection.id ? { ...s, content: newContent } : s
            )
          );
          editorSave.setHasUnsavedChanges(true);
          setEditingSection(null);
        }}
      />
    )
  );
}
