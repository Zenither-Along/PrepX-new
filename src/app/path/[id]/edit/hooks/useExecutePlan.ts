import { useSectionHandlers } from "./useSectionHandlers";

export function useExecutePlan(editorData: any, editorSave: any) {
  const { handleAddSection } = useSectionHandlers(editorData, editorSave);

  return (plan: any) => {
    console.log("[Execute Plan] Called with:", plan);
    if (plan && plan.actions && Array.isArray(plan.actions)) {
      plan.actions.forEach((action: any) => {
        if (action.type === "create_item") {
          const activeCol = editorData.columns[editorData.columns.length - 1];
          if (activeCol && activeCol.type === "branch") {
            const newItem = {
              id: `ai-item-${Date.now()}-${Math.random()}`,
              column_id: activeCol.id,
              title: action.title,
              order_index: (editorData.items.get(activeCol.id)?.length || 0),
            };
            editorData.setItems((prev: Map<string, any[]>) => {
              const map = new Map(prev);
              const list = map.get(activeCol.id) || [];
              map.set(activeCol.id, [...list, newItem]);
              return map;
            });
            editorSave.setNewItems((prev: Set<string>) => new Set(prev).add(newItem.id));
          }
        } else if (action.type === "create_section") {
          const activeCol = editorData.columns[editorData.columns.length - 1];
          if (activeCol && activeCol.type === "content") {
            handleAddSection(activeCol.id, action.sectionType, action.content);
          }
        }
      });
      editorSave.setHasUnsavedChanges(true);
    }
  };
}
