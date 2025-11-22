import type { ContentSection } from '../types';

export function useSectionHandlers(
  selectedItemId: string | undefined,
  selectedSubItemId: string | undefined,
  sections: ContentSection[],
  setSections: (sections: ContentSection[]) => void,
  newSections: Set<string>,
  setNewSections: (sections: Set<string>) => void,
  deletedSections: Set<string>,
  setDeletedSections: (sections: Set<string>) => void,
  setHasUnsavedChanges: (value: boolean) => void
) {
  const handleAddSection = (type: string, columnId: string) => {
    if (!columnId) return;
    
    // Generate temporary ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const content = (type === 'heading' || type === 'subheading' || type === 'paragraph') ? { text: '' } : { url: '' };
    
    const newSection = {
      id: tempId,
      column_id: columnId,
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
    setSections(sections.filter(s => s.id !== id));
    
    // If it was a new section, remove from newSections set
    if (newSections.has(id)) {
      const updatedNewSections = new Set(newSections);
      updatedNewSections.delete(id);
      setNewSections(updatedNewSections);
    } else {
      // Otherwise, mark for deletion
      setDeletedSections(new Set(deletedSections).add(id));
    }
    
    setHasUnsavedChanges(true);
  };

  const handleSectionReorder = (newSections: ContentSection[]) => {
    setSections(newSections);
    setHasUnsavedChanges(true);
  };

  return {
    handleAddSection,
    handleUpdateSection,
    handleDeleteSection,
    handleSectionReorder
  };
}
